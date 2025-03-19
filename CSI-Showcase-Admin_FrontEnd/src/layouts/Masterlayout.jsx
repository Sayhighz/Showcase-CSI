import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const MasterLayout = ({ children }) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex flex-col flex-grow">
        <Header />
        <div className="p-6 flex-grow bg-gray-100 overflow-y-auto">
          {children || <Outlet />} {/* Renders children if provided, otherwise uses Outlet */}
        </div>
      </div>
    </div>
  );
};

export default MasterLayout;