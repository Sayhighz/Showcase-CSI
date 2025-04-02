import React from 'react';
import { Modal, Button, Tag, Typography, Spin } from 'antd';
import { 
  FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, 
  InfoCircleOutlined, BookOutlined, TeamOutlined, TrophyOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

/**
 * คอมโพเนนต์หน้าต่างสำหรับตรวจสอบโปรเจค
 */
const ProjectReviewModal = ({ 
  visible, 
  setVisible, 
  project, 
  handleApprove, 
  showRejectModal 
}) => {
  const navigate = useNavigate();

  // ถ้าไม่มีข้อมูลโปรเจค ให้แสดง loading
  if (!project) {
    return (
      <Modal
        title={
          <div className="flex items-center">
            <FileTextOutlined className="mr-2 text-[#90278E]" />
            <span>ตรวจสอบโปรเจค</span>
          </div>
        }
        open={visible}
        onCancel={() => setVisible(false)}
        footer={[
          <Button key="close" onClick={() => setVisible(false)}>
            ปิด
          </Button>
        ]}
        width={700}
      >
        <div className="text-center py-10">
          <Spin />
          <div className="mt-3">กำลังโหลดข้อมูล...</div>
        </div>
      </Modal>
    );
  }

  // Convert category name to Thai
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

  // Get color for category tag
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

  // Get icon for category
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

  // Convert status name to Thai
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

  // Get color for status tag
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

  return (
    <Modal
      title={
        <div className="flex items-center">
          <FileTextOutlined className="mr-2 text-[#90278E]" />
          <span>ตรวจสอบโปรเจค</span>
        </div>
      }
      open={visible}
      onCancel={() => setVisible(false)}
      footer={[
        <Button key="close" onClick={() => setVisible(false)}>
          ปิด
        </Button>,
        <Button
          key="detail"
          type="default"
          onClick={() => {
            setVisible(false);
            navigate(`/projects/${project.project_id}`);
          }}
        >
          ดูรายละเอียดเพิ่มเติม
        </Button>,
        <Button
          key="approve"
          type="primary"
          className="bg-green-600 hover:bg-green-700"
          onClick={() => {
            setVisible(false);
            handleApprove(project);
          }}
          disabled={project.status !== 'pending'}
        >
          อนุมัติ
        </Button>,
        <Button
          key="reject"
          type="primary"
          danger
          onClick={() => {
            setVisible(false);
            showRejectModal(project);
          }}
          disabled={project.status !== 'pending'}
        >
          ปฏิเสธ
        </Button>,
      ]}
      width={700}
      destroyOnClose
    >
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Text strong>ชื่อโปรเจค:</Text>
          <div className="mt-1">{project.title}</div>
        </div>
        
        <div>
          <Text strong>ประเภท:</Text>
          <div className="mt-1">
            <Tag color={getCategoryColor(project.type)} icon={getCategoryIcon(project.type)}>
              {getCategoryName(project.type)}
            </Tag>
          </div>
        </div>
        
        <div>
          <Text strong>สถานะ:</Text>
          <div className="mt-1">
            <Tag color={getStatusColor(project.status)}>
              {getStatusName(project.status)}
            </Tag>
          </div>
        </div>
        
        <div>
          <Text strong>ชั้นปี/ปีการศึกษา:</Text>
          <div className="mt-1">
            {project.level || `ปี ${project.study_year}` || 'ไม่ระบุ'} / {project.year || 'ไม่ระบุ'}
          </div>
        </div>
        
        <div>
          <Text strong>เจ้าของ:</Text>
          <div className="mt-1">{project.full_name || 'ไม่ระบุ'}</div>
        </div>
        
        <div>
          <Text strong>วันที่สร้าง:</Text>
          <div className="mt-1">
            {project.created_at
              ? new Date(project.created_at).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'ไม่ระบุ'}
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <Text strong>รายละเอียด:</Text>
        <div className="mt-1 p-3 bg-gray-50 rounded-md">
          {project.description || 'ไม่มีรายละเอียด'}
        </div>
      </div>
      
      {project.tags && (
        <div className="mb-4">
          <Text strong>แท็ก:</Text>
          <div className="mt-1">
            {project.tags.split(',').map((tag, index) => (
              <Tag key={index} color="purple" className="mr-1 mb-1">
                {tag.trim()}
              </Tag>
            ))}
          </div>
        </div>
      )}
      
      {project.status === 'pending' && (
        <div className="mt-6 bg-blue-50 p-3 rounded-md border border-blue-100">
          <Text type="secondary" className="flex items-start">
            <InfoCircleOutlined className="mr-2 mt-1" />
            <span>
              โปรเจคนี้กำลังรอการตรวจสอบ โปรดตรวจสอบรายละเอียดให้ครบถ้วนก่อนทำการอนุมัติหรือปฏิเสธ
            </span>
          </Text>
        </div>
      )}
    </Modal>
  );
};

export default ProjectReviewModal;