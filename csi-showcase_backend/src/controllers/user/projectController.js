// controllers/user/projectController.js
const pool = require("../../config/database.js");
const logger = require("../../config/logger.js");
const fs = require('fs');
const {
  successResponse,
  handleServerError,
  notFoundResponse,
  forbiddenResponse,
  validationErrorResponse,
} = require("../../utils/responseFormatter.js");
const {
  PROJECT_STATUSES,
  PROJECT_TYPES,
  isValidStatus,
  isValidType,
} = require("../../constants/projectStatuses.js");
const { getPaginationParams } = require("../../constants/pagination.js");
const { STATUS_CODES } = require("../../constants/statusCodes.js");
const storageService = require("../../services/storageService.js");
const projectService = require("../../services/projectService.js");
const notificationService = require("../../services/notificationService.js");
const { sanitizeHTML } = require("../../utils/validationHelper.js");
const { truncateText } = require("../../utils/stringHelper.js");

// Fallback non-blocking logger for project_changes when no request-scoped queue is available
function queueLogChange(...args) {
  try {
    setImmediate(() => {
      notificationService.logProjectChange(...args).catch((e) => {
        logger.error('Error logging project change (fallback):', e);
      });
    });
  } catch (e) {
    logger.warn('queueLogChange fallback failed:', e);
  }
}
/**
 * ดึงข้อมูลโครงการทั้งหมดที่ได้รับการอนุมัติแล้ว
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllProjects = async (req, res) => {
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
      collaborators: project.collaborators || [], // เพิ่มข้อมูลผู้ร่วมโครงการ
      projectLink: `/projects/${project.project_id}`,
      viewsCount: project.views_count || 0,
      createdAt: project.created_at,
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

const getTop9Projects = async (req, res) => {
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
          memberData.userId = collab.user_id;
          memberData.username = collab.username;
          memberData.fullName = collab.full_name;
          memberData.image = collab.image;
        } else {
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
const getLatestProjects = async (req, res) => {
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
          memberData.userId = collab.user_id;
          memberData.username = collab.username;
          memberData.fullName = collab.full_name;
          memberData.image = collab.image;
        } else {
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
const getMyProjects = async (req, res) => {
  try {
    const userId = req.params.user_id;

    if (req.user.id != userId && req.user.role !== "admin") {
      return forbiddenResponse(res, "You can only view your own projects");
    }

    // Normalize duplicated query params (caused by both query string and axios params)
    const pickOne = (v) => {
      if (Array.isArray(v)) return v[0] ?? null;
      if (v && typeof v === 'object') {
        // common shapes when axios sends both query and params
        return v.value ?? v.keyword ?? v.status ?? v.category ?? v.level ?? v.year ?? null;
      }
      return v ?? null;
    };

    const qStatus = pickOne(req.query.status);
    const qCategory = pickOne(req.query.category);
    const qYear = pickOne(req.query.year);
    const qLevel = pickOne(req.query.level);
    const qKeyword = pickOne(req.query.keyword);

    const filters = {
      userId: userId,
      onlyOwned: true, // Only show projects where the user is the owner, not just a contributor
      status: qStatus || null,                    // pending | approved | rejected
      type: qCategory || null,                    // coursework | competition | academic
      year: qYear ? parseInt(qYear, 10) || null : null,         // academic year
      studyYear: qLevel ? parseInt(qLevel, 10) || null : null,  // student study year
      search: typeof qKeyword === 'string' ? qKeyword : null    // text search (title/description)
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
      collaborators: project.collaborators || [], // เพิ่มข้อมูลผู้ร่วมโครงการ
      projectLink: `/projects/${project.project_id}`,
      viewsCount: project.views_count || 0,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    }));

    // Defensive in-memory re-filter to ensure status and category are applied
    const page = parseInt(req.query.page) || pagination.page || 1;
    const limit = parseInt(req.query.limit) || pagination.limit || 10;

    const fStatus = qStatus ? String(qStatus).toLowerCase() : null;
    const fType = qCategory ? String(qCategory).toLowerCase() : null;

    const filtered = formattedProjects.filter(p => {
      const typeOk = !fType || (p.category && String(p.category).toLowerCase() === fType);
      const statusOk = !fStatus || (p.status && String(p.status).toLowerCase() === fStatus);
      return typeOk && statusOk;
    });

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return res.json(
      successResponse(
        {
          projects: paginated,
          pagination: {
            page,
            limit,
            totalItems,
            totalPages
          },
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
const getProjectDetails = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const viewerId = req.user ? req.user.id : null;

    const isAdminClient = req.user && req.user.role === "admin";
    const isAdminFE = String(req.headers['x-admin-client'] || '').toLowerCase() === 'true' || String(req.headers['x-admin-client'] || '') === '1';
    const options = {
      includeReviews: isAdminClient,
      recordView: !(isAdminClient || isAdminFE), // Do not count Admin FE views (any role)
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
      files: project.files || [],
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
const uploadProject = async (req, res) => {
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
    let courseworkImageFiles = [];
    let courseworkDocumentFiles = [];
    let competitionImageFiles = [];
    let competitionDocumentFiles = [];
    let paperImageFiles = [];
    let additionalFiles = [];
    let generalImageFiles = [];
    let galleryImageFiles = [];

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
      if (req.files.courseworkImage && req.files.courseworkImage.length > 0) {
        courseworkImageFiles = req.files.courseworkImage;
        imagePath = courseworkImageFiles[0].path;
        console.log("Found courseworkImage files in req.files:", courseworkImageFiles.length, "primary:", imagePath);
      }
      if (req.files.courseworkFiles && req.files.courseworkFiles.length > 0) {
        courseworkDocumentFiles = req.files.courseworkFiles;
        console.log("Found courseworkFiles in req.files:", courseworkDocumentFiles.length);
      }
      if (req.files.competitionImage && req.files.competitionImage.length > 0) {
        competitionImageFiles = req.files.competitionImage;
        console.log("Found competitionImage files in req.files:", competitionImageFiles.length);
      }
      if (req.files.competitionFiles && req.files.competitionFiles.length > 0) {
        competitionDocumentFiles = req.files.competitionFiles;
        console.log("Found competitionFiles in req.files:", competitionDocumentFiles.length);
      }
      if (req.files.paperImage && req.files.paperImage.length > 0) {
        paperImageFiles = req.files.paperImage;
        console.log("Found paperImage files in req.files:", paperImageFiles.length);
      }
      if (req.files.additionalFiles && req.files.additionalFiles.length > 0) {
        additionalFiles = req.files.additionalFiles;
        console.log("Found additionalFiles in req.files:", additionalFiles.length);
      }
      if (req.files.images && req.files.images.length > 0) {
        generalImageFiles = req.files.images;
        console.log("Found general images in req.files:", generalImageFiles.length);
      }
      if (req.files.gallery && req.files.gallery.length > 0) {
        galleryImageFiles = req.files.gallery;
        console.log("Found gallery images in req.files:", galleryImageFiles.length);
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
          const imgs = Array.isArray(req.project.files.courseworkImage)
            ? req.project.files.courseworkImage
            : [req.project.files.courseworkImage];
          courseworkImageFiles = imgs;
          imagePath = imgs[0]?.path;
          console.log("Using courseworkImage array from middleware:", imagePath, "count:", imgs.length);
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
        if (req.project.files.competitionImage && competitionImageFiles.length === 0) {
          const imgs = Array.isArray(req.project.files.competitionImage)
            ? req.project.files.competitionImage
            : [req.project.files.competitionImage];
          competitionImageFiles = imgs;
          console.log("Using competitionImage array from middleware:", imgs.length);
        }
      }
      else if (type === PROJECT_TYPES.ACADEMIC) {
        // สำหรับประเภท academic
        if (req.project.files.paperFile && !paperFilePath) {
          paperFilePath = req.project.files.paperFile.path;
          console.log("Using paperFile from middleware:", paperFilePath);
        }
        if (req.project.files.paperImage && paperImageFiles.length === 0) {
          const imgs = Array.isArray(req.project.files.paperImage)
            ? req.project.files.paperImage
            : [req.project.files.paperImage];
          paperImageFiles = imgs;
          console.log("Using paperImage array from middleware:", imgs.length);
        }
      }
      
      // จัดการไฟล์ทั่วไป
      if (req.project.files.images && generalImageFiles.length === 0) {
        const imgs = Array.isArray(req.project.files.images)
          ? req.project.files.images
          : [req.project.files.images];
        generalImageFiles = imgs;
        console.log("Using general images array from middleware:", imgs.length);
      }
      
      if (req.project.files.gallery && galleryImageFiles.length === 0) {
        const imgs = Array.isArray(req.project.files.gallery)
          ? req.project.files.gallery
          : [req.project.files.gallery];
        galleryImageFiles = imgs;
        console.log("Using gallery images array from middleware:", imgs.length);
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

    // เพิ่มเจ้าของโปรเจคเป็น owner ในตาราง project_groups ก่อน
    console.log("=== ADDING PROJECT OWNER ===");
    try {
      await connection.execute(
        `INSERT INTO project_groups (project_id, user_id, role) VALUES (?, ?, ?)`,
        [projectId, userId, "owner"]
      );
      console.log(`✅ Successfully added project owner: ${userId} as owner`);
    } catch (ownerError) {
      console.error("❌ Error adding project owner:", ownerError);
      throw ownerError; // ถ้าเพิ่ม owner ไม่ได้ให้หยุดทั้งกระบวนการ
    }

    // เพิ่มข้อมูลผู้ร่วมงาน (contributors) ถ้ามี - รองรับการเพิ่มสมาชิกที่ไม่มีในฐานข้อมูล
    console.log("=== CONTRIBUTOR PROCESSING START ===");
    console.log("Original contributors data:", projectData.contributors);
    console.log("Type of contributors:", typeof projectData.contributors);
    
    let contributors = projectData.contributors;
    if (typeof contributors === 'string') {
      try {
        contributors = JSON.parse(contributors);
        console.log("Parsed contributors from JSON:", contributors);
      } catch (e) {
        console.error("Failed to parse contributors JSON:", e);
        contributors = [];
      }
    }

    // ตรวจสอบว่า contributors เป็น array หรือไม่
    if (!Array.isArray(contributors)) {
      console.log("Contributors is not an array, converting or skipping");
      contributors = [];
    }

    console.log("Final contributors array:", contributors);
    console.log("Contributors count:", contributors.length);

    if (contributors.length > 0) {
      console.log("Processing contributors...");
      let successCount = 0;
      let skipCount = 0;
      
      for (let i = 0; i < contributors.length; i++) {
        const contributor = contributors[i];
        console.log(`\n--- Processing contributor ${i + 1}/${contributors.length} ---`);
        console.log("Contributor data:", contributor);
        
        // ตรวจสอบข้อมูลพื้นฐานที่จำเป็น
        if (!contributor || (!contributor.user_id && !contributor.name)) {
          console.error(`❌ Invalid contributor ${i + 1} - missing required data:`, contributor);
          skipCount++;
          continue;
        }

        try {
          let userId = contributor.user_id;
          let insertData = {
            project_id: projectId,
            role: contributor.role || "contributor"
          };

          // กรณีที่มี user_id - ตรวจสอบว่ามีอยู่ในฐานข้อมูลหรือไม่
          if (userId) {
            const [userExists] = await connection.execute(
              `SELECT user_id FROM users WHERE user_id = ?`,
              [userId]
            );

            if (userExists.length > 0) {
              console.log(`✓ User ${userId} exists in database`);
              insertData.user_id = userId;
            } else {
              console.log(`⚠️ User ${userId} not found in database, treating as external member`);
              userId = null; // Reset เพื่อใช้ข้อมูลชื่อแทน
            }
          }

          // กรณีที่ไม่มี user_id หรือไม่พบในฐานข้อมูล - ใช้ข้อมูลชื่อ
          if (!userId) {
            insertData.member_name = contributor.name || contributor.username || contributor.full_name;
            insertData.member_student_id = contributor.student_id || contributor.user_id || null;
            insertData.member_email = contributor.email || null;
            
            if (!insertData.member_name) {
              console.error(`❌ No name provided for external contributor ${i + 1}`);
              skipCount++;
              continue;
            }
            
            console.log(`✓ Processing external contributor: ${insertData.member_name}`);
          }

          // ตรวจสอบว่าไม่ได้เพิ่มสมาชิกซ้ำ
          let duplicateCheckQuery;
          let duplicateCheckParams;
          
          if (insertData.user_id) {
            duplicateCheckQuery = `SELECT * FROM project_groups WHERE project_id = ? AND user_id = ?`;
            duplicateCheckParams = [projectId, insertData.user_id];
          } else {
            duplicateCheckQuery = `SELECT * FROM project_groups WHERE project_id = ? AND member_name = ? AND member_student_id = ?`;
            duplicateCheckParams = [projectId, insertData.member_name, insertData.member_student_id];
          }

          const [existingMember] = await connection.execute(duplicateCheckQuery, duplicateCheckParams);

          if (existingMember.length > 0) {
            console.warn(`⚠️ Member already exists in project ${projectId}`);
            skipCount++;
            continue;
          }

          // เพิ่มสมาชิกใหม่
          const insertQuery = insertData.user_id
            ? `INSERT INTO project_groups (project_id, user_id, role) VALUES (?, ?, ?)`
            : `INSERT INTO project_groups (project_id, member_name, member_student_id, member_email, role) VALUES (?, ?, ?, ?, ?)`;
          
          const insertParams = insertData.user_id
            ? [insertData.project_id, insertData.user_id, insertData.role]
            : [insertData.project_id, insertData.member_name, insertData.member_student_id, insertData.member_email, insertData.role];

          await connection.execute(insertQuery, insertParams);
          
          const memberInfo = insertData.user_id
            ? `user_id: ${insertData.user_id}`
            : `name: ${insertData.member_name}`;
          
          console.log(`✅ Successfully added contributor: ${memberInfo} with role: ${insertData.role}`);
          successCount++;
          
        } catch (insertError) {
          console.error(`❌ Error adding contributor ${i + 1}:`, insertError);
          skipCount++;
          // ไม่ให้การเพิ่ม contributor คนหนึ่งล้มเหลวทำให้ทั้งโครงการล้มเหลว
        }
      }
      
      console.log(`\n=== CONTRIBUTOR PROCESSING SUMMARY ===`);
      console.log(`Total contributors processed: ${contributors.length}`);
      console.log(`Successfully added: ${successCount}`);
      console.log(`Skipped/Failed: ${skipCount}`);
      console.log(`=== CONTRIBUTOR PROCESSING END ===\n`);
    } else {
      console.log("No contributors to process");
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
      // Build JSON array for competition additional images
      const compImagesArray = (competitionImageFiles || []).map(f => f.path);
      const compImagesJson = compImagesArray.length > 0 ? JSON.stringify(compImagesArray) : null;

      await connection.execute(
        `
        INSERT INTO competitions (
          project_id, competition_name, competition_year, poster, image
        ) VALUES (?, ?, ?, ?, ?)
      `,
        [
          projectId,
          projectData.competition_name,
          projectData.competition_year,
          posterPath, // ใช้ path จากไฟล์ที่อัปโหลด
          compImagesJson
        ]
      );
    } else if (projectData.type === PROJECT_TYPES.COURSEWORK) {
      console.log("Inserting coursework data");
      console.log("Data to insert:", {
        projectId,
        posterPath,
        clipVideoPath,
        courseworkImageCount: (courseworkImageFiles || []).length
      });
      
      // Prepare JSON array for courseworks.image
      const imagesArray = (courseworkImageFiles || []).map(f => f.path);
      const imagesJson = imagesArray.length > 0 ? JSON.stringify(imagesArray) : null;

      try {
        await connection.execute(
          `
          INSERT INTO courseworks (
            project_id, poster, clip_video, image
          ) VALUES (?, ?, ?, ?)
        `,
          [
            projectId,
            posterPath,
            clipVideoPath,
            imagesJson
          ]
        );
      } catch (e) {
        // Fallback: หากคอลัมน์ image เป็น VARCHAR และเก็บ JSON ไม่ได้ ให้เก็บเฉพาะรูปแรก
        const fallbackPrimary = (Array.isArray(imagesArray) && imagesArray.length > 0) ? imagesArray[0] : imagePath || null;
        if (e && (e.code === 'ER_DATA_TOO_LONG' || e.errno === 1406)) {
          await connection.execute(
            `
            INSERT INTO courseworks (
              project_id, poster, clip_video, image
            ) VALUES (?, ?, ?, ?)
          `,
            [
              projectId,
              posterPath,
              clipVideoPath,
              fallbackPrimary
            ]
          );
        } else {
          throw e;
        }
      }

      // Images for coursework are stored only in courseworks.image (JSON).
      // Skipping project_files persistence for coursework images.
      if (courseworkImageFiles && courseworkImageFiles.length > 0) {
        console.log("Coursework images stored in courseworks.image JSON; skip project_files");
      }

      // บันทึกไฟล์เอกสาร coursework
      if (courseworkDocumentFiles && courseworkDocumentFiles.length > 0) {
        try {
          for (const f of courseworkDocumentFiles) {
            await connection.execute(
              `
              INSERT INTO project_files (
                project_id, file_type, file_path, file_name, file_size
              ) VALUES (?, ?, ?, ?, ?)
            `,
              [projectId, 'document', f.path, f.originalname || f.filename || null, f.size || 0]
            );
          }
          console.log("Saved", courseworkDocumentFiles.length, "coursework documents to project_files");
        } catch (pfErr) {
          console.warn("Could not save coursework documents to project_files:", pfErr.message);
        }
      }
    }
    
    if (projectData.type === PROJECT_TYPES.COMPETITION) {
      // บันทึกรูปภาพ competition หลายไฟล์ลงตาราง project_files
      // Images for competition are stored only in competitions.image (JSON).
      // Skipping project_files persistence for competition images.
      if (competitionImageFiles && competitionImageFiles.length > 0) {
        console.log("Competition images stored in competitions.image JSON; skip project_files");
      }
      
      // บันทึกไฟล์เอกสาร competition
      if (competitionDocumentFiles && competitionDocumentFiles.length > 0) {
        try {
          for (const f of competitionDocumentFiles) {
            await connection.execute(
              `
              INSERT INTO project_files (
                project_id, file_type, file_path, file_name, file_size
              ) VALUES (?, ?, ?, ?, ?)
            `,
              [projectId, 'document', f.path, f.originalname || f.filename || null, f.size || 0]
            );
          }
          console.log("Saved", competitionDocumentFiles.length, "competition documents to project_files");
        } catch (pfErr) {
          console.warn("Could not save competition documents to project_files:", pfErr.message);
        }
      }
    }
    
    if (projectData.type === PROJECT_TYPES.ACADEMIC) {
      // บันทึกรูปภาพ academic paper หลายไฟล์ลงตาราง project_files
      if (paperImageFiles && paperImageFiles.length > 0) {
        try {
          for (const f of paperImageFiles) {
            await connection.execute(
              `
              INSERT INTO project_files (
                project_id, file_type, file_path, file_name, file_size
              ) VALUES (?, ?, ?, ?, ?)
            `,
              [projectId, 'image', f.path, f.originalname || f.filename || null, f.size || 0]
            );
          }
          console.log("Saved", paperImageFiles.length, "academic paper images to project_files");
        } catch (pfErr) {
          console.warn("Could not save academic paper images to project_files:", pfErr.message);
        }
      }
    }

    // บันทึกไฟล์เพิ่มเติมทั่วไป
    if (additionalFiles && additionalFiles.length > 0) {
      try {
        for (const f of additionalFiles) {
          const fileType = f.mimetype.startsWith('image/') ? 'image' : 'document';
          await connection.execute(
            `
            INSERT INTO project_files (
              project_id, file_type, file_path, file_name, file_size
            ) VALUES (?, ?, ?, ?, ?)
          `,
            [projectId, fileType, f.path, f.originalname || f.filename || null, f.size || 0]
          );
        }
        console.log("Saved", additionalFiles.length, "additional files to project_files");
      } catch (pfErr) {
        console.warn("Could not save additional files to project_files:", pfErr.message);
      }
    }

    // บันทึกรูปภาพทั่วไป
    if (generalImageFiles && generalImageFiles.length > 0) {
      try {
        for (const f of generalImageFiles) {
          await connection.execute(
            `
            INSERT INTO project_files (
              project_id, file_type, file_path, file_name, file_size
            ) VALUES (?, ?, ?, ?, ?)
          `,
            [projectId, 'image', f.path, f.originalname || f.filename || null, f.size || 0]
          );
        }
        console.log("Saved", generalImageFiles.length, "general images to project_files");
      } catch (pfErr) {
        console.warn("Could not save general images to project_files:", pfErr.message);
      }
    }

    // บันทึกรูปภาพแกลเลอรี่
    if (galleryImageFiles && galleryImageFiles.length > 0) {
      try {
        for (const f of galleryImageFiles) {
          await connection.execute(
            `
            INSERT INTO project_files (
              project_id, file_type, file_path, file_name, file_size, field_name
            ) VALUES (?, ?, ?, ?, ?, ?)
          `,
            [projectId, 'image', f.path, f.originalname || f.filename || null, f.size || 0, 'gallery']
          );
        }
        console.log("Saved", galleryImageFiles.length, "gallery images to project_files");
      } catch (pfErr) {
        console.warn("Could not save gallery images with field_name, falling back:", pfErr.message);
        for (const f of galleryImageFiles) {
          await connection.execute(
            `
            INSERT INTO project_files (
              project_id, file_type, file_path, file_name, file_size
            ) VALUES (?, ?, ?, ?, ?)
          `,
            [projectId, 'image', f.path, f.originalname || f.filename || null, f.size || 0]
          );
        }
        console.log("Saved", galleryImageFiles.length, "gallery images to project_files (fallback mode)");
      }
    }

    // Commit transaction
    await connection.commit();
    console.log("Transaction committed successfully");
// Flush queued project-change logs after commit (if any)
try {
  if (typeof postCommitLogs !== 'undefined' && Array.isArray(postCommitLogs) && postCommitLogs.length) {
    setImmediate(() => {
      try { postCommitLogs.forEach(fn => typeof fn === 'function' && fn()); } catch (e) { logger.warn('postCommitLogs flush error:', e); }
    });
  }
} catch (e) {
  logger.warn('postCommitLogs handling error:', e);
}

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
const updateProjectWithFiles = async (req, res) => {
  const connection = await pool.getConnection();
 
  try {
    const projectId = req.params.projectId;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
// Defer project change logs until after commit to avoid lock contention
const postCommitLogs = [];
const queueLogChange = (...args) => {
  try {
    postCommitLogs.push(() => notificationService.logProjectChange(...args));
  } catch (e) {
    logger.warn('Failed to queue project change log:', e);
  }
};
 
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

    // บังคับกติกาตามประเภทผลงาน - Academic รับเฉพาะ PDF เท่านั้น
    if (project.type === PROJECT_TYPES.ACADEMIC) {
      const hasInvalidFiles =
        (req.files && (
          req.files.courseworkPoster ||
          req.files.competitionPoster ||
          req.files.courseworkImage ||
          req.files.competitionImage ||
          req.files.images ||
          req.files.gallery ||
          req.files.courseworkVideo
        )) ||
        (req.projectUpdate && req.projectUpdate.files && (
          req.projectUpdate.files.courseworkPoster ||
          req.projectUpdate.files.competitionPoster ||
          (Array.isArray(req.projectUpdate.files.courseworkImage) || req.projectUpdate.files.courseworkImage) ||
          (Array.isArray(req.projectUpdate.files.competitionImage) || req.projectUpdate.files.competitionImage) ||
          req.projectUpdate.files.images ||
          req.projectUpdate.files.gallery ||
          req.projectUpdate.files.courseworkVideo
        )) ||
        (updateData.clip_video !== undefined);

      if (hasInvalidFiles) {
        await connection.rollback();
        return validationErrorResponse(res, "Academic projects accept only PDF (paperFile).");
      }
    }

    // ตัวนับเพื่อใช้ตรวจสอบว่า request นี้มีการเปลี่ยนแปลงจริงหรือไม่
    let changesCount = 0;
 
    // สร้าง query สำหรับอัปเดตเฉพาะฟิลด์ที่มี
    let updateFields = [];
    let updateParams = [];
 
    if (updateData.title !== undefined && updateData.title !== project.title) {
      updateFields.push("title = ?");
      updateParams.push(sanitizeHTML(updateData.title));
      
      // บันทึกการเปลี่ยนแปลง
      queueLogChange(
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
      queueLogChange(
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
      
      queueLogChange(
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
      
      queueLogChange(
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
      
      queueLogChange(
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
      
      queueLogChange(
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
    // หมายเหตุ: เฉพาะผู้ใช้ทั่วไปเท่านั้นที่แก้ไขแล้วต้องกลับเป็น pending
    // แอดมินแก้ไขให้สถานะคงเดิม (เช่น approved) ตามนโยบาย
    if (req.user.role !== "admin" && project.status !== PROJECT_STATUSES.PENDING) {
      updateFields.push("status = ?");
      updateParams.push(PROJECT_STATUSES.PENDING);

      queueLogChange(
        projectId,
        'updated',
        'status',
        project.status,
        PROJECT_STATUSES.PENDING,
        req.user.id,
        'Status changed to pending after user (non-admin) update',
        ipAddress,
        userAgent
      );
    }
 
    // อัปเดตเวลาการแก้ไข (เฉพาะเมื่อมีการเปลี่ยนแปลง)
    if (updateFields.length > 0) {
      updateFields.push("updated_at = NOW()");
    }
    
    // เพิ่ม project ID เข้าไปใน parameters
    updateParams.push(projectId);
    
    // อัปเดตข้อมูลโครงการหลัก
    if (updateFields.length > 0) {
      changesCount += updateFields.length;
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
        `SELECT poster, image FROM competitions WHERE project_id = ?`,
        [projectId]
      );
      if (competitionData.length > 0) {
        oldFiles.competitionPoster = competitionData[0].poster;
        // Parse competition existing images (JSON array or single string)
        try {
          const imgVal = competitionData[0].image;
          if (Array.isArray(imgVal)) {
            oldFiles.competitionImages = imgVal;
          } else if (typeof imgVal === 'string' && imgVal.trim().length > 0) {
            const parsed = JSON.parse(imgVal);
            oldFiles.competitionImages = Array.isArray(parsed) ? parsed : [imgVal];
          } else {
            oldFiles.competitionImages = [];
          }
        } catch (_) {
          oldFiles.competitionImages = competitionData[0].image ? [competitionData[0].image] : [];
        }
      }
    } else if (project.type === PROJECT_TYPES.COURSEWORK) {
      const [courseworkData] = await connection.execute(
        `SELECT poster, clip_video, image FROM courseworks WHERE project_id = ?`,
        [projectId]
      );
      if (courseworkData.length > 0) {
        oldFiles.courseworkPoster = courseworkData[0].poster;
        oldFiles.clipVideoPath = courseworkData[0].clip_video;
        // Parse image JSON array (backward compatible with string)
        try {
          const imgVal = courseworkData[0].image;
          if (Array.isArray(imgVal)) {
            oldFiles.courseworkImages = imgVal;
          } else if (typeof imgVal === 'string' && imgVal.trim().length > 0) {
            const parsed = JSON.parse(imgVal);
            oldFiles.courseworkImages = Array.isArray(parsed) ? parsed : [imgVal];
          } else {
            oldFiles.courseworkImages = [];
          }
        } catch (e) {
          oldFiles.courseworkImages = courseworkData[0].image ? [courseworkData[0].image] : [];
        }
      }
    }
    
    console.log("Old files before update:", oldFiles);
    
    // ประกาศตัวแปรสำหรับเก็บ path ของไฟล์ใหม่
    let paperFilePath = null;
    let posterPath = null;
    let clipVideoPath = null;
    let imagePath = null;
    let newCourseworkImageFiles = [];
    let newCompetitionImageFiles = [];
    let newPaperImageFiles = [];
    let newGeneralImageFiles = [];
    let newGalleryImageFiles = [];
    
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
        queueLogChange(
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
        
        queueLogChange(
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
        
        queueLogChange(
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
      if (req.files.courseworkImage && req.files.courseworkImage.length > 0) {
        newCourseworkImageFiles = req.files.courseworkImage;
        imagePath = newCourseworkImageFiles[0].path;
        console.log("Found courseworkImage files in req.files:", newCourseworkImageFiles.length, "primary:", imagePath);
        
        queueLogChange(
          projectId,
          'updated',
          'coursework_images',
          oldFiles.courseworkImages || [],
          newCourseworkImageFiles.map(f => f.path),
          req.user.id,
          'User uploaded additional coursework image(s)',
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
        
        queueLogChange(
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
        
        queueLogChange(
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
        
        queueLogChange(
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
        
        queueLogChange(
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
        const imgs = Array.isArray(req.projectUpdate.files.courseworkImage)
          ? req.projectUpdate.files.courseworkImage
          : [req.projectUpdate.files.courseworkImage];
        newCourseworkImageFiles = imgs;
        imagePath = imgs[0]?.path;
        console.log("Using courseworkImage array from middleware:", imagePath, "count:", imgs.length);
        
        queueLogChange(
          projectId,
          'updated',
          'coursework_images',
          oldFiles.courseworkImages || [],
          imgs.map(f => f.path),
          req.user.id,
          'User uploaded additional coursework image(s) via middleware',
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
        
        queueLogChange(
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
      
      // จัดการไฟล์รูปภาพเพิ่มเติมจาก middleware
      if (req.projectUpdate.files.competitionImage && newCompetitionImageFiles.length === 0) {
        const imgs = Array.isArray(req.projectUpdate.files.competitionImage)
          ? req.projectUpdate.files.competitionImage
          : [req.projectUpdate.files.competitionImage];
        newCompetitionImageFiles = imgs;
        console.log("Using competitionImage array from middleware:", imgs.length);
      }
      
      if (req.projectUpdate.files.paperImage && newPaperImageFiles.length === 0) {
        const imgs = Array.isArray(req.projectUpdate.files.paperImage)
          ? req.projectUpdate.files.paperImage
          : [req.projectUpdate.files.paperImage];
        newPaperImageFiles = imgs;
        console.log("Using paperImage array from middleware:", imgs.length);
      }
      
      if (req.projectUpdate.files.images && newGeneralImageFiles.length === 0) {
        const imgs = Array.isArray(req.projectUpdate.files.images)
          ? req.projectUpdate.files.images
          : [req.projectUpdate.files.images];
        newGeneralImageFiles = imgs;
        console.log("Using general images array from middleware:", imgs.length);
      }
      
      if (req.projectUpdate.files.gallery && newGalleryImageFiles.length === 0) {
        const imgs = Array.isArray(req.projectUpdate.files.gallery)
          ? req.projectUpdate.files.gallery
          : [req.projectUpdate.files.gallery];
        newGalleryImageFiles = imgs;
        console.log("Using gallery images array from middleware:", imgs.length);
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
        
        queueLogChange(
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
        
        queueLogChange(
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
        
        queueLogChange(
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
        
        queueLogChange(
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

    // คำนวณจำนวนการเปลี่ยนแปลงจากไฟล์/แฟล็กต่างๆ
    if (paperFilePath !== null) changesCount++;
    if (posterPath !== null) changesCount++;
    if (clipVideoPath !== null || (updateData.clip_video !== undefined && updateData.clip_video !== oldFiles.clipVideoPath)) changesCount++;
    if ((Array.isArray(newCourseworkImageFiles) && newCourseworkImageFiles.length > 0) ||
        (String(updateData.replace_existing_images || updateData.replace_images || '').toLowerCase() === 'true')) {
      changesCount++;
    }
    if (Array.isArray(newCompetitionImageFiles) && newCompetitionImageFiles.length > 0) {
      changesCount++;
    }
 
    // Update contributors if provided
    if (updateData.contributors !== undefined && updateData.contributors !== '') {
      try {
        // ดึงข้อมูล contributors เดิม
        const [oldContributors] = await connection.execute(
          `SELECT user_id, role FROM project_groups WHERE project_id = ?`,
          [projectId]
        );
        
        // Delete existing contributors (keep owner row intact)
        await connection.execute(
          `DELETE FROM project_groups WHERE project_id = ? AND role != 'owner'`,
          [projectId]
        );
        console.log("Deleted existing non-owner contributors");
 
        // Add new contributors only if contributors is not empty
        let newContributors = [];
        if (updateData.contributors.trim()) {
          const contributors = JSON.parse(updateData.contributors);
          
          if (Array.isArray(contributors) && contributors.length > 0) {
            console.log("Adding new contributors:", contributors);
            
            // ตรวจสอบความถูกต้องของข้อมูล contributors ก่อนการ insert - รองรับทั้งสมาชิกที่ลงทะเบียนและภายนอก
            for (let i = 0; i < contributors.length; i++) {
              const contributor = contributors[i];
              console.log(`\n--- Processing contributor ${i + 1}/${contributors.length} ---`);
              console.log("Contributor data:", contributor);
              
              // ตรวจสอบข้อมูลพื้นฐานที่จำเป็น
              if (!contributor || (!contributor.user_id && !contributor.name)) {
                console.error(`❌ Invalid contributor ${i + 1} - missing required data:`, contributor);
                continue;
              }

              try {
                let userId = contributor.user_id;
                let insertData = {
                  project_id: projectId,
                  role: contributor.role || "contributor"
                };

                // กรณีที่มี user_id - ตรวจสอบว่ามีอยู่ในฐานข้อมูลหรือไม่
                if (userId) {
                  const [userExists] = await connection.execute(
                    `SELECT user_id FROM users WHERE user_id = ?`,
                    [userId]
                  );

                  if (userExists.length > 0) {
                    console.log(`✓ User ${userId} exists in database`);
                    insertData.user_id = userId;
                  } else {
                    console.log(`⚠️ User ${userId} not found in database, treating as external member`);
                    userId = null; // Reset เพื่อใช้ข้อมูลชื่อแทน
                  }
                }

                // กรณีที่ไม่มี user_id หรือไม่พบในฐานข้อมูล - ใช้ข้อมูลชื่อ
                if (!userId) {
                  insertData.member_name = contributor.name || contributor.username || contributor.full_name;
                  insertData.member_student_id = contributor.student_id || contributor.user_id || null;
                  insertData.member_email = contributor.email || null;
                  
                  if (!insertData.member_name) {
                    console.error(`❌ No name provided for external contributor ${i + 1}`);
                    continue;
                  }
                  
                  console.log(`✓ Processing external contributor: ${insertData.member_name}`);
                }

                // ตรวจสอบว่าไม่ได้เพิ่มสมาชิกซ้ำ
                let duplicateCheckQuery;
                let duplicateCheckParams;
                
                if (insertData.user_id) {
                  duplicateCheckQuery = `SELECT * FROM project_groups WHERE project_id = ? AND user_id = ?`;
                  duplicateCheckParams = [projectId, insertData.user_id];
                } else {
                  duplicateCheckQuery = `SELECT * FROM project_groups WHERE project_id = ? AND member_name = ? AND member_student_id = ?`;
                  duplicateCheckParams = [projectId, insertData.member_name, insertData.member_student_id];
                }

                const [existingMember] = await connection.execute(duplicateCheckQuery, duplicateCheckParams);

                if (existingMember.length > 0) {
                  console.warn(`⚠️ Member already exists in project ${projectId}`);
                  continue;
                }

                // เพิ่มสมาชิกใหม่
                const insertQuery = insertData.user_id
                  ? `INSERT INTO project_groups (project_id, user_id, role) VALUES (?, ?, ?)`
                  : `INSERT INTO project_groups (project_id, member_name, member_student_id, member_email, role) VALUES (?, ?, ?, ?, ?)`;
                
                const insertParams = insertData.user_id
                  ? [insertData.project_id, insertData.user_id, insertData.role]
                  : [insertData.project_id, insertData.member_name, insertData.member_student_id, insertData.member_email, insertData.role];

                await connection.execute(insertQuery, insertParams);
                
                const memberInfo = insertData.user_id
                  ? `user_id: ${insertData.user_id}`
                  : `name: ${insertData.member_name}`;
                
                console.log(`✅ Successfully updated contributor: ${memberInfo} with role: ${insertData.role}`);
                newContributors.push(contributor);
                
              } catch (insertError) {
                console.error(`❌ Error adding contributor ${i + 1}:`, insertError);
                // ไม่ให้การเพิ่ม contributor คนหนึ่งล้มเหลวทำให้การอัปเดตล้มเหลว
              }
            }
          }
        }
        
        // บันทึกการเปลี่ยนแปลง contributors
        queueLogChange(
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
 
    // เพิ่มนับการเปลี่ยนแปลงหากมีการส่ง contributors มา (รวมถึงเคสลบ/แทนที่สมาชิก)
    if (updateData.contributors !== undefined) {
      changesCount++;
    }

    // No-op guard: ไม่มีข้อมูลที่เปลี่ยนแปลงจริง
    if (changesCount === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'No changes to update'
      });
    }

    // อัปเดตข้อมูลตามประเภทโปรเจกต์
    if (project.type === PROJECT_TYPES.ACADEMIC) {
      await updateAcademicDataWithFiles(connection, projectId, updateData, project.year, paperFilePath);
    } else if (project.type === PROJECT_TYPES.COMPETITION) {
      // Combine existing JSON images with new uploads (or replace)
      const newCompPaths = (newCompetitionImageFiles || []).map(f => f.path);
      const replaceFlagComp = String(updateData.replace_existing_images || updateData.replace_images || '').toLowerCase();
      const shouldReplaceComp = replaceFlagComp === 'true' || replaceFlagComp === '1';
      const existingCompImages = Array.isArray(oldFiles.competitionImages) ? oldFiles.competitionImages : [];
      let compImagesArray = [];
      if (shouldReplaceComp) {
        compImagesArray = newCompPaths;
      } else {
        const set = new Set(existingCompImages);
        newCompPaths.forEach(p => set.add(p));
        compImagesArray = Array.from(set);
      }

      await updateCompetitionDataWithFiles(connection, projectId, updateData, project.year, posterPath, compImagesArray);
    } else if (project.type === PROJECT_TYPES.COURSEWORK) {
      // Combine existing JSON images with new uploads (or replace)
      const newPaths = (newCourseworkImageFiles || []).map(f => f.path);
      const replaceFlag = String(updateData.replace_existing_images || updateData.replace_images || '').toLowerCase();
      const shouldReplace = replaceFlag === 'true' || replaceFlag === '1';
      const existingImages = Array.isArray(oldFiles.courseworkImages) ? oldFiles.courseworkImages : [];
      let imagesArray = [];
      if (shouldReplace) {
        imagesArray = newPaths;
      } else {
        const set = new Set(existingImages);
        newPaths.forEach(p => set.add(p));
        imagesArray = Array.from(set);
      }

      await updateCourseworkDataWithFiles(connection, projectId, updateData, posterPath, clipVideoPath, imagesArray);

      // Images for coursework are stored only in courseworks.image (JSON).
      // Skipping project_files persistence for coursework images on update.
      if (newCourseworkImageFiles && newCourseworkImageFiles.length > 0) {
        console.log("Coursework images updated in courseworks.image JSON; skip project_files");
      }
    }
 
    // Commit transaction
    await connection.commit();
    console.log("Transaction committed successfully");
// Flush queued project-change logs after commit (if any)
try {
  if (typeof postCommitLogs !== 'undefined' && Array.isArray(postCommitLogs) && postCommitLogs.length) {
    setImmediate(() => {
      try { postCommitLogs.forEach(fn => typeof fn === 'function' && fn()); } catch (e) { logger.warn('postCommitLogs flush error:', e); }
    });
  }
} catch (e) {
  logger.warn('postCommitLogs handling error:', e);
}
 
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
async function updateCompetitionDataWithFiles(connection, projectId, updateData, defaultYear, posterPath, imagesArray) {
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

    // อัปเดตรูปภาพ (JSON array) ถ้ามี
    if (Array.isArray(imagesArray)) {
      updateFields.push("image = ?");
      updateParams.push(imagesArray.length > 0 ? JSON.stringify(imagesArray) : null);
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
        poster,
        image
      ) VALUES (?, ?, ?, ?, ?)
    `,
      [
        projectId,
        sanitizeHTML(updateData.competition_name || ""),
        updateData.competition_year || defaultYear,
        posterPath,
        (Array.isArray(imagesArray) && imagesArray.length > 0) ? JSON.stringify(imagesArray) : null
      ]
    );
    console.log("Created new competition record");
  }
}

/**
 * อัปเดตข้อมูลผลงานการเรียนพร้อมไฟล์
 */
