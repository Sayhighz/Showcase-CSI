import React from 'react';
import { 
  Typography, Descriptions, Divider, Tag
} from 'antd';
import { TagOutlined } from '@ant-design/icons';
import { 
  getCategoryName, 
  formatThaiDate, 
  getStatusName 
} from '../../utils/projectUtils';

const { Text, Paragraph } = Typography;

const ProjectGeneralInfo = ({ project }) => {
  // Render additional details based on project type
  const renderTypeSpecificDetails = () => {
    if (project.type === 'academic' && project.academic) {
      return (
        <>
          <Divider orientation="left">ข้อมูลบทความวิชาการ</Divider>
          <Descriptions bordered column={{ xs: 1, sm: 2 }} className="mb-4">
            <Descriptions.Item label="วันที่ตีพิมพ์">{formatThaiDate(project.academic.publication_date)}</Descriptions.Item>
            <Descriptions.Item label="ปีที่ตีพิมพ์">{project.academic.published_year}</Descriptions.Item>
            <Descriptions.Item label="แหล่งตีพิมพ์">{project.academic.publication_venue || '-'}</Descriptions.Item>
            <Descriptions.Item label="ผู้เขียน">{project.academic.authors || '-'}</Descriptions.Item>
          </Descriptions>
          {project.academic.abstract && (
            <div className="mb-4">
              <Text strong>บทคัดย่อ:</Text>
              <Paragraph className="whitespace-pre-line mt-2 bg-gray-50 p-4 rounded-md">
                {project.academic.abstract}
              </Paragraph>
            </div>
          )}
        </>
      );
    }

    if (project.type === 'competition' && project.competition) {
      return (
        <>
          <Divider orientation="left">ข้อมูลการแข่งขัน</Divider>
          <Descriptions bordered column={{ xs: 1, sm: 2 }} className="mb-4">
            <Descriptions.Item label="ชื่อการแข่งขัน">{project.competition.competition_name}</Descriptions.Item>
            <Descriptions.Item label="ปีที่จัดการแข่งขัน">{project.competition.competition_year}</Descriptions.Item>
            <Descriptions.Item label="ระดับการแข่งขัน">
              {(() => {
                switch(project.competition.competition_level) {
                  case 'department': return 'ระดับภาควิชา';
                  case 'faculty': return 'ระดับคณะ';
                  case 'university': return 'ระดับมหาวิทยาลัย';
                  case 'national': return 'ระดับประเทศ';
                  case 'international': return 'ระดับนานาชาติ';
                  default: return project.competition.competition_level || '-';
                }
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="ผลการแข่งขัน">{project.competition.achievement || '-'}</Descriptions.Item>
          </Descriptions>
          {project.competition.team_members && (
            <div className="mb-4">
              <Text strong>สมาชิกในทีม:</Text>
              <Paragraph className="whitespace-pre-line mt-2 bg-gray-50 p-4 rounded-md">
                {project.competition.team_members}
              </Paragraph>
            </div>
          )}
        </>
      );
    }

    if (project.type === 'coursework' && project.coursework) {
      return (
        <>
          <Divider orientation="left">ข้อมูลรายวิชา</Divider>
          <Descriptions bordered column={{ xs: 1, sm: 2 }} className="mb-4">
            <Descriptions.Item label="รหัสวิชา">{project.coursework.course_code || '-'}</Descriptions.Item>
            <Descriptions.Item label="ชื่อวิชา">{project.coursework.course_name || '-'}</Descriptions.Item>
            <Descriptions.Item label="อาจารย์ผู้สอน">{project.coursework.instructor || '-'}</Descriptions.Item>
          </Descriptions>
        </>
      );
    }

    return null;
  };

  return (
    <>
      <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} className="mb-4">
        <Descriptions.Item label="รหัสโปรเจค">{project.project_id}</Descriptions.Item>
        <Descriptions.Item label="ประเภท">{getCategoryName(project.type)}</Descriptions.Item>
        <Descriptions.Item label="ชั้นปี">ปี {project.study_year}</Descriptions.Item>
        <Descriptions.Item label="ปีการศึกษา">{project.year}</Descriptions.Item>
        <Descriptions.Item label="ภาคการศึกษา">{project.semester}</Descriptions.Item>
        <Descriptions.Item label="จำนวนการเข้าชม">{project.views_count || 0}</Descriptions.Item>
        <Descriptions.Item label="สร้างเมื่อ">{formatThaiDate(project.created_at)}</Descriptions.Item>
        <Descriptions.Item label="แก้ไขล่าสุด">{formatThaiDate(project.updated_at)}</Descriptions.Item>
        <Descriptions.Item label="สถานะ">{getStatusName(project.status)}</Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">รายละเอียด</Divider>
      <Paragraph className="whitespace-pre-line mb-4">
        {project.description || 'ไม่มีรายละเอียด'}
      </Paragraph>

      {project.tags && (
        <>
          <Divider orientation="left">แท็ก</Divider>
          <div className="mb-4">
            {project.tags.split(',').map((tag, index) => (
              <Tag key={index} color="purple" icon={<TagOutlined />} className="mb-2 mr-2">
                {tag.trim()}
              </Tag>
            ))}
          </div>
        </>
      )}

      {renderTypeSpecificDetails()}
    </>
  );
};

export default ProjectGeneralInfo;