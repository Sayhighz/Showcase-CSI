// controllers/user/projectController.js
import pool from "../../config/database.js";
import logger from "../../config/logger.js";
import fs from 'fs';
import {
  successResponse,
  handleServerError,
  notFoundResponse,
  forbiddenResponse,
  validationErrorResponse,
} from "../../utils/responseFormatter.js";
import {
  PROJECT_STATUSES,
  PROJECT_TYPES,
  isValidStatus,
  isValidType,
} from "../../constants/projectStatuses.js";
import { getPaginationParams } from "../../constants/pagination.js";
import { STATUS_CODES } from "../../constants/statusCodes.js";
import storageService from "../../services/storageService.js";
import projectService from "../../services/projectService.js";
import notificationService from "../../services/notificationService.js";
import { sanitizeHTML } from "../../utils/validationHelper.js";
import { truncateText } from "../../utils/stringHelper.js";

/**
 * ดึงข้อมูลโครงการทั้งหมดที่ได้รับการอนุมัติแล้ว
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllProjects = async (req, res) => {
  try {
    // Get pagination parameters from request
    const pagination = getPaginationParams(req);

    // Get filters from request
    const filters = {
      type: req.query.category || null,
      year: req.query.year || null,
      studyYear: req.query.level || null,
      onlyVisible: true,
      status: PROJECT_STATUSES.APPROVED,
      search: req.query.keyword || null, // Add keyword search parameter
    };

    // Get projects from service
    const result = await projectService.getAllProjects(filters, pagination);

    // Format projects for response
    const formattedProjects = result.projects.map((project) => ({
      id: project.project_id,
      title: project.title,
      description: truncateText(project.description, 200),
      category: project.type,
      level: `ปี ${project.study_year}`,
      year: project.year,
      image: project.image || null,
      student: project.full_name,
      studentId: project.user_id,
      username: project.username,
      userImage: project.user_image || null,
      projectLink: `/projects/${project.project_id}`,
      viewsCount: project.views_count || 0,
    }));

    return res.json(
      successResponse(
        {
          projects: formattedProjects,
          pagination: result.pagination,
        },
        "Projects retrieved successfully"
      )
    );
  } catch (error) {
    logger.error("Error getting all projects:", error);
    return handleServerError(res, error);
  }
};

export const getTop9Projects = async (req, res) => {
  try {
    const page = 1;
    const limit = 9;
    const offset = (page - 1) * limit;

    const filters = {
      onlyVisible: true,
      status: PROJECT_STATUSES.APPROVED,
    };

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

    if (filters.status) {
      baseQuery += ` AND p.status = ?`;
      queryParams.push(filters.status);
    }

    if (filters.onlyVisible) {
      baseQuery += ` AND p.visibility = 1`;
    }

    const mainQuery = `${baseQuery} ORDER BY p.views_count DESC, p.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const [projects] = await pool.execute(mainQuery, queryParams);

    // ดึงข้อมูลผู้ร่วมโครงการสำหรับทุกโครงการ
    if (projects.length > 0) {
      const projectIds = projects.map(p => p.project_id);
      const placeholders = projectIds.map(() => '?').join(',');
      
      const collaboratorsQuery = `
        SELECT pg.project_id, pg.role, u.user_id, u.username, u.full_name, u.image
        FROM project_groups pg
        JOIN users u ON pg.user_id = u.user_id
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
      
      // จัดกลุ่มผู้ร่วมโครงการตาม project_id
      const collaboratorsByProject = collaborators.reduce((acc, collab) => {
        if (!acc[collab.project_id]) {
          acc[collab.project_id] = [];
        }
        acc[collab.project_id].push({
          userId: collab.user_id,
          username: collab.username,
          fullName: collab.full_name,
          image: collab.image,
          role: collab.role
        });
        return acc;
      }, {});
      
      // เพิ่มข้อมูลผู้ร่วมโครงการเข้าไปในแต่ละโครงการ
      projects.forEach(project => {
        project.collaborators = collaboratorsByProject[project.project_id] || [];
      });
    }

    const formattedProjects = projects.map((project) => ({
      id: project.project_id,
      title: project.title,
      description: truncateText(project.description, 150),
      category: project.type,
      level: `ปี ${project.study_year}`,
      year: project.year,
      image: project.image || null,
      student: project.full_name,
      studentId: project.user_id,
      username: project.username,
      userImage: project.user_image || null,
      collaborators: project.collaborators || [], // เพิ่มข้อมูลผู้ร่วมโครงการ
      projectLink: `/projects/${project.project_id}`,
      viewsCount: project.views_count || 0,
      createdAt: project.created_at,
    }));

    return res.json(
      successResponse(
        {
          projects: formattedProjects,
          pagination: {
            page,
            limit,
            totalItems: projects.length,
            totalPages: 1,
          },
        },
        "Top projects retrieved successfully"
      )
    );
  } catch (error) {
    logger.error("Error getting top projects:", error);
    return handleServerError(res, error);
  }
};

/**
 * ดึงข้อมูลโครงการล่าสุด
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getLatestProjects = async (req, res) => {
  try {
    const page = 1;
    const limit = parseInt(req.query.limit) || 9;
    const offset = (page - 1) * limit;

    const filters = {
      onlyVisible: true,
      status: PROJECT_STATUSES.APPROVED,
    };

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

    if (filters.status) {
      baseQuery += ` AND p.status = ?`;
      queryParams.push(filters.status);
    }

    if (filters.onlyVisible) {
      baseQuery += ` AND p.visibility = 1`;
    }

    const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) as countTable`;
    const [countResult] = await pool.execute(countQuery, queryParams);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    const mainQuery = `${baseQuery} ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const [projects] = await pool.execute(mainQuery, queryParams);

    const formattedProjects = projects.map((project) => ({
      id: project.project_id,
      title: project.title,
      description: truncateText(project.description, 150),
      category: project.type,
      level: `ปี ${project.study_year}`,
      year: project.year,
      image: project.image || null,
      student: project.full_name,
      studentId: project.user_id,
      username: project.username,
      userImage: project.user_image || null,
      projectLink: `/projects/${project.project_id}`,
      viewsCount: project.views_count || 0,
      createdAt: project.created_at,
    }));

    return res.json(
      successResponse(
        {
          projects: formattedProjects,
          pagination: {
            page,
            limit,
            totalItems,
            totalPages,
          },
        },
        "Latest projects retrieved successfully"
      )
    );
  } catch (error) {
    logger.error("Error getting latest projects:", error);
    return handleServerError(res, error);
  }
};


/**
 * ดึงข้อมูลโครงการของผู้ใช้คนนั้น ๆ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getMyProjects = async (req, res) => {
  try {
    const userId = req.params.user_id;

    if (req.user.id != userId && req.user.role !== "admin") {
      return forbiddenResponse(res, "You can only view your own projects");
    }

    const filters = {
      userId: userId,
    };

    const pagination = getPaginationParams(req);

    const result = await projectService.getAllProjects(filters, pagination);

    const formattedProjects = result.projects.map((project) => ({
      id: project.project_id,
      title: project.title,
      description: truncateText(project.description, 150),
      category: project.type,
      level: `ปี ${project.study_year}`,
      year: project.year,
      status: project.status,
      image: project.image || null,
      student: project.full_name,
      studentId: project.user_id,
      username: project.username,
      userImage: project.user_image || null,
      projectLink: `/projects/${project.project_id}`,
      viewsCount: project.views_count || 0,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    }));

    return res.json(
      successResponse(
        {
          projects: formattedProjects,
          pagination: result.pagination,
        },
        "My projects retrieved successfully"
      )
    );
  } catch (error) {
    logger.error(
      `Error getting projects for user ${req.params.user_id}:`,
      error
    );
    return handleServerError(res, error);
  }
};


/**
 * ดึงข้อมูลรายละเอียดโครงการตาม project_id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

export const getProjectDetails = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const viewerId = req.user ? req.user.id : null;

    const options = {
      includeReviews: req.user && req.user.role === "admin",
      recordView: !req.user || req.user.id !== projectId,
      viewerId: viewerId,
    };

    const project = await projectService.getProjectById(projectId, options);

    if (!project) {
      return notFoundResponse(res, "Project not found");
    }

    if (
      (project.visibility === 0 || project.status === "pending") &&
      (!req.user || (req.user.id !== project.user_id && req.user.role !== "admin"))
    ) {
      return forbiddenResponse(res, "You do not have permission to view this project");
    }

    const formattedProject = {
      projectId: project.project_id,
      title: project.title,
      description: project.description,
      type: project.type,
      studyYear: project.study_year,
      year: project.year,
      semester: project.semester,
      visibility: project.visibility,
      status: project.status,
      author: {
        id: project.user_id,
        username: project.username,
        fullName: project.full_name,
        image: project.user_image,
        email:
          req.user &&
          (req.user.id === project.user_id || req.user.role === "admin")
            ? project.email
            : undefined,
      },
      contributors: project.contributors || [],
      viewsCount: project.views_count || 0,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    };

    if (project.academic) {
      formattedProject.academic = project.academic;
    }

    if (project.competition) {
      formattedProject.competition = project.competition;
    }

    if (project.coursework) {
      formattedProject.coursework = project.coursework;
    }

    if (options.includeReviews && project.reviews) {
      formattedProject.reviews = project.reviews;
    }

    return res.json(successResponse(formattedProject, "Project details retrieved successfully"));
  } catch (error) {
    logger.error(`Error getting project details for project ${req.params.projectId}:`, error);
    return handleServerError(res, error);
  }
};


/**
 * อัปโหลดโครงการใหม่
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const uploadProject = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const userId = req.params.user_id;

    // ตรวจสอบสิทธิ์ในการอัปโหลด
    if (req.user.id != userId && req.user.role !== "admin") {
      return forbiddenResponse(res, "You can only upload your own projects");
    }

    // เริ่มต้น transaction
    await connection.beginTransaction();
    console.log("Transaction started");

    // ดึงและตรวจสอบข้อมูลโครงการ
    const {
      title,
      description,
      type,
      study_year,
      year,
      semester,
      visibility = 1,
      clip_video, // รับ URL ของวิดีโอจาก form input (ถ้ามี)
      competition_name,
      competition_year,
      publication_date,
      published_year
    } = req.body;

    // แสดง log สำหรับการดีบัก
    console.log("Request body:", req.body);
    console.log("Files from middleware:", req.files);
    console.log("Project files:", req.project?.files);

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!title || !description || !type || !study_year || !year || !semester) {
      return validationErrorResponse(res, "Missing required fields", {
        title: !title ? "Title is required" : null,
        description: !description ? "Description is required" : null,
        type: !type ? "Type is required" : null,
        study_year: !study_year ? "Study year is required" : null,
        year: !year ? "Year is required" : null,
        semester: !semester ? "Semester is required" : null,
      });
    }

    // ตรวจสอบประเภทโครงการ
    if (!isValidType(type)) {
      return validationErrorResponse(res, "Invalid project type", {
        type: `Type must be one of: ${Object.values(PROJECT_TYPES).join(", ")}`,
      });
    }

    // เตรียมข้อมูลโครงการ
    const projectData = {
      user_id: userId,
      title: sanitizeHTML(title),
      description: sanitizeHTML(description),
      type,
      study_year,
      year,
      semester,
      visibility,
      admin_id: null,
      competition_name: sanitizeHTML(competition_name || ""),
      competition_year: competition_year || year,
      publication_date: publication_date || new Date(),
      published_year: published_year || year,
      contributors: req.body.contributors || [],
    };

    // จัดการกับไฟล์ที่อัปโหลด
    let posterPath = null;
    let clipVideoPath = clip_video || null; // ใช้ URL ที่รับจาก form ถ้ามี
    let imagePath = null;
    let paperFilePath = null;

    // ----------------------------------------
    // ตรวจสอบการอัปโหลดไฟล์จากหลายแหล่งที่เป็นไปได้
    // ----------------------------------------
    
    // 1. ตรวจสอบจาก req.files โดยตรง (ที่มาจาก multer)
    if (req.files) {
      console.log("Checking files from multer directly");
      if (req.files.paperFile) {
        paperFilePath = req.files.paperFile[0].path;
        console.log("Found paperFile in req.files:", paperFilePath);
      }
      if (req.files.courseworkPoster) {
        posterPath = req.files.courseworkPoster[0].path;
        console.log("Found courseworkPoster in req.files:", posterPath);
      }
      if (req.files.competitionPoster) {
        posterPath = req.files.competitionPoster[0].path;
        console.log("Found competitionPoster in req.files:", posterPath);
      }
      if (req.files.courseworkImage) {
        imagePath = req.files.courseworkImage[0].path;
        console.log("Found courseworkImage in req.files:", imagePath);
      }
      if (req.files.courseworkVideo) {
        clipVideoPath = req.files.courseworkVideo[0].path;
        console.log("Found courseworkVideo in req.files:", clipVideoPath);
      }
    }
    
    // 2. ตรวจสอบจาก req.project.files (ที่เตรียมโดย middleware)
    if (req.project && req.project.files) {
      console.log("Processing files from middleware");
      
      // รูปปกทั่วไป (coverImage)
      if (req.project.files.coverImage) {
        posterPath = req.project.files.coverImage.path;
        console.log("Using coverImage:", posterPath);
      }
      
      // ตรวจสอบไฟล์เฉพาะประเภทโครงการ
      if (type === PROJECT_TYPES.COURSEWORK) {
        // สำหรับประเภท coursework
        if (req.project.files.courseworkPoster && !posterPath) {
          posterPath = req.project.files.courseworkPoster.path;
          console.log("Using courseworkPoster:", posterPath);
        }
        if (req.project.files.courseworkImage && !imagePath) {
          imagePath = req.project.files.courseworkImage.path;
          console.log("Using courseworkImage:", imagePath);
        }
        if (req.project.files.courseworkVideo && !clipVideoPath) {
          clipVideoPath = req.project.files.courseworkVideo.path;
          console.log("Using courseworkVideo file:", clipVideoPath);
        }
      } 
      else if (type === PROJECT_TYPES.COMPETITION) {
        // สำหรับประเภท competition
        if (req.project.files.competitionPoster && !posterPath) {
          posterPath = req.project.files.competitionPoster.path;
          console.log("Using competitionPoster:", posterPath);
        }
      }
      else if (type === PROJECT_TYPES.ACADEMIC) {
        // สำหรับประเภท academic
        if (req.project.files.paperFile && !paperFilePath) {
          paperFilePath = req.project.files.paperFile.path;
          console.log("Using paperFile from middleware:", paperFilePath);
        }
      }
    }
    
    // 3. ตรวจสอบถ้ามีการอัปโหลดไฟล์แต่ไม่ได้จัดการด้วย middleware พิเศษ
    if (req.file) {
      console.log("Found single uploaded file:", req.file);
      
      // ตรวจสอบประเภทไฟล์จาก mimetype
      if (req.file.mimetype === 'application/pdf' && type === PROJECT_TYPES.ACADEMIC) {
        paperFilePath = req.file.path;
        console.log("Using PDF from req.file:", paperFilePath);
      } else if (req.file.mimetype.startsWith('image/')) {
        posterPath = req.file.path;
        console.log("Using image from req.file:", posterPath);
      } else if (req.file.mimetype.startsWith('video/')) {
        clipVideoPath = req.file.path;
        console.log("Using video from req.file:", clipVideoPath);
      }
    }
    
    console.log("Final files prepared for database:", {
      type,
      posterPath,
      clipVideoPath,
      imagePath,
      paperFilePath
    });

    // สร้างโครงการในฐานข้อมูล
    const [projectResult] = await connection.execute(
      `
      INSERT INTO projects (
        user_id, title, description, type, study_year, year, 
        semester, visibility, status, admin_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        projectData.user_id,
        projectData.title,
        projectData.description,
        projectData.type,
        projectData.study_year,
        projectData.year,
        projectData.semester,
        projectData.visibility,
        PROJECT_STATUSES.PENDING,
        projectData.admin_id,
      ]
    );

    const projectId = projectResult.insertId;
    console.log("Created project with ID:", projectId);

    // เพิ่มข้อมูลผู้ร่วมงาน (contributors) ถ้ามี
    let contributors = projectData.contributors;
    if (typeof contributors === 'string') {
      try {
        contributors = JSON.parse(contributors);
      } catch (e) {
        console.error("Failed to parse contributors JSON:", e);
        contributors = [];
      }
    }

    if (Array.isArray(contributors) && contributors.length > 0) {
      console.log("Adding contributors:", contributors);
      for (const contributor of contributors) {
        await connection.execute(
          `
          INSERT INTO project_groups (project_id, user_id, role) 
          VALUES (?, ?, ?)
        `,
          [projectId, contributor.user_id, contributor.role || "contributor"]
        );
      }
    }

    // เพิ่มข้อมูลเฉพาะตามประเภทโครงการ
    if (projectData.type === PROJECT_TYPES.ACADEMIC) {
      console.log("Inserting academic paper data");
      await connection.execute(
        `
        INSERT INTO academic_papers (
          project_id, publication_date, published_year, paper_file
        ) VALUES (?, ?, ?, ?)
      `,
        [
          projectId,
          projectData.publication_date,
          projectData.published_year,
          paperFilePath, // ใช้ path ของไฟล์ PDF ที่พบ
        ]
      );
    } else if (projectData.type === PROJECT_TYPES.COMPETITION) {
      console.log("Inserting competition data");
      await connection.execute(
        `
        INSERT INTO competitions (
          project_id, competition_name, competition_year, poster
        ) VALUES (?, ?, ?, ?)
      `,
        [
          projectId,
          projectData.competition_name,
          projectData.competition_year,
          posterPath, // ใช้ path จากไฟล์ที่อัปโหลด
        ]
      );
    } else if (projectData.type === PROJECT_TYPES.COURSEWORK) {
      console.log("Inserting coursework data");
      console.log("Data to insert:", {
        projectId,
        posterPath,
        clipVideoPath,
        imagePath
      });
      
      await connection.execute(
        `
        INSERT INTO courseworks (
          project_id, poster, clip_video, image
        ) VALUES (?, ?, ?, ?)
      `,
        [
          projectId,
          posterPath, // ใช้ path จากไฟล์ที่อัปโหลด
          clipVideoPath, // ใช้ path จากไฟล์ที่อัปโหลดหรือ URL ที่รับมา
          imagePath, // ใช้ path จากไฟล์ที่อัปโหลด
        ]
      );
    }

    // Commit transaction
    await connection.commit();
    console.log("Transaction committed successfully");

    // แจ้งเตือนผู้ดูแลระบบเกี่ยวกับโครงการใหม่
    try {
      await notificationService.notifyAdminsNewProject(
        projectId,
        projectData.title,
        req.user.fullName,
        projectData.type
      );
    } catch (notifyError) {
      // ไม่ให้การแจ้งเตือนล้มเหลวทำให้การสร้างโครงการล้มเหลว
      console.error("Error sending admin notification:", notifyError);
      logger.error("Notification error:", notifyError);
    }

    return res.status(STATUS_CODES.CREATED).json(
      successResponse(
        {
          projectId: projectId,
          title: projectData.title,
          message:
            "Project submitted successfully. Please wait for admin approval.",
        },
        "Project created successfully"
      )
    );
  } catch (error) {
    // Rollback transaction เมื่อเกิดข้อผิดพลาด
    await connection.rollback();
    console.error("Transaction error:", error);
    logger.error("Error uploading project:", error);
    return handleServerError(res, error);
  } finally {
    // คืน connection
    connection.release();
  }
};


/**
* อัปเดตข้อมูลโครงการพร้อมรองรับการอัปโหลดไฟล์
* @param {Object} req - Express request object
* @param {Object} res - Express response object
*/
export const updateProjectWithFiles = async (req, res) => {
  const connection = await pool.getConnection();
 
  try {
    const projectId = req.params.projectId;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
 
    // ดึงข้อมูลโครงการเพื่อตรวจสอบความเป็นเจ้าของ
    const [projects] = await pool.execute(
      `SELECT * FROM projects WHERE project_id = ?`,
      [projectId]
    );
 
    if (projects.length === 0) {
      return notFoundResponse(res, "Project not found");
    }
 
    const project = projects[0];
 
    // ตรวจสอบสิทธิ์ในการแก้ไข
    if (req.user.id != project.user_id && req.user.role !== "admin") {
      return forbiddenResponse(res, "You can only update your own projects");
    }
 
    // แสดง log ข้อมูลที่ได้รับ
    console.log("Update request for project:", projectId);
    console.log("Request body:", req.body);
    console.log("Files:", req.files);
    console.log("Project file:", req.file);
    console.log("Project update files:", req.projectUpdate?.files);
 
    // เริ่มต้น transaction
    await connection.beginTransaction();
 
    // ดึงข้อมูลที่จะอัปเดต
    const updateData = req.body;
 
    // สร้าง query สำหรับอัปเดตเฉพาะฟิลด์ที่มี
    let updateFields = [];
    let updateParams = [];
 
    if (updateData.title !== undefined && updateData.title !== project.title) {
      updateFields.push("title = ?");
      updateParams.push(sanitizeHTML(updateData.title));
      
      // บันทึกการเปลี่ยนแปลง
      await notificationService.logProjectChange(
        projectId,
        'updated',
        'title',
        project.title,
        updateData.title,
        req.user.id,
        'User updated project title',
        ipAddress,
        userAgent
      );
    }
 
    if (updateData.description !== undefined && updateData.description !== project.description) {
      updateFields.push("description = ?");
      updateParams.push(sanitizeHTML(updateData.description));
      
      // บันทึกการเปลี่ยนแปลง
      await notificationService.logProjectChange(
        projectId,
        'updated',
        'description',
        project.description,
        updateData.description,
        req.user.id,
        'User updated project description',
        ipAddress,
        userAgent
      );
    }
 
    if (updateData.study_year !== undefined && updateData.study_year !== project.study_year) {
      updateFields.push("study_year = ?");
      updateParams.push(updateData.study_year);
      
      await notificationService.logProjectChange(
        projectId,
        'updated',
        'study_year',
        project.study_year,
        updateData.study_year,
        req.user.id,
        'User updated study year',
        ipAddress,
        userAgent
      );
    }
 
    if (updateData.year !== undefined && updateData.year !== project.year) {
      updateFields.push("year = ?");
      updateParams.push(updateData.year);
      
      await notificationService.logProjectChange(
        projectId,
        'updated',
        'year',
        project.year,
        updateData.year,
        req.user.id,
        'User updated year',
        ipAddress,
        userAgent
      );
    }
 
    if (updateData.semester !== undefined && updateData.semester !== project.semester) {
      updateFields.push("semester = ?");
      updateParams.push(updateData.semester);
      
      await notificationService.logProjectChange(
        projectId,
        'updated',
        'semester',
        project.semester,
        updateData.semester,
        req.user.id,
        'User updated semester',
        ipAddress,
        userAgent
      );
    }
 
    if (updateData.visibility !== undefined && updateData.visibility !== project.visibility) {
      updateFields.push("visibility = ?");
      updateParams.push(updateData.visibility);
      
      await notificationService.logProjectChange(
        projectId,
        'updated',
        'visibility',
        project.visibility,
        updateData.visibility,
        req.user.id,
        'User updated visibility',
        ipAddress,
        userAgent
      );
    }
 
    // เปลี่ยนสถานะกลับเป็น pending เพื่อรอการตรวจสอบจากผู้ดูแล
    if (project.status !== PROJECT_STATUSES.PENDING) {
      updateFields.push("status = ?");
      updateParams.push(PROJECT_STATUSES.PENDING);
      
      await notificationService.logProjectChange(
        projectId,
        'updated',
        'status',
        project.status,
        PROJECT_STATUSES.PENDING,
        req.user.id,
        'Status changed to pending after user update',
        ipAddress,
        userAgent
      );
    }
 
    // อัปเดตเวลาการแก้ไข
    updateFields.push("updated_at = NOW()");
 
    // เพิ่ม project ID เข้าไปใน parameters
    updateParams.push(projectId);
 
    // อัปเดตข้อมูลโครงการหลัก
    if (updateFields.length > 0) {
      const updateQuery = `
        UPDATE projects 
        SET ${updateFields.join(", ")} 
        WHERE project_id = ?
      `;
 
      await connection.execute(updateQuery, updateParams);
      console.log("Updated main project data");
    }
 
    // -----------------------------------------------
    // จัดการกับไฟล์ที่อัปโหลด
    // -----------------------------------------------
    
    // ดึงข้อมูลไฟล์เดิมก่อนการอัปเดต
    let oldFiles = {};
    
    if (project.type === PROJECT_TYPES.ACADEMIC) {
      const [academicData] = await connection.execute(
        `SELECT paper_file FROM academic_papers WHERE project_id = ?`,
        [projectId]
      );
      if (academicData.length > 0) {
        oldFiles.paperFile = academicData[0].paper_file;
      }
    } else if (project.type === PROJECT_TYPES.COMPETITION) {
      const [competitionData] = await connection.execute(
        `SELECT poster FROM competitions WHERE project_id = ?`,
        [projectId]
      );
      if (competitionData.length > 0) {
        oldFiles.competitionPoster = competitionData[0].poster;
      }
    } else if (project.type === PROJECT_TYPES.COURSEWORK) {
      const [courseworkData] = await connection.execute(
        `SELECT poster, clip_video, image FROM courseworks WHERE project_id = ?`,
        [projectId]
      );
      if (courseworkData.length > 0) {
        oldFiles.courseworkPoster = courseworkData[0].poster;
        oldFiles.clipVideoPath = courseworkData[0].clip_video;
        oldFiles.courseworkImage = courseworkData[0].image;
      }
    }
    
    console.log("Old files before update:", oldFiles);
    
    // ประกาศตัวแปรสำหรับเก็บ path ของไฟล์ใหม่
    let paperFilePath = null;
    let posterPath = null;
    let clipVideoPath = null;
    let imagePath = null;
    
    // 1. ตรวจสอบไฟล์จาก req.files (จาก multer โดยตรง)
    if (req.files) {
      console.log("Checking files from multer directly");
      
      // ตรวจสอบไฟล์ PDF สำหรับ academic
      if (req.files.paperFile) {
        paperFilePath = req.files.paperFile[0].path;
        console.log("Found paperFile in req.files:", paperFilePath);
        
        // ลบไฟล์เดิมถ้ามี
        if (oldFiles.paperFile) {
          try {
            fs.unlinkSync(oldFiles.paperFile);
            console.log("Deleted old paperFile:", oldFiles.paperFile);
          } catch (err) {
            console.error("Error deleting old paperFile:", err);
          }
        }
        
        // บันทึกการเปลี่ยนแปลงไฟล์
        await notificationService.logProjectChange(
          projectId,
          'updated',
          'paper_file',
          oldFiles.paperFile,
          paperFilePath,
          req.user.id,
          'User updated paper file',
          ipAddress,
          userAgent
        );
      }
      
      // ตรวจสอบไฟล์โปสเตอร์
      if (req.files.courseworkPoster) {
        posterPath = req.files.courseworkPoster[0].path;
        console.log("Found courseworkPoster in req.files:", posterPath);
        
        // ลบไฟล์เดิมถ้ามี
        if (oldFiles.courseworkPoster) {
          try {
            fs.unlinkSync(oldFiles.courseworkPoster);
            console.log("Deleted old courseworkPoster:", oldFiles.courseworkPoster);
          } catch (err) {
            console.error("Error deleting old courseworkPoster:", err);
          }
        }
        
        await notificationService.logProjectChange(
          projectId,
          'updated',
          'coursework_poster',
          oldFiles.courseworkPoster,
          posterPath,
          req.user.id,
          'User updated coursework poster',
          ipAddress,
          userAgent
        );
      }
      
      if (req.files.competitionPoster) {
        posterPath = req.files.competitionPoster[0].path;
        console.log("Found competitionPoster in req.files:", posterPath);
        
        // ลบไฟล์เดิมถ้ามี
        if (oldFiles.competitionPoster) {
          try {
            fs.unlinkSync(oldFiles.competitionPoster);
            console.log("Deleted old competitionPoster:", oldFiles.competitionPoster);
          } catch (err) {
            console.error("Error deleting old competitionPoster:", err);
          }
        }
        
        await notificationService.logProjectChange(
          projectId,
          'updated',
          'competition_poster',
          oldFiles.competitionPoster,
          posterPath,
          req.user.id,
          'User updated competition poster',
          ipAddress,
          userAgent
        );
      }
      
      // ตรวจสอบไฟล์ภาพประกอบ
      if (req.files.courseworkImage) {
        imagePath = req.files.courseworkImage[0].path;
        console.log("Found courseworkImage in req.files:", imagePath);
        
        // ลบไฟล์เดิมถ้ามี
        if (oldFiles.courseworkImage) {
          try {
            fs.unlinkSync(oldFiles.courseworkImage);
            console.log("Deleted old courseworkImage:", oldFiles.courseworkImage);
          } catch (err) {
            console.error("Error deleting old courseworkImage:", err);
          }
        }
        
        await notificationService.logProjectChange(
          projectId,
          'updated',
          'coursework_image',
          oldFiles.courseworkImage,
          imagePath,
          req.user.id,
          'User updated coursework image',
          ipAddress,
          userAgent
        );
      }
      
      // ตรวจสอบไฟล์วิดีโอ
      if (req.files.courseworkVideo) {
        clipVideoPath = req.files.courseworkVideo[0].path;
        console.log("Found courseworkVideo in req.files:", clipVideoPath);
        
        // ลบไฟล์เดิมถ้ามี (เฉพาะถ้าเป็นไฟล์ ไม่ใช่ URL)
        if (oldFiles.clipVideoPath && oldFiles.clipVideoPath.startsWith('uploads/')) {
          try {
            fs.unlinkSync(oldFiles.clipVideoPath);
            console.log("Deleted old courseworkVideo file:", oldFiles.clipVideoPath);
          } catch (err) {
            console.error("Error deleting old courseworkVideo file:", err);
          }
        }
        
        await notificationService.logProjectChange(
          projectId,
          'updated',
          'coursework_video',
          oldFiles.clipVideoPath,
          clipVideoPath,
          req.user.id,
          'User updated coursework video',
          ipAddress,
          userAgent
        );
      }
    }
    
    // 2. ตรวจสอบจาก req.projectUpdate.files (จาก middleware ของเรา)
    if (req.projectUpdate && req.projectUpdate.files) {
      console.log("Checking files from custom middleware");
      
      // ไฟล์ PDF สำหรับ academic
      if (req.projectUpdate.files.paperFile && !paperFilePath) {
        paperFilePath = req.projectUpdate.files.paperFile.path;
        console.log("Using paperFile from middleware:", paperFilePath);
        
        // ลบไฟล์เดิมถ้ามี
        if (oldFiles.paperFile) {
          try {
            fs.unlinkSync(oldFiles.paperFile);
            console.log("Deleted old paperFile:", oldFiles.paperFile);
          } catch (err) {
            console.error("Error deleting old paperFile:", err);
          }
        }
        
        await notificationService.logProjectChange(
          projectId,
          'updated',
          'paper_file',
          oldFiles.paperFile,
          paperFilePath,
          req.user.id,
          'User updated paper file',
          ipAddress,
          userAgent
        );
      }
      
      // ไฟล์โปสเตอร์
      if (req.projectUpdate.files.courseworkPoster && !posterPath) {
        posterPath = req.projectUpdate.files.courseworkPoster.path;
        console.log("Using courseworkPoster from middleware:", posterPath);
        
        // ลบไฟล์เดิมถ้ามี
        if (oldFiles.courseworkPoster) {
          try {
            fs.unlinkSync(oldFiles.courseworkPoster);
            console.log("Deleted old courseworkPoster:", oldFiles.courseworkPoster);
          } catch (err) {
            console.error("Error deleting old courseworkPoster:", err);
          }
        }
        
        await notificationService.logProjectChange(
          projectId,
          'updated',
          'coursework_poster',
          oldFiles.courseworkPoster,
          posterPath,
          req.user.id,
          'User updated coursework poster',
          ipAddress,
          userAgent
        );
      }
      
      if (req.projectUpdate.files.competitionPoster && !posterPath) {
        posterPath = req.projectUpdate.files.competitionPoster.path;
        console.log("Using competitionPoster from middleware:", posterPath);
        
        // ลบไฟล์เดิมถ้ามี
        if (oldFiles.competitionPoster) {
          try {
            fs.unlinkSync(oldFiles.competitionPoster);
            console.log("Deleted old competitionPoster:", oldFiles.competitionPoster);
          } catch (err) {
            console.error("Error deleting old competitionPoster:", err);
          }
        }
        
        await notificationService.logProjectChange(
          projectId,
          'updated',
          'competition_poster',
          oldFiles.competitionPoster,
          posterPath,
          req.user.id,
          'User updated competition poster',
          ipAddress,
          userAgent
        );
      }
      
      // ไฟล์ภาพประกอบ
      if (req.projectUpdate.files.courseworkImage && !imagePath) {
        imagePath = req.projectUpdate.files.courseworkImage.path;
        console.log("Using courseworkImage from middleware:", imagePath);
        
        // ลบไฟล์เดิมถ้ามี
        if (oldFiles.courseworkImage) {
          try {
            fs.unlinkSync(oldFiles.courseworkImage);
            console.log("Deleted old courseworkImage:", oldFiles.courseworkImage);
          } catch (err) {
            console.error("Error deleting old courseworkImage:", err);
          }
        }
        
        await notificationService.logProjectChange(
          projectId,
          'updated',
          'coursework_image',
          oldFiles.courseworkImage,
          imagePath,
          req.user.id,
          'User updated coursework image',
          ipAddress,
          userAgent
        );
      }
      
      // ไฟล์วิดีโอ
      if (req.projectUpdate.files.courseworkVideo && !clipVideoPath) {
        clipVideoPath = req.projectUpdate.files.courseworkVideo.path;
        console.log("Using courseworkVideo from middleware:", clipVideoPath);
        
        // ลบไฟล์เดิมถ้ามี (เฉพาะถ้าเป็นไฟล์ ไม่ใช่ URL)
        if (oldFiles.clipVideoPath && oldFiles.clipVideoPath.startsWith('uploads/')) {
          try {
            fs.unlinkSync(oldFiles.clipVideoPath);
            console.log("Deleted old courseworkVideo file:", oldFiles.clipVideoPath);
          } catch (err) {
            console.error("Error deleting old courseworkVideo file:", err);
          }
        }
        
        await notificationService.logProjectChange(
          projectId,
          'updated',
          'coursework_video',
          oldFiles.clipVideoPath,
          clipVideoPath,
          req.user.id,
          'User updated coursework video',
          ipAddress,
          userAgent
        );
      }
    }
    
    // 3. ตรวจสอบจาก req.file (กรณีอัปโหลดไฟล์เดียว)
    if (req.file) {
      console.log("Found single uploaded file:", req.file);
      
      // ตรวจสอบประเภทไฟล์และโปรเจกต์
      if (req.file.mimetype === 'application/pdf' && project.type === PROJECT_TYPES.ACADEMIC) {
        paperFilePath = req.file.path;
        console.log("Using PDF from req.file:", paperFilePath);
        
        // ลบไฟล์เดิมถ้ามี
        if (oldFiles.paperFile) {
          try {
            fs.unlinkSync(oldFiles.paperFile);
            console.log("Deleted old paperFile:", oldFiles.paperFile);
          } catch (err) {
            console.error("Error deleting old paperFile:", err);
          }
        }
        
        await notificationService.logProjectChange(
          projectId,
          'updated',
          'paper_file',
          oldFiles.paperFile,
          paperFilePath,
          req.user.id,
          'User updated paper file',
          ipAddress,
          userAgent
        );
      } else if (req.file.mimetype.startsWith('image/')) {
        // กำหนดโปสเตอร์ตามประเภทโปรเจกต์
        posterPath = req.file.path;
        console.log("Using image from req.file:", posterPath);
        
        // ลบไฟล์เดิมที่เกี่ยวข้อง
        if (project.type === PROJECT_TYPES.COURSEWORK && oldFiles.courseworkPoster) {
          try {
            fs.unlinkSync(oldFiles.courseworkPoster);
            console.log("Deleted old courseworkPoster:", oldFiles.courseworkPoster);
          } catch (err) {
            console.error("Error deleting old courseworkPoster:", err);
          }
        } else if (project.type === PROJECT_TYPES.COMPETITION && oldFiles.competitionPoster) {
          try {
            fs.unlinkSync(oldFiles.competitionPoster);
            console.log("Deleted old competitionPoster:", oldFiles.competitionPoster);
          } catch (err) {
            console.error("Error deleting old competitionPoster:", err);
          }
        }
        
        const fileType = project.type === PROJECT_TYPES.COURSEWORK ? 'coursework_poster' : 'competition_poster';
        const oldFile = project.type === PROJECT_TYPES.COURSEWORK ? oldFiles.courseworkPoster : oldFiles.competitionPoster;
        
        await notificationService.logProjectChange(
          projectId,
          'updated',
          fileType,
          oldFile,
          posterPath,
          req.user.id,
          `User updated ${fileType}`,
          ipAddress,
          userAgent
        );
      } else if (req.file.mimetype.startsWith('video/')) {
        clipVideoPath = req.file.path;
        console.log("Using video from req.file:", clipVideoPath);
        
        // ลบไฟล์เดิมถ้ามี (เฉพาะถ้าเป็นไฟล์ ไม่ใช่ URL)
        if (oldFiles.clipVideoPath && oldFiles.clipVideoPath.startsWith('uploads/')) {
          try {
            fs.unlinkSync(oldFiles.clipVideoPath);
            console.log("Deleted old courseworkVideo file:", oldFiles.clipVideoPath);
          } catch (err) {
            console.error("Error deleting old courseworkVideo file:", err);
          }
        }
        
        await notificationService.logProjectChange(
          projectId,
          'updated',
          'coursework_video',
          oldFiles.clipVideoPath,
          clipVideoPath,
          req.user.id,
          'User updated coursework video',
          ipAddress,
          userAgent
        );
      }
    }
    
    // 4. ตรวจสอบ URL วิดีโอจาก form input (สำหรับ coursework)
    if (updateData.clip_video !== undefined && project.type === PROJECT_TYPES.COURSEWORK) {
      // ตรวจสอบการเปลี่ยนแปลง URL วิดีโอ
      if (updateData.clip_video !== oldFiles.clipVideoPath) {
        clipVideoPath = updateData.clip_video || null;
        console.log("Using clip_video from form input:", clipVideoPath);
        
        // ลบไฟล์เดิมถ้าเป็นไฟล์ (ไม่ใช่ URL)
        if (oldFiles.clipVideoPath && oldFiles.clipVideoPath.startsWith('uploads/')) {
          try {
            fs.unlinkSync(oldFiles.clipVideoPath);
            console.log("Deleted old video file when replaced with URL:", oldFiles.clipVideoPath);
          } catch (err) {
            console.error("Error deleting old video file:", err);
          }
        }
        
        await notificationService.logProjectChange(
          projectId,
          'updated',
          'clip_video_url',
          oldFiles.clipVideoPath,
          clipVideoPath,
          req.user.id,
          'User updated video URL',
          ipAddress,
          userAgent
        );
      }
    }
    
    console.log("Final files to update:", {
      projectType: project.type,
      posterPath,
      clipVideoPath,
      imagePath,
      paperFilePath
    });
 
    // Update contributors if provided
    if (updateData.contributors !== undefined && updateData.contributors !== '') {
      try {
        // ดึงข้อมูล contributors เดิม
        const [oldContributors] = await connection.execute(
          `SELECT user_id, role FROM project_groups WHERE project_id = ?`,
          [projectId]
        );
        
        // Delete existing contributors
        await connection.execute(
          `DELETE FROM project_groups WHERE project_id = ?`,
          [projectId]
        );
        console.log("Deleted existing contributors");
 
        // Add new contributors only if contributors is not empty
        let newContributors = [];
        if (updateData.contributors.trim()) {
          const contributors = JSON.parse(updateData.contributors);
          
          if (Array.isArray(contributors) && contributors.length > 0) {
            console.log("Adding new contributors:", contributors);
            for (const contributor of contributors) {
              await connection.execute(
                `INSERT INTO project_groups (project_id, user_id, role) VALUES (?, ?, ?)`,
                [projectId, contributor.user_id, contributor.role || "contributor"]
              );
            }
            newContributors = contributors;
          }
        }
        
        // บันทึกการเปลี่ยนแปลง contributors
        await notificationService.logProjectChange(
          projectId,
          'updated',
          'contributors',
          oldContributors,
          newContributors,
          req.user.id,
          'User updated contributors',
          ipAddress,
          userAgent
        );
      } catch (parseError) {
        console.error("Error parsing contributors JSON:", parseError);
        // ไม่ให้การแปลง JSON ผิดพลาดทำให้การอัปเดตทั้งหมดล้มเหลว
        // เราจะดำเนินการต่อโดยไม่อัปเดต contributors
      }
    }
 
    // อัปเดตข้อมูลตามประเภทโปรเจกต์
    if (project.type === PROJECT_TYPES.ACADEMIC) {
      await updateAcademicDataWithFiles(connection, projectId, updateData, project.year, paperFilePath);
    } else if (project.type === PROJECT_TYPES.COMPETITION) {
      await updateCompetitionDataWithFiles(connection, projectId, updateData, project.year, posterPath);
    } else if (project.type === PROJECT_TYPES.COURSEWORK) {
      await updateCourseworkDataWithFiles(connection, projectId, updateData, posterPath, clipVideoPath, imagePath);
    }
 
    // Commit transaction
    await connection.commit();
    console.log("Transaction committed successfully");
 
    // Notify admins of updated project
    try {
      await notificationService.notifyAdminsNewProject(
        projectId,
        updateData.title || project.title,
        req.user.fullName,
        project.type
      );
    } catch (notifyError) {
      // ไม่ให้การแจ้งเตือนล้มเหลวทำให้การอัปเดตล้มเหลว
      console.error("Error sending admin notification:", notifyError);
    }
 
    return res.json(
      successResponse(
        {
          projectId,
          message:
            "Project updated successfully. Please wait for admin approval.",
        },
        "Project updated successfully"
      )
    );
  } catch (error) {
    // Rollback transaction on error
    await connection.rollback();
    console.error("Transaction error:", error);
    logger.error(`Error updating project ${req.params.projectId}:`, error);
    return handleServerError(res, error);
  } finally {
    // Release connection
    connection.release();
  }
 };


