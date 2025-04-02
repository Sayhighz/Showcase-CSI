// controllers/user/projectController.js
import pool from "../../config/database.js";
import {
  handleServerError,
  notFoundResponse,
  successResponse,
} from "../../utils/responseFormatter.js";
import { deleteFile } from "../../utils/fileHelper.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { sendProjectStatusEmail } from "../../services/emailService.js";

// สร้าง storage และกำหนดตำแหน่งที่เก็บไฟล์
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = "uploads/";

    // กำหนด path ตามประเภทของไฟล์
    if (file.mimetype.startsWith("image/")) {
      uploadPath += "images/";
    } else if (file.mimetype.startsWith("video/")) {
      uploadPath += "videos/";
    } else if (file.mimetype === "application/pdf") {
      uploadPath += "documents/";
    } else {
      uploadPath += "others/";
    }

    // สร้างโฟลเดอร์ถ้ายังไม่มี
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// กำหนด multer สำหรับอัปโหลดไฟล์
export const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/**
 * ดึงข้อมูลโครงการทั้งหมดที่ได้รับการอนุมัติแล้ว
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const category = req.query.category || "";
    const year = req.query.year || "";
    const level = req.query.level || "";

    // สร้าง query พื้นฐาน
    let query = `
      SELECT p.*, u.username, u.full_name,
             (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as image,
             (SELECT COUNT(*) FROM visitor_views vv WHERE vv.project_id = p.project_id) + 
             (SELECT COUNT(*) FROM company_views cv WHERE cv.project_id = p.project_id) as views_count
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.status = 'approved' AND p.visibility = 1
    `;

    const queryParams = [];

    // เพิ่มเงื่อนไขการค้นหา
    if (category) {
      query += ` AND p.type = ?`;
      queryParams.push(category);
    }

    if (year) {
      query += ` AND p.year = ?`;
      queryParams.push(year);
    }

    if (level) {
      query += ` AND p.study_year = ?`;
      queryParams.push(level);
    }

    // ดึงข้อมูลจำนวนทั้งหมดสำหรับการแบ่งหน้า
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as countTable`;
    const [countResult] = await pool.execute(countQuery, queryParams);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // เพิ่ม ORDER BY และ LIMIT เข้าไปใน query
    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    // ดึงข้อมูลโครงการ
    const [projects] = await pool.execute(query, queryParams);

    return res.json(
      successResponse(
        {
          projects: projects.map((project) => ({
            id: project.project_id,
            title: project.title,
            description: project.description,
            category: project.type,
            level: `ปี ${project.study_year}`,
            year: project.year,
            image: project.image || "https://via.placeholder.com/150",
            student: project.full_name,
            studentId: project.user_id,
            projectLink: `/projects/${project.project_id}`,
            viewsCount: project.views_count,
          })),
          pagination: {
            page,
            limit,
            totalItems,
            totalPages,
          },
        },
        "Projects retrieved successfully"
      )
    );
  } catch (error) {
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
    const query = `
      SELECT p.*, u.username, u.full_name,
             (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as image,
             (SELECT COUNT(*) FROM visitor_views vv WHERE vv.project_id = p.project_id) + 
             (SELECT COUNT(*) FROM company_views cv WHERE cv.project_id = p.project_id) as views_count
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.status = 'approved' AND p.visibility = 1
      ORDER BY views_count DESC
      LIMIT 9
    `;

    const [projects] = await pool.execute(query);

    return res.json(
      successResponse(
        projects.map((project) => ({
          id: project.project_id,
          title: project.title,
          description: project.description,
          category: project.type,
          level: `ปี ${project.study_year}`,
          year: project.year,
          image: project.image || "https://via.placeholder.com/150",
          student: project.full_name,
          studentId: project.user_id,
          projectLink: `/projects/${project.project_id}`,
          viewsCount: project.views_count,
        })),
        "Top 9 projects retrieved successfully"
      )
    );
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * ดึงข้อมูลโครงการล่าสุด 9 โครงการ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getLatestProjects = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 9;

    const query = `
      SELECT p.*, u.username, u.full_name,
             (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as image
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.status = 'approved' AND p.visibility = 1
      ORDER BY p.created_at DESC
      LIMIT ?
    `;

    const [projects] = await pool.execute(query, [limit]);

    return res.json(
      successResponse(
        projects.map((project) => ({
          id: project.project_id,
          title: project.title,
          description: project.description,
          category: project.type,
          level: `ปี ${project.study_year}`,
          year: project.year,
          image: project.image || "https://via.placeholder.com/150",
          student: project.full_name,
          studentId: project.user_id,
          projectLink: `/projects/${project.project_id}`,
        })),
        "Latest projects retrieved successfully"
      )
    );
  } catch (error) {
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

    // ตรวจสอบว่าผู้ใช้เป็นเจ้าของโครงการจริงหรือไม่
    if (req.user.id != userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "You can only view your own projects",
      });
    }

    const query = `
      SELECT p.*, 
             (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as image
      FROM projects p
      WHERE p.user_id = ?
      OR EXISTS (SELECT 1 FROM project_groups pg WHERE pg.project_id = p.project_id AND pg.user_id = ?)
      ORDER BY p.created_at DESC
    `;

    const [projects] = await pool.execute(query, [userId, userId]);

    return res.json(
      successResponse(
        projects.map((project) => ({
          id: project.project_id,
          title: project.title,
          description: project.description,
          category: project.type,
          level: `ปี ${project.study_year}`,
          year: project.year,
          status: project.status,
          image: project.image || "https://via.placeholder.com/150",
          projectLink: `/projects/${project.project_id}`,
        })),
        "My projects retrieved successfully"
      )
    );
  } catch (error) {
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

    // ดึงข้อมูลโครงการ
    const [projects] = await pool.execute(
      `
      SELECT p.*, u.username, u.full_name
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

    // ตรวจสอบว่าสามารถเข้าถึงได้หรือไม่ (กรณีที่ visibility = 0 และไม่ใช่เจ้าของหรือผู้ดูแลระบบ)
    if (
      project.visibility === 0 &&
      (!req.user ||
        (req.user.id != project.user_id && req.user.role !== "admin"))
    ) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "You do not have permission to view this project",
      });
    }

    // ดึงข้อมูลไฟล์
    const [files] = await pool.execute(
      `
      SELECT file_id, file_type, file_path, file_name
      FROM project_files
      WHERE project_id = ?
    `,
      [projectId]
    );

    // ดึงข้อมูลผู้ร่วมงาน
    const [authors] = await pool.execute(
      `
      SELECT u.user_id, u.username, u.full_name, u.image
      FROM project_groups pg
      JOIN users u ON pg.user_id = u.user_id
      WHERE pg.project_id = ?
    `,
      [projectId]
    );

    // ดึงข้อมูลเพิ่มเติมตามประเภทของโครงการ
    let additionalData = {};

    if (project.type === "academic") {
      const [academic] = await pool.execute(
        `
        SELECT * FROM academic_papers WHERE project_id = ?
      `,
        [projectId]
      );

      if (academic.length > 0) {
        additionalData = {
          academic: academic[0],
        };
      }
    } else if (project.type === "competition") {
      const [competition] = await pool.execute(
        `
        SELECT * FROM competitions WHERE project_id = ?
      `,
        [projectId]
      );

      if (competition.length > 0) {
        additionalData = {
          competition: competition[0],
        };
      }
    } else if (project.type === "coursework") {
      const [coursework] = await pool.execute(
        `
        SELECT * FROM courseworks WHERE project_id = ?
      `,
        [projectId]
      );

      if (coursework.length > 0) {
        additionalData = {
          coursework: coursework[0],
        };
      }
    }

    // บันทึกการเข้าชม (ยกเว้นเจ้าของโครงการ)
    if (!req.user || req.user.id != project.user_id) {
      // บันทึกการเข้าชมของผู้เยี่ยมชม
      await pool.execute(
        `
        INSERT INTO visitor_views (project_id, ip_address, user_agent)
        VALUES (?, ?, ?)
      `,
        [projectId, req.ip, req.headers["user-agent"]]
      );

      // อัปเดตจำนวนการเข้าชม
      await pool.execute(
        `
        UPDATE projects
        SET views_count = views_count + 1
        WHERE project_id = ?
      `,
        [projectId]
      );
    }

    // จัดรูปแบบข้อมูลสำหรับการส่งกลับ
    const projectData = {
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
      },
      authors: authors.map((author) => ({
        userId: author.user_id,
        username: author.username,
        fullName: author.full_name,
        image: author.image,
      })),
      images: files
        .filter((file) => file.file_type === "image")
        .map((file) => file.file_path),
      pdfFiles: files
        .filter((file) => file.file_type === "pdf")
        .map((file) => ({
          id: file.file_id,
          name: file.file_name,
          url: file.file_path,
        })),
      video: files
        .filter((file) => file.file_type === "video")
        .map((file) => file.file_path)[0],
      projectCreatedAt: project.created_at,
      ...additionalData,
    };

    return res.json(
      successResponse(projectData, "Project details retrieved successfully")
    );
  } catch (error) {
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
    const type = req.query.type || "";
    const year = req.query.year || "";
    const studyYear = req.query.study_year || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // สร้าง query พื้นฐาน
    let query = `
      SELECT p.*, u.username, u.full_name,
             (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as image
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.status = 'approved' AND p.visibility = 1
    `;

    const queryParams = [];

    // เพิ่มเงื่อนไขการค้นหา
    if (keyword) {
      query += ` AND (p.title LIKE ? OR p.description LIKE ? OR p.tags LIKE ?)`;
      queryParams.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    if (type) {
      query += ` AND p.type = ?`;
      queryParams.push(type);
    }

    if (year) {
      query += ` AND p.year = ?`;
      queryParams.push(year);
    }

    if (studyYear) {
      query += ` AND p.study_year = ?`;
      queryParams.push(studyYear);
    }

    // ดึงข้อมูลจำนวนทั้งหมดสำหรับการแบ่งหน้า
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as countTable`;
    const [countResult] = await pool.execute(countQuery, queryParams);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // เพิ่ม ORDER BY และ LIMIT เข้าไปใน query
    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    // ดึงข้อมูลโครงการ
    const [projects] = await pool.execute(query, queryParams);

    // จัดรูปแบบข้อมูลสำหรับการส่งกลับ
    const searchResults = projects.map((project) => ({
      id: project.project_id,
      title: project.title,
      description: project.description,
      category: project.type,
      level: `ปี ${project.study_year}`,
      year: project.year,
      image: project.image || "https://via.placeholder.com/150",
      student: project.full_name,
      studentId: project.user_id,
      projectLink: `/projects/${project.project_id}`,
    }));

    return res.json(
      successResponse(
        {
          projects: searchResults,
          pagination: {
            page,
            limit,
            totalItems,
            totalPages,
          },
        },
        "Search results retrieved successfully"
      )
    );
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * อัปโหลดโครงการใหม่
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const uploadProject = async (req, res) => {
  try {
    // เริ่มต้น transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const userId = req.params.user_id;
      const {
        title,
        description,
        type,
        study_year,
        year,
        semester,
        visibility = 1,
        tags = "",
        contributors = [],
        videoLink = "",
      } = req.body;

      // ตรวจสอบข้อมูลที่จำเป็น
      if (
        !title ||
        !description ||
        !type ||
        !study_year ||
        !year ||
        !semester
      ) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message:
            "Title, description, type, study_year, year, and semester are required",
        });
      }

      // เพิ่มข้อมูลโครงการหลัก
      const [result] = await connection.execute(
        `
    INSERT INTO projects (
      user_id, title, description, type, study_year, year, semester, visibility, status, tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `,
        [
          userId,
          title,
          description,
          type,
          study_year,
          year,
          semester,
          visibility,
          tags,
        ]
      );

      const projectId = result.insertId;

      // เพิ่มข้อมูลผู้ร่วมงาน
      if (contributors && contributors.length > 0) {
        const parsedContributors =
          typeof contributors === "string"
            ? JSON.parse(contributors)
            : contributors;

        for (const contributor of parsedContributors) {
          await connection.execute(
            `
        INSERT INTO project_groups (project_id, user_id)
        VALUES (?, ?)
      `,
            [projectId, contributor.user_id]
          );
        }
      }

      // เพิ่มข้อมูลวิดีโอลิงก์ (ถ้ามี)
      if (videoLink) {
        await connection.execute(
          `
      INSERT INTO project_files (project_id, file_type, file_path, file_name, file_size)
      VALUES (?, 'video', ?, ?, 0)
    `,
          [projectId, videoLink, "video_link"]
        );
      }

      // เพิ่มข้อมูลเฉพาะประเภท
      if (type === "academic") {
        const {
          abstract = "",
          publication_date = null,
          published_year = year,
          authors = "",
          publication_venue = "",
        } = req.body;

        await connection.execute(
          `
      INSERT INTO academic_papers (
        project_id, publication_date, published_year, abstract, authors, publication_venue
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
          [
            projectId,
            publication_date,
            published_year,
            abstract,
            authors,
            publication_venue,
          ]
        );
      } else if (type === "competition") {
        const {
          competition_name = "",
          competition_year = year,
          competition_level = "university",
          achievement = "",
          team_members = "",
        } = req.body;

        await connection.execute(
          `
      INSERT INTO competitions (
        project_id, competition_name, competition_year, competition_level, achievement, team_members
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
          [
            projectId,
            competition_name,
            competition_year,
            competition_level,
            achievement,
            team_members,
          ]
        );
      } else if (type === "coursework") {
        const {
          course_code = "",
          course_name = "",
          instructor = "",
        } = req.body;

        await connection.execute(
          `
      INSERT INTO courseworks (
        project_id, course_code, course_name, instructor
      ) VALUES (?, ?, ?, ?)
    `,
          [projectId, course_code, course_name, instructor]
        );
      }

      // จัดการกับไฟล์ที่อัปโหลด
      if (req.files) {
        for (const fieldName in req.files) {
          const files = Array.isArray(req.files[fieldName])
            ? req.files[fieldName]
            : [req.files[fieldName]];

          for (const file of files) {
            let fileType = "other";

            if (file.mimetype.startsWith("image/")) {
              fileType = "image";
            } else if (file.mimetype.startsWith("video/")) {
              fileType = "video";
            } else if (file.mimetype === "application/pdf") {
              fileType = "pdf";
            }

            await connection.execute(
              `
          INSERT INTO project_files (
            project_id, file_type, file_path, file_name, file_size
          ) VALUES (?, ?, ?, ?, ?)
        `,
              [projectId, fileType, file.path, file.originalname, file.size]
            );

            // ถ้าเป็น cover image ให้อัปเดต cover_image_id ในตาราง projects
            if (fieldName === "coverImage") {
              const [fileResult] = await connection.execute(
                `
            SELECT file_id FROM project_files 
            WHERE project_id = ? AND file_path = ?
          `,
                [projectId, file.path]
              );

              if (fileResult.length > 0) {
                await connection.execute(
                  `
              UPDATE projects SET cover_image_id = ? WHERE project_id = ?
            `,
                  [fileResult[0].file_id, projectId]
                );
              }
            }

            // จัดการกับไฟล์เฉพาะประเภท
            if (type === "competition" && fieldName === "poster_file") {
              const [fileResult] = await connection.execute(
                `
            SELECT file_id FROM project_files 
            WHERE project_id = ? AND file_path = ?
          `,
                [projectId, file.path]
              );

              if (fileResult.length > 0) {
                await connection.execute(
                  `
              UPDATE competitions SET poster_file_id = ? WHERE project_id = ?
            `,
                  [fileResult[0].file_id, projectId]
                );
              }
            } else if (type === "academic" && fieldName === "paper_file") {
              const [fileResult] = await connection.execute(
                `
            SELECT file_id FROM project_files 
            WHERE project_id = ? AND file_path = ?
          `,
                [projectId, file.path]
              );

              if (fileResult.length > 0) {
                await connection.execute(
                  `
              UPDATE academic_papers SET paper_file_id = ? WHERE project_id = ?
            `,
                  [fileResult[0].file_id, projectId]
                );
              }
            } else if (type === "coursework") {
              if (fieldName === "coursework_poster") {
                const [fileResult] = await connection.execute(
                  `
              SELECT file_id FROM project_files 
              WHERE project_id = ? AND file_path = ?
            `,
                  [projectId, file.path]
                );

                if (fileResult.length > 0) {
                  await connection.execute(
                    `
                UPDATE courseworks SET poster_file_id = ? WHERE project_id = ?
              `,
                    [fileResult[0].file_id, projectId]
                  );
                }
              } else if (fieldName === "coursework_video") {
                const [fileResult] = await connection.execute(
                  `
              SELECT file_id FROM project_files 
              WHERE project_id = ? AND file_path = ?
            `,
                  [projectId, file.path]
                );

                if (fileResult.length > 0) {
                  await connection.execute(
                    `
                UPDATE courseworks SET video_file_id = ? WHERE project_id = ?
              `,
                    [fileResult[0].file_id, projectId]
                  );
                }
              }
            }
          }
        }
      }

      // Commit the transaction
      await connection.commit();

      return res.status(201).json(
        successResponse(
          {
            projectId,
            message:
              "Project submitted successfully. Please wait for admin approval.",
          },
          "Project created successfully"
        )
      );
    } catch (error) {
      // Rollback the transaction if there's an error
      await connection.rollback();
      throw error;
    } finally {
      // Release the connection
      connection.release();
    }
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * อัปเดตข้อมูลโครงการ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // ตรวจสอบว่าโครงการมีอยู่จริงหรือไม่
    const [projects] = await pool.execute(
      `
  SELECT * FROM projects WHERE project_id = ?
`,
      [projectId]
    );

    if (projects.length === 0) {
      return notFoundResponse(res, "Project not found");
    }

    const project = projects[0];

    // ตรวจสอบว่าผู้ใช้เป็นเจ้าของโครงการหรือไม่
    if (req.user.id != project.user_id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "You can only update your own projects",
      });
    }

    // เริ่มต้น transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const {
        title,
        description,
        study_year,
        year,
        semester,
        visibility,
        tags,
        contributors,
        videoLink,
      } = req.body;

      // อัปเดตข้อมูลโครงการหลัก
      await connection.execute(
        `
    UPDATE projects
    SET title = COALESCE(?, title),
        description = COALESCE(?, description),
        study_year = COALESCE(?, study_year),
        year = COALESCE(?, year),
        semester = COALESCE(?, semester),
        visibility = COALESCE(?, visibility),
        tags = COALESCE(?, tags),
        status = 'pending',
        updated_at = NOW()
    WHERE project_id = ?
  `,
        [
          title,
          description,
          study_year,
          year,
          semester,
          visibility,
          tags,
          projectId,
        ]
      );

      // อัปเดตข้อมูลผู้ร่วมงาน (ถ้ามี)
      if (contributors) {
        // ลบข้อมูลผู้ร่วมงานเดิม
        await connection.execute(
          `
      DELETE FROM project_groups WHERE project_id = ?
    `,
          [projectId]
        );

        // เพิ่มข้อมูลผู้ร่วมงานใหม่
        const parsedContributors =
          typeof contributors === "string"
            ? JSON.parse(contributors)
            : contributors;

        for (const contributor of parsedContributors) {
          await connection.execute(
            `
        INSERT INTO project_groups (project_id, user_id)
        VALUES (?, ?)
      `,
            [projectId, contributor.user_id]
          );
        }
      }

      // อัปเดตข้อมูลวิดีโอลิงก์ (ถ้ามี)
      if (videoLink !== undefined) {
        // ลบข้อมูลวิดีโอลิงก์เดิม
        await connection.execute(
          `
      DELETE FROM project_files
      WHERE project_id = ? AND file_type = 'video' AND file_name = 'video_link'
    `,
          [projectId]
        );

        // เพิ่มข้อมูลวิดีโอลิงก์ใหม่ (ถ้ามี)
        if (videoLink) {
          await connection.execute(
            `
        INSERT INTO project_files (project_id, file_type, file_path, file_name, file_size)
        VALUES (?, 'video', ?, 'video_link', 0)
      `,
            [projectId, videoLink]
          );
        }
      }

      // อัปเดตข้อมูลเฉพาะประเภท
      if (project.type === "academic") {
        const {
          abstract,
          publication_date,
          published_year,
          authors,
          publication_venue,
        } = req.body;

        // ตรวจสอบว่ามีข้อมูลในตาราง academic_papers หรือไม่
        const [academic] = await connection.execute(
          `
      SELECT * FROM academic_papers WHERE project_id = ?
    `,
          [projectId]
        );

        if (academic.length > 0) {
          // อัปเดตข้อมูล
          await connection.execute(
            `
        UPDATE academic_papers
        SET publication_date = COALESCE(?, publication_date),
            published_year = COALESCE(?, published_year),
            abstract = COALESCE(?, abstract),
            authors = COALESCE(?, authors),
            publication_venue = COALESCE(?, publication_venue),
            last_updated = NOW()
        WHERE project_id = ?
      `,
            [
              publication_date,
              published_year,
              abstract,
              authors,
              publication_venue,
              projectId,
            ]
          );
        } else {
          // เพิ่มข้อมูลใหม่
          await connection.execute(
            `
        INSERT INTO academic_papers (
          project_id, publication_date, published_year, abstract, authors, publication_venue
        ) VALUES (?, ?, ?, ?, ?, ?)
      `,
            [
              projectId,
              publication_date || null,
              published_year || year,
              abstract || "",
              authors || "",
              publication_venue || "",
            ]
          );
        }
      } else if (project.type === "competition") {
        const {
          competition_name,
          competition_year,
          competition_level,
          achievement,
          team_members,
        } = req.body;

        // ตรวจสอบว่ามีข้อมูลในตาราง competitions หรือไม่
        const [competition] = await connection.execute(
          `
      SELECT * FROM competitions WHERE project_id = ?
    `,
          [projectId]
        );

        if (competition.length > 0) {
          // อัปเดตข้อมูล
          await connection.execute(
            `
        UPDATE competitions
        SET competition_name = COALESCE(?, competition_name),
            competition_year = COALESCE(?, competition_year),
            competition_level = COALESCE(?, competition_level),
            achievement = COALESCE(?, achievement),
            team_members = COALESCE(?, team_members)
        WHERE project_id = ?
      `,
            [
              competition_name,
              competition_year,
              competition_level,
              achievement,
              team_members,
              projectId,
            ]
          );
        } else {
          // เพิ่มข้อมูลใหม่
          await connection.execute(
            `
        INSERT INTO competitions (
          project_id, competition_name, competition_year, competition_level, achievement, team_members
        ) VALUES (?, ?, ?, ?, ?, ?)
      `,
            [
              projectId,
              competition_name || "",
              competition_year || year,
              competition_level || "university",
              achievement || "",
              team_members || "",
            ]
          );
        }
      } else if (project.type === "coursework") {
        const { course_code, course_name, instructor } = req.body;

        // ตรวจสอบว่ามีข้อมูลในตาราง courseworks หรือไม่
        const [coursework] = await connection.execute(
          `
      SELECT * FROM courseworks WHERE project_id = ?
    `,
          [projectId]
        );

        if (coursework.length > 0) {
          // อัปเดตข้อมูล
          await connection.execute(
            `
        UPDATE courseworks
        SET course_code = COALESCE(?, course_code),
            course_name = COALESCE(?, course_name),
            instructor = COALESCE(?, instructor)
        WHERE project_id = ?
      `,
            [course_code, course_name, instructor, projectId]
          );
        } else {
          // เพิ่มข้อมูลใหม่
          await connection.execute(
            `
        INSERT INTO courseworks (
          project_id, course_code, course_name, instructor
        ) VALUES (?, ?, ?, ?)
      `,
            [projectId, course_code || "", course_name || "", instructor || ""]
          );
        }
      }

      // จัดการกับไฟล์ที่อัปโหลด
      if (req.files) {
        for (const fieldName in req.files) {
          const files = Array.isArray(req.files[fieldName])
            ? req.files[fieldName]
            : [req.files[fieldName]];

          for (const file of files) {
            let fileType = "other";

            if (file.mimetype.startsWith("image/")) {
              fileType = "image";
            } else if (file.mimetype.startsWith("video/")) {
              fileType = "video";
            } else if (file.mimetype === "application/pdf") {
              fileType = "pdf";
            }

            // เพิ่มข้อมูลไฟล์
            await connection.execute(
              `
          INSERT INTO project_files (
            project_id, file_type, file_path, file_name, file_size
          ) VALUES (?, ?, ?, ?, ?)
        `,
              [projectId, fileType, file.path, file.originalname, file.size]
            );

            // จัดการกับไฟล์เฉพาะประเภท (เหมือนกับ uploadProject)
            // ...
          }
        }
      }

      // Commit the transaction
      await connection.commit();

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
      // Rollback the transaction if there's an error
      await connection.rollback();
      throw error;
    } finally {
      // Release the connection
      connection.release();
    }
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * ลบโครงการ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // ตรวจสอบว่าโครงการมีอยู่จริงหรือไม่
    const [projects] = await pool.execute(
      `
  SELECT * FROM projects WHERE project_id = ?
`,
      [projectId]
    );

    if (projects.length === 0) {
      return notFoundResponse(res, "Project not found");
    }

    const project = projects[0];

    // ตรวจสอบว่าผู้ใช้เป็นเจ้าของโครงการหรือไม่
    if (req.user.id != project.user_id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "You can only delete your own projects",
      });
    }

    // ดึงข้อมูลไฟล์ที่เกี่ยวข้องกับโครงการ
    const [files] = await pool.execute(
      `
  SELECT * FROM project_files WHERE project_id = ?
`,
      [projectId]
    );

    // เริ่มต้น transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // ลบข้อมูลตามประเภทของโครงการ
      if (project.type === "academic") {
        await connection.execute(
          `
      DELETE FROM academic_papers WHERE project_id = ?
    `,
          [projectId]
        );
      } else if (project.type === "competition") {
        await connection.execute(
          `
      DELETE FROM competitions WHERE project_id = ?
    `,
          [projectId]
        );
      } else if (project.type === "coursework") {
        await connection.execute(
          `
      DELETE FROM courseworks WHERE project_id = ?
    `,
          [projectId]
        );
      }

      // ลบข้อมูลผู้ร่วมงาน
      await connection.execute(
        `
    DELETE FROM project_groups WHERE project_id = ?
  `,
        [projectId]
      );

      // ลบข้อมูลการเข้าชม
      await connection.execute(
        `
    DELETE FROM visitor_views WHERE project_id = ?
  `,
        [projectId]
      );

      await connection.execute(
        `
    DELETE FROM company_views WHERE project_id = ?
  `,
        [projectId]
      );

      // ลบข้อมูลไฟล์
      await connection.execute(
        `
    DELETE FROM project_files WHERE project_id = ?
  `,
        [projectId]
      );

      // ลบข้อมูลการตรวจสอบ
      await connection.execute(
        `
    DELETE FROM project_reviews WHERE project_id = ?
  `,
        [projectId]
      );

      // ลบข้อมูลโครงการหลัก
      await connection.execute(
        `
    DELETE FROM projects WHERE project_id = ?
  `,
        [projectId]
      );

      // Commit the transaction
      await connection.commit();

      // ลบไฟล์จริงจากระบบ (นอก transaction เพื่อไม่ให้กระทบกับ database transaction)
      for (const file of files) {
        // ข้ามไฟล์ที่เป็น link (ไม่ได้เก็บในระบบไฟล์)
        if (file.file_name === "video_link") continue;

        // ลบไฟล์จากระบบ
        deleteFile(file.file_path);
      }

      return res.json(successResponse(null, "Project deleted successfully"));
    } catch (error) {
      // Rollback the transaction if there's an error
      await connection.rollback();
      throw error;
    } finally {
      // Release the connection
      connection.release();
    }
  } catch (error) {
    return handleServerError(res, error);
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

    // ตรวจสอบว่าโครงการมีอยู่จริงหรือไม่
    const [projects] = await pool.execute(
      `
  SELECT * FROM projects WHERE project_id = ?
`,
      [projectId]
    );

    if (projects.length === 0) {
      return notFoundResponse(res, "Project not found");
    }

    const project = projects[0];

    // ตรวจสอบว่าผู้ใช้เป็นเจ้าของโครงการหรือไม่
    if (req.user.id != project.user_id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "You can only upload files to your own projects",
      });
    }

    // ตรวจสอบว่ามีไฟล์หรือไม่
    if (!req.file) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "No file uploaded",
      });
    }

    const file = req.file;
    let fileType = "other";

    // กำหนดประเภทไฟล์
    if (file.mimetype.startsWith("image/")) {
      fileType = "image";
    } else if (file.mimetype.startsWith("video/")) {
      fileType = "video";
    } else if (file.mimetype === "application/pdf") {
      fileType = "pdf";
    }

    // บันทึกข้อมูลไฟล์
    const [result] = await pool.execute(
      `
  INSERT INTO project_files (
    project_id, file_type, file_path, file_name, file_size
  ) VALUES (?, ?, ?, ?, ?)
`,
      [projectId, fileType, file.path, file.originalname, file.size]
    );

    return res.status(201).json(
      successResponse(
        {
          fileId: result.insertId,
          filename: file.originalname,
          path: file.path,
          size: file.size,
          type: fileType,
        },
        "File uploaded successfully"
      )
    );
  } catch (error) {
    // ถ้ามีไฟล์ที่อัปโหลดแล้วเกิด error ให้ลบไฟล์ออก
    if (req.file) {
      deleteFile(req.file.path);
    }

    return handleServerError(res, error);
  }
};

/**
 * ตรวจสอบสถานะการอัปโหลด
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUploadStatus = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;

    // ตรวจสอบว่า session มีอยู่จริงหรือไม่
    const [sessions] = await pool.execute(
      `
  SELECT * FROM upload_sessions WHERE session_id = ?
`,
      [sessionId]
    );

    if (sessions.length === 0) {
      return notFoundResponse(res, "Upload session not found");
    }

    const session = sessions[0];

    // ตรวจสอบว่าผู้ใช้เป็นเจ้าของ session หรือไม่
    if (req.user.id != session.user_id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "You can only check your own upload sessions",
      });
    }

    return res.json(
      successResponse(
        {
          sessionId,
          status: session.status,
          progress: session.progress,
          totalFiles: session.total_files,
          completedFiles: session.completed_files,
          startTime: session.start_time,
          lastUpdated: session.last_updated,
        },
        "Upload status retrieved successfully"
      )
    );
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * ยกเลิกการอัปโหลด
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const cancelUpload = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;

    // ตรวจสอบว่า session มีอยู่จริงหรือไม่
    const [sessions] = await pool.execute(
      `
  SELECT * FROM upload_sessions WHERE session_id = ?
`,
      [sessionId]
    );

    if (sessions.length === 0) {
      return notFoundResponse(res, "Upload session not found");
    }

    const session = sessions[0];

    // ตรวจสอบว่าผู้ใช้เป็นเจ้าของ session หรือไม่
    if (req.user.id != session.user_id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "You can only cancel your own upload sessions",
      });
    }

    // อัปเดตสถานะเป็น cancelled
    await pool.execute(
      `
  UPDATE upload_sessions SET status = 'cancelled', last_updated = NOW()
  WHERE session_id = ?
`,
      [sessionId]
    );

    return res.json(successResponse(null, "Upload cancelled successfully"));
  } catch (error) {
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

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!company_name || !contact_email) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Company name and contact email are required",
      });
    }

    // ตรวจสอบว่าโครงการมีอยู่จริงหรือไม่
    const [projects] = await pool.execute(
      `
  SELECT * FROM projects WHERE project_id = ?
`,
      [projectId]
    );

    if (projects.length === 0) {
      return notFoundResponse(res, "Project not found");
    }

    // ตรวจสอบว่าโครงการเป็นสาธารณะหรือไม่
    if (projects[0].visibility === 0) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "This project is not publicly accessible",
      });
    }

    // บันทึกการเข้าชม
    await pool.execute(
      `
  INSERT INTO company_views (project_id, company_name, contact_email)
  VALUES (?, ?, ?)
`,
      [projectId, company_name, contact_email]
    );

    // อัปเดตจำนวนการเข้าชม
    await pool.execute(
      `
  UPDATE projects
  SET views_count = views_count + 1
  WHERE project_id = ?
`,
      [projectId]
    );

    return res.json(
      successResponse(null, "Company view recorded successfully")
    );
  } catch (error) {
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

    // ตรวจสอบว่าโครงการมีอยู่จริงหรือไม่
    const [projects] = await pool.execute(
      `
  SELECT * FROM projects WHERE project_id = ?
`,
      [projectId]
    );

    if (projects.length === 0) {
      return notFoundResponse(res, "Project not found");
    }

    // ตรวจสอบว่าโครงการเป็นสาธารณะหรือไม่
    if (projects[0].visibility === 0) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "This project is not publicly accessible",
      });
    }

    // บันทึกการเข้าชม
    await pool.execute(
      `
  INSERT INTO visitor_views (project_id, ip_address, user_agent)
  VALUES (?, ?, ?)
`,
      [projectId, req.ip, req.headers["user-agent"]]
    );

    // อัปเดตจำนวนการเข้าชม
    await pool.execute(
      `
  UPDATE projects
  SET views_count = views_count + 1
  WHERE project_id = ?
`,
      [projectId]
    );

    return res.json(
      successResponse(null, "Visitor view recorded successfully")
    );
  } catch (error) {
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
    const projectTypes = [
      { value: "coursework", label: "ผลงานการเรียน" },
      { value: "academic", label: "บทความวิชาการ" },
      { value: "competition", label: "การแข่งขัน" },
    ];

    return res.json(
      successResponse(projectTypes, "Project types retrieved successfully")
    );
  } catch (error) {
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
    const [years] = await pool.execute(`
  SELECT DISTINCT year FROM projects ORDER BY year DESC
`);

    return res.json(
      successResponse(
        years.map((y) => y.year),
        "Project years retrieved successfully"
      )
    );
  } catch (error) {
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
    const [years] = await pool.execute(`
  SELECT DISTINCT study_year FROM projects ORDER BY study_year
`);

    return res.json(
      successResponse(
        years.map((y) => y.study_year),
        "Study years retrieved successfully"
      )
    );
  } catch (error) {
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
    // ตรวจสอบว่าผู้ใช้เป็น admin หรือไม่
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "Only admin can access pending projects",
      });
    }

    const [projects] = await pool.execute(`
  SELECT p.*, u.username, u.full_name,
         (SELECT file_path FROM project_files pf WHERE pf.project_id = p.project_id AND pf.file_type = 'image' LIMIT 1) as image
  FROM projects p
  JOIN users u ON p.user_id = u.user_id
  WHERE p.status = 'pending'
  ORDER BY p.created_at DESC
`);

    return res.json(
      successResponse(
        projects.map((project) => ({
          id: project.project_id,
          title: project.title,
          description: project.description,
          category: project.type,
          level: `ปี ${project.study_year}`,
          year: project.year,
          image: project.image || "https://via.placeholder.com/150",
          student: project.full_name,
          studentId: project.user_id,
          projectLink: `/projects/${project.project_id}`,
          createdAt: project.created_at,
        })),
        "Pending projects retrieved successfully"
      )
    );
  } catch (error) {
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
    // ตรวจสอบว่าผู้ใช้เป็น admin หรือไม่
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "Only admin can review projects",
      });
    }

    const projectId = req.params.projectId;
    const { status, comment } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Status must be either "approved" or "rejected"',
      });
    }

    // ตรวจสอบว่าโครงการมีอยู่จริงหรือไม่
    const [projects] = await pool.execute(
      `
  SELECT p.*, u.email, u.username
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

    // อัปเดตสถานะโครงการ
    await pool.execute(
      `
  UPDATE projects SET status = ? WHERE project_id = ?
`,
      [status, projectId]
    );

    // บันทึกการตรวจสอบ
    await pool.execute(
      `
  INSERT INTO project_reviews (project_id, admin_id, status, review_comment)
  VALUES (?, ?, ?, ?)
`,
      [projectId, req.user.id, status, comment || null]
    );

    // ส่งอีเมลแจ้งสถานะการอนุมัติ
    sendProjectStatusEmail(
      project.email,
      project.username,
      project.title,
      status,
      comment
    );

    return res.json(
      successResponse(
        {
          projectId,
          status,
          comment,
        },
        `Project ${status} successfully`
      )
    );
  } catch (error) {
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
    // ตรวจสอบว่าผู้ใช้เป็น admin หรือไม่
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "Only admin can access project statistics",
      });
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

    // โครงการที่มียอดเข้าชมมากที่สุด 10 อันดับแรก
    const [topViewedProjects] = await pool.execute(`
  SELECT p.project_id, p.title, p.views_count, p.type, u.username, u.full_name
  FROM projects p
  JOIN users u ON p.user_id = u.user_id
  ORDER BY p.views_count DESC
  LIMIT 10
`);

    return res.json(
      successResponse(
        {
          total: totalProjects[0].count,
          byType: projectsByType,
          byStatus: projectsByStatus,
          byMonth: projectsByMonth,
          topViewed: topViewedProjects.map((project) => ({
            id: project.project_id,
            title: project.title,
            views: project.views_count,
            type: project.type,
            author: project.full_name,
          })),
        },
        "Project statistics retrieved successfully"
      )
    );
  } catch (error) {
    return handleServerError(res, error);
  }
};
