// services/searchService.js
const pool = require('../config/database.js');
const logger = require('../config/logger.js');
const { getPaginationInfo } = require('../constants/pagination.js');


const searchProjects = async (keyword = '', filters = {}, pagination = {}) => {
  try {
    const page = parseInt(pagination.page) || 1;
    const limit = parseInt(pagination.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Create connection to mysql directly
    const connection = await pool.getConnection();
    
    try {
      // Build the WHERE clause with properly escaped values
      const conditions = [`p.status = 'approved' AND p.visibility = 1`];
      
      if (keyword && keyword.trim()) {
        const escapedKeyword = `%${keyword.trim().replace(/[%_\\]/g, '\\$&')}%`;
        const safeKeyword = connection.escape(escapedKeyword);
        conditions.push(`(
          p.title LIKE ${safeKeyword} 
          OR p.description LIKE ${safeKeyword} 
          OR u.full_name LIKE ${safeKeyword}
          OR EXISTS (
            SELECT 1 FROM project_groups pg 
            JOIN users ug ON pg.user_id = ug.user_id 
            WHERE pg.project_id = p.project_id 
            AND ug.full_name LIKE ${safeKeyword}
          )
        )`);
      }
      
      if (filters.type) {
        conditions.push(`p.type = ${connection.escape(filters.type)}`);
      }
      
      if (filters.year) {
        conditions.push(`p.year = ${parseInt(filters.year, 10)}`);
      }
      
      if (filters.studyYear) {
        conditions.push(`p.study_year = ${parseInt(filters.studyYear, 10)}`);
      }
      
      const whereClause = conditions.join(' AND ');
      
      // Count query
      const countQuery = `
        SELECT COUNT(DISTINCT p.project_id) as total 
        FROM projects p
        JOIN users u ON p.user_id = u.user_id
        WHERE ${whereClause}
      `;
      
      // Run count query
      const [countResult] = await connection.query(countQuery);
      const totalItems = countResult[0].total;
      
      // Selection query
      let selectQuery = `
        SELECT DISTINCT p.*, u.username, u.full_name, u.image as user_image,
          CASE
            WHEN p.type = 'coursework' THEN (SELECT c.poster FROM courseworks c WHERE c.project_id = p.project_id)
            WHEN p.type = 'competition' THEN (SELECT c.poster FROM competitions c WHERE c.project_id = p.project_id)
            WHEN p.type = 'academic' THEN NULL
          END as image
        FROM projects p
        JOIN users u ON p.user_id = u.user_id
        WHERE ${whereClause}
        ORDER BY p.views_count DESC, p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      // Execute select query
      const [projects] = await connection.query(selectQuery);
      
      // ดึงข้อมูลผู้ร่วมโครงการสำหรับทุกโครงการ (ใช้รูปแบบเดียวกับ projectService)
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
        
        const [collaborators] = await connection.query(collaboratorsQuery, projectIds);
        
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
      
      // Format results
      const formattedProjects = projects.map(project => {
        return {
          id: project.project_id,
          title: project.title,
          description: project.description,
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
        };
      });
      
      const paginationInfo = getPaginationInfo(totalItems, page, limit);
      
      return {
        projects: formattedProjects,
        pagination: paginationInfo
      };
    } finally {
      // Always release the connection when done
      connection.release();
    }
  } catch (error) {
    logger.error('Error searching projects:', error);
    throw error;
  }
};


const searchStudents = async (keyword = '', limit = 10) => {
  try {
    if (!keyword || !keyword.trim()) {
      return [];
    }

    // Get a direct connection from the pool
    const connection = await pool.getConnection();
    
    try {
      // Escape the search pattern safely
      const searchPattern = `%${keyword.trim().replace(/[%_\\]/g, '\\$&')}%`;
      const safePattern = connection.escape(searchPattern);
      const safeLimit = parseInt(limit, 10); // Ensure limit is an integer
      
      // Build the query with escaped values
      const query = `
        SELECT user_id, username, full_name, email, image
        FROM users
        WHERE role = 'student' AND (
          username LIKE ${safePattern} OR
          full_name LIKE ${safePattern} OR
          email LIKE ${safePattern}
        )
        LIMIT ${safeLimit}
      `;
      
      // Execute the query using query() method
      const [students] = await connection.query(query);
      
      // Map the results
      return students.map(student => ({
        user_id: student.user_id,
        username: student.username,
        full_name: student.full_name,
        email: student.email,
        image: student.image
      }));
    } finally {
      // Always release the connection when done
      connection.release();
    }
  } catch (error) {
    logger.error('Error searching students:', error);
    throw error;
  }
};

module.exports = {
  searchProjects,
  searchStudents
};