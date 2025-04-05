// utils/logHelper.js

/**
 * บันทึกข้อความลงในคอนโซล
 * @param {string} message - ข้อความที่ต้องการบันทึก
 * @param {any} data - ข้อมูลเพิ่มเติม (optional)
 */
export const logInfo = (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] ${timestamp} - ${message}`);
    if (data) {
      console.log(data);
    }
  };
  
  /**
   * บันทึกคำเตือนลงในคอนโซล
   * @param {string} message - ข้อความที่ต้องการบันทึก
   * @param {any} data - ข้อมูลเพิ่มเติม (optional)
   */
  export const logWarning = (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.warn(`[WARNING] ${timestamp} - ${message}`);
    if (data) {
      console.warn(data);
    }
  };
  
  /**
   * บันทึกข้อผิดพลาดลงในคอนโซล
   * @param {string} message - ข้อความที่ต้องการบันทึก
   * @param {Error|any} error - ข้อผิดพลาด (optional)
   */
  export const logError = (message, error = null) => {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR] ${timestamp} - ${message}`);
    if (error) {
      if (error instanceof Error) {
        console.error(`${error.name}: ${error.message}`);
        console.error(`Stack: ${error.stack}`);
      } else {
        console.error(error);
      }
    }
  };
  
  /**
   * บันทึกข้อมูลการเข้าถึง API
   * @param {Object} req - Express request object
   * @param {string} message - ข้อความเพิ่มเติม (optional)
   */
  export const logAPIAccess = (req, message = '') => {
    const timestamp = new Date().toISOString();
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'] || 'Unknown';
    
    console.log(`[API] ${timestamp} - ${method} ${originalUrl} - IP: ${ip} - UserAgent: ${userAgent} ${message ? '- ' + message : ''}`);
  };
  
  /**
   * บันทึกการเข้าถึงฐานข้อมูล
   * @param {string} query - คำสั่ง SQL
   * @param {Array} params - พารามิเตอร์ (optional)
   * @param {number} duration - ระยะเวลาที่ใช้ในการดำเนินการ (optional)
   */
  export const logDBQuery = (query, params = [], duration = null) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      console.log(`[DB] ${timestamp} - Query: ${query.replace(/\s+/g, ' ').trim()}`);
      
      if (params.length > 0) {
        console.log(`[DB] Params: ${JSON.stringify(params)}`);
      }
      
      if (duration !== null) {
        console.log(`[DB] Duration: ${duration}ms`);
      }
    }
  };
  
  /**
   * บันทึกข้อมูลการเข้าสู่ระบบ
   * @param {string} username - ชื่อผู้ใช้
   * @param {string} ip - หมายเลข IP
   * @param {boolean} success - สถานะการเข้าสู่ระบบ
   */
  export const logLogin = (username, ip, success) => {
    const timestamp = new Date().toISOString();
    const status = success ? 'Success' : 'Failed';
    console.log(`[LOGIN] ${timestamp} - User: ${username} - IP: ${ip} - Status: ${status}`);
  };