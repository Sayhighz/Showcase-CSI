// searchController.js
import pool from '../config/database.js';

// ฟังก์ชันค้นหาผลงาน
export const searchProjects = async (req, res) => {
  const { keyword } = req.query;

  try {
    // Perform a JOIN between `projects` and `users` tables to fetch the `full_name` of the student
    const query = `
      SELECT p.project_id, p.title, p.year, p.study_year, p.semester, p.status, u.full_name as student
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.title LIKE ? OR u.full_name LIKE ? OR p.year LIKE ? OR p.study_year LIKE ? OR p.semester LIKE ?;
    `;
    
    const [rows] = await pool.execute(query, [
      `%${keyword}%`,
      `%${keyword}%`,
      `%${keyword}%`,
      `%${keyword}%`,
      `%${keyword}%`,
    ]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
