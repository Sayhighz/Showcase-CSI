import React, { useState, useEffect } from "react";
import { Button, Typography, Empty, Card, Statistic, Row, Col } from "antd";
import {
  PlusOutlined,
  ProjectOutlined,
  AppstoreOutlined,
  BookOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

// นำเข้า hooks ที่มีอยู่ในโปรเจค
import { useAuth, useProject } from "../../hooks";

// นำเข้า components ที่มีอยู่แล้วในโปรเจค
import Work_Row from "../../components/Work/Work_Row";
import Work_Col from "../../components/Work/Work_Col";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import Pagination from "../../components/common/Pagination";
import ProjectFilter from "../../components/Project/ProjectFilter"; // นำเข้า ProjectFilter

// นำเข้า constants
import { PROJECT, HOME } from "../../constants/routes";
import { PROJECT_TYPES, PROJECT_TYPE } from "../../constants/projectTypes";

const { Title, Text } = Typography;

const MyProject = () => {
  // ใช้ custom hooks จากโปรเจค
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const {
    projects,
    isLoading,
    error,
    fetchMyProjects,
    deleteProject,
    projectTypes,
    projectYears,
    studyYears,
    pagination,
    changePage,
    updateFilters,
  } = useProject();

  // สำหรับคัดกรองข้อมูล - ใช้ชื่อฟิลด์ที่เข้ากันได้กับ API
  const [filters, setFilters] = useState({
    category: null, // ใช้ category แทน type
    year: null,
    level: null, // ใช้ level แทน studyYear
    keyword: "",
  });

  // สำหรับเก็บข้อมูลโปรเจคที่ได้จาก API
  const [myProjects, setMyProjects] = useState([]);
  const [displayType, setDisplayType] = useState("grid"); // 'grid' หรือ 'list'

  const navigate = useNavigate();

  // ดึงข้อมูลโปรเจคเมื่อ component mount
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        if (user && user.id) {
          await fetchMyProjects(user.id);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjectData();
  }, [user, fetchMyProjects]);

  // เมื่อ projects เปลี่ยนแปลง อัพเดท myProjects state
  useEffect(() => {
    // ตรวจสอบว่า projects เป็น array หรือไม่
    if (Array.isArray(projects)) {
      setMyProjects(projects);
    } else if (
      projects &&
      projects.projects &&
      Array.isArray(projects.projects)
    ) {
      setMyProjects(projects.projects);
    } else if (projects && projects.data && Array.isArray(projects.data)) {
      setMyProjects(projects.data);
    } else {
      setMyProjects([]);
    }
  }, [projects]);

  // คัดกรองโปรเจคตามเงื่อนไข
  const filteredProjects = myProjects.filter(
    (project) =>
      (filters.category === null ||
        filters.category === undefined ||
        project.category === filters.category ||
        project.type === filters.category) &&
      (filters.year === null ||
        filters.year === undefined ||
        project.year?.toString() === filters.year?.toString()) &&
      (filters.level === null ||
        filters.level === undefined ||
        project.level === filters.level ||
        project.level === filters.level) &&
      (filters.keyword === "" ||
        project.title?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        project.description
          ?.toLowerCase()
          .includes(filters.keyword.toLowerCase()))
  );

  // แยกโปรเจคตามประเภทสำหรับสถิติ
  const academicProjects = myProjects.filter(
    (project) => project.category === PROJECT_TYPE.ACADEMIC
  );
  const courseworkProjects = myProjects.filter(
    (project) => project.category === PROJECT_TYPE.COURSEWORK
  );
  const competitionProjects = myProjects.filter(
    (project) => project.category === PROJECT_TYPE.COMPETITION
  );

  // จัดการกับการเปลี่ยนแปลงตัวกรอง
  const handleFilterChange = (newFilters) => {
    console.log("อัปเดทตัวกรอง:", newFilters);
    setFilters((prev) => ({ ...prev, ...newFilters }));

    // อัปเดตฟิลเตอร์ใน useProject hook
    if (updateFilters) {
      updateFilters(newFilters);
    }
  };

  // ค้นหาโปรเจค
  const handleSearch = (searchParams) => {
    console.log("ค้นหาด้วยพารามิเตอร์:", searchParams);
    setFilters((prev) => ({ ...prev, ...searchParams }));
  };

  // รีเซ็ตตัวกรอง
  const handleReset = () => {
    setFilters({
      category: null,
      year: null,
      level: null,
      keyword: "",
    });
  };

  // แก้ไขโปรเจค
  const handleEdit = (project) => {
    navigate(PROJECT.EDIT(project.id));
  };

  // ลบโปรเจค
  const handleDelete = async (project) => {
    try {
      await deleteProject(project.id);
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  // ไปยังหน้าอัปโหลดโปรเจค
  const handleAddProject = () => {
    navigate(PROJECT.UPLOAD.COURSEWORK);
  };

  // เปลี่ยนรูปแบบการแสดงผล
  const toggleDisplayType = () => {
    setDisplayType((prev) => (prev === "grid" ? "list" : "grid"));
  };

  // กรณียังไม่ได้เข้าสู่ระบบ
  if (!isAuthenticated && !isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <Empty
          description={
            <span className="text-gray-500">
              กรุณาเข้าสู่ระบบเพื่อดูผลงานของคุณ
            </span>
          }
        />
        <Button
          type="primary"
          onClick={() => navigate("/login")}
          className="mt-4 bg-[#90278E] hover:bg-[#6d216c]"
        >
          เข้าสู่ระบบ
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* หัวข้อ */}
        <div className="mb-8">
          {/* Breadcrumb */}
          <div className="mb-4">
            <span
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
              onClick={() => navigate(HOME)}
            >
              หน้าหลัก
            </span>
            <span className="mx-2">/</span>
            <span className="text-[#90278E]">ผลงานของฉัน</span>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-2">
            <div className="mb-4 sm:mb-0 text-center sm:text-left">
              <Title
                level={2}
                className="text-[#90278E] flex items-center gap-2 mb-1"
              >
                <ProjectOutlined className="mr-2" />
                ผลงานของฉัน
              </Title>

              <Text type="secondary" className="text-lg">
                เรียกดูและจัดการผลงานทั้งหมดของคุณในที่เดียว
              </Text>
            </div>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddProject}
              size="large"
              className="bg-[#90278E] hover:bg-[#6d216c] shadow-md"
            >
              เพิ่มผลงานใหม่
            </Button>
          </div>
        </div>

        {/* สถิติโปรเจค */}
        <div className="mb-8">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card hoverable className="text-center shadow-sm">
                <Statistic
                  title="ผลงานทั้งหมด"
                  value={myProjects.length}
                  prefix={<AppstoreOutlined />}
                  valueStyle={{ color: "#90278E" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card hoverable className="text-center shadow-sm">
                <Statistic
                  title="บทความวิชาการ"
                  value={academicProjects.length}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: "blue" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card hoverable className="text-center shadow-sm">
                <Statistic
                  title="งานในชั้นเรียน"
                  value={courseworkProjects.length}
                  prefix={<AppstoreOutlined />}
                  valueStyle={{ color: "green" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card hoverable className="text-center shadow-sm">
                <Statistic
                  title="การแข่งขัน"
                  value={competitionProjects.length}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: "gold" }}
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* ใช้ ProjectFilter แทน FilterPanel */}
        <div className="mb-8">
          <ProjectFilter
            projectTypes={PROJECT_TYPES}
            projectYears={projectYears}
            studyYears={studyYears}
            initialValues={filters}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            onReset={handleReset}
            loading={isLoading}
            showSearch={true}
            layout="horizontal"
          />

          {/* ปุ่มสลับการแสดงผล */}
          <div className="flex justify-end mt-4">
            <Button
              onClick={toggleDisplayType}
              icon={
                displayType === "grid" ? (
                  <AppstoreOutlined />
                ) : (
                  <ProjectOutlined />
                )
              }
              type="default"
            >
              {displayType === "grid" ? "แสดงแบบรายการ" : "แสดงแบบกริด"}
            </Button>
          </div>
        </div>

        {/* แสดงผลงาน */}
        {isLoading ? (
          <LoadingSpinner tip="กำลังโหลดผลงานของคุณ..." />
        ) : error ? (
          <ErrorMessage
            title="เกิดข้อผิดพลาด"
            message={error}
            showBackButton={false}
            showReloadButton={true}
          />
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <Empty
              description={
                <span className="text-gray-500">
                  ยังไม่มีผลงานในประเภทที่คุณเลือก
                </span>
              }
              className="py-8"
            />
          </div>
        ) : (
          // ใช้ Work Components ที่มีอยู่แล้ว\
          <>
            <Work_Row
              title=""
              items={filteredProjects}
              side="center"
              showActions={true}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </>
        )}

        {/* แสดง Pagination */}
        {!isLoading && !error && filteredProjects.length > 0 && (
          <Pagination
            current={pagination.current}
            total={pagination.total || filteredProjects.length}
            pageSize={pagination.pageSize}
            onChange={changePage}
            showSizeChanger={true}
            showQuickJumper={false}
            showTotal={true}
          />
        )}

        {/* Placeholder เมื่อไม่มีผลงาน */}
        {!isLoading && !error && myProjects.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center mt-8">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="space-y-2">
                  <Text strong className="block text-lg">
                    คุณยังไม่มีผลงานในระบบ
                  </Text>
                  <Text type="secondary">
                    เริ่มสร้างผลงานแรกของคุณเพื่อจัดเก็บและแชร์ให้ผู้อื่นได้ชม
                  </Text>
                </div>
              }
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddProject}
              className="mt-4 bg-[#90278E] hover:bg-[#6d216c]"
            >
              เพิ่มผลงานใหม่
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProject;
