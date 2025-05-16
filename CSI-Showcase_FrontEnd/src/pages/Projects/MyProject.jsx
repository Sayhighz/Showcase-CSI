import React, { useState, useMemo, useCallback } from "react";
import { Button, Typography, Empty, Card, Statistic, Row, Col } from "antd";
import {
  PlusOutlined,
  ProjectOutlined,
  AppstoreOutlined,
  BookOutlined,
  TrophyOutlined,
  HomeOutlined,
  RightOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// นำเข้า hooks ที่สร้างไว้
import useAuth from "../../hooks/useAuth";
import useProject from "../../hooks/useProject";

// นำเข้า components
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import ProjectFilter from "../../components/Project/ProjectFilter";
import WorkGrid from "../../components/Work/WorkGrid";

// นำเข้า constants
import { PROJECT, HOME } from "../../constants/routes";
import { PROJECT_TYPE } from "../../constants/projectTypes";

const { Title, Text } = Typography;

// CSS Variables สำหรับสีหลักตามธีม - ย้ายออกมานอก component เพื่อหลีกเลี่ยงการสร้างใหม่ทุกรอบ
const themeColors = {
  primary: '#90278E',        // สีม่วงเข้ม
  secondary: '#B252B0',      // สีม่วงอ่อน
  dark: '#5E1A5C',           // สีม่วงเข้มมาก
  lightPurple: '#F5EAFF',    // สีม่วงอ่อนมาก (background)
  mediumPurple: '#E0D1FF',   // สีม่วงกลาง
  textLight: '#FFE6FF',      // สีตัวอักษรบนพื้นเข้ม
  textSecondary: '#F8CDFF'   // สีตัวอักษรรอง
};

// กำหนด styles สำหรับ gradient text
const headingGradient = {
  background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'inline-block'
};

// Animation variants - ย้ายออกมาเพื่อหลีกเลี่ยงการสร้างใหม่ทุกรอบ
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const MyProject = () => {
  // ใช้ custom hook useAuth
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  
  // ใช้ navigate
  const navigate = useNavigate();

  // ใช้ useState สำหรับ local filters แทนที่จะใช้จาก useProject โดยตรง
  // เพื่อหลีกเลี่ยงการ update state ซ้อนกัน
  const [localFilters, setLocalFilters] = useState({
    category: null,
    year: null,
    level: null,
    keyword: "",
  });

  // ใช้ custom hook useProject โดยส่ง dependencies น้อยที่สุด
  const {
    projects: myProjects,
    isLoading,
    error,
    pagination,
    deleteProject: removeProject,
    fetchMyProjects,
    projectTypes,
    projectYears,
    studyYears,
    changePage
  } = useProject();

  // จัดการกับการเปลี่ยนแปลงตัวกรอง - แก้ให้ใช้ setState ท้องถิ่นเท่านั้น
  const handleFilterChange = useCallback((newFilters) => {
    setLocalFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // ค้นหาโปรเจค - แก้ให้ใช้ setState ท้องถิ่นเท่านั้น
  const handleSearch = useCallback((searchParams) => {
    setLocalFilters(prev => ({ ...prev, ...searchParams }));
  }, []);

  // รีเซ็ตตัวกรอง - แก้ให้ใช้ setState ท้องถิ่นเท่านั้น
  const handleReset = useCallback(() => {
    setLocalFilters({
      category: null,
      year: null,
      level: null,
      keyword: "",
    });
  }, []);

  // ใช้ useEffect ด้วย dependencies ที่ถูกต้อง
  React.useEffect(() => {
    if (user && user.id) {
      // ส่ง localFilters เป็น parameters แทนที่จะใช้ filters จาก hook
      fetchMyProjects(user.id, {
        ...localFilters,
        page: pagination.current,
        limit: pagination.pageSize
      });
    }
  }, [user, fetchMyProjects, localFilters, pagination.current, pagination.pageSize]);

  // ใช้ useMemo สำหรับคำนวณข้อมูลที่อาจซับซ้อน
  const filteredProjects = useMemo(() => {
    if (!myProjects || myProjects.length === 0) return [];
    
    return myProjects.filter(
      (project) =>
        (localFilters.category === null ||
          localFilters.category === undefined ||
          project.category === localFilters.category ||
          project.type === localFilters.category) &&
        (localFilters.year === null ||
          localFilters.year === undefined ||
          project.year?.toString() === localFilters.year?.toString()) &&
        (localFilters.level === null ||
          localFilters.level === undefined ||
          project.level === localFilters.level) &&
        (localFilters.keyword === "" ||
          project.title?.toLowerCase().includes(localFilters.keyword.toLowerCase()) ||
          project.description
            ?.toLowerCase()
            .includes(localFilters.keyword.toLowerCase()))
    );
  }, [myProjects, localFilters]);

  // แยกโปรเจคตามประเภทสำหรับสถิติ - ใช้ useMemo
  const projectStats = useMemo(() => {
    if (!myProjects || myProjects.length === 0) {
      return {
        academicProjects: [],
        courseworkProjects: [],
        competitionProjects: []
      };
    }
    
    const academicProjects = myProjects.filter(
      (project) => project.category === PROJECT_TYPE.ACADEMIC
    );
    const courseworkProjects = myProjects.filter(
      (project) => project.category === PROJECT_TYPE.COURSEWORK
    );
    const competitionProjects = myProjects.filter(
      (project) => project.category === PROJECT_TYPE.COMPETITION
    );
    
    return {
      academicProjects,
      courseworkProjects,
      competitionProjects
    };
  }, [myProjects]);

  // แก้ไขโปรเจค
  const handleEdit = useCallback((project) => {
    navigate(PROJECT.EDIT(project.id));
  }, [navigate]);

  // ลบโปรเจค - ใช้ deleteProject จาก hook
  const handleDelete = useCallback(async (project) => {
    if (!project || !project.id) return;
    await removeProject(project.id);
  }, [removeProject]);

  // ไปยังหน้าอัปโหลดโปรเจค
  const handleAddProject = useCallback(() => {
    navigate(PROJECT.UPLOAD.MAIN);
  }, [navigate]);

  // กรณียังไม่ได้เข้าสู่ระบบ
  if (!isAuthenticated && !isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 bg-gradient-to-b from-[#F5EAFF] to-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-xl shadow-lg border border-[rgba(144,39,142,0.1)] backdrop-filter backdrop-blur-sm bg-opacity-80 max-w-md w-full text-center"
        >
          <Empty
            description={
              <span style={{ color: themeColors.dark, fontSize: '16px' }}>
                กรุณาเข้าสู่ระบบเพื่อดูผลงานของคุณ
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            imageStyle={{ height: 80 }}
          />
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="mt-6"
          >
            <Button
              type="primary"
              onClick={() => navigate("/login")}
              className="mt-4 rounded-full shadow-md h-10 px-6"
              style={{ 
                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                border: 'none',
                boxShadow: '0 4px 12px rgba(144, 39, 142, 0.2)'
              }}
            >
              เข้าสู่ระบบ
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // สร้าง components เป็นแบบ pure function เพื่อหลีกเลี่ยงการ re-render
  function StatCards() {
    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <motion.div variants={itemVariants}>
            <Card 
              hoverable 
              className="text-center overflow-hidden"
              style={{ 
                borderRadius: '12px', 
                boxShadow: '0 4px 12px rgba(144, 39, 142, 0.08)',
                border: '1px solid rgba(144, 39, 142, 0.1)'
              }}
            >
              <div className="relative">
                <Statistic
                  title={<span style={{ fontSize: '1rem', color: themeColors.dark }}>ผลงานทั้งหมด</span>}
                  value={myProjects.length}
                  prefix={<AppstoreOutlined style={{ color: themeColors.primary }} />}
                  valueStyle={{ color: themeColors.primary, fontWeight: 'bold' }}
                />
                <div 
                  className="absolute -bottom-10 -right-10 rounded-full opacity-10 w-32 h-32" 
                  style={{ background: `radial-gradient(circle, ${themeColors.primary} 0%, rgba(144,39,142,0) 70%)` }}
                />
              </div>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <motion.div variants={itemVariants}>
            <Card 
              hoverable 
              className="text-center overflow-hidden"
              style={{ 
                borderRadius: '12px', 
                boxShadow: '0 4px 12px rgba(144, 39, 142, 0.08)',
                border: '1px solid rgba(144, 39, 142, 0.1)'
              }}
            >
              <div className="relative">
                <Statistic
                  title={<span style={{ fontSize: '1rem', color: themeColors.dark }}>บทความวิชาการ</span>}
                  value={projectStats.academicProjects.length}
                  prefix={<BookOutlined style={{ color: '#3D7FF7' }} />}
                  valueStyle={{ color: '#3D7FF7', fontWeight: 'bold' }}
                />
                <div 
                  className="absolute -bottom-10 -right-10 rounded-full opacity-10 w-32 h-32" 
                  style={{ background: 'radial-gradient(circle, #3D7FF7 0%, rgba(61,127,247,0) 70%)' }}
                />
              </div>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <motion.div variants={itemVariants}>
            <Card 
              hoverable 
              className="text-center overflow-hidden"
              style={{ 
                borderRadius: '12px', 
                boxShadow: '0 4px 12px rgba(144, 39, 142, 0.08)',
                border: '1px solid rgba(144, 39, 142, 0.1)'
              }}
            >
              <div className="relative">
                <Statistic
                  title={<span style={{ fontSize: '1rem', color: themeColors.dark }}>งานในชั้นเรียน</span>}
                  value={projectStats.courseworkProjects.length}
                  prefix={<AppstoreOutlined style={{ color: '#52C41A' }} />}
                  valueStyle={{ color: '#52C41A', fontWeight: 'bold' }}
                />
                <div 
                  className="absolute -bottom-10 -right-10 rounded-full opacity-10 w-32 h-32" 
                  style={{ background: 'radial-gradient(circle, #52C41A 0%, rgba(82,196,26,0) 70%)' }}
                />
              </div>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <motion.div variants={itemVariants}>
            <Card 
              hoverable 
              className="text-center overflow-hidden"
              style={{ 
                borderRadius: '12px', 
                boxShadow: '0 4px 12px rgba(144, 39, 142, 0.08)',
                border: '1px solid rgba(144, 39, 142, 0.1)'
              }}
            >
              <div className="relative">
                <Statistic
                  title={<span style={{ fontSize: '1rem', color: themeColors.dark }}>การแข่งขัน</span>}
                  value={projectStats.competitionProjects.length}
                  prefix={<TrophyOutlined style={{ color: '#FAAD14' }} />}
                  valueStyle={{ color: '#FAAD14', fontWeight: 'bold' }}
                />
                <div 
                  className="absolute -bottom-10 -right-10 rounded-full opacity-10 w-32 h-32" 
                  style={{ background: 'radial-gradient(circle, #FAAD14 0%, rgba(250,173,20,0) 70%)' }}
                />
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>
    );
  }

  // แยกส่วนต่างๆ เป็น Pure Function Components เพื่อหลีกเลี่ยง re-renders
  function BreadcrumbNav() {
    return (
      <div className="mb-4">
        <motion.div whileHover={{ scale: 1.02 }} className="inline-block">
          <div
            className="text-gray-500 hover:text-[#90278E] cursor-pointer flex items-center"
            onClick={() => navigate(HOME)}
          >
            <HomeOutlined className="mr-1" /> หน้าหลัก
          </div>
        </motion.div>
        <span className="mx-2 text-gray-400"><RightOutlined style={{ fontSize: '10px' }}/></span>
        <span style={{ color: themeColors.primary }}>ผลงานของฉัน</span>
      </div>
    );
  }

  function PageHeader() {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div className="mb-4 sm:mb-0 text-center sm:text-left">
          <Title
            level={2}
            className="flex items-center gap-2 mb-1"
            style={headingGradient}
          >
            <ProjectOutlined className="mr-2" />
            ผลงานของฉัน
          </Title>

          <Text type="secondary" className="text-lg">
            เรียกดูและจัดการผลงานทั้งหมดของคุณในที่เดียว
          </Text>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddProject}
            size="large"
            className="rounded-full shadow-md"
            style={{ 
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
              border: 'none',
              boxShadow: '0 4px 12px rgba(144, 39, 142, 0.25)'
            }}
          >
            เพิ่มผลงานใหม่
          </Button>
        </motion.div>
      </div>
    );
  }

  function ContentDisplay() {
    if (isLoading) {
      return (
        <div 
          style={{ 
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            border: '1px solid rgba(144, 39, 142, 0.1)',
            boxShadow: '0 8px 32px rgba(144, 39, 142, 0.08)'
          }}
          className="p-8"
        >
          <LoadingSpinner tip="กำลังโหลดผลงานของคุณ..." />
        </div>
      );
    }

    if (error) {
      return (
        <div 
          style={{ 
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            border: '1px solid rgba(144, 39, 142, 0.1)',
            boxShadow: '0 8px 32px rgba(144, 39, 142, 0.08)'
          }}
          className="p-8"
        >
          <ErrorMessage
            title="เกิดข้อผิดพลาด"
            message={error}
            showBackButton={false}
            showReloadButton={true}
          />
        </div>
      );
    }

    if (filteredProjects.length === 0) {
      return (
        <div 
          style={{ 
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            border: '1px solid rgba(144, 39, 142, 0.1)',
            boxShadow: '0 8px 32px rgba(144, 39, 142, 0.08)'
          }}
          className="p-8"
        >
          <Empty
            description={
              <span style={{ color: themeColors.dark }}>
                ยังไม่มีผลงานในประเภทที่คุณเลือก
              </span>
            }
            className="py-8"
          />
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="mt-6 flex justify-center"
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddProject}
              className="rounded-full shadow-md h-10 px-6"
              style={{ 
                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                border: 'none',
                boxShadow: '0 4px 12px rgba(144, 39, 142, 0.2)'
              }}
            >
              เพิ่มผลงานใหม่
            </Button>
          </motion.div>
        </div>
      );
    }

    return (
      <WorkGrid
        title=""
        items={filteredProjects}
        displayMode="row"
        side="center"
        showActions={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  }

  function EmptyProjectsView() {
    if (!isLoading && !error && myProjects.length === 0) {
      return (
        <motion.div 
          style={{ 
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            border: '1px solid rgba(144, 39, 142, 0.1)',
            boxShadow: '0 8px 32px rgba(144, 39, 142, 0.08)'
          }}
          className="p-8 text-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="space-y-2">
                <Text strong className="block text-lg" style={{ color: themeColors.dark }}>
                  คุณยังไม่มีผลงานในระบบ
                </Text>
                <Text type="secondary">
                  เริ่มสร้างผลงานแรกของคุณเพื่อจัดเก็บและแชร์ให้ผู้อื่นได้ชม
                </Text>
              </div>
            }
          />
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="mt-6"
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddProject}
              className="rounded-full shadow-md h-10 px-6"
              style={{ 
                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                border: 'none',
                boxShadow: '0 4px 12px rgba(144, 39, 142, 0.2)'
              }}
            >
              เพิ่มผลงานใหม่
            </Button>
          </motion.div>
        </motion.div>
      );
    }
    return null;
  }

  // style ที่ใช้ตั้งแต่แรกไม่เปลี่ยนแปลง
  const globalStyle = `
    .ant-statistic-content {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .ant-statistic-content-value {
      font-size: 2rem !important;
      line-height: 1.2;
    }
    
    .ant-statistic-content-prefix {
      margin-right: 8px;
      font-size: 1.5rem !important;
    }
    
    .ant-card-hoverable:hover {
      box-shadow: 0 8px 24px rgba(144, 39, 142, 0.15) !important;
      transform: translateY(-4px);
      transition: all 0.3s ease;
    }
    
    .ant-empty-image {
      height: 100px !important;
    }
    
    .ant-spin-dot i {
      background-color: ${themeColors.primary} !important;
    }
    
    .ant-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 15px rgba(144, 39, 142, 0.3);
    }
  `;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ 
      background: 'linear-gradient(to bottom, rgba(245, 234, 255, 0.5), rgba(255, 255, 255, 1))' 
    }}>
      <div className="max-w-7xl mx-auto">
        {/* หัวข้อ */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Breadcrumb */}
          <BreadcrumbNav />

          {/* Header */}
          <PageHeader />
        </motion.div>

        {/* สถิติโปรเจค */}
        <motion.div 
          className="mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <StatCards />
        </motion.div>

        {/* ใช้ ProjectFilter */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ProjectFilter
            projectTypes={projectTypes}
            projectYears={projectYears}
            studyYears={studyYears}
            initialValues={localFilters} // ใช้ localFilters แทน filters
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            onReset={handleReset}
            loading={isLoading}
            showSearch={true}
            layout="horizontal"
          />
        </motion.div>

        {/* แสดงผลงาน */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <ContentDisplay />
          <EmptyProjectsView />
        </motion.div>
      </div>
      
      {/* CSS Overrides แบบ static tag */}
      <style>{globalStyle}</style>
    </div>
  );
};

export default MyProject;