import React, { useState, useEffect } from 'react';
import { Card, Typography, Alert, Tabs, Spin } from 'antd';
import { BookOutlined, TeamOutlined, TrophyOutlined } from '@ant-design/icons';
import useAuth from '../../hooks/useAuth';
import useProject from '../../hooks/useProject';
import { useNavigate } from 'react-router-dom';
import ProjectForm from '../../components/ManageProject/ProjectForm';
import { PROJECT_TYPE } from '../../constants/projectTypes';
import { PROJECT } from '../../constants/routes';
import { useMediaQuery } from 'react-responsive';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

/**
 * UploadProject - หน้าสำหรับอัปโหลดโปรเจคใหม่
 * @returns {JSX.Element} - UploadProject component
 */
const UploadProject = () => {
  const { user } = useAuth();
  const { createProject, isLoading } = useProject();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(PROJECT_TYPE.COURSEWORK);
  const [error, setError] = useState(null);

  // ตรวจสอบขนาดหน้าจอ
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 });

  // ตรวจสอบว่ามีผู้ใช้งานหรือไม่
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // จัดการการเปลี่ยนแท็บ
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // จัดการการส่งฟอร์ม
  const handleSubmit = async (formInput) => {
    try {
      setError(null);
      
      // ตรวจสอบความถูกต้องของข้อมูล
      if (!formInput.data || !formInput.data.title) {
        throw new Error('ข้อมูลโปรเจคไม่ถูกต้อง');
      }
      
      if (!user || !user.id) {
        throw new Error('ไม่มีข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่');
      }
      
      console.log('Data to send:', formInput.data);
      console.log('Files to upload:', formInput.files);
      
      // เรียกใช้ API ผ่าน service
      const response = await createProject(user.id, formInput.data, formInput.files);
      
      if (response && response.projectId) {
        navigate(PROJECT.VIEW(response.projectId));
      }
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการอัปโหลดโปรเจค:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการอัปโหลดโปรเจค');
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin tip="กำลังตรวจสอบข้อมูลผู้ใช้..." size={isMobile ? "small" : "default"} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <Title level={isMobile ? 3 : 2} className="mb-2 sm:mb-3">อัปโหลดโปรเจคใหม่</Title>
      <Paragraph className="text-sm sm:text-base">
        เพิ่มโปรเจคใหม่เข้าสู่ระบบ โดยเลือกประเภทโปรเจคที่ต้องการอัปโหลด และกรอกข้อมูลให้ครบถ้วน
      </Paragraph>

      {error && (
        <Alert
          message={<span className={isMobile ? "text-sm" : ""}>เกิดข้อผิดพลาด</span>}
          description={<span className={isMobile ? "text-xs" : "text-sm"}>{error}</span>}
          type="error"
          showIcon
          className="mb-4 sm:mb-6"
          closable
        />
      )}

      <Tabs 
        activeKey={activeTab} 
        onChange={handleTabChange}
        className="mb-4 sm:mb-6"
        size={isMobile ? "small" : "middle"}
        tabPosition={isMobile ? "top" : "top"}
        items={[
          {
            key: PROJECT_TYPE.COURSEWORK,
            label: (
              <span className={isMobile ? "text-xs sm:text-sm" : ""}>
                <TeamOutlined className="mr-1" />
                {!isMobile && "งานในชั้นเรียน"}
                {isMobile && "ชั้นเรียน"}
              </span>
            ),
            children: (
              <Card className="mb-4 sm:mb-6" size={isMobile ? "small" : "default"} bodyStyle={{ padding: isMobile ? '12px' : '24px' }}>
                <div className="mb-3 sm:mb-6">
                  <Title level={isMobile ? 4 : 4} className="mb-1 sm:mb-2">อัปโหลดผลงานในชั้นเรียน</Title>
                  <Paragraph className="text-xs sm:text-sm">
                    สำหรับผลงานที่ทำในรายวิชาต่างๆ เช่น โปรเจคในวิชาเฉพาะด้าน งานกลุ่ม หรือชิ้นงานที่ได้รับมอบหมายในชั้นเรียน
                  </Paragraph>
                </div>
                
                <ProjectForm 
                  isEdit={false}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  initialValues={{ type: PROJECT_TYPE.COURSEWORK }}
                />
              </Card>
            ),
          },
          {
            key: PROJECT_TYPE.ACADEMIC,
            label: (
              <span className={isMobile ? "text-xs sm:text-sm" : ""}>
                <BookOutlined className="mr-1" />
                {!isMobile && "บทความวิชาการ"}
                {isMobile && "บทความ"}
              </span>
            ),
            children: (
              <Card className="mb-4 sm:mb-6" size={isMobile ? "small" : "default"} bodyStyle={{ padding: isMobile ? '12px' : '24px' }}>
                <div className="mb-3 sm:mb-6">
                  <Title level={isMobile ? 4 : 4} className="mb-1 sm:mb-2">อัปโหลดบทความวิชาการ</Title>
                  <Paragraph className="text-xs sm:text-sm">
                    สำหรับบทความวิชาการ, งานวิจัย, หรือเอกสารทางวิชาการต่างๆ ที่ได้รับการตีพิมพ์หรือเผยแพร่
                  </Paragraph>
                </div>
                
                <ProjectForm 
                  isEdit={false}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  initialValues={{ type: PROJECT_TYPE.ACADEMIC }}
                />
              </Card>
            ),
          },
          {
            key: PROJECT_TYPE.COMPETITION,
            label: (
              <span className={isMobile ? "text-xs sm:text-sm" : ""}>
                <TrophyOutlined className="mr-1" />
                {!isMobile && "การแข่งขัน"}
                {isMobile && "แข่งขัน"}
              </span>
            ),
            children: (
              <Card className="mb-4 sm:mb-6" size={isMobile ? "small" : "default"} bodyStyle={{ padding: isMobile ? '12px' : '24px' }}>
                <div className="mb-3 sm:mb-6">
                  <Title level={isMobile ? 4 : 4} className="mb-1 sm:mb-2">อัปโหลดผลงานการแข่งขัน</Title>
                  <Paragraph className="text-xs sm:text-sm">
                    สำหรับผลงานที่ส่งเข้าประกวดหรือแข่งขันในเวทีต่างๆ ทั้งระดับท้องถิ่น ระดับประเทศ หรือระดับนานาชาติ
                  </Paragraph>
                </div>
                
                <ProjectForm 
                  isEdit={false}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  initialValues={{ type: PROJECT_TYPE.COMPETITION }}
                />
              </Card>
            ),
          }
        ]}
      />
    </div>
  );
};

export default UploadProject;