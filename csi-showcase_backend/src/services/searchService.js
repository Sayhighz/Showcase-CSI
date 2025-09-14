// services/searchService.js
const pool = require('../config/database.js');
const logger = require('../config/logger.js');
const { getPaginationInfo } = require('../constants/pagination.js');


const searchProjects = async (keyword = '', filters = {}, pagination = {}) => {
  try {
    const page = parseInt(pagination.page) || 1;
    const limit = parseInt(pagination.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Build the WHERE clause parameters array for prepared statements
    const queryParams = [];
    const conditions = [`p.status = ? AND p.visibility = ?`];
    queryParams.push('approved', 1);
    
    if (keyword && keyword.trim()) {
      const searchKeyword = `%${keyword.trim()}%`;
      conditions.push(`(
        p.title LIKE ?
        OR p.description LIKE ?
        OR u.full_name LIKE ?
        OR EXISTS (
          SELECT 1 FROM project_groups pg
          LEFT JOIN users ug ON pg.user_id = ug.user_id
          WHERE pg.project_id = p.project_id
          AND (ug.full_name LIKE ? OR pg.member_name LIKE ?)
        )
      )`);
      queryParams.push(searchKeyword, searchKeyword, searchKeyword, searchKeyword, searchKeyword);
    }
    
    if (filters.type) {
      conditions.push(`p.type = ?`);
      queryParams.push(filters.type);
    }
    
    if (filters.year) {
      conditions.push(`p.year = ?`);
      queryParams.push(parseInt(filters.year, 10));
    }
    
    if (filters.studyYear) {
      conditions.push(`p.study_year = ?`);
      queryParams.push(parseInt(filters.studyYear, 10));
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
    const [countResult] = await pool.execute(countQuery, queryParams);
    const totalItems = countResult[0].total;
    
    // Selection query with same parameters
    const selectQuery = `
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
      LIMIT ? OFFSET ?
    `;
    
    // Execute select query with limit and offset parameters
    const selectParams = [...queryParams, limit, offset];
    const [projects] = await pool.execute(selectQuery, selectParams);
    
    // ดึงข้อมูลผู้ร่วมโครงการสำหรับทุกโครงการ (ใช้รูปแบบเดียวกับ projectService)
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

    // Use prepared statements to prevent SQL injection
    const searchPattern = `%${keyword.trim()}%`;
    const safeLimit = Math.min(parseInt(limit, 10) || 10, 50); // Cap at 50 for safety

    // Build the query with placeholders - avoid LIMIT placeholder which can cause issues
    const query = `
      SELECT user_id, username, full_name, email, image
      FROM users
      WHERE role = ? AND (
        username LIKE ?
        OR full_name LIKE ?
        OR email LIKE ?
      )
      LIMIT ${safeLimit}
    `;

    // Execute the query with parameters (4 parameters now, no LIMIT)
    const [students] = await pool.execute(query, ['student', searchPattern, searchPattern, searchPattern]);

    // Map the results
    return students.map(student => ({
      user_id: student.user_id,
      username: student.username,
      full_name: student.full_name,
      email: student.email,
      image: student.image
    }));
  } catch (error) {
    logger.error('Error searching students:', error);
    logger.error('Error code:', error.code);
    logger.error('Error message:', error.message);

    // Handle database connection errors gracefully
    // Return empty array instead of throwing error to prevent 500 responses
    if (error.code === 'PROTOCOL_CONNECTION_LOST' ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ER_ACCESS_DENIED_ERROR' ||
        error.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR' ||
        error.code === 'ERDISC') {
      logger.warn('Database connection error - returning empty results for search');
      return [];
    }

    // For other database errors, also return empty array to prevent crashes
    if (error.code && error.code.startsWith('ER_')) {
      logger.warn(`Database error ${error.code} - returning empty results for search`);
      return [];
    }

    // For other errors, still throw them
    throw error;
  }
};

module.exports = {
  searchProjects,
  searchStudents
};