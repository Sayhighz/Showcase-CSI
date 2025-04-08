// src/hooks/useNotification.js
import { useEffect, useCallback, createElement } from 'react';
import { message, notification, Modal } from 'antd';
import { 
  CheckCircleOutlined, 
  InfoCircleOutlined, 
  WarningOutlined, 
  CloseCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useAdminState } from '../context/AdminStateContext';

/**
 * Custom hook สำหรับจัดการการแจ้งเตือนในแอปพลิเคชัน
 * @returns {Object} - ฟังก์ชันสำหรับแสดงการแจ้งเตือนต่าง ๆ
 */
const useNotification = () => {
  const { 
    addNotification, 
    markNotificationRead, 
    markAllNotificationsRead,
    notifications,
    unreadNotifications
  } = useAdminState();
  
  // กำหนดค่า default สำหรับ message
  useEffect(() => {
    message.config({
      top: 60,
      duration: 3,
      maxCount: 3
    });
    
    notification.config({
      placement: 'topRight',
      duration: 4
    });
  }, []);
  
  /**
   * แสดงข้อความสำเร็จ
   * @param {string} content - ข้อความที่ต้องการแสดง
   * @param {number} duration - ระยะเวลาที่แสดงข้อความ (วินาที)
   */
  const showSuccess = useCallback((content, duration = 3) => {
    message.success({
      content,
      duration,
      icon: CheckCircleOutlined ? createElement(CheckCircleOutlined) : null
    });
    
    // เพิ่มการแจ้งเตือนในระบบ
    addNotification({
      type: 'success',
      title: 'สำเร็จ',
      message: content
    });
  }, [addNotification]);
  
  /**
   * แสดงข้อความแจ้งเตือน
   * @param {string} content - ข้อความที่ต้องการแสดง
   * @param {number} duration - ระยะเวลาที่แสดงข้อความ (วินาที)
   */
  const showInfo = useCallback((content, duration = 3) => {
    message.info({
      content,
      duration,
      icon: InfoCircleOutlined ? createElement(InfoCircleOutlined) : null
    });
    
    // เพิ่มการแจ้งเตือนในระบบ
    addNotification({
      type: 'info',
      title: 'ข้อมูล',
      message: content
    });
  }, [addNotification]);
  
  /**
   * แสดงข้อความเตือน
   * @param {string} content - ข้อความที่ต้องการแสดง
   * @param {number} duration - ระยะเวลาที่แสดงข้อความ (วินาที)
   */
  const showWarning = useCallback((content, duration = 3) => {
    message.warning({
      content,
      duration,
      icon: WarningOutlined ? createElement(WarningOutlined) : null
    });
    
    // เพิ่มการแจ้งเตือนในระบบ
    addNotification({
      type: 'warning',
      title: 'คำเตือน',
      message: content
    });
  }, [addNotification]);
  
  /**
   * แสดงข้อความผิดพลาด
   * @param {string} content - ข้อความที่ต้องการแสดง
   * @param {number} duration - ระยะเวลาที่แสดงข้อความ (วินาที)
   */
  const showError = useCallback((content, duration = 3) => {
    message.error({
      content,
      duration,
      icon: CloseCircleOutlined ? createElement(CloseCircleOutlined) : null
    });
    
    // เพิ่มการแจ้งเตือนในระบบ
    addNotification({
      type: 'error',
      title: 'ข้อผิดพลาด',
      message: content
    });
  }, [addNotification]);
  
  /**
   * แสดงข้อความกำลังโหลด
   * @param {string} content - ข้อความที่ต้องการแสดง
   * @param {number} duration - ระยะเวลาที่แสดงข้อความ (วินาที) 0 คือไม่มีกำหนด
   * @returns {Function} - ฟังก์ชันสำหรับปิดข้อความกำลังโหลด
   */
  const showLoading = useCallback((content = 'กำลังโหลด...', duration = 0) => {
    return message.loading({
      content,
      duration
    });
  }, []);
  
  /**
   * แสดงการแจ้งเตือนแบบ popup
   * @param {string} type - ประเภทการแจ้งเตือน ('success', 'info', 'warning', 'error')
   * @param {string} title - หัวข้อการแจ้งเตือน
   * @param {string} description - รายละเอียดการแจ้งเตือน
   * @param {number} duration - ระยะเวลาที่แสดงการแจ้งเตือน (วินาที)
   */
  const showNotification = useCallback((type, title, description, duration = 4) => {
    // เลือกไอคอนตามประเภท
    let icon;
    switch (type) {
      case 'success':
        icon = CheckCircleOutlined ? createElement(CheckCircleOutlined, { style: { color: '#52c41a' } }) : null;
        break;
      case 'info':
        icon = InfoCircleOutlined ? createElement(InfoCircleOutlined, { style: { color: '#1890ff' } }) : null;
        break;
      case 'warning':
        icon = WarningOutlined ? createElement(WarningOutlined, { style: { color: '#faad14' } }) : null;
        break;
      case 'error':
        icon = CloseCircleOutlined ? createElement(CloseCircleOutlined, { style: { color: '#ff4d4f' } }) : null;
        break;
      default:
        icon = InfoCircleOutlined ? createElement(InfoCircleOutlined, { style: { color: '#1890ff' } }) : null;
    }
    
    notification[type]({
      message: title,
      description,
      icon,
      duration
    });
    
    // เพิ่มการแจ้งเตือนในระบบ
    addNotification({
      type,
      title,
      message: description
    });
  }, [addNotification]);
  
  /**
   * แสดงกล่องข้อความยืนยันการลบ
   * @param {string} title - หัวข้อ
   * @param {string} content - ข้อความ
   * @param {Function} onOk - ฟังก์ชันที่จะทำงานเมื่อกดยืนยัน
   * @param {Function} onCancel - ฟังก์ชันที่จะทำงานเมื่อกดยกเลิก
   */
  const showDeleteConfirm = useCallback((title, content, onOk, onCancel) => {
    Modal.confirm({
      title,
      content,
      icon: ExclamationCircleOutlined ? createElement(ExclamationCircleOutlined, { style: { color: '#ff4d4f' } }) : null,
      okText: 'ยืนยัน',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk,
      onCancel
    });
  }, []);
  
  /**
   * แสดงกล่องข้อความยืนยันการดำเนินการ
   * @param {string} title - หัวข้อ
   * @param {string} content - ข้อความ
   * @param {Function} onOk - ฟังก์ชันที่จะทำงานเมื่อกดยืนยัน
   * @param {Function} onCancel - ฟังก์ชันที่จะทำงานเมื่อกดยกเลิก
   */
  const showConfirm = useCallback((title, content, onOk, onCancel) => {
    Modal.confirm({
      title,
      content,
      icon: ExclamationCircleOutlined ? createElement(ExclamationCircleOutlined, { style: { color: '#1890ff' } }) : null,
      okText: 'ยืนยัน',
      cancelText: 'ยกเลิก',
      onOk,
      onCancel
    });
  }, []);
  
  return {
    // ฟังก์ชันแสดงข้อความ
    showSuccess,
    showInfo,
    showWarning,
    showError,
    showLoading,
    
    // ฟังก์ชันแสดงการแจ้งเตือนแบบ popup
    showNotification,
    
    // ฟังก์ชันแสดงกล่องข้อความยืนยัน
    showDeleteConfirm,
    showConfirm,
    
    // ข้อมูลการแจ้งเตือนในระบบ
    notifications,
    unreadNotifications,
    
    // ฟังก์ชันจัดการการแจ้งเตือนในระบบ
    markNotificationRead,
    markAllNotificationsRead
  };
};

export default useNotification;