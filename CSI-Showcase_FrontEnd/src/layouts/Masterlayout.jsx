// src/layouts/MasterLayout.jsx

import React from "react";
import Navbar from "./Navbar"; // Import the Navbar component
import Footer from "./Footer"; // Import the Footer component
import { Layout } from "antd"; // Import Layout component from Ant Design

const { Content } = Layout; // Destructure the Content component from Layout

const MasterLayout = ({ children }) => {
  return (
    // Main layout container with full-screen height
    <Layout className="min-h-screen">
      
      {/* Navbar (Top Navigation Bar) */}
      <Navbar />

      {/* Main content section */}
      <Content className="p-6">
        {/* Container to keep content centered and responsive */}
        <div className="container max-w-screen-xl mx-auto px-6">
          {children} {/* Render the page-specific content passed as children */}
        </div>
      </Content>

      {/* Footer (Bottom Section) */}
      <Footer />
      
    </Layout>
  );
};

export default MasterLayout;
