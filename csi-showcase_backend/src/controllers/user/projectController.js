// controllers/user/projectController.js
import pool from "../../config/database.js";
import logger from "../../config/logger.js";
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
import searchService from "../../services/searchService.js";
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
      files: project.files.map((file) => ({
        type: file.file_type,
        path: file.file_path,
        name: file.file_name,
        size: file.file_size,
        uploadDate: file.upload_date,
      })) || [],
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

    // Check if user has permission to upload
    if (req.user.id != userId && req.user.role !== "admin") {
      return forbiddenResponse(res, "You can only upload your own projects");
    }

    // Start transaction
    await connection.beginTransaction();

    // Extract and validate project data
    const {
      title,
      description,
      type,
      study_year,
      year,
      semester,
      visibility = 1,
    } = req.body;

    // Validate required fields
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

    // Validate type
    if (!isValidType(type)) {
      return validationErrorResponse(res, "Invalid project type", {
        type: `Type must be one of: ${Object.values(PROJECT_TYPES).join(", ")}`,
      });
    }

    // Prepare project data
    const projectData = {
      user_id: userId,
      title: sanitizeHTML(title),
      description: sanitizeHTML(description),
      type,
      study_year,
      year,
      semester,
      visibility,
      contributors: req.body.contributors || [],
    };

    // Add type-specific data
    if (type === PROJECT_TYPES.ACADEMIC) {
      // ปรับให้ตรงกับโครงสร้างตาราง academic_papers ใหม่
      Object.assign(projectData, {
        publication_date: req.body.publication_date || null,
        published_year: req.body.published_year || year,
      });
    } else if (type === PROJECT_TYPES.COMPETITION) {
      // ปรับให้ตรงกับโครงสร้างตาราง competitions ใหม่
      Object.assign(projectData, {
        competition_name: sanitizeHTML(req.body.competition_name || ""),
        competition_year: req.body.competition_year || year,
        poster: req.body.poster || null,
      });
    } else if (type === PROJECT_TYPES.COURSEWORK) {
      // ปรับให้ตรงกับโครงสร้างตาราง courseworks ใหม่
      const videoUrl = req.body.clip_video
        ? sanitizeHTML(req.body.clip_video)
        : null;
      // ตรวจสอบว่า URL เป็นของ YouTube, TikTok หรือ Facebook
      const isValidVideoUrl = videoUrl
        ? /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|tiktok\.com|facebook\.com|fb\.watch)/.test(
            videoUrl
          )
        : true;

      Object.assign(projectData, {
        poster: req.body.poster || null,
        clip_video: isValidVideoUrl ? videoUrl : null,
        image: req.body.image || null,
      });
    }

    // สร้างโครงการในฐานข้อมูล
    const [projectResult] = await connection.execute(
      `
      INSERT INTO projects (
        user_id, title, description, type, study_year, year, 
        semester, visibility, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      ]
    );

    const projectId = projectResult.insertId;

    // เพิ่มข้อมูลผู้ร่วมงาน (contributors) ถ้ามี
    if (
      Array.isArray(projectData.contributors) &&
      projectData.contributors.length > 0
    ) {
      for (const contributor of projectData.contributors) {
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
      await connection.execute(
        `
        INSERT INTO academic_papers (
          project_id, publication_date, published_year
        ) VALUES (?, ?, ?)
      `,
        [
          projectId,
          projectData.publication_date || null,
          projectData.published_year || projectData.year,
        ]
      );
    } else if (projectData.type === PROJECT_TYPES.COMPETITION) {
      await connection.execute(
        `
        INSERT INTO competitions (
          project_id, competition_name, competition_year, poster
        ) VALUES (?, ?, ?, ?)
      `,
        [
          projectId,
          projectData.competition_name || "",
          projectData.competition_year || projectData.year,
          projectData.poster || null,
        ]
      );
    } else if (projectData.type === PROJECT_TYPES.COURSEWORK) {
      await connection.execute(
        `
        INSERT INTO courseworks (
          project_id, poster, clip_video, image
        ) VALUES (?, ?, ?, ?)
      `,
        [
          projectId,
          projectData.poster || null,
          projectData.clip_video || null,
          projectData.image || null,
        ]
      );
    }

    // Commit transaction
    await connection.commit();

    // Notify admins of new project
    await notificationService.notifyAdminsNewProject(
      projectId,
      projectData.title,
      req.user.fullName,
      projectData.type
    );

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
    // Rollback transaction on error
    await connection.rollback();
    logger.error("Error uploading project:", error);
    return handleServerError(res, error);
  } finally {
    // Release connection
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

    // Get project to check ownership
    const [projects] = await pool.execute(
      `SELECT * FROM projects WHERE project_id = ?`,
      [projectId]
    );

    if (projects.length === 0) {
      return notFoundResponse(res, "Project not found");
    }

    const project = projects[0];

    // Check if user has permission to update
    if (req.user.id != project.user_id && req.user.role !== "admin") {
      return forbiddenResponse(res, "You can only update your own projects");
    }

    // Start transaction
    await connection.beginTransaction();

    // Extract update data
    const updateData = req.body;

    // Create update query with only provided fields
    let updateFields = [];
    let updateParams = [];

    if (updateData.title !== undefined) {
      updateFields.push("title = ?");
      updateParams.push(sanitizeHTML(updateData.title));
    }

    if (updateData.description !== undefined) {
      updateFields.push("description = ?");
      updateParams.push(sanitizeHTML(updateData.description));
    }

    if (updateData.study_year !== undefined) {
      updateFields.push("study_year = ?");
      updateParams.push(updateData.study_year);
    }

    if (updateData.year !== undefined) {
      updateFields.push("year = ?");
      updateParams.push(updateData.year);
    }

    if (updateData.semester !== undefined) {
      updateFields.push("semester = ?");
      updateParams.push(updateData.semester);
    }

    if (updateData.visibility !== undefined) {
      updateFields.push("visibility = ?");
      updateParams.push(updateData.visibility);
    }

    // Set status back to pending for admin review
    updateFields.push("status = ?");
    updateParams.push(PROJECT_STATUSES.PENDING);

    // Update timestamp
    updateFields.push("updated_at = NOW()");

    // Add project ID to parameters
    updateParams.push(projectId);

    // Update project
    if (updateFields.length > 0) {
      const updateQuery = `
        UPDATE projects 
        SET ${updateFields.join(", ")} 
        WHERE project_id = ?
      `;

      await connection.execute(updateQuery, updateParams);
    }

    // Update contributors if provided
    if (updateData.contributors !== undefined) {
      // Delete existing contributors
      await connection.execute(
        `DELETE FROM project_groups WHERE project_id = ?`,
        [projectId]
      );

      // Add new contributors
      const contributors =
        typeof updateData.contributors === "string"
          ? JSON.parse(updateData.contributors)
          : updateData.contributors;

      if (Array.isArray(contributors) && contributors.length > 0) {
        for (const contributor of contributors) {
          await connection.execute(
            `INSERT INTO project_groups (project_id, user_id, role) VALUES (?, ?, ?)`,
            [projectId, contributor.user_id, contributor.role || "contributor"]
          );
        }
      }
    }

    // Update type-specific data
    if (project.type === PROJECT_TYPES.ACADEMIC) {
      // ใช้ฟังก์ชันที่ปรับปรุงแล้ว
      await updateAcademicData(connection, projectId, updateData, project.year);
    } else if (project.type === PROJECT_TYPES.COMPETITION) {
      // ใช้ฟังก์ชันที่ปรับปรุงแล้ว
      await updateCompetitionData(
        connection,
        projectId,
        updateData,
        project.year
      );
    } else if (project.type === PROJECT_TYPES.COURSEWORK) {
      // ใช้ฟังก์ชันที่ปรับปรุงแล้ว
      await updateCourseworkData(connection, projectId, updateData);
    }


    // ตรวจสอบและอัปเดต clip_video URL สำหรับ coursework
    if (
      project.type === PROJECT_TYPES.COURSEWORK &&
      updateData.clip_video !== undefined
    ) {
      const videoUrl = sanitizeHTML(updateData.clip_video);
      // ตรวจสอบว่าเป็น URL ของ YouTube, TikTok หรือ Facebook
      const isValidVideoUrl =
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|tiktok\.com|facebook\.com|fb\.watch)/.test(
          videoUrl
        );

      if (isValidVideoUrl || videoUrl === "") {
        await connection.execute(
          `UPDATE courseworks SET clip_video = ? WHERE project_id = ?`,
          [videoUrl, projectId]
        );
      } else {
        logger.warn(
          `Invalid video URL format for project ${projectId}: ${videoUrl}`
        );
      }
    }

    // Commit transaction
    await connection.commit();

    // Notify admins of updated project
    await notificationService.notifyAdminsNewProject(
      projectId,
      project.title,
      req.user.fullName,
      project.type
    );

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
    logger.error(`Error updating project ${req.params.projectId}:`, error);
    return handleServerError(res, error);
  } finally {
    // Release connection
    connection.release();
  }
};

/**
 * Helper function to update coursework data
 */
/**
 * Helper function to update coursework data
 */
async function updateCourseworkData(connection, projectId, updateData) {
  // Check if coursework exists
  const [coursework] = await connection.execute(
    `SELECT * FROM courseworks WHERE project_id = ?`,
    [projectId]
  );

  if (coursework.length > 0) {
    // Update existing record
    const updateFields = [];
    const updateParams = [];

    if (updateData.poster !== undefined) {
      updateFields.push("poster = ?");
      updateParams.push(updateData.poster);
    }

    if (updateData.clip_video !== undefined) {
      // ตรวจสอบว่า clip_video เป็น URL ที่ถูกต้องหรือไม่
      const videoUrl = sanitizeHTML(updateData.clip_video);
      // สามารถเพิ่มการตรวจสอบว่าเป็น URL ของ YouTube, TikTok หรือ Facebook ด้วย regex
      const isValidVideoUrl =
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|tiktok\.com|facebook\.com|fb\.watch)/.test(
          videoUrl
        );

      if (isValidVideoUrl || videoUrl === "") {
        updateFields.push("clip_video = ?");
        updateParams.push(videoUrl);
      } else {
        logger.warn(
          `Invalid video URL format for project ${projectId}: ${videoUrl}`
        );
        // ถ้าไม่ใช่ URL ที่ถูกต้อง อาจเลือกที่จะไม่อัปเดตหรือใส่ค่าว่าง
      }
    }

    if (updateData.image !== undefined) {
      updateFields.push("image = ?");
      updateParams.push(updateData.image);
    }

    // Add project ID to parameters
    updateParams.push(projectId);

    if (updateFields.length > 0) {
      const updateQuery = `
        UPDATE courseworks
        SET ${updateFields.join(", ")}
        WHERE project_id = ?
      `;

      await connection.execute(updateQuery, updateParams);
    }
  } else {
    // Insert new record
    const videoUrl = updateData.clip_video
      ? sanitizeHTML(updateData.clip_video)
      : null;
    // ตรวจสอบ URL ถ้าจำเป็น
    const isValidVideoUrl = videoUrl
      ? /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|tiktok\.com|facebook\.com|fb\.watch)/.test(
          videoUrl
        )
      : true;

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
        updateData.poster || null,
        isValidVideoUrl ? videoUrl : null,
        updateData.image || null,
      ]
    );
  }
}

/**
 * Helper function to update academic paper data
 */
async function updateAcademicData(
  connection,
  projectId,
  updateData,
  defaultYear
) {
  // Check if academic paper exists
  const [academic] = await connection.execute(
    `SELECT * FROM academic_papers WHERE project_id = ?`,
    [projectId]
  );

  if (academic.length > 0) {
    // Update existing record
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

    // Update timestamp
    updateFields.push("last_updated = NOW()");

    // Add project ID to parameters
    updateParams.push(projectId);

    if (updateFields.length > 0) {
      const updateQuery = `
        UPDATE academic_papers
        SET ${updateFields.join(", ")}
        WHERE project_id = ?
      `;

      await connection.execute(updateQuery, updateParams);
    }
  } else {
    // Insert new record
    await connection.execute(
      `
      INSERT INTO academic_papers (
        project_id, 
        publication_date, 
        published_year
      ) VALUES (?, ?, ?)
    `,
      [
        projectId,
        updateData.publication_date || null,
        updateData.published_year || defaultYear,
      ]
    );
  }
}

/**
 * Helper function to update competition data
 */
async function updateCompetitionData(
  connection,
  projectId,
  updateData,
  defaultYear
) {
  // Check if competition exists
  const [competition] = await connection.execute(
    `SELECT * FROM competitions WHERE project_id = ?`,
    [projectId]
  );

  if (competition.length > 0) {
    // Update existing record
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

    // ต้องเพิ่ม poster ถ้ามีการอัปเดต
    if (updateData.poster !== undefined) {
      updateFields.push("poster = ?");
      updateParams.push(updateData.poster);
    }

    // Add project ID to parameters
    updateParams.push(projectId);

    if (updateFields.length > 0) {
      const updateQuery = `
        UPDATE competitions
        SET ${updateFields.join(", ")}
        WHERE project_id = ?
      `;

      await connection.execute(updateQuery, updateParams);
    }
  } else {
    // Insert new record
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
        updateData.poster || null,
      ]
    );
  }
}

/**
 * Helper function to handle project file uploads
 */
/**
 * ลบโครงการ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteProject = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const projectId = req.params.projectId;

    // Get project to check ownership
    const [projects] = await pool.execute(
      `SELECT * FROM projects WHERE project_id = ?`,
      [projectId]
    );

    if (projects.length === 0) {
      return notFoundResponse(res, "Project not found");
    }

    const project = projects[0];

    // Check if user has permission to delete
    if (req.user.id != project.user_id && req.user.role !== "admin") {
      return forbiddenResponse(res, "You can only delete your own projects");
    }

    // Start transaction
    await connection.beginTransaction();

    try {
      // Delete related records in order to avoid foreign key constraints

      // Delete type-specific data first
      if (project.type === PROJECT_TYPES.ACADEMIC) {
        await connection.execute(
          `DELETE FROM academic_papers WHERE project_id = ?`,
          [projectId]
        );
      } else if (project.type === PROJECT_TYPES.COMPETITION) {
        await connection.execute(
          `DELETE FROM competitions WHERE project_id = ?`,
          [projectId]
        );
      } else if (project.type === PROJECT_TYPES.COURSEWORK) {
        await connection.execute(
          `DELETE FROM courseworks WHERE project_id = ?`,
          [projectId]
        );
      }

      // Delete project groups
      await connection.execute(
        `DELETE FROM project_groups WHERE project_id = ?`,
        [projectId]
      );

      // Delete visitor views
      await connection.execute(
        `DELETE FROM visitor_views WHERE project_id = ?`,
        [projectId]
      );

      // Delete project reviews
      await connection.execute(
        `DELETE FROM project_reviews WHERE project_id = ?`,
        [projectId]
      );

      // Delete project
      await connection.execute(`DELETE FROM projects WHERE project_id = ?`, [
        projectId,
      ]);

      // Commit transaction
      await connection.commit();

      // Delete physical files
      for (const file of files) {
        await storageService.deleteFile(file.file_path);
      }

      return res.json(successResponse(null, "Project deleted successfully"));
    } catch (error) {
      // Rollback on error
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    logger.error(`Error deleting project ${req.params.projectId}:`, error);
    return handleServerError(res, error);
  } finally {
    connection.release();
  }
};

/**
 * อัปโหลดไฟล์สำหรับโครงการ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const uploadProjectFile = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Get project to check ownership
    const [projects] = await pool.execute(
      `SELECT * FROM projects WHERE project_id = ?`,
      [projectId]
    );

    if (projects.length === 0) {
      return notFoundResponse(res, "Project not found");
    }

    const project = projects[0];

    // Check if user has permission to upload
    if (req.user.id != project.user_id && req.user.role !== "admin") {
      return forbiddenResponse(
        res,
        "You can only upload files to your own projects"
      );
    }

    // Check if file was uploaded
    if (!req.file) {
      return validationErrorResponse(res, "No file uploaded");
    }

    const file = req.file;
    let fileType = "other";

    // Determine file type
    if (file.mimetype.startsWith("image/")) {
      fileType = "image";
    } else if (file.mimetype.startsWith("video/")) {
      fileType = "video";
    } else if (file.mimetype === "application/pdf") {
      fileType = "pdf";
    }

    // ตรวจสอบประเภทโครงการและบันทึกไฟล์ตามประเภท
    if (project.type === PROJECT_TYPES.COURSEWORK) {
      // อัปเดตตาราง courseworks ตามประเภทไฟล์
      if (fileType === "image") {
        await pool.execute(
          `UPDATE courseworks SET image = ? WHERE project_id = ?`,
          [file.path, projectId]
        );
      } else if (file.originalname.toLowerCase().includes("poster")) {
        await pool.execute(
          `UPDATE courseworks SET poster = ? WHERE project_id = ?`,
          [file.path, projectId]
        );
      }
      // ไม่ต้องอัปเดต clip_video เพราะมักจะเป็น URL ไม่ใช่ไฟล์ที่อัปโหลด
    } 
    else if (project.type === PROJECT_TYPES.COMPETITION) {
      // สำหรับโครงการประเภทแข่งขัน มักจะมีเฉพาะ poster
      if (fileType === "image" || file.originalname.toLowerCase().includes("poster")) {
        await pool.execute(
          `UPDATE competitions SET poster = ? WHERE project_id = ?`,
          [file.path, projectId]
        );
      }
    } 
    else if (project.type === PROJECT_TYPES.ACADEMIC) {
      // โครงการวิชาการไม่มีฟิลด์เก็บไฟล์โดยตรง
      // อาจจะต้องเพิ่มฟิลด์ใหม่ในตาราง academic_papers หากต้องการเก็บไฟล์
    }

    // Set status back to pending for admin review
    await pool.execute(
      `UPDATE projects SET status = ? WHERE project_id = ?`,
      [PROJECT_STATUSES.PENDING, projectId]
    );

    return res.status(STATUS_CODES.CREATED).json(
      successResponse(
        {
          fileName: file.originalname,
          filePath: file.path,
          fileSize: file.size,
          fileType,
          message: "File uploaded and associated with project successfully"
        },
        "File uploaded successfully"
      )
    );
  } catch (error) {
    // Delete uploaded file if an error occurs
    if (req.file) {
      await storageService.deleteFile(req.file.path);
    }

    logger.error(
      `Error uploading file to project ${req.params.projectId}:`,
      error
    );
    return handleServerError(res, error);
  }
};
