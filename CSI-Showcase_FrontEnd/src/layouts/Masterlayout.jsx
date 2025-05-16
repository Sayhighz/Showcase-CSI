import React from "react";
import Navbar from "./Navbar"; // Import the Navbar component
import Footer from "./Footer"; // Import the Footer component
import { Layout } from "antd"; // Import Layout component from Ant Design

const { Content } = Layout; // Destructure the Content component from Layout

const MasterLayout = ({ children }) => {
  return (
    <Layout className="flex flex-col min-h-screen">
      {/* Navbar (Top Navigation Bar) */}
      <Navbar />

      {/* Main content section */}
      <Content className="flex-grow p-0 w-full">
        <div className="w-full">
          {children} {/* Render the page-specific content passed as children */}
        </div>
      </Content>

      {/* Footer (Bottom Section) - ตรวจสอบให้แน่ใจว่า Footer ไม่ถูกบดบัง */}
      <div className="z-30 relative">
        <Footer />
      </div>
    </Layout>
  );
};

export default MasterLayout;