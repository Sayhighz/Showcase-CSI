import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import thTH from 'antd/lib/locale/th_TH'; // ภาษาไทยสำหรับ Ant Design

// นำเข้า context
import { AuthProvider } from './context/AuthContext';

// นำเข้า routes
import ProtectedRoute from './routes/ProtectedRoute';

// นำเข้า layouts
import MasterLayout from './layouts/MasterLayout';

// นำเข้าหน้าต่างๆ
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/dashboard/Dashboard';
import Project from './pages/projectManagement/Project';
import ProjectReview from './pages/projectManagement/ProjectReview';
import ProjectDetail from './pages/projectManagement/ProjectDetail';
import Student from './pages/accountManagement/Student';
import Admin from './pages/accountManagement/Admin';
import Log from './pages/Log/Log';
import NotFound from './pages/NotFound';

// กำหนดธีมหลักสำหรับ Ant Design
const theme = {
  token: {
    colorPrimary: '#90278E',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorInfo: '#1890ff',
    borderRadius: 6,
  },
};

const App = () => {
  return (
    <ConfigProvider theme={theme} locale={thTH}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected Routes ที่ใช้ MasterLayout */}
            <Route path="/" element={
              <ProtectedRoute>
                <MasterLayout />
              </ProtectedRoute>
            }>
              {/* ใช้ Navigate เพื่อ redirect จาก / ไปที่ /dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Dashboard */}
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Project Management */}
              <Route path="projects">
                <Route index element={<Project />} />
                <Route path="review" element={<ProjectReview />} />
                <Route path=":projectId" element={<ProjectDetail />} />
              </Route>
              
              {/* User Management */}
              <Route path="users">
                <Route path="student" element={<Student />} />
                <Route path="admin" element={<Admin />} />
              </Route>
              
              {/* Logs */}
              <Route path="login-info" element={<Log />} />
            </Route>
            
            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;