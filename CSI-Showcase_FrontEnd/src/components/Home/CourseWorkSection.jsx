import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom"; // เพิ่ม import navigate
import {
  Typography,
  Space,
  Empty,
  Tag,
  Divider,
  Button,
  Tooltip,
  Avatar,
} from "antd";
import {
  BulbOutlined,
  CalendarOutlined,
  EyeOutlined,
  LinkOutlined,
  UserOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import ProjectDisplay from "./ProjectDisplay";
import ScrollIndicator from "./ScrollIndicator";
import LoadingSpinner from "../common/LoadingSpinner";
import Image3DEffect from "./Image3DEffect";
import SectionHeader from "./SectionHeader";
import SectionDivider from "./SectionDivider";
import he from "he";
import AnimatedText from "./AnimatedText";
import { API_ENDPOINTS } from "../../constants";

const { Title, Text, Paragraph } = Typography;

// สัดส่วนของ A3 คือ 1:1.414 (297mm x 420mm)
const A3_RATIO = 1 / 1.414;

const CourseWorkSection = ({
  loading,
  courseWorkProjects = [],
  courseWorkPage = 1,
  setCourseWorkPage = () => {},
  scrollToSection = () => {},
  competitionRef = { current: null },
}) => {
  const sectionRef = useRef(null);
  const navigate = useNavigate(); // เพิ่ม navigate hook

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Transform values based on scroll
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.8, 1, 1, 0.8]
  );
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [100, 0, 0, -100]);

  // Function สำหรับจัดการ navigation
  const handleViewProject = (projectLink) => {
    if (!projectLink) {
      console.warn('Project link is missing');
      return;
    }
    
    try {
      // แก้ไข URL ให้มี base path
      let correctedPath = projectLink;
      
      // ถ้า URL เป็น absolute URL ให้แปลงเป็น path
      if (projectLink.includes('sitspu.com')) {
        const url = new URL(projectLink);
        correctedPath = url.pathname;
      }
      
      
      // Navigate ไปยัง path ที่ถูกต้อง
      navigate(correctedPath);
      
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const getCurrentProject = () => {
    if (!courseWorkProjects || courseWorkProjects.length === 0) return null;

    if (courseWorkPage > courseWorkProjects.length) {
      setCourseWorkPage(1);
      return courseWorkProjects[0];
    }

    return courseWorkProjects[courseWorkPage - 1];
  };

  const nextProject = () => {
    if (!courseWorkProjects || courseWorkProjects.length === 0) return;

    if (courseWorkPage < courseWorkProjects.length) {
      setCourseWorkPage(courseWorkPage + 1);
    } else {
      setCourseWorkPage(1);
    }
  };

  const prevProject = () => {
    if (!courseWorkProjects || courseWorkProjects.length === 0) return;

    if (courseWorkPage > 1) {
      setCourseWorkPage(courseWorkPage - 1);
    } else {
      setCourseWorkPage(courseWorkProjects.length);
    }
  };

  const currentProject = getCurrentProject();

  // Custom theme colors
  const primaryColor = "#90278E";
  const secondaryColor = "#B252B0";

  // Function to render team members
  const renderTeamMembers = (currentProject) => {
    const allMembers = [
      {
        userId: currentProject.userId,
        fullName: currentProject.student,
        username: currentProject.username,
        image: currentProject.userImage,
      },
      ...(currentProject.collaborators || []),
    ];

    return (
      <div className="mb-3 sm:mb-4">
        <Text className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">
          ผู้จัดทำ
        </Text>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {allMembers.map((member, index) => (
            <motion.div
            key={`coursework-member-${member.userId}-${index}`}
              className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              {member.image ? (
                <img
                  src={`${API_ENDPOINTS.BASE}/${member.image}`}
                  alt={member.fullName}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-400 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">
                  {member.fullName.charAt(0)}
                </div>
              )}
              <Text className="text-xs sm:text-sm">{member.fullName}</Text>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section
      ref={sectionRef}
      className="min-h-screen py-6 sm:py-8 md:py-16 relative overflow-hidden flex flex-col items-center justify-center"
      style={{
        marginTop: `${window.innerHeight - 100}px`,
        background: "linear-gradient(to bottom, #FFFFFF, #F5EAFF)",
        borderRadius: "40px 40px 0 0",
        boxShadow: "0 -20px 50px rgba(0,0,0,0.1)",
      }}
    >
      {/* Section Divider at Top */}
      <SectionDivider
        colorFrom="#FFFFFF"
        colorTo="#F5EAFF"
        className="absolute top-0 left-0 w-full"
        height={80}
      />

      {/* Animated StarField Background - Reduced on mobile */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: window.innerWidth < 768 ? 15 : 50 }).map(
          (_, i) => (
            <motion.div
              key={`star-coursework-section-${i}`}
              className="absolute rounded-full bg-white"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                boxShadow: `0 0 ${
                  Math.random() * 4 + 2
                }px rgba(144, 39, 142, 0.8)`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )
        )}
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-16">
        <SectionHeader
          icon={<BulbOutlined />}
          title="ผลงานวิชาเรียน"
          subtitle="ผลงานที่เป็นส่วนหนึ่งของรายวิชาในหลักสูตร CSI มีทั้งโปรเจคเดี่ยวและโปรเจคกลุ่มที่นักศึกษาได้สร้างสรรค์ขึ้น"
          colorScheme="light"
        />

        {loading ? (
          <div className="py-10 flex justify-center">
            <LoadingSpinner tip="กำลังโหลดผลงาน..." />
          </div>
        ) : !courseWorkProjects || courseWorkProjects.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="ไม่พบผลงานในหมวดหมู่นี้"
          />
        ) : (
          <motion.div
            style={{
              opacity,
              scale,
              y,
            }}
          >
            <ProjectDisplay
              currentProject={currentProject}
              currentPage={courseWorkPage}
              totalProjects={courseWorkProjects.length}
              onPageChange={setCourseWorkPage}
              onNext={nextProject}
              onPrev={prevProject}
            >
              {currentProject && (
                <div className="max-w-6xl mx-auto">
                  {/* Enhanced Project Display Layout with Glass Effect */}
                  <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-10 bg-white bg-opacity-80 backdrop-filter backdrop-blur-md p-3 sm:p-4 md:p-8 rounded-2xl shadow-xl border border-purple-100">
                    {/* Left Side - Project Image with 3D Effect */}
                    <div className="lg:w-1/2 flex justify-center items-center p-2 sm:p-4">
                      <div className="relative w-full max-w-[350px] sm:max-w-[400px] lg:max-w-[450px]">
                        {/* Project Level Badge */}
                        <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 z-10">
                          <motion.div
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              delay: 0.5,
                              type: "spring",
                              stiffness: 260,
                            }}
                            className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 rounded-full shadow-lg text-[10px] sm:text-xs md:text-sm"
                          >
                            <Text className="font-bold text-white">
                              {currentProject.level}
                            </Text>
                          </motion.div>
                        </div>

                        <AnimatedText type="heading" delay={0.3}>
                          <div className="relative w-full overflow-hidden rounded-xl shadow-2xl bg-gray-50">
                            <Image3DEffect
                              className="absolute inset-0 w-full h-full"
                              depth={window.innerWidth < 768 ? 10 : 15}
                              glareEnabled={true}
                              glareOpacity={0.3}
                            >
                              {currentProject.image ? (
                                <img
                                  alt={currentProject.title}
                                  src={`${API_ENDPOINTS.BASE}/${currentProject.image}`}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-b from-[#90278E] to-[#B252B0] text-white">
                                  <BulbOutlined
                                    style={{
                                      fontSize:
                                        window.innerWidth < 768
                                          ? "40px"
                                          : "60px",
                                      marginBottom: "16px",
                                    }}
                                  />
                                  <Text className="text-white text-sm sm:text-xl font-medium">
                                    รูปภาพโปรเจค
                                  </Text>
                                </div>
                              )}
                            </Image3DEffect>
                          </div>
                        </AnimatedText>
                      </div>
                    </div>

                    {/* Right Side - Project Details with Card Design */}
                    <div className="lg:w-1/2 mt-4 lg:mt-0">
                      <div className="h-full flex flex-col">
                        {/* Project Title */}
                        <AnimatedText type="heading" delay={0.1}>
                          <div className="mb-3 sm:mb-4 md:mb-6">
                            <Title
                              level={2}
                              className="text-lg sm:text-xl md:text-2xl lg:text-3xl"
                              style={{
                                margin: 0,
                                color: primaryColor,
                                fontWeight: 700,
                                lineHeight: 1.2,
                                backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                              }}
                            >
                              {currentProject.title}
                            </Title>
                          </div>
                        </AnimatedText>

                        {/* Team Members Section */}
                        <AnimatedText type="badge" delay={0.2}>
                          {renderTeamMembers(currentProject)}
                        </AnimatedText>

                        {/* Project Description */}
                        <AnimatedText type="paragraph" delay={0.3}>
                          <div className="mb-3 sm:mb-4">
                            <Text className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">
                              รายละเอียด
                            </Text>
                            <Paragraph
                              className="text-xs sm:text-sm md:text-base text-gray-700"
                              style={{
                                margin: 0,
                                lineHeight: 1.5,
                              }}
                            >
                              {he.decode(currentProject.description)}
                            </Paragraph>
                          </div>
                        </AnimatedText>

                        {/* Project Stats */}
                        <AnimatedText type="badge" delay={0.4}>
                          <div className="mb-3 sm:mb-4">
                            <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm">
                              <div className="flex items-center gap-1 text-gray-600">
                                <CalendarOutlined className="text-xs sm:text-sm" />
                                <span>{currentProject.year}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600">
                                <EyeOutlined className="text-xs sm:text-sm" />
                                <span>{currentProject.viewsCount} views</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600">
                                <TeamOutlined className="text-xs sm:text-sm" />
                                <span>
                                  {(currentProject.collaborators?.length || 0) +
                                    1}{" "}
                                  คน
                                </span>
                              </div>
                            </div>
                          </div>
                        </AnimatedText>

                        {/* วันที่สร้าง */}
                        <AnimatedText type="badge" delay={0.5}>
                          <div className="mb-3 sm:mb-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 text-gray-500 text-[10px] sm:text-xs">
                              <Text>
                                วันที่เผยแพร่:{" "}
                                {new Date(
                                  currentProject.createdAt
                                ).toLocaleDateString("th-TH", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </Text>
                              <Tag
                                color={primaryColor}
                                className="text-[10px] sm:text-xs"
                              >
                                ID: {currentProject.id}
                              </Tag>
                            </div>
                          </div>
                        </AnimatedText>

                        {/* Call to Action */}
                        <AnimatedText type="badge" delay={0.6}>
                          <div className="mt-auto pt-2 sm:pt-4">
                            <motion.div
                              whileHover={{
                                scale: 1.03,
                                boxShadow:
                                  "0 10px 25px rgba(144, 39, 142, 0.3)",
                              }}
                              whileTap={{ scale: 0.97 }}
                              className="flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-[#90278E] to-[#B252B0] p-3 sm:p-4 md:p-5 rounded-xl text-white overflow-hidden relative"
                            >
                              {/* Animated background particles */}
                              {[...Array(3)].map((_, i) => (
                                <motion.div
                                  key={`cta-particle-coursework-${
                                    currentProject?.id || "default"
                                  }-${i}`}
                                  className="absolute bg-white rounded-full opacity-10"
                                  style={{
                                    width: `${Math.random() * 80 + 20}px`,
                                    height: `${Math.random() * 80 + 20}px`,
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                  }}
                                  animate={{
                                    x: [0, Math.random() * 50 - 25],
                                    y: [0, Math.random() * 50 - 25],
                                  }}
                                  transition={{
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    duration: Math.random() * 5 + 5,
                                  }}
                                />
                              ))}

                              <div className="z-10 mb-2 sm:mb-0 text-center sm:text-left">
                                <Text className="text-white text-sm sm:text-base md:text-xl font-bold block">
                                  สนใจโปรเจคนี้?
                                </Text>
                                <Text className="text-white text-opacity-80 text-[10px] sm:text-xs md:text-base">
                                  ดูรายละเอียดเพิ่มเติมได้ที่นี่
                                </Text>
                              </div>
                              {/* เปลี่ยนจาก href เป็น onClick */}
                              <Button
                                type="default"
                                size="small"
                                icon={<LinkOutlined />}
                                className="bg-white text-[#90278E] hover:bg-gray-100 border-none font-medium z-10 text-[10px] sm:text-xs md:text-sm px-3 sm:px-4"
                                onClick={() => handleViewProject(currentProject.projectLink)}
                              >
                                ดูโปรเจคเต็มรูปแบบ
                              </Button>
                            </motion.div>
                          </div>
                        </AnimatedText>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </ProjectDisplay>
          </motion.div>
        )}
      </div>

      {/* Scroll to next section with animated button */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      ></motion.div>

      {/* Section Divider at Bottom */}
      <SectionDivider
        colorFrom="#F5EAFF"
        colorTo="#E0D1FF"
        className="absolute bottom-0 left-0 w-full"
        height={60}
      />
    </section>
  );
};

export default CourseWorkSection;