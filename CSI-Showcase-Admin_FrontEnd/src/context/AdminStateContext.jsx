import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import useAuth from '../hooks/useAuth';

// สร้าง Context
const AdminStateContext = createContext();

// Initial state
const initialState = {
  sidebarCollapsed: false,
  notifications: [],
  unreadNotifications: 0,
  pendingProjects: 0,
  theme: 'light',
  currentView: 'list',
  filters: {
    projects: {
      type: '',
      status: '',
      year: '',
      search: ''
    },
    users: {
      role: '',
      status: '',
      search: ''
    },
    logs: {
      startDate: '',
      endDate: '',
      search: ''
    }
  },
  lastRefreshed: null
};

// Action Types
const ActionTypes = {
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_SIDEBAR_COLLAPSED: 'SET_SIDEBAR_COLLAPSED',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  MARK_NOTIFICATION_READ: 'MARK_NOTIFICATION_READ',
  MARK_ALL_NOTIFICATIONS_READ: 'MARK_ALL_NOTIFICATIONS_READ',
  SET_PENDING_PROJECTS_COUNT: 'SET_PENDING_PROJECTS_COUNT',
  SET_THEME: 'SET_THEME',
  SET_CURRENT_VIEW: 'SET_CURRENT_VIEW',
  UPDATE_FILTERS: 'UPDATE_FILTERS',
  RESET_FILTERS: 'RESET_FILTERS',
  REFRESH_DATA: 'REFRESH_DATA',
  RESET_STATE: 'RESET_STATE'
};

// Reducer
const adminReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed
      };
      
    case ActionTypes.SET_SIDEBAR_COLLAPSED:
      return {
        ...state,
        sidebarCollapsed: action.payload
      };
      
    case ActionTypes.ADD_NOTIFICATION:
      const newNotifications = [action.payload, ...state.notifications];
      return {
        ...state,
        notifications: newNotifications,
        unreadNotifications: state.unreadNotifications + 1
      };
      
    case ActionTypes.MARK_NOTIFICATION_READ:
      const updatedNotifications = state.notifications.map(notification => 
        notification.id === action.payload ? { ...notification, read: true } : notification
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadNotifications: Math.max(0, state.unreadNotifications - 1)
      };
      
    case ActionTypes.MARK_ALL_NOTIFICATIONS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification => ({ ...notification, read: true })),
        unreadNotifications: 0
      };
      
    case ActionTypes.SET_PENDING_PROJECTS_COUNT:
      return {
        ...state,
        pendingProjects: action.payload
      };
      
    case ActionTypes.SET_THEME:
      return {
        ...state,
        theme: action.payload
      };
      
    case ActionTypes.SET_CURRENT_VIEW:
      return {
        ...state,
        currentView: action.payload
      };
      
    case ActionTypes.UPDATE_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.section]: {
            ...state.filters[action.payload.section],
            ...action.payload.filters
          }
        }
      };
      
    case ActionTypes.RESET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload]: initialState.filters[action.payload]
        }
      };
      
    case ActionTypes.REFRESH_DATA:
      return {
        ...state,
        lastRefreshed: new Date().toISOString()
      };
      
    case ActionTypes.RESET_STATE:
      return initialState;
      
    default:
      return state;
  }
};

// Provider Component
export const AdminStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);
  const { isAuthenticated } = useAuth();
  
  // รีเซ็ตสถานะเมื่อล็อกเอาท์
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch({ type: ActionTypes.RESET_STATE });
    }
  }, [isAuthenticated]);
  
  // สร้าง Actions
  const toggleSidebar = () => {
    dispatch({ type: ActionTypes.TOGGLE_SIDEBAR });
  };
  
  const setSidebarCollapsed = (collapsed) => {
    dispatch({ 
      type: ActionTypes.SET_SIDEBAR_COLLAPSED, 
      payload: collapsed 
    });
  };
  
  const addNotification = (notification) => {
    dispatch({
      type: ActionTypes.ADD_NOTIFICATION,
      payload: {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        read: false,
        ...notification
      }
    });
  };
  
  const markNotificationRead = (notificationId) => {
    dispatch({
      type: ActionTypes.MARK_NOTIFICATION_READ,
      payload: notificationId
    });
  };
  
  const markAllNotificationsRead = () => {
    dispatch({ type: ActionTypes.MARK_ALL_NOTIFICATIONS_READ });
  };
  
  const setPendingProjectsCount = (count) => {
    dispatch({
      type: ActionTypes.SET_PENDING_PROJECTS_COUNT,
      payload: count
    });
  };
  
  const setTheme = (theme) => {
    dispatch({
      type: ActionTypes.SET_THEME,
      payload: theme
    });
  };
  
  const setCurrentView = (view) => {
    dispatch({
      type: ActionTypes.SET_CURRENT_VIEW,
      payload: view
    });
  };
  
  const updateFilters = useCallback((section, filters) => {
    dispatch({
      type: ActionTypes.UPDATE_FILTERS,
      payload: { section, filters }
    });
  }, []);
  
  const resetFilters = (section) => {
    dispatch({
      type: ActionTypes.RESET_FILTERS,
      payload: section
    });
  };
  
  const refreshData = () => {
    dispatch({ type: ActionTypes.REFRESH_DATA });
  };
  
  const resetState = () => {
    dispatch({ type: ActionTypes.RESET_STATE });
  };
  
  // ค่าที่ส่งออกไปใช้งาน
  const contextValue = {
    ...state,
    toggleSidebar,
    setSidebarCollapsed,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    setPendingProjectsCount,
    setTheme,
    setCurrentView,
    updateFilters,
    resetFilters,
    refreshData,
    resetState
  };
  
  return (
    <AdminStateContext.Provider value={contextValue}>
      {children}
    </AdminStateContext.Provider>
  );
};

// Hook สำหรับเข้าถึง AdminStateContext
export const useAdminState = () => {
  const context = useContext(AdminStateContext);
  
  if (!context) {
    throw new Error('useAdminState must be used within an AdminStateProvider');
  }
  
  return context;
};

export default AdminStateContext;