import React from "react";
import '@ant-design/v5-patch-for-react-19';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MasterLayout from "./layouts/MasterLayout";

// Import pages
import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import AllProject from "./pages/Projects/AllProject";
import MyProject from "./pages/Projects/MyProject";
import ProjectInfo from "./pages/Projects/ProjectInfo";
import CourseWork from "./pages/Upload/UploadWork";
import EditProject from "./pages/Projects/EditProject";

// Import new pages
import Profile from "./pages/User/Profile";
import Settings from "./pages/User/Settings";
import Dashboard from "./pages/User/Dashboard";
import ProjectByType from "./pages/Project/ProjectByType";
// จากการตรวจสอบที่พบว่า ProjectGallery มีทั้งคอมโพเนนต์และหน้าเพจ
import ProjectGalleryPage from "./pages/Project/ProjectGallery";
import SearchResults from "./pages/Search/SearchResults";
import AdvancedSearch from "./pages/Search/AdvancedSearch";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<MasterLayout><Home /></MasterLayout>} />
          <Route path="/projects/all" element={<MasterLayout><AllProject /></MasterLayout>} />
          <Route path="/projects/:projectId" element={<MasterLayout><ProjectInfo /></MasterLayout>} />
          <Route path="/projects/type/:type" element={<MasterLayout><ProjectByType /></MasterLayout>} />
          {/* เปลี่ยนจาก ProjectGallery เป็น ProjectGalleryPage เพื่อให้ชัดเจนว่าเป็นหน้าเพจไม่ใช่คอมโพเนนต์ */}
          <Route path="/projects/gallery/:projectId" element={<MasterLayout><ProjectGalleryPage /></MasterLayout>} />
          
          {/* Search Routes */}
          <Route path="/search" element={<MasterLayout><SearchResults /></MasterLayout>} />
          <Route path="/search/advanced" element={<MasterLayout><AdvancedSearch /></MasterLayout>} />
          <Route path="/search/tag/:tag" element={<MasterLayout><SearchResults /></MasterLayout>} />

          {/* User Profile Routes */}
          <Route path="/user/:id" element={<MasterLayout><Profile /></MasterLayout>} />
          <Route path="/user/me" element={
            <ProtectedRoute>
              <MasterLayout><Profile /></MasterLayout>
            </ProtectedRoute>
          } />

          {/* Protected Routes (Require Authentication) */}
          <Route path="/projects/my" element={
            <ProtectedRoute>
              <MasterLayout><MyProject /></MasterLayout>
            </ProtectedRoute>
          } />

          <Route path="/upload/coursework" element={
            <ProtectedRoute>
              <MasterLayout><CourseWork /></MasterLayout>
            </ProtectedRoute>
          } />

          <Route path="/edit/project/:id" element={
            <ProtectedRoute>
              <MasterLayout><EditProject /></MasterLayout>
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MasterLayout><Dashboard /></MasterLayout>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <MasterLayout><Settings /></MasterLayout>
            </ProtectedRoute>
          } />

          <Route path="/user/edit" element={
            <ProtectedRoute>
              <MasterLayout><Settings /></MasterLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;