// src/pages/projectManagement/ProjectDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Divider, Space, message, Tabs } from 'antd';
import { 
  ArrowLeftOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  EditOutlined
} from '@ant-design/icons';

// Components
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import ErrorAlert from '../../components/common/ErrorAlert';
import ProjectDetailHeader from '../../components/projectDetail/ProjectDetailHeader';
import ProjectInfo from '../../components/projectDetail/ProjectInfo';
import ProjectFiles from '../../components/projectDetail/ProjectFiles';
import ProjectReviewHistory from '../../components/projectDetail/ProjectReviewHistory';
import ProjectContributors from '../../components/projectDetail/ProjectContributors';
import ReviewModal from '../../components/projectDetail/ReviewModal';

// Hooks and Services
import useProject from '../../hooks/useProject';

const { TabPane } = Tabs;

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewAction, setReviewAction] = useState('approve');
  
  // Use the useProject hook to handle project data and actions
  const { 
    projectDetails, 
    loading, 
    error, 
    actionLoading,
    refreshProjectDetails,
    approveProject,
    rejectProject
  } = useProject('detail', 'detail', {}, projectId);

  // Handle project approval/rejection
  const handleApproveProject = async () => {
    setReviewAction('approve');
    setReviewModalVisible(true);
  };

  const handleRejectProject = () => {
    setReviewAction('reject');
    setReviewModalVisible(true);
  };

  // Handle review submission
  const handleReviewSubmit = async (comment) => {
    let success = false;
    
    if (reviewAction === 'approve') {
      success = await approveProject(projectId);
    } else {
      success = await rejectProject(projectId, comment);
    }
    
    if (success) {
      setReviewModalVisible(false);
      refreshProjectDetails();
    }
  };

  // Create breadcrumb for the page
  const breadcrumb = [
    { title: 'จัดการผลงาน', path: '/projects' },
    { title: projectDetails?.title || 'รายละเอียดผลงาน' }
  ];

  // Additional actions for page header
  const pageActions = (
    <Space>
      {projectDetails?.status === 'pending' && (
        <>
          <Button 
            type="primary" 
            icon={<CheckCircleOutlined />} 
            onClick={handleApproveProject}
            loading={actionLoading}
          >
            อนุมัติ
          </Button>
          <Button 
            danger 
            icon={<CloseCircleOutlined />} 
            onClick={handleRejectProject}
            loading={actionLoading}
          >
            ปฏิเสธ
          </Button>
        </>
      )}
      <Button icon={<EditOutlined />}>แก้ไข</Button>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')}>
        กลับ
      </Button>
    </Space>
  );

  if (loading) {
    return <LoadingState type="full" message="กำลังโหลดข้อมูลโปรเจค..." />;
  }

  if (error) {
    return (
      <ErrorAlert 
        message="ไม่สามารถโหลดข้อมูลโปรเจคได้" 
        description={error}
        onRetry={refreshProjectDetails}
      />
    );
  }

  if (!projectDetails) {
    return (
      <ErrorAlert 
        message="ไม่พบข้อมูลโปรเจค" 
        description="โปรเจคที่คุณกำลังค้นหาอาจถูกลบไปแล้วหรือไม่มีอยู่ในระบบ"
        onRetry={refreshProjectDetails}
      />
    );
  }

  return (
    <div>
      <PageHeader 
        title={`รายละเอียดผลงาน: ${projectDetails.title}`}
        subtitle="ดูรายละเอียดและจัดการผลงาน"
        breadcrumb={breadcrumb}
        extra={pageActions}
      />

      <div className="bg-white p-6 rounded-md shadow-sm mb-6">
        <ProjectDetailHeader projectDetails={projectDetails} />
        
        <Divider />
        
        <Tabs defaultActiveKey="info">
          <TabPane tab="ข้อมูลทั่วไป" key="info">
            <ProjectInfo projectDetails={projectDetails} />
          </TabPane>
          <TabPane tab="ไฟล์และรูปภาพ" key="files">
            <ProjectFiles files={projectDetails.files} />
          </TabPane>
          <TabPane tab="ผู้ร่วมงาน" key="contributors">
            <ProjectContributors 
              contributors={projectDetails.contributors} 
              owner={{
                user_id: projectDetails.user_id,
                username: projectDetails.username,
                full_name: projectDetails.full_name,
                email: projectDetails.email
              }}
              teamMembers={projectDetails.competition?.team_members}
            />
          </TabPane>
          <TabPane tab="ประวัติการตรวจสอบ" key="reviews">
            <ProjectReviewHistory reviews={projectDetails.reviews} />
          </TabPane>
        </Tabs>
      </div>

      <ReviewModal 
        visible={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        onSubmit={handleReviewSubmit}
        type={reviewAction}
        loading={actionLoading}
      />
    </div>
  );
};

export default ProjectDetail;