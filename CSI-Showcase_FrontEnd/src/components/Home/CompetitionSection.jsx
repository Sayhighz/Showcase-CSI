import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Typography, Space, Empty, Tag, Divider, Button } from 'antd';
import { TrophyOutlined, StarOutlined, CalendarOutlined, EyeOutlined, LinkOutlined } from '@ant-design/icons';
import ProjectDisplay from './ProjectDisplay';
import ScrollIndicator from './ScrollIndicator';
import LoadingSpinner from '../common/LoadingSpinner';
import Image3DEffect from './Image3DEffect';
import SectionHeader from './SectionHeader';
import SectionDivider from './SectionDivider';
import AnimatedText from './AnimatedText';
import { API_ENDPOINTS } from '../../constants';

const { Title, Text, Paragraph } = Typography;

const CompetitionSection = ({ 
  loading = false, 
  competitionProjects = [], 
  competitionPage = 1, 
  setCompetitionPage = () => {},
  scrollToSection = () => {},
  academicRef = { current: null }
}) => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [100, 0, 0, -100]);

  const getCurrentProject = () => {
    if (!competitionProjects || competitionProjects.length === 0) return null;
    
    if (competitionPage > competitionProjects.length) {
      setCompetitionPage(1);
      return competitionProjects[0];
    }
    
    return competitionProjects[competitionPage - 1];
  };

  const nextProject = () => {
    if (!competitionProjects || competitionProjects.length === 0) return;
    
    if (competitionPage < competitionProjects.length) {
      setCompetitionPage(competitionPage + 1);
    } else {
      setCompetitionPage(1);
    }
  };

  const prevProject = () => {
    if (!competitionProjects || competitionProjects.length === 0) return;
    
    if (competitionPage > 1) {
      setCompetitionPage(competitionPage - 1);
    } else {
      setCompetitionPage(competitionProjects.length);
    }
  };

  const currentProject = getCurrentProject();

  return (
    <section 
      ref={sectionRef}
      className="min-h-screen py-16 relative overflow-hidden flex flex-col items-center justify-center"
      style={{ 
        background: 'linear-gradient(to bottom, #F5EAFF, #E0D1FF)'
      }}
    >
      {/* Section Divider at Top */}
      <SectionDivider 
        colorFrom="#F5EAFF" 
        colorTo="#E0D1FF"
        className="absolute top-0 left-0 w-full"
        height={80}
      />

      {/* Animated Planet Background */}
      <motion.div 
        className="absolute right-10 bottom-10 w-64 h-64 rounded-full bg-gradient-to-br from-[#90278E] to-[#5E1A5C] opacity-20"
        animate={{ 
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 0 40px rgba(144, 39, 142, 0.3)',
            '0 0 80px rgba(144, 39, 142, 0.6)',
            '0 0 40px rgba(144, 39, 142, 0.3)'
          ]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />

      <div className="container mx-auto px-6 py-16">
        <SectionHeader
          icon={<TrophyOutlined />}
          title="ผลงานการแข่งขัน"
          subtitle="ผลงานจากการแข่งขันทั้งในระดับมหาวิทยาลัยและระดับประเทศที่นักศึกษา CSI ได้มีโอกาสเข้าร่วมและได้รับรางวัล"
          colorScheme="light"
        />

        {loading ? (
          <div className="py-10 flex justify-center">
            <LoadingSpinner tip="กำลังโหลดผลงาน..." />
          </div>
        ) : !competitionProjects || competitionProjects.length === 0 ? (
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
              currentPage={competitionPage}
              totalProjects={competitionProjects.length}
              onPageChange={setCompetitionPage}
              onNext={nextProject}
              onPrev={prevProject}
            >
              {currentProject && (
                <div className="max-w-6xl mx-auto">
                  <div className="flex flex-col lg:flex-row gap-8 bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm p-8 rounded-2xl shadow-xl">
                    {/* Left Side - Project Image */}
                    <div className="lg:w-1/2">
                      <AnimatedText type="heading" delay={0.3}>
                        <Image3DEffect
                          className="h-[450px] rounded-xl overflow-hidden flex items-center justify-center"
                          depth={12}
                          glareEnabled={true}
                        >
                          {currentProject.image ? (
                            <img 
                              alt={currentProject.title} 
                              src={`${API_ENDPOINTS.BASE}/${currentProject.image}`} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full w-full bg-gradient-to-r from-[#90278E] to-[#B252B0] text-white text-opacity-30">
                              <TrophyOutlined style={{ fontSize: '64px' }} />
                            </div>
                          )}
                        </Image3DEffect>
                      </AnimatedText>
                      
                      {/* Tags */}
                      <div className="mt-4 flex flex-wrap gap-2 justify-center">
                        <Tag color="#90278E" className="px-3 py-1">{currentProject.level || 'ปี 3'}</Tag>
                        <Tag color="#B252B0" className="px-3 py-1">{`ปี ${currentProject.year || new Date(currentProject.createdAt).getFullYear()}`}</Tag>
                        <Tag color="#90278E" className="px-3 py-1">{`${currentProject.viewsCount || 0} views`}</Tag>
                      </div>
                    </div>
                    
                    {/* Right Side - Project Details */}
                    <div className="lg:w-1/2">
                      <AnimatedText type="heading" delay={0.1}>
                        <div>
                          <Title 
                            level={2} 
                            style={{ 
                              color: '#90278E', 
                              marginTop: 0, 
                              marginBottom: '16px',
                              fontWeight: 700,
                            }}
                          >
                            {currentProject.title}
                          </Title>
                          
                          {/* Student Information */}
                          <div className="flex items-center space-x-3 mb-5">
                            {currentProject.userImage ? (
                              <motion.img 
                                src={`${API_ENDPOINTS.BASE}/${currentProject.userImage}`} 
                                alt={currentProject.student}
                                className="w-12 h-12 rounded-full object-cover border-2 border-[#90278E]" 
                                whileHover={{ scale: 1.1 }}
                              />
                            ) : (
                              <motion.div 
                                className="w-12 h-12 rounded-full bg-[#90278E] flex items-center justify-center text-white text-xl font-bold"
                                whileHover={{ scale: 1.1 }}
                              >
                                {currentProject.student ? currentProject.student.charAt(0) : ""}
                              </motion.div>
                            )}
                            <div>
                              <Text className="font-medium block text-lg">{currentProject.student}</Text>
                              {currentProject.username && (
                                <Text type="secondary" className="text-sm">@{currentProject.username}</Text>
                              )}
                            </div>
                          </div>
                          
                          {/* Date and Views */}
                          <div className="flex items-center space-x-4 mb-6 text-gray-500">
                            <div className="flex items-center">
                              <CalendarOutlined className="mr-2" />
                              <span>{currentProject.year || new Date(currentProject.createdAt).getFullYear()}</span>
                            </div>
                            <div className="flex items-center">
                              <EyeOutlined className="mr-2" />
                              <span>{currentProject.viewsCount || 0} views</span>
                            </div>
                          </div>
                        </div>
                      </AnimatedText>
                      
                      {/* Project Description */}
                      <AnimatedText type="paragraph" delay={0.3}>
                        <div className="mt-5 mb-8">
                          <Divider orientation="left">
                            <Text strong className="text-[#90278E]">รายละเอียดโปรเจค</Text>
                          </Divider>
                          <Paragraph 
                            className="text-lg" 
                            style={{ 
                              lineHeight: 1.8,
                              textAlign: 'justify' 
                            }}
                          >
                            {currentProject.description}
                          </Paragraph>
                        </div>
                      </AnimatedText>
                      
                      {/* Call to Action */}
                      <AnimatedText type="badge" delay={0.7}>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
                          <div className="text-center sm:text-left">
                            <Text className="text-gray-500 block">สนใจในผลงานนี้?</Text>
                            <Text strong className="text-[#90278E] text-lg">ดูรายละเอียดเพิ่มเติมได้ที่นี่</Text>
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button 
                              type="primary" 
                              size="large"
                              icon={<LinkOutlined />}
                              className="bg-gradient-to-r from-[#90278E] to-[#B252B0] border-none px-6 h-12"
                              href={currentProject.projectLink || '#'}
                            >
                              ดูผลงานแข่งขันเต็มรูปแบบ
                            </Button>
                          </motion.div>
                        </div>
                      </AnimatedText>
                    </div>
                  </div>
                </div>
              )}
            </ProjectDisplay>
          </motion.div>
        )}
        
      </div>
      
      {/* Scroll to next section */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
      </motion.div>
      
      {/* Section Divider at Bottom */}
      <SectionDivider 
        colorFrom="#E0D1FF" 
        colorTo="#90278E"
        className="absolute bottom-0 left-0 w-full transform rotate-180"
        height={80}
      />
    </section>
  );
};

export default CompetitionSection;