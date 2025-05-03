import React, { useState } from 'react';
import { 
  Descriptions, 
  Card, 
  Typography, 
  Tag, 
  Button, 
  Tabs, 
  List, 
  Avatar, 
  Space, 
  Divider, 
  Image, 
  Tooltip, 
  Modal, 
  Badge,
  Timeline
} from 'antd';
import { 
  UserOutlined, 
  CalendarOutlined, 
  TagOutlined, 
  FileOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatThaiDate } from '../../utils/dataUtils';
import { getCategoryName, getCategoryColor, getStatusName, getStatusColor } from '../../utils/projectUtils';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorDisplay from '../common/ErrorDisplay';
import PageTitle from '../common/PageTitle';
import ProjectReviewForm from './ProjectReviewForm';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;

const ProjectDetail = ({
  project,
  loading = false,
  error = null,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState('info');
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [reviewAction, setReviewAction] = useState(null);

  if (loading) {
    return <LoadingSpinner tip="กำลังโหลดข้อมูลโครงงาน..." />;
  }

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={onRefresh}
      />
    );
  }

  if (!project) {
    return (
      <ErrorDisplay
        status="404"
        title="ไม่พบโครงงาน"
        subTitle="ไม่พบข้อมูลโครงงานที่คุณต้องการดู"
        onRetry={onRefresh}
      />
    );
  }

  // แสดงกล่องยืนยันการลบ
  // แสดงกล่องยืนยันการลบ
  const showDeleteConfirm = () => {
    confirm({
      title: 'ยืนยันการลบโครงงาน',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>คุณแน่ใจหรือไม่ที่ต้องการลบโครงงาน <Text strong>{project.title}</Text>?</p>
          <p>การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
        </div>
      ),
      okText: 'ใช่, ลบ',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk() {
        if (onDelete) {
          onDelete(project.project_id);
        }
      },
    });
  };

  // แสดงฟอร์มตรวจสอบในโมดัล
  const showReviewModal = (action) => {
    setReviewAction(action);
    setIsReviewModalVisible(true);
  };

  // ปิดโมดัลตรวจสอบ
  const handleReviewCancel = () => {
    setIsReviewModalVisible(false);
    setReviewAction(null);
  };

  // ดำเนินการตรวจสอบ
  const handleReview = (values) => {
    if (reviewAction === 'approve' && onApprove) {
      onApprove(project.project_id, values.comment);
    } else if (reviewAction === 'reject' && onReject) {
      onReject(project.project_id, values.comment);
    }
    
    setIsReviewModalVisible(false);
    setReviewAction(null);
  };

  // สร้างปุ่มกระทำ
  const getActionButtons = () => {
    const buttons = [];

    if (onEdit) {
      buttons.push({
        label: 'แก้ไข',
        icon: <EditOutlined />,
        onClick: () => onEdit(project.project_id),
      });
    }

    if (project.status === 'pending' && onApprove) {
      buttons.push({
        label: 'อนุมัติ',
        icon: <CheckCircleOutlined />,
        type: 'primary',
        style: { backgroundColor: '#52c41a', borderColor: '#52c41a' },
        onClick: () => showReviewModal('approve'),
      });
    }

    if (project.status === 'pending' && onReject) {
      buttons.push({
        label: 'ปฏิเสธ',
        icon: <CloseCircleOutlined />,
        danger: true,
        onClick: () => showReviewModal('reject'),
      });
    }

    if (onDelete) {
      buttons.push({
        label: 'ลบ',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: showDeleteConfirm,
      });
    }

    return buttons;
  };

  return (
    <div>
      <PageTitle
        title={project.title}
        subtitle={getCategoryName(project.type)}
        actions={getActionButtons()}
        back={
          <Link to="/projects">
            <Button type="text">กลับ</Button>
          </Link>
        }
      />

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-6">
            {project.image ? (
              <Image
                src={`/uploads/images/${project.image}`}
                alt={project.title}
                className="w-full rounded object-cover"
                style={{ maxHeight: 300 }}
                fallback="/images/project-placeholder.png"
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded flex items-center justify-center">
                <Text type="secondary">ไม่มีรูปภาพ</Text>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div>
                <div className="flex items-center">
                  <Badge
                    status={
                      project.status === 'approved' ? 'success' : 
                      project.status === 'rejected' ? 'error' : 'warning'
                    }
                    text={getStatusName(project.status)}
                    className="mr-2"
                  />
                  <Tag color={getCategoryColor(project.type)}>
                    {getCategoryName(project.type)}
                  </Tag>
                </div>
              </div>
              
              <div className="mt-2 md:mt-0">
                <Space>
                  <Tooltip title="จำนวนการเข้าชม">
                    <div className="flex items-center">
                      <EyeOutlined className="mr-1 text-gray-500" />
                      <Text>{project.views_count || 0}</Text>
                    </div>
                  </Tooltip>
                </Space>
              </div>
            </div>
            
            <Paragraph>
              {project.description || 'ไม่มีคำอธิบาย'}
            </Paragraph>
            
            <Divider className="my-3" />
            
            <Descriptions layout="vertical" column={{ xs: 1, sm: 2, md: 3 }} size="small">
              <Descriptions.Item label="ผู้สร้าง">
                <div className="flex items-center">
                  <Avatar 
                    src={project.user_image ? `/uploads/profiles/${project.user_image}` : null}
                    icon={!project.user_image && <UserOutlined />}
                    size="small"
                    className="mr-2"
                    style={{ 
                      backgroundColor: !project.user_image ? '#90278E' : undefined,
                    }}
                  />
                  <Link to={`/users/${project.user_id}`} className="hover:text-purple-700">
                    {project.username || project.full_name || 'ไม่ระบุชื่อ'}
                  </Link>
                </div>
              </Descriptions.Item>
              
              <Descriptions.Item label="วันที่สร้าง">
                <div className="flex items-center">
                  <CalendarOutlined className="mr-2 text-gray-500" />
                  <Text>{formatThaiDate(project.created_at, { dateStyle: 'full' })}</Text>
                </div>
              </Descriptions.Item>
              
              <Descriptions.Item label="ปีการศึกษา">
                <div className="flex items-center">
                  <Text>{project.year || 'ไม่ระบุ'}</Text>
                  {project.study_year && (
                    <Text type="secondary" className="ml-2">ชั้นปีที่ {project.study_year}</Text>
                  )}
                </div>
              </Descriptions.Item>
              
              {project.tags && (
                <Descriptions.Item label="แท็ก" span={3}>
                  <div className="flex items-center flex-wrap">
                    <TagOutlined className="mr-2 text-gray-500" />
                    {project.tags.split(',').map((tag, index) => (
                      <Tag key={index} className="mr-1 mb-1">{tag.trim()}</Tag>
                    ))}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        </div>
      </Card>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="รายละเอียด" key="info">
          <Card>
            <Descriptions layout="vertical" column={{ xs: 1, sm: 2 }} bordered>
              <Descriptions.Item label="ชื่อโครงงาน">{project.title}</Descriptions.Item>
              <Descriptions.Item label="ประเภท">{getCategoryName(project.type)}</Descriptions.Item>
              <Descriptions.Item label="สถานะ">{getStatusName(project.status)}</Descriptions.Item>
              <Descriptions.Item label="ปีการศึกษา">{project.year || 'ไม่ระบุ'}</Descriptions.Item>
              <Descriptions.Item label="ภาคการศึกษา">
                {project.semester === '1' && 'ภาคต้น'}
                {project.semester === '2' && 'ภาคปลาย'}
                {project.semester === '3' && 'ภาคฤดูร้อน'}
                {!project.semester && 'ไม่ระบุ'}
              </Descriptions.Item>
              <Descriptions.Item label="ชั้นปี">
                {project.study_year ? `ปี ${project.study_year}` : 'ไม่ระบุ'}
              </Descriptions.Item>
              
              {project.tags && (
                <Descriptions.Item label="แท็ก" span={2}>
                  <div className="flex flex-wrap">
                    {project.tags.split(',').map((tag, index) => (
                      <Tag key={index} className="mb-2 mr-2">{tag.trim()}</Tag>
                    ))}
                  </div>
                </Descriptions.Item>
              )}
              
              <Descriptions.Item label="วันที่สร้าง">{formatThaiDate(project.created_at, { dateStyle: 'full' })}</Descriptions.Item>
              <Descriptions.Item label="อัปเดตล่าสุด">{formatThaiDate(project.updated_at, { dateStyle: 'full' })}</Descriptions.Item>
              <Descriptions.Item label="จำนวนการเข้าชม">{project.views_count || 0}</Descriptions.Item>
              
              <Descriptions.Item label="รายละเอียด" span={2}>
                <Paragraph>
                  {project.description || 'ไม่มีรายละเอียด'}
                </Paragraph>
              </Descriptions.Item>
              
              {project.type === 'academic' && project.academic && (
                <>
                  <Descriptions.Item label="วันที่ตีพิมพ์">
                    {project.academic.publication_date ? formatThaiDate(project.academic.publication_date, { dateStyle: 'full' }) : 'ไม่ระบุ'}
                  </Descriptions.Item>
                  <Descriptions.Item label="ปีที่ตีพิมพ์">
                    {project.academic.published_year || 'ไม่ระบุ'}
                  </Descriptions.Item>
                </>
              )}
              
              {project.type === 'competition' && project.competition && (
                <>
                  <Descriptions.Item label="ชื่อการแข่งขัน">
                    {project.competition.competition_name || 'ไม่ระบุ'}
                  </Descriptions.Item>
                  <Descriptions.Item label="ปีที่แข่งขัน">
                    {project.competition.competition_year || 'ไม่ระบุ'}
                  </Descriptions.Item>
                </>
              )}
              
              {project.type === 'coursework' && project.coursework && (
                <>
                  <Descriptions.Item label="รหัสวิชา">
                    {project.coursework.course_code || 'ไม่ระบุ'}
                  </Descriptions.Item>
                  <Descriptions.Item label="ชื่อวิชา">
                    {project.coursework.course_name || 'ไม่ระบุ'}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          </Card>
        </TabPane>
        
        <TabPane tab="ไฟล์และรูปภาพ" key="files">
          <Card>
            {project.files && project.files.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={project.files}
                renderItem={file => (
                  <List.Item
                    actions={[
                      <Tooltip title="ดาวน์โหลด">
                        <Button 
                          type="text" 
                          icon={<DownloadOutlined />} 
                          href={`/uploads/${file.file_path}`}
                          target="_blank"
                        />
                      </Tooltip>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={<FileOutlined />} 
                          style={{ backgroundColor: '#90278E' }}
                        />
                      }
                      title={file.file_name}
                      description={
                        <Space>
                          <Text type="secondary">{file.file_type}</Text>
                          <Text type="secondary">{file.file_size ? (file.file_size / 1024).toFixed(2) + ' KB' : ''}</Text>
                          {file.upload_date && (
                            <Text type="secondary">อัปโหลดเมื่อ {formatThaiDate(file.upload_date, { dateStyle: 'medium' })}</Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-center p-8">
                <Text type="secondary">ยังไม่มีไฟล์หรือรูปภาพ</Text>
              </div>
            )}
          </Card>
        </TabPane>
        
        <TabPane tab="ผู้ร่วมงาน" key="contributors">
          <Card>
            {project.contributors && project.contributors.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={project.contributors}
                renderItem={contributor => (
                  <List.Item
                    actions={[
                      <Link to={`/users/${contributor.user_id}`}>
                        <Button type="link" icon={<LinkOutlined />}>ดูโปรไฟล์</Button>
                      </Link>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          src={contributor.image ? `/uploads/profiles/${contributor.image}` : null}
                          icon={!contributor.image && <UserOutlined />}
                          style={{ 
                            backgroundColor: !contributor.image ? '#90278E' : undefined,
                          }}
                        />
                      }
                      title={contributor.full_name || contributor.username}
                      description={
                        <Space>
                          <Text type="secondary">{contributor.username}</Text>
                          <Text type="secondary">{contributor.email}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-center p-8">
                <Text type="secondary">ยังไม่มีผู้ร่วมงาน</Text>
              </div>
            )}
          </Card>
        </TabPane>
        
        <TabPane tab="ประวัติการตรวจสอบ" key="reviews">
          <Card>
            {project.reviews && project.reviews.length > 0 ? (
              <Timeline>
                {project.reviews.map((review, index) => (
                  <Timeline.Item
                    key={index}
                    color={
                      review.status === 'approved' ? 'green' :
                      review.status === 'rejected' ? 'red' :
                      'blue'
                    }
                  >
                    <div>
                      <div className="flex items-center mb-2">
                        <Tag color={
                          review.status === 'approved' ? 'success' :
                          review.status === 'rejected' ? 'error' :
                          'processing'
                        }>
                          {review.status === 'approved' && 'อนุมัติ'}
                          {review.status === 'rejected' && 'ปฏิเสธ'}
                          {review.status === 'updated' && 'อัปเดต'}
                        </Tag>
                        <Text className="ml-2">
                          โดย <Link to={`/users/${review.admin_id}`}>{review.admin_name || review.admin_username}</Link>
                        </Text>
                      </div>
                      <div className="mb-2">
                        <Text>{review.review_comment || 'ไม่มีความคิดเห็น'}</Text>
                      </div>
                      <div>
                        <Text type="secondary">{formatThaiDate(review.reviewed_at, { dateStyle: 'full', timeStyle: 'short' })}</Text>
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <div className="text-center p-8">
                <Text type="secondary">ยังไม่มีประวัติการตรวจสอบ</Text>
              </div>
            )}
          </Card>
        </TabPane>
      </Tabs>
      
      <Modal
        title={reviewAction === 'approve' ? 'อนุมัติโครงงาน' : 'ปฏิเสธโครงงาน'}
        open={isReviewModalVisible}
        onCancel={handleReviewCancel}
        footer={null}
      >
        <ProjectReviewForm
          initialValues={{ action: reviewAction }}
          onFinish={handleReview}
          onCancel={handleReviewCancel}
        />
      </Modal>
    </div>
  );
};

export default ProjectDetail;