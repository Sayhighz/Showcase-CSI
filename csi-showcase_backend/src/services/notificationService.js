// services/notificationService.js
import pool from '../config/database.js';
import logger from '../config/logger.js';
import emailService from './emailService.js';

/**
 * ประเภทการแจ้งเตือน
 */
export const NOTIFICATION_TYPES = {
  PROJECT_APPROVED: 'project_approved',         // โครงการได้รับการอนุมัติ
  PROJECT_REJECTED: 'project_rejected',         // โครงการถูกปฏิเสธ
  NEW_PROJECT_PENDING: 'new_project_pending',   // มีโครงการใหม่รอการอนุมัติ
  COMPANY_VIEW: 'company_view',                 // มีบริษัทเข้าชมโครงการ
  COMMENT_ADDED: 'comment_added',               // มีความคิดเห็นใหม่
  ACCOUNT_CREATED: 'account_created',           // สร้างบัญชีผู้ใช้ใหม่
  PASSWORD_RESET: 'password_reset',             // รีเซ็ตรหัสผ่าน
  SYSTEM_NOTIFICATION: 'system_notification'    // การแจ้งเตือนจากระบบ
};

/**
 * สร้างการแจ้งเตือนใหม่
 * @param {number} userId - ID ของผู้ใช้ที่จะรับการแจ้งเตือน
 * @param {string} type - ประเภทการแจ้งเตือน
 * @param {string} message - ข้อความแจ้งเตือน
 * @param {Object} data - ข้อมูลเพิ่มเติม
 * @returns {Promise<Object>} - ข้อมูลการแจ้งเตือนที่สร้าง
 */
