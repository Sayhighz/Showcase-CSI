import React from "react";
import Navbar from "./Navbar"; // Import the Navbar component
import Footer from "./Footer"; // Import the Footer component
import { Layout } from "antd"; // Import Layout component from Ant Design

const { Content } = Layout; // Destructure the Content component from Layout

const MasterLayout = ({ children }) => {
  return (
    <Layout className="min-h-screen">
      {/* Navbar (Top Navigation Bar) */}
      <Navbar />

      {/* Main content section */}
      <Content className="p-0 w-full">
        {/* ไม่จำกัดขนาด container สำหรับ Banner */}
        <div className="w-full">
          {children} {/* Render the page-specific content passed as children */}
        </div>
      </Content>

      {/* Footer (Bottom Section) */}
      <Footer />
    </Layout>
  );
};

export default MasterLayout;