/**
 * อัปเดตข้อมูลบทความวิชาการพร้อมไฟล์
 */
async function updateAcademicDataWithFiles(connection, projectId, updateData, defaultYear, paperFilePath) {
  console.log("Updating academic data with files");
  
  // ตรวจสอบว่ามีข้อมูลในตารางหรือไม่
  const [academic] = await connection.execute(
    `SELECT * FROM academic_papers WHERE project_id = ?`,
    [projectId]
  );

  if (academic.length > 0) {
    // อัปเดตข้อมูลที่มีอยู่แล้ว
    const updateFields = [];
    const updateParams = [];

    if (updateData.publication_date !== undefined) {
      updateFields.push("publication_date = ?");
      updateParams.push(updateData.publication_date);
    }

    if (updateData.published_year !== undefined) {
      updateFields.push("published_year = ?");
      updateParams.push(updateData.published_year);
    }
    
    // อัปเดตไฟล์เอกสารถ้ามี
    if (paperFilePath !== null) {
      updateFields.push("paper_file = ?");
      updateParams.push(paperFilePath);
    }

    // อัปเดตเวลา
    updateFields.push("last_updated = NOW()");

    // เพิ่ม project ID
    updateParams.push(projectId);

    if (updateFields.length > 0) {
      const updateQuery = `
        UPDATE academic_papers
        SET ${updateFields.join(", ")}
        WHERE project_id = ?
      `;

      await connection.execute(updateQuery, updateParams);
      console.log("Updated existing academic paper record");
    }
  } else {
    // สร้างข้อมูลใหม่
    await connection.execute(
      `
      INSERT INTO academic_papers (
        project_id, 
        publication_date, 
        published_year,
        paper_file
      ) VALUES (?, ?, ?, ?)
    `,
      [
        projectId,
        updateData.publication_date || null,
        updateData.published_year || defaultYear,
        paperFilePath,
      ]
    );
    console.log("Created new academic paper record");
  }
}

/**
 * อัปเดตข้อมูลการแข่งขันพร้อมไฟล์
 */
async function updateCompetitionDataWithFiles(connection, projectId, updateData, defaultYear, posterPath) {
  console.log("Updating competition data with files");
  
  // ตรวจสอบว่ามีข้อมูลในตารางหรือไม่
  const [competition] = await connection.execute(
    `SELECT * FROM competitions WHERE project_id = ?`,
    [projectId]
  );

  if (competition.length > 0) {
    // อัปเดตข้อมูลที่มีอยู่แล้ว
    const updateFields = [];
    const updateParams = [];

    if (updateData.competition_name !== undefined) {
      updateFields.push("competition_name = ?");
      updateParams.push(sanitizeHTML(updateData.competition_name));
    }

    if (updateData.competition_year !== undefined) {
      updateFields.push("competition_year = ?");
      updateParams.push(updateData.competition_year);
    }
    
    // อัปเดตโปสเตอร์ถ้ามี
    if (posterPath !== null) {
      updateFields.push("poster = ?");
      updateParams.push(posterPath);
    }

    // เพิ่ม project ID
    updateParams.push(projectId);

    if (updateFields.length > 0) {
      const updateQuery = `
        UPDATE competitions
        SET ${updateFields.join(", ")}
        WHERE project_id = ?
      `;

      await connection.execute(updateQuery, updateParams);
      console.log("Updated existing competition record");
    }
  } else {
    // สร้างข้อมูลใหม่
    await connection.execute(
      `
      INSERT INTO competitions (
        project_id, 
        competition_name, 
        competition_year, 
        poster
      ) VALUES (?, ?, ?, ?)
    `,
      [
        projectId,
        sanitizeHTML(updateData.competition_name || ""),
        updateData.competition_year || defaultYear,
        posterPath,
      ]
    );
    console.log("Created new competition record");
  }
}

/**
 * อัปเดตข้อมูลผลงานการเรียนพร้อมไฟล์
 */
async function updateCourseworkDataWithFiles(connection, projectId, updateData, posterPath, clipVideoPath, imagePath) {
  console.log("Updating coursework data with files");
  
  // ตรวจสอบว่ามีข้อมูลในตารางหรือไม่
  const [coursework] = await connection.execute(
    `SELECT * FROM courseworks WHERE project_id = ?`,
    [projectId]
  );

  if (coursework.length > 0) {
    // อัปเดตข้อมูลที่มีอยู่แล้ว
    const updateFields = [];
    const updateParams = [];
    
    // อัปเดตโปสเตอร์ถ้ามี
    if (posterPath !== null) {
      updateFields.push("poster = ?");
      updateParams.push(posterPath);
    }
    
    // อัปเดตวิดีโอถ้ามี
    if (clipVideoPath !== null) {
      // ถ้าเป็น URL ต้องตรวจสอบว่าเป็นรูปแบบที่ถูกต้อง
      if (typeof clipVideoPath === 'string' && !clipVideoPath.startsWith('uploads/')) {
        const videoUrl = sanitizeHTML(clipVideoPath);
        // ตรวจสอบว่าเป็น URL ของ YouTube, TikTok หรือ Facebook
        const isValidVideoUrl = 
          /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|tiktok\.com|facebook\.com|fb\.watch)/.test(videoUrl);
          
        if (isValidVideoUrl || videoUrl === "") {
          updateFields.push("clip_video = ?");
          updateParams.push(videoUrl);
        } else {
          console.warn(`Invalid video URL format: ${videoUrl}`);
        }
      } else {
        // ถ้าเป็นไฟล์ ให้ใส่ path ลงไปได้เลย
        updateFields.push("clip_video = ?");
        updateParams.push(clipVideoPath);
      }
    }
    
    // อัปเดตรูปภาพถ้ามี
    if (imagePath !== null) {
      updateFields.push("image = ?");
      updateParams.push(imagePath);
    }

    // เพิ่ม project ID
    updateParams.push(projectId);

    if (updateFields.length > 0) {
      const updateQuery = `
        UPDATE courseworks
        SET ${updateFields.join(", ")}
        WHERE project_id = ?
      `;

      await connection.execute(updateQuery, updateParams);
      console.log("Updated existing coursework record:", { updateFields, updateParams });
    }
  } else {
    // สร้างข้อมูลใหม่
    await connection.execute(
      `
      INSERT INTO courseworks (
        project_id,
        poster,
        clip_video,
        image
      ) VALUES (?, ?, ?, ?)
    `,
      [
        projectId,
        posterPath,
        clipVideoPath,
        imagePath,
      ]
    );
    console.log("Created new coursework record");
  }
}

/**
 * ลบโครงการ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteProject = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const projectId = req.params.projectId;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // ดึงข้อมูลโครงการเพื่อตรวจสอบความเป็นเจ้าของและประเภทโครงการ
    const [projects] = await connection.execute(
      `SELECT * FROM projects WHERE project_id = ?`,
      [projectId]
    );

    if (projects.length === 0) {
      return notFoundResponse(res, "Project not found");
    }

    const project = projects[0];

    // ตรวจสอบสิทธิ์ในการลบ
    if (req.user.id != project.user_id && req.user.role !== "admin") {
      return forbiddenResponse(res, "You can only delete your own projects");
    }

    // เตรียมรายการไฟล์ที่จะลบ
    let filesToDelete = [];

    // ดึงข้อมูลไฟล์ตามประเภทโครงการ
    if (project.type === PROJECT_TYPES.ACADEMIC) {
      const [academicData] = await connection.execute(
        `SELECT paper_file FROM academic_papers WHERE project_id = ?`,
        [projectId]
      );
      if (academicData.length > 0 && academicData[0].paper_file) {
        filesToDelete.push(academicData[0].paper_file);
      }
    } else if (project.type === PROJECT_TYPES.COMPETITION) {
      const [competitionData] = await connection.execute(
        `SELECT poster FROM competitions WHERE project_id = ?`,
        [projectId]
      );
      if (competitionData.length > 0 && competitionData[0].poster) {
        filesToDelete.push(competitionData[0].poster);
      }
    } else if (project.type === PROJECT_TYPES.COURSEWORK) {
      const [courseworkData] = await connection.execute(
        `SELECT poster, clip_video, image FROM courseworks WHERE project_id = ?`,
        [projectId]
      );
      if (courseworkData.length > 0) {
        if (courseworkData[0].poster) filesToDelete.push(courseworkData[0].poster);
        // ตรวจสอบว่า clip_video เป็นไฟล์ในระบบ (ไม่ใช่ URL ภายนอก)
        if (courseworkData[0].clip_video && courseworkData[0].clip_video.startsWith('uploads/')) {
          filesToDelete.push(courseworkData[0].clip_video);
        }
        if (courseworkData[0].image) filesToDelete.push(courseworkData[0].image);
      }
    }

    console.log("Files to delete:", filesToDelete);

    // บันทึกการลบในประวัติก่อนลบจริง
    await notificationService.logProjectChange(
      projectId,
      'deleted',
      'entire_project',
      { 
        project_data: { ...project },
        files_to_delete: filesToDelete
      },
      null,
      req.user.id,
      'User deleted project',
      ipAddress,
      userAgent
    );

    // เริ่มต้น transaction
    await connection.beginTransaction();

    try {
      // ลบข้อมูลที่เกี่ยวข้องตามลำดับเพื่อหลีกเลี่ยงปัญหา foreign key constraints

      // 1. ลบข้อมูลเฉพาะประเภทก่อน
      if (project.type === PROJECT_TYPES.ACADEMIC) {
        await connection.execute(
          `DELETE FROM academic_papers WHERE project_id = ?`,
          [projectId]
        );
        console.log("Deleted academic paper data");
      } else if (project.type === PROJECT_TYPES.COMPETITION) {
        await connection.execute(
          `DELETE FROM competitions WHERE project_id = ?`,
          [projectId]
        );
        console.log("Deleted competition data");
      } else if (project.type === PROJECT_TYPES.COURSEWORK) {
        await connection.execute(
          `DELETE FROM courseworks WHERE project_id = ?`,
          [projectId]
        );
        console.log("Deleted coursework data");
      }

      // 2. ลบข้อมูลกลุ่มโครงการ (ผู้ร่วมงาน)
      const [projectGroupResult] = await connection.execute(
        `DELETE FROM project_groups WHERE project_id = ?`,
        [projectId]
      );
      console.log(`Deleted ${projectGroupResult.affectedRows} project group records`);

      // 3. ลบข้อมูลการเข้าชม
      const [viewsResult] = await connection.execute(
        `DELETE FROM visitor_views WHERE project_id = ?`,
        [projectId]
      );
      console.log(`Deleted ${viewsResult.affectedRows} visitor view records`);

      // 4. ลบข้อมูลการตรวจสอบ
      const [reviewsResult] = await connection.execute(
        `DELETE FROM project_reviews WHERE project_id = ?`,
        [projectId]
      );
      console.log(`Deleted ${reviewsResult.affectedRows} project review records`);

      // 5. ลบข้อมูลการแจ้งเตือนที่เกี่ยวข้อง (ถ้ามี)
      try {
        const [notificationsResult] = await connection.execute(
          `DELETE FROM notifications WHERE JSON_EXTRACT(data, '$.projectId') = ?`,
          [projectId]
        );
        console.log(`Deleted ${notificationsResult.affectedRows} related notifications`);
      } catch (notifError) {
        // ข้ามถ้ามีปัญหาในการลบการแจ้งเตือน
        console.warn("Could not delete related notifications:", notifError.message);
      }

      // 6. ลบข้อมูล upload sessions ที่เกี่ยวข้อง (ถ้ามี)
      try {
        const [sessionsResult] = await connection.execute(
          `DELETE FROM upload_sessions WHERE project_id = ?`,
          [projectId]
        );
        console.log(`Deleted ${sessionsResult.affectedRows} upload session records`);
      } catch (sessError) {
        // ข้ามถ้ามีปัญหาในการลบข้อมูล upload sessions
        console.warn("Could not delete related upload sessions:", sessError.message);
      }

      // 7. ลบการเปลี่ยนแปลงที่เกี่ยวข้อง (เก็บประวัติการลบไว้)
      // หมายเหตุ: เราไม่ลบ project_changes เพื่อเก็บประวัติการลบไว้
      console.log("Keeping project_changes for historical record");

      // 8. ลบข้อมูลโครงการหลัก
      await connection.execute(
        `DELETE FROM projects WHERE project_id = ?`,
        [projectId]
      );
      console.log("Deleted main project record");

      // Commit transaction
      await connection.commit();
      console.log("Transaction committed successfully");

      // ลบไฟล์กายภาพหลังจาก transaction สำเร็จ
      const deletedFiles = [];
      for (const filePath of filesToDelete) {
        try {
          if (filePath && filePath.startsWith('uploads/')) {
            await fs.promises.unlink(filePath);
            deletedFiles.push(filePath);
            console.log(`Successfully deleted file: ${filePath}`);
          }
        } catch (fileError) {
          console.error(`Error deleting file ${filePath}:`, fileError);
          // ไม่ให้การลบไฟล์ล้มเหลวทำให้การลบโครงการล้มเหลว
        }
      }
      console.log(`Deleted ${deletedFiles.length} physical files`);

      // บันทึกการลบไฟล์ในประวัติ (หลังจากลบเสร็จแล้ว)
      if (deletedFiles.length > 0) {
        await notificationService.logProjectChange(
          projectId,
          'deleted',
          'physical_files',
          filesToDelete,
          deletedFiles,
          req.user.id,
          `Successfully deleted ${deletedFiles.length} files`,
          ipAddress,
          userAgent
        );
      }

      return res.json(
        successResponse(
          {
            projectId,
            deletedFiles,
            projectTitle: project.title,
            message: "Project and all associated data have been successfully deleted"
          },
          "Project deleted successfully"
        )
      );

    } catch (trxError) {
      // Rollback ในกรณีที่เกิดข้อผิดพลาดระหว่าง transaction
      await connection.rollback();
      console.error("Transaction error during delete:", trxError);
      
      throw trxError;
    }

  } catch (error) {
    console.error("Delete project error:", error);
    logger.error(`Error deleting project ${req.params.projectId}:`, error);
    return handleServerError(res, error);
  } finally {
    connection.release();
  }
};
