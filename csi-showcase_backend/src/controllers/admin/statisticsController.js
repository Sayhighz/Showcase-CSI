// controllers/admin/statisticsController.js
import pool from '../../config/database.js';
import logger from '../../config/logger.js';
import { handleServerError, successResponse } from '../../utils/responseFormatter.js';
import { STATUS_CODES } from '../../constants/statusCodes.js';
import { PROJECT_TYPES, PROJECT_STATUSES } from '../../constants/projectStatuses.js';
import { formatToISODate } from '../../utils/dateHelper.js';
import { asyncHandler } from '../../middleware/loggerMiddleware.js';

/**
 * ดึงข้อมูลสถิติทั้งหมดสำหรับหน้า Dashboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    logger.debug('Fetching dashboard statistics');

    // จัดการคำสั่ง SQL ทั้งหมดพร้อมกันเพื่อลดเวลาการรอคอย
    const [
      totalProjects,
      totalUsers,
      usersByRole,
      projectsByType,
      projectsByStatus,
      totalViews,
      projectsByMonth,
      topViewedProjects,
      topContributors,
      usersByMonth,
      viewsByMonth
    ] = await Promise.all([
      // 1. จำนวนโครงการทั้งหมด
      pool.execute('SELECT COUNT(*) as count FROM projects'),
      
      // 2. จำนวนผู้ใช้ทั้งหมด
      pool.execute('SELECT COUNT(*) as count FROM users'),
      
      // 3. จำนวนผู้ใช้แยกตามบทบาท
      pool.execute('SELECT role, COUNT(*) as count FROM users GROUP BY role'),
      
      // 4. จำนวนโครงการแยกตามประเภท
      pool.execute('SELECT type, COUNT(*) as count FROM projects GROUP BY type'),
      
      // 5. จำนวนโครงการแยกตามสถานะ
      pool.execute('SELECT status, COUNT(*) as count FROM projects GROUP BY status'),
      
      // 6. จำนวนการเข้าชมทั้งหมด
      pool.execute('SELECT SUM(views_count) as count FROM projects'),
      
      // 7. จำนวนโครงการที่อัปโหลดในแต่ละเดือน (12 เดือนล่าสุด)
      pool.execute(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month, 
          COUNT(*) as count 
        FROM projects 
        WHERE created_at > DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY month 
        ORDER BY month
      `),
      
      // 8. โครงการที่มียอดเข้าชมมากที่สุด 5 อันดับแรก
      pool.execute(`
        SELECT p.project_id, p.title, p.views_count, p.type, 
               u.username, u.full_name
        FROM projects p
        JOIN users u ON p.user_id = u.user_id
        WHERE p.status = ? AND p.visibility = 1
        ORDER BY p.views_count DESC
        LIMIT 5
      `, [PROJECT_STATUSES.APPROVED]),
      
      // 9. ผู้ใช้ที่มีโครงการมากที่สุด 5 อันดับแรก
      pool.execute(`
        SELECT u.user_id, u.username, u.full_name, COUNT(p.project_id) as project_count
        FROM users u
        JOIN projects p ON u.user_id = p.user_id
        GROUP BY u.user_id
        ORDER BY project_count DESC
        LIMIT 5
      `),
      
      // 10. จำนวนผู้ใช้ที่สมัครในแต่ละเดือน (12 เดือนล่าสุด)
      pool.execute(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month, 
          COUNT(*) as count 
        FROM users 
        WHERE created_at > DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY month 
        ORDER BY month
      `),
      
      // 11. จำนวนการเข้าชมในแต่ละเดือน (12 เดือนล่าสุด) - เฉพาะจาก visitor_views
      pool.execute(`
        SELECT 
          DATE_FORMAT(viewed_at, '%Y-%m') as month, 
          COUNT(*) as count 
        FROM visitor_views
        WHERE viewed_at > DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY month 
        ORDER BY month
      `)
    ]);

    // จัดรูปแบบข้อมูลสำหรับการส่งกลับ
    return res.status(STATUS_CODES.OK).json(successResponse({
      totals: {
        projects: totalProjects[0][0].count,
        users: totalUsers[0][0].count,
        views: totalViews[0][0].count || 0
      },
      projectStats: {
        byType: projectsByType[0],
        byStatus: projectsByStatus[0],
        byMonth: projectsByMonth[0],
        topViewed: topViewedProjects[0].map(project => ({
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
        byRole: usersByRole[0],
        byMonth: usersByMonth[0],
        topContributors: topContributors[0].map(user => ({
          id: user.user_id,
          username: user.username,
          fullName: user.full_name,
          projectCount: user.project_count
        }))
      },
      viewStats: {
        byMonth: viewsByMonth[0]
      }
    }, 'Dashboard statistics retrieved successfully'));
    
  } catch (error) {
    logger.error('Error getting dashboard statistics:', error);
    return handleServerError(res, error);
  }
});

/**
 * คำนวณเปอร์เซ็นต์การเปลี่ยนแปลงระหว่างสองค่า
 * @param {number} current - ค่าปัจจุบัน
 * @param {number} previous - ค่าก่อนหน้า
 * @returns {number} - เปอร์เซ็นต์การเปลี่ยนแปลง
 */
