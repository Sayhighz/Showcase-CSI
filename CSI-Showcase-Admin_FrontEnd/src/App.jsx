// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import '@ant-design/v5-patch-for-react-19';

// นำเข้า context
import { AuthProvider } from './context/AuthContext';
import { AdminStateProvider } from './context/AdminStateContext';

// นำเข้า layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// นำเข้าหน้าต่างๆ
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

// นำเข้าหน้าต่างๆ เกี่ยวกับโครงงาน
import ProjectsPage from './pages/projects/ProjectsPage';
import PendingProjectsPage from './pages/projects/PendingProjectsPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import ProjectStatsPage from './pages/projects/ProjectStatsPage';

// นำเข้าหน้าต่างๆ เกี่ยวกับผู้ใช้
import UsersPage from './pages/users/UsersPage';
import AdminUsersPage from './pages/users/AdminUsersPage';
import StudentUsersPage from './pages/users/StudentUsersPage';
import UserDetailPage from './pages/users/UserDetailPage';
import UserStatsPage from './pages/users/UserStatsPage';

// นำเข้าหน้าต่างๆ เกี่ยวกับบันทึก
import LoginLogsPage from './pages/log/LoginLogsPage';
import VisitorViewsPage from './pages/log/VisitorViewsPage';
import ReviewLogsPage from './pages/log/ReviewLogsPage';
import SystemStatsPage from './pages/log/SystemStatsPage';

// นำเข้าคอมโพเนนต์สำหรับป้องกันเส้นทาง
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// กำหนดสีธีมสำหรับ Ant Design
const theme = {
  token: {
    colorPrimary: '#90278E',
    colorInfo: '#90278E',
    colorSuccess: '#4CAF50',
    colorWarning: '#FFC107',
    colorError: '#F44336',
    colorBgBase: '#FFFFFF',
    borderRadius: 4,
    fontFamily: 'Kanit, sans-serif',
  },
  components: {
    Menu: {
      colorItemBg: 'transparent',
      colorItemText: '#FFFFFF',
      colorItemTextSelected: '#FFFFFF',
      colorItemBgSelected: '#B15CD0',
      colorItemTextHover: '#FFFFFF',
    },
    Button: {
      colorPrimaryHover: '#B15CD0',
    },
    Layout: {
      colorBgHeader: '#050114',
      colorBgBody: '#F5F5F5',
      colorBgSider: '#050114',
    },
  },
};

const App = () => {
  return (
    <ConfigProvider theme={theme}>
      <ErrorBoundary>
        <AuthProvider>
          <AdminStateProvider>
            <Router>
              <Routes>
                {/* เส้นทางสำหรับหน้าเข้าสู่ระบบ */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                </Route>

                {/* เส้นทางที่ต้องยืนยันตัวตน */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<MainLayout />}>
                    {/* หน้าแดชบอร์ด */}
                    <Route path="/" element={
                      <ErrorBoundary>
                        <DashboardPage />
                      </ErrorBoundary>
                    } />

                    {/* หน้าเกี่ยวกับโครงงาน */}
                    <Route path="/projects" element={
                      <ErrorBoundary>
                        <ProjectsPage />
                      </ErrorBoundary>
                    } />
                    <Route path="/projects/pending" element={
                      <ErrorBoundary>
                        <PendingProjectsPage />
                      </ErrorBoundary>
                    } />
                    <Route path="/projects/:projectId" element={
                      <ErrorBoundary>
                        <ProjectDetailPage />
                      </ErrorBoundary>
                    } />
                    <Route path="/projects/stats" element={
                      <ErrorBoundary>
                        <ProjectStatsPage />
                      </ErrorBoundary>
                    } />

                    {/* หน้าเกี่ยวกับผู้ใช้ */}
                    <Route path="/users" element={
                      <ErrorBoundary>
                        <UsersPage />
                      </ErrorBoundary>
                    } />
                    <Route path="/users/admins" element={
                      <ErrorBoundary>
                        <AdminUsersPage />
                      </ErrorBoundary>
                    } />
                    <Route path="/users/students" element={
                      <ErrorBoundary>
                        <StudentUsersPage />
                      </ErrorBoundary>
                    } />
                    <Route path="/users/:userId" element={
                      <ErrorBoundary>
                        <UserDetailPage />
                      </ErrorBoundary>
                    } />
                    <Route path="/users/stats" element={
                      <ErrorBoundary>
                        <UserStatsPage />
                      </ErrorBoundary>
                    } />

                    {/* หน้าเกี่ยวกับบันทึก */}
                    <Route path="/logs/login" element={
                      <ErrorBoundary>
                        <LoginLogsPage />
                      </ErrorBoundary>
                    } />
                    <Route path="/logs/visitor-views" element={
                      <ErrorBoundary>
                        <VisitorViewsPage />
                      </ErrorBoundary>
                    } />
                    <Route path="/logs/reviews" element={
                      <ErrorBoundary>
                        <ReviewLogsPage />
                      </ErrorBoundary>
                    } />
                    <Route path="/logs/system-stats" element={
                      <ErrorBoundary>
                        <SystemStatsPage />
                      </ErrorBoundary>
                    } />
                  </Route>
                </Route>

                {/* เส้นทางเริ่มต้น */}
                {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}
                
                {/* เส้นทางที่ไม่มี */}
                {/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}
              </Routes>
            </Router>
          </AdminStateProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ConfigProvider>
  );
};

export default App;