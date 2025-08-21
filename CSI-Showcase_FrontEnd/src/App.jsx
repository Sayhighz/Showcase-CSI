import React from "react";
import '@ant-design/v5-patch-for-react-19';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import MasterLayout from "./layouts/MasterLayout";
import SmoothScrollProvider from "./components/common/SmoothScrollProvider";

// Import pages
import Home from "./pages/Home/Home";
import AllProject from "./pages/Projects/AllProject";
import AcademicProjects from "./pages/Projects/AcademicProjects";
import CourseworkProjects from "./pages/Projects/CourseworkProjects";
import CompetitionProjects from "./pages/Projects/CompetitionProjects";
import ProjectInfo from "./pages/Projects/ProjectInfo";

// Add a configuration for your deployment base path (normalized)
// Use Vite-style env var and normalize to no trailing slash, ensure leading slash.
const rawBase = import.meta.env.VITE_BASE_PATH || '/csie';
const BASE_PATH = (() => {
  try {
    let b = String(rawBase || '').trim();
    if (!b.startsWith('/')) b = '/' + b;
    b = b.replace(/\/+$/, ''); // remove trailing slashes
    return b || '/';
  } catch {
    return '/csie';
  }
})();

const App = () => {
  return (
    <Router basename={BASE_PATH}>
      <AuthProvider>
        <SmoothScrollProvider>
          <Routes>
            {/* Public Routes - View Only */}
            <Route path="/" element={<MasterLayout><Home /></MasterLayout>} />
            <Route path="/projects/all" element={<MasterLayout><AllProject /></MasterLayout>} />
            
            {/* Category-specific project routes */}
            <Route path="/projects/academic" element={<MasterLayout><AcademicProjects /></MasterLayout>} />
            <Route path="/projects/coursework" element={<MasterLayout><CourseworkProjects /></MasterLayout>} />
            <Route path="/projects/competition" element={<MasterLayout><CompetitionProjects /></MasterLayout>} />
            
            {/* Project Detail Route - Public viewing only */}
            <Route path="/projects/:projectId" element={
              <MasterLayout>
                <ProjectInfo />
              </MasterLayout>
            } />
          </Routes>
        </SmoothScrollProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;