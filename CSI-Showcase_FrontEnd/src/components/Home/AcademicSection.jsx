import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Typography, Space, Empty, Button, Card, Avatar } from 'antd';
import { ReadOutlined, FireOutlined, FileTextOutlined, BookOutlined, TeamOutlined } from '@ant-design/icons';
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
      className="min-h-screen py-16 relative overflow-hidden flex flex-col items-center justify-center"
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

      {/* Animated Space Objects */}
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

      <div className="container mx-auto px-6 py-16">
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
                      <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm p-8 rounded-2xl">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <Text className="text-[#90278E] font-bold mb-1">{getCurrentProject().level}</Text>
                            <Title level={2} style={{ marginTop: 0, marginBottom: '16px' }}>{getCurrentProject().title}</Title>
                            <div className="flex items-center space-x-3 mb-4">
                              {getCurrentProject().userImage ? (
                                <img 
                                  src={`${API_ENDPOINTS.BASE}/${getCurrentProject().userImage}`} 
                                  alt={getCurrentProject().student}
                                  className="w-10 h-10 rounded-full object-cover" 
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-[#90278E] flex items-center justify-center text-white">
                                  {getCurrentProject().student.charAt(0)}
                                </div>
                              )}
                              <div>
                                <Text className="font-medium block">{getCurrentProject().student}</Text>
                                <Text type="secondary" className="text-sm">{getCurrentProject().username}</Text>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Text type="secondary">ปีที่เผยแพร่: {getCurrentProject().year || new Date(getCurrentProject().createdAt).getFullYear()}</Text>
                            <Text type="secondary">
                              <FireOutlined /> {getCurrentProject().viewsCount}
                            </Text>
                          </div>
                        </div>

                        <div className="my-8 p-6 bg-gray-50 rounded-xl">
                          <Title level={4} style={{ marginTop: 0 }}>บทคัดย่อ</Title>
                          <Paragraph className="text-lg">
                            {getCurrentProject().description}
                          </Paragraph>
                        </div>

                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-between items-center pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-2">
                            <ReadOutlined className="text-[#90278E] text-xl" />
                            <Text>ประเภทเอกสาร: งานวิจัย</Text>
                          </div>
                          <Button 
                            type="primary" 
                            size="large"
                            className="bg-[#90278E] hover:bg-[#B252B0] border-none"
                            href={getCurrentProject().projectLink}
                          >
                            อ่านฉบับเต็ม
                          </Button>
                        </div>

                        <div className="mt-10 text-center">
                          <Title level={5} style={{ marginBottom: '16px' }}>แนะนำบทความเพิ่มเติมในหัวข้อที่เกี่ยวข้อง</Title>
                          <div className="flex flex-wrap justify-center gap-2">
                            <Button type="default">Machine Learning</Button>
                            <Button type="default">Data Science</Button>
                            <Button type="default">อาคารอัจฉริยะ</Button>
                            <Button type="default">การวิเคราะห์พลังงาน</Button>
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
      `}</style>
    </section>
  );
};

export default AcademicSection;