export const createNotification = async (userId, type, message, data = {}) => {
  try {
    // บันทึกการแจ้งเตือนลงในฐานข้อมูล
    const [result] = await pool.execute(`
      INSERT INTO notifications (user_id, type, message, data)
      VALUES (?, ?, ?, ?)
    `, [userId, type, message, JSON.stringify(data)]);
    
    const notificationId = result.insertId;
    
    logger.info(`Notification created for user ${userId}`, { type, notificationId });
    
    return {
      id: notificationId,
      userId,
      type,
      message,
      data,
      createdAt: new Date()
    };
  } catch (error) {
    logger.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * ดึงการแจ้งเตือนของผู้ใช้
 * @param {number} userId - ID ของผู้ใช้
 * @param {boolean} unreadOnly - ดึงเฉพาะการแจ้งเตือนที่ยังไม่ได้อ่าน
 * @param {number} limit - จำนวนการแจ้งเตือนที่ต้องการ
 * @returns {Promise<Array>} - รายการการแจ้งเตือน
 */
export const getUserNotifications = async (userId, unreadOnly = false, limit = 20) => {
  try {
    // สร้าง query พื้นฐาน
    let query = `
      SELECT * FROM notifications
      WHERE user_id = ?
    `;
    
    if (unreadOnly) {
      query += ' AND read_at IS NULL';
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?';
    
    // ดึงข้อมูลการแจ้งเตือน
    const [notifications] = await pool.execute(query, [userId, limit]);
    
    // จัดรูปแบบข้อมูลการแจ้งเตือน
    return notifications.map(notification => ({
      id: notification.notification_id,
      userId: notification.user_id,
      type: notification.type,
      message: notification.message,
      data: JSON.parse(notification.data || '{}'),
      createdAt: notification.created_at,
      readAt: notification.read_at
    }));
  } catch (error) {
    logger.error('Error getting user notifications:', error);
    throw error;
  }
};

/**
 * ทำเครื่องหมายว่าอ่านการแจ้งเตือนแล้ว
 * @param {number} notificationId - ID ของการแจ้งเตือน
 * @param {number} userId - ID ของผู้ใช้ (สำหรับตรวจสอบสิทธิ์)
 * @returns {Promise<boolean>} - ผลการทำเครื่องหมาย
 */
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    // อัปเดตสถานะการอ่านการแจ้งเตือน
    const [result] = await pool.execute(`
      UPDATE notifications
      SET read_at = NOW()
      WHERE notification_id = ? AND user_id = ?
    `, [notificationId, userId]);
    
    return result.affectedRows > 0;
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    return false;
  }
};

/**
 * ทำเครื่องหมายว่าอ่านการแจ้งเตือนทั้งหมดแล้ว
 * @param {number} userId - ID ของผู้ใช้
 * @returns {Promise<number>} - จำนวนการแจ้งเตือนที่ถูกทำเครื่องหมาย
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    // อัปเดตสถานะการอ่านการแจ้งเตือนทั้งหมด
    const [result] = await pool.execute(`
      UPDATE notifications
      SET read_at = NOW()
      WHERE user_id = ? AND read_at IS NULL
    `, [userId]);
    
    return result.affectedRows;
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    return 0;
  }
};

/**
 * ลบการแจ้งเตือน
 * @param {number} notificationId - ID ของการแจ้งเตือน
 * @param {number} userId - ID ของผู้ใช้ (สำหรับตรวจสอบสิทธิ์)
 * @returns {Promise<boolean>} - ผลการลบ
 */
export const deleteNotification = async (notificationId, userId) => {
  try {
    // ลบการแจ้งเตือน
    const [result] = await pool.execute(`
      DELETE FROM notifications
      WHERE notification_id = ? AND user_id = ?
    `, [notificationId, userId]);
    
    return result.affectedRows > 0;
  } catch (error) {
    logger.error('Error deleting notification:', error);
    return false;
  }
};

/**
 * นับจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
 * @param {number} userId - ID ของผู้ใช้
 * @returns {Promise<number>} - จำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
 */
export const countUnreadNotifications = async (userId) => {
  try {
    // นับจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
    const [result] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = ? AND read_at IS NULL
    `, [userId]);
    
    return result[0].count;
  } catch (error) {
    logger.error('Error counting unread notifications:', error);
    return 0;
  }
};

/**
 * แจ้งเตือนเมื่อโครงการได้รับการอนุมัติหรือถูกปฏิเสธ
 * @param {number} userId - ID ของผู้ใช้ที่จะรับการแจ้งเตือน
 * @param {number} projectId - ID ของโครงการ
 * @param {string} projectTitle - ชื่อโครงการ
 * @param {string} status - สถานะการอนุมัติ ('approved' หรือ 'rejected')
 * @param {string} comment - ความคิดเห็นจากผู้ดูแลระบบ
 * @returns {Promise<Object>} - ข้อมูลการแจ้งเตือนที่สร้าง
 */
export const notifyProjectReview = async (userId, projectId, projectTitle, status, comment = '') => {
    try {
      // ตรวจสอบข้อมูลผู้ใช้
      const [users] = await pool.execute(`
        SELECT username, email FROM users WHERE user_id = ?
      `, [userId]);
      
      if (users.length === 0) {
        throw new Error(`User not found: ${userId}`);
      }
      
      const user = users[0];
      
      // กำหนดประเภทและข้อความแจ้งเตือน
      const type = status === 'approved' ? NOTIFICATION_TYPES.PROJECT_APPROVED : NOTIFICATION_TYPES.PROJECT_REJECTED;
      const statusText = status === 'approved' ? 'ได้รับการอนุมัติ' : 'ถูกปฏิเสธ';
      const message = `โครงการ "${projectTitle}" ของคุณ${statusText}`;
      
      // สร้างข้อมูลเพิ่มเติม
      const data = {
        projectId,
        projectTitle,
        status,
        comment,
        link: `/projects/${projectId}`
      };
      
      // สร้างการแจ้งเตือนในระบบ
      const notification = await createNotification(userId, type, message, data);
      
      // ส่งอีเมลแจ้งเตือน
      await emailService.sendProjectStatusEmail(
        user.email,
        user.username,
        projectTitle,
        status,
        comment
      );
      
      return notification;
    } catch (error) {
      logger.error('Error notifying project review:', error);
      throw error;
    }
  };
  
  /**
   * แจ้งเตือนผู้ดูแลระบบเมื่อมีโครงการใหม่รอการอนุมัติ
   * @param {number} projectId - ID ของโครงการ
   * @param {string} projectTitle - ชื่อโครงการ
   * @param {string} studentName - ชื่อนักศึกษา
   * @param {string} projectType - ประเภทของโครงการ
   * @returns {Promise<Array>} - รายการการแจ้งเตือนที่สร้าง
   */
  export const notifyAdminsNewProject = async (projectId, projectTitle, studentName, projectType) => {
    try {
      // ดึงรายชื่อผู้ดูแลระบบทั้งหมด
      const [admins] = await pool.execute(`
        SELECT user_id, username, email FROM users WHERE role = 'admin'
      `);
      
      if (admins.length === 0) {
        logger.warn('No admin users found for notification');
        return [];
      }
      
      const message = `มีโครงการใหม่รอการอนุมัติ: "${projectTitle}" จาก ${studentName}`;
      const data = {
        projectId,
        projectTitle,
        studentName,
        projectType,
        link: `/admin/projects/review/${projectId}`
      };
      
      const notifications = [];
      
      // สร้างการแจ้งเตือนสำหรับผู้ดูแลระบบแต่ละคน
      for (const admin of admins) {
        // สร้างการแจ้งเตือนในระบบ
        const notification = await createNotification(
          admin.user_id,
          NOTIFICATION_TYPES.NEW_PROJECT_PENDING,
          message,
          data
        );
        
        notifications.push(notification);
        
        // ส่งอีเมลแจ้งเตือน
        await emailService.sendNewProjectNotificationEmail(
          admin.email,
          projectTitle,
          studentName,
          projectType
        );
      }
      
      return notifications;
    } catch (error) {
      logger.error('Error notifying admins about new project:', error);
      throw error;
    }
  };
  
  /**
   * แจ้งเตือนเมื่อมีบริษัทเข้าชมโครงการ
   * @param {number} userId - ID ของผู้ใช้ที่จะรับการแจ้งเตือน
   * @param {number} projectId - ID ของโครงการ
   * @param {string} projectTitle - ชื่อโครงการ
   * @param {string} companyName - ชื่อบริษัท
   * @param {string} contactEmail - อีเมลติดต่อของบริษัท
   * @returns {Promise<Object>} - ข้อมูลการแจ้งเตือนที่สร้าง
   */
  export const notifyCompanyView = async (userId, projectId, projectTitle, companyName, contactEmail) => {
    try {
      // ตรวจสอบข้อมูลผู้ใช้
      const [users] = await pool.execute(`
        SELECT username, email FROM users WHERE user_id = ?
      `, [userId]);
      
      if (users.length === 0) {
        throw new Error(`User not found: ${userId}`);
      }
      
      const user = users[0];
      
      const message = `บริษัท ${companyName} ได้เข้าชมโครงการ "${projectTitle}" ของคุณ`;
      const data = {
        projectId,
        projectTitle,
        companyName,
        contactEmail,
        link: `/projects/${projectId}`
      };
      
      // สร้างการแจ้งเตือนในระบบ
      const notification = await createNotification(userId, NOTIFICATION_TYPES.COMPANY_VIEW, message, data);
      
      // ส่งอีเมลแจ้งเตือน
      await emailService.sendCompanyViewNotificationEmail(
        user.email,
        user.username,
        projectTitle,
        companyName,
        contactEmail
      );
      
      return notification;
    } catch (error) {
      logger.error('Error notifying company view:', error);
      throw error;
    }
  };
  
  /**
   * สร้างการแจ้งเตือนจากระบบ
   * @param {Array} userIds - รายการ ID ของผู้ใช้ที่จะรับการแจ้งเตือน
   * @param {string} title - หัวข้อการแจ้งเตือน
   * @param {string} message - ข้อความแจ้งเตือน
   * @param {Object} data - ข้อมูลเพิ่มเติม
   * @returns {Promise<Array>} - รายการการแจ้งเตือนที่สร้าง
   */
  export const createSystemNotification = async (userIds, title, message, data = {}) => {
    try {
      const notifications = [];
      
      // สร้างการแจ้งเตือนสำหรับผู้ใช้แต่ละคน
      for (const userId of userIds) {
        const notification = await createNotification(
          userId,
          NOTIFICATION_TYPES.SYSTEM_NOTIFICATION,
          message,
          { ...data, title }
        );
        
        notifications.push(notification);
      }
      
      return notifications;
    } catch (error) {
      logger.error('Error creating system notification:', error);
      throw error;
    }
  };
  
  /**
   * ลบการแจ้งเตือนเก่า
   * @param {number} days - จำนวนวันที่เก็บการแจ้งเตือน
   * @returns {Promise<number>} - จำนวนการแจ้งเตือนที่ถูกลบ
   */
  export const cleanupOldNotifications = async (days = 30) => {
    try {
      // ลบการแจ้งเตือนที่เก่ากว่าจำนวนวันที่กำหนด
      const [result] = await pool.execute(`
        DELETE FROM notifications
        WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
      `, [days]);
      
      logger.info(`Cleaned up ${result.affectedRows} old notifications`);
      
      return result.affectedRows;
    } catch (error) {
      logger.error('Error cleaning up old notifications:', error);
      return 0;
    }
  };
  
  export default {
    createNotification,
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    countUnreadNotifications,
    notifyProjectReview,
    notifyAdminsNewProject,
    notifyCompanyView,
    createSystemNotification,
    cleanupOldNotifications,
    NOTIFICATION_TYPES
  };