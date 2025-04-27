// services/projectService.js
import pool from '../config/database.js';
import logger from '../config/logger.js';
import notificationService from './notificationService.js';
import { PROJECT_STATUSES, PROJECT_TYPES } from '../constants/projectStatuses.js';
import { isValidStatus, isValidType } from '../constants/projectStatuses.js';

/**
 * ดึงข้อมูลโครงการทั้งหมด
 * @param {Object} filters - ตัวกรอง
 * @param {Object} pagination - ข้อมูลการแบ่งหน้า
 * @returns {Promise<Object>} - รายการโครงการและข้อมูลการแบ่งหน้า
 */
export const getAllProjects = async (filters = {}, pagination = {}) => {
    try {
      // กำหนดค่าเริ่มต้นสำหรับการแบ่งหน้า
      const page = parseInt(pagination.page || 1);
      const limit = parseInt(pagination.limit || 10);
      const offset = (page - 1) * limit;
      
      // สร้าง query พื้นฐาน
      let baseQuery = `
        SELECT p.*, u.username, u.full_name, u.image as user_image,
          CASE 
            WHEN p.type = 'coursework' THEN (SELECT c.poster FROM courseworks c WHERE c.project_id = p.project_id)
            WHEN p.type = 'competition' THEN (SELECT c.poster FROM competitions c WHERE c.project_id = p.project_id)
            WHEN p.type = 'academic' THEN NULL
          END as image
        FROM projects p
        JOIN users u ON p.user_id = u.user_id
        WHERE 1=1
      `;
      
      const queryParams = [];
      
      // เพิ่มเงื่อนไขการกรอง
      if (filters.status) {
        if (isValidStatus(filters.status)) {
          baseQuery += ` AND p.status = ?`;
          queryParams.push(filters.status);
        }
      }
      
      if (filters.type) {
        if (isValidType(filters.type)) {
          baseQuery += ` AND p.type = ?`;
          queryParams.push(filters.type);
        }
      }
      
      if (filters.year) {
        baseQuery += ` AND p.year = ?`;
        queryParams.push(filters.year);
      }
      
      if (filters.studyYear) {
        baseQuery += ` AND p.study_year = ?`;
        queryParams.push(filters.studyYear);
      }
      
      if (filters.userId) {
        baseQuery += ` AND (p.user_id = ? OR EXISTS (SELECT 1 FROM project_groups pg WHERE pg.project_id = p.project_id AND pg.user_id = ?))`;
        queryParams.push(filters.userId, filters.userId);
      }
      
      if (filters.search) {
        baseQuery += ` AND (p.title LIKE ? OR p.description LIKE ?)`;
        const searchPattern = `%${filters.search}%`;
        queryParams.push(searchPattern, searchPattern);
      }
      
      // ตรวจสอบการเข้าถึง สำหรับผู้ใช้ที่ไม่ใช่ผู้ดูแลระบบ
      if (filters.onlyVisible && (!filters.role || filters.role !== 'admin')) {
        baseQuery += ` AND (p.visibility = 1 AND p.status = 'approved')`;
      }
      
      // ดึงข้อมูลจำนวนทั้งหมดสำหรับการแบ่งหน้า
      // แยก query สำหรับการนับจำนวนเพื่อหลีกเลี่ยงปัญหา parameters
      const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) as countTable`;
      const [countResult] = await pool.execute(countQuery, queryParams);
      const totalItems = countResult[0].total;
      const totalPages = Math.ceil(totalItems / limit);
      
      // เพิ่ม ORDER BY และ LIMIT เข้าไปใน query หลัก โดยใช้ string interpolation แทนการใช้ parameters
      const mainQuery = `${baseQuery} ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      
      // ดึงข้อมูลโครงการโดยใช้ parameters ชุดเดิม (ไม่ใส่ limit และ offset เป็น parameters)
      const [projects] = await pool.execute(mainQuery, queryParams);
      
      return {
        projects,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages
        }
      };
    } catch (error) {
      logger.error('Error getting all projects:', error);
      throw error;
    }
  };

/**
 * ดึงข้อมูลโครงการตาม ID
 * @param {number} projectId - ID ของโครงการ
 * @param {Object} options - ตัวเลือกเพิ่มเติม
 * @returns {Promise<Object>} - ข้อมูลโครงการ
 */
export const getProjectById = async (projectId, options = {}) => {
    try {
      // ดึงข้อมูลหลักของโครงการ
      const [projects] = await pool.execute(`
        SELECT p.*, u.username, u.full_name, u.email, u.image as user_image
        FROM projects p
        JOIN users u ON p.user_id = u.user_id
        WHERE p.project_id = ?
      `, [projectId]);
      
      if (projects.length === 0) {
        return null;
      }
      
      const project = projects[0];
      
      // ดึงข้อมูลสมาชิกในกลุ่ม
      const [contributors] = await pool.execute(`
        SELECT u.user_id, u.username, u.full_name, u.email, u.image
        FROM project_groups pg
        JOIN users u ON pg.user_id = u.user_id
        WHERE pg.project_id = ?
      `, [projectId]);
      
      // ดึงข้อมูลเพิ่มเติมตามประเภทของโครงการ
      let additionalData = {};
      let files = [];
      
      if (project.type === PROJECT_TYPES.ACADEMIC) {
        const [academic] = await pool.execute(`
          SELECT publication_date, published_year, paper_file, last_updated 
          FROM academic_papers WHERE project_id = ?
        `, [projectId]);
        
        if (academic.length > 0) {
          additionalData.academic = academic[0];
        }
      } else if (project.type === PROJECT_TYPES.COMPETITION) {
        const [competition] = await pool.execute(`
          SELECT competition_name, competition_year, poster
          FROM competitions WHERE project_id = ?
        `, [projectId]);
        
        if (competition.length > 0) {
          additionalData.competition = competition[0];
          
          // เพิ่มไฟล์โปสเตอร์เข้าไปในรายการไฟล์
          if (competition[0].poster) {
            files.push({
              file_type: 'image',
              file_path: competition[0].poster,
              file_name: competition[0].poster.split('/').pop(),
              file_size: 0, // ไม่มีข้อมูลขนาดไฟล์
              upload_date: null
            });
          }
        }
      } else if (project.type === PROJECT_TYPES.COURSEWORK) {
        const [coursework] = await pool.execute(`
          SELECT poster, clip_video, image
          FROM courseworks WHERE project_id = ?
        `, [projectId]);
        
        if (coursework.length > 0) {
          additionalData.coursework = coursework[0];
          
          // เพิ่มไฟล์โปสเตอร์เข้าไปในรายการไฟล์
          if (coursework[0].poster) {
            files.push({
              file_type: 'image',
              file_path: coursework[0].poster,
              file_name: coursework[0].poster.split('/').pop(),
              file_size: 0,
              upload_date: null
            });
          }
          
          // เพิ่มไฟล์วิดีโอเข้าไปในรายการไฟล์
          if (coursework[0].clip_video) {
            files.push({
              file_type: 'video',
              file_path: coursework[0].clip_video,
              file_name: coursework[0].clip_video.split('/').pop(),
              file_size: 0,
              upload_date: null
            });
          }
          
          // เพิ่มไฟล์รูปภาพเข้าไปในรายการไฟล์
          if (coursework[0].image) {
            files.push({
              file_type: 'image',
              file_path: coursework[0].image,
              file_name: coursework[0].image.split('/').pop(),
              file_size: 0,
              upload_date: null
            });
          }
        }
      }
      
      // ดึงข้อมูลประวัติการตรวจสอบ
      if (options.includeReviews) {
        const [reviews] = await pool.execute(`
          SELECT r.*, a.username as admin_username, a.full_name as admin_name, a.image as admin_image
          FROM project_reviews r
          LEFT JOIN users a ON r.admin_id = a.user_id
          WHERE r.project_id = ?
          ORDER BY r.reviewed_at DESC
        `, [projectId]);
        
        additionalData.reviews = reviews;
      }
      
      // บันทึกการเข้าชม
      if (options.recordView && options.viewerId && options.viewerId !== project.user_id) {
        await pool.execute(`
          UPDATE projects
          SET views_count = views_count + 1
          WHERE project_id = ?
        `, [projectId]);
      }
      
      return {
        ...project,
        files,
        contributors,
        ...additionalData
      };
    } catch (error) {
      logger.error(`Error getting project ${projectId}:`, error);
      throw error;
    }
  };

/**
 * สร้างโครงการใหม่
 * @param {Object} projectData - ข้อมูลโครงการ
 * @param {Object} files - ไฟล์ที่อัปโหลด
 * @returns {Promise<Object>} - ข้อมูลโครงการที่สร้าง
 */
export const createProject = async (projectData, files = {}) => {
  // เริ่มต้น transaction
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!projectData.title || !projectData.description || !projectData.type || 
        !projectData.study_year || !projectData.year || !projectData.semester || 
        !projectData.user_id) {
      throw new Error('Missing required project data');
    }
    
    // ตรวจสอบประเภทโครงการ
    if (!isValidType(projectData.type)) {
      throw new Error(`Invalid project type: ${projectData.type}`);
    }
    
    // เพิ่มข้อมูลโครงการหลัก
    const [result] = await connection.execute(`
      INSERT INTO projects (
        user_id, title, description, type, study_year, year, semester, 
        visibility, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      projectData.user_id,
      projectData.title,
      projectData.description,
      projectData.type,
      projectData.study_year,
      projectData.year,
      projectData.semester,
      projectData.visibility || 1,
      PROJECT_STATUSES.PENDING
    ]);
    
    const projectId = result.insertId;
    
    // เพิ่มข้อมูลผู้ร่วมงาน (ถ้ามี)
    if (projectData.contributors && projectData.contributors.length > 0) {
      for (const contributor of projectData.contributors) {
        await connection.execute(`
          INSERT INTO project_groups (project_id, user_id)
          VALUES (?, ?)
        `, [projectId, contributor.user_id]);
      }
    }
    
    // จัดการกับไฟล์ที่อัปโหลด
    let posterPath = null;
    let clipVideoPath = null;
    let imagePath = null;
    
    if (files && Object.keys(files).length > 0) {
      for (const fieldName in files) {
        const fileList = Array.isArray(files[fieldName]) ? files[fieldName] : [files[fieldName]];
        
        for (const file of fileList) {
          // จัดการกับไฟล์เฉพาะประเภท
          if (fieldName === 'coverImage' || fieldName === 'posterImage') {
            posterPath = file.path;
          } else if (fieldName === 'clipVideo' || fieldName === 'video') {
            clipVideoPath = file.path;
          } else if (fieldName === 'image') {
            imagePath = file.path;
          }
        }
      }
    }
    
    // เพิ่มข้อมูลเฉพาะประเภท
    if (projectData.type === PROJECT_TYPES.ACADEMIC) {
      await connection.execute(`
        INSERT INTO academic_papers (
          project_id, publication_date, published_year
        ) VALUES (?, ?, ?)
      `, [
        projectId,
        projectData.publication_date || null,
        projectData.published_year || projectData.year
      ]);
    } else if (projectData.type === PROJECT_TYPES.COMPETITION) {
      await connection.execute(`
        INSERT INTO competitions (
          project_id, competition_name, competition_year, poster
        ) VALUES (?, ?, ?, ?)
      `, [
        projectId,
        projectData.competition_name || '',
        projectData.competition_year || projectData.year,
        posterPath
      ]);
    } else if (projectData.type === PROJECT_TYPES.COURSEWORK) {
      await connection.execute(`
        INSERT INTO courseworks (
          project_id, poster, clip_video, image
        ) VALUES (?, ?, ?, ?)
      `, [
        projectId,
        posterPath,
        clipVideoPath,
        imagePath
      ]);
    }
    
    // Commit transaction
    await connection.commit();
    
    // แจ้งเตือนผู้ดูแลระบบว่ามีโครงการใหม่รอการอนุมัติ
    const [user] = await pool.execute(`
      SELECT full_name FROM users WHERE user_id = ?
    `, [projectData.user_id]);
    
    const studentName = user.length > 0 ? user[0].full_name : '';
    const projectTypeLabel = PROJECT_TYPES[projectData.type.toUpperCase()] || projectData.type;
    
    await notificationService.notifyAdminsNewProject(
      projectId,
      projectData.title,
      studentName,
      projectTypeLabel
    );
    
    // ดึงข้อมูลโครงการที่สร้าง
    const project = await getProjectById(projectId);
    
    return project;
  } catch (error) {
    await connection.rollback();
    logger.error('Error creating project:', error);
    throw error;
  } finally {
    connection.release();
  }
};

export default {
  getAllProjects,
  getProjectById,
  createProject
};