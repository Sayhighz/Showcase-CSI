import React, { useState, useEffect } from 'react';
import { 
  Card, Typography, Tabs, Spin, message 
} from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectDetail, deleteProject } from '../../services/projectService';

// Import new components
import ProjectHeader from '../../components/projectDetail/ProjectHeader';
import ProjectGeneralInfo from '../../components/projectDetail/ProjectGeneralInfo';
import ProjectFilesTab from '../../components/projectDetail/ProjectFilesTab';
import ProjectMembersTab from '../../components/projectDetail/ProjectMembersTab';
import ProjectReviewHistoryTab from '../../components/projectDetail/ProjectReviewHistoryTab';
import ProjectDeleteModal from '../../components/projectDetail/ProjectDeleteModal';

const { TabPane } = Tabs;

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);

  // Load project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);
      try {
        const data = await getProjectDetail(projectId);
        setProject(data);
      } catch (error) {
        console.error('Failed to load project details:', error);
        message.error('ไม่สามารถโหลดข้อมูลโปรเจคได้');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  // Handle project deletion
  const handleDeleteProject = async () => {
    setDeletingProject(true);
    try {
      await deleteProject(projectId);
      message.success('ลบโปรเจคสำเร็จ');
      setDeleteModalVisible(false);
      navigate('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
      message.error('ไม่สามารถลบโปรเจคได้');
    } finally {
      setDeletingProject(false);
    }
  };

  // Handle action click (approve/view)
  const handleActionClick = () => {
    message.info('กำลังพัฒนาระบบอนุมัติโปรเจค');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" tip="กำลังโหลดข้อมูลโปรเจค..." />
      </div>
    );
  }

  // No project found
  if (!project) {
    return (
      <div className="p-6">
        <Card>
          <Alert
            message="ไม่พบข้อมูลโปรเจค"
            description="ไม่พบข้อมูลโปรเจคที่คุณต้องการดู อาจเกิดจากโปรเจคถูกลบไปแล้วหรือไม่มีโปรเจคนี้ในระบบ"
            type="error"
            showIcon
          />
          <div className="mt-4">
            <Button 
              type="primary" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/projects')}
              className="bg-[#90278E]"
            >
              กลับไปหน้าจัดการโปรเจค
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Render project details
  return (
    <div className="p-6">
      <Card className="mb-6">
        <ProjectHeader 
          project={project} 
          navigate={navigate} 
          setDeleteModalVisible={setDeleteModalVisible}
          handleActionClick={handleActionClick}
        />

        <Tabs defaultActiveKey="1">
          <TabPane tab="ข้อมูลทั่วไป" key="1">
            <ProjectGeneralInfo project={project} />
          </TabPane>
          
          <TabPane tab="ไฟล์และรูปภาพ" key="2">
            <ProjectFilesTab project={project} />
          </TabPane>
          
          <TabPane tab="ผู้ร่วมงาน" key="3">
            <ProjectMembersTab project={project} />
          </TabPane>
          
          <TabPane tab="ประวัติการตรวจสอบ" key="4">
            <ProjectReviewHistoryTab project={project} />
          </TabPane>
        </Tabs>
      </Card>

      <ProjectDeleteModal 
        deleteModalVisible={deleteModalVisible}
        setDeleteModalVisible={setDeleteModalVisible}
        project={project}
        handleDeleteProject={handleDeleteProject}
        deletingProject={deletingProject}
      />
    </div>
  );
};

export default ProjectDetail;