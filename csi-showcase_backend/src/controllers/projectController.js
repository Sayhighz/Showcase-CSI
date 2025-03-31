import pool from '../config/database.js';  // Assuming you have a database connection setup
import multer from 'multer'


// Set up multer storage options for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Store files in the 'uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Add timestamp to the filename
  }
});

const upload = multer({ storage: storage });


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

// ฟังก์ชันสำหรับดึงข้อมูลโปรเจคของนักศึกษาคนนั้นๆ
export const getMyProjects = async (req, res) => {
  try {
    // Get the user_id from the authenticated user (typically from a session or token)
    const userId = req.params.user_id; // Assuming the user_id is available from an authentication middleware

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized, userId is missing' }); // If no user_id is found, return unauthorized
    }

    // Query to get the student's projects, regardless of status (approved or pending)
    const [projects] = await pool.execute(`
      SELECT p.project_id, p.title, p.description, p.type, p.study_year, p.year, p.semester, p.visibility, p.status,
             u.username, u.full_name, u.role
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.user_id = ? AND p.visibility = 1
    `, [userId]); // Ensure `userId` is a valid parameter

    // Format the projects for frontend display
    const formattedProjects = projects.map(project => ({
      title: project.title,
      description: project.description,
      category: project.type,
      level: `ปี ${project.study_year}`,
      year: project.year,
      image: 'https://via.placeholder.com/150',  // Placeholder image, should be dynamic
      projectLink: `/projects/${project.project_id}`,
      status: project.status,  // Include the status to show whether it's pending or approved
    }));

    return res.json(formattedProjects);  // ส่งข้อมูลที่ได้กลับไปยัง frontend
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



// ฟังก์ชันสำหรับดึงข้อมูลรายละเอียดทั้งหมดของโครงการ
export const getProjectDetails = async (req, res) => {
  const projectId = req.params.projectId; // Get the project_id from the request parameters

  if (!projectId) {
    return res.status(400).json({ message: 'Project ID is required' });
  }

  try {
    // Query to get project details along with user and other related tables
    const [projectDetails] = await pool.execute(`
      SELECT p.project_id, p.title, p.description, p.type, p.study_year, p.year, p.semester, p.visibility, p.status,
             p.created_at AS project_created_at, u.user_id, u.full_name, u.role,
             ap.publication_date AS paper_publication_date, ap.published_year AS paper_published_year,
             cv.company_name AS company_viewed_by, cv.contact_email AS company_contact_email,
             c.competition_name, c.competition_year, c.poster AS competition_poster,
             cw.poster AS coursework_poster, cw.clip_video AS coursework_video, cw.image AS coursework_image
      FROM projects p
      JOIN project_groups pg ON p.project_id = pg.project_id
      JOIN users u ON pg.user_id = u.user_id
      LEFT JOIN academic_papers ap ON p.project_id = ap.project_id
      LEFT JOIN company_views cv ON p.project_id = cv.project_id
      LEFT JOIN competitions c ON p.project_id = c.project_id
      LEFT JOIN courseworks cw ON p.project_id = cw.project_id
      WHERE p.project_id = ? AND p.status = 'approved'
    `, [projectId]);

    if (projectDetails.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Extract authors (users) associated with the project
    const authors = projectDetails.map(project => ({
      userId: project.user_id,
      fullName: project.full_name,
      role: project.role,
      image: 'https://via.placeholder.com/150', // Placeholder for user image
    }));

    // Format the project details for frontend display
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
      projectCreatedAt: projectDetails[0].project_created_at,
      authors: authors,  // Include authors
      academicPaper: {
        publicationDate: projectDetails[0].paper_publication_date,
        publishedYear: projectDetails[0].paper_published_year,
      },
      companyViews: {
        companyName: projectDetails[0].company_viewed_by,
        contactEmail: projectDetails[0].company_contact_email,
      },
      competition: {
        competitionName: projectDetails[0].competition_name,
        competitionYear: projectDetails[0].competition_year,
        competitionPoster: projectDetails[0].competition_poster,
      },
      coursework: {
        courseworkPoster: projectDetails[0].coursework_poster,
        courseworkVideo: projectDetails[0].coursework_video,
        courseworkImage: projectDetails[0].coursework_image,
      },
    };

    return res.json(formattedProject);  // Send the formatted project details back to the frontend
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const uploadProject = async (req, res) => {
  try {
    const { title, description, type, study_year, year, semester, visibility, status, contributors } = req.body;

    const userId = req.params.user_id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' }); // If no user_id, return unauthorized
    }

    if (!title || !description || !type || !study_year || !year || !semester) {
      return res.status(400).json({ message: 'Missing required fields' }); // Validate the input
    }

    // Insert the project data into the projects table
    const [result] = await pool.execute(`
      INSERT INTO projects (user_id, title, type, description, study_year, year, semester, visibility, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, title, type, description, study_year, year, semester, visibility, status]);

    // Get the project ID of the newly inserted project
    const projectId = result.insertId;

    // Insert contributors into project_groups table
    for (let contributor of contributors) {
      await pool.execute(`
        INSERT INTO project_groups (project_id, user_id)
        VALUES (?, ?)
      `, [projectId, contributor.user_id]);
    }

    // Handle file upload based on project type
    if (type === 'academic') {
      const { publication_date, published_year } = req.body;

      // Format the publication_date to 'YYYY-MM-DD'
      const formattedPublicationDate = publication_date ? formatDate(publication_date) : null;

      await pool.execute(`
        INSERT INTO academic_papers (project_id, publication_date, published_year)
        VALUES (?, ?, ?)
      `, [projectId, formattedPublicationDate, published_year]);
    }

    if (type === 'competition') {
      const { competition_name, competition_year, competition_poster } = req.body;
      await pool.execute(`
        INSERT INTO competitions (project_id, competition_name, competition_year, poster)
        VALUES (?, ?, ?, ?)
      `, [projectId, competition_name, competition_year, competition_poster]);
    }

    if (type === 'coursework') {
      const { coursework_poster, coursework_video, coursework_image } = req.body;
      await pool.execute(`
        INSERT INTO courseworks (project_id, poster, clip_video, image)
        VALUES (?, ?, ?, ?)
      `, [projectId, coursework_poster, coursework_video, coursework_image]);
    }

    return res.status(201).json({ message: 'Project uploaded successfully', projectId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to format the date into 'YYYY-MM-DD' format
const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];  // Extracts 'YYYY-MM-DD'
};




  
  
