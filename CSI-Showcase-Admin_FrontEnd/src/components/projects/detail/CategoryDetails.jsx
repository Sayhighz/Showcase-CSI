import React from 'react';
import { Card, Descriptions, Button } from 'antd';
import { YoutubeOutlined, FileOutlined, DownloadOutlined } from '@ant-design/icons';
import { getCategoryName } from '../../../utils/projectUtils';
import { formatThaiDate } from '../../../utils/dataUtils';
import { URL } from '../../../constants/apiEndpoints';

const CategoryDetails = ({ projectDetails }) => {
  if (!projectDetails || !projectDetails.type) return null;
  
  const { type } = projectDetails;

  if (type === 'coursework' && projectDetails.coursework) {
    return (
      <Card 
        title={`ข้อมูล${getCategoryName(type)}`}
        className="shadow-md"
      >
        <Descriptions column={1} bordered size="small">
          {projectDetails.coursework.course_code && (
            <Descriptions.Item label="รหัสวิชา">
              {projectDetails.coursework.course_code}
            </Descriptions.Item>
          )}
          {projectDetails.coursework.course_name && (
            <Descriptions.Item label="ชื่อวิชา">
              {projectDetails.coursework.course_name}
            </Descriptions.Item>
          )}
          {projectDetails.coursework.instructor && (
            <Descriptions.Item label="อาจารย์ผู้สอน">
              {projectDetails.coursework.instructor}
            </Descriptions.Item>
          )}
          {projectDetails.coursework.clip_video && (
            <Descriptions.Item label="วิดีโอนำเสนอ">
              <Button
                type="link"
                icon={<YoutubeOutlined />}
                href={projectDetails.coursework.clip_video}
                target="_blank"
                rel="noopener noreferrer"
              >
                ดูวิดีโอ
              </Button>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    );
  } else if (type === 'academic' && projectDetails.academic) {
    return (
      <Card 
        title={`ข้อมูล${getCategoryName(type)}`}
        className="shadow-md"
      >
        <Descriptions column={1} bordered size="small">
          {projectDetails.academic.publication_date && (
            <Descriptions.Item label="วันที่ตีพิมพ์">
              {formatThaiDate(projectDetails.academic.publication_date)}
            </Descriptions.Item>
          )}
          {projectDetails.academic.published_year && (
            <Descriptions.Item label="ปีที่ตีพิมพ์">
              {projectDetails.academic.published_year}
            </Descriptions.Item>
          )}
          {projectDetails.academic.venue && (
            <Descriptions.Item label="สถานที่ตีพิมพ์">
              {projectDetails.academic.venue}
            </Descriptions.Item>
          )}
          {projectDetails.academic.last_updated && (
            <Descriptions.Item label="อัปเดตล่าสุด">
              {formatThaiDate(projectDetails.academic.last_updated)}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    );
  } else if (type === 'competition' && projectDetails.competition) {
    return (
      <Card 
        title={`ข้อมูล${getCategoryName(type)}`}
        className="shadow-md"
      >
        <Descriptions column={1} bordered size="small">
          {projectDetails.competition.competition_name && (
            <Descriptions.Item label="ชื่อการแข่งขัน">
              {projectDetails.competition.competition_name}
            </Descriptions.Item>
          )}
          {projectDetails.competition.competition_year && (
            <Descriptions.Item label="ปีที่แข่งขัน">
              {projectDetails.competition.competition_year}
            </Descriptions.Item>
          )}
          {projectDetails.competition.competition_level && (
            <Descriptions.Item label="ระดับการแข่งขัน">
              {projectDetails.competition.competition_level === 'national' ? 'ระดับประเทศ' :
              projectDetails.competition.competition_level === 'international' ? 'ระดับนานาชาติ' :
              projectDetails.competition.competition_level === 'university' ? 'ระดับมหาวิทยาลัย' :
              projectDetails.competition.competition_level === 'faculty' ? 'ระดับคณะ' :
              projectDetails.competition.competition_level === 'department' ? 'ระดับภาควิชา' :
              projectDetails.competition.competition_level}
            </Descriptions.Item>
          )}
          {projectDetails.competition.achievement && (
            <Descriptions.Item label="ผลงานที่ได้รับ">
              {projectDetails.competition.achievement}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    );
  }

  return null;
};

export default CategoryDetails;