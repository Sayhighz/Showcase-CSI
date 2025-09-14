// services/projectService.js
const pool = require('../config/database.js');
const logger = require('../config/logger.js');
const notificationService = require('./notificationService.js');
const { PROJECT_STATUSES, PROJECT_TYPES } = require('../constants/projectStatuses.js');
const { isValidStatus, isValidType } = require('../constants/projectStatuses.js');

/**
 * ดึงข้อมูลโครงการทั้งหมด
 * @param {Object} filters - ตัวกรอง
 * @param {Object} pagination - ข้อมูลการแบ่งหน้า
 * @returns {Promise<Object>} - รายการโครงการและข้อมูลการแบ่งหน้า
 */
const getAllProjects = async (filters = {}, pagination = {}) => {
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
    // status
    if (filters.status !== undefined && filters.status !== null && String(filters.status).trim() !== '') {
      const s = String(filters.status).trim().toLowerCase();
      // Use case-insensitive match defensively
      baseQuery += ` AND LOWER(p.status) = ?`;
      queryParams.push(s);
    }
    
    // type/category (รองรับทั้งชื่อคีย์ type และ category)
    const passedType = (filters.type !== undefined && filters.type !== null && String(filters.type).trim() !== '')
      ? String(filters.type).trim()
      : ((filters.category !== undefined && filters.category !== null && String(filters.category).trim() !== '')
          ? String(filters.category).trim()
          : '');
    if (passedType) {
      const t = passedType.toLowerCase();
      // Use case-insensitive match defensively
      baseQuery += ` AND LOWER(p.type) = ?`;
      queryParams.push(t);
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
      if (filters.onlyOwned) {
        // Only include projects where the user is the owner
        baseQuery += ` AND p.user_id = ?`;
        queryParams.push(filters.userId);
      } else {
        // Include projects where the user is either owner or contributor
        baseQuery += ` AND (p.user_id = ? OR EXISTS (SELECT 1 FROM project_groups pg WHERE pg.project_id = p.project_id AND pg.user_id = ?))`;
        queryParams.push(filters.userId, filters.userId);
      }
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
    
    // Debug: log applied filters and where clause for diagnostics
    try {
      const debugPayload = { filters, where: baseQuery, params: queryParams };
      if (logger && typeof logger.debug === 'function') {
        logger.debug(`getAllProjects debug: ${JSON.stringify(debugPayload)}`);
      } else if (logger && typeof logger.info === 'function') {
        logger.info(`getAllProjects debug: ${JSON.stringify(debugPayload)}`);
      }
    } catch (_) { /* ignore logging error */ }
    
    // ดึงข้อมูลจำนวนทั้งหมดสำหรับการแบ่งหน้า
    const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) as countTable`;
    const [countResult] = await pool.execute(countQuery, queryParams);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);
    
    // เพิ่ม ORDER BY และ LIMIT เข้าไปใน query หลัก
    const mainQuery = `${baseQuery} ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    
    // ดึงข้อมูลโครงการ
    const [projects] = await pool.execute(mainQuery, queryParams);
    
    // ดึงข้อมูลผู้ร่วมโครงการสำหรับทุกโครงการ
    if (projects.length > 0) {
      const projectIds = projects.map(p => p.project_id);
      const placeholders = projectIds.map(() => '?').join(',');
      
      const collaboratorsQuery = `
        SELECT
          pg.project_id,
          pg.role,
          pg.user_id,
          pg.member_name,
          pg.member_student_id,
          pg.member_email,
          u.username,
          u.full_name,
          u.image,
          CASE
            WHEN pg.user_id IS NOT NULL THEN 'registered'
            ELSE 'external'
          END as member_type
        FROM project_groups pg
        LEFT JOIN users u ON pg.user_id = u.user_id
        WHERE pg.project_id IN (${placeholders})
        ORDER BY pg.project_id,
          CASE
            WHEN pg.role = 'owner' THEN 1
            WHEN pg.role = 'contributor' THEN 2
            WHEN pg.role = 'advisor' THEN 3
            ELSE 4
          END
      `;
      
      const [collaborators] = await pool.execute(collaboratorsQuery, projectIds);
      
      // จัดกลุ่มผู้ร่วมโครงการตาม project_id และแยกประเภทสมาชิก
      const collaboratorsByProject = collaborators.reduce((acc, collab) => {
        if (!acc[collab.project_id]) {
          acc[collab.project_id] = [];
        }
        
        const memberData = {
          role: collab.role,
          memberType: collab.member_type
        };
        
        if (collab.member_type === 'registered') {
          // สมาชิกที่ลงทะเบียนในระบบ
          memberData.userId = collab.user_id;
          memberData.username = collab.username;
          memberData.fullName = collab.full_name;
          memberData.image = collab.image;
        } else {
          // สมาชิกภายนอก
          memberData.memberName = collab.member_name;
          memberData.memberStudentId = collab.member_student_id;
          memberData.memberEmail = collab.member_email;
        }
        
        acc[collab.project_id].push(memberData);
        return acc;
      }, {});
      
      // เพิ่มข้อมูลผู้ร่วมโครงการเข้าไปในแต่ละโครงการ
      projects.forEach(project => {
        project.collaborators = collaboratorsByProject[project.project_id] || [];
      });
    }
    
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
const getProjectById = async (projectId, options = {}) => {
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
      
      // ดึงข้อมูลสมาชิกในกลุ่ม (รวมทั้งสมาชิกที่ลงทะเบียนและสมาชิกภายนอก)
      const [contributors] = await pool.execute(`
        SELECT
          pg.project_id,
          pg.role,
          pg.user_id,
          pg.member_name,
          pg.member_student_id,
          pg.member_email,
          u.username,
          u.full_name,
          u.email,
          u.image,
          CASE
            WHEN pg.user_id IS NOT NULL THEN 'registered'
            ELSE 'external'
          END as member_type
        FROM project_groups pg
        LEFT JOIN users u ON pg.user_id = u.user_id
        WHERE pg.project_id = ?
        ORDER BY
          CASE
            WHEN pg.role = 'owner' THEN 1
            WHEN pg.role = 'contributor' THEN 2
            WHEN pg.role = 'advisor' THEN 3
            ELSE 4
          END
      `, [projectId]);
      
      // แยกข้อมูลผู้อัปโหลดและสมาชิกทีม
      const uploader = contributors.find(c => c.role === 'owner');
      const teamMembers = contributors.filter(c => c.role !== 'owner').map(member => {
        const memberData = {
          role: member.role,
          memberType: member.member_type
        };
        
        if (member.member_type === 'registered') {
          memberData.userId = member.user_id;
          memberData.username = member.username;
          memberData.fullName = member.full_name;
          memberData.email = member.email;
          memberData.image = member.image;
        } else {
          memberData.memberName = member.member_name;
          memberData.memberStudentId = member.member_student_id;
          memberData.memberEmail = member.member_email;
        }
        
        return memberData;
      });
      
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
          SELECT competition_name, competition_year, poster, image
          FROM competitions WHERE project_id = ?
        `, [projectId]);
        
        if (competition.length > 0) {
          additionalData.competition = { ...competition[0] };
  
          // Parse competition images (JSON array or single string)
          let compImages = [];
          try {
            const raw = competition[0].image;
            if (Array.isArray(raw)) {
              compImages = raw;
            } else if (typeof raw === 'string' && raw.trim().length > 0) {
              const parsed = JSON.parse(raw);
              compImages = Array.isArray(parsed) ? parsed : [raw];
            }
          } catch (e) {
            compImages = competition[0].image ? [competition[0].image] : [];
          }
  
          // Legacy images stored in project_files (image)
          let pfImageRows = [];
          try {
            const [rows] = await pool.execute(
              `
              SELECT file_type, file_path, file_name, file_size, upload_date
              FROM project_files
              WHERE project_id = ? AND file_type = 'image'
              ORDER BY file_id ASC
              `,
              [projectId]
            );
            pfImageRows = rows || [];
          } catch (e) {
            pfImageRows = [];
          }
          const pfPaths = (pfImageRows || []).map(r => r.file_path).filter(p => typeof p === 'string' && p);
  
          // Merge images from competitions.image + project_files, exclude poster and duplicates
          const posterPath = competition[0].poster || null;
          const set = new Set();
          const mergedPaths = [];
          [...(compImages || []), ...pfPaths].forEach(p => {
            if (typeof p === 'string' && p && p !== posterPath && !set.has(p)) {
              set.add(p);
              mergedPaths.push(p);
            }
          });
  
          // Primary image for backward compatibility
          const primaryCompImage = mergedPaths.length > 0 ? mergedPaths[0] : null;
  
          // Build detailed list (prefer metadata from project_files when available)
          const pfMap = new Map((pfImageRows || []).filter(r => r && r.file_path).map(r => [r.file_path, r]));
          const imagesDetailed = mergedPaths.map(p => {
            const row = pfMap.get(p);
            return {
              file_type: 'image',
              file_path: p,
              file_name: (row && (row.file_name || (row.file_path || '').split('/').pop())) || p.split('/').pop(),
              file_size: (row && row.file_size) || 0,
              upload_date: (row && row.upload_date) || null
            };
          });
  
          // Assign into response
          additionalData.competition.images = mergedPaths;
          additionalData.competition.imagesDetailed = imagesDetailed;
          additionalData.competition.image = primaryCompImage;
  
          // Add poster and images into files (deduplicated)
          const existingFilesSet = new Set(files.map(f => f.file_path));
          if (competition[0].poster && !existingFilesSet.has(competition[0].poster)) {
            files.push({
              file_type: 'image',
              file_path: competition[0].poster,
              file_name: competition[0].poster.split('/').pop(),
              file_size: 0,
              upload_date: null
            });
            existingFilesSet.add(competition[0].poster);
          }
          mergedPaths.forEach(p => {
            if (!existingFilesSet.has(p)) {
              const row = pfMap.get(p);
              files.push({
                file_type: 'image',
                file_path: p,
                file_name: (row && (row.file_name || (row.file_path || '').split('/').pop())) || p.split('/').pop(),
                file_size: (row && row.file_size) || 0,
                upload_date: (row && row.upload_date) || null
              });
              existingFilesSet.add(p);
            }
          });
        }
      } else if (project.type === PROJECT_TYPES.COURSEWORK) {
        const [coursework] = await pool.execute(`
          SELECT poster, clip_video, image
          FROM courseworks WHERE project_id = ?
        `, [projectId]);
        
        if (coursework.length > 0) {
          additionalData.coursework = { ...coursework[0] };

          // ไม่ใช้ project_files สำหรับรูปภาพเพิ่มเติม
          const pfImages = [];

          // แปลง courseworks.image ให้เป็นอาร์เรย์ (รองรับทั้ง string เดิม และ JSON array ใหม่)
          let cwImages = [];
          try {
            const raw = coursework[0].image;
            if (Array.isArray(raw)) {
              cwImages = raw;
            } else if (typeof raw === 'string' && raw.trim().length > 0) {
              const parsed = JSON.parse(raw);
              cwImages = Array.isArray(parsed) ? parsed : [raw];
            }
          } catch (e) {
            cwImages = coursework[0].image ? [coursework[0].image] : [];
          }

          // รวมรายการรูปภาพทั้งหมดไว้ใน coursework.images (กันซ้ำตาม path)
          const filePathSet = new Set();
          const imagePaths = [];

          cwImages.forEach(p => {
            if (typeof p === 'string' && p && !filePathSet.has(p)) {
              imagePaths.push(p);
              filePathSet.add(p);
            }
          });

          pfImages.forEach(row => {
            if (row.file_path && !filePathSet.has(row.file_path)) {
              imagePaths.push(row.file_path);
              filePathSet.add(row.file_path);
            }
          });

          // รายละเอียดรูปภาพรวม (จากทั้ง courseworks.image และ project_files)
          const imagesDetailedFromCw = cwImages
            .filter(p => typeof p === 'string' && p)
            .map(p => ({
              file_type: 'image',
              file_path: p,
              file_name: p.split('/').pop(),
              file_size: 0,
              upload_date: null
            }));

          // กันซ้ำด้วย path
          const detailedPathSet = new Set(imagesDetailedFromCw.map(i => i.file_path));
          const combinedDetailed = [...imagesDetailedFromCw];
          pfImages.forEach(row => {
            if (row.file_path && !detailedPathSet.has(row.file_path)) {
              combinedDetailed.push({
                file_type: 'image',
                file_path: row.file_path,
                file_name: row.file_name || row.file_path.split('/').pop(),
                file_size: row.file_size || 0,
                upload_date: row.upload_date || null
              });
              detailedPathSet.add(row.file_path);
            }
          });

          // ส่งออกเป็นอาเรย์ทั้งหมด (สำหรับแกลเลอรี)
          additionalData.coursework.images = imagePaths;
          // รายละเอียดไฟล์ (รวม courseworks.image + project_files) พร้อมกันซ้ำแล้ว
          additionalData.coursework.imagesDetailed = combinedDetailed;

          // รักษาความเข้ากันได้ย้อนหลัง: ส่งฟิลด์ image เป็นสตริงรูปหลักตัวเดียว
          const rawImage = coursework[0].image;
          let primaryImage = null;
          try {
            if (Array.isArray(rawImage)) {
              primaryImage = rawImage[0] || null;
            } else if (typeof rawImage === 'string' && rawImage.trim().length > 0) {
              // อาจเป็น JSON string ของอาเรย์ หรือเป็น path เดี่ยว
              const parsed = JSON.parse(rawImage);
              primaryImage = Array.isArray(parsed) ? (parsed[0] || null) : rawImage;
            }
          } catch (e) {
            if (typeof rawImage === 'string' && rawImage.trim().length > 0) {
              primaryImage = rawImage;
            }
          }
          additionalData.coursework.image = primaryImage;

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
          
          // เพิ่มไฟล์รูปภาพจาก courseworks.image (รองรับ JSON array/เดิม)
          {
            let cwPaths = [];
            try {
              const raw = coursework[0].image;
              if (Array.isArray(raw)) {
                cwPaths = raw;
              } else if (typeof raw === 'string' && raw.trim().length > 0) {
                const parsed = JSON.parse(raw);
                cwPaths = Array.isArray(parsed) ? parsed : [raw];
              }
            } catch (e) {
              if (coursework[0].image) cwPaths = [coursework[0].image];
            }
            const added = new Set();
            cwPaths.forEach(p => {
              if (typeof p === 'string' && p && !added.has(p)) {
                files.push({
                  file_type: 'image',
                  file_path: p,
                  file_name: p.split('/').pop(),
                  file_size: 0,
                  upload_date: null
                });
                added.add(p);
              }
            });
          }

          // เพิ่มไฟล์รูปภาพจาก project_files เข้าไปในรายการไฟล์ (กันซ้ำด้วย path)
          const filesSet = new Set(files.map(f => f.file_path));
          pfImages.forEach(row => {
            if (row.file_path && !filesSet.has(row.file_path)) {
              files.push({
                file_type: 'image',
                file_path: row.file_path,
                file_name: row.file_name || row.file_path.split('/').pop(),
                file_size: row.file_size || 0,
                upload_date: row.upload_date || null
              });
              filesSet.add(row.file_path);
            }
          });
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
      
      // บันทึกการเข้าชม - นับทุกครั้งที่มีการเข้าชม ไม่ว่าจะ login หรือไม่
      if (options.recordView) {
        await pool.execute(`
          UPDATE projects
          SET views_count = views_count + 1
          WHERE project_id = ?
        `, [projectId]);
        
        // อัปเดตข้อมูลในหน่วยความจำให้สอดคล้องกัน
        project.views_count = (project.views_count || 0) + 1;
      }
      
      return {
        ...project,
        files,
        contributors: teamMembers, // สมาชิกทีม (ไม่รวมผู้อัปโหลด)
        uploader: uploader ? {
          userId: uploader.user_id,
          username: uploader.username,
          fullName: uploader.full_name,
          email: uploader.email,
          image: uploader.image
        } : null,
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
const createProject = async (projectData, files = {}) => {
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
    
    // บันทึกการสร้างโครงการในประวัติ
    await notificationService.logProjectChange(
      projectId,
      'create',
      'entire_project',
      null,
      {
        title: projectData.title,
        description: projectData.description,
        type: projectData.type,
        study_year: projectData.study_year,
        year: projectData.year,
        semester: projectData.semester
      },
      projectData.user_id,
      'Project created'
    );
    
    // เพิ่มข้อมูลผู้ร่วมงาน (ถ้ามี)
    if (projectData.contributors && projectData.contributors.length > 0) {
      for (const contributor of projectData.contributors) {
        await connection.execute(`
          INSERT INTO project_groups (project_id, user_id)
          VALUES (?, ?)
        `, [projectId, contributor.user_id]);
      }
      
      // บันทึกการเพิ่ม contributors
      await notificationService.logProjectChange(
        projectId,
        'add',
        'contributors',
        null,
        projectData.contributors,
        projectData.user_id,
        'Contributors added during project creation'
      );
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
      
      // บันทึกการอัปโหลดไฟล์โปสเตอร์
      if (posterPath) {
        await notificationService.logProjectChange(
          projectId,
          'file_upload',
          'competition_poster',
          null,
          posterPath,
          projectData.user_id,
          'Competition poster uploaded'
        );
      }
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
      
      // บันทึกการอัปโหลดไฟล์ต่างๆ
      if (posterPath) {
        await notificationService.logProjectChange(
          projectId,
          'file_upload',
          'coursework_poster',
          null,
          posterPath,
          projectData.user_id,
          'Coursework poster uploaded'
        );
      }
      
      if (clipVideoPath) {
        await notificationService.logProjectChange(
          projectId,
          'file_upload',
          'coursework_video',
          null,
          clipVideoPath,
          projectData.user_id,
          'Coursework video uploaded'
        );
      }
      
      if (imagePath) {
        await notificationService.logProjectChange(
          projectId,
          'file_upload',
          'coursework_image',
          null,
          imagePath,
          projectData.user_id,
          'Coursework image uploaded'
        );
      }
    }
    
    // Commit transaction
    await connection.commit();
    
    // แจ้งเตือนผู้ดูแลระบบว่ามีโครงการใหม่รอการอนุมัติ
    const [user] = await pool.execute(`
      SELECT full_name FROM users WHERE user_id = ?
    `, [projectData.user_id]);
    
    const studentName = user.length > 0 ? user[0].full_name : '';
    
    await notificationService.notifyAdminsNewProject(
      projectId,
      projectData.title,
      studentName,
      projectData.type
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

module.exports = {
  getAllProjects,
  getProjectById,
  createProject
};