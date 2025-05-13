// src/controllers/admin/batchUserController.js

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import pool, { beginTransaction, commitTransaction, rollbackTransaction } from '../../config/database.js';
import { hashPassword, generateRandomPassword } from '../../utils/passwordHelper.js';
import { isValidEmail, isValidUsername } from '../../utils/validationHelper.js';
import { sendWelcomeEmail } from '../../services/emailService.js';
import { handleServerError, successResponse, validationErrorResponse } from '../../utils/responseFormatter.js';
import { isValidRole, ROLES } from '../../constants/roles.js';
import logger from '../../config/logger.js';
import { asyncHandler } from '../../middleware/loggerMiddleware.js';

// src/controllers/admin/batchUserController.js

/**
 * นำเข้าผู้ใช้จำนวนมากจากไฟล์ CSV
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const importUsersFromCSV = asyncHandler(async (req, res) => {
    let connection = null;
    const results = {
      success: [],
      failed: [],
      skipped: [], // เพิ่มรายการสำหรับผู้ใช้ที่มีอยู่แล้ว
      total: 0
    };
    
    try {
      // ตรวจสอบว่ามีการอัปโหลดไฟล์หรือไม่
      if (!req.file) {
        return validationErrorResponse(res, 'CSV file is required');
      }
      
      // อ่านและแยกวิเคราะห์ข้อมูล CSV
      const fileContent = fs.readFileSync(req.file.path, 'utf8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
      
      results.total = records.length;
      
      if (records.length === 0) {
        return validationErrorResponse(res, 'CSV file is empty or invalid');
      }
      
      // เริ่ม transaction
      connection = await beginTransaction();
      
      // ตรวจสอบความถูกต้องของคอลัมน์
      const requiredColumns = ['username', 'full_name', 'email'];
      const fileColumns = Object.keys(records[0]);
      
      const missingColumns = requiredColumns.filter(col => !fileColumns.includes(col));
      if (missingColumns.length > 0) {
        await rollbackTransaction(connection);
        return validationErrorResponse(res, `Missing required columns: ${missingColumns.join(', ')}`);
      }
      
      // ดึงข้อมูล username และ email ที่มีอยู่แล้วเพื่อตรวจสอบความซ้ำซ้อน
      const [existingUsers] = await connection.execute(`
        SELECT user_id, username, email, full_name, role FROM users
      `);
      
      const existingUsernamesMap = new Map(); // เปลี่ยนจาก Set เป็น Map เพื่อเก็บข้อมูลเพิ่มเติม
      const existingEmailsMap = new Map();
      
      existingUsers.forEach(user => {
        existingUsernamesMap.set(user.username.toLowerCase(), user);
        existingEmailsMap.set(user.email.toLowerCase(), user);
      });
      
      // สร้างรหัสผ่านและเพิ่มผู้ใช้
      for (const [index, record] of records.entries()) {
        const rowNum = index + 2; // +2 เนื่องจากแถวที่ 1 เป็นหัวคอลัมน์
        
        try {
          const username = record.username?.trim();
          const fullName = record.full_name?.trim();
          const email = record.email?.trim();
          const role = (record.role?.trim() || ROLES.STUDENT).toLowerCase();
          
          // ตรวจสอบข้อมูลที่จำเป็น
          if (!username || !fullName || !email) {
            results.failed.push({
              row: rowNum,
              username,
              email,
              full_name: fullName,
              error: 'Missing required fields'
            });
            continue;
          }
          
          // ตรวจสอบความถูกต้องของข้อมูล
          if (!isValidUsername(username)) {
            results.failed.push({
              row: rowNum,
              username,
              email,
              full_name: fullName,
              error: 'Invalid username format'
            });
            continue;
          }
          
          if (!isValidEmail(email)) {
            results.failed.push({
              row: rowNum,
              username,
              email,
              full_name: fullName,
              error: 'Invalid email format'
            });
            continue;
          }
          
          if (!isValidRole(role)) {
            results.failed.push({
              row: rowNum,
              username,
              email,
              full_name: fullName,
              error: `Invalid role: ${role}`
            });
            continue;
          }
          
          // ตรวจสอบความซ้ำซ้อนของ username
          const lowerUsername = username.toLowerCase();
          if (existingUsernamesMap.has(lowerUsername)) {
            const existingUser = existingUsernamesMap.get(lowerUsername);
            results.skipped.push({
              row: rowNum,
              username,
              email,
              full_name: fullName,
              status: 'Username exists',
              existingUser: {
                id: existingUser.user_id,
                username: existingUser.username,
                email: existingUser.email,
                full_name: existingUser.full_name
              }
            });
            continue;
          }
          
          // ตรวจสอบความซ้ำซ้อนของ email
          const lowerEmail = email.toLowerCase();
          if (existingEmailsMap.has(lowerEmail)) {
            const existingUser = existingEmailsMap.get(lowerEmail);
            results.skipped.push({
              row: rowNum,
              username,
              email,
              full_name: fullName,
              status: 'Email exists',
              existingUser: {
                id: existingUser.user_id,
                username: existingUser.username,
                email: existingUser.email,
                full_name: existingUser.full_name
              }
            });
            continue;
          }
          
          // สร้างรหัสผ่านแบบสุ่ม
          const password = record.password?.trim() || generateRandomPassword();
          const hashedPassword = await hashPassword(password);
          
          // เพิ่มผู้ใช้ใหม่ในฐานข้อมูล
          const [result] = await connection.execute(`
            INSERT INTO users (username, password_hash, full_name, email, role)
            VALUES (?, ?, ?, ?, ?)
          `, [username, hashedPassword, fullName, email, role]);
          
          // ป้องกันไม่ให้ซ้ำกับรายการที่เพิ่มไปแล้ว
          const newUser = {
            user_id: result.insertId,
            username,
            email,
            full_name: fullName,
            role
          };
          existingUsernamesMap.set(lowerUsername, newUser);
          existingEmailsMap.set(lowerEmail, newUser);
          
          // บันทึกรายการที่สำเร็จ
          results.success.push({
            id: result.insertId,
            username,
            email,
            full_name: fullName,
            role,
            password: password // รวมรหัสผ่านที่สร้างไว้เพื่อส่งอีเมล
          });
          
          // ส่งอีเมลต้อนรับพร้อมรหัสผ่าน (ไม่รอ)
          try {
            sendWelcomeEmail(email, username, password).catch(err => {
              logger.error(`Failed to send welcome email to ${email}:`, err);
            });
          } catch (emailError) {
            logger.error(`Error preparing welcome email for ${email}:`, emailError);
            // ดำเนินการต่อถึงแม้จะส่งอีเมลไม่สำเร็จ
          }
          
        } catch (recordError) {
          logger.error(`Error processing record at row ${rowNum}:`, recordError);
          results.failed.push({
            row: rowNum,
            username: record.username,
            email: record.email,
            full_name: record.full_name,
            error: 'Internal error processing record'
          });
        }
      }
      
      // Commit transaction หากมีรายการที่สำเร็จอย่างน้อย 1 รายการ
      if (results.success.length > 0) {
        await commitTransaction(connection);
      } else {
        await rollbackTransaction(connection);
        
        // ถ้าไม่มีรายการที่สำเร็จแต่มีรายการที่ข้ามไปเพราะซ้ำ
        if (results.skipped.length > 0) {
          return res.status(200).json(successResponse({
            totalRecords: results.total,
            successCount: 0,
            failedCount: results.failed.length,
            skippedCount: results.skipped.length, // เพิ่มจำนวนรายการที่ข้าม
            successRecords: [],
            failedRecords: results.failed,
            skippedRecords: results.skipped // เพิ่มรายการที่ข้าม
          }, `No new users were imported. ${results.skipped.length} users already exist.`));
        }
        
        return validationErrorResponse(res, 'No users were imported');
      }
      
      // ลบไฟล์ CSV หลังจากประมวลผลเสร็จ
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        logger.warn(`Failed to delete uploaded CSV file: ${req.file.path}`, unlinkError);
      }
      
      return res.status(200).json(successResponse({
        totalRecords: results.total,
        successCount: results.success.length,
        failedCount: results.failed.length,
        skippedCount: results.skipped.length, // เพิ่มจำนวนรายการที่ข้าม
        successRecords: results.success.map(({ password, ...user }) => user), // ไม่ส่งรหัสผ่านกลับในการตอบกลับ
        failedRecords: results.failed,
        skippedRecords: results.skipped // เพิ่มรายการที่ข้าม
      }, `Successfully imported ${results.success.length} users. ${results.skipped.length} users already exist.`));
      
    } catch (error) {
      if (connection) {
        await rollbackTransaction(connection);
      }
      
      // ลบไฟล์ CSV หากเกิดข้อผิดพลาด
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          logger.warn(`Failed to delete uploaded CSV file: ${req.file.path}`, unlinkError);
        }
      }
      
      logger.error('Error in importUsersFromCSV:', error);
      return handleServerError(res, error);
    }
  });

/**
 * ดาวน์โหลดเทมเพลต CSV สำหรับการนำเข้าผู้ใช้
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const downloadCSVTemplate = asyncHandler(async (req, res) => {
  try {
    const csvHeader = 'username,full_name,email,role,password\n';
    const csvExample = 'student001,Student Name,student001@example.com,student,\nteacher001,Teacher Name,teacher001@example.com,admin,password123\n';
    
    const csvContent = csvHeader + csvExample;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users_import_template.csv');
    
    return res.status(200).send(csvContent);
    
  } catch (error) {
    logger.error('Error in downloadCSVTemplate:', error);
    return handleServerError(res, error);
  }
});

export default {
  importUsersFromCSV,
  downloadCSVTemplate
};