const calculatePercentChange = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round((current - previous) / previous * 100);
};

/**
 * ดึงข้อมูลสถิติของวันนี้และเปรียบเทียบกับวันก่อนหน้า
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getTodayStats = asyncHandler(async (req, res) => {
  try {
    logger.debug('Fetching today statistics');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // ใช้ date helper function จาก utils
    const todayFormatted = formatToISODate(today);
    const yesterdayFormatted = formatToISODate(yesterday);
    
    logger.debug(`Today: ${todayFormatted}, Yesterday: ${yesterdayFormatted}`);
    
    // ดำเนินการค้นหาทั้งหมดพร้อมกัน
    const [
      projectsToday,
      projectsYesterday,
      usersToday,
      usersYesterday,
      visitorViewsToday,
      visitorViewsYesterday,
      loginsToday,
      loginsYesterday,
      approvedToday,
      approvedYesterday,
      rejectedToday,
      rejectedYesterday
    ] = await Promise.all([
      // 1. จำนวนโครงการที่อัปโหลดวันนี้
      pool.execute('SELECT COUNT(*) as count FROM projects WHERE DATE(created_at) = ?', [todayFormatted]),
      
      // 2. จำนวนโครงการที่อัปโหลดเมื่อวาน
      pool.execute('SELECT COUNT(*) as count FROM projects WHERE DATE(created_at) = ?', [yesterdayFormatted]),
      
      // 3. จำนวนผู้ใช้ที่สมัครวันนี้
      pool.execute('SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = ?', [todayFormatted]),
      
      // 4. จำนวนผู้ใช้ที่สมัครเมื่อวาน
      pool.execute('SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = ?', [yesterdayFormatted]),
      
      // 5. จำนวนการเข้าชมวันนี้ (visitor)
      pool.execute('SELECT COUNT(*) as count FROM visitor_views WHERE DATE(viewed_at) = ?', [todayFormatted]),
      
      // 6. จำนวนการเข้าชมเมื่อวาน (visitor)
      pool.execute('SELECT COUNT(*) as count FROM visitor_views WHERE DATE(viewed_at) = ?', [yesterdayFormatted]),
      
      // 7. จำนวนการเข้าสู่ระบบวันนี้
      pool.execute('SELECT COUNT(*) as count FROM login_logs WHERE DATE(login_time) = ?', [todayFormatted]),
      
      // 8. จำนวนการเข้าสู่ระบบเมื่อวาน
      pool.execute('SELECT COUNT(*) as count FROM login_logs WHERE DATE(login_time) = ?', [yesterdayFormatted]),
      
      // 9. จำนวนโครงการที่ได้รับการอนุมัติวันนี้
      pool.execute(`
        SELECT COUNT(*) as count
        FROM project_reviews
        WHERE status = ? AND DATE(reviewed_at) = ?`, 
        [PROJECT_STATUSES.APPROVED, todayFormatted]
      ),
      
      // 10. จำนวนโครงการที่ได้รับการอนุมัติเมื่อวาน
      pool.execute(`
        SELECT COUNT(*) as count
        FROM project_reviews
        WHERE status = ? AND DATE(reviewed_at) = ?`, 
        [PROJECT_STATUSES.APPROVED, yesterdayFormatted]
      ),
      
      // 11. จำนวนโครงการที่ถูกปฏิเสธวันนี้
      pool.execute(`
        SELECT COUNT(*) as count
        FROM project_reviews
        WHERE status = ? AND DATE(reviewed_at) = ?`, 
        [PROJECT_STATUSES.REJECTED, todayFormatted]
      ),
      
      // 12. จำนวนโครงการที่ถูกปฏิเสธเมื่อวาน
      pool.execute(`
        SELECT COUNT(*) as count
        FROM project_reviews
        WHERE status = ? AND DATE(reviewed_at) =?`, 
        [PROJECT_STATUSES.REJECTED, yesterdayFormatted]
      )
    ]);
    
    // แปลงผลลัพธ์ให้เป็นค่าตัวเลข
    const projectsTodayCount = projectsToday[0][0].count;
    const projectsYesterdayCount = projectsYesterday[0][0].count;
    const usersTodayCount = usersToday[0][0].count;
    const usersYesterdayCount = usersYesterday[0][0].count;
    const visitorViewsTodayCount = visitorViewsToday[0][0].count;
    const visitorViewsYesterdayCount = visitorViewsYesterday[0][0].count;
    const loginsTodayCount = loginsToday[0][0].count;
    const loginsYesterdayCount = loginsYesterday[0][0].count;
    const approvedTodayCount = approvedToday[0][0].count;
    const approvedYesterdayCount = approvedYesterday[0][0].count;
    const rejectedTodayCount = rejectedToday[0][0].count;
    const rejectedYesterdayCount = rejectedYesterday[0][0].count;
    
    // กำหนดค่า company views เป็น 0 เพื่อความเข้ากันได้กับ frontend
    const companyViewsTodayCount = 0;
    const companyViewsYesterdayCount = 0;
    
    // คำนวณค่ารวม (ในที่นี้ visitor views = total views เนื่องจากไม่มี company views)
    const totalViewsToday = visitorViewsTodayCount;
    const totalViewsYesterday = visitorViewsYesterdayCount;
    const totalReviewsToday = approvedTodayCount + rejectedTodayCount;
    const totalReviewsYesterday = approvedYesterdayCount + rejectedYesterdayCount;
    
    return res.status(STATUS_CODES.OK).json(successResponse({
      projects: {
        today: projectsTodayCount,
        yesterday: projectsYesterdayCount,
        percentChange: calculatePercentChange(projectsTodayCount, projectsYesterdayCount)
      },
      users: {
        today: usersTodayCount,
        yesterday: usersYesterdayCount,
        percentChange: calculatePercentChange(usersTodayCount, usersYesterdayCount)
      },
      views: {
        visitor: {
          today: visitorViewsTodayCount,
          yesterday: visitorViewsYesterdayCount,
          percentChange: calculatePercentChange(visitorViewsTodayCount, visitorViewsYesterdayCount)
        },
        company: {
          today: companyViewsTodayCount,
          yesterday: companyViewsYesterdayCount,
          percentChange: 0 // Percent change is 0 since both values are 0
        },
        total: {
          today: totalViewsToday,
          yesterday: totalViewsYesterday,
          percentChange: calculatePercentChange(totalViewsToday, totalViewsYesterday)
        }
      },
      logins: {
        today: loginsTodayCount,
        yesterday: loginsYesterdayCount,
        percentChange: calculatePercentChange(loginsTodayCount, loginsYesterdayCount)
      },
      reviews: {
        approved: {
          today: approvedTodayCount,
          yesterday: approvedYesterdayCount,
          percentChange: calculatePercentChange(approvedTodayCount, approvedYesterdayCount)
        },
        rejected: {
          today: rejectedTodayCount,
          yesterday: rejectedYesterdayCount,
          percentChange: calculatePercentChange(rejectedTodayCount, rejectedYesterdayCount)
        },
        total: {
          today: totalReviewsToday,
          yesterday: totalReviewsYesterday,
          percentChange: calculatePercentChange(totalReviewsToday, totalReviewsYesterday)
        }
      }
    }, 'Today statistics retrieved successfully'));
    
  } catch (error) {
    logger.error('Error getting today statistics:', error);
    return handleServerError(res, error);
  }
});

/**
 * ดึงข้อมูลสถิติแยกตามประเภทของโครงการ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getProjectTypeStats = asyncHandler(async (req, res) => {
  try {
    logger.debug('Fetching project type statistics');
    
    // ดำเนินการค้นหาทั้งหมดพร้อมกัน
    const [
      projectsByType,
      avgViewsByType,
      projectsByMonthAndType,
      approvalRateByType,
      topViewedByType
    ] = await Promise.all([
      // 1. จำนวนโครงการแยกตามประเภท
      pool.execute('SELECT type, COUNT(*) as count FROM projects GROUP BY type'),
      
      // 2. จำนวนการเข้าชมเฉลี่ยแยกตามประเภท
      pool.execute('SELECT type, AVG(views_count) as avg_views FROM projects GROUP BY type'),
      
      // 3. จำนวนโครงการที่อัปโหลดในแต่ละเดือนแยกตามประเภท (12 เดือนล่าสุด)
      pool.execute(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          type,
          COUNT(*) as count 
        FROM projects 
        WHERE created_at > DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY month, type
        ORDER BY month, type
      `),
      
      // 4. อัตราการอนุมัติแยกตามประเภท
      pool.execute(`
        SELECT 
          p.type,
          COUNT(CASE WHEN pr.status = 'approved' THEN 1 END) as approved_count,
          COUNT(CASE WHEN pr.status = 'rejected' THEN 1 END) as rejected_count,
          COUNT(*) as total_count,
          (COUNT(CASE WHEN pr.status = 'approved' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)) as approval_rate
        FROM project_reviews pr
        JOIN projects p ON pr.project_id = p.project_id
        GROUP BY p.type
      `),
      
      // 5. โครงการที่มียอดเข้าชมมากที่สุดแยกตามประเภท
      pool.execute(`
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
          WHERE p.status = ? AND p.visibility = 1
        ) as ranked
        WHERE row_num <= 3
      `, [PROJECT_STATUSES.APPROVED])
    ]);
    
    // แปลงข้อมูลให้เหมาะสมกับ frontend
    // สร้างรูปแบบข้อมูลสำหรับประเภทโครงการทั้งหมด
    const typeStats = {};
    
    // ใช้ค่าคงที่ PROJECT_TYPES จากไฟล์ constants
    Object.values(PROJECT_TYPES).forEach(type => {
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
    projectsByType[0].forEach(item => {
      if (typeStats[item.type]) {
        typeStats[item.type].count = item.count;
      }
    });
    
    // เติมข้อมูลจำนวนการเข้าชมเฉลี่ย
    avgViewsByType[0].forEach(item => {
      if (typeStats[item.type]) {
        typeStats[item.type].avgViews = Math.round(item.avg_views * 10) / 10;
      }
    });
    
    // เติมข้อมูลอัตราการอนุมัติ
    approvalRateByType[0].forEach(item => {
      if (typeStats[item.type]) {
        typeStats[item.type].approvalRate = Math.round(item.approval_rate * 10) / 10 || 0;
        typeStats[item.type].approvedCount = item.approved_count;
        typeStats[item.type].rejectedCount = item.rejected_count;
        typeStats[item.type].totalReviewCount = item.total_count;
      }
    });
    
    // จัดรูปแบบข้อมูลโครงการรายเดือนแยกตามประเภท
    const monthlyTrends = {};
    
    projectsByMonthAndType[0].forEach(item => {
      if (!monthlyTrends[item.month]) {
        monthlyTrends[item.month] = {
          month: item.month,
          [PROJECT_TYPES.COURSEWORK]: 0,
          [PROJECT_TYPES.ACADEMIC]: 0, 
          [PROJECT_TYPES.COMPETITION]: 0
        };
      }
      
      if (Object.values(PROJECT_TYPES).includes(item.type)) {
        monthlyTrends[item.month][item.type] = item.count;
      }
    });
    
    const monthlyTrendsArray = Object.values(monthlyTrends).sort((a, b) => a.month.localeCompare(b.month));
    
    // เติมข้อมูลโครงการที่มียอดเข้าชมมากที่สุดแยกตามประเภท
    topViewedByType[0].forEach(project => {
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
    
    return res.status(STATUS_CODES.OK).json(successResponse({
      stats: typeStats,
      monthlyTrends: monthlyTrendsArray
    }, 'Project type statistics retrieved successfully'));
    
  } catch (error) {
    logger.error('Error getting project type statistics:', error);
    return handleServerError(res, error);
  }
});

/**
 * ดึงข้อมูลสถิติแยกตามชั้นปีของนักศึกษา
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getStudyYearStats = asyncHandler(async (req, res) => {
  try {
    logger.debug('Fetching study year statistics');
    
    // ดำเนินการค้นหาทั้งหมดพร้อมกัน
    const [
      projectsByStudyYear,
      avgViewsByStudyYear,
      projectsByStudyYearAndType,
      approvalRateByStudyYear,
      topViewedByStudyYear
    ] = await Promise.all([
      // 1. จำนวนโครงการแยกตามชั้นปี
      pool.execute(`
        SELECT study_year, COUNT(*) as count 
        FROM projects 
        GROUP BY study_year
        ORDER BY study_year
      `),
      
      // 2. จำนวนการเข้าชมเฉลี่ยแยกตามชั้นปี
      pool.execute(`
        SELECT study_year, AVG(views_count) as avg_views 
        FROM projects 
        GROUP BY study_year
        ORDER BY study_year
      `),
      
      // 3. จำนวนโครงการแยกตามชั้นปีและประเภท
      pool.execute(`
        SELECT study_year, type, COUNT(*) as count 
        FROM projects 
        GROUP BY study_year, type
        ORDER BY study_year, type
      `),
      
      // 4. อัตราการอนุมัติแยกตามชั้นปี
      pool.execute(`
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
      `),
      
      // 5. โครงการที่มียอดเข้าชมมากที่สุดแยกตามชั้นปี
      pool.execute(`
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
          WHERE p.status = ? AND p.visibility = 1
        ) as ranked
        WHERE row_num <= 3
        ORDER BY study_year, row_num
      `, [PROJECT_STATUSES.APPROVED])
    ]);
    
    // แปลงข้อมูลให้เหมาะสมกับ frontend
    const yearStats = {};
    
    // สร้างรูปแบบข้อมูลเริ่มต้นสำหรับชั้นปี 1-4
    [1, 2, 3, 4].forEach(year => {
      yearStats[year] = {
        count: 0,
        avgViews: 0,
        approvalRate: 0,
        approvedCount: 0,
        rejectedCount: 0,
        totalReviewCount: 0,
        byType: {
          [PROJECT_TYPES.COURSEWORK]: 0,
          [PROJECT_TYPES.ACADEMIC]: 0,
          [PROJECT_TYPES.COMPETITION]: 0
        },
        topProjects: []
      };
    });
    
    // เติมข้อมูลจำนวนโครงการ
    projectsByStudyYear[0].forEach(item => {
      if (yearStats[item.study_year]) {
        yearStats[item.study_year].count = item.count;
      }
    });
    
    // เติมข้อมูลจำนวนการเข้าชมเฉลี่ย
    avgViewsByStudyYear[0].forEach(item => {
      if (yearStats[item.study_year]) {
        yearStats[item.study_year].avgViews = Math.round(item.avg_views * 10) / 10 || 0;
      }
    });
    
    // เติมข้อมูลแยกตามประเภท
    projectsByStudyYearAndType[0].forEach(item => {
      if (yearStats[item.study_year] && Object.values(PROJECT_TYPES).includes(item.type)) {
        yearStats[item.study_year].byType[item.type] = item.count;
      }
    });
    
    // เติมข้อมูลอัตราการอนุมัติ
    approvalRateByStudyYear[0].forEach(item => {
      if (yearStats[item.study_year]) {
        yearStats[item.study_year].approvalRate = Math.round(item.approval_rate * 10) / 10 || 0;
        yearStats[item.study_year].approvedCount = item.approved_count;
        yearStats[item.study_year].rejectedCount = item.rejected_count;
        yearStats[item.study_year].totalReviewCount = item.total_count;
      }
    });
    
    // เติมข้อมูลโครงการที่มียอดเข้าชมมากที่สุด
   // เติมข้อมูลโครงการที่มียอดเข้าชมมากที่สุด
   topViewedByStudyYear[0].forEach(project => {
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
  
  return res.status(STATUS_CODES.OK).json(successResponse({
    stats: yearStats
  }, 'Study year statistics retrieved successfully'));
  
} catch (error) {
  logger.error('Error getting study year statistics:', error);
  return handleServerError(res, error);
}
});

/**
* สร้างและส่งออกฟังก์ชันทั้งหมดสำหรับให้เรียกใช้งานจากภายนอก
*/
export default {
getDashboardStats,
getTodayStats,
getProjectTypeStats,
getStudyYearStats
};