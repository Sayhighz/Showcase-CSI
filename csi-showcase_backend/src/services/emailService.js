// services/emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

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
    console.log('Password reset email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
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
    console.log('Welcome email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
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
    console.log('Project status email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending project status email:', error);
    return false;
  }
};

// สำหรับทดสอบการเชื่อมต่อกับเซิร์ฟเวอร์อีเมล
export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('Email server connection verified');
    return true;
  } catch (error) {
    console.error('Email server connection error:', error);
    return false;
  }
};