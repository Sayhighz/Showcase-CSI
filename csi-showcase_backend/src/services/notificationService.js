// services/notificationService.js
const pool = require('../config/database.js');
const logger = require('../config/logger.js');
const { PROJECT_STATUSES } = require('../constants/projectStatuses.js');

/**
 * Notification Service
 * จัดการระบบการแจ้งเตือนและการส่งอีเมล
 */

/**
 * สร้างการแจ้งเตือนทั่วไป
 * @param {number} userId - ID ของผู้ใช้ที่จะได้รับการแจ้งเตือน
 * @param {string} type - ประเภทการแจ้งเตือน
 * @param {string} title - หัวข้อการแจ้งเตือน
 * @param {string} message - ข้อความแจ้งเตือน
 * @param {Object} data - ข้อมูลเพิ่มเติม
 * @returns {Promise<number>} ID ของการแจ้งเตือนที่สร้าง
 */
const createNotification = async (userId, type, title, message, data = {}) => {
  try {
    const [result] = await pool.execute(`
      INSERT INTO notifications (user_id, type, title, message, data, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, 0, NOW())
    `, [userId, type, title, message, JSON.stringify(data)]);
    
    logger.info(`Notification created: ${result.insertId} for user ${userId}`);
    return result.insertId;
  } catch (error) {
    logger.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * แจ้งเตือนผู้ดูแลระบบเมื่อมีโครงการใหม่
 * @param {number} projectId - ID ของโครงการ
 * @param {string} projectTitle - หัวข้อโครงการ
 * @param {string} studentName - ชื่อนักศึกษา
 * @param {string} projectType - ประเภทโครงการ
 */
const notifyAdminsNewProject = async (projectId, projectTitle, studentName, projectType) => {
  try {
    // ดึงรายชื่อผู้ดูแลระบบทั้งหมด
    const [admins] = await pool.execute(`
      SELECT user_id FROM users WHERE role = 'admin'
    `);
    
    const title = 'โครงการใหม่รอการอนุมัติ';
    const message = `นักศึกษา ${studentName} ได้ส่งโครงการ "${projectTitle}" (ประเภท: ${projectType}) เพื่อรอการอนุมัติ`;
    
    // ส่งการแจ้งเตือนให้ผู้ดูแลระบบทุกคน
    for (const admin of admins) {
      await createNotification(
        admin.user_id,
        'project_submitted',
        title,
        message,
        { projectId, projectTitle, studentName, projectType }
      );
    }
    
    logger.info(`Notified ${admins.length} admins about new project ${projectId}`);
  } catch (error) {
    logger.error('Error notifying admins about new project:', error);
    throw error;
  }
};

/**
 * แจ้งเตือนผู้ใช้เกี่ยวกับผลการตรวจสอบโครงการ
 * @param {number} userId - ID ของผู้ใช้
 * @param {number} projectId - ID ของโครงการ
 * @param {string} projectTitle - หัวข้อโครงการ
 * @param {string} status - สถานะใหม่ของโครงการ
 * @param {string} comment - ความเห็นจากผู้ตรวจสอบ
 */
const notifyProjectReview = async (userId, projectId, projectTitle, status, comment = '') => {
  try {
    let title, message;
    
    if (status === PROJECT_STATUSES.APPROVED) {
      title = 'โครงการได้รับการอนุมัติแล้ว';
      message = `โครงการ "${projectTitle}" ของคุณได้รับการอนุมัติแล้ว`;
    } else if (status === PROJECT_STATUSES.REJECTED) {
      title = 'โครงการไม่ได้รับการอนุมัติ';
      message = `โครงการ "${projectTitle}" ของคุณไม่ได้รับการอนุมัติ`;
    } else {
      title = 'สถานะโครงการมีการเปลี่ยนแปลง';
      message = `สถานะของโครงการ "${projectTitle}" มีการเปลี่ยนแปลงเป็น ${status}`;
    }
    
    if (comment) {
      message += `\nความเห็น: ${comment}`;
    }
    
    await createNotification(
      userId,
      'project_reviewed',
      title,
      message,
      { projectId, projectTitle, status, comment }
    );
    
    logger.info(`Notified user ${userId} about project review ${projectId}`);
  } catch (error) {
    logger.error('Error notifying project review:', error);
    throw error;
  }
};

/**
 * แจ้งเตือนเมื่อโครงการถูกแก้ไข
 * @param {number} userId - ID ของผู้ใช้
 * @param {number} projectId - ID ของโครงการ
 * @param {string} projectTitle - หัวข้อโครงการ
 * @param {string} adminName - ชื่อผู้ดูแลระบบที่แก้ไข
 */
const notifyProjectUpdated = async (userId, projectId, projectTitle, adminName) => {
  try {
    const title = 'โครงการของคุณถูกแก้ไข';
    const message = `โครงการ "${projectTitle}" ของคุณถูกแก้ไขโดย ${adminName}`;
    
    await createNotification(
      userId,
      'project_updated',
      title,
      message,
      { projectId, projectTitle, adminName }
    );
    
    logger.info(`Notified user ${userId} about project update ${projectId}`);
  } catch (error) {
    logger.error('Error notifying project update:', error);
    throw error;
  }
};

/**
 * แจ้งเตือนเมื่อโครงการถูกลบ
 * @param {number} userId - ID ของผู้ใช้
 * @param {string} projectTitle - หัวข้อโครงการ
 * @param {string} reason - เหตุผลในการลบ
 */
const notifyProjectDeleted = async (userId, projectTitle, reason = '') => {
  try {
    const title = 'โครงการของคุณถูกลบ';
    let message = `โครงการ "${projectTitle}" ของคุณถูกลบออกจากระบบ`;
    
    if (reason) {
      message += `\nเหตุผล: ${reason}`;
    }
    
    await createNotification(
      userId,
      'project_deleted',
      title,
      message,
      { projectTitle, reason }
    );
    
    logger.info(`Notified user ${userId} about project deletion`);
  } catch (error) {
    logger.error('Error notifying project deletion:', error);
    throw error;
  }
};

/**
 * บันทึกการเปลี่ยนแปลงโครงการ (ไม่บล็อก flow หลัก)
 * หมายเหตุ:
 * - เดิมมีการ await INSERT ขณะ transaction หลักยังเปิดอยู่ ทำให้เกิด lock wait timeout
 * - เปลี่ยนเป็น schedule งานด้วย setImmediate แล้ว return ทันทีเพื่อไม่บล็อก
 */
const logProjectChange = async (
  projectId,
  changeType,
  fieldChanged,
  oldValue,
  newValue,
  changedBy,
  reason = null,
  ipAddress = null,
  userAgent = null
) => {
  try {
    // Schedule non-blocking insert to avoid holding up the main transaction flow
    setImmediate(() => {
      pool.execute(
        `
        INSERT INTO project_changes (
          project_id, change_type, field_changed, old_value, new_value,
          changed_by, reason, ip_address, user_agent, changed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `,
        [
          projectId,
          changeType,
          fieldChanged,
          JSON.stringify(oldValue),
          JSON.stringify(newValue),
          changedBy,
          reason,
          ipAddress,
          userAgent
        ]
      )
        .then(() => {
          logger.info(`Project change logged: ${changeType} for project ${projectId}`);
        })
        .catch((error) => {
          logger.error('Error logging project change:', error);
        });
    });

    // Return immediately so callers are never blocked by logging side-effects
    return true;
  } catch (error) {
    // Extremely unlikely here since setImmediate defers actual work
    logger.error('Error scheduling project change log:', error);
    return false;
  }
};

/**
 * บันทึกการเข้าสู่ระบบ
 * @param {number} userId - ID ของผู้ใช้
 * @param {string} ipAddress - IP Address
 * @param {string} deviceType - ประเภทอุปกรณ์
 * @param {string} os - ระบบปฏิบัติการ
 * @param {string} browser - เบราว์เซอร์
 * @param {string} userAgent - User Agent
 */
const logUserLogin = async (userId, ipAddress, deviceType, os, browser, userAgent) => {
  try {
    await pool.execute(`
      INSERT INTO login_logs (user_id, login_time, ip_address, device_type, os, browser, user_agent)
      VALUES (?, NOW(), ?, ?, ?, ?, ?)
    `, [userId, ipAddress, deviceType, os, browser, userAgent]);
    
    logger.info(`Login logged for user ${userId} from ${ipAddress}`);
  } catch (error) {
    logger.error('Error logging user login:', error);
    throw error;
  }
};

/**
 * บันทึกการเข้าชมโครงการ
 * @param {number} projectId - ID ของโครงการ
 * @param {string} ipAddress - IP Address ของผู้เข้าชม
 * @param {string} userAgent - User Agent ของผู้เข้าชม
 */
const logProjectView = async (projectId, ipAddress, userAgent) => {
  try {
    await pool.execute(`
      INSERT INTO visitor_views (project_id, ip_address, user_agent, viewed_at)
      VALUES (?, ?, ?, NOW())
    `, [projectId, ipAddress, userAgent]);
    
    logger.info(`Project view logged: project ${projectId} from ${ipAddress}`);
  } catch (error) {
    logger.error('Error logging project view:', error);
    throw error;
  }
};

/**
 * ดึงการแจ้งเตือนของผู้ใช้
 * @param {number} userId - ID ของผู้ใช้
 * @param {number} limit - จำนวนการแจ้งเตือนที่ต้องการ
 * @param {boolean} onlyUnread - แสดงเฉพาะที่ยังไม่อ่าน
 * @returns {Promise<Array>} รายการการแจ้งเตือน
 */
const getUserNotifications = async (userId, limit = 20, onlyUnread = false) => {
  try {
    let query = `
      SELECT * FROM notifications 
      WHERE user_id = ?
    `;
    
    if (onlyUnread) {
      query += ` AND is_read = 0`;
    }
    
    query += ` ORDER BY created_at DESC LIMIT ?`;
    
    const [notifications] = await pool.execute(query, [userId, limit]);
    
    return notifications.map(notification => ({
      ...notification,
      data: notification.data ? JSON.parse(notification.data) : {}
    }));
  } catch (error) {
    logger.error('Error getting user notifications:', error);
    throw error;
  }
};

/**
 * ทำเครื่องหมายการแจ้งเตือนว่าอ่านแล้ว
 * @param {number} notificationId - ID ของการแจ้งเตือน
 * @param {number} userId - ID ของผู้ใช้
 */
const markNotificationAsRead = async (notificationId, userId) => {
  try {
    await pool.execute(`
      UPDATE notifications 
      SET is_read = 1 
      WHERE notification_id = ? AND user_id = ?
    `, [notificationId, userId]);
    
    logger.info(`Notification ${notificationId} marked as read for user ${userId}`);
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * ทำเครื่องหมายการแจ้งเตือนทั้งหมดว่าอ่านแล้ว
 * @param {number} userId - ID ของผู้ใช้
 */
const markAllNotificationsAsRead = async (userId) => {
  try {
    await pool.execute(`
      UPDATE notifications 
      SET is_read = 1 
      WHERE user_id = ? AND is_read = 0
    `, [userId]);
    
    logger.info(`All notifications marked as read for user ${userId}`);
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * นับจำนวนการแจ้งเตือนที่ยังไม่อ่าน
 * @param {number} userId - ID ของผู้ใช้
 * @returns {Promise<number>} จำนวนการแจ้งเตือนที่ยังไม่อ่าน
 */
const getUnreadNotificationCount = async (userId) => {
  try {
    const [result] = await pool.execute(`
      SELECT COUNT(*) as count FROM notifications 
      WHERE user_id = ? AND is_read = 0
    `, [userId]);
    
    return result[0].count;
  } catch (error) {
    logger.error('Error getting unread notification count:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  notifyAdminsNewProject,
  notifyProjectReview,
  notifyProjectUpdated,
  notifyProjectDeleted,
  logProjectChange,
  logUserLogin,
  logProjectView,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount
};