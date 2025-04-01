import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Card, Skeleton, Typography, Tabs, Divider, Space, BackTop, Button, Empty, message } from 'antd';
import { RocketOutlined, FireOutlined, ClockCircleOutlined, UpOutlined, ExperimentOutlined, 
  TrophyOutlined, ReadOutlined, BulbOutlined } from '@ant-design/icons';
import Banner from '../../components/Home/Banner';
import Work_Col from '../../components/Work/Work_Col';
import Work_Row from '../../components/Work/Work_Row';
import { axiosGet } from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [latestProjects, setLatestProjects] = useState([]);
  const [topProjects, setTopProjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const workControls = useAnimation();
  const bannerControls = useAnimation();
  const [scrollY, setScrollY] = useState(0);
  const [bannerOpacity, setBannerOpacity] = useState(1);

  // Define category options - ปรับตามประเภทโครงการจริง (coursework, academic, competition)
  const categories = [
    { key: 'all', label: 'ทั้งหมด', icon: <RocketOutlined /> },
    { key: 'coursework', label: 'ผลงานการเรียน', icon: <BulbOutlined /> },
    { key: 'academic', label: 'บทความวิชาการ', icon: <ReadOutlined /> },
    { key: 'competition', label: 'การแข่งขัน', icon: <TrophyOutlined /> },
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        // สร้าง endpoint สำหรับการเรียกข้อมูลโครงการล่าสุด
        let latestEndpoint = '/projects/latest';
        if (selectedCategory !== 'all') {
          latestEndpoint = `/projects/search?type=${selectedCategory}`;
        }
        
        // สร้าง endpoint สำหรับการเรียกข้อมูลโครงการยอดนิยม
        let topEndpoint = '/projects/top9';
        if (selectedCategory !== 'all') {
          topEndpoint = `/projects/search?type=${selectedCategory}`;
        }
        
        // ดึงข้อมูลโครงการล่าสุด
        const latestData = await axiosGet(latestEndpoint);
        setLatestProjects(latestData || []);

        // ดึงข้อมูลโครงการยอดนิยม
        const topData = await axiosGet(topEndpoint);
        setTopProjects(topData || []);
      } catch (error) {
        console.error("Failed to fetch projects", error);
        message.error('ไม่สามารถโหลดข้อมูลโครงการได้ โปรดลองอีกครั้งในภายหลัง');
        setLatestProjects([]);
        setTopProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();

    const handleScroll = () => {
      setScrollY(window.scrollY);
      const newOpacity = Math.max(1 - window.scrollY / 300, 0);
      setBannerOpacity(newOpacity);

      const workOpacity = Math.min(window.scrollY / 300, 1);
      const translateY = Math.max(50 - (window.scrollY / 5), 0);

      bannerControls.start({ opacity: newOpacity });
      workControls.start({ opacity: workOpacity, y: translateY });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [bannerControls, workControls, selectedCategory]);

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Animate section variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const renderEmptyState = () => (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <span className="text-gray-500">
          ไม่พบผลงานในหมวดหมู่นี้
        </span>
      }
    >
      <Button type="primary" onClick={() => setSelectedCategory('all')}>
        ดูผลงานทั้งหมด
      </Button>
    </Empty>
  );

  return (
    <div className="relative min-h-screen">
      {/* Banner Section with Improved Fade Effect */}
      <motion.div
        animate={bannerControls}
        initial={{ opacity: 1 }}
        className="w-full h-screen flex items-center justify-center fixed top-0 left-0 right-0 z-0"
        style={{ 
          pointerEvents: bannerOpacity > 0.1 ? "auto" : "none",
        }}
      >
        <Banner />
      </motion.div>

      {/* Content Container */}
      <motion.div
        animate={workControls}
        initial={{ opacity: 0, y: 50 }}
        className="relative mt-screen z-10 bg-white pt-16"
        style={{ 
          marginTop: `${window.innerHeight - 100}px`,
          borderRadius: '40px 40px 0 0',
          boxShadow: '0 -20px 50px rgba(0,0,0,0.1)'
        }}
      >
        <div className="max-w-screen-xl mx-auto px-6 pb-20">
          {/* Section Header for Popular Projects */}
          <motion.div 
            className="mb-10 text-center"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Space direction="vertical" size="small" className="w-full">
              <div className="flex items-center justify-center gap-2">
                <FireOutlined className="text-red-500 text-2xl" />
                <Title level={2} style={{ margin: 0 }}>ผลงานยอดนิยม</Title>
              </div>
              <Text type="secondary" className="text-lg">
                ผลงานที่ได้รับความนิยมสูงสุดจากผู้ชมทั้งหมด
              </Text>
            </Space>
          </motion.div>

          {/* Category Tabs */}
          <motion.div 
            className="mb-8"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Tabs 
              defaultActiveKey="all"
              onChange={handleCategoryChange}
              centered
              size="large"
              className="custom-tabs"
            >
              {categories.map(category => (
                <TabPane 
                  tab={
                    <span className="flex items-center gap-1">
                      {category.icon} {category.label}
                    </span>
                  } 
                  key={category.key}
                />
              ))}
            </Tabs>
          </motion.div>

          {/* Skeleton Loader for Top Projects */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="w-full overflow-hidden shadow-md" style={{ borderRadius: '12px' }}>
                  <Skeleton active avatar paragraph={{ rows: 2 }} />
                </Card>
              ))}
            </div>
          ) : topProjects.length > 0 ? (
            <Work_Col title="" items={topProjects} side="center" description="" />
          ) : (
            <div className="py-10">
              {renderEmptyState()}
            </div>
          )}

          <Divider className="my-16" />

          {/* Section Header for Latest Projects */}
          <motion.div 
            className="mb-10 text-center"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Space direction="vertical" size="small" className="w-full">
              <div className="flex items-center justify-center gap-2">
                <ClockCircleOutlined className="text-blue-500 text-2xl" />
                <Title level={2} style={{ margin: 0 }}>ผลงานล่าสุด</Title>
              </div>
              <Text type="secondary" className="text-lg">
                ผลงานที่เพิ่งเผยแพร่ล่าสุดจากนักศึกษา CSI
              </Text>
            </Space>
          </motion.div>

          {/* Latest Projects Content */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="min-h-[40vh]"
          >
            {isLoading ? (
              <div className="space-y-6">
                {[...Array(4)].map((_, index) => (
                  <Card key={index} className="w-full overflow-hidden shadow-sm" style={{ borderRadius: '12px' }}>
                    <Skeleton active avatar paragraph={{ rows: 3 }} />
                  </Card>
                ))}
              </div>
            ) : latestProjects.length > 0 ? (
              <Work_Row title="" items={latestProjects} side="left" description="" />
            ) : (
              <div className="py-10">
                {renderEmptyState()}
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Back to Top Button */}
      <BackTop>
        <div className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors">
          <UpOutlined />
        </div>
      </BackTop>
    </div>
  );
};

export default Home;