import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Typography, Space, Empty, Button, Card, Avatar, Tag, Divider } from 'antd';
import { ReadOutlined, FireOutlined, FileTextOutlined, BookOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import ProjectDisplay from './ProjectDisplay';
import ScrollIndicator from './ScrollIndicator';
import LoadingSpinner from '../common/LoadingSpinner';
import Image3DEffect from './Image3DEffect';
import SectionHeader from './SectionHeader';
import SectionDivider from './SectionDivider';
import AnimatedText from './AnimatedText';
import { API_ENDPOINTS } from '../../constants';

const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

const AcademicSection = ({ 
  loading, 
  academicProjects, 
  academicPage, 
  setAcademicPage
}) => {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const { scrollYProgress: contentScrollProgress } = useScroll({
    target: contentRef,
    offset: ["start end", "end start"]
  });

  // Transform values based on scroll
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [100, 0, 0, -100]);
  
  // Content specific transforms
  const contentOpacity = useTransform(contentScrollProgress, [0, 0.3, 1], [0, 1, 1]);
  const contentScale = useTransform(contentScrollProgress, [0, 0.3, 1], [0.9, 1, 1]);
  const contentY = useTransform(contentScrollProgress, [0, 0.3, 1], [50, 0, 0]);

  const getCurrentProject = () => {
    if (academicProjects.length === 0) return null;
    
    if (academicPage > academicProjects.length) {
      setAcademicPage(1);
      return academicProjects[0];
    }
    
    return academicProjects[academicPage - 1];
  };

  const nextProject = () => {
    if (academicPage < academicProjects.length) {
      setAcademicPage(academicPage + 1);
    } else {
      setAcademicPage(1);
    }
  };

  const prevProject = () => {
    if (academicPage > 1) {
      setAcademicPage(academicPage - 1);
    } else {
      setAcademicPage(academicProjects.length);
    }
  };

  // Function to render collaborators for academic projects
  const renderCollaborators = (collaborators) => {
    if (!collaborators || collaborators.length === 0) return null;

    return (
      <div className="mt-6 mb-6">
        <Text strong className="text-lg mb-3 block" style={{ color: '#90278E' }}>
          <TeamOutlined className="mr-2" />
          ผู้ร่วมวิจัย ({collaborators.length + 1} คน)
        </Text>
        <div className="space-y-3">
          {collaborators.map((collaborator, index) => (
            <motion.div
              key={collaborator.userId}
              className="flex items-center space-x-3 bg-purple-50 p-3 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {collaborator.image ? (
                <img 
                  src={`${API_ENDPOINTS.BASE}/${collaborator.image}`} 
                  alt={collaborator.fullName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-purple-300" 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#90278E] flex items-center justify-center text-white font-bold">
                  {collaborator.fullName.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <Text className="font-medium block text-base truncate">
                  {collaborator.fullName}
                </Text>
                <Text type="secondary" className="text-sm">
                  @{collaborator.username}
                </Text>
              </div>
              <Tag color="purple" className="text-xs">
                {collaborator.role === 'contributor' ? 'ผู้ร่วมวิจัย' : collaborator.role}
              </Tag>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  // Sample research categories for display
  const researchCategories = [
    {
      icon: <TeamOutlined />,
      title: "การวิจัยเชิงสังคม",
      count: 12,
      color: "#8A2BE2"
    },
    {
      icon: <FileTextOutlined />,
      title: "การวิเคราะห์ข้อมูล",
      count: 18,
      color: "#9932CC"
    },
    {
      icon: <BookOutlined />,
      title: "งานวิจัยเชิงทฤษฎี",
      count: 7,
      color: "#800080"
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className="min-h-screen py-8 md:py-16 relative overflow-hidden flex flex-col items-center justify-center"
      style={{ 
        background: 'linear-gradient(to bottom, #E0D1FF, #90278E)'
      }}
    >
      {/* Section Divider at Top */}
      <SectionDivider 
        colorFrom="#E0D1FF" 
        colorTo="#90278E"
        className="absolute top-0 left-0 w-full"
        height={80}
      />

      {/* Animated Space Objects - Hide on small screens */}
      <div className="hidden md:block">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={`comet-${i}`}
            className="absolute opacity-20 rounded-full bg-white"
            style={{
              top: `${Math.random() * 80 + 10}%`,
              left: `-50px`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              boxShadow: `0 0 10px 4px rgba(255, 255, 255, 0.8)`
            }}
            animate={{
              x: [0, window.innerWidth + 100],
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-16">
        <SectionHeader
          icon={<ReadOutlined />}
          title="ผลงานวิชาการ"
          subtitle="ผลงานวิจัยและบทความวิชาการจากนักศึกษา CSI ที่ได้รับการตีพิมพ์และเผยแพร่ในวารสารและงานประชุมวิชาการต่างๆ"
          colorScheme="dark"
        />

        {loading ? (
          <div className="py-10 flex justify-center">
            <LoadingSpinner tip="กำลังโหลดผลงาน..." />
          </div>
        ) : academicProjects.length > 0 ? (
          <motion.div
            style={{
              opacity,
              scale,
              y
            }}
          >
            <ProjectDisplay
              currentProject={getCurrentProject()}
              currentPage={academicPage}
              totalProjects={academicProjects.length}
              onPageChange={setAcademicPage}
              onNext={nextProject}
              onPrev={prevProject}
              paginationClassName="academic-pagination"
              buttonColor="white"
            >
              {getCurrentProject() && (
                <div className="max-w-4xl mx-auto">
                  <AnimatedText type="heading" delay={0.1}>
                    <Image3DEffect
                      className="rounded-2xl overflow-hidden"
                      depth={1}
                      glareEnabled={true}
                    >
                      <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl">
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 sm:mb-6">
                          <div>
                            <Text className="text-[#90278E] font-bold mb-1">{getCurrentProject().level}</Text>
                            <Title level={2} className="mt-0 mb-2 sm:mb-4 text-xl sm:text-2xl md:text-3xl" style={{ marginTop: 0, marginBottom: '16px' }}>
                              {getCurrentProject().title}
                            </Title>
                            <div className="flex items-center space-x-3 mb-4">
                              {getCurrentProject().userImage ? (
                                <img 
                                  src={`${API_ENDPOINTS.BASE}/${getCurrentProject().userImage}`} 
                                  alt={getCurrentProject().student}
                                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" 
                                />
                              ) : (
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#90278E] flex items-center justify-center text-white">
                                  {getCurrentProject().student.charAt(0)}
                                </div>
                              )}
                              <div>
                                <Text className="font-medium block text-sm sm:text-base">{getCurrentProject().student}</Text>
                                <Text type="secondary" className="text-xs sm:text-sm">{getCurrentProject().username}</Text>
                                <Tag size="small" color="blue" className="mt-1">
                                  นักวิจัยหลัก
                                </Tag>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 mt-2 sm:mt-0 text-xs sm:text-sm">
                            <Text type="secondary">ปีที่เผยแพร่: {getCurrentProject().year || new Date(getCurrentProject().createdAt).getFullYear()}</Text>
                            <Text type="secondary">
                              <FireOutlined /> {getCurrentProject().viewsCount}
                            </Text>
                            {getCurrentProject().collaborators && getCurrentProject().collaborators.length > 0 && (
                              <Text type="secondary">
                                <TeamOutlined /> {getCurrentProject().collaborators.length + 1} คน
                              </Text>
                            )}
                          </div>
                        </div>

                        {/* Collaborators Section */}
                        {renderCollaborators(getCurrentProject().collaborators)}

                        <div className="my-4 sm:my-6 md:my-8 p-3 sm:p-4 md:p-6 bg-gray-50 rounded-xl">
                          <Title level={4} className="mt-0 text-lg sm:text-xl" style={{ marginTop: 0 }}>บทคัดย่อ</Title>
                          <Paragraph className="text-sm sm:text-base md:text-lg">
                            {getCurrentProject().description}
                          </Paragraph>
                        </div>

                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-between items-center pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-2 text-sm sm:text-base">
                            <ReadOutlined className="text-[#90278E] text-lg sm:text-xl" />
                            <Text>ประเภทเอกสาร: งานวิจัย</Text>
                          </div>
                          <Button 
                            type="primary" 
                            size="middle"
                            className="bg-[#90278E] hover:bg-[#B252B0] border-none w-full sm:w-auto"
                            href={getCurrentProject().projectLink}
                          >
                            อ่านฉบับเต็ม
                          </Button>
                        </div>

                        <div className="mt-6 sm:mt-8 md:mt-10 text-center">
                          <Title level={5} className="mb-2 sm:mb-4 text-base sm:text-lg" style={{ marginBottom: '16px' }}>แนะนำบทความเพิ่มเติมในหัวข้อที่เกี่ยวข้อง</Title>
                          <div className="flex flex-wrap justify-center gap-2">
                            <Button type="default" size="small" className="text-xs sm:text-sm">Machine Learning</Button>
                            <Button type="default" size="small" className="text-xs sm:text-sm">Data Science</Button>
                            <Button type="default" size="small" className="text-xs sm:text-sm">อาคารอัจฉริยะ</Button>
                            <Button type="default" size="small" className="text-xs sm:text-sm">การวิเคราะห์พลังงาน</Button>
                          </div>
                        </div>
                      </div>
                    </Image3DEffect>
                  </AnimatedText>
                </div>
              )}
            </ProjectDisplay>
          </motion.div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span className="text-white">ไม่พบผลงานในหมวดหมู่นี้</span>}
          />
        )}
      </div>
      
      {/* Scroll to top */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
      </motion.div>

      {/* Custom CSS for this section */}
      <style jsx>{`        
        .academic-pagination .ant-pagination-item {
          background-color: rgba(255, 255, 255, 0.8);
        }
        
        .academic-pagination .ant-pagination-item-active {
          background-color: #90278E;
          border-color: #90278E;
        }
        
        .academic-pagination .ant-pagination-item-active a {
          color: white;
        }
        
        /* Responsive styles */
        @media (max-width: 768px) {
          .academic-pagination .ant-pagination-item {
            margin: 0 2px;
            min-width: 28px;
            height: 28px;
            line-height: 26px;
          }
        }
        
        @media (max-width: 480px) {
          .academic-pagination {
            display: flex;
            justify-content: center;
          }
          
          .academic-pagination .ant-pagination-item {
            margin: 0 1px;
            min-width: 24px;
            height: 24px;
            line-height: 22px;
          }
        }
      `}</style>
    </section>
  );
};

export default AcademicSection;