async function updateCourseworkDataWithFiles(connection, projectId, updateData, posterPath, clipVideoPath, imagesArray) {
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
    
    // อัปเดตรูปภาพ (JSON array) ถ้ามี
    if (Array.isArray(imagesArray)) {
      updateFields.push("image = ?");
      updateParams.push(imagesArray.length > 0 ? JSON.stringify(imagesArray) : null);
    }

    // เพิ่ม project ID
    updateParams.push(projectId);

    if (updateFields.length > 0) {
      const updateQuery = `
        UPDATE courseworks
        SET ${updateFields.join(", ")}
        WHERE project_id = ?
      `;

      try {
        await connection.execute(updateQuery, updateParams);
        console.log("Updated existing coursework record:", { updateFields, updateParams });
      } catch (e) {
        const errCode = e && (e.code || '');
        if ((errCode === 'ER_DATA_TOO_LONG' || e.errno === 1406)) {
          // Fallback: ลด image เป็น path เดี่ยว
          const idx = updateFields.findIndex(f => f.trim().startsWith('image ='));
          if (idx !== -1) {
            const fallbackPrimary = (Array.isArray(imagesArray) && imagesArray.length > 0) ? imagesArray[0] : null;
            const newParams = [...updateParams];
            // image param อยู่ที่ index เดียวกับ updateFields
            newParams[idx] = fallbackPrimary;
            await connection.execute(updateQuery, newParams);
            console.log("Updated coursework with fallback image (single path) due to column size limit");
          } else {
            throw e;
          }
        } else {
          throw e;
        }
      }
    }
  } else {
    // สร้างข้อมูลใหม่
    try {
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
          Array.isArray(imagesArray) && imagesArray.length > 0 ? JSON.stringify(imagesArray) : null,
        ]
      );
      console.log("Created new coursework record");
    } catch (e) {
      if (e && (e.code === 'ER_DATA_TOO_LONG' || e.errno === 1406)) {
        const fallbackPrimary = (Array.isArray(imagesArray) && imagesArray.length > 0) ? imagesArray[0] : null;
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
            fallbackPrimary,
          ]
        );
        console.log("Created new coursework record with fallback image (single path)");
      } else {
        throw e;
      }
    }
  }
}

