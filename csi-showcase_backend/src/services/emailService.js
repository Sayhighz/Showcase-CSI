// services/emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import logger from '../config/logger.js';

// โหลดค่าจากไฟล์ .env
dotenv.config();

// สร้าง transporter สำหรับส่งอีเมล
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * ส่งอีเมลรีเซ็ตรหัสผ่าน
 * @param {string} to - อีเมลผู้รับ
 * @param {string} resetToken - Token สำหรับรีเซ็ตรหัสผ่าน
 * @param {string} username - ชื่อผู้ใช้
 * @returns {Promise<boolean>} - ผลการส่งอีเมล
 */
export const sendPasswordResetEmail = async (to, resetToken, username) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"CSI Showcase" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'รีเซ็ตรหัสผ่าน - CSI Showcase',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #90278E;">รีเซ็ตรหัสผ่าน CSI Showcase</h2>
        <p>สวัสดี ${username},</p>
        <p>เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
        <p>กรุณาคลิกที่ลิงก์ด้านล่างเพื่อรีเซ็ตรหัสผ่านของคุณ:</p>
        <div style="margin: 20px 0;">
          <a href="${resetLink}" style="background-color: #90278E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">รีเซ็ตรหัสผ่าน</a>
        </div>
        <p>ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง</p>
        <p>หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</p>
        <p>ขอแสดงความนับถือ,<br>ทีมงาน CSI Showcase</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${to}`, { messageId: info.messageId });
    return true;
  } catch (error) {
    logger.error(`Error sending password reset email to ${to}:`, error);
    return false;
  }
};

/**
 * ส่งอีเมลยืนยันการสมัครสมาชิก
 * @param {string} to - อีเมลผู้รับ
 * @param {string} username - ชื่อผู้ใช้
 * @returns {Promise<boolean>} - ผลการส่งอีเมล
 */
export const sendWelcomeEmail = async (to, username) => {
  const loginLink = `${process.env.FRONTEND_URL}/login`;
  
  const mailOptions = {
    from: `"CSI Showcase" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'ยินดีต้อนรับสู่ CSI Showcase',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #90278E;">ยินดีต้อนรับสู่ CSI Showcase</h2>
        <p>สวัสดี ${username},</p>
        <p>ขอบคุณสำหรับการสมัครสมาชิกกับ CSI Showcase</p>
        <p>คุณสามารถเข้าสู่ระบบได้ที่ลิงก์ด้านล่าง:</p>
        <div style="margin: 20px 0;">
          <a href="${loginLink}" style="background-color: #90278E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">เข้าสู่ระบบ</a>
        </div>
        <p>CSI Showcase เป็นพื้นที่แสดงผลงานของนักศึกษาในสาขาวิทยาการคอมพิวเตอร์</p>
        <p>คุณสามารถอัปโหลดผลงานของคุณและแบ่งปันให้ผู้อื่นได้เห็น</p>
        <p>ขอแสดงความนับถือ,<br>ทีมงาน CSI Showcase</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Welcome email sent to ${to}`, { messageId: info.messageId });
    return true;
  } catch (error) {
    logger.error(`Error sending welcome email to ${to}:`, error);
    return false;
  }
};

/**
 * ส่งอีเมลแจ้งสถานะการอนุมัติผลงาน
 * @param {string} to - อีเมลผู้รับ
 * @param {string} username - ชื่อผู้ใช้
 * @param {string} projectTitle - ชื่อผลงาน
 * @param {string} status - สถานะการอนุมัติ ('approved' หรือ 'rejected')
 * @param {string} comment - ความคิดเห็นจากผู้ดูแลระบบ
 * @returns {Promise<boolean>} - ผลการส่งอีเมล
 */
export const sendProjectStatusEmail = async (to, username, projectTitle, status, comment = '') => {
  const projectsLink = `${process.env.FRONTEND_URL}/projects/my`;
  const statusText = status === 'approved' ? 'ได้รับการอนุมัติ' : 'ถูกปฏิเสธ';
  const statusColor = status === 'approved' ? '#28a745' : '#dc3545';
  
  const mailOptions = {
    from: `"CSI Showcase" <${process.env.EMAIL_USER}>`,
    to,
    subject: `ผลงานของคุณ ${statusText} - CSI Showcase`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #90278E;">การอัปเดตสถานะผลงาน</h2>
        <p>สวัสดี ${username},</p>
        <p>ผลงาน "${projectTitle}" ของคุณ <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
        ${comment ? `<p><strong>ความคิดเห็นจากผู้ดูแลระบบ:</strong> ${comment}</p>` : ''}
        <div style="margin: 20px 0;">
          <a href="${projectsLink}" style="background-color: #90278E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">ดูผลงานของฉัน</a>
        </div>
        <p>ขอแสดงความนับถือ,<br>ทีมงาน CSI Showcase</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Project status email sent to ${to}`, { 
      messageId: info.messageId,
      projectTitle,
      status
    });
    return true;
  } catch (error) {
    logger.error(`Error sending project status email to ${to}:`, error);
    return false;
  }
};

/**
 * ส่งอีเมลแจ้งเตือนผู้ดูแลระบบเมื่อมีผลงานใหม่รอการอนุมัติ
 * @param {string} to - อีเมลผู้ดูแลระบบ
 * @param {string} projectTitle - ชื่อผลงาน
 * @param {string} studentName - ชื่อนักศึกษา
 * @param {string} projectType - ประเภทของผลงาน
 * @returns {Promise<boolean>} - ผลการส่งอีเมล
 */
export const sendNewProjectNotificationEmail = async (to, projectTitle, studentName, projectType) => {
  const adminLink = `${process.env.FRONTEND_URL}/admin/projects/pending`;
  
  const mailOptions = {
    from: `"CSI Showcase" <${process.env.EMAIL_USER}>`,
    to,
    subject: `มีผลงานใหม่รอการอนุมัติ - CSI Showcase`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #90278E;">มีผลงานใหม่รอการอนุมัติ</h2>
        <p>มีผลงานใหม่ที่รอการอนุมัติจากคุณ</p>
        <p><strong>ชื่อผลงาน:</strong> ${projectTitle}</p>
        <p><strong>ผู้ส่ง:</strong> ${studentName}</p>
        <p><strong>ประเภท:</strong> ${projectType}</p>
        <div style="margin: 20px 0;">
          <a href="${adminLink}" style="background-color: #90278E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">ดูผลงานทั้งหมดที่รอการอนุมัติ</a>
        </div>
        <p>ขอแสดงความนับถือ,<br>ทีมงาน CSI Showcase</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`New project notification email sent to admin ${to}`, { 
      messageId: info.messageId,
      projectTitle
    });
    return true;
  } catch (error) {
    logger.error(`Error sending new project notification email to ${to}:`, error);
    return false;
  }
};

/**
 * ส่งอีเมลแจ้งเตือนเมื่อมีบริษัทเข้าชมผลงาน
 * @param {string} to - อีเมลเจ้าของผลงาน
 * @param {string} username - ชื่อผู้ใช้
 * @param {string} projectTitle - ชื่อผลงาน
 * @param {string} companyName - ชื่อบริษัท
 * @param {string} contactEmail - อีเมลติดต่อของบริษัท
 * @returns {Promise<boolean>} - ผลการส่งอีเมล
 */
export const sendCompanyViewNotificationEmail = async (to, username, projectTitle, companyName, contactEmail) => {
  const projectLink = `${process.env.FRONTEND_URL}/projects/my`;
  
  const mailOptions = {
    from: `"CSI Showcase" <${process.env.EMAIL_USER}>`,
    to,
    subject: `มีบริษัทสนใจในผลงานของคุณ - CSI Showcase`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #90278E;">มีบริษัทสนใจในผลงานของคุณ</h2>
        <p>สวัสดี ${username},</p>
        <p>มีบริษัทได้เข้าชมผลงาน "${projectTitle}" ของคุณ</p>
        <p><strong>ชื่อบริษัท:</strong> ${companyName}</p>
        <p><strong>อีเมลติดต่อ:</strong> ${contactEmail}</p>
        <div style="margin: 20px 0;">
          <a href="${projectLink}" style="background-color: #90278E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">ดูผลงานของฉัน</a>
        </div>
        <p>ขอแสดงความนับถือ,<br>ทีมงาน CSI Showcase</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Company view notification email sent to ${to}`, { 
      messageId: info.messageId,
      projectTitle,
      companyName
    });
    return true;
  } catch (error) {
    logger.error(`Error sending company view notification email to ${to}:`, error);
    return false;
  }
};

/**
 * สำหรับทดสอบการเชื่อมต่อกับเซิร์ฟเวอร์อีเมล
 * @returns {Promise<boolean>} - ผลการทดสอบ
 */
export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    logger.info('Email server connection verified');
    return true;
  } catch (error) {
    logger.error('Email server connection error:', error);
    return false;
  }
};

export default {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendProjectStatusEmail,
  sendNewProjectNotificationEmail,
  sendCompanyViewNotificationEmail,
  verifyEmailConnection
};