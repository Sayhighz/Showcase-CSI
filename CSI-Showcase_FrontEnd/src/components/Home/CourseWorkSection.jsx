import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Typography, Space, Empty, Tag, Divider, Button, Tooltip, Avatar } from 'antd';
import { BulbOutlined, CalendarOutlined, EyeOutlined, LinkOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import ProjectDisplay from './ProjectDisplay';
import ScrollIndicator from './ScrollIndicator';
import LoadingSpinner from '../common/LoadingSpinner';
import Image3DEffect from './Image3DEffect';
import SectionHeader from './SectionHeader';
import SectionDivider from './SectionDivider';
import AnimatedText from './AnimatedText';
import { API_ENDPOINTS } from '../../constants';

const { Title, Text, Paragraph } = Typography;

// สัดส่วนของ A3 คือ 1:1.414 (297mm x 420mm)
const A3_RATIO = 1 / 1.414;

const CourseWorkSection = ({ 
  loading, 
  courseWorkProjects = [], 
  courseWorkPage = 1, 
  setCourseWorkPage = () => {},
  scrollToSection = () => {},
  competitionRef = { current: null }
}) => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Transform values based on scroll
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [100, 0, 0, -100]);
  
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
  const primaryColor = '#90278E';
  const secondaryColor = '#B252B0';

  // Calculate poster dimensions based on screen size
  const calculatePosterDimensions = () => {
    const baseHeight = window.innerWidth < 768 ? 350 : 650;
    return {
      height: baseHeight,
      width: baseHeight * A3_RATIO
    };
  };

  const posterDimensions = calculatePosterDimensions();

  // Function to render collaborators
  const renderCollaborators = (collaborators) => {
    if (!collaborators || collaborators.length === 0) return null;

    return (
      <div className="mb-4 sm:mb-6">
        <Divider orientation="left">
          <Text strong style={{ color: primaryColor, fontSize: '0.9rem' }}>
            <TeamOutlined className="mr-2" />
            ผู้ร่วมพัฒนา ({collaborators.length + 1} คน)
          </Text>
        </Divider>
        <div className="bg-purple-50 p-3 sm:p-4 rounded-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {collaborators.map((collaborator, index) => (
              <motion.div
                key={collaborator.userId}
                className="flex items-center space-x-3 bg-white p-2 sm:p-3 rounded-lg shadow-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {collaborator.image ? (
                  <img 
                    src={`${API_ENDPOINTS.BASE}/${collaborator.image}`} 
                    alt={collaborator.fullName}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-purple-300" 
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {collaborator.fullName.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Text className="text-sm sm:text-base font-medium block truncate">
                    {collaborator.fullName}
                  </Text>
                  <Text type="secondary" className="text-xs sm:text-sm">
                    @{collaborator.username}
                  </Text>
                </div>
                <Tag size="small" color="purple" className="text-xs">
                  {collaborator.role === 'contributor' ? 'ผู้ร่วมพัฒนา' : collaborator.role}
                </Tag>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section 
      ref={sectionRef}
      className="min-h-screen py-8 md:py-16 relative overflow-hidden flex flex-col items-center justify-center"
      style={{ 
        marginTop: `${window.innerHeight - 100}px`,
        background: 'linear-gradient(to bottom, #FFFFFF, #F5EAFF)',
        borderRadius: '40px 40px 0 0',
        boxShadow: '0 -20px 50px rgba(0,0,0,0.1)'
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
        {Array.from({ length: window.innerWidth < 768 ? 20 : 50 }).map((_, i) => (
          <motion.div
            key={`star-coursework-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              boxShadow: `0 0 ${Math.random() * 4 + 2}px rgba(144, 39, 142, 0.8)`
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-16">
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
              y
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
                  <div className="flex flex-col lg:flex-row gap-5 md:gap-10 bg-white bg-opacity-80 backdrop-filter backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl border border-purple-100">
                    
                    {/* Left Side - Project Image with 3D Effect */}
                    <div className="lg:w-1/2 flex justify-center">
                      <div className="relative">
                        {/* Project Level Badge - Floating on top left */}
                        <div className="absolute -top-3 -left-3 z-10">
                          <motion.div
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.5, type: "spring", stiffness: 260 }}
                            className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-2 sm:px-4 py-1 rounded-full shadow-lg text-xs sm:text-sm"
                          >
                            <Text className="font-bold text-white">{currentProject.level}</Text>
                          </motion.div>
                        </div>

                        <AnimatedText type="heading" delay={0.3}>
                          <Image3DEffect
                            className="overflow-hidden flex items-center justify-center shadow-2xl rounded-xl"
                            style={{
                              width: `${posterDimensions.width}px`,
                              height: `${posterDimensions.height}px`,
                              maxWidth: '100%',
                              maxHeight: window.innerWidth < 768 ? '300px' : 'auto'
                            }}
                            depth={15}
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
                                <BulbOutlined style={{ fontSize: window.innerWidth < 768 ? '40px' : '80px', marginBottom: '16px' }} />
                                <Text className="text-white text-sm sm:text-xl font-medium">รูปภาพโปรเจค</Text>
                              </div>
                            )}
                          </Image3DEffect>
                        </AnimatedText>
                      </div>
                    </div>
                    
                    {/* Right Side - Project Details with Card Design */}
                    <div className="lg:w-1/2 mt-4 lg:mt-0">
                      <div className="h-full flex flex-col">
                        {/* Project Title */}
                        <AnimatedText type="heading" delay={0.1}>
                          <div className="mb-4 sm:mb-6">
                            <Title 
                              level={2} 
                              className="text-xl sm:text-2xl md:text-3xl"
                              style={{ 
                                margin: 0, 
                                color: primaryColor,
                                fontWeight: 700,
                                lineHeight: 1.2,
                                backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                              }}
                            >
                              {currentProject.title}
                            </Title>
                          </div>
                        </AnimatedText>
                        
                        {/* Student Information */}
                        <AnimatedText type="badge" delay={0.2}>
                          <div className="flex items-center mb-4 sm:mb-6 bg-purple-50 p-3 sm:p-4 rounded-xl">
                            {currentProject.userImage ? (
                              <img 
                                src={`${API_ENDPOINTS.BASE}/${currentProject.userImage}`} 
                                alt={currentProject.student} 
                                className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-purple-500 mr-3 sm:mr-4"
                              />
                            ) : (
                              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-[#90278E] to-[#B252B0] flex items-center justify-center text-white text-xl font-bold mr-3 sm:mr-4">
                                <UserOutlined />
                              </div>
                            )}
                            <div>
                              <Text className="text-base sm:text-lg font-medium block">{currentProject.student}</Text>
                              {currentProject.username && (
                                <Text type="secondary" className="text-xs sm:text-sm">@{currentProject.username}</Text>
                              )}
                              <Tag size="small" color="blue" className="mt-1">
                                หัวหน้าโปรเจค
                              </Tag>
                            </div>
                          </div>
                        </AnimatedText>
                        
                        {/* Collaborators Section */}
                        <AnimatedText type="badge" delay={0.25}>
                          {renderCollaborators(currentProject.collaborators)}
                        </AnimatedText>
                        
                        {/* Project Description */}
                        <AnimatedText type="paragraph" delay={0.3}>
                          <div className="mb-4 sm:mb-6">
                            <Divider orientation="left">
                              <Text strong style={{ color: primaryColor, fontSize: '0.9rem', sm: '1.1rem' }}>
                                รายละเอียดโปรเจค
                              </Text>
                            </Divider>
                            <div className="bg-white bg-opacity-70 p-3 sm:p-5 rounded-xl border-l-4 border-purple-400">
                              <Paragraph 
                                className="text-sm sm:text-lg" 
                                style={{ 
                                  margin: 0,
                                  lineHeight: 1.8,
                                  textAlign: 'l' 
                                }}
                              >
                                {currentProject.description}
                              </Paragraph>
                            </div>
                          </div>
                        </AnimatedText>
                        
                        {/* Project Stats */}
                        <AnimatedText type="badge" delay={0.4}>
                          <div className="mb-4 sm:mb-6">
                            <Divider orientation="left">
                              <Text strong style={{ color: primaryColor, fontSize: '0.9rem', sm: '1.1rem' }}>
                                ข้อมูลโปรเจค
                              </Text>
                            </Divider>
                            <div className="grid grid-cols-3 gap-2 sm:gap-4">
                              <Tooltip title="ปีที่จัดทำ">
                                <div className="bg-white p-2 sm:p-3 rounded-lg shadow-md flex flex-col items-center space-y-1">
                                  <CalendarOutlined style={{ color: primaryColor, fontSize: '1rem', sm: '1.5rem' }} />
                                  <Text strong className="text-sm sm:text-lg">{currentProject.year}</Text>
                                  <Text type="secondary" className="text-xs">ปีที่จัดทำ</Text>
                                </div>
                              </Tooltip>
                              
                              <Tooltip title="จำนวนผู้เข้าชม">
                                <div className="bg-white p-2 sm:p-3 rounded-lg shadow-md flex flex-col items-center space-y-1">
                                  <EyeOutlined style={{ color: primaryColor, fontSize: '1rem', sm: '1.5rem' }} />
                                  <Text strong className="text-sm sm:text-lg">{currentProject.viewsCount}</Text>
                                  <Text type="secondary" className="text-xs">ผู้เข้าชม</Text>
                                </div>
                              </Tooltip>
                              
                              <Tooltip title="จำนวนสมาชิก">
                                <div className="bg-white p-2 sm:p-3 rounded-lg shadow-md flex flex-col items-center space-y-1">
                                  <TeamOutlined style={{ color: primaryColor, fontSize: '1rem', sm: '1.5rem' }} />
                                  <Text strong className="text-sm sm:text-lg">
                                    {(currentProject.collaborators?.length || 0) + 1}
                                  </Text>
                                  <Text type="secondary" className="text-xs">คน</Text>
                                </div>
                              </Tooltip>
                            </div>
                          </div>
                        </AnimatedText>
                        
                        {/* วันที่สร้าง */}
                        <AnimatedText type="badge" delay={0.5}>
                          <div className="mb-4 sm:mb-6">
                            <div className="flex justify-between items-center text-gray-500 text-xs sm:text-sm">
                              <Text>วันที่เผยแพร่: {new Date(currentProject.createdAt).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}</Text>
                              <Tag color={primaryColor} className="text-xs">ID: {currentProject.id}</Tag>
                            </div>
                          </div>
                        </AnimatedText>
                        
                        {/* Call to Action */}
                        <AnimatedText type="badge" delay={0.6}>
                          <div className="mt-auto pt-2 sm:pt-4">
                            <motion.div
                              whileHover={{ scale: 1.03, boxShadow: '0 10px 25px rgba(144, 39, 142, 0.3)' }}
                              whileTap={{ scale: 0.97 }}
                              className="flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-[#90278E] to-[#B252B0] p-3 sm:p-5 rounded-xl text-white overflow-hidden relative"
                            >
                              {/* Animated background particles */}
                              {[...Array(3)].map((_, i) => (
                                <motion.div
                                  key={i}
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
                              
                              <div className="z-10 mb-3 sm:mb-0 text-center sm:text-left">
                                <Text className="text-white text-base sm:text-xl font-bold block">สนใจโปรเจคนี้?</Text>
                                <Text className="text-white text-opacity-80 text-xs sm:text-base">ดูรายละเอียดเพิ่มเติมได้ที่นี่</Text>
                              </div>
                              <Button 
                                type="default" 
                                size="middle"
                                icon={<LinkOutlined />}
                                className="bg-white text-[#90278E] hover:bg-gray-100 border-none font-medium z-10 text-xs sm:text-sm"
                                href={currentProject.projectLink}
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
      >
      </motion.div>
      
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