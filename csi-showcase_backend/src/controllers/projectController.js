import pool from '../config/database.js';  // Assuming you have a database connection setup

// ฟังก์ชันดึงข้อมูลทั้งหมดจาก projects
export const getAllProjects = async (req, res) => {
  try {
    // ดึงข้อมูลจาก table projects พร้อมกับข้อมูลของผู้ใช้
    const [projects] = await pool.execute(`
      SELECT p.project_id, p.title, p.description, p.type, p.study_year, p.year, p.semester, p.visibility, p.status,
             u.username, u.full_name, u.role
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.status = 'approved' AND p.visibility = 1
    `);

    // แปลงข้อมูลให้เหมาะสมกับ frontend
    const formattedProjects = projects.map(project => ({
      title: project.title,
      description: project.description,
      category: project.type,  // เปลี่ยนให้เหมาะสมกับ frontend
      level: `ปี ${project.study_year}`,
      year: project.year,
      image: 'https://via.placeholder.com/150',  // Placeholder image, should be dynamic in real projects
      projectLink: `/projects/${project.project_id}`,
    }));

    return res.json(formattedProjects);  // ส่งข้อมูลที่ได้กลับไปยัง frontend
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTop9Projects = async (req, res) => {
    try {
      // Query to get the top 9 projects based on view count from the company_views table
      const [projects] = await pool.execute(`
        SELECT p.project_id, p.title, p.description, p.type, p.study_year, p.year, p.semester, p.visibility, p.status,
               u.username, u.full_name, u.role, COUNT(cv.view_id) AS view_count
        FROM projects p
        JOIN users u ON p.user_id = u.user_id
        LEFT JOIN company_views cv ON p.project_id = cv.project_id
        WHERE p.status = 'approved' AND p.visibility = 1
        GROUP BY p.project_id
        ORDER BY view_count DESC
        LIMIT 9
      `);
  
      // Format the projects for frontend display
      const formattedProjects = projects.map(project => ({
        title: project.title,
        description: project.description,
        category: project.type,
        level: `ปี ${project.study_year}`,
        year: project.year,
        image: 'https://via.placeholder.com/150', // Placeholder image
        projectLink: `/projects/${project.project_id}`,
        viewCount: project.view_count, // Adding view count to the response
      }));
  
      return res.json(formattedProjects);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  export const getLatestProjects = async (req, res) => {
    try {
      // ดึงข้อมูลจากฐานข้อมูลโครงการล่าสุด 9 โครงการ
      const [projects] = await pool.execute(`
        SELECT p.project_id, p.title, p.description, p.type, p.study_year, p.year, p.semester, p.visibility, p.status,
               u.username, u.full_name, u.role
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
        image: 'https://via.placeholder.com/150', // Placeholder image
        projectLink: `/projects/${project.project_id}`,
      }));
  
      return res.json(formattedProjects);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  
