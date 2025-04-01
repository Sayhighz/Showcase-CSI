import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Card, Input, Select, Tag, Modal, Form, Tabs, 
  Typography, Space, Spin, message, Tooltip, Divider, Image, Badge 
} from 'antd';
import { 
  CheckCircleOutlined, CloseCircleOutlined, SearchOutlined, 
  FilterOutlined, EyeOutlined, FileTextOutlined, 
  ExclamationCircleOutlined, TagOutlined, CalendarOutlined, TeamOutlined 
} from '@ant-design/icons';
import { getPendingProjects, reviewProject, getProjectDetail } from '../../services/projectService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const ProjectReview = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { admin } = useAuth();

  // Filter options
  const [filters, setFilters] = useState({
    type: '',
    year: '',
    study_year: ''
  });

  // Load pending projects
  const loadPendingProjects = async () => {
    setLoading(true);
    try {
      const data = await getPendingProjects();
      setProjects(data);
      setFilteredProjects(data);
    } catch (error) {
      console.error('Failed to load pending projects:', error);
      message.error('ไม่สามารถโหลดรายการโปรเจคที่รออนุมัติได้');
    } finally {
      setLoading(false);
    }
  };

  // Load project details
  const loadProjectDetails = async (projectId) => {
    setDetailLoading(true);
    try {
      const data = await getProjectDetail(projectId);
      setProjectDetails(data);
    } catch (error) {
      console.error('Failed to load project details:', error);
      message.error('ไม่สามารถโหลดรายละเอียดโปรเจคได้');
    } finally {
      setDetailLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadPendingProjects();
  }, []);

  // Apply search and filters
  useEffect(() => {
    let result = [...projects];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(project => 
        project.title?.toLowerCase().includes(term) || 
        project.description?.toLowerCase().includes(term)
      );
    }
    
    // Apply type filter
    if (filters.type) {
      result = result.filter(project => project.category === filters.type);
    }
    
    // Apply year filter
    if (filters.year) {
      result = result.filter(project => project.year === filters.year);
    }
    
    // Apply study_year filter
    if (filters.study_year) {
      result = result.filter(project => project.level === filters.study_year);
    }
    
    setFilteredProjects(result);
  }, [projects, searchTerm, filters]);

  // Handle project approval
  const handleApprove = async (projectId) => {
    Modal.confirm({
      title: 'ยืนยันการอนุมัติ',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      content: 'คุณต้องการอนุมัติโปรเจคนี้ใช่หรือไม่?',
      okText: 'อนุมัติ',
      cancelText: 'ยกเลิก',
      okButtonProps: { style: { backgroundColor: '#52c41a', borderColor: '#52c41a' } },
      onOk: async () => {
        setIsReviewing(true);
        try {
          await reviewProject(projectId, 'approved');
          message.success('อนุมัติโปรเจคสำเร็จ');
          loadPendingProjects(); // Refresh the list
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
        await reviewProject(selectedProject.projectId, 'rejected', rejectReason);
        message.success('ปฏิเสธโปรเจคสำเร็จ');
        setRejectModalVisible(false);
        loadPendingProjects(); // Refresh the list
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

  // Show project details
  const showDetails = (project) => {
    setSelectedProject(project);
    loadProjectDetails(project.projectId);
    setDetailModalVisible(true);
  };

  // Get tag color based on project type
  const getTagColor = (type) => {
    switch (type) {
      case 'academic':
        return 'blue';
      case 'coursework':
        return 'green';
      case 'competition':
        return 'gold';
      default:
        return 'default';
    }
  };

  // Get category display name
  const getCategoryName = (category) => {
    switch (category) {
      case 'academic':
        return 'บทความวิชาการ';
      case 'coursework':
        return 'ผลงานการเรียน';
      case 'competition':
        return 'การแข่งขัน';
      default:
        return category;
    }
  };

  // Table columns
  const columns = [
    {
      title: 'ลำดับ',
      key: 'index',
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'ชื่อโปรเจค',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div className="font-medium text-gray-800">{text}</div>
          <div className="text-xs text-gray-500 mt-1">
            ผู้สร้าง: {record.author?.fullName || 'ไม่ระบุ'}
          </div>
        </div>
      ),
    },
    {
      title: 'ประเภท',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (category) => (
        <Tag color={getTagColor(category)} icon={<TagOutlined />}>
          {getCategoryName(category)}
        </Tag>
      ),
    },
    {
      title: 'ระดับ/ปี',
      key: 'levelYear',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text type="secondary" className="text-xs flex items-center">
            <TeamOutlined className="mr-1" /> {record.level || 'ไม่ระบุ'}
          </Text>
          <Text type="secondary" className="text-xs flex items-center">
            <CalendarOutlined className="mr-1" /> {record.year || 'ไม่ระบุ'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'วันที่สร้าง',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => {
        if (!date) return 'ไม่ระบุ';
        const formattedDate = new Date(date).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        return <span>{formattedDate}</span>;
      },
    },
    {
      title: 'ดำเนินการ',
      key: 'actions',
      width: 240,
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            onClick={() => showDetails(record)}
            type="default"
            size="small"
          >
            ดูรายละเอียด
          </Button>
          <Button
            icon={<CheckCircleOutlined />}
            onClick={() => handleApprove(record.projectId)}
            type="primary"
            size="small"
            className="bg-green-600 hover:bg-green-700"
            loading={isReviewing}
          >
            อนุมัติ
          </Button>
          <Button
            icon={<CloseCircleOutlined />}
            onClick={() => showRejectModal(record)}
            type="primary"
            danger
            size="small"
            loading={isReviewing}
          >
            ปฏิเสธ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <Title level={4} className="m-0">
            <Badge count={filteredProjects.length} offset={[10, 0]} style={{ backgroundColor: '#90278E' }}>
              <span className="mr-4">โปรเจคที่รอการอนุมัติ</span>
            </Badge>
          </Title>
          <Space size="middle" className="mb-4">
            <Input
              placeholder="ค้นหาโปรเจค"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            
            <Select
              placeholder="ประเภทโปรเจค"
              style={{ width: 180 }}
              onChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              value={filters.type || undefined}
              allowClear
            >
              <Option value="academic">บทความวิชาการ</Option>
              <Option value="coursework">ผลงานการเรียน</Option>
              <Option value="competition">การแข่งขัน</Option>
            </Select>
            
            <Select
              placeholder="ชั้นปีนักศึกษา"
              style={{ width: 180 }}
              onChange={(value) => setFilters(prev => ({ ...prev, study_year: value }))}
              value={filters.study_year || undefined}
              allowClear
            >
              <Option value="ปี 1">ปี 1</Option>
              <Option value="ปี 2">ปี 2</Option>
              <Option value="ปี 3">ปี 3</Option>
              <Option value="ปี 4">ปี 4</Option>
            </Select>
            
            <Select
              placeholder="ปีการศึกษา"
              style={{ width: 150 }}
              onChange={(value) => setFilters(prev => ({ ...prev, year: value }))}
              value={filters.year || undefined}
              allowClear
            >
              <Option value="2025">2025</Option>
              <Option value="2024">2024</Option>
              <Option value="2023">2023</Option>
            </Select>
            
            <Button 
              type="primary" 
              icon={<FilterOutlined />} 
              onClick={() => setFilters({ type: '', year: '', study_year: '' })}
              className="bg-[#90278E] hover:bg-[#7B1A73]"
            >
              ล้างตัวกรอง
            </Button>
          </Space>
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredProjects}
          rowKey="projectId"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'ไม่มีโปรเจคที่รอการอนุมัติ' }}
        />
      </Card>

      {/* Reject Modal */}
      <Modal
        title={
          <Space>
            <CloseCircleOutlined style={{ color: '#f5222d' }} />
            <span>ปฏิเสธโปรเจค</span>
          </Space>
        }
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setRejectModalVisible(false)}>
            ยกเลิก
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={isReviewing}
            onClick={handleReject}
          >
            ปฏิเสธโปรเจค
          </Button>,
        ]}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="rejectReason"
            label="เหตุผลในการปฏิเสธโปรเจค"
            rules={[{ required: true, message: 'กรุณาระบุเหตุผลในการปฏิเสธ' }]}
          >
            <TextArea
              rows={4}
              placeholder="ระบุเหตุผลในการปฏิเสธโปรเจค"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </Form.Item>
          <div className="mt-4 bg-yellow-50 p-3 rounded-md border border-yellow-100">
            <Text type="warning" className="flex items-start">
              <ExclamationCircleOutlined className="mr-2 mt-1" />
              <span>หมายเหตุ: เหตุผลในการปฏิเสธจะถูกส่งไปให้นักศึกษาที่เป็นเจ้าของโปรเจค</span>
            </Text>
          </div>
        </Form>
      </Modal>

      {/* Project Details Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: '#90278E' }} />
            <span>รายละเอียดโปรเจค</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="back" onClick={() => setDetailModalVisible(false)}>
            ปิด
          </Button>,
          <Button
            key="approve"
            type="primary"
            className="bg-green-600 hover:bg-green-700"
            icon={<CheckCircleOutlined />}
            onClick={() => {
              setDetailModalVisible(false);
              handleApprove(selectedProject?.projectId);
            }}
          >
            อนุมัติ
          </Button>,
          <Button
            key="reject"
            type="primary"
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => {
              setDetailModalVisible(false);
              showRejectModal(selectedProject);
            }}
          >
            ปฏิเสธ
          </Button>,
        ]}
      >
        {detailLoading ? (
          <div className="flex justify-center items-center py-10">
            <Spin size="large" />
          </div>
        ) : projectDetails ? (
          <div>
            <Tabs defaultActiveKey="1">
              <TabPane tab="ข้อมูลทั่วไป" key="1">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <Text type="secondary">ชื่อโปรเจค</Text>
                      <div className="text-lg font-medium">{projectDetails.title}</div>
                    </div>
                    
                    <div className="mb-4">
                      <Text type="secondary">ประเภท</Text>
                      <div>
                        <Tag color={getTagColor(projectDetails.category)} icon={<TagOutlined />}>
                          {getCategoryName(projectDetails.category)}
                        </Tag>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <Text type="secondary">ชั้นปี / ปีการศึกษา</Text>
                      <div>
                        {projectDetails.level || 'ไม่ระบุ'} / {projectDetails.year || 'ไม่ระบุ'}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <Text type="secondary">วันที่สร้าง</Text>
                      <div>
                        {projectDetails.projectCreatedAt
                          ? new Date(projectDetails.projectCreatedAt).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'ไม่ระบุ'}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    {projectDetails.files?.some(file => file.fileType === 'image') && (
                      <div className="mb-4">
                        <Image
                          src={projectDetails.files.find(file => file.fileType === 'image')?.filePath}
                          alt={projectDetails.title}
                          className="w-full rounded-md"
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <Divider />
                
                <div className="mb-6">
                  <Text type="secondary">คำอธิบายโปรเจค</Text>
                  <div className="mt-1 p-4 bg-gray-50 rounded-md">
                    {projectDetails.description || 'ไม่มีคำอธิบาย'}
                  </div>
                </div>
                
                {projectDetails.tags && (
                  <div className="mb-6">
                    <Text type="secondary">แท็ก</Text>
                    <div className="mt-1">
                      {projectDetails.tags.split(',').map((tag, index) => (
                        <Tag key={index} color="purple" className="my-1">
                          {tag.trim()}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
                
                {projectDetails.authors?.length > 0 && (
                  <div className="mb-6">
                    <Text type="secondary">ผู้จัดทำ</Text>
                    <div className="mt-2 flex flex-wrap gap-4">
                      {projectDetails.authors.map((author, index) => (
                        <div key={index} className="text-center">
                          <Avatar
                            src={author.image}
                            size={64}
                            className="mb-2 border-2 border-gray-200"
                          >
                            {author.fullName?.[0] || 'U'}
                          </Avatar>
                          <div className="text-sm">{author.fullName}</div>
                          <div className="text-xs text-gray-500">{author.userId}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabPane>
              
              <TabPane tab="ไฟล์แนบ" key="2">
                {projectDetails.files?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projectDetails.files.map((file, index) => (
                      <Card key={index} size="small" className="flex">
                        <div className="flex items-center">
                          {file.fileType === 'image' ? (
                            <div className="w-16 h-16 mr-4 rounded bg-gray-200 flex items-center justify-center overflow-hidden">
                              <img src={file.filePath} alt={file.fileName} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-16 h-16 mr-4 rounded bg-gray-200 flex items-center justify-center">
                              <FileTextOutlined style={{ fontSize: 24, color: '#90278E' }} />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{file.fileName}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {file.fileType.toUpperCase()} - 
                              <a href={file.filePath} target="_blank" rel="noopener noreferrer" className="ml-1 text-[#90278E]">
                                ดูไฟล์
                              </a>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    ไม่มีไฟล์แนบ
                  </div>
                )}
              </TabPane>
              
              {projectDetails.category === 'academic' && projectDetails.academicPaper && (
                <TabPane tab="ข้อมูลบทความวิชาการ" key="3">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="mb-4">
                        <Text type="secondary">ปีที่ตีพิมพ์</Text>
                        <div>{projectDetails.academicPaper.published_year || 'ไม่ระบุ'}</div>
                      </div>
                      
                      <div className="mb-4">
                        <Text type="secondary">วันที่ตีพิมพ์</Text>
                        <div>
                          {projectDetails.academicPaper.publication_date
                            ? new Date(projectDetails.academicPaper.publication_date).toLocaleDateString('th-TH')
                            : 'ไม่ระบุ'}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <Text type="secondary">สถานที่ตีพิมพ์</Text>
                        <div>{projectDetails.academicPaper.publication_venue || 'ไม่ระบุ'}</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="mb-4">
                        <Text type="secondary">ผู้เขียน</Text>
                        <div>{projectDetails.academicPaper.authors || 'ไม่ระบุ'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <Text type="secondary">บทคัดย่อ</Text>
                    <div className="mt-1 p-4 bg-gray-50 rounded-md">
                      {projectDetails.academicPaper.abstract || 'ไม่มีบทคัดย่อ'}
                    </div>
                  </div>
                </TabPane>
              )}
              
              {projectDetails.category === 'competition' && projectDetails.competition && (
                <TabPane tab="ข้อมูลการแข่งขัน" key="3">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="mb-4">
                        <Text type="secondary">ชื่อการแข่งขัน</Text>
                        <div>{projectDetails.competition.competition_name || 'ไม่ระบุ'}</div>
                      </div>
                      
                      <div className="mb-4">
                        <Text type="secondary">ปีที่แข่งขัน</Text>
                        <div>{projectDetails.competition.competition_year || 'ไม่ระบุ'}</div>
                      </div>
                      
                      <div className="mb-4">
                        <Text type="secondary">ระดับการแข่งขัน</Text>
                        <div>{projectDetails.competition.competition_level || 'ไม่ระบุ'}</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="mb-4">
                        <Text type="secondary">ผลงานที่ได้รับ</Text>
                        <div>{projectDetails.competition.achievement || 'ไม่ระบุ'}</div>
                      </div>
                      
                      <div className="mb-4">
                        <Text type="secondary">รายชื่อสมาชิกในทีม</Text>
                        <div>{projectDetails.competition.team_members || 'ไม่ระบุ'}</div>
                      </div>
                    </div>
                  </div>
                </TabPane>
              )}
              
              {projectDetails.category === 'coursework' && projectDetails.coursework && (
                <TabPane tab="ข้อมูลงานเรียน" key="3">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="mb-4">
                        <Text type="secondary">รหัสวิชา</Text>
                        <div>{projectDetails.coursework.course_code || 'ไม่ระบุ'}</div>
                      </div>
                      
                      <div className="mb-4">
                        <Text type="secondary">ชื่อวิชา</Text>
                        <div>{projectDetails.coursework.course_name || 'ไม่ระบุ'}</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="mb-4">
                        <Text type="secondary">อาจารย์ผู้สอน</Text>
                        <div>{projectDetails.coursework.instructor || 'ไม่ระบุ'}</div>
                      </div>
                    </div>
                  </div>
                </TabPane>
              )}
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            ไม่พบข้อมูลโปรเจค
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProjectReview;