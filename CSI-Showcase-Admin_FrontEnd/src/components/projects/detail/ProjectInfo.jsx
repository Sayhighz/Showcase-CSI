import React from 'react';
import { 
  Card, Descriptions, Tag, Typography, Divider, Button 
} from 'antd';
import { 
  CheckCircleOutlined, CloseCircleOutlined 
} from '@ant-design/icons';
import { formatThaiDate } from '../../../utils/dataUtils';
import { getCategoryName, getCategoryColor, getStatusName, getStatusColor } from '../../../utils/projectUtils';
import { URL } from '../../../constants/apiEndpoints';

const { Title, Paragraph } = Typography;

const ProjectInfo = ({ 
  projectDetails, 
  onApprove, 
  onReject 
}) => {
  // แสดงสถานะของโปรเจค
  const renderProjectStatus = () => {
    if (!projectDetails) return null;
    
    const { status } = projectDetails;
    
    return (
      <Tag color={getStatusColor(status)} style={{ padding: '4px 8px', fontSize: '14px' }}>
        {getStatusName(status)}
      </Tag>
    );
  };

  return (
    <Card 
      title="ข้อมูลโปรเจค" 
      className="shadow-md"
      extra={renderProjectStatus()}
    >
      <div className="space-y-6">
        {/* รูปปกโปรเจค */}
        {projectDetails.image && (
          <div className="mb-5">
            <img 
              src={`${URL}/${projectDetails.image}`} 
              alt={projectDetails.title} 
              className="w-full h-60 object-cover rounded-lg shadow-md"
            />
          </div>
        )}
        
        <Descriptions 
          bordered 
          column={{ xs: 1, sm: 2 }}
          size="middle"
        >
          <Descriptions.Item label="ประเภทโปรเจค">
            <Tag color={getCategoryColor(projectDetails.type)}>
              {getCategoryName(projectDetails.type)}
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="ปีการศึกษา">
            {projectDetails.year || '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label="ชั้นปี">
            {projectDetails.study_year ? `ปี ${projectDetails.study_year}` : '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label="ภาคการศึกษา">
            {projectDetails.semester === '1' ? 'ภาคต้น' : 
             projectDetails.semester === '2' ? 'ภาคปลาย' : 
             projectDetails.semester === '3' ? 'ภาคฤดูร้อน' : '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label="วันที่สร้าง" span={2}>
            {formatThaiDate(projectDetails.created_at, { dateStyle: 'full' })}
          </Descriptions.Item>
          
          <Descriptions.Item label="การแสดงผล" span={2}>
            {projectDetails.visibility === 1 ? 
              <Tag color="green">เปิดเผย</Tag> : 
              <Tag color="orange">ไม่เปิดเผย</Tag>}
          </Descriptions.Item>
          
          <Descriptions.Item label="จำนวนการเข้าชม" span={2}>
            {projectDetails.views_count || 0} ครั้ง
          </Descriptions.Item>
        </Descriptions>
        
        <Divider orientation="left">รายละเอียด</Divider>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <Paragraph>
            {projectDetails.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
          </Paragraph>
        </div>
        
        {/* ถ้าโปรเจคกำลังรออนุมัติ แสดงปุ่มอนุมัติและปฏิเสธ */}
        {projectDetails.status === 'pending' && (
          <div className="flex justify-center space-x-4 mt-6">
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              size="large"
              onClick={onApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              อนุมัติโปรเจค
            </Button>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              size="large"
              onClick={onReject}
            >
              ปฏิเสธโปรเจค
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProjectInfo;