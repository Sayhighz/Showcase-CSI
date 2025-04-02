// ===== controllers/admin/adminProjectController.js =====

import pool from '../../config/database.js';
import fs from 'fs';
import { successResponse, handleServerError } from '../../utils/responseFormatter.js';

// ฟังก์ชันดึงข้อมูลโครงการทั้งหมด
export const getAllProjects = async (req, res) => {
  try {
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        statusCode: 403, 
        message: 'Forbidden, only admin can access this resource' 
      });
    }
    
    // ตัวกรอง (filters) จากคำขอ
    const { status, type, year, searchTerm } = req.query;
    
    // สร้าง query พื้นฐาน
    let query = `
      SELECT 
        p.project_id, 
        p.title, 
        p.description, 
        p.type, 
        p.study_year, 
        p.year, 
        p.semester, 
        p.visibility, 
        p.status, 
        p.created_at, 
        p.updated_at, 
        p.views_count, 
        p.tags,
        u.username, 
        u.full_name, 
        (
          SELECT file_path 
          FROM project_files pf 
          WHERE pf.project_id = p.project_id AND pf.file_type = 'image' 
          LIMIT 1
        ) as cover_image,
        (
          SELECT COUNT(*) 
          FROM visitor_views vv 
          WHERE vv.project_id = p.project_id
        ) + (
          SELECT COUNT(*) 
          FROM company_views cv 
          WHERE cv.project_id = p.project_id
        ) as total_views
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
    `;
    
    // สร้าง array เพื่อเก็บ parameters
    const params = [];
    
    // เริ่มสร้างเงื่อนไข WHERE
    const conditions = [];
    
    // เพิ่มเงื่อนไขตาม status
    if (status) {
      conditions.push('p.status = ?');
      params.push(status);
    }
    
    // เพิ่มเงื่อนไขตาม type
    if (type) {
      conditions.push('p.type = ?');
      params.push(type);
    }
    
    // เพิ่มเงื่อนไขตาม year
    if (year) {
      conditions.push('p.year = ?');
      params.push(year);
    }
    
    // เพิ่มเงื่อนไขตาม searchTerm (ค้นหาจากชื่อหรือคำอธิบาย)
    if (searchTerm) {
      conditions.push('(p.title LIKE ? OR p.description LIKE ? OR p.tags LIKE ?)');
      const term = `%${searchTerm}%`;
      params.push(term, term, term);
    }
    
    // เพิ่มเงื่อนไข WHERE ถ้ามี conditions
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // เพิ่มการเรียงลำดับข้อมูล
    query += ' ORDER BY p.created_at DESC';
    
    // ดึงข้อมูลจากฐานข้อมูล
    const [projects] = await pool.execute(query, params);
    
    // ส่งข้อมูลกลับไปยัง client
    return res.json(successResponse(
      projects, 
      'Projects retrieved successfully'
    ));
    
  } catch (error) {
    console.error(error);
    return handleServerError(res, error);
  }
};

// ฟังก์ชันดึงข้อมูลโครงการที่รอการอนุมัติ
export const getPendingProjects = async (req, res) => {
  try {
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        statusCode: 403, 
        message: 'Forbidden, only admin can access this resource' 
      });
    }
    
    // ดึงข้อมูลโครงการที่มีสถานะ 'pending'
    const [projects] = await pool.execute(`
      SELECT 
        p.project_id, 
        p.title, 
        p.description, 
        p.type, 
        p.study_year, 
        p.year, 
        p.semester, 
        p.visibility, 
        p.status, 
        p.created_at, 
        p.updated_at, 
        p.views_count, 
        p.tags,
        u.username, 
        u.full_name, 
        (
          SELECT file_path 
          FROM project_files pf 
          WHERE pf.project_id = p.project_id AND pf.file_type = 'image' 
          LIMIT 1
        ) as cover_image
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.status = 'pending'
      ORDER BY p.created_at DESC
    `);
    
    // ส่งข้อมูลกลับไปยัง client
    return res.json(successResponse(
      projects,
      'Pending projects retrieved successfully'
    ));
    
  } catch (error) {
    console.error(error);
    return handleServerError(res, error);
  }
};

// เพิ่มฟังก์ชันสำหรับการอนุมัติหรือปฏิเสธโครงการ
export const reviewProject = async (req, res) => {
  try {
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        statusCode: 403, 
        message: 'Forbidden, only admin can access this resource' 
      });
    }

    const { projectId } = req.params;
    const { status, comment } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!projectId || !status) {
      return res.status(400).json({ 
        success: false, 
        statusCode: 400, 
        message: 'Project ID and status are required' 
      });
    }

    // เริ่มการทำงานกับฐานข้อมูล
    const connection = await pool.getConnection();

    try {
      // เริ่ม transaction
      await connection.beginTransaction();

      // อัปเดตสถานะโครงการ
      await connection.execute(
        `UPDATE projects SET status = ?, updated_at = NOW() WHERE project_id = ?`,
        [status, projectId]
      );

      // บันทึกประวัติการตรวจสอบ
      await connection.execute(
        `INSERT INTO project_reviews (project_id, admin_id, status, review_comment, reviewed_at) 
         VALUES (?, ?, ?, ?, NOW())`,
        [projectId, req.user.id, status, comment || null]
      );

      // ยืนยัน transaction
      await connection.commit();

      // ส่งการตอบกลับ
      return res.json(successResponse(
        { projectId, status, comment },
        `Project ${status === 'approved' ? 'approved' : 'rejected'} successfully`
      ));

    } catch (transactionError) {
      // ยกเลิก transaction หากมีข้อผิดพลาด
      await connection.rollback();
      throw transactionError;
    } finally {
      // ปิดการเชื่อมต่อ
      connection.release();
    }
    
  } catch (error) {
    console.error(error);
    return handleServerError(res, error);
  }
};

// ฟังก์ชันลบโครงการ
export const deleteProject = async (req, res) => {
  try {
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        statusCode: 403, 
        message: 'Forbidden, only admin can access this resource' 
      });
    }

    const { projectId } = req.params;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!projectId) {
      return res.status(400).json({ 
        success: false, 
        statusCode: 400, 
        message: 'Project ID is required' 
      });
    }

    // เริ่มการทำงานกับฐานข้อมูล
    const connection = await pool.getConnection();

    try {
      // เริ่ม transaction
      await connection.beginTransaction();

      // ลบไฟล์ที่เกี่ยวข้องกับโครงการ
      await connection.execute(
        `DELETE FROM project_files WHERE project_id = ?`,
        [projectId]
      );

      // ลบบันทึกการตรวจสอบโครงการ
      await connection.execute(
        `DELETE FROM project_reviews WHERE project_id = ?`,
        [projectId]
      );

      // ลบโครงการ
      const [result] = await connection.execute(
        `DELETE FROM projects WHERE project_id = ?`,
        [projectId]
      );

      // ยืนยัน transaction
      await connection.commit();

      // ตรวจสอบว่ามีการลบข้อมูลหรือไม่
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          success: false, 
          statusCode: 404, 
          message: 'Project not found' 
        });
      }

      // ส่งการตอบกลับ
      return res.json(successResponse(
        { projectId },
        'Project deleted successfully'
      ));

    } catch (transactionError) {
      // ยกเลิก transaction หากมีข้อผิดพลาด
      await connection.rollback();
      throw transactionError;
    } finally {
      // ปิดการเชื่อมต่อ
      connection.release();
    }
    
  } catch (error) {
    console.error(error);
    return handleServerError(res, error);
  }
};

// ฟังก์ชันดึงรายละเอียดของโครงการที่ระบุ
export const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden, only admin can access this resource' });
    }
    
    // ดึงข้อมูลหลักของโครงการ
    const [projects] = await pool.execute(`
      SELECT p.*, u.username, u.full_name
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.project_id = ?
    `, [projectId]);
    
    if (projects.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const project = projects[0];
    
    // ดึงข้อมูลไฟล์ที่เกี่ยวข้อง
    const [files] = await pool.execute(`
      SELECT * FROM project_files
      WHERE project_id = ?
    `, [projectId]);
    
    // ดึงข้อมูลสมาชิกในกลุ่ม
    const [members] = await pool.execute(`
      SELECT u.user_id, u.username, u.full_name, u.email, u.image
      FROM project_groups pg
      JOIN users u ON pg.user_id = u.user_id
      WHERE pg.project_id = ?
    `, [projectId]);
    
    // ดึงข้อมูลประวัติการตรวจสอบ
    const [reviews] = await pool.execute(`
      SELECT r.*, a.username as admin_username, a.full_name as admin_name
      FROM project_reviews r
      LEFT JOIN users a ON r.admin_id = a.user_id
      WHERE r.project_id = ?
      ORDER BY r.reviewed_at DESC
    `, [projectId]);
    
    // ดึงข้อมูลเพิ่มเติมตามประเภทของโครงการ
    let additionalData = {};
    
    if (project.type === 'academic') {
      const [academicPapers] = await pool.execute(`
        SELECT * FROM academic_papers
        WHERE project_id = ?
      `, [projectId]);
      
      if (academicPapers.length > 0) {
        additionalData.academic = academicPapers[0];
      }
    } else if (project.type === 'competition') {
      const [competitions] = await pool.execute(`
        SELECT * FROM competitions
        WHERE project_id = ?
      `, [projectId]);
      
      if (competitions.length > 0) {
        additionalData.competition = competitions[0];
      }
    } else if (project.type === 'coursework') {
      const [courseworks] = await pool.execute(`
        SELECT * FROM courseworks
        WHERE project_id = ?
      `, [projectId]);
      
      if (courseworks.length > 0) {
        additionalData.coursework = courseworks[0];
      }
    }
    
    // รวมข้อมูลทั้งหมดและส่งกลับ
    const result = {
      ...project,
      files,
      members,
      reviews,
      ...additionalData
    };
    
    return res.json(result);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ฟังก์ชันอนุมัติหรือปฏิเสธโครงการ

// ฟังก์ชันลบโครงการ

// ฟังก์ชันอัปเดตโครงการ
export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      title, description, type, study_year, year, semester, visibility, status, tags
    } = req.body;
    
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden, only admin can update projects' });
    }
    
    // ตรวจสอบว่าโครงการมีอยู่จริงหรือไม่
    const [projects] = await pool.execute(`
      SELECT * FROM projects
      WHERE project_id = ?
    `, [projectId]);
    
    if (projects.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const project = projects[0];
    
    // เริ่ม transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // อัปเดตข้อมูลหลักของโครงการ
      await connection.execute(`
        UPDATE projects
        SET title = ?, description = ?, type = ?, study_year = ?, year = ?,
            semester = ?, visibility = ?, status = ?, tags = ?, updated_at = NOW()
        WHERE project_id = ?
      `, [
        title || project.title,
        description || project.description,
        type || project.type,
        study_year || project.study_year,
        year || project.year,
        semester || project.semester,
        visibility === undefined ? project.visibility : visibility,
        status || project.status,
        tags || project.tags,
        projectId
      ]);
      
      // บันทึกประวัติการแก้ไข
      await connection.execute(`
        INSERT INTO project_reviews (project_id, admin_id, status, review_comment)
        VALUES (?, ?, ?, ?)
      `, [projectId, req.user.id, 'updated', 'Project updated by admin']);
      
      // Commit transaction
      await connection.commit();
      
      return res.json({ 
        message: 'Project updated successfully',
        projectId
      });
    } catch (error) {
      // Rollback หากเกิดข้อผิดพลาด
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ฟังก์ชันดึงข้อมูลประวัติการตรวจสอบโครงการ
export const getProjectReviews = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden, only admin can view project reviews' });
    }
    
    // ดึงข้อมูลประวัติการตรวจสอบ
    const [reviews] = await pool.execute(`
      SELECT r.*, a.username as admin_username, a.full_name as admin_name
      FROM project_reviews r
      LEFT JOIN users a ON r.admin_id = a.user_id
      WHERE r.project_id = ?
      ORDER BY r.reviewed_at DESC
    `, [projectId]);
    
    return res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ฟังก์ชันดึงข้อมูลสถิติการตรวจสอบโครงการของแอดมิน
export const getAdminReviewStats = async (req, res) => {
  try {
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden, only admin can access this resource' });
    }
    
    // ดึงข้อมูลสถิติการตรวจสอบโครงการทั้งหมด
    const [totalStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_reviews,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count
      FROM project_reviews
    `);
    
    // ดึงข้อมูลสถิติการตรวจสอบโครงการของแอดมินแต่ละคน
    const [adminStats] = await pool.execute(`
      SELECT 
        a.user_id, a.username, a.full_name,
        COUNT(r.review_id) as review_count,
        SUM(CASE WHEN r.status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN r.status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
      FROM users a
      LEFT JOIN project_reviews r ON a.user_id = r.admin_id
      WHERE a.role = 'admin'
      GROUP BY a.user_id
      ORDER BY review_count DESC
    `);
    
    // ดึงข้อมูลสถิติการตรวจสอบโครงการตามช่วงเวลา (ข้อมูล 6 เดือนล่าสุด)
    const [timeStats] = await pool.execute(`
      SELECT 
        DATE_FORMAT(reviewed_at, '%Y-%m') as month,
        COUNT(*) as review_count,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
      FROM project_reviews
      WHERE reviewed_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `);
    
    // รวมข้อมูลทั้งหมดและส่งกลับ
    return res.json({
      overall: totalStats[0],
      admin_stats: adminStats,
      time_stats: timeStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ฟังก์ชันดึงข้อมูลสถิติโครงการสำหรับแดชบอร์ด
export const getProjectStats = async (req, res) => {
  try {
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden, only admin can access this resource' });
    }
    
    // ดึงจำนวนโครงการทั้งหมดแยกตามสถานะและประเภท
    const [projectCounts] = await pool.execute(`
      SELECT 
        COUNT(*) as total_projects,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
        SUM(CASE WHEN type = 'academic' THEN 1 ELSE 0 END) as academic_count,
        SUM(CASE WHEN type = 'coursework' THEN 1 ELSE 0 END) as coursework_count,
        SUM(CASE WHEN type = 'competition' THEN 1 ELSE 0 END) as competition_count
      FROM projects
    `);
    
    // ดึงข้อมูลโครงการที่มีการเข้าชมมากที่สุด
    const [topProjects] = await pool.execute(`
      SELECT 
        p.project_id, p.title, p.type, p.views_count,
        u.username, u.full_name,
        (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as cover_image
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.status = 'approved'
      ORDER BY p.views_count DESC
      LIMIT 10
    `);
    
    // ดึงข้อมูลโครงการที่อัปโหลดล่าสุด
    const [recentProjects] = await pool.execute(`
      SELECT 
        p.project_id, p.title, p.type, p.created_at, p.status,
        u.username, u.full_name
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      ORDER BY p.created_at DESC
      LIMIT 10
    `);
    
    // ดึงข้อมูลจำนวนโครงการที่อัปโหลดในแต่ละเดือน (ข้อมูล 12 เดือนล่าสุด)
    const [monthlyUploads] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as project_count,
        SUM(CASE WHEN type = 'academic' THEN 1 ELSE 0 END) as academic_count,
        SUM(CASE WHEN type = 'coursework' THEN 1 ELSE 0 END) as coursework_count,
        SUM(CASE WHEN type = 'competition' THEN 1 ELSE 0 END) as competition_count
      FROM projects
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `);
    
    // ดึงข้อมูลจำนวนการเข้าชมโครงการในแต่ละเดือน (ข้อมูล 12 เดือนล่าสุด)
    const [monthlyViews] = await pool.execute(`
      SELECT 
        DATE_FORMAT(viewed_at, '%Y-%m') as month,
        COUNT(*) as view_count
      FROM (
        SELECT viewed_at FROM visitor_views
        UNION ALL
        SELECT viewed_at FROM company_views
      ) as all_views
      WHERE viewed_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `);
    
    // รวมข้อมูลและส่งกลับ
    return res.json({
      project_counts: projectCounts[0],
      top_projects: topProjects,
      recent_projects: recentProjects,
      monthly_uploads: monthlyUploads,
      monthly_views: monthlyViews
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ฟังก์ชันดึงข้อมูลการตรวจสอบโครงการทั้งหมด
export const getAllProjectReviews = async (req, res) => {
  try {
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden, only admin can access this resource' });
    }
    
    // ดึงข้อมูลการตรวจสอบโครงการทั้งหมด
    const [reviews] = await pool.execute(`
      SELECT 
        r.review_id, r.project_id, r.admin_id, r.status, r.review_comment, r.reviewed_at,
        p.title as project_title, p.type as project_type,
        a.username as admin_username, a.full_name as admin_name
      FROM project_reviews r
      JOIN projects p ON r.project_id = p.project_id
      JOIN users a ON r.admin_id = a.user_id
      ORDER BY r.reviewed_at DESC
      LIMIT 100
    `);
    
    return res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};