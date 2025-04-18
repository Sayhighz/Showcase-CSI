// controllers/user/projectController.js
import pool, {
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
} from "../../config/database.js";
import logger from "../../config/logger.js";
import {
  successResponse,
  errorResponse,
  handleServerError,
  notFoundResponse,
  forbiddenResponse,
  validationErrorResponse,
} from "../../utils/responseFormatter.js";
import {
  PROJECT_STATUSES,
  PROJECT_TYPES,
  COMPETITION_LEVELS,
  SEMESTERS,
  isValidStatus,
  isValidType,
} from "../../constants/projectStatuses.js";
import {
  getPaginationInfo,
  getPaginationParams,
} from "../../constants/pagination.js";
import {
  ERROR_MESSAGES,
  getErrorMessage,
} from "../../constants/errorMessages.js";
import { STATUS_CODES } from "../../constants/statusCodes.js";
import storageService from "../../services/storageService.js";
import projectService from "../../services/projectService.js";
import searchService from "../../services/searchService.js";
import notificationService from "../../services/notificationService.js";
import { isResourceOwner } from "../../middleware/authMiddleware.js";
import { isAdmin } from "../../middleware/adminMiddleware.js";
import { handleMulterError } from "../../middleware/userMiddleware.js";
import { sanitizeHTML, isEmpty } from "../../utils/validationHelper.js";
import { formatToISODate } from "../../utils/dateHelper.js";
import { slugify, truncateText } from "../../utils/stringHelper.js";

// Create uploader instances for different file types
const imageUploader = storageService.createUploader("images", {
  maxSize: 5 * 1024 * 1024,
});
const documentUploader = storageService.createUploader("documents", {
  maxSize: 20 * 1024 * 1024,
});
const videoUploader = storageService.createUploader("videos", {
  maxSize: 50 * 1024 * 1024,
});

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

/**
 * ดึงข้อมูลโครงการยอดนิยม 9 อันดับแรก
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getTop9Projects = async (req, res) => {
  try {
    // Set filters for top projects
    const filters = {
      onlyVisible: true,
      status: PROJECT_STATUSES.APPROVED,
    };

    // Set pagination for top 9 projects
    const pagination = {
      page: 1,
      limit: 9,
    };

    // Get projects sorted by views
    const query = `
      SELECT p.*, u.username, u.full_name,
             (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as image,
             (SELECT COUNT(*) FROM visitor_views vv WHERE vv.project_id = p.project_id) + 
             (SELECT COUNT(*) FROM company_views cv WHERE cv.project_id = p.project_id) as views_count
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.status = ? AND p.visibility = 1
      ORDER BY views_count DESC, p.created_at DESC
      LIMIT ?
    `;

    const [projects] = await pool.execute(query, [
      PROJECT_STATUSES.APPROVED,
      pagination.limit.toString(),
    ]);

    // Format projects for response
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
      projectLink: `/projects/${project.project_id}`,
      viewsCount: project.views_count || 0,
    }));

    return res.json(
      successResponse(formattedProjects, "Top projects retrieved successfully")
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
    const limit = parseInt(req.query.limit) || 9;

    // Set filters for latest projects
    const filters = {
      onlyVisible: true,
      status: PROJECT_STATUSES.APPROVED,
    };

    // Set pagination
    const pagination = {
      page: 1,
      limit: limit,
    };

    // Get projects ordered by creation date
    const query = `
      SELECT p.*, u.username, u.full_name,
             (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as image
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.status = ? AND p.visibility = 1
      ORDER BY p.created_at DESC
      LIMIT ?
    `;

    const [projects] = await pool.execute(query, [
      PROJECT_STATUSES.APPROVED,
      pagination.limit.toString(),
    ]);

    // Format projects for response
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
      projectLink: `/projects/${project.project_id}`,
      createdAt: project.created_at,
    }));

    return res.json(
      successResponse(
        formattedProjects,
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
    // console.log(userId)

    // Check if user has permission to view these projects
    if (req.user.id != userId && req.user.role !== "admin") {
      return forbiddenResponse(res, "You can only view your own projects");
    }

    // Set filters for user's projects
    const filters = {
      userId: userId,
    };

    // Get pagination parameters
    const pagination = getPaginationParams(req);

    // Get user's projects
    const result = await projectService.getAllProjects(filters, pagination);

    // Format projects for response
    const formattedProjects = result.projects.map((project) => ({
      id: project.project_id,
      title: project.title,
      description: truncateText(project.description, 150),
      category: project.type,
      level: `ปี ${project.study_year}`,
      year: project.year,
      status: project.status,
      image: project.image || null,
      projectLink: `/projects/${project.project_id}`,
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

    // Options for getting project details
    const options = {
      includeReviews: req.user && req.user.role === "admin",
      recordView: !req.user || req.user.id != projectId,
      viewerId: viewerId,
    };
    // Get project from service
    const project = await projectService.getProjectById(projectId, options);
    
    if (!project) {
      return notFoundResponse(res, "Project not found");
    }
    // Check if user can access the project
    console.log(req.user)
    if (
      (project.visibility === 0 || project.status === "pending") &&
      (!req.user ||
        (req.user.id != project.user_id && req.user.role !== "admin"))
    ) {
      return forbiddenResponse(
        res,
        "You do not have permission to view this project"
      );
    }

    // If the viewer is not the owner, record the view
    if (!req.user || req.user.id != project.user_id) {
      // Increment view count
      await pool.execute(
        `
        UPDATE projects
        SET views_count = views_count + 1
        WHERE project_id = ?
      `,
        [projectId]
      );

      // Record visitor view
      if (!req.user) {
        await pool.execute(
          `
          INSERT INTO visitor_views (project_id, ip_address, user_agent)
          VALUES (?, ?, ?)
        `,
          [projectId, req.ip, req.headers["user-agent"] || "Unknown"]
        );
      }
    }

    // Format project for response
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
          (req.user.id == project.user_id || req.user.role === "admin")
            ? project.email
            : undefined,
      },
      contributors: project.contributors || [],
      files: project.files
        ? project.files.map((file) => ({
            id: file.file_id,
            type: file.file_type,
            path: file.file_path,
            name: file.file_name,
            size: file.file_size,
          }))
        : [],
      viewsCount: project.views_count || 0,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    };

    // Add type-specific data
    if (project.academic) {
      formattedProject.academic = project.academic;
    }

    if (project.competition) {
      formattedProject.competition = project.competition;
    }

    if (project.coursework) {
      formattedProject.coursework = project.coursework;
    }

    // Add reviews for admin
    if (options.includeReviews && project.reviews) {
      formattedProject.reviews = project.reviews;
    }

    return res.json(
      successResponse(
        formattedProject,
        "Project details retrieved successfully"
      )
    );
  } catch (error) {
    logger.error(
      `Error getting project details for project ${req.params.projectId}:`,
      error
    );
    return handleServerError(res, error);
  }
};

/**
 * ค้นหาโครงการตามเงื่อนไขต่าง ๆ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const searchProjects = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";

    // Create filters object
    const filters = {
      type: req.query.type || null,
      year: req.query.year || null,
      studyYear: req.query.study_year || null,
      userId: req.user ? req.user.id : null,
    };

    // Get pagination parameters
    const pagination = getPaginationParams(req);

    // Search projects using search service
    const result = await searchService.searchProjects(
      keyword,
      filters,
      pagination
    );

    return res.json(
      successResponse(result, "Search results retrieved successfully")
    );
  } catch (error) {
    logger.error("Error searching projects:", error);
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
      tags = "",
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
      tags: sanitizeHTML(tags),
      contributors: req.body.contributors || [],
    };

    // Add type-specific data
    if (type === PROJECT_TYPES.ACADEMIC) {
      Object.assign(projectData, {
        abstract: sanitizeHTML(req.body.abstract || ""),
        publication_date: req.body.publication_date || null,
        published_year: req.body.published_year || year,
        authors: sanitizeHTML(req.body.authors || ""),
        publication_venue: sanitizeHTML(req.body.publication_venue || ""),
      });
    } else if (type === PROJECT_TYPES.COMPETITION) {
      Object.assign(projectData, {
        competition_name: sanitizeHTML(req.body.competition_name || ""),
        competition_year: req.body.competition_year || year,
        competition_level: req.body.competition_level || "university",
        achievement: sanitizeHTML(req.body.achievement || ""),
        team_members: sanitizeHTML(req.body.team_members || ""),
      });
    } else if (type === PROJECT_TYPES.COURSEWORK) {
      Object.assign(projectData, {
        course_code: sanitizeHTML(req.body.course_code || ""),
        course_name: sanitizeHTML(req.body.course_name || ""),
        instructor: sanitizeHTML(req.body.instructor || ""),
      });
    }

    // Create project using service
    const project = await projectService.createProject(
      projectData,
      req.files || {}
    );

    // Commit transaction
    await connection.commit();

    // Notify admins of new project
    await notificationService.notifyAdminsNewProject(
      project.project_id,
      project.title,
      req.user.fullName,
      type
    );

    return res.status(STATUS_CODES.CREATED).json(
      successResponse(
        {
          projectId: project.project_id,
          title: project.title,
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
    
    if (updateData.tags !== undefined) {
      updateFields.push("tags = ?");
      updateParams.push(sanitizeHTML(updateData.tags));
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
      const contributors = typeof updateData.contributors === 'string' 
        ? JSON.parse(updateData.contributors) 
        : updateData.contributors;
      
      if (Array.isArray(contributors) && contributors.length > 0) {
        for (const contributor of contributors) {
          await connection.execute(
            `INSERT INTO project_groups (project_id, user_id) VALUES (?, ?)`,
            [projectId, contributor.user_id]
          );
        }
      }
    }
    
    // Update type-specific data
    if (project.type === PROJECT_TYPES.ACADEMIC) {
      await updateAcademicData(connection, projectId, updateData, project.year);
    } else if (project.type === PROJECT_TYPES.COMPETITION) {
      await updateCompetitionData(connection, projectId, updateData, project.year);
    } else if (project.type === PROJECT_TYPES.COURSEWORK) {
      await updateCourseworkData(connection, projectId, updateData);
    }
    
    // Handle file uploads
    if (req.files && Object.keys(req.files).length > 0) {
      await handleProjectFiles(connection, projectId, project.type, req.files);
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
          message: "Project updated successfully. Please wait for admin approval."
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

    if (updateData.abstract !== undefined) {
      updateFields.push("abstract = ?");
      updateParams.push(sanitizeHTML(updateData.abstract));
    }

    if (updateData.authors !== undefined) {
      updateFields.push("authors = ?");
      updateParams.push(sanitizeHTML(updateData.authors));
    }

    if (updateData.publication_venue !== undefined) {
      updateFields.push("publication_venue = ?");
      updateParams.push(sanitizeHTML(updateData.publication_venue));
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
        published_year, 
        abstract, 
        authors, 
        publication_venue
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        projectId,
        updateData.publication_date || null,
        updateData.published_year || defaultYear,
        sanitizeHTML(updateData.abstract || ""),
        sanitizeHTML(updateData.authors || ""),
        sanitizeHTML(updateData.publication_venue || ""),
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

    if (updateData.competition_level !== undefined) {
      updateFields.push("competition_level = ?");
      updateParams.push(updateData.competition_level);
    }

    if (updateData.achievement !== undefined) {
      updateFields.push("achievement = ?");
      updateParams.push(sanitizeHTML(updateData.achievement));
    }

    if (updateData.team_members !== undefined) {
      updateFields.push("team_members = ?");
      updateParams.push(sanitizeHTML(updateData.team_members));
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
        competition_level, 
        achievement, 
        team_members
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        projectId,
        sanitizeHTML(updateData.competition_name || ""),
        updateData.competition_year || defaultYear,
        updateData.competition_level || "university",
        sanitizeHTML(updateData.achievement || ""),
        sanitizeHTML(updateData.team_members || ""),
      ]
    );
  }
}

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

    if (updateData.course_code !== undefined) {
      updateFields.push("course_code = ?");
      updateParams.push(sanitizeHTML(updateData.course_code));
    }

    if (updateData.course_name !== undefined) {
      updateFields.push("course_name = ?");
      updateParams.push(sanitizeHTML(updateData.course_name));
    }

    if (updateData.instructor !== undefined) {
      updateFields.push("instructor = ?");
      updateParams.push(sanitizeHTML(updateData.instructor));
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
    await connection.execute(
      `
      INSERT INTO courseworks (
        project_id, 
        course_code, 
        course_name, 
        instructor
      ) VALUES (?, ?, ?, ?)
    `,
      [
        projectId,
        sanitizeHTML(updateData.course_code || ""),
        sanitizeHTML(updateData.course_name || ""),
        sanitizeHTML(updateData.instructor || ""),
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

    // Get files to delete after database transaction
    const [files] = await pool.execute(
      `SELECT file_path FROM project_files WHERE project_id = ?`,
      [projectId]
    );

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

      // Delete company views
      await connection.execute(
        `DELETE FROM company_views WHERE project_id = ?`,
        [projectId]
      );

      // Delete project reviews
      await connection.execute(
        `DELETE FROM project_reviews WHERE project_id = ?`,
        [projectId]
      );

      // Delete project images
      await connection.execute(
        `DELETE FROM project_images WHERE project_id = ?`,
        [projectId]
      );

      // Delete project files
      await connection.execute(
        `DELETE FROM project_files WHERE project_id = ?`,
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

    // Save file
    const [result] = await pool.execute(
      `
      INSERT INTO project_files (
        project_id, file_type, file_path, file_name, file_size
      ) VALUES (?, ?, ?, ?, ?)
    `,
      [projectId, fileType, file.path, file.originalname, file.size]
    );

    const fileId = result.insertId;

    // Set status back to pending for admin review
    await pool.execute(
      `
      UPDATE projects SET status = ? WHERE project_id = ?
    `,
      [PROJECT_STATUSES.PENDING, projectId]
    );

    return res.status(STATUS_CODES.CREATED).json(
      successResponse(
        {
          fileId,
          fileName: file.originalname,
          filePath: file.path,
          fileSize: file.size,
          fileType,
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

/**
 * บันทึกการเข้าชมจากบริษัท
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const recordCompanyView = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { company_name, contact_email } = req.body;

    // Validate required fields
    if (!company_name || !contact_email) {
      return validationErrorResponse(res, "Missing required fields", {
        company_name: !company_name ? "Company name is required" : null,
        contact_email: !contact_email ? "Contact email is required" : null,
      });
    }

    // Get project
    const [projects] = await pool.execute(
      `SELECT p.*, u.user_id FROM projects p
       JOIN users u ON p.user_id = u.user_id
       WHERE p.project_id = ? AND p.status = ? AND p.visibility = 1`,
      [projectId, PROJECT_STATUSES.APPROVED]
    );

    if (projects.length === 0) {
      return notFoundResponse(
        res,
        "Project not found or not publicly accessible"
      );
    }

    const project = projects[0];

    // Record company view
    await pool.execute(
      `
      INSERT INTO company_views (
        company_name, contact_email, project_id
      ) VALUES (?, ?, ?)
    `,
      [sanitizeHTML(company_name), sanitizeHTML(contact_email), projectId]
    );

    // Update view count
    await pool.execute(
      `
      UPDATE projects SET views_count = views_count + 1 WHERE project_id = ?
    `,
      [projectId]
    );

    // Notify project owner
    await notificationService.notifyCompanyView(
      project.user_id,
      projectId,
      project.title,
      company_name,
      contact_email
    );

    return res.json(
      successResponse(null, "Company view recorded successfully")
    );
  } catch (error) {
    logger.error(
      `Error recording company view for project ${req.params.projectId}:`,
      error
    );
    return handleServerError(res, error);
  }
};

/**
 * บันทึกการเข้าชมจากผู้เยี่ยมชม
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const recordVisitorView = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Get project
    const [projects] = await pool.execute(
      `SELECT * FROM projects WHERE project_id = ? AND status = ? AND visibility = 1`,
      [projectId, PROJECT_STATUSES.APPROVED]
    );

    if (projects.length === 0) {
      return notFoundResponse(
        res,
        "Project not found or not publicly accessible"
      );
    }

    // Record visitor view
    await pool.execute(
      `
      INSERT INTO visitor_views (
        project_id, ip_address, user_agent
      ) VALUES (?, ?, ?)
    `,
      [projectId, req.ip, req.headers["user-agent"] || "Unknown"]
    );

    // Update view count
    await pool.execute(
      `
      UPDATE projects SET views_count = views_count + 1 WHERE project_id = ?
    `,
      [projectId]
    );

    return res.json(
      successResponse(null, "Visitor view recorded successfully")
    );
  } catch (error) {
    logger.error(
      `Error recording visitor view for project ${req.params.projectId}:`,
      error
    );
    return handleServerError(res, error);
  }
};

/**
 * ดึงข้อมูลประเภทโครงการทั้งหมด
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getProjectTypes = async (req, res) => {
  try {
    // Get project types from constants
    const projectTypes = Object.values(PROJECT_TYPES).map((type) => ({
      value: type,
      label:
        type === PROJECT_TYPES.COURSEWORK
          ? "ผลงานการเรียน"
          : type === PROJECT_TYPES.ACADEMIC
          ? "บทความวิชาการ"
          : "การแข่งขัน",
    }));

    return res.json(
      successResponse(projectTypes, "Project types retrieved successfully")
    );
  } catch (error) {
    logger.error("Error getting project types:", error);
    return handleServerError(res, error);
  }
};

/**
 * ดึงข้อมูลปีการศึกษาทั้งหมดที่มีในระบบ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getProjectYears = async (req, res) => {
  try {
    const [years] = await pool.execute(
      `
      SELECT DISTINCT year FROM projects 
      WHERE status = ? 
      ORDER BY year DESC
    `,
      [PROJECT_STATUSES.APPROVED]
    );

    return res.json(
      successResponse(
        years.map((y) => y.year),
        "Project years retrieved successfully"
      )
    );
  } catch (error) {
    logger.error("Error getting project years:", error);
    return handleServerError(res, error);
  }
};

/**
 * ดึงข้อมูลชั้นปีของนักศึกษาทั้งหมด
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getStudyYears = async (req, res) => {
  try {
    const [years] = await pool.execute(
      `
      SELECT DISTINCT study_year FROM projects 
      WHERE status = ? 
      ORDER BY study_year
    `,
      [PROJECT_STATUSES.APPROVED]
    );

    return res.json(
      successResponse(
        years.map((y) => y.study_year),
        "Study years retrieved successfully"
      )
    );
  } catch (error) {
    logger.error("Error getting study years:", error);
    return handleServerError(res, error);
  }
};

/**
 * ดึงข้อมูลโครงการที่รอการอนุมัติ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPendingProjects = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return forbiddenResponse(res, "Only admin can access pending projects");
    }

    // Get pagination parameters
    const pagination = getPaginationParams(req);

    // Set filters for pending projects
    const filters = {
      status: PROJECT_STATUSES.PENDING,
    };

    // Get pending projects
    const result = await projectService.getAllProjects(filters, pagination);

    // Format projects for response
    const formattedProjects = result.projects.map((project) => ({
      id: project.project_id,
      title: project.title,
      description: truncateText(project.description, 150),
      category: project.type,
      level: `ปี ${project.study_year}`,
      year: project.year,
      image: project.image || null,
      student: project.full_name,
      studentId: project.user_id,
      projectLink: `/projects/${project.project_id}`,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    }));

    return res.json(
      successResponse(
        {
          projects: formattedProjects,
          pagination: result.pagination,
        },
        "Pending projects retrieved successfully"
      )
    );
  } catch (error) {
    logger.error("Error getting pending projects:", error);
    return handleServerError(res, error);
  }
};

/**
 * อนุมัติหรือปฏิเสธโครงการ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const reviewProject = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return forbiddenResponse(res, "Only admin can review projects");
    }

    const projectId = req.params.projectId;
    const { status, comment } = req.body;

    // Validate status
    if (
      !status ||
      !isValidStatus(status) ||
      status === PROJECT_STATUSES.PENDING
    ) {
      return validationErrorResponse(res, "Invalid status", {
        status: `Status must be either "${PROJECT_STATUSES.APPROVED}" or "${PROJECT_STATUSES.REJECTED}"`,
      });
    }

    // Get project
    const [projects] = await pool.execute(
      `
      SELECT p.*, u.email, u.username, u.full_name
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.project_id = ?
    `,
      [projectId]
    );

    if (projects.length === 0) {
      return notFoundResponse(res, "Project not found");
    }

    const project = projects[0];

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update project status
      await connection.execute(
        `
        UPDATE projects SET status = ? WHERE project_id = ?
      `,
        [status, projectId]
      );

      // Record review
      await connection.execute(
        `
        INSERT INTO project_reviews (
          project_id, admin_id, status, review_comment
        ) VALUES (?, ?, ?, ?)
      `,
        [projectId, req.user.id, status, comment || null]
      );

      // Commit transaction
      await connection.commit();

      // Notify project owner
      await notificationService.notifyProjectReview(
        project.user_id,
        projectId,
        project.title,
        status,
        comment
      );

      return res.json(
        successResponse(
          {
            projectId,
            status,
            title: project.title,
            studentName: project.full_name,
            studentEmail: project.email,
          },
          `Project ${
            status === PROJECT_STATUSES.APPROVED ? "approved" : "rejected"
          } successfully`
        )
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    logger.error(`Error reviewing project ${req.params.projectId}:`, error);
    return handleServerError(res, error);
  }
};

/**
 * ดึงข้อมูลสถิติโครงการสำหรับ Dashboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getProjectStats = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return forbiddenResponse(res, "Only admin can access project statistics");
    }

    // Get total projects count
    const [totalProjects] = await pool.execute(`
      SELECT COUNT(*) as count FROM projects
    `);

    // Get projects by type
    const [projectsByType] = await pool.execute(`
      SELECT type, COUNT(*) as count FROM projects GROUP BY type
    `);

    // Get projects by status
    const [projectsByStatus] = await pool.execute(`
      SELECT status, COUNT(*) as count FROM projects GROUP BY status
    `);

    // Get projects by month (last 12 months)
    const [projectsByMonth] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month, 
        COUNT(*) as count 
      FROM projects 
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month 
      ORDER BY month
    `);

    // Get top viewed projects
    const [topViewedProjects] = await pool.execute(
      `
      SELECT p.project_id, p.title, p.views_count, p.type, u.username, u.full_name
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.status = ?
      ORDER BY p.views_count DESC
      LIMIT 10
    `,
      [PROJECT_STATUSES.APPROVED]
    );

    return res.json(
      successResponse(
        {
          total: totalProjects[0].count,
          byType: projectsByType.map((item) => ({
            type: item.type,
            count: item.count,
            label:
              item.type === PROJECT_TYPES.COURSEWORK
                ? "ผลงานการเรียน"
                : item.type === PROJECT_TYPES.ACADEMIC
                ? "บทความวิชาการ"
                : "การแข่งขัน",
          })),
          byStatus: projectsByStatus.map((item) => ({
            status: item.status,
            count: item.count,
            label:
              item.status === PROJECT_STATUSES.PENDING
                ? "รอการอนุมัติ"
                : item.status === PROJECT_STATUSES.APPROVED
                ? "อนุมัติแล้ว"
                : "ถูกปฏิเสธ",
          })),
          byMonth: projectsByMonth,
          topViewed: topViewedProjects.map((project) => ({
            id: project.project_id,
            title: project.title,
            views: project.views_count,
            type: project.type,
            author: project.full_name,
            username: project.username,
          })),
        },
        "Project statistics retrieved successfully"
      )
    );
  } catch (error) {
    logger.error("Error getting project statistics:", error);
    return handleServerError(res, error);
  }
};

/**
 * Helper function to handle project file uploads
 */
async function handleProjectFiles(connection, projectId, projectType, files) {
  for (const fieldName in files) {
    const fileList = Array.isArray(files[fieldName])
      ? files[fieldName]
      : [files[fieldName]];

    for (const file of fileList) {
      let fileType = "other";

      // Determine file type
      if (file.mimetype.startsWith("image/")) {
        fileType = "image";
      } else if (file.mimetype.startsWith("video/")) {
        fileType = "video";
      } else if (file.mimetype === "application/pdf") {
        fileType = "pdf";
      }

      // Insert file record
      const [fileResult] = await connection.execute(
        `
        INSERT INTO project_files (
          project_id, file_type, file_path, file_name, file_size
        ) VALUES (?, ?, ?, ?, ?)
      `,
        [projectId, fileType, file.path, file.originalname, file.size]
      );

      const fileId = fileResult.insertId;

      // Handle special file types
      if (fieldName === "coverImage" && fileType === "image") {
        await connection.execute(
          `
          UPDATE projects 
          SET cover_image_id = ? 
          WHERE project_id = ?
        `,
          [fileId, projectId]
        );
      }

      if (projectType === PROJECT_TYPES.ACADEMIC) {
        if (fieldName === "paper_file" && fileType === "pdf") {
          await connection.execute(
            `
            UPDATE academic_papers 
            SET paper_file_id = ? 
            WHERE project_id = ?
          `,
            [fileId, projectId]
          );
        } else if (fieldName === "cover_image" && fileType === "image") {
          await connection.execute(
            `
            UPDATE academic_papers 
            SET cover_image_id = ? 
            WHERE project_id = ?
          `,
            [fileId, projectId]
          );
        }
      } else if (projectType === PROJECT_TYPES.COMPETITION) {
        if (fieldName === "poster_file" && fileType === "image") {
          await connection.execute(
            `
            UPDATE competitions 
            SET poster_file_id = ? 
            WHERE project_id = ?
          `,
            [fileId, projectId]
          );
        }
      } else if (projectType === PROJECT_TYPES.COURSEWORK) {
        if (fieldName === "coursework_poster" && fileType === "image") {
          await connection.execute(
            `
            UPDATE courseworks 
            SET poster_file_id = ? 
            WHERE project_id = ?
          `,
            [fileId, projectId]
          );
        } else if (fieldName === "coursework_video" && fileType === "video") {
          await connection.execute(
            `
            UPDATE courseworks 
            SET video_file_id = ? 
            WHERE project_id = ?
          `,
            [fileId, projectId]
          );
        }
      }
    }
  }
}
