// constants/pagination.js

/**
 * ค่าเริ่มต้นสำหรับการแบ่งหน้า
 */
export const PAGINATION_DEFAULTS = {
    PAGE: 1,
    LIMIT: 10,
    MAX_LIMIT: 100
  };
  
  /**
   * ฟังก์ชันสำหรับคำนวณข้อมูลการแบ่งหน้า
   * @param {number} totalItems - จำนวนรายการทั้งหมด
   * @param {number} page - หน้าปัจจุบัน
   * @param {number} limit - จำนวนรายการต่อหน้า
   * @returns {Object} - ข้อมูลการแบ่งหน้า
   */
  export const getPaginationInfo = (totalItems, page = PAGINATION_DEFAULTS.PAGE, limit = PAGINATION_DEFAULTS.LIMIT) => {
    // ตรวจสอบความถูกต้องของข้อมูล
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), PAGINATION_DEFAULTS.MAX_LIMIT);
    
    // คำนวณข้อมูลการแบ่งหน้า
    const totalPages = Math.ceil(totalItems / validLimit);
    const currentPage = Math.min(validPage, totalPages || 1); // ถ้า totalPages เป็น 0 ให้ใช้ 1
    const offset = (currentPage - 1) * validLimit;
    
    // ข้อมูลเกี่ยวกับหน้าถัดไปและหน้าก่อนหน้า
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;
    const nextPage = hasNextPage ? currentPage + 1 : null;
    const prevPage = hasPrevPage ? currentPage - 1 : null;
    
    // ขอบเขตของรายการ
    const from = totalItems > 0 ? offset + 1 : 0;
    const to = Math.min(offset + validLimit, totalItems);
    
    return {
      totalItems,
      totalPages,
      currentPage,
      limit: validLimit,
      offset,
      from,
      to,
      hasNextPage,
      hasPrevPage,
      nextPage,
      prevPage
    };
  };
  
  /**
   * ฟังก์ชันสำหรับดึงพารามิเตอร์การแบ่งหน้าจาก request
   * @param {Object} req - Express request object
   * @returns {Object} - พารามิเตอร์การแบ่งหน้า
   */
  export const getPaginationParams = (req) => {
    const page = 1;
    const limit = 10;
    
    // ตรวจสอบความถูกต้องของข้อมูล
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), PAGINATION_DEFAULTS.MAX_LIMIT);
    
    // คำนวณ offset
    const offset = (validPage - 1) * validLimit;
    
    return {
      page: validPage,
      limit: validLimit,
      offset
    };
  };