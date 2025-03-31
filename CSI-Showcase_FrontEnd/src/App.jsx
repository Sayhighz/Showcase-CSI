import React from "react";
import '@ant-design/v5-patch-for-react-19';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AuthProvider from "./context/AuthContext";
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

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<MasterLayout><Home /></MasterLayout>} />
          <Route path="/projects/all" element={<MasterLayout><AllProject /></MasterLayout>} />
          <Route path="/projects/:projectId" element={<MasterLayout><ProjectInfo /></MasterLayout>} />

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
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
