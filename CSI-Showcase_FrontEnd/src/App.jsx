import React from "react";
import '@ant-design/v5-patch-for-react-19';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PrivateProjectRoute from "./components/PrivateProjectRoute";
import MasterLayout from "./layouts/MasterLayout";

// Import pages
import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import AllProject from "./pages/Projects/AllProject";
import MyProject from "./pages/Projects/MyProject";
import ProjectInfo from "./pages/Projects/ProjectInfo";
import CourseWork from "./pages/Upload/UploadProject";
import EditProject from "./pages/Projects/EditProject";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<MasterLayout><Home /></MasterLayout>} />
          <Route path="/projects/all" element={<MasterLayout><AllProject /></MasterLayout>} />
          
          {/* Project Detail Route - จะตรวจสอบสิทธิ์ในการเข้าถึงโปรเจคส่วนตัว */}
          <Route path="/projects/:projectId" element={
            <MasterLayout>
              <PrivateProjectRoute>
                <ProjectInfo />
              </PrivateProjectRoute>
            </MasterLayout>
          } />

          {/* Protected Routes (Require Authentication) */}
          <Route path="/projects/my" element={
            <ProtectedRoute>
              <MasterLayout><MyProject /></MasterLayout>
            </ProtectedRoute>
          } />

          <Route path="/upload" element={
            <ProtectedRoute>
              <MasterLayout><CourseWork /></MasterLayout>
            </ProtectedRoute>
          } />

          {/* Edit Project Route - ต้องตรวจสอบทั้งการเข้าสู่ระบบและสิทธิ์ในการแก้ไขโปรเจค */}
          <Route path="/edit/project/:projectId" element={
            <ProtectedRoute>
              <MasterLayout>
                <PrivateProjectRoute>
                  <EditProject />
                </PrivateProjectRoute>
              </MasterLayout>
            </ProtectedRoute>
          } />
          
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;