import React, { useState, useEffect } from 'react';
import { Card, Typography, Alert, Tabs, Spin } from 'antd';
import { BookOutlined, TeamOutlined, TrophyOutlined } from '@ant-design/icons';
import useAuth from '../../hooks/useAuth';
import useProject from '../../hooks/useProject';
import { useNavigate } from 'react-router-dom';
import ProjectForm from '../../components/ManageProject/ProjectForm';
import { PROJECT_TYPE } from '../../constants/projectTypes';
import { PROJECT } from '../../constants/routes';

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
  // UploadProject.jsx

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
    return <Spin tip="กำลังตรวจสอบข้อมูลผู้ใช้..." />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Title level={2}>อัปโหลดโปรเจคใหม่</Title>
      <Paragraph>
        เพิ่มโปรเจคใหม่เข้าสู่ระบบ โดยเลือกประเภทโปรเจคที่ต้องการอัปโหลด และกรอกข้อมูลให้ครบถ้วน
      </Paragraph>

      {error && (
        <Alert
          message="เกิดข้อผิดพลาด"
          description={error}
          type="error"
          showIcon
          className="mb-6"
          closable
        />
      )}

      <Tabs 
        activeKey={activeTab} 
        onChange={handleTabChange}
        className="mb-6"
        items={[
          {
            key: PROJECT_TYPE.COURSEWORK,
            label: (
              <span>
                <TeamOutlined />
                งานในชั้นเรียน
              </span>
            ),
            children: (
              <Card className="mb-6">
                <div className="mb-6">
                  <Title level={4}>อัปโหลดผลงานในชั้นเรียน</Title>
                  <Paragraph>
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
              <span>
                <BookOutlined />
                บทความวิชาการ
              </span>
            ),
            children: (
              <Card className="mb-6">
                <div className="mb-6">
                  <Title level={4}>อัปโหลดบทความวิชาการ</Title>
                  <Paragraph>
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
              <span>
                <TrophyOutlined />
                การแข่งขัน
              </span>
            ),
            children: (
              <Card className="mb-6">
                <div className="mb-6">
                  <Title level={4}>อัปโหลดผลงานการแข่งขัน</Title>
                  <Paragraph>
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