/**
 * ลบโครงการ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteProject = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const projectId = req.params.projectId;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
// Defer project change logs until after commit to avoid lock contention
const postCommitLogs = [];
const queueLogChange = (...args) => {
  try {
    postCommitLogs.push(() => notificationService.logProjectChange(...args));
  } catch (e) {
    logger.warn('Failed to queue project change log:', e);
  }
};

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

    // นโยบายการลบ:
    // - ผู้ใช้ที่ไม่ใช่แอดมิน (เจ้าของผลงาน) สามารถลบได้เฉพาะสถานะ pending หรือ rejected เท่านั้น
    // - แอดมินสามารถลบได้ทุกสถานะ
    if (req.user.role !== "admin") {
      if (project.status === PROJECT_STATUSES.APPROVED) {
        return forbiddenResponse(res, "Approved projects can only be deleted by admin");
      }
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
        // รองรับกรณีที่ image เป็น JSON array หรือ path เดี่ยว
        const imgVal = courseworkData[0].image;
        try {
          if (Array.isArray(imgVal)) {
            imgVal.forEach(p => {
              if (typeof p === 'string' && p) filesToDelete.push(p);
            });
          } else if (typeof imgVal === 'string' && imgVal.trim().length > 0) {
            const parsed = JSON.parse(imgVal);
            if (Array.isArray(parsed)) {
              parsed.forEach(p => {
                if (typeof p === 'string' && p) filesToDelete.push(p);
              });
            } else {
              filesToDelete.push(imgVal);
            }
          }
        } catch (e) {
          if (typeof imgVal === 'string' && imgVal) filesToDelete.push(imgVal);
        }
      }
    }

    console.log("Files to delete:", filesToDelete);

    // บันทึกการลบในประวัติก่อนลบจริง
    queueLogChange(
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
// Flush queued project-change logs after commit (if any)
try {
  if (typeof postCommitLogs !== 'undefined' && Array.isArray(postCommitLogs) && postCommitLogs.length) {
    setImmediate(() => {
      try { postCommitLogs.forEach(fn => typeof fn === 'function' && fn()); } catch (e) { logger.warn('postCommitLogs flush error:', e); }
    });
  }
} catch (e) {
  logger.warn('postCommitLogs handling error:', e);
}

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
        queueLogChange(
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

// Export all functions using CommonJS
/**
 * เพิ่มยอดการดู (View Count) สำหรับโครงการ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const incrementViewCount = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    
    // อัปเดต view count โดยตรง
    const [result] = await pool.execute(
      `UPDATE projects SET views_count = views_count + 1 WHERE project_id = ? AND status = 'approved' AND visibility = 1`,
      [projectId]
    );
    
    if (result.affectedRows === 0) {
      return notFoundResponse(res, "Project not found or not visible");
    }
    
    // ดึงยอด view count ปัจจุบัน
    const [project] = await pool.execute(
      `SELECT views_count FROM projects WHERE project_id = ?`,
      [projectId]
    );
    
    const currentViews = project.length > 0 ? project[0].views_count : 0;
    
    return res.json(
      successResponse(
        {
          projectId: parseInt(projectId),
          viewsCount: currentViews,
          message: "View count updated successfully"
        },
        "View count incremented successfully"
      )
    );
  } catch (error) {
    logger.error(`Error incrementing view count for project ${req.params.projectId}:`, error);
    return handleServerError(res, error);
  }
};

/**
 * ลบรูปภาพ/สื่อของโปรเจกต์แบบเฉพาะรายการ
 * รองรับ:
 *  - ลบรูปจากตาราง project_files ตาม file_ids หรือ file_paths
 *  - ลบรูปหลักของ coursework (courseworks.image)
 *  - ลบโปสเตอร์ของ coursework/competition (poster)
 * หมายเหตุ: จะลบไฟล์จริงในโฟลเดอร์ uploads/ ถ้า path เริ่มด้วย 'uploads/'
 */
const deleteProjectImages = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const projectId = parseInt(req.params.projectId, 10);
    if (!projectId || Number.isNaN(projectId)) {
      return validationErrorResponse(res, "Invalid projectId");
    }

    const {
      file_ids,
      file_paths,
      remove_primary_image,   // สำหรับ coursework: NULL ค่า field image
      remove_poster,          // สำหรับ coursework/competition: NULL ค่า field poster
      remove_paper_file       // สำหรับ academic: NULL ค่า field paper_file
    } = req.body || {};

    // ทำให้เป็น array เสมอ
    const fileIds = Array.isArray(file_ids) ? file_ids.map(id => parseInt(id, 10)).filter(n => !Number.isNaN(n)) : [];
    const filePaths = Array.isArray(file_paths) ? file_paths.map(p => String(p)).filter(Boolean) : [];

    await connection.beginTransaction();

    // ตรวจสอบประเภทโปรเจกต์
    const [projects] = await connection.execute(
      `SELECT project_id, user_id, type, title FROM projects WHERE project_id = ?`,
      [projectId]
    );
    if (projects.length === 0) {
      await connection.rollback();
      return notFoundResponse(res, "Project not found");
    }
    const project = projects[0];

    const filesToDelete = [];
    const deletedDbItems = {
      project_files: [],
      coursework_image: false,
      coursework_poster: false,
      competition_poster: false,
      academic_paper_file: false
    };

    // ลบรูปหลักของ coursework (courseworks.image)
    if (remove_primary_image && project.type === PROJECT_TYPES.COURSEWORK) {
      const [cw] = await connection.execute(
        `SELECT image FROM courseworks WHERE project_id = ?`,
        [projectId]
      );
      if (cw.length > 0 && cw[0].image) {
        const imgVal = cw[0].image;

        // อัปเดตฐานข้อมูลให้ลบรูปหลักทั้งหมด (ตั้งค่าเป็น NULL)
        await connection.execute(
          `UPDATE courseworks SET image = NULL WHERE project_id = ?`,
          [projectId]
        );

        // แปลงค่า image เป็นรายการ path เพื่อใช้ลบไฟล์จริง
        let paths = [];
        try {
          if (Array.isArray(imgVal)) {
            paths = imgVal.filter(p => typeof p === 'string' && p);
          } else if (typeof imgVal === 'string' && imgVal.trim().length > 0) {
            const parsed = JSON.parse(imgVal);
            paths = Array.isArray(parsed) ? parsed.filter(p => typeof p === 'string' && p) : [imgVal];
          }
        } catch (e) {
          if (typeof imgVal === 'string' && imgVal) paths = [imgVal];
        }

        paths.forEach(p => filesToDelete.push(p));
        deletedDbItems.coursework_image = true;

        queueLogChange(
          projectId,
          'deleted',
          'coursework_image',
          paths,
          null,
          req.user.id,
          'Removed coursework main image(s)',
          req.ip || req.connection?.remoteAddress,
          req.get('User-Agent')
        );
      }
    }

    // ลบโปสเตอร์ของ coursework/competition
    if (remove_poster === true) {
      if (project.type === PROJECT_TYPES.COURSEWORK) {
        const [cw] = await connection.execute(
          `SELECT poster FROM courseworks WHERE project_id = ?`,
          [projectId]
        );
        if (cw.length > 0 && cw[0].poster) {
          const posterPath = cw[0].poster;
          await connection.execute(
            `UPDATE courseworks SET poster = NULL WHERE project_id = ?`,
            [projectId]
          );
          filesToDelete.push(posterPath);
          deletedDbItems.coursework_poster = true;

          queueLogChange(
            projectId,
            'deleted',
            'coursework_poster',
            posterPath,
            null,
            req.user.id,
            'Removed coursework poster',
            req.ip || req.connection?.remoteAddress,
            req.get('User-Agent')
          );
        }
      } else if (project.type === PROJECT_TYPES.COMPETITION) {
        const [comp] = await connection.execute(
          `SELECT poster FROM competitions WHERE project_id = ?`,
          [projectId]
        );
        if (comp.length > 0 && comp[0].poster) {
          const posterPath = comp[0].poster;
          await connection.execute(
            `UPDATE competitions SET poster = NULL WHERE project_id = ?`,
            [projectId]
          );
          filesToDelete.push(posterPath);
          deletedDbItems.competition_poster = true;

          queueLogChange(
            projectId,
            'deleted',
            'competition_poster',
            posterPath,
            null,
            req.user.id,
            'Removed competition poster',
            req.ip || req.connection?.remoteAddress,
            req.get('User-Agent')
          );
        }
      }
    }

