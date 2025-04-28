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

// นำเข้า hooks และ services
import useAuth from "../../hooks/useAuth";
import { getMyProjects, deleteProject } from "../../services/projectService";

// นำเข้า components
import Work_Row from "../../components/Work/Work_Row";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import ProjectFilter from "../../components/Project/ProjectFilter";

// นำเข้า constants
import { PROJECT, HOME } from "../../constants/routes";
import { PROJECT_TYPES, PROJECT_TYPE } from "../../constants/projectTypes";

const { Title, Text } = Typography;

const MyProject = () => {
  // ใช้ custom hook useAuth
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  
  // สร้าง state สำหรับจัดการข้อมูลและการแสดงผล
  const [myProjects, setMyProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [displayType, setDisplayType] = useState("grid"); // 'grid' หรือ 'list'
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // สำหรับคัดกรองข้อมูล
  const [filters, setFilters] = useState({
    category: null,
    year: null,
    level: null,
    keyword: "",
  });
  
  // อื่นๆ
  const [projectYears, setProjectYears] = useState([]);
  const [studyYears, setStudyYears] = useState([1, 2, 3, 4]);
  
  const navigate = useNavigate();

  // ดึงข้อมูลโปรเจคเมื่อ component mount
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!user || !user.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await getMyProjects(user.id, {
          page: pagination.current,
          limit: pagination.pageSize,
          ...filters
        });
        
        if (response && response.projects) {
          setMyProjects(response.projects);
          setPagination(prev => ({
            ...prev,
            total: response.pagination?.totalItems || response.projects.length
          }));
          
          // สร้าง projectYears จากข้อมูลที่ได้รับ
          const years = [...new Set(response.projects.map(p => p.year))].sort((a, b) => b - a);
          if (years.length > 0) {
            setProjectYears(years);
          } else {
            // สร้าง default ย้อนหลัง 5 ปี
            const currentYear = new Date().getFullYear();
            setProjectYears(Array.from({length: 5}, (_, i) => currentYear - i));
          }
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(err.message || "ไม่สามารถโหลดข้อมูลโครงการได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [user, pagination.current, pagination.pageSize, filters]);

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
    
    // รีเซ็ต pagination เป็นหน้าแรก
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
  };

  // ค้นหาโปรเจค
  const handleSearch = (searchParams) => {
    console.log("ค้นหาด้วยพารามิเตอร์:", searchParams);
    setFilters((prev) => ({ ...prev, ...searchParams }));
    
    // รีเซ็ต pagination เป็นหน้าแรก
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
  };

  // รีเซ็ตตัวกรอง
  const handleReset = () => {
    setFilters({
      category: null,
      year: null,
      level: null,
      keyword: "",
    });
    
    // รีเซ็ต pagination เป็นหน้าแรก
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
  };

  // แก้ไขโปรเจค
  const handleEdit = (project) => {
    navigate(PROJECT.EDIT(project.id));
  };

  // ลบโปรเจค
  const handleDelete = async (project) => {
    if (!project || !project.id) return;
    
    setIsLoading(true);
    
    try {
      await deleteProject(project.id);
      
      // อัปเดตรายการโปรเจคหลังจากลบ
      setMyProjects(prev => prev.filter(p => p.id !== project.id));
      
      // อัปเดตจำนวนโปรเจคทั้งหมด
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1
      }));
    } catch (err) {
      console.error("Error deleting project:", err);
      setError(err.message || "ไม่สามารถลบโครงการได้");
    } finally {
      setIsLoading(false);
    }
  };

  // ไปยังหน้าอัปโหลดโปรเจค
  const handleAddProject = () => {
    navigate(PROJECT.UPLOAD.MAIN);
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

        {/* ใช้ ProjectFilter */}
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
          // ใช้ Work Components
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