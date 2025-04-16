// src/pages/projectManagement/ProjectDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Divider, Space, message, Tabs, Typography, Card, Badge, Affix, Tooltip } from 'antd';
import { 
  ArrowLeftOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  EditOutlined,
  EyeOutlined,
  ShareAltOutlined,
  HistoryOutlined,
  DeleteOutlined,
  PrinterOutlined,
  FileTextOutlined,
  TeamOutlined,
  PictureOutlined,
  ClockCircleOutlined
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
const { Title, Text } = Typography;

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewAction, setReviewAction] = useState('approve');
  const [activeTabKey, setActiveTabKey] = useState('info');
  
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
      success = await approveProject(projectId, comment);
    } else {
      success = await rejectProject(projectId, comment);
    }
    
    if (success) {
      setReviewModalVisible(false);
      message.success(`${reviewAction === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'}ผลงานเรียบร้อยแล้ว`);
      refreshProjectDetails();
    }
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTabKey(key);
  };

  // Create breadcrumb for the page
  const breadcrumb = [
    { title: 'จัดการผลงาน', path: '/projects' },
    { title: projectDetails?.title || 'รายละเอียดผลงาน' }
  ];

  // Get status config
  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
        return { color: 'success', text: 'อนุมัติแล้ว', icon: <CheckCircleOutlined /> };
      case 'rejected':
        return { color: 'error', text: 'ถูกปฏิเสธ', icon: <CloseCircleOutlined /> };
      case 'pending':
      default:
        return { color: 'warning', text: 'รอตรวจสอบ', icon: <ClockCircleOutlined /> };
    }
  };

  // Additional actions for page header
  const pageActions = (
    <Space size={8}>
      {projectDetails?.status === 'pending' && (
        <>
          <Button 
            type="primary" 
            icon={<CheckCircleOutlined />} 
            onClick={handleApproveProject}
            loading={actionLoading}
            size="large"
            className="px-4"
          >
            อนุมัติ
          </Button>
          <Button 
            danger 
            icon={<CloseCircleOutlined />} 
            onClick={handleRejectProject}
            loading={actionLoading}
            size="large"
            className="px-4"
          >
            ปฏิเสธ
          </Button>
        </>
      )}
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')} size="large">
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

  // Status configuration
  const statusConfig = getStatusConfig(projectDetails.status);

  // Get tab items for the tab component
  const tabItems = [
    {
      key: 'info',
      label: (
        <div className="flex items-center">
          <FileTextOutlined className="mr-1" />
          <span>ข้อมูลทั่วไป</span>
        </div>
      ),
      children: <ProjectInfo projectDetails={projectDetails} />
    },
    {
      key: 'files',
      label: (
        <div className="flex items-center">
          <PictureOutlined className="mr-1" />
          <span>ไฟล์และรูปภาพ</span>
          {projectDetails.files && projectDetails.files.length > 0 && (
            <Badge count={projectDetails.files.length} size="small" offset={[5, -5]} />
          )}
        </div>
      ),
      children: <ProjectFiles files={projectDetails.files} />
    },
    {
      key: 'contributors',
      label: (
        <div className="flex items-center">
          <TeamOutlined className="mr-1" />
          <span>ผู้ร่วมงาน</span>
        </div>
      ),
      children: (
        <ProjectContributors 
          contributors={projectDetails.contributors} 
          owner={{
            user_id: projectDetails.user_id,
            username: projectDetails.username,
            full_name: projectDetails.full_name,
            user_image: projectDetails.user_image,
            email: projectDetails.email
          }}
          teamMembers={projectDetails.competition?.team_members}
        />
      )
    },
    {
      key: 'reviews',
      label: (
        <div className="flex items-center">
          <HistoryOutlined className="mr-1" />
          <span>ประวัติการตรวจสอบ</span>
          {projectDetails.reviews && projectDetails.reviews.length > 0 && (
            <Badge count={projectDetails.reviews.length} size="small" offset={[5, -5]} />
          )}
        </div>
      ),
      children: <ProjectReviewHistory reviews={projectDetails.reviews} />
    }
  ];

  return (
    <div className="fade-in">
      <PageHeader 
        title={`รายละเอียดผลงาน: ${projectDetails.title}`}
        subtitle={
          <div className="flex items-center mt-1">
            <Badge status={statusConfig.color} text={null} /> 
            <Text className="ml-1">{statusConfig.text}</Text>
            <Divider type="vertical" />
            <Text><EyeOutlined className="mr-1" />{projectDetails.views_count || 0} ครั้ง</Text>
          </div>
        }
        breadcrumb={breadcrumb}
        extra={pageActions}
      />

      <div className="bg-white p-6 rounded-lg shadow-sm mb-6 fade-in">
        {/* Project Header */}
        <ProjectDetailHeader projectDetails={projectDetails} />
        
        <Divider style={{ margin: '32px 0' }} />
        
        {/* Floating Action Buttons */}
        <Affix offsetBottom={20} style={{ position: 'fixed', right: '20px', bottom: '20px', zIndex: 10 }}>
          <div className="flex flex-col space-y-3">
            <Tooltip title="พิมพ์" placement="left">
              <Button 
                type="primary" 
                shape="circle" 
                icon={<PrinterOutlined />} 
                size="large"
                style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              />
            </Tooltip>
            <Tooltip title="ลบ" placement="left">
              <Button 
                type="primary" 
                danger
                shape="circle" 
                icon={<DeleteOutlined />}
                size="large"
                style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              />
            </Tooltip>
          </div>
        </Affix>
        
        {/* Tabs */}
        <Tabs 
          activeKey={activeTabKey} 
          onChange={handleTabChange}
          type="card"
          size="large"
          items={tabItems}
          className="project-tabs"
          animated
        />
      </div>

      {/* Review Modal */}
      <ReviewModal 
        visible={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        onSubmit={handleReviewSubmit}
        type={reviewAction}
        loading={actionLoading}
        projectTitle={projectDetails.title}
      />
    </div>
  );
};

export default ProjectDetail;