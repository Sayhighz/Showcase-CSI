// controllers/admin/statisticsController.js
import pool from '../../config/database.js';
import { handleServerError, successResponse } from '../../utils/responseFormatter.js';

/**
 * ดึงข้อมูลสถิติทั้งหมดสำหรับหน้า Dashboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getDashboardStats = async (req, res) => {
  try {
    // 1. จำนวนโครงการทั้งหมด
    const [totalProjects] = await pool.execute(`
      SELECT COUNT(*) as count FROM projects
    `);
    
    // 2. จำนวนผู้ใช้ทั้งหมด
    const [totalUsers] = await pool.execute(`
      SELECT COUNT(*) as count FROM users
    `);
    
    // 3. จำนวนผู้ใช้แยกตามบทบาท
    const [usersByRole] = await pool.execute(`
      SELECT role, COUNT(*) as count FROM users GROUP BY role
    `);
    
    // 4. จำนวนโครงการแยกตามประเภท
    const [projectsByType] = await pool.execute(`
      SELECT type, COUNT(*) as count FROM projects GROUP BY type
    `);
    
    // 5. จำนวนโครงการแยกตามสถานะ
    const [projectsByStatus] = await pool.execute(`
      SELECT status, COUNT(*) as count FROM projects GROUP BY status
    `);
    
    // 6. จำนวนการเข้าชมทั้งหมด
    const [totalViews] = await pool.execute(`
      SELECT 
        (SELECT SUM(views_count) FROM projects) as count
    `);
    
    // 7. จำนวนโครงการที่อัปโหลดในแต่ละเดือน (12 เดือนล่าสุด)
    const [projectsByMonth] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month, 
        COUNT(*) as count 
      FROM projects 
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month 
      ORDER BY month
    `);
    
    // 8. โครงการที่มียอดเข้าชมมากที่สุด 5 อันดับแรก
    const [topViewedProjects] = await pool.execute(`
      SELECT p.project_id, p.title, p.views_count, p.type, 
             u.username, u.full_name
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      ORDER BY p.views_count DESC
      LIMIT 5
    `);
    
    // 9. ผู้ใช้ที่มีโครงการมากที่สุด 5 อันดับแรก
    const [topContributors] = await pool.execute(`
      SELECT u.user_id, u.username, u.full_name, COUNT(p.project_id) as project_count
      FROM users u
      JOIN projects p ON u.user_id = p.user_id
      GROUP BY u.user_id
      ORDER BY project_count DESC
      LIMIT 5
    `);
    
    // 10. จำนวนผู้ใช้ที่สมัครในแต่ละเดือน (12 เดือนล่าสุด)
    const [usersByMonth] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month, 
        COUNT(*) as count 
      FROM users 
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month 
      ORDER BY month
    `);
    
    // 11. จำนวนการเข้าชมในแต่ละเดือน (12 เดือนล่าสุด)
    const [viewsByMonth] = await pool.execute(`
      SELECT 
        DATE_FORMAT(viewed_at, '%Y-%m') as month, 
        COUNT(*) as count 
      FROM (
        SELECT viewed_at FROM visitor_views
        WHERE viewed_at > DATE_SUB(NOW(), INTERVAL 12 MONTH)
        UNION ALL
        SELECT viewed_at FROM company_views
        WHERE viewed_at > DATE_SUB(NOW(), INTERVAL 12 MONTH)
      ) as all_views
      GROUP BY month 
      ORDER BY month
    `);
    
    return res.json(successResponse({
      totals: {
        projects: totalProjects[0].count,
        users: totalUsers[0].count,
        views: totalViews[0].count || 0
      },
      projectStats: {
        byType: projectsByType,
        byStatus: projectsByStatus,
        byMonth: projectsByMonth,
        topViewed: topViewedProjects.map(project => ({
          id: project.project_id,
          title: project.title,
          viewsCount: project.views_count,
          category: project.type,
          author: {
            username: project.username,
            fullName: project.full_name
          }
        }))
      },
      userStats: {
        byRole: usersByRole,
        byMonth: usersByMonth,
        topContributors: topContributors.map(user => ({
          id: user.user_id,
          username: user.username,
          fullName: user.full_name,
          projectCount: user.project_count
        }))
      },
      viewStats: {
        byMonth: viewsByMonth
      }
    }, 'Dashboard statistics retrieved successfully'));
    
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * ดึงข้อมูลสถิติของวันนี้และเปรียบเทียบกับวันก่อนหน้า
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getTodayStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // 1. จำนวนโครงการที่อัปโหลดวันนี้
    const [projectsTodayResult] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM projects
      WHERE created_at >= ?
    `, [today]);
    const projectsToday = projectsTodayResult[0].count;
    
    // 2. จำนวนโครงการที่อัปโหลดเมื่อวาน
    const [projectsYesterdayResult] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM projects
      WHERE created_at >= ? AND created_at < ?
    `, [yesterday, today]);
    const projectsYesterday = projectsYesterdayResult[0].count;
    
    // 3. จำนวนผู้ใช้ที่สมัครวันนี้
    const [usersTodayResult] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM users
      WHERE created_at >= ?
    `, [today]);
    const usersToday = usersTodayResult[0].count;
    
    // 4. จำนวนผู้ใช้ที่สมัครเมื่อวาน
    const [usersYesterdayResult] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM users
      WHERE created_at >= ? AND created_at < ?
    `, [yesterday, today]);
    const usersYesterday = usersYesterdayResult[0].count;
    
    // 5. จำนวนการเข้าชมวันนี้ (visitor)
    const [visitorViewsTodayResult] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM visitor_views
      WHERE viewed_at >= ?
    `, [today]);
    const visitorViewsToday = visitorViewsTodayResult[0].count;
    
    // 6. จำนวนการเข้าชมเมื่อวาน (visitor)
    const [visitorViewsYesterdayResult] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM visitor_views
      WHERE viewed_at >= ? AND viewed_at < ?
    `, [yesterday, today]);
    const visitorViewsYesterday = visitorViewsYesterdayResult[0].count;
    
    // 7. จำนวนการเข้าชมวันนี้ (company)
    const [companyViewsTodayResult] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM company_views
      WHERE viewed_at >= ?
    `, [today]);
    const companyViewsToday = companyViewsTodayResult[0].count;
    
    // 8. จำนวนการเข้าชมเมื่อวาน (company)
    const [companyViewsYesterdayResult] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM company_views
      WHERE viewed_at >= ? AND viewed_at < ?
    `, [yesterday, today]);
    const companyViewsYesterday = companyViewsYesterdayResult[0].count;
    
    // 9. จำนวนการเข้าสู่ระบบวันนี้
    const [loginsTodayResult] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM login_logs
      WHERE login_time >= ?
    `, [today]);
    const loginsToday = loginsTodayResult[0].count;
    
    // 10. จำนวนการเข้าสู่ระบบเมื่อวาน
    const [loginsYesterdayResult] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM login_logs
      WHERE login_time >= ? AND login_time < ?
    `, [yesterday, today]);
    const loginsYesterday = loginsYesterdayResult[0].count;
    
    // 11. จำนวนโครงการที่ได้รับการอนุมัติวันนี้
    const [approvedTodayResult] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM project_reviews
      WHERE status = 'approved' AND reviewed_at >= ?
    `, [today]);
    const approvedToday = approvedTodayResult[0].count;
    
    // 12. จำนวนโครงการที่ได้รับการอนุมัติเมื่อวาน
    const [approvedYesterdayResult] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM project_reviews
      WHERE status = 'approved' AND reviewed_at >= ? AND reviewed_at < ?
    `, [yesterday, today]);
    const approvedYesterday = approvedYesterdayResult[0].count;
    
    // 13. จำนวนโครงการที่ถูกปฏิเสธวันนี้
    const [rejectedTodayResult] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM project_reviews
      WHERE status = 'rejected' AND reviewed_at >= ?
    `, [today]);
    const rejectedToday = rejectedTodayResult[0].count;
    
    // 14. จำนวนโครงการที่ถูกปฏิเสธเมื่อวาน
    const [rejectedYesterdayResult] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM project_reviews
      WHERE status = 'rejected' AND reviewed_at >= ? AND reviewed_at < ?
    `, [yesterday, today]);
    const rejectedYesterday = rejectedYesterdayResult[0].count;
    
    return res.json(successResponse({
      projects: {
        today: projectsToday,
        yesterday: projectsYesterday,
        percentChange: projectsYesterday > 0 ? Math.round((projectsToday - projectsYesterday) / projectsYesterday * 100) : (projectsToday > 0 ? 100 : 0)
      },
      users: {
        today: usersToday,
        yesterday: usersYesterday,
        percentChange: usersYesterday > 0 ? Math.round((usersToday - usersYesterday) / usersYesterday * 100) : (usersToday > 0 ? 100 : 0)
      },
      views: {
        visitor: {
          today: visitorViewsToday,
          yesterday: visitorViewsYesterday,
          percentChange: visitorViewsYesterday > 0 ? Math.round((visitorViewsToday - visitorViewsYesterday) / visitorViewsYesterday * 100) : (visitorViewsToday > 0 ? 100 : 0)
        },
        company: {
          today: companyViewsToday,
          yesterday: companyViewsYesterday,
          percentChange: companyViewsYesterday > 0 ? Math.round((companyViewsToday - companyViewsYesterday) / companyViewsYesterday * 100) : (companyViewsToday > 0 ? 100 : 0)
        },
        total: {
          today: visitorViewsToday + companyViewsToday,
          yesterday: visitorViewsYesterday + companyViewsYesterday,
          percentChange: (visitorViewsYesterday + companyViewsYesterday) > 0 ? 
            Math.round(((visitorViewsToday + companyViewsToday) - (visitorViewsYesterday + companyViewsYesterday)) / (visitorViewsYesterday + companyViewsYesterday) * 100) : 
            ((visitorViewsToday + companyViewsToday) > 0 ? 100 : 0)
        }
      },
      logins: {
        today: loginsToday,
        yesterday: loginsYesterday,
        percentChange: loginsYesterday > 0 ? Math.round((loginsToday - loginsYesterday) / loginsYesterday * 100) : (loginsToday > 0 ? 100 : 0)
      },
      reviews: {
        approved: {
          today: approvedToday,
          yesterday: approvedYesterday,
          percentChange: approvedYesterday > 0 ? Math.round((approvedToday - approvedYesterday) / approvedYesterday * 100) : (approvedToday > 0 ? 100 : 0)
        },
        rejected: {
          today: rejectedToday,
          yesterday: rejectedYesterday,
          percentChange: rejectedYesterday > 0 ? Math.round((rejectedToday - rejectedYesterday) / rejectedYesterday * 100) : (rejectedToday > 0 ? 100 : 0)
        },
        total: {
          today: approvedToday + rejectedToday,
          yesterday: approvedYesterday + rejectedYesterday,
          percentChange: (approvedYesterday + rejectedYesterday) > 0 ? 
            Math.round(((approvedToday + rejectedToday) - (approvedYesterday + rejectedYesterday)) / (approvedYesterday + rejectedYesterday) * 100) : 
            ((approvedToday + rejectedToday) > 0 ? 100 : 0)
        }
      }
    }, 'Today statistics retrieved successfully'));
    
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * ดึงข้อมูลสถิติแยกตามประเภทของโครงการ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getProjectTypeStats = async (req, res) => {
  try {
    // 1. จำนวนโครงการแยกตามประเภท
    const [projectsByType] = await pool.execute(`
      SELECT type, COUNT(*) as count 
      FROM projects 
      GROUP BY type
    `);
    
    // 2. จำนวนการเข้าชมเฉลี่ยแยกตามประเภท
    const [avgViewsByType] = await pool.execute(`
      SELECT type, AVG(views_count) as avg_views 
      FROM projects 
      GROUP BY type
    `);
    
    // 3. จำนวนโครงการที่อัปโหลดในแต่ละเดือนแยกตามประเภท (12 เดือนล่าสุด)
    const [projectsByMonthAndType] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        type,
        COUNT(*) as count 
      FROM projects 
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month, type
      ORDER BY month, type
    `);
    
    // 4. อัตราการอนุมัติแยกตามประเภท
    const [approvalRateByType] = await pool.execute(`
      SELECT 
        p.type,
        COUNT(CASE WHEN pr.status = 'approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN pr.status = 'rejected' THEN 1 END) as rejected_count,
        COUNT(*) as total_count,
        (COUNT(CASE WHEN pr.status = 'approved' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)) as approval_rate
      FROM project_reviews pr
      JOIN projects p ON pr.project_id = p.project_id
      GROUP BY p.type
    `);
    
    // 5. โครงการที่มียอดเข้าชมมากที่สุดแยกตามประเภท
    const [topViewedByType] = await pool.execute(`
      SELECT * FROM (
        SELECT 
          p.project_id, 
          p.title, 
          p.views_count, 
          p.type,
          u.username, 
          u.full_name,
          ROW_NUMBER() OVER (PARTITION BY p.type ORDER BY p.views_count DESC) as row_num
        FROM projects p
        JOIN users u ON p.user_id = u.user_id
      ) as ranked
      WHERE row_num <= 3
    `);
    
    // แปลงข้อมูลให้เหมาะสมกับ frontend
    // 1. จัดรูปแบบข้อมูลโครงการแยกตามประเภท
    const typeStats = {};
    
    // สร้างรูปแบบข้อมูลเริ่มต้น
    ['coursework', 'academic', 'competition'].forEach(type => {
      typeStats[type] = {
        count: 0,
        avgViews: 0,
        approvalRate: 0,
        approvedCount: 0,
        rejectedCount: 0,
        totalReviewCount: 0,
        monthlyTrend: [],
        topProjects: []
      };
    });
    
    // เติมข้อมูลจำนวนโครงการ
    projectsByType.forEach(item => {
      if (typeStats[item.type]) {
        typeStats[item.type].count = item.count;
      }
    });
    
    // เติมข้อมูลจำนวนการเข้าชมเฉลี่ย
    avgViewsByType.forEach(item => {
      if (typeStats[item.type]) {
        typeStats[item.type].avgViews = Math.round(item.avg_views * 10) / 10;
      }
    });
    
    // เติมข้อมูลอัตราการอนุมัติ
    approvalRateByType.forEach(item => {
      if (typeStats[item.type]) {
        typeStats[item.type].approvalRate = Math.round(item.approval_rate * 10) / 10;
        typeStats[item.type].approvedCount = item.approved_count;
        typeStats[item.type].rejectedCount = item.rejected_count;
        typeStats[item.type].totalReviewCount = item.total_count;
      }
    });
    
    // 2. จัดรูปแบบข้อมูลโครงการรายเดือนแยกตามประเภท
    const monthlyTrends = {};
    
    projectsByMonthAndType.forEach(item => {
      if (!monthlyTrends[item.month]) {
        monthlyTrends[item.month] = {
          month: item.month,
          coursework: 0,
          academic: 0,
          competition: 0
        };
      }
      
      if (item.type in monthlyTrends[item.month]) {
        monthlyTrends[item.month][item.type] = item.count;
      }
    });
    
    const monthlyTrendsArray = Object.values(monthlyTrends).sort((a, b) => a.month.localeCompare(b.month));
    
    // 3. จัดรูปแบบข้อมูลโครงการที่มียอดเข้าชมมากที่สุดแยกตามประเภท
    topViewedByType.forEach(project => {
      if (typeStats[project.type]) {
        typeStats[project.type].topProjects.push({
          id: project.project_id,
          title: project.title,
          viewsCount: project.views_count,
          author: {
            username: project.username,
            fullName: project.full_name
          }
        });
      }
    });
    
    return res.json(successResponse({
      stats: typeStats,
      monthlyTrends: monthlyTrendsArray
    }, 'Project type statistics retrieved successfully'));
    
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * ดึงข้อมูลสถิติแยกตามชั้นปีของนักศึกษา
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getStudyYearStats = async (req, res) => {
  try {
    // 1. จำนวนโครงการแยกตามชั้นปี
    const [projectsByStudyYear] = await pool.execute(`
      SELECT study_year, COUNT(*) as count 
      FROM projects 
      GROUP BY study_year
      ORDER BY study_year
    `);
    
    // 2. จำนวนการเข้าชมเฉลี่ยแยกตามชั้นปี
    const [avgViewsByStudyYear] = await pool.execute(`
      SELECT study_year, AVG(views_count) as avg_views 
      FROM projects 
      GROUP BY study_year
      ORDER BY study_year
    `);
    
    // 3. จำนวนโครงการแยกตามชั้นปีและประเภท
    const [projectsByStudyYearAndType] = await pool.execute(`
      SELECT study_year, type, COUNT(*) as count 
      FROM projects 
      GROUP BY study_year, type
      ORDER BY study_year, type
    `);
    
    // 4. อัตราการอนุมัติแยกตามชั้นปี
    const [approvalRateByStudyYear] = await pool.execute(`
      SELECT 
        p.study_year,
        COUNT(CASE WHEN pr.status = 'approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN pr.status = 'rejected' THEN 1 END) as rejected_count,
        COUNT(*) as total_count,
        (COUNT(CASE WHEN pr.status = 'approved' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)) as approval_rate
      FROM project_reviews pr
      JOIN projects p ON pr.project_id = p.project_id
      GROUP BY p.study_year
      ORDER BY p.study_year
    `);
    
    // 5. โครงการที่มียอดเข้าชมมากที่สุดแยกตามชั้นปี
    const [topViewedByStudyYear] = await pool.execute(`
      SELECT * FROM (
        SELECT 
          p.project_id, 
          p.title, 
          p.views_count, 
          p.type,
          p.study_year,
          u.username, 
          u.full_name,
          ROW_NUMBER() OVER (PARTITION BY p.study_year ORDER BY p.views_count DESC) as row_num
        FROM projects p
        JOIN users u ON p.user_id = u.user_id
      ) as ranked
      WHERE row_num <= 3
      ORDER BY study_year, row_num
    `);
    
    // แปลงข้อมูลให้เหมาะสมกับ frontend
    // 1. จัดรูปแบบข้อมูลโครงการแยกตามชั้นปี
    const yearStats = {};
    
    // สร้างรูปแบบข้อมูลเริ่มต้น
    [1, 2, 3, 4].forEach(year => {
      yearStats[year] = {
        count: 0,
        avgViews: 0,
        approvalRate: 0,
        approvedCount: 0,
        rejectedCount: 0,
        totalReviewCount: 0,
        byType: {
          coursework: 0,
          academic: 0,
          competition: 0
        },
        topProjects: []
      };
    });
    
    // เติมข้อมูลจำนวนโครงการ
    projectsByStudyYear.forEach(item => {
      if (yearStats[item.study_year]) {
        yearStats[item.study_year].count = item.count;
      }
    });
    
    // เติมข้อมูลจำนวนการเข้าชมเฉลี่ย
    avgViewsByStudyYear.forEach(item => {
      if (yearStats[item.study_year]) {
        yearStats[item.study_year].avgViews = Math.round(item.avg_views * 10) / 10;
      }
    });
    
    // เติมข้อมูลแยกตามประเภท
    projectsByStudyYearAndType.forEach(item => {
      if (yearStats[item.study_year] && yearStats[item.study_year].byType[item.type] !== undefined) {
        yearStats[item.study_year].byType[item.type] = item.count;
      }
    });
    
    // เติมข้อมูลอัตราการอนุมัติ
    approvalRateByStudyYear.forEach(item => {
      if (yearStats[item.study_year]) {
        yearStats[item.study_year].approvalRate = Math.round(item.approval_rate * 10) / 10;
        yearStats[item.study_year].approvedCount = item.approved_count;
        yearStats[item.study_year].rejectedCount = item.rejected_count;
        yearStats[item.study_year].totalReviewCount = item.total_count;
      }
    });
    
    // เติมข้อมูลโครงการที่มียอดเข้าชมมากที่สุด
    topViewedByStudyYear.forEach(project => {
      if (yearStats[project.study_year]) {
        yearStats[project.study_year].topProjects.push({
          id: project.project_id,
          title: project.title,
          viewsCount: project.views_count,
          type: project.type,
          author: {
            username: project.username,
            fullName: project.full_name
          }
        });
      }
    });
    
    return res.json(successResponse({
      stats: yearStats
    }, 'Study year statistics retrieved successfully'));
    
  } catch (error) {
    return handleServerError(res, error);
  }
};