// ลบไฟล์ PDF ของบทความวิชาการ (academic)
if (remove_paper_file === true && project.type === PROJECT_TYPES.ACADEMIC) {
  const [ac] = await connection.execute(
    `SELECT paper_file FROM academic_papers WHERE project_id = ?`,
    [projectId]
  );
  if (ac.length > 0 && ac[0].paper_file) {
    const pdfPath = ac[0].paper_file;
    await connection.execute(
      `UPDATE academic_papers SET paper_file = NULL WHERE project_id = ?`,
      [projectId]
    );
    filesToDelete.push(pdfPath);
    deletedDbItems.academic_paper_file = true;

    queueLogChange(
      projectId,
      'deleted',
      'academic_paper_file',
      pdfPath,
      null,
      req.user.id,
      'Removed academic paper PDF',
      req.ip || req.connection?.remoteAddress,
      req.get('User-Agent')
    );
  }
}
    // ลบรูปใน project_files ตาม file_ids
    if (fileIds.length > 0) {
      const placeholders = fileIds.map(() => '?').join(',');
      const [rows] = await connection.execute(
        `
        SELECT file_id, file_path
        FROM project_files
        WHERE project_id = ? AND file_type = 'image' AND file_id IN (${placeholders})
        `,
        [projectId, ...fileIds]
      );

      if (rows.length > 0) {
        const rowIds = rows.map(r => r.file_id);
        const delPlaceholders = rowIds.map(() => '?').join(',');
        await connection.execute(
          `DELETE FROM project_files WHERE project_id = ? AND file_type = 'image' AND file_id IN (${delPlaceholders})`,
          [projectId, ...rowIds]
        );
        rows.forEach(r => {
          if (r.file_path) filesToDelete.push(r.file_path);
          deletedDbItems.project_files.push(r.file_id);
        });

        queueLogChange(
          projectId,
          'deleted',
          'project_files_images',
          rows.map(r => ({ file_id: r.file_id, file_path: r.file_path })),
          null,
          req.user.id,
          `Removed ${rows.length} project_files image(s)`,
          req.ip || req.connection?.remoteAddress,
          req.get('User-Agent')
        );
      }
    }

    // ลบรูปตาม path ที่ระบุ
    if (filePaths.length > 0) {
      // 1) อัปเดต JSON array ในตารางตามประเภทโปรเจกต์ (coursework / competition)
      if (project.type === PROJECT_TYPES.COURSEWORK) {
        const [cw] = await connection.execute(
          `SELECT image FROM courseworks WHERE project_id = ?`,
          [projectId]
        );
        if (cw.length > 0) {
          let arr = [];
          const imgVal = cw[0].image;
          try {
            if (Array.isArray(imgVal)) {
              arr = imgVal.filter(p => typeof p === 'string' && p);
            } else if (typeof imgVal === 'string' && imgVal.trim().length > 0) {
              const parsed = JSON.parse(imgVal);
              arr = Array.isArray(parsed) ? parsed.filter(p => typeof p === 'string' && p) : (imgVal ? [imgVal] : []);
            }
          } catch {
            arr = imgVal ? [imgVal] : [];
          }
          const setToRemove = new Set(filePaths);
          const beforeLen = arr.length;
          const newArr = arr.filter(p => !setToRemove.has(p));
          if (newArr.length !== beforeLen) {
            await connection.execute(
              `UPDATE courseworks SET image = ? WHERE project_id = ?`,
              [newArr.length > 0 ? JSON.stringify(newArr) : null, projectId]
            );
            deletedDbItems.coursework_image = true;
            // เพิ่มรายการไฟล์ที่ต้องลบจริง (เฉพาะที่อยู่ใต้ uploads/)
            newArr.forEach(() => {}); // no-op, only for clarity
            arr.forEach(p => { if (setToRemove.has(p)) filesToDelete.push(p); });
            queueLogChange(
              projectId,
              'deleted',
              'courseworks.image_paths',
              arr,
              newArr,
              req.user.id,
              `Removed ${beforeLen - newArr.length} image path(s) from courseworks.image`,
              req.ip || req.connection?.remoteAddress,
              req.get('User-Agent')
            );
          }
        }
      } else if (project.type === PROJECT_TYPES.COMPETITION) {
        const [comp] = await connection.execute(
          `SELECT image FROM competitions WHERE project_id = ?`,
          [projectId]
        );
        if (comp.length > 0) {
          let arr = [];
          const imgVal = comp[0].image;
          try {
            if (Array.isArray(imgVal)) {
              arr = imgVal.filter(p => typeof p === 'string' && p);
            } else if (typeof imgVal === 'string' && imgVal.trim().length > 0) {
              const parsed = JSON.parse(imgVal);
              arr = Array.isArray(parsed) ? parsed.filter(p => typeof p === 'string' && p) : (imgVal ? [imgVal] : []);
            }
          } catch {
            arr = imgVal ? [imgVal] : [];
          }
          const setToRemove = new Set(filePaths);
          const beforeLen = arr.length;
          const newArr = arr.filter(p => !setToRemove.has(p));
          if (newArr.length !== beforeLen) {
            await connection.execute(
              `UPDATE competitions SET image = ? WHERE project_id = ?`,
              [newArr.length > 0 ? JSON.stringify(newArr) : null, projectId]
            );
            // บันทึกไฟล์ที่จะลบจริง (เฉพาะ uploads/)
            arr.forEach(p => { if (setToRemove.has(p)) filesToDelete.push(p); });
            queueLogChange(
              projectId,
              'deleted',
              'competitions.image_paths',
              arr,
              newArr,
              req.user.id,
              `Removed ${beforeLen - newArr.length} image path(s) from competitions.image`,
              req.ip || req.connection?.remoteAddress,
              req.get('User-Agent')
            );
          }
        }
      }

      // 2) Fallback: ลบจากตาราง project_files (เพื่อความเข้ากันได้ย้อนหลัง)
      const pathPlaceholders = filePaths.map(() => '?').join(',');
      const [rowsByPath] = await connection.execute(
        `
        SELECT file_id, file_path
        FROM project_files
        WHERE project_id = ? AND file_type = 'image' AND file_path IN (${pathPlaceholders})
        `,
        [projectId, ...filePaths]
      );

      if (rowsByPath.length > 0) {
        const delIds = rowsByPath.map(r => r.file_id);
        const delPlaceholders2 = delIds.map(() => '?').join(',');
        await connection.execute(
          `DELETE FROM project_files WHERE project_id = ? AND file_type = 'image' AND file_id IN (${delPlaceholders2})`,
          [projectId, ...delIds]
        );
        rowsByPath.forEach(r => {
          if (r.file_path) filesToDelete.push(r.file_path);
          deletedDbItems.project_files.push(r.file_id);
        });

        queueLogChange(
          projectId,
          'deleted',
          'project_files_images_by_path',
          rowsByPath.map(r => ({ file_id: r.file_id, file_path: r.file_path })),
          null,
          req.user.id,
          `Removed ${rowsByPath.length} project_files image(s) by path`,
          req.ip || req.connection?.remoteAddress,
          req.get('User-Agent')
        );
      }
    }

    await connection.commit();

    // ลบไฟล์จริง (ถ้าเป็นไฟล์ในระบบ)
    const deletedFiles = [];
    for (const p of filesToDelete) {
      try {
        if (p && typeof p === 'string' && p.startsWith('uploads/')) {
          await fs.promises.unlink(p);
          deletedFiles.push(p);
        }
      } catch (err) {
        logger.warn(`Failed to delete file ${p}: ${err.message}`);
      }
    }

    if (deletedFiles.length > 0) {
      queueLogChange(
        projectId,
        'deleted',
        'physical_image_files',
        filesToDelete,
        deletedFiles,
        req.user.id,
        `Deleted ${deletedFiles.length} physical image file(s)`,
        req.ip || req.connection?.remoteAddress,
        req.get('User-Agent')
      );
    }

    return res.json(
      successResponse(
        {
          projectId,
          deleted: deletedDbItems,
          deletedFiles,
          message: 'Images removed successfully'
        },
        'Images removed successfully'
      )
    );
  } catch (error) {
    await connection.rollback();
    logger.error(`Error deleting project images for project ${req.params.projectId}:`, error);
    return handleServerError(res, error);
  } finally {
    connection.release();
  }
};
module.exports = {
  getAllProjects,
  getTop9Projects,
  getLatestProjects,
  getMyProjects,
  getProjectDetails,
  uploadProject,
  updateProjectWithFiles,
  deleteProject,
  deleteProjectImages,
  incrementViewCount
};