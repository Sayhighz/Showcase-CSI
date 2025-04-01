// ===== controllers/projectController.js =====

import pool from '../../config/database.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Set up multer storage options for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // สร้างโฟลเดอร์ตามประเภทของไฟล์
    let uploadPath = 'uploads/';
    
    switch (file.mimetype.split('/')[0]) {
      case 'image':
        uploadPath += 'images/';
        break;
      case 'video':
        uploadPath += 'videos/';
        break;
      case 'application':
        uploadPath += 'documents/';
        break;
      default:
        uploadPath += 'others/';
    }
    
    // สร้างโฟลเดอร์ถ้ายังไม่มี
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // ใช้ timestamp และชื่อไฟล์เดิมเพื่อป้องกันการซ้ำกัน
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// สร้าง multer middleware
export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // จำกัดขนาดไฟล์ 10MB
  fileFilter: (req, file, cb) => {
    // ตรวจสอบประเภทไฟล์ที่อนุญาต
    const allowedTypes = /jpeg|jpg|png|gif|pdf|mp4|avi|mov|doc|docx|ppt|pptx/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(ext);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('ประเภทไฟล์ไม่ได้รับอนุญาต'));
  }
});

// ฟังก์ชันดึงข้อมูลทั้งหมดจาก projects
export const getAllProjects = async (req, res) => {
  try {
    // ดึงข้อมูลจาก table projects พร้อมกับข้อมูลของผู้ใช้
    const [projects] = await pool.execute(`
      SELECT p.project_id, p.title, p.description, p.type, p.study_year, p.year, p.semester, p.visibility, p.status,
             u.username, u.full_name, u.role, 
             (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as image_path
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.status = 'approved' AND p.visibility = 1
    `);

    // แปลงข้อมูลให้เหมาะสมกับ frontend
    const formattedProjects = projects.map(project => ({
      title: project.title,
      description: project.description,
      category: project.type,
      level: `ปี ${project.study_year}`,
      year: project.year,
      image: project.image_path || 'https://via.placeholder.com/150',
      projectLink: `/projects/${project.project_id}`,
    }));

    return res.json(formattedProjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ฟังก์ชันดึงข้อมูลโครงการยอดนิยม 9 อันดับแรก
export const getTop9Projects = async (req, res) => {
  try {
    // ดึงข้อมูลโครงการยอดนิยมโดยนับจำนวนการเข้าชม
    const [projects] = await pool.execute(`
      SELECT p.project_id, p.title, p.description, p.type, p.study_year, p.year, p.semester, p.visibility, p.status,
             u.username, u.full_name, u.role, 
             (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as image_path,
             (SELECT COUNT(*) FROM visitor_views vv WHERE vv.project_id = p.project_id) + 
             (SELECT COUNT(*) FROM company_views cv WHERE cv.project_id = p.project_id) as view_count
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.status = 'approved' AND p.visibility = 1
      ORDER BY view_count DESC
      LIMIT 9
    `);

    // แปลงข้อมูลให้เหมาะสมกับ frontend
    const formattedProjects = projects.map(project => ({
      title: project.title,
      description: project.description,
      category: project.type,
      level: `ปี ${project.study_year}`,
      year: project.year,
      image: project.image_path || 'https://via.placeholder.com/150',
      projectLink: `/projects/${project.project_id}`,
      viewCount: project.view_count,
    }));

    return res.json(formattedProjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ฟังก์ชันดึงข้อมูลโครงการล่าสุด 9 โครงการ
export const getLatestProjects = async (req, res) => {
  try {
    // ดึงข้อมูลโครงการล่าสุด 9 โครงการ
    const [projects] = await pool.execute(`
      SELECT p.project_id, p.title, p.description, p.type, p.study_year, p.year, p.semester, p.visibility, p.status,
             u.username, u.full_name, u.role,
             (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as image_path
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.status = 'approved' AND p.visibility = 1
      ORDER BY p.created_at DESC
      LIMIT 9
    `);

    // แปลงข้อมูลให้เหมาะสมกับ frontend
    const formattedProjects = projects.map(project => ({
      title: project.title,
      description: project.description,
      category: project.type,
      level: `ปี ${project.study_year}`,
      year: project.year,
      image: project.image_path || 'https://via.placeholder.com/150',
      projectLink: `/projects/${project.project_id}`,
    }));

    return res.json(formattedProjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ฟังก์ชันดึงข้อมูลโครงการของผู้ใช้คนนั้น ๆ
export const getMyProjects = async (req, res) => {
  try {
    const userId = req.params.user_id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized, userId is missing' });
    }

    // ตรวจสอบว่า user_id ที่ส่งมาตรงกับ user_id ใน token หรือไม่
    if (req.user && req.user.id != userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden, you can only view your own projects' });
    }

    // ดึงข้อมูลโครงการของผู้ใช้
    const [projects] = await pool.execute(`
      SELECT p.project_id, p.title, p.description, p.type, p.study_year, p.year, p.semester, p.visibility, p.status,
             u.username, u.full_name, u.role,
             (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as image_path
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE (p.user_id = ? OR EXISTS (SELECT 1 FROM project_groups pg WHERE pg.project_id = p.project_id AND pg.user_id = ?))
    `, [userId, userId]);

    // แปลงข้อมูลให้เหมาะสมกับ frontend
    const formattedProjects = projects.map(project => ({
      title: project.title,
      description: project.description,
      category: project.type,
      level: `ปี ${project.study_year}`,
      year: project.year,
      image: project.image_path || 'https://via.placeholder.com/150',
      projectLink: `/projects/${project.project_id}`,
      status: project.status,
    }));

    return res.json(formattedProjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ฟังก์ชันดึงข้อมูลรายละเอียดโครงการ
export const getProjectDetails = async (req, res) => {
  const projectId = req.params.projectId;

  if (!projectId) {
    return res.status(400).json({ message: 'Project ID is required' });
  }

  try {
    // ดึงข้อมูลโครงการหลัก
    const [projectDetails] = await pool.execute(`
      SELECT p.project_id, p.title, p.description, p.type, p.study_year, p.year, p.semester, p.visibility, p.status,
             p.created_at AS project_created_at, p.tags
      FROM projects p
      WHERE p.project_id = ? AND (p.status = 'approved' OR 
              EXISTS (SELECT 1 FROM project_groups pg WHERE pg.project_id = p.project_id AND pg.user_id = ?))
    `, [projectId, req.user ? req.user.id : 0]);

    if (projectDetails.length === 0) {
      return res.status(404).json({ message: 'Project not found or you do not have permission to view it' });
    }

    // ดึงข้อมูลเจ้าของและผู้ร่วมสร้างโครงการ
    const [authors] = await pool.execute(`
      SELECT u.user_id, u.full_name, u.role, u.image
      FROM project_groups pg
      JOIN users u ON pg.user_id = u.user_id
      WHERE pg.project_id = ?
    `, [projectId]);

    // ดึงข้อมูลไฟล์ที่เกี่ยวข้องกับโครงการ
    const [files] = await pool.execute(`
      SELECT file_id, file_type, file_path, file_name
      FROM project_files
      WHERE project_id = ?
    `, [projectId]);

    // ดึงข้อมูลเพิ่มเติมตามประเภทของโครงการ
    let specificDetails = {};
    
    if (projectDetails[0].type === 'academic') {
      const [academicDetails] = await pool.execute(`
        SELECT publication_date, published_year, abstract, authors, publication_venue
        FROM academic_papers
        WHERE project_id = ?
      `, [projectId]);
      
      if (academicDetails.length > 0) {
        specificDetails.academicPaper = academicDetails[0];
      }
    } 
    else if (projectDetails[0].type === 'competition') {
      const [competitionDetails] = await pool.execute(`
        SELECT competition_name, competition_year, competition_level, achievement, team_members
        FROM competitions
        WHERE project_id = ?
      `, [projectId]);
      
      if (competitionDetails.length > 0) {
        specificDetails.competition = competitionDetails[0];
      }
    } 
    else if (projectDetails[0].type === 'coursework') {
      const [courseworkDetails] = await pool.execute(`
        SELECT course_code, course_name, instructor
        FROM courseworks
        WHERE project_id = ?
      `, [projectId]);
      
      if (courseworkDetails.length > 0) {
        specificDetails.coursework = courseworkDetails[0];
      }
    }

    // รวมข้อมูลทั้งหมดและส่งกลับ
    const formattedProject = {
      projectId: projectDetails[0].project_id,
      title: projectDetails[0].title,
      description: projectDetails[0].description,
      category: projectDetails[0].type,
      level: `ปี ${projectDetails[0].study_year}`,
      year: projectDetails[0].year,
      semester: projectDetails[0].semester,
      visibility: projectDetails[0].visibility,
      status: projectDetails[0].status,
      tags: projectDetails[0].tags,
      projectCreatedAt: projectDetails[0].project_created_at,
      authors: authors.map(author => ({
        userId: author.user_id,
        fullName: author.full_name,
        role: author.role,
        image: author.image || 'https://via.placeholder.com/150',
      })),
      files: files.map(file => ({
        fileId: file.file_id,
        fileType: file.file_type,
        filePath: file.file_path,
        fileName: file.file_name
      })),
      ...specificDetails
    };

    // บันทึกการเข้าชมจาก visitor ถ้าไม่ใช่เจ้าของโครงการ
    if (req.user && !authors.some(author => author.user_id === req.user.id)) {
      await pool.execute(`
        INSERT INTO visitor_views (project_id, ip_address, user_agent)
        VALUES (?, ?, ?)
      `, [projectId, req.ip, req.headers['user-agent']]);
    }

    return res.json(formattedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ฟังก์ชันอัปโหลดโครงการใหม่
export const uploadProject = async (req, res) => {
  try {
    const { 
      title, description, type, study_year, year, semester, visibility, status, contributors,
      publication_date, published_year, abstract, authors, publication_venue,
      competition_name, competition_year, competition_level, achievement, team_members,
      course_code, course_name, instructor
    } = req.body;

    const userId = req.params.user_id;

    // ตรวจสอบว่า user_id ที่ส่งมาตรงกับ user_id ใน token หรือไม่
    if (req.user.id != userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden, you can only upload projects for yourself' });
    }

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!title || !description || !type || !study_year || !year || !semester) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // เริ่ม transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // เพิ่มข้อมูลโครงการหลัก
      const [result] = await connection.execute(`
        INSERT INTO projects (user_id, title, type, description, study_year, year, semester, visibility, status, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [userId, title, type, description, study_year, year, semester, visibility || 1, status || 'pending', req.body.tags || null]);

      const projectId = result.insertId;

      // เพิ่มเจ้าของโครงการลงในตาราง project_groups
      await connection.execute(`
        INSERT INTO project_groups (project_id, user_id)
        VALUES (?, ?)
      `, [projectId, userId]);

      // เพิ่มผู้ร่วมสร้างคนอื่น ๆ ถ้ามี
      if (contributors && Array.isArray(contributors)) {
        for (const contributor of contributors) {
          if (contributor.user_id) {
            await connection.execute(`
              INSERT INTO project_groups (project_id, user_id)
              VALUES (?, ?)
            `, [projectId, contributor.user_id]);
          }
        }
      }

      // เพิ่มข้อมูลเฉพาะตามประเภทของโครงการ
      if (type === 'academic') {
        await connection.execute(`
          INSERT INTO academic_papers (project_id, publication_date, published_year, abstract, authors, publication_venue)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          projectId, 
          publication_date ? formatDate(publication_date) : null, 
          published_year || null,
          abstract || null,
          authors || null,
          publication_venue || null
        ]);
      } 
      else if (type === 'competition') {
        await connection.execute(`
          INSERT INTO competitions (project_id, competition_name, competition_year, competition_level, achievement, team_members)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          projectId,
          competition_name || null,
          competition_year || null,
          competition_level || null,
          achievement || null,
          team_members || null
        ]);
      } 
      else if (type === 'coursework') {
        await connection.execute(`
          INSERT INTO courseworks (project_id, course_code, course_name, instructor)
          VALUES (?, ?, ?, ?)
        `, [
          projectId,
          course_code || null,
          course_name || null,
          instructor || null
        ]);
      }

      // Commit transaction
      await connection.commit();

      return res.status(201).json({ 
        message: 'Project uploaded successfully', 
        projectId 
      });
    } 
    catch (error) {
      // Rollback เมื่อเกิดข้อผิดพลาด
      await connection.rollback();
      throw error;
    } 
    finally {
      connection.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ฟังก์ชันค้นหาโครงการ
export const searchProjects = async (req, res) => {
  try {
    const { keyword, type, year, study_year } = req.query;
    
    // สร้าง query พื้นฐาน
    let query = `
      SELECT p.project_id, p.title, p.description, p.type, p.study_year, p.year, p.semester, p.visibility, p.status,
             u.username, u.full_name, u.role,
             (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as image_path
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.status = 'approved' AND p.visibility = 1
    `;
    
    // สร้าง array เพื่อเก็บ parameters
    const params = [];
    
    // เพิ่มเงื่อนไขการค้นหาตาม keyword (ถ้ามี)
    if (keyword) {
      query += ` AND (p.title LIKE ? OR p.description LIKE ? OR p.tags LIKE ?)`;
      const keywordParam = `%${keyword}%`;
      params.push(keywordParam, keywordParam, keywordParam);
    }
    
    // เพิ่มเงื่อนไขการค้นหาตามประเภท (ถ้ามี)
    if (type) {
      query += ` AND p.type = ?`;
      params.push(type);
    }
    
    // เพิ่มเงื่อนไขการค้นหาตามปี (ถ้ามี)
    if (year) {
      query += ` AND p.year = ?`;
      params.push(year);
    }
    
    // เพิ่มเงื่อนไขการค้นหาตามชั้นปี (ถ้ามี)
    if (study_year) {
      query += ` AND p.study_year = ?`;
      params.push(study_year);
    }
    
    // ดึงข้อมูลจากฐานข้อมูล
    const [projects] = await pool.execute(query, params);
    
    // แปลงข้อมูลให้เหมาะสมกับ frontend
    const formattedProjects = projects.map(project => ({
      title: project.title,
      description: project.description,
      category: project.type,
      level: `ปี ${project.study_year}`,
      year: project.year,
      image: project.image_path || 'https://via.placeholder.com/150',
      projectLink: `/projects/${project.project_id}`,
    }));
    
    return res.json(formattedProjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ฟังก์ชันอัปเดตโครงการ
export const updateProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { title, description, type, study_year, year, semester, visibility, tags } = req.body;
    
    // ตรวจสอบว่าผู้ใช้มีสิทธิ์แก้ไขโครงการหรือไม่
    const [projectOwners] = await pool.execute(`
      SELECT user_id FROM project_groups WHERE project_id = ?
    `, [projectId]);
    
    const isOwner = projectOwners.some(owner => owner.user_id == req.user.id);
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden, you do not have permission to update this project' });
    }
    
    // ตรวจสอบว่าโครงการมีอยู่จริงหรือไม่
    const [existingProject] = await pool.execute(`
      SELECT * FROM projects WHERE project_id = ?
    `, [projectId]);
    
    if (existingProject.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // อัปเดตข้อมูลโครงการ
    await pool.execute(`
      UPDATE projects
      SET title = ?, description = ?, study_year = ?, year = ?, semester = ?, visibility = ?, tags = ?
      WHERE project_id = ?
    `, [
      title || existingProject[0].title,
      description || existingProject[0].description,
      study_year || existingProject[0].study_year,
      year || existingProject[0].year,
      semester || existingProject[0].semester,
      visibility !== undefined ? visibility : existingProject[0].visibility,
      tags || existingProject[0].tags,
      projectId
    ]);
    
    // อัปเดตข้อมูลเฉพาะตามประเภทของโครงการ
    const projectType = type || existingProject[0].type;
    
    if (projectType === 'academic') {
      const { publication_date, published_year, abstract, authors, publication_venue } = req.body;
      
      const [existingAcademic] = await pool.execute(`
        SELECT * FROM academic_papers WHERE project_id = ?
      `, [projectId]);
      
      if (existingAcademic.length > 0) {
        // อัปเดตข้อมูลที่มีอยู่แล้ว
        await pool.execute(`
          UPDATE academic_papers
          SET publication_date = ?, published_year = ?, abstract = ?, authors = ?, publication_venue = ?
          WHERE project_id = ?
        `, [
          publication_date ? formatDate(publication_date) : existingAcademic[0].publication_date,
          published_year || existingAcademic[0].published_year,
          abstract !== undefined ? abstract : existingAcademic[0].abstract,
          authors || existingAcademic[0].authors,
          publication_venue || existingAcademic[0].publication_venue,
          projectId
        ]);
      } else {
        // สร้างข้อมูลใหม่ถ้ายังไม่มี
        await pool.execute(`
          INSERT INTO academic_papers (project_id, publication_date, published_year, abstract, authors, publication_venue)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          projectId,
          publication_date ? formatDate(publication_date) : null,
          published_year || null,
          abstract || null,
          authors || null,
          publication_venue || null
        ]);
      }
    } 
    else if (projectType === 'competition') {
      const { competition_name, competition_year, competition_level, achievement, team_members } = req.body;
      
      const [existingCompetition] = await pool.execute(`
        SELECT * FROM competitions WHERE project_id = ?
      `, [projectId]);
      
      if (existingCompetition.length > 0) {
        // อัปเดตข้อมูลที่มีอยู่แล้ว
        await pool.execute(`
          UPDATE competitions
          SET competition_name = ?, competition_year = ?, competition_level = ?, achievement = ?, team_members = ?
          WHERE project_id = ?
        `, [
          competition_name || existingCompetition[0].competition_name,
          competition_year || existingCompetition[0].competition_year,
          competition_level || existingCompetition[0].competition_level,
          achievement || existingCompetition[0].achievement,
          team_members || existingCompetition[0].team_members,
          projectId
        ]);
      } else {
        // สร้างข้อมูลใหม่ถ้ายังไม่มี
        await pool.execute(`
          INSERT INTO competitions (project_id, competition_name, competition_year, competition_level, achievement, team_members)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          projectId,
          competition_name || null,
          competition_year || null,
          competition_level || null,
          achievement || null,
          team_members || null
        ]);
      }
    } 
    else if (projectType === 'coursework') {
      const { course_code, course_name, instructor } = req.body;
      
      const [existingCoursework] = await pool.execute(`
        SELECT * FROM courseworks WHERE project_id = ?
      `, [projectId]);
      
      if (existingCoursework.length > 0) {
        // อัปเดตข้อมูลที่มีอยู่แล้ว
        await pool.execute(`
          UPDATE courseworks
          SET course_code = ?, course_name = ?, instructor = ?
          WHERE project_id = ?
        `, [
          course_code || existingCoursework[0].course_code,
          course_name || existingCoursework[0].course_name,
          instructor || existingCoursework[0].instructor,
          projectId
        ]);
      } else {
        // สร้างข้อมูลใหม่ถ้ายังไม่มี
        await pool.execute(`
          INSERT INTO courseworks (project_id, course_code, course_name, instructor)
          VALUES (?, ?, ?, ?)
        `, [
          projectId,
          course_code || null,
          course_name || null,
          instructor || null
        ]);
      }
    }
    
    return res.json({ 
      message: 'Project updated successfully',
      projectId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ฟังก์ชันลบโครงการ
export const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    
    // ตรวจสอบว่าผู้ใช้มีสิทธิ์ลบโครงการหรือไม่
    const [projectOwners] = await pool.execute(`
      SELECT user_id FROM project_groups WHERE project_id = ?
    `, [projectId]);
    
    const isOwner = projectOwners.some(owner => owner.user_id == req.user.id);
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden, you do not have permission to delete this project' });
    }
    
    // ตรวจสอบว่าโครงการมีอยู่จริงหรือไม่
    const [existingProject] = await pool.execute(`
      SELECT * FROM projects WHERE project_id = ?
    `, [projectId]);
    
    if (existingProject.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // ลบไฟล์ที่เกี่ยวข้องกับโครงการ
    const [files] = await pool.execute(`
      SELECT file_path FROM project_files WHERE project_id = ?
    `, [projectId]);
    
    for (const file of files) {
      if (fs.existsSync(file.file_path)) {
        fs.unlinkSync(file.file_path);
      }
    }
    
    // ลบข้อมูลโครงการ (ตาราง project_files, project_groups และตารางตามประเภทจะถูกลบโดยอัตโนมัติจาก foreign key constraints)
    await pool.execute(`
      DELETE FROM projects WHERE project_id = ?
    `, [projectId]);
    
    return res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ฟังก์ชันอนุมัติหรือปฏิเสธโครงการ (สำหรับ Admin)
export const reviewProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { status, review_comment } = req.body;
    
    // ตรวจสอบว่าผู้ใช้เป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden, only admin can review projects' });
    }
    
    // ตรวจสอบว่าโครงการมีอยู่จริงหรือไม่
    const [existingProject] = await pool.execute(`
      SELECT * FROM projects WHERE project_id = ?
    `, [projectId]);
    
    if (existingProject.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // อัปเดตสถานะโครงการ
    await pool.execute(`
      UPDATE projects
      SET status = ?, admin_id = ?
      WHERE project_id = ?
    `, [status, req.user.id, projectId]);
    
    // บันทึกประวัติการตรวจสอบ
    await pool.execute(`
      INSERT INTO project_reviews (project_id, admin_id, status, review_comment)
      VALUES (?, ?, ?, ?)
    `, [projectId, req.user.id, status, review_comment || null]);
    
    return res.json({ 
      message: `Project has been ${status}`,
      projectId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ฟังก์ชันดึงข้อมูลโครงการที่รอการอนุมัติ (สำหรับ Admin)
export const getPendingProjects = async (req, res) => {
  try {
    // ตรวจสอบว่าผู้ใช้เป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden, only admin can view pending projects' });
    }
    
    // ดึงข้อมูลโครงการที่รอการอนุมัติ
    const [projects] = await pool.execute(`
      SELECT p.project_id, p.title, p.description, p.type, p.study_year, p.year, p.semester, p.visibility, p.status,
             u.username, u.full_name, u.role, p.created_at,
             (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as image_path
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.status = 'pending'
      ORDER BY p.created_at DESC
    `);
    
    // แปลงข้อมูลให้เหมาะสมกับ frontend
    const formattedProjects = projects.map(project => ({
      title: project.title,
      description: project.description,
      category: project.type,
      level: `ปี ${project.study_year}`,
      year: project.year,
      image: project.image_path || 'https://via.placeholder.com/150',
      projectLink: `/projects/${project.project_id}`,
      author: {
        username: project.username,
        fullName: project.full_name
      },
      createdAt: project.created_at
    }));
    
    return res.json(formattedProjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ฟังก์ชันบันทึกการเข้าชมโครงการจากบริษัท
export const recordCompanyView = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { company_name, contact_email } = req.body;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!company_name || !contact_email) {
      return res.status(400).json({ message: 'Missing company name or contact email' });
    }
    
    // ตรวจสอบว่าโครงการมีอยู่จริงหรือไม่
    const [existingProject] = await pool.execute(`
      SELECT * FROM projects WHERE project_id = ? AND status = 'approved'
    `, [projectId]);
    
    if (existingProject.length === 0) {
      return res.status(404).json({ message: 'Project not found or not approved' });
    }
    
    // บันทึกการเข้าชม
    await pool.execute(`
      INSERT INTO company_views (company_name, contact_email, project_id)
      VALUES (?, ?, ?)
    `, [company_name, contact_email, projectId]);
    
    // อัปเดตจำนวนการเข้าชม
    await pool.execute(`
      UPDATE projects
      SET views_count = views_count + 1
      WHERE project_id = ?
    `, [projectId]);
    
    return res.json({ message: 'View recorded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ฟังก์ชันบันทึกการเข้าชมโครงการจากผู้เยี่ยมชม
export const recordVisitorView = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    
    // ตรวจสอบว่าโครงการมีอยู่จริงหรือไม่
    const [existingProject] = await pool.execute(`
      SELECT * FROM projects WHERE project_id = ? AND status = 'approved'
    `, [projectId]);
    
    if (existingProject.length === 0) {
      return res.status(404).json({ message: 'Project not found or not approved' });
    }
    
    // บันทึกการเข้าชม
    await pool.execute(`
      INSERT INTO visitor_views (project_id, ip_address, user_agent)
      VALUES (?, ?, ?)
    `, [projectId, req.ip, req.headers['user-agent']]);
    
    // อัปเดตจำนวนการเข้าชม
    await pool.execute(`
      UPDATE projects
      SET views_count = views_count + 1
      WHERE project_id = ?
    `, [projectId]);
    
    return res.json({ message: 'View recorded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ฟังก์ชันอัปโหลดไฟล์สำหรับโครงการ
export const uploadProjectFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const projectId = req.params.projectId;
    const { file_type } = req.body;
    
    // ตรวจสอบว่าผู้ใช้มีสิทธิ์อัปโหลดไฟล์ให้โครงการหรือไม่
    const [projectOwners] = await pool.execute(`
      SELECT user_id FROM project_groups WHERE project_id = ?
    `, [projectId]);
    
    const isOwner = projectOwners.some(owner => owner.user_id == req.user.id);
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      // ลบไฟล์ที่อัปโหลดแล้วถ้าไม่มีสิทธิ์
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ message: 'Forbidden, you do not have permission to upload files to this project' });
    }
    
    // ตรวจสอบว่าโครงการมีอยู่จริงหรือไม่
    const [existingProject] = await pool.execute(`
      SELECT * FROM projects WHERE project_id = ?
    `, [projectId]);
    
    if (existingProject.length === 0) {
      // ลบไฟล์ที่อัปโหลดแล้วถ้าโครงการไม่มีอยู่จริง
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // กำหนดประเภทไฟล์ตาม MIME type ถ้าไม่ได้ระบุมา
    const fileType = file_type || (() => {
      const mimeType = req.file.mimetype.split('/')[0];
      if (mimeType === 'image') return 'image';
      if (mimeType === 'video') return 'video';
      if (req.file.mimetype === 'application/pdf') return 'pdf';
      return 'other';
    })();
    
    // บันทึกข้อมูลไฟล์ลงในฐานข้อมูล
    const [fileResult] = await pool.execute(`
      INSERT INTO project_files (project_id, file_type, file_path, file_name, file_size)
      VALUES (?, ?, ?, ?, ?)
    `, [
      projectId,
      fileType,
      req.file.path,
      req.file.originalname,
      Math.ceil(req.file.size / 1024) // แปลงเป็น KB
    ]);
    
    const fileId = fileResult.insertId;
    
    // อัปเดตข้อมูลเพิ่มเติมตามประเภทของโครงการและไฟล์
    const projectType = existingProject[0].type;
    
    if (projectType === 'academic') {
      if (fileType === 'pdf') {
        // อัปเดต paper_file_id สำหรับบทความวิชาการ
        await pool.execute(`
          UPDATE academic_papers
          SET paper_file_id = ?
          WHERE project_id = ?
        `, [fileId, projectId]);
      } else if (fileType === 'image') {
        // อัปเดต cover_image_id สำหรับบทความวิชาการ
        await pool.execute(`
          UPDATE academic_papers
          SET cover_image_id = ?
          WHERE project_id = ?
        `, [fileId, projectId]);
      }
    } 
    else if (projectType === 'competition') {
      if (fileType === 'image') {
        // อัปเดต poster_file_id สำหรับการแข่งขัน
        await pool.execute(`
          UPDATE competitions
          SET poster_file_id = ?
          WHERE project_id = ?
        `, [fileId, projectId]);
      }
    } 
    else if (projectType === 'coursework') {
      if (fileType === 'image') {
        // อัปเดต poster_file_id สำหรับงานเรียน
        await pool.execute(`
          UPDATE courseworks
          SET poster_file_id = ?
          WHERE project_id = ?
        `, [fileId, projectId]);
      } else if (fileType === 'video') {
        // อัปเดต video_file_id สำหรับงานเรียน
        await pool.execute(`
          UPDATE courseworks
          SET video_file_id = ?
          WHERE project_id = ?
        `, [fileId, projectId]);
      }
    }
    
    // เพิ่มรูปภาพลงในตาราง project_images ถ้าเป็นรูปภาพ
    if (fileType === 'image') {
      await pool.execute(`
        INSERT INTO project_images (project_id, file_id)
        VALUES (?, ?)
      `, [projectId, fileId]);
      
      // อัปเดต cover_image_id ของโครงการถ้ายังไม่มี
      const [projectCover] = await pool.execute(`
        SELECT cover_image_id FROM projects WHERE project_id = ?
      `, [projectId]);
      
      if (!projectCover[0].cover_image_id) {
        await pool.execute(`
          UPDATE projects
          SET cover_image_id = ?
          WHERE project_id = ?
        `, [fileId, projectId]);
      }
    }
    
    return res.status(201).json({
      message: 'File uploaded successfully',
      file_id: fileId,
      file_path: req.file.path,
      file_name: req.file.originalname,
      file_type: fileType
    });
  } catch (error) {
    console.error(error);
    // ลบไฟล์ที่อัปโหลดแล้วถ้าเกิดข้อผิดพลาด
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ======== ส่วนเพิ่มเติม ========

// Helper function สำหรับการแปลงรูปแบบวันที่เป็น YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];  // ตัดแยกเอาเฉพาะส่วน YYYY-MM-DD
};

// ฟังก์ชันสำหรับดึงข้อมูลประเภทโครงการทั้งหมด (สำหรับ dropdown)
export const getProjectTypes = async (req, res) => {
  try {
    // ในกรณีนี้ค่าจะถูกกำหนดแน่นอนใน enum ของฐานข้อมูล
    const projectTypes = [
      { value: 'coursework', label: 'ผลงานการเรียนการสอน' },
      { value: 'academic', label: 'บทความวิชาการ' },
      { value: 'competition', label: 'ผลงานการแข่งขัน' }
    ];
    
    return res.json(projectTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลปีการศึกษาทั้งหมดที่มีในระบบ (สำหรับ dropdown)
export const getProjectYears = async (req, res) => {
  try {
    const [years] = await pool.execute(`
      SELECT DISTINCT year FROM projects WHERE status = 'approved' ORDER BY year DESC
    `);
    
    return res.json(years.map(year => ({ value: year.year, label: `ปี ${year.year}` })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลชั้นปีของนักศึกษาทั้งหมด (สำหรับ dropdown)
export const getStudyYears = async (req, res) => {
  try {
    const studyYears = [
      { value: 1, label: 'ปี 1' },
      { value: 2, label: 'ปี 2' },
      { value: 3, label: 'ปี 3' },
      { value: 4, label: 'ปี 4' }
    ];
    
    return res.json(studyYears);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลสถิติโครงการสำหรับ Dashboard
export const getProjectStats = async (req, res) => {
  try {
    // ตรวจสอบว่าผู้ใช้เป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden, only admin can view project statistics' });
    }
    
    // จำนวนโครงการทั้งหมด
    const [totalProjects] = await pool.execute(`
      SELECT COUNT(*) as count FROM projects
    `);
    
    // จำนวนโครงการแยกตามประเภท
    const [projectsByType] = await pool.execute(`
      SELECT type, COUNT(*) as count FROM projects GROUP BY type
    `);
    
    // จำนวนโครงการแยกตามสถานะ
    const [projectsByStatus] = await pool.execute(`
      SELECT status, COUNT(*) as count FROM projects GROUP BY status
    `);
    
    // จำนวนโครงการที่อัปโหลดในแต่ละเดือน (12 เดือนล่าสุด)
    const [projectsByMonth] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month, 
        COUNT(*) as count 
      FROM projects 
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month 
      ORDER BY month
    `);
    
    // จำนวนการเข้าชมทั้งหมด
    const [totalViews] = await pool.execute(`
      SELECT SUM(views_count) as count FROM projects
    `);
    
    return res.json({
      totalProjects: totalProjects[0].count,
      projectsByType,
      projectsByStatus,
      projectsByMonth,
      totalViews: totalViews[0].count || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};