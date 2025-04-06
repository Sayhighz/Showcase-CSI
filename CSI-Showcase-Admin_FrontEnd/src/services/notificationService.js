// src/services/notificationService.js
import { message } from 'antd';

/**
 * แสดงข้อความสำเร็จ
 * @param {string} content - ข้อความที่ต้องการแสดง
 * @param {number} duration - ระยะเวลาที่แสดงข้อความ (วินาที)
 */
export const showSuccess = (content, duration = 3) => {
  message.success({
    content,
    duration,
    style: {
      marginTop: '20vh'
    }
  });
};

/**
 * แสดงข้อความแจ้งเตือน
 * @param {string} content - ข้อความที่ต้องการแสดง
 * @param {number} duration - ระยะเวลาที่แสดงข้อความ (วินาที)
 */
export const showInfo = (content, duration = 3) => {
  message.info({
    content,
    duration,
    style: {
      marginTop: '20vh'
    }
  });
};

/**
 * แสดงข้อความเตือน
 * @param {string} content - ข้อความที่ต้องการแสดง
 * @param {number} duration - ระยะเวลาที่แสดงข้อความ (วินาที)
 */
export const showWarning = (content, duration = 3) => {
  message.warning({
    content,
    duration,
    style: {
      marginTop: '20vh'
    }
  });
};

/**
 * แสดงข้อความผิดพลาด
 * @param {string} content - ข้อความที่ต้องการแสดง
 * @param {number} duration - ระยะเวลาที่แสดงข้อความ (วินาที)
 */
export const showError = (content, duration = 3) => {
  message.error({
    content,
    duration,
    style: {
      marginTop: '20vh'
    }
  });
};

/**
 * แสดงข้อความกำลังโหลด
 * @param {string} content - ข้อความที่ต้องการแสดง
 * @param {number} duration - ระยะเวลาที่แสดงข้อความ (วินาที)
 * @returns {Function} - ฟังก์ชันสำหรับปิดข้อความกำลังโหลด
 */
export const showLoading = (content = 'กำลังโหลด...', duration = 0) => {
  return message.loading({
    content,
    duration,
    style: {
      marginTop: '20vh'
    }
  });
};

/**
 * แปลงรหัสข้อผิดพลาดเป็นข้อความแสดงข้อผิดพลาด
 * @param {Object} error - ข้อผิดพลาด
 * @returns {string} - ข้อความข้อผิดพลาด
 */
export const getErrorMessage = (error) => {
  if (!error) {
    return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
  }
  
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
};

/**
 * แสดงข้อความผิดพลาดจากออบเจกต์ข้อผิดพลาด
 * @param {Object} error - ข้อผิดพลาด
 * @param {number} duration - ระยะเวลาที่แสดงข้อความ (วินาที)
 */
export const showErrorFromResponse = (error, duration = 3) => {
  const errorMessage = getErrorMessage(error);
  showError(errorMessage, duration);
};

/**
 * แสดงข้อความยืนยันการลบ
 * @param {string} title - หัวข้อ
 * @param {string} content - ข้อความ
 * @param {Function} onOk - ฟังก์ชันที่จะทำงานเมื่อกดยืนยัน
 * @param {Function} onCancel - ฟังก์ชันที่จะทำงานเมื่อกดยกเลิก
 */
export const showDeleteConfirm = (title, content, onOk, onCancel) => {
  Modal.confirm({
    title,
    content,
    okText: 'ยืนยัน',
    okType: 'danger',
    cancelText: 'ยกเลิก',
    onOk,
    onCancel
  });
};

/**
 * แสดงข้อความยืนยันการดำเนินการ
 * @param {string} title - หัวข้อ
 * @param {string} content - ข้อความ
 * @param {Function} onOk - ฟังก์ชันที่จะทำงานเมื่อกดยืนยัน
 * @param {Function} onCancel - ฟังก์ชันที่จะทำงานเมื่อกดยกเลิก
 */
export const showConfirm = (title, content, onOk, onCancel) => {
  Modal.confirm({
    title,
    content,
    okText: 'ยืนยัน',
    cancelText: 'ยกเลิก',
    onOk,
    onCancel
  });
};

export default {
  showSuccess,
  showInfo,
  showWarning,
  showError,
  showLoading,
  getErrorMessage,
  showErrorFromResponse,
  showDeleteConfirm,
  showConfirm
};