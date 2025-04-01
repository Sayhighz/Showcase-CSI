import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, Tabs, Descriptions, Image, Button, Tag, Space, Spin, 
  Typography, Divider, message, Modal, Form, Input, Empty, Timeline,
  Badge, Avatar, List, Tooltip, Alert
} from 'antd';
import { 
  CheckCircleOutlined, CloseCircleOutlined, RollbackOutlined,
  FileTextOutlined, EyeOutlined, FileImageOutlined, 
  VideoCameraOutlined, BookOutlined, TeamOutlined, TrophyOutlined,
  TagOutlined, CalendarOutlined, UserOutlined, ExclamationCircleOutlined,
  HistoryOutlined, DownloadOutlined
} from '@ant-design/icons';
import { getProjectDetail, reviewProject, deleteProject } from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const ProjectDetail = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { admin } = useAuth();

  // โหลดข้อมูลโปรเจค
  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const data = await getProjectDetail(projectId);
        setProject(data);
        
        // สมมติว่าเรามีข้อมูลประวัติการตรวจสอบโปรเจคด้วย
        setReviewHistory([
          {
            status: 'pending',
            reviewer: 'ระบบ',
            date: data.created_at,
            comment: 'เพิ่มโปรเจคเข้าสู่ระบบ รอการตรวจสอบ'
          },
          // อาจจะมีประวัติการตรวจสอบอื่นๆ ถ้ามี
        ]);
      } catch (error) {
        console.error('Failed to load project:', error);
        message.error('ไม่สามารถโหลดข้อมูลโปรเจคได้');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  // ฟังก์ชันเปลี่ยนชื่อประเภทโปรเจคให้เป็นภาษาไทย
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

  // ฟังก์ชันเปลี่ยนชื่อสถานะโปรเจคให้เป็นภาษาไทย
  const getStatusName = (status) => {
    switch (status) {
      case 'approved':
        return 'อนุมัติแล้ว';
      case 'pending':
        return 'รอตรวจสอบ';
      case 'rejected':
        return 'ถูกปฏิเสธ';
      default:
        return status;
    }
  };

  // ฟังก์ชันเลือกสีของแท็กสถานะ
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  // ฟังก์ชันเลือกสีของแท็กประเภท
  const getCategoryColor = (category) => {
    switch (category) {
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

  // ฟังก์ชันแสดงไอคอนตามประเภทโปรเจค
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'academic':
        return <BookOutlined />;
      case 'coursework':
        return <TeamOutlined />;
      case 'competition':
        return <TrophyOutlined />;
      default:
        return null;
    }
  };

  // จัดการการอนุมัติโปรเจค
  const handleApprove = () => {
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
          
          // อัปเดตข้อมูลโปรเจคหลังจากอนุมัติ
          setProject(prev => ({
            ...prev,
            status: 'approved'
          }));
          
          // เพิ่มประวัติการตรวจสอบ
          setReviewHistory(prev => [
            ...prev,
            {
              status: 'approved',
              reviewer: admin.username,
              date: new Date().toISOString(),
              comment: 'อนุมัติโปรเจค'
            }
          ]);
        } catch (error) {
          console.error('Approval failed:', error);
          message.error('ไม่สามารถอนุมัติโปรเจคได้');
        } finally {
          setIsReviewing(false);
        }
      }
    });
  };

  // แสดงโมดัลปฏิเสธโปรเจค
  const showRejectModal = () => {
    form.resetFields();
    setRejectReason('');
    setRejectModalVisible(true);
  };

  // จัดการการปฏิเสธโปรเจค
  const handleReject = async () => {
    try {
      await form.validateFields();
      setConfirmLoading(true);
      
      try {
        await reviewProject(projectId, 'rejected', rejectReason);
        message.success('ปฏิเสธโปรเจคสำเร็จ');
        setRejectModalVisible(false);
        
        // อัปเดตข้อมูลโปรเจคหลังจากปฏิเสธ
        setProject(prev => ({
          ...prev,
          status: 'rejected'
        }));
        
        // เพิ่มประวัติการตรวจสอบ
        setReviewHistory(prev => [
          ...prev,
          {
            status: 'rejected',
            reviewer: admin.username,
            date: new Date().toISOString(),
            comment: rejectReason || 'ปฏิเสธโปรเจค'
          }
        ]);
      } catch (error) {
        console.error('Rejection failed:', error);
        message.error('ไม่สามารถปฏิเสธโปรเจคได้');
      } finally {
        setConfirmLoading(false);
      }
    } catch (error) {
      // ตรวจสอบฟอร์มไม่ผ่าน
      console.error('Validation failed:', error);
    }
  };

  // แสดงโมดัลลบโปรเจค
  const showDeleteModal = () => {
    setDeleteModalVisible(true);
  };

  // จัดการการลบโปรเจค
  const handleDelete = async () => {
    setConfirmLoading(true);
    try {
      await deleteProject(projectId);
      message.success('ลบโปรเจคสำเร็จ');
      setDeleteModalVisible(false);
      
      // กลับไปยังหน้ารายการโปรเจค
      navigate('/projects');
    } catch (error) {
      console.error('Delete failed:', error);
      message.error('ไม่สามารถลบโปรเจคได้');
    } finally {
      setConfirmLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" tip="กำลังโหลดข้อมูลโปรเจค..." />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <Empty
          description="ไม่พบข้อมูลโปรเจค"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button 
            type="primary" 
            onClick={() => navigate('/projects')}
            className="bg-[#90278E]"
          >
            กลับไปยังรายการโปรเจค
          </Button>
        </Empty>
      </div>
    );
  }

  // ดึงรูปภาพจากไฟล์ที่เกี่ยวข้อง
  const getImages = () => {
    if (!project.files) return [];
    return project.files.filter(file => file.fileType === 'image').map(file => file.filePath);
  };

  // ดึงไฟล์ PDF จากไฟล์ที่เกี่ยวข้อง
  const getPdfFiles = () => {
    if (!project.files) return [];
    return project.files.filter(file => file.fileType === 'pdf');
  };

  // ดึงไฟล์วิดีโอจากไฟล์ที่เกี่ยวข้อง
  const getVideos = () => {
    if (!project.files) return [];
    return project.files.filter(file => file.fileType === 'video');
  };

  // แปลง YouTube URL เป็น embed URL
  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com')) return url.replace("watch?v=", "embed/");
    if (url.includes('tiktok.com')) return `https://www.tiktok.com/embed/${url.split('/').pop()}`;
    if (url.includes('facebook.com')) return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}`;
    return url;
  };

  return (
    <div className="p-6">
      <Card 
        title={
          <div className="flex items-center">
            <FileTextOutlined className="mr-2 text-[#90278E]" /> 
            <span>รายละเอียดโปรเจค</span>
            
            <div className="ml-4">
              <Badge.Ribbon 
                text={getStatusName(project.status)} 
                color={getStatusColor(project.status)}
              />
            </div>
          </div>
        }
        className="shadow-sm"
        extra={
          <Space>
            <Button 
              icon={<RollbackOutlined />} 
              onClick={() => navigate('/projects')}
            >
              กลับ
            </Button>
            
            {project.status === 'pending' && (
              <>
                <Button 
                  type="primary" 
                  icon={<CheckCircleOutlined />} 
                  onClick={handleApprove}
                  loading={isReviewing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  อนุมัติ
                </Button>
                
                <Button 
                  type="primary" 
                  danger 
                  icon={<CloseCircleOutlined />} 
                  onClick={showRejectModal}
                  loading={isReviewing}
                >
                  ปฏิเสธ
                </Button>
              </>
            )}
            
            <Button 
              danger 
              icon={<ExclamationCircleOutlined />} 
              onClick={showDeleteModal}
            >
              ลบโปรเจค
            </Button>
          </Space>
        }
      >
        <Tabs defaultActiveKey="1">
          {/* แท็บข้อมูลทั่วไป */}
          <TabPane 
            tab={<span><FileTextOutlined /> ข้อมูลทั่วไป</span>} 
            key="1"
          >
            <Descriptions 
              bordered 
              column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
              className="mb-6"
            >
              <Descriptions.Item label="ชื่อโปรเจค" span={2}>
                {project.title}
              </Descriptions.Item>
              
              <Descriptions.Item label="ประเภท">
                <Tag color={getCategoryColor(project.category)} icon={getCategoryIcon(project.category)}>
                  {getCategoryName(project.category)}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="สถานะ">
                <Tag color={getStatusColor(project.status)}>
                  {getStatusName(project.status)}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="ชั้นปี">
                {project.level || 'ไม่ระบุ'}
              </Descriptions.Item>
              
              <Descriptions.Item label="ปีการศึกษา">
                {project.year || 'ไม่ระบุ'}
              </Descriptions.Item>
              
              <Descriptions.Item label="ภาคการศึกษา">
                {project.semester ? `ภาคการศึกษาที่ ${project.semester}` : 'ไม่ระบุ'}
              </Descriptions.Item>
              
              <Descriptions.Item label="การมองเห็น">
                {project.visibility === 1 ? (
                  <Tag color="blue" icon={<EyeOutlined />}>สาธารณะ</Tag>
                ) : (
                  <Tag color="default">ส่วนตัว</Tag>
                )}
              </Descriptions.Item>
              
              <Descriptions.Item label="วันที่สร้าง">
                {project.projectCreatedAt ? new Date(project.projectCreatedAt).toLocaleString('th-TH') : 'ไม่ระบุ'}
              </Descriptions.Item>
              
              <Descriptions.Item label="แท็ก" span={2}>
                {project.tags ? project.tags.split(',').map((tag, index) => (
                  <Tag key={index} color="purple" icon={<TagOutlined />}>
                    {tag.trim()}
                  </Tag>
                )) : 'ไม่มีแท็ก'}
              </Descriptions.Item>
              
              <Descriptions.Item label="รายละเอียด" span={2}>
                {project.description || 'ไม่มีรายละเอียด'}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider orientation="left">รูปภาพ</Divider>
            
            {getImages().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                {getImages().map((image, index) => (
                  <div key={index} className="border rounded-md p-2">
                    <Image
                      src={image}
                      alt={`รูปภาพ ${index + 1}`}
                      className="w-full h-40 object-cover mb-2"
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="
                    />
                    <p className="text-xs text-gray-500 truncate">
                      {project.files.find(f => f.filePath === image)?.fileName || 'ไม่ระบุชื่อไฟล์'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                ไม่มีรูปภาพ
              </p>
            )}
            
            <Divider orientation="left">ผู้จัดทำ</Divider>
            
            {project.authors && project.authors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                {project.authors.map((author, index) => (
                  <Card key={index} size="small" className="flex flex-col items-center text-center">
                    <Avatar 
                      src={author.image} 
                      size={64}
                      icon={<UserOutlined />}
                      className="mb-2"
                    />
                    <p className="font-medium">{author.fullName}</p>
                    <p className="text-xs text-gray-500">{author.userId}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                ไม่มีข้อมูลผู้จัดทำ
              </p>
            )}
          </TabPane>
          
          {/* แท็บข้อมูลเพิ่มเติมตามประเภทโปรเจค */}
          {project.category === 'academic' && project.academicPaper && (
            <TabPane 
              tab={<span><BookOutlined /> ข้อมูลบทความวิชาการ</span>} 
              key="2"
            >
              <Descriptions 
                bordered 
                column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                className="mb-6"
              >
                <Descriptions.Item label="ปีที่ตีพิมพ์">
                  {project.academicPaper.published_year || 'ไม่ระบุ'}
                </Descriptions.Item>
                
                <Descriptions.Item label="วันที่ตีพิมพ์">
                  {project.academicPaper.publication_date
                    ? new Date(project.academicPaper.publication_date).toLocaleDateString('th-TH')
                    : 'ไม่ระบุ'}
                </Descriptions.Item>
                
                <Descriptions.Item label="สถานที่ตีพิมพ์" span={2}>
                  {project.academicPaper.publication_venue || 'ไม่ระบุ'}
                </Descriptions.Item>
                
                <Descriptions.Item label="ผู้เขียน" span={2}>
                  {project.academicPaper.authors || 'ไม่ระบุ'}
                </Descriptions.Item>
                
                <Descriptions.Item label="บทคัดย่อ" span={2}>
                  {project.academicPaper.abstract || 'ไม่มีบทคัดย่อ'}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
          )}
          
          {project.category === 'competition' && project.competition && (
            <TabPane 
              tab={<span><TrophyOutlined /> ข้อมูลการแข่งขัน</span>} 
              key="2"
            >
              <Descriptions 
                bordered 
                column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                className="mb-6"
              >
                <Descriptions.Item label="ชื่อการแข่งขัน">
                  {project.competition.competition_name || 'ไม่ระบุ'}
                </Descriptions.Item>
                
                <Descriptions.Item label="ปีที่แข่งขัน">
                  {project.competition.competition_year || 'ไม่ระบุ'}
                </Descriptions.Item>
                
                <Descriptions.Item label="ระดับการแข่งขัน">
                  {project.competition.competition_level ? (() => {
                    switch(project.competition.competition_level) {
                      case 'department': return 'ระดับภาควิชา';
                      case 'faculty': return 'ระดับคณะ';
                      case 'university': return 'ระดับมหาวิทยาลัย';
                      case 'national': return 'ระดับประเทศ';
                      case 'international': return 'ระดับนานาชาติ';
                      default: return project.competition.competition_level;
                    }
                  })() : 'ไม่ระบุ'}
                </Descriptions.Item>
                
                <Descriptions.Item label="ผลงานที่ได้รับ">
                  {project.competition.achievement || 'ไม่ระบุ'}
                </Descriptions.Item>
                
                <Descriptions.Item label="รายชื่อสมาชิกในทีม" span={2}>
                  {project.competition.team_members || 'ไม่ระบุ'}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
          )}
          
          {project.category === 'coursework' && project.coursework && (
            <TabPane 
              tab={<span><TeamOutlined /> ข้อมูลงานเรียน</span>} 
              key="2"
            >
              <Descriptions 
                bordered 
                column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                className="mb-6"
              >
                <Descriptions.Item label="รหัสวิชา">
                  {project.coursework.course_code || 'ไม่ระบุ'}
                </Descriptions.Item>
                
                <Descriptions.Item label="ชื่อวิชา">
                  {project.coursework.course_name || 'ไม่ระบุ'}
                </Descriptions.Item>
                
                <Descriptions.Item label="อาจารย์ผู้สอน" span={2}>
                  {project.coursework.instructor || 'ไม่ระบุ'}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
          )}
          
          {/* แท็บไฟล์แนบ */}
          <TabPane 
            tab={<span><FileTextOutlined /> ไฟล์แนบ</span>} 
            key="3"
          >
            <Title level={5}>ไฟล์ PDF</Title>
            {getPdfFiles().length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={getPdfFiles()}
                className="mb-6"
                renderItem={(file, index) => (
                  <List.Item
                    actions={[
                      <a href={file.filePath} target="_blank" rel="noopener noreferrer">
                        <Button icon={<EyeOutlined />}>ดู</Button>
                      </a>,
                      <a href={file.filePath} download>
                        <Button icon={<DownloadOutlined />}>ดาวน์โหลด</Button>
                      </a>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<FileTextOutlined />} />}
                      title={file.fileName}
                      description={`อัปโหลดเมื่อ: ${new Date(file.upload_date || new Date()).toLocaleString('th-TH')}`}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <p className="text-gray-500 mb-6">ไม่มีไฟล์ PDF</p>
            )}
            
            <Title level={5}>ไฟล์วิดีโอ</Title>
            {getVideos().length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={getVideos()}
                className="mb-6"
                renderItem={(file, index) => (
                  <List.Item
                    actions={[
                      <a href={file.filePath} target="_blank" rel="noopener noreferrer">
                        <Button icon={<EyeOutlined />}>ดู</Button>
                      </a>,
                      <a href={file.filePath} download>
                        <Button icon={<DownloadOutlined />}>ดาวน์โหลด</Button>
                      </a>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<VideoCameraOutlined />} />}
                      title={file.fileName}
                      description={`อัปโหลดเมื่อ: ${new Date(file.upload_date || new Date()).toLocaleString('th-TH')}`}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <p className="text-gray-500 mb-6">ไม่มีไฟล์วิดีโอ</p>
            )}
            
            {project.videoLink && (
              <div className="mb-6">
                <Title level={5}>วิดีโอจากลิงก์</Title>
                <div className="border rounded-md p-4">
                  <iframe
                    src={getEmbedUrl(project.videoLink)}
                    width="100%"
                    height="400"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="วิดีโอจากลิงก์"
                    className="mb-2"
                  ></iframe>
                  <Text type="secondary">ลิงก์: {project.videoLink}</Text>
                </div>
              </div>
            )}
          </TabPane>
          
          {/* แท็บประวัติการตรวจสอบ */}
          <TabPane 
            tab={<span><HistoryOutlined /> ประวัติการตรวจสอบ</span>} 
            key="4"
          >
            {reviewHistory.length > 0 ? (
              <Timeline mode="left" className="mt-6">
                {reviewHistory.map((record, index) => (
                  <Timeline.Item
                    key={index}
                    color={
                      record.status === 'approved' ? 'green' :
                      record.status === 'rejected' ? 'red' :
                      record.status === 'pending' ? 'orange' : 'blue'
                    }
                    label={new Date(record.date).toLocaleString('th-TH')}
                  >
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="font-medium">
                        <Tag color={getStatusColor(record.status)}>
                          {getStatusName(record.status)}
                        </Tag>
                        {' '}โดย: {record.reviewer}
                      </p>
                      <p className="mt-1">{record.comment}</p>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Empty description="ไม่มีประวัติการตรวจสอบ" />
            )}
          </TabPane>
        </Tabs>
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
            loading={confirmLoading}
            onClick={handleReject}
          >
            ปฏิเสธโปรเจค
          </Button>,
        ]}
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
      
      {/* Delete Modal */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#f5222d' }} />
            <span>ยืนยันการลบโปรเจค</span>
          </Space>
        }
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setDeleteModalVisible(false)}>
            ยกเลิก
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={confirmLoading}
            onClick={handleDelete}
          >
            ยืนยันการลบ
          </Button>,
        ]}
      >
        <Alert
          message="คำเตือน"
          description="การลบจะไม่สามารถกู้คืนได้ และข้อมูลทั้งหมดของโปรเจคจะถูกลบออกจากระบบ"
          type="error"
          showIcon
          className="mb-4"
        />
        <p>คุณต้องการลบโปรเจค "{project.title}" ใช่หรือไม่?</p>
      </Modal>
    </div>
  );
};

export default ProjectDetail;