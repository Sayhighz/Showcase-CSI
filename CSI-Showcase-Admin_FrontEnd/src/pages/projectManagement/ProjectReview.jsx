import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, message, Form, Modal } from 'antd';
import { 
  CheckCircleOutlined, ArrowLeftOutlined, ReloadOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getPendingProjects, reviewProject } from '../../services/projectService';
import useDebounce from '../../hooks/useDebounce';

// Import new components
import ProjectReviewFilter from '../../components/projectsReview/ProjectReviewFilter';
import ProjectReviewTable from '../../components/projectsReview/ProjectReviewTable';
import ProjectDetailsModal from '../../components/projectsReview/ProjectDetailsModal';
import ProjectApproveModal from '../../components/projectsReview/ProjectApproveModal';
import ProjectRejectModal from '../../components/projectsReview/ProjectRejectModal';

const { Title } = Typography;

const ProjectReview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Modal visibility states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  
  // Review states
  const [reviewComment, setReviewComment] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filters, setFilters] = useState({
    type: '',
    startDate: null,
    endDate: null,
  });
  
  const [form] = Form.useForm();

  // Load pending projects on component mount
  useEffect(() => {
    loadPendingProjects();
  }, []);

  // Apply filters when search term or filters change
  useEffect(() => {
    if (pendingProjects.length > 0) {
      let result = [...pendingProjects];
      
      // Filter by search term
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        result = result.filter(project => 
          (project.title && project.title.toLowerCase().includes(searchLower)) || 
          (project.description && project.description.toLowerCase().includes(searchLower)) ||
          (project.full_name && project.full_name.toLowerCase().includes(searchLower)) ||
          (project.username && project.username.toLowerCase().includes(searchLower))
        );
      }
      
      // Filter by type
      if (filters.type) {
        result = result.filter(project => project.type === filters.type);
      }
      
      // Filter by date range
      if (filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate).getTime();
        const end = new Date(filters.endDate).getTime();
        result = result.filter(project => {
          const created = new Date(project.created_at).getTime();
          return created >= start && created <= end;
        });
      }
      
      setFilteredProjects(result);
    }
  }, [pendingProjects, debouncedSearchTerm, filters]);

  // Load pending projects from API
  const loadPendingProjects = async () => {
    setLoading(true);
    try {
      const data = await getPendingProjects();
      setPendingProjects(data);
      setFilteredProjects(data);
    } catch (error) {
      console.error('Failed to load pending projects:', error);
      message.error('ไม่สามารถโหลดข้อมูลโปรเจคที่รอการตรวจสอบได้');
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilters({
      type: '',
      startDate: null,
      endDate: null,
    });
    setFilteredProjects(pendingProjects);
  };

  // Show project details
  const showProjectDetails = (project) => {
    setSelectedProject(project);
    setDetailModalVisible(true);
  };

  // Show approve modal
  const handleShowApproveModal = (project) => {
    setSelectedProject(project);
    setReviewComment('');
    setReviewModalVisible(true);
  };

  // Handle approve submission
  const handleApprove = async () => {
    setIsReviewing(true);
    try {
      await reviewProject(selectedProject.project_id, 'approved', reviewComment);
      message.success('อนุมัติโปรเจคสำเร็จ');
      setReviewModalVisible(false);
      loadPendingProjects();
    } catch (error) {
      console.error('Approval failed:', error);
      message.error('ไม่สามารถอนุมัติโปรเจคได้');
    } finally {
      setIsReviewing(false);
    }
  };

  // Show reject modal
  const handleShowRejectModal = (project) => {
    setSelectedProject(project);
    form.resetFields();
    setRejectModalVisible(true);
  };

  // Handle reject submission
  const handleReject = async () => {
    try {
      const values = await form.validateFields();
      setIsReviewing(true);
      
      try {
        await reviewProject(selectedProject.project_id, 'rejected', values.rejectReason);
        message.success('ปฏิเสธโปรเจคสำเร็จ');
        setRejectModalVisible(false);
        loadPendingProjects();
      } catch (error) {
        console.error('Rejection failed:', error);
        message.error('ไม่สามารถปฏิเสธโปรเจคได้');
      } finally {
        setIsReviewing(false);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <div className="p-6">
      <Button 
        type="link" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/projects')} 
        className="mb-4 pl-0"
      >
        กลับไปหน้าจัดการโปรเจค
      </Button>

      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Title level={4} className="mb-0">รายการรอตรวจสอบ</Title>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={loadPendingProjects}
            className="bg-[#90278E]"
          >
            รีเฟรช
          </Button>
        </div>

        <ProjectReviewFilter 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filters={filters}
          setFilters={setFilters}
          handleResetFilters={handleResetFilters}
        />
          
        <ProjectReviewTable
          loading={loading}
          filteredProjects={filteredProjects}
          showProjectDetails={showProjectDetails}
          handleShowApproveModal={handleShowApproveModal}
          handleShowRejectModal={handleShowRejectModal}
        />
      </Card>

      {/* Modals */}
      <ProjectDetailsModal 
        detailModalVisible={detailModalVisible}
        setDetailModalVisible={setDetailModalVisible}
        selectedProject={selectedProject}
        handleShowApproveModal={handleShowApproveModal}
        handleShowRejectModal={handleShowRejectModal}
      />

      <ProjectApproveModal 
        reviewModalVisible={reviewModalVisible}
        setReviewModalVisible={setReviewModalVisible}
        selectedProject={selectedProject}
        reviewComment={reviewComment}
        setReviewComment={setReviewComment}
        handleApprove={handleApprove}
        isReviewing={isReviewing}
      />

      <ProjectRejectModal 
        rejectModalVisible={rejectModalVisible}
        setRejectModalVisible={setRejectModalVisible}
        selectedProject={selectedProject}
        handleReject={handleReject}
        isReviewing={isReviewing}
        form={form}
      />
    </div>
  );
};

export default ProjectReview;