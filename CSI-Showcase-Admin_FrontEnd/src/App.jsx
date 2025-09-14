// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import '@ant-design/v5-patch-for-react-19';

// นำเข้า context และ theme
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import { theme } from './config/themeConfig';

// นำเข้า layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// นำเข้าหน้าต่างๆ
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';

// นำเข้าหน้าต่างๆ เกี่ยวกับโครงงาน
import ProjectsPage from './pages/projects/ProjectsPage';
import PendingProjectsPage from './pages/projects/PendingProjectsPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import ProjectStatsPage from './pages/projects/ProjectStatsPage';
import UploadProjectPage from './pages/projects/UploadProjectPage';
import MyProjectPage from './pages/projects/MyProjectPage';

// นำเข้าหน้าต่างๆ เกี่ยวกับผู้ใช้ (Admin Only)
import UsersPage from './pages/users/UsersPage';
import AdminUsersPage from './pages/users/AdminUsersPage';
import StudentUsersPage from './pages/users/StudentUsersPage';
import UserDetailPage from './pages/users/UserDetailPage';
import UserStatsPage from './pages/users/UserStatsPage';

// นำเข้าหน้าต่างๆ เกี่ยวกับบันทึก (Admin Only)
import LoginLogsPage from './pages/log/LoginLogsPage';
import VisitorViewsPage from './pages/log/VisitorViewsPage';
import ReviewLogsPage from './pages/log/ReviewLogsPage';
import SystemStatsPage from './pages/log/SystemStatsPage';

/* นำเข้าหน้าสำหรับนักศึกษา */
import StudentDashboard from './pages/student/StudentDashboard';
import ProfilePage from './pages/ProfilePage';

// นำเข้าคอมโพเนนต์สำหรับป้องกันเส้นทาง
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleBasedRoute from './components/auth/RoleBasedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// กำหนด base path สำหรับ reverse proxy
const BASE_PATH = import.meta.env.VITE_BASE_PATH || '/csif';

const App = () => {
  return (
    <ConfigProvider theme={theme}>
      <ErrorBoundary>
        <LoadingProvider>
          <AuthProvider>
            <Router basename={BASE_PATH}>
              <Routes>
                {/* Public routes - Login */}
                <Route key="home-redirect" path="/" element={<Navigate to="/login" replace />} />
                <Route key="login" path="/login" element={
                  <AuthLayout>
                    <LoginPage />
                  </AuthLayout>
                } />
                <Route key="reset-password" path="/reset-password" element={
                  <AuthLayout>
                    <ResetPasswordPage />
                  </AuthLayout>
                } />

                {/* Protected routes */}
                <Route key="protected" element={<ProtectedRoute />}>
                  <Route key="main-layout" element={<MainLayout />}>
                    
                    {/* Dashboard routes with unique keys */}
                    <Route 
                      key="admin-dashboard" 
                      path="/dashboard" 
                      element={
                        <RoleBasedRoute allowedRoles={['admin']}>
                          <ErrorBoundary>
                            <DashboardPage />
                          </ErrorBoundary>
                        </RoleBasedRoute>
                      } 
                    />

                    <Route 
                      key="student-dashboard" 
                      path="/student/dashboard" 
                      element={
                        <RoleBasedRoute allowedRoles={['student']}>
                          <ErrorBoundary>
                            <StudentDashboard />
                          </ErrorBoundary>
                        </RoleBasedRoute>
                      } 
                    />

                    <Route
                      key="my-profile"
                      path="/profile"
                      element={
                        <RoleBasedRoute allowedRoles={['admin', 'student']}>
                          <ErrorBoundary>
                            <ProfilePage />
                          </ErrorBoundary>
                        </RoleBasedRoute>
                      }
                    />

                    {/* Shared project routes */}
                    <Route 
                      key="project-upload" 
                      path="/projects/upload" 
                      element={
                        <ErrorBoundary>
                          <UploadProjectPage />
                        </ErrorBoundary>
                      } 
                    />
                    <Route 
                      key="my-projects" 
                      path="/projects/my-projects" 
                      element={
                        <ErrorBoundary>
                          <MyProjectPage />
                        </ErrorBoundary>
                      } 
                    />
                    <Route 
                      key="project-detail" 
                      path="/projects/:projectId" 
                      element={
                        <ErrorBoundary>
                          <ProjectDetailPage />
                        </ErrorBoundary>
                      } 
                    />

                    {/* Admin-only project routes */}
                    <Route 
                      key="admin-projects" 
                      path="/projects" 
                      element={
                        <RoleBasedRoute allowedRoles={['admin']}>
                          <ErrorBoundary>
                            <ProjectsPage />
                          </ErrorBoundary>
                        </RoleBasedRoute>
                      } 
                    />
                    <Route 
                      key="pending-projects" 
                      path="/projects/pending" 
                      element={
                        <RoleBasedRoute allowedRoles={['admin']}>
                          <ErrorBoundary>
                            <PendingProjectsPage />
                          </ErrorBoundary>
                        </RoleBasedRoute>
                      } 
                    />
                    <Route 
                      key="project-stats" 
                      path="/projects/stats" 
                      element={
                        <RoleBasedRoute allowedRoles={['admin']}>
                          <ErrorBoundary>
                            <ProjectStatsPage />
                          </ErrorBoundary>
                        </RoleBasedRoute>
                      } 
                    />

                    {/* Admin-only user management routes */}
                    <Route 
                      key="users-list" 
                      path="/users" 
                      element={
                        <RoleBasedRoute allowedRoles={['admin']}>
                          <ErrorBoundary>
                            <UsersPage />
                          </ErrorBoundary>
                        </RoleBasedRoute>
                      } 
                    />
                    <Route 
                      key="admin-users" 
                      path="/users/admins" 
                      element={
                        <RoleBasedRoute allowedRoles={['admin']}>
                          <ErrorBoundary>
                            <AdminUsersPage />
                          </ErrorBoundary>
                        </RoleBasedRoute>
                      } 
                    />
                    <Route 
                      key="student-users" 
                      path="/users/students" 
                      element={
                        <RoleBasedRoute allowedRoles={['admin']}>
                          <ErrorBoundary>
                            <StudentUsersPage />
                          </ErrorBoundary>
                        </RoleBasedRoute>
                      } 
                    />
                    <Route
                      key="user-detail"
                      path="/users/:userId"
                      element={
                        <RoleBasedRoute allowedRoles={['admin']}>
                          <ErrorBoundary>
                            <UserDetailPage />
                          </ErrorBoundary>
                        </RoleBasedRoute>
                      }
                    />
                    
                    {/* Route for users to view their own profile details */}
                    <Route
                      key="user-profile-detail"
                      path="/profile/:userId"
                      element={
                        <RoleBasedRoute allowedRoles={['admin', 'student']}>
                          <ErrorBoundary>
                            <UserDetailPage />
                          </ErrorBoundary>
                        </RoleBasedRoute>
                      }
                    />
                    <Route 
                      key="user-stats" 
                      path="/users/stats" 
                      element={
                        <RoleBasedRoute allowedRoles={['admin']}>
                          <ErrorBoundary>
                            <UserStatsPage />
                          </ErrorBoundary>
                        </RoleBasedRoute>
                      } 
                    />

                    {/* Admin-only log routes */}
                    <Route 
                      key="login-logs" 
                      path="/logs/login" 
                      element={
                        <RoleBasedRoute allowedRoles={['admin']}>
                          <ErrorBoundary>
                            <LoginLogsPage />
                          </ErrorBoundary>
                        </RoleBasedRoute>
                      } 
                    />
                    <Route 
                      key="visitor-views" 
                      path="/logs/visitor-views" 
                      element={
                        <RoleBasedRoute allowedRoles={['admin']}>
                          <ErrorBoundary>
                            <VisitorViewsPage />
                          </ErrorBoundary>
                        </RoleBasedRoute>
                      } 
                    />
                    <Route 
                      key="review-logs" 
                      path="/logs/reviews" 
                      element={
                        <RoleBasedRoute allowedRoles={['admin']}>
                          <ErrorBoundary>
                            <ReviewLogsPage />
                          </ErrorBoundary>
                        </RoleBasedRoute>
                      } 
                    />
                    <Route 
                      key="system-stats" 
                      path="/logs/system-stats" 
                      element={
                        <RoleBasedRoute allowedRoles={['admin']}>
                          <ErrorBoundary>
                            <SystemStatsPage />
                          </ErrorBoundary>
                        </RoleBasedRoute>
                      } 
                    />

                  </Route>
                </Route>

                {/* Fallback route */}
                <Route key="fallback" path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Router>
          </AuthProvider>
        </LoadingProvider>
      </ErrorBoundary>
    </ConfigProvider>
  );
};

export default App;