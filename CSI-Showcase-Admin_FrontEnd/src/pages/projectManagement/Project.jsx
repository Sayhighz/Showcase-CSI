import React, { useState, useEffect } from 'react';
import { Card, Typography, message, Form, Modal } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { getAllProjects, reviewProject } from '../../services/projectService';
import { useAdminState } from '../../context/AdminStateContext';
import useDebounce from '../../hooks/useDebounce';

// นำเข้าคอมโพเนนต์ย่อย
import ProjectFilter from '../../components/projects/ProjectFilter';
import ProjectTable from '../../components/projects/ProjectTable';
import ProjectTabs from '../../components/projects/ProjectTabs';
import ProjectReviewModal from '../../components/projects/ProjectReviewModal';
import ProjectRejectModal from '../../components/projects/ProjectRejectModal';

// นำเข้าฟังก์ชันช่วยเหลือ
import { filterProjects, formatProjectData } from '../../utils/projectUtils';

const { Title } = Typography;

const Project = () => {
  // State for projects and loading
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('all');
  
  // State for review actions
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [form] = Form.useForm();

  
  // State for filtering and searching
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filters, setFilters] = useState({
    type: '',
    year: '',
    studyYear: ''
  });
  
  const { updateFilters, resetFilters, setPendingProjectsCount } = useAdminState();

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Apply filters and search when those values change
  useEffect(() => {
    if (projects.length > 0) {
      const result = filterProjects(projects, debouncedSearchTerm, currentTab, filters);
      setFilteredProjects(result);
    }
  }, [projects, debouncedSearchTerm, currentTab, filters]);

  // Load projects from API
  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await getAllProjects();
      
      // Format data to match our component structure
      const formattedData = formatProjectData(data);
      
      setProjects(formattedData);
      setFilteredProjects(formattedData);
      
      // Count pending projects for notifications
      const pendingCount = formattedData.filter(project => project.status === 'pending').length;
      setPendingProjectsCount(pendingCount);
    } catch (error) {
      console.error('Failed to load projects:', error);
      message.error('ไม่สามารถโหลดข้อมูลโปรเจคได้');
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setCurrentTab(key);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilters({
      type: '',
      year: '',
      studyYear: ''
    });
    resetFilters('projects');
    setFilteredProjects(projects);
  };

  // Handle project approval
  const handleApprove = (project) => {
    Modal.confirm({
      title: 'ยืนยันการอนุมัติ',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      content: `คุณต้องการอนุมัติโปรเจค "${project.title}" ใช่หรือไม่?`,
      okText: 'อนุมัติ',
      cancelText: 'ยกเลิก',
      okButtonProps: { style: { backgroundColor: '#52c41a', borderColor: '#52c41a' } },
      onOk: async () => {
        setIsReviewing(true);
        try {
          await reviewProject(project.project_id, 'approved');
          message.success('อนุมัติโปรเจคสำเร็จ');
          
          // Refresh project list
          loadProjects();
        } catch (error) {
          console.error('Approval failed:', error);
          message.error('ไม่สามารถอนุมัติโปรเจคได้');
        } finally {
          setIsReviewing(false);
        }
      }
    });
  };

  // Show reject modal
  const showRejectModal = (project) => {
    setSelectedProject(project);
    form.resetFields();
    setRejectReason('');
    setRejectModalVisible(true);
  };

  // Handle project rejection
  const handleReject = async () => {
    try {
      await form.validateFields();
      setIsReviewing(true);
      
      try {
        await reviewProject(selectedProject.project_id, 'rejected', rejectReason);
        message.success('ปฏิเสธโปรเจคสำเร็จ');
        setRejectModalVisible(false);
        
        // Refresh project list
        loadProjects();
      } catch (error) {
        console.error('Rejection failed:', error);
        message.error('ไม่สามารถปฏิเสธโปรเจคได้');
      } finally {
        setIsReviewing(false);
      }
    } catch (error) {
      // Form validation error
      console.error('Validation failed:', error);
    }
  };

  // Show review modal
  const handleShowReview = (project) => {
    setSelectedProject(project);
    console.log(selectedProject)
    setReviewModalVisible(true);
  };

  return (
    <div className="p-6">
      <Card className="mb-6">
        <Title level={4} className="mb-4">จัดการผลงาน</Title>
        
        <ProjectTabs 
          currentTab={currentTab} 
          handleTabChange={handleTabChange}
          pendingCount={projects.filter(p => p.status === 'pending').length}
        />
        
        <ProjectFilter 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filters={filters}
          setFilters={setFilters}
          handleResetFilters={handleResetFilters}
        />
        
        <ProjectTable 
          projects={filteredProjects}
          loading={loading}
          handleApprove={handleApprove}
          showRejectModal={showRejectModal}
          handleShowReview={handleShowReview}
        />
      </Card>
      
      {/* โมดัลตรวจสอบโปรเจค */}
      <ProjectReviewModal 
        visible={reviewModalVisible}
        setVisible={setReviewModalVisible}
        project={selectedProject}
        handleApprove={handleApprove}
        showRejectModal={showRejectModal}
      />
      
      {/* โมดัลปฏิเสธโปรเจค */}
      <ProjectRejectModal 
        visible={rejectModalVisible}
        setVisible={setRejectModalVisible}
        project={selectedProject}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        handleReject={handleReject}
        isReviewing={isReviewing}
        form={form}
      />
    </div>
  );
};

export default Project;