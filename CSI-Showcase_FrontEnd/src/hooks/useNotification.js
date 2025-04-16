/**
 * Custom hook สำหรับจัดการการแจ้งเตือน
 * จัดการ state และฟังก์ชันที่เกี่ยวข้องกับการแจ้งเตือนต่างๆ ในแอปพลิเคชัน
 */
import { useState, useEffect, useCallback } from 'react';
import { message, notification } from 'antd';

/**
 * Custom hook สำหรับจัดการการแจ้งเตือน
 * @returns {Object} - state และฟังก์ชันสำหรับจัดการการแจ้งเตือน
 */
const useNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * แสดงข้อความแจ้งเตือนสำเร็จ
   * @param {string} content - ข้อความแจ้งเตือน
   * @param {number} duration - ระยะเวลาที่แสดง (วินาที)
   */
  const showSuccess = useCallback((content, duration = 3) => {
    message.success(content, duration);
  }, []);

  /**
   * แสดงข้อความแจ้งเตือนผิดพลาด
   * @param {string} content - ข้อความแจ้งเตือน
   * @param {number} duration - ระยะเวลาที่แสดง (วินาที)
   */
  const showError = useCallback((content, duration = 3) => {
    message.error(content, duration);
  }, []);

  /**
   * แสดงข้อความแจ้งเตือนเพื่อให้ระวัง
   * @param {string} content - ข้อความแจ้งเตือน
   * @param {number} duration - ระยะเวลาที่แสดง (วินาที)
   */
  const showWarning = useCallback((content, duration = 3) => {
    message.warning(content, duration);
  }, []);

  /**
   * แสดงข้อความแจ้งเตือนทั่วไป
   * @param {string} content - ข้อความแจ้งเตือน
   * @param {number} duration - ระยะเวลาที่แสดง (วินาที)
   */
  const showInfo = useCallback((content, duration = 3) => {
    message.info(content, duration);
  }, []);

  /**
   * แสดงการแจ้งเตือนแบบยืดหยุ่น (มีหัวข้อและรายละเอียด)
   * @param {string} type - ประเภทของการแจ้งเตือน ('success', 'error', 'warning', 'info')
   * @param {string} message - หัวข้อของการแจ้งเตือน
   * @param {string} description - รายละเอียดของการแจ้งเตือน
   * @param {number} duration - ระยะเวลาที่แสดง (วินาที)
   * @param {Function} onClick - ฟังก์ชันที่จะทำงานเมื่อคลิกที่การแจ้งเตือน
   */
  const showNotification = useCallback((type, title, description, duration = 4.5, onClick = null) => {
    notification[type]({
      message: title,
      description,
      duration,
      onClick
    });
  }, []);

  /**
   * แสดงการแจ้งเตือนแบบสำเร็จ
   * @param {string} title - หัวข้อของการแจ้งเตือน
   * @param {string} description - รายละเอียดของการแจ้งเตือน
   * @param {number} duration - ระยะเวลาที่แสดง (วินาที)
   * @param {Function} onClick - ฟังก์ชันที่จะทำงานเมื่อคลิกที่การแจ้งเตือน
   */
  const showSuccessNotification = useCallback((title, description, duration = 4.5, onClick = null) => {
    showNotification('success', title, description, duration, onClick);
  }, [showNotification]);

  /**
   * แสดงการแจ้งเตือนแบบผิดพลาด
   * @param {string} title - หัวข้อของการแจ้งเตือน
   * @param {string} description - รายละเอียดของการแจ้งเตือน
   * @param {number} duration - ระยะเวลาที่แสดง (วินาที)
   * @param {Function} onClick - ฟังก์ชันที่จะทำงานเมื่อคลิกที่การแจ้งเตือน
   */
  const showErrorNotification = useCallback((title, description, duration = 4.5, onClick = null) => {
    showNotification('error', title, description, duration, onClick);
  }, [showNotification]);

  /**
   * แสดงการแจ้งเตือนแบบเพื่อให้ระวัง
   * @param {string} title - หัวข้อของการแจ้งเตือน
   * @param {string} description - รายละเอียดของการแจ้งเตือน
   * @param {number} duration - ระยะเวลาที่แสดง (วินาที)
   * @param {Function} onClick - ฟังก์ชันที่จะทำงานเมื่อคลิกที่การแจ้งเตือน
   */
  const showWarningNotification = useCallback((title, description, duration = 4.5, onClick = null) => {
    showNotification('warning', title, description, duration, onClick);
  }, [showNotification]);

  /**
   * แสดงการแจ้งเตือนแบบทั่วไป
   * @param {string} title - หัวข้อของการแจ้งเตือน
   * @param {string} description - รายละเอียดของการแจ้งเตือน
   * @param {number} duration - ระยะเวลาที่แสดง (วินาที)
   * @param {Function} onClick - ฟังก์ชันที่จะทำงานเมื่อคลิกที่การแจ้งเตือน
   */
  const showInfoNotification = useCallback((title, description, duration = 4.5, onClick = null) => {
    showNotification('info', title, description, duration, onClick);
  }, [showNotification]);

  /**
   * เพิ่มการแจ้งเตือนใหม่เข้าไปในรายการการแจ้งเตือน
   * @param {Object} notification - ข้อมูลการแจ้งเตือน
   * @param {string} notification.title - หัวข้อของการแจ้งเตือน
   * @param {string} notification.message - ข้อความของการแจ้งเตือน
   * @param {string} notification.type - ประเภทของการแจ้งเตือน ('success', 'error', 'warning', 'info')
   * @param {Date} notification.time - เวลาที่สร้างการแจ้งเตือน
   * @param {boolean} notification.read - สถานะการอ่านการแจ้งเตือน
   */
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(), // สร้าง ID ด้วยเวลาปัจจุบัน
      title: notification.title || 'การแจ้งเตือน',
      message: notification.message || '',
      type: notification.type || 'info',
      time: notification.time || new Date(),
      read: notification.read || false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // อัปเดตจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
    if (!newNotification.read) {
      setUnreadCount(prev => prev + 1);
    }
    
    // แสดงการแจ้งเตือนบนหน้าจอ
    showNotification(
      newNotification.type,
      newNotification.title,
      newNotification.message,
      4.5,
      () => markAsRead(newNotification.id)
    );
  }, [showNotification]);

  /**
   * อ่านการแจ้งเตือน
   * @param {number} id - ID ของการแจ้งเตือน
   */
  const markAsRead = useCallback((id) => {
    setNotifications(prev => {
      const updatedNotifications = prev.map(notification => {
        if (notification.id === id && !notification.read) {
          // ลดจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
          setUnreadCount(prevCount => Math.max(0, prevCount - 1));
          return { ...notification, read: true };
        }
        return notification;
      });
      return updatedNotifications;
    });
  }, []);

  /**
   * อ่านการแจ้งเตือนทั้งหมด
   */
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      return prev.map(notification => ({ ...notification, read: true }));
    });
    setUnreadCount(0);
  }, []);

  /**
   * ลบการแจ้งเตือน
   * @param {number} id - ID ของการแจ้งเตือน
   */
  const removeNotification = useCallback((id) => {
    setNotifications(prev => {
      // ตรวจสอบว่าการแจ้งเตือนที่จะลบยังไม่ได้อ่านหรือไม่
      const notificationToRemove = prev.find(notification => notification.id === id);
      
      if (notificationToRemove && !notificationToRemove.read) {
        // ลดจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
      
      return prev.filter(notification => notification.id !== id);
    });
  }, []);

  /**
   * ลบการแจ้งเตือนทั้งหมด
   */
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  /**
   * เรียงลำดับการแจ้งเตือน
   * @param {string} orderBy - เรียงลำดับตาม ('time', 'type', 'read')
   * @param {boolean} ascending - เรียงจากน้อยไปมากหรือไม่
   */
  const sortNotifications = useCallback((orderBy = 'time', ascending = false) => {
    setNotifications(prev => {
      const sortedNotifications = [...prev];
      
      sortedNotifications.sort((a, b) => {
        let comparison = 0;
        
        if (orderBy === 'time') {
          comparison = new Date(a.time) - new Date(b.time);
        } else if (orderBy === 'type') {
          comparison = a.type.localeCompare(b.type);
        } else if (orderBy === 'read') {
          comparison = (a.read === b.read) ? 0 : a.read ? 1 : -1;
        }
        
        return ascending ? comparison : -comparison;
      });
      
      return sortedNotifications;
    });
  }, []);

  /**
   * กรองการแจ้งเตือน
   * @param {Object} filters - ตัวกรอง
   * @param {string} filters.type - ประเภทของการแจ้งเตือน
   * @param {boolean} filters.read - สถานะการอ่านการแจ้งเตือน
   */
  const filterNotifications = useCallback((filters = {}) => {
    return notifications.filter(notification => {
      let match = true;
      
      if (filters.type && notification.type !== filters.type) {
        match = false;
      }
      
      if (filters.read !== undefined && notification.read !== filters.read) {
        match = false;
      }
      
      return match;
    });
  }, [notifications]);

  return {
    // State
    notifications,
    unreadCount,
    isLoading,
    error,
    
    // Simple message notifications
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Complex notifications
    showNotification,
    showSuccessNotification,
    showErrorNotification,
    showWarningNotification,
    showInfoNotification,
    
    // Notification management
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    sortNotifications,
    filterNotifications
  };
};

export default useNotification;