import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  EditOutlined,
  DeleteOutlined,
  RightOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import { Card, Button } from "antd"; // Import Ant Design components

const Work_Row = ({
  title,
  items,
  description,
  side,
  showActions = false,
  onEdit,
  onDelete,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(items.length / itemsPerPage);

  // Preserve current page across renders
  useEffect(() => {
    // Retrieve the current page from localStorage (or sessionStorage)
    const savedPage = localStorage.getItem("currentPage");
    if (savedPage) {
      setCurrentPage(Number(savedPage)); // Set the page from saved state
    }
  }, []);

  useEffect(() => {
    // Save the current page to localStorage (or sessionStorage) whenever it changes
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  const displayedItems = items.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const nextPage = () => {
    setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  // Function to convert the type to display name
  const getTypeLabel = (type) => {
    switch (type) {
      case "academic":
        return "วิชาการ";
      case "coursework":
        return "ในชั้นเรียน";
      case "competition":
        return "การแข่งขัน";
      default:
        return type;
    }
  };

  return (
    <div className="work-section mt-10">
      <h1
        className={`text-3xl font-bold text-[#90278E] text-${side || "left"}`}
      >
        {title}
      </h1>
      <p className={`text-[#424242] mb-4 text-${side || "left"}`}>
        {description || ""}
      </p>

      {/* Show a message if no items are available */}
      {items.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>ยังไม่มีผลงานในขณะนี้</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            className="flex flex-col space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {displayedItems.map((item, index) => (
              <div key={index} className="flex space-x-6 items-center">
                <div className="w-1/4 h-32 rounded-lg overflow-hidden bg-gray-200">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Card
                  title={
                    <Link
                      to={item.projectLink}
                      className="text-[#90278E] hover:underline"
                    >
                      {item.title}
                    </Link>
                  }
                  extra={
                    showActions && (
                      <div className="flex space-x-4">
                        <Button
                          onClick={() => onEdit(item)}
                          icon={<EditOutlined />}
                          type="primary"
                          size="small"
                          className="bg-blue-500 text-white hover:bg-blue-600"
                        >
                          แก้ไข
                        </Button>
                        <Button
                          onClick={() => onDelete(item)}
                          icon={<DeleteOutlined />}
                          type="primary"
                          danger
                          size="small"
                          className="bg-red-500 text-white hover:bg-red-600"
                        >
                          ลบ
                        </Button>
                      </div>
                    )
                  }
                  className="w-full bg-white shadow-md"
                >
                  <div className="flex justify-between">
                    <p className="text-xs text-gray-400">
                      ผลงานในปี {item.year}
                    </p>
                    <p className="text-xs text-gray-500">ระดับ: {item.level}</p>
                    <p className="text-xs text-gray-500">
                      หมวดหมู่: {getTypeLabel(item.category)}
                    </p>
                  </div>

                  <p className="text-gray-700 text-xs">{item.description}</p>
                </Card>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination Controls */}
      {items.length > 0 && (
        <div className="flex justify-center items-center mt-6 space-x-3 mb-5">
          <motion.button
            onClick={prevPage}
            className="w-10 h-10 flex items-center justify-center border rounded-full text-gray-700 hover:bg-gray-200"
            whileTap={{ scale: 0.9 }}
          >
            <LeftOutlined />
          </motion.button>

          {Array.from({ length: totalPages }).map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToPage(index)}
              className={`w-10 h-10 flex items-center justify-center border rounded-full ${
                currentPage === index
                  ? "bg-[#90278E] text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
              whileTap={{ scale: 0.9 }}
            >
              {index + 1}
            </motion.button>
          ))}

          <motion.button
            onClick={nextPage}
            className="w-10 h-10 flex items-center justify-center border rounded-full text-gray-700 hover:bg-gray-200"
            whileTap={{ scale: 0.9 }}
          >
            <RightOutlined />
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default Work_Row;
