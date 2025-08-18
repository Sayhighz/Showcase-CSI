import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';

/**
 * Custom hook for managing notifications
 * Provides a centralized notification system with real-time updates
 */
const useNotification = (userRole = null) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock API call - replace with actual API endpoint
  const fetchNotifications = useCallback(async () => {
    if (!userRole) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock notifications based on user role
      const mockNotifications = userRole === 'admin' ? [
        {
          id: 1,
          message: 'มีผลงานใหม่รอการอนุมัติ',
          type: 'project_pending',
          read: false,
          createdAt: new Date().toISOString(),
          priority: 'high'
        },
        {
          id: 2,
          message: 'มีผู้ใช้งานใหม่ลงทะเบียน',
          type: 'user_registration',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          priority: 'medium'
        },
        {
          id: 3,
          message: 'ระบบได้รับการอัปเดตเรียบร้อยแล้ว',
          type: 'system_update',
          read: true,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          priority: 'low'
        }
      ] : [
        {
          id: 4,
          message: 'ผลงานของคุณได้รับการอนุมัติแล้ว',
          type: 'project_approved',
          read: false,
          createdAt: new Date().toISOString(),
          priority: 'high'
        },
        {
          id: 5,
          message: 'มีการอัปเดตข้อมูลโปรไฟล์',
          type: 'profile_update',
          read: true,
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          priority: 'low'
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('ไม่สามารถโหลดการแจ้งเตือนได้');
      message.error('ไม่สามารถโหลดการแจ้งเตือนได้');
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      message.error('ไม่สามารถอัปเดตสถานะการแจ้งเตือนได้');
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      message.success('ทำเครื่องหมายอ่านทั้งหมดเรียบร้อย');
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      message.error('ไม่สามารถอัปเดตสถานะการแจ้งเตือนได้');
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
      
      message.success('ลบการแจ้งเตือนเรียบร้อย');
    } catch (err) {
      console.error('Error deleting notification:', err);
      message.error('ไม่สามารถลบการแจ้งเตือนได้');
    }
  }, []);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Get notifications by priority
  const getNotificationsByPriority = useCallback((priority) => {
    return notifications.filter(n => n.priority === priority);
  }, [notifications]);

  // Refresh notifications
  const refresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!userRole) return;
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchNotifications, userRole]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationsByPriority,
    refresh
  };
};

export default useNotification;