import React from "react";
import '@ant-design/v5-patch-for-react-19';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MasterLayout from "./layouts/MasterLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Projects from "./pages/projectManagement/Project";
import Student from "./pages/accountManagement/Student";
import Admin from "./pages/accountManagement/Admin"
import LoginInfo from "./pages/Log/Log";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MasterLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="/users/student" element={<Student />} />
          <Route path="/users/admin" element={<Admin />} />
          <Route path="login-info" element={<LoginInfo />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
