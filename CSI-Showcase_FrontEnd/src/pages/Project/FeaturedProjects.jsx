import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Button, Carousel, Card, Spin, Empty } from 'antd';
import { RightOutlined, LeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useProject } from '../../hooks';
import ProjectCard from '../../components/Project/ProjectCard';
import { PROJECT } from '../../constants/routes';

const { Title, Text } = Typography;

/**
 * FeaturedProjects component ใช้สำหรับแสดงโปรเจคแนะนำบนหน้าแรก
 * 
 * @param {Object} props - Props ของ component
 * @param {number} props.limit - จำนวนโปรเจคที่ต้องการแสดง
 * @param {string} props.title - หัวข้อของส่วนโปรเจคแนะนำ
 * @param {string} props.subtitle - คำอธิบายของส่วนโปรเจคแนะนำ
 * @param {boolean} props.showViewAll - แสดงปุ่ม "ดูทั้งหมด" หรือไม่
 * @param {string} props.viewAllLink - ลิงก์ของปุ่ม "ดูทั้งหมด"
 * @param {Object} props.style - Custom style สำหรับ component
 * @returns {JSX.Element} FeaturedProjects component
 */
const FeaturedProjects = ({
  limit = 6,
  title = 'โปรเจคแนะนำ',
  subtitle = 'โปรเจคที่น่าสนใจและได้รับความนิยมสูงสุด',
  showViewAll = true,
  viewAllLink = PROJECT.ALL,
  style
}) => {
  // เรียกใช้ hook เพื่อดึงข้อมูลโปรเจค
  const { fetchTopProjects, projects, isLoading, error } = useProject();
  const [carouselRef, setCarouselRef] = useState(null);

  // ดึงข้อมูลโปรเจคเมื่อ component ถูกโหลด
  useEffect(() => {
    fetchTopProjects();
  }, [fetchTopProjects]);

  // ฟังก์ชันสำหรับการเลื่อนไปยังสไลด์ก่อนหน้า
  const handlePrevious = () => {
    if (carouselRef) {
      carouselRef.prev();
    }
  };

  // ฟังก์ชันสำหรับการเลื่อนไปยังสไลด์ถัดไป
  const handleNext = () => {
    if (carouselRef) {
      carouselRef.next();
    }
  };

  // แสดง loading state
  if (isLoading) {
    return (
      <Card style={{ textAlign: 'center', padding: '50px 0', ...style }}>
        <Spin size="large" />
        <Title level={4} style={{ marginTop: 16 }}>กำลังโหลดโปรเจคแนะนำ</Title>
      </Card>
    );
  }

  // แสดงข้อความเมื่อไม่มีโปรเจค
  if (!projects || projects.length === 0) {
    return (
      <Card style={{ ...style }}>
        <Title level={3}>{title}</Title>
        <Text type="secondary">{subtitle}</Text>
        <Empty 
          description="ไม่พบโปรเจคแนะนำ" 
          style={{ margin: '40px 0' }}
        />
      </Card>
    );
  }

  // แสดงข้อความเมื่อเกิดข้อผิดพลาด
  if (error) {
    return (
      <Card style={{ ...style }}>
        <Title level={3}>{title}</Title>
        <Text type="secondary">{subtitle}</Text>
        <Empty 
          description="เกิดข้อผิดพลาดในการโหลดโปรเจคแนะนำ" 
          style={{ margin: '40px 0' }}
        />
      </Card>
    );
  }

  // ข้อมูลสำหรับแสดงบนเดสก์ท็อป (แบ่งเป็น slides)
  const getDesktopSlides = () => {
    const limitedProjects = projects.slice(0, limit);
    const slides = [];
    const projectsPerSlide = 3;

    for (let i = 0; i < limitedProjects.length; i += projectsPerSlide) {
      const slideProjects = limitedProjects.slice(i, i + projectsPerSlide);
      slides.push(slideProjects);
    }

    return slides;
  };

  // สไลด์สำหรับเดสก์ท็อป
  const desktopSlides = getDesktopSlides();

  return (
    <div style={{ marginBottom: 40, ...style }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 24
      }}>
        <div>
          <Title level={3} style={{ marginBottom: 8 }}>{title}</Title>
          <Text type="secondary">{subtitle}</Text>
        </div>
        <div>
          {showViewAll && (
            <Link to={viewAllLink}>
              <Button type="primary" icon={<ArrowRightOutlined />}>
                ดูทั้งหมด
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* แสดงผลบนเดสก์ท็อป */}
      <div className="desktop-carousel" style={{ position: 'relative', display: { xs: 'none', md: 'block' } }}>
        <Button 
          shape="circle" 
          icon={<LeftOutlined />} 
          onClick={handlePrevious}
          style={{ 
            position: 'absolute',
            left: -20,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            boxShadow: '0 3px 6px rgba(0, 0, 0, 0.16)'
          }}
        />

        <Carousel
          ref={ref => setCarouselRef(ref)}
          dots={true}
          adaptiveHeight={true}
          autoplay
          autoplaySpeed={5000}
        >
          {desktopSlides.map((slide, slideIndex) => (
            <div key={slideIndex}>
              <Row gutter={[24, 24]}>
                {slide.map((project) => (
                  <Col key={project.id} xs={24} sm={12} md={8}>
                    <ProjectCard project={project} />
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </Carousel>

        <Button 
          shape="circle" 
          icon={<RightOutlined />} 
          onClick={handleNext}
          style={{ 
            position: 'absolute',
            right: -20,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            boxShadow: '0 3px 6px rgba(0, 0, 0, 0.16)'
          }}
        />
      </div>

      {/* แสดงผลบนมือถือ */}
      <div className="mobile-carousel" style={{ display: { xs: 'block', md: 'none' } }}>
        <Carousel
          dots={true}
          adaptiveHeight={true}
          autoplay
          autoplaySpeed={5000}
        >
          {projects.slice(0, limit).map((project) => (
            <div key={project.id} style={{ padding: '0 12px' }}>
              <ProjectCard project={project} />
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default FeaturedProjects;