import React from 'react';
import { Row, Col, Card, Tag, Tooltip, Typography } from 'antd';
import { EyeOutlined, UserOutlined, BookOutlined, TeamOutlined, TrophyOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { PROJECT } from '../../constants/routes';
import { API_ENDPOINTS } from '../../constants';
import { formatThaiDate } from '../../utils/dateUtils';

const { Title, Text } = Typography;

/**
 * Component สำหรับแสดงโปรเจคที่เกี่ยวข้อง
 * 
 * @param {Object} props - Props ของ component
 * @param {Array} props.projects - รายการโปรเจคที่เกี่ยวข้อง
 * @returns {JSX.Element} RelatedProjects component
 */
const RelatedProjects = ({ projects = [] }) => {
  if (!projects || projects.length === 0) return null;

  // ตัดให้แสดงไม่เกิน 8 โปรเจค
  const displayProjects = projects.slice(0, 8);

  return (
    <div className="py-6 px-8">
      <div className="mb-6 flex items-center">
        <Title level={4} className="m-0 text-[#0D0221]">
          ผลงานที่เกี่ยวข้อง
        </Title>
        <div className="ml-auto">
          <Link 
            to={PROJECT.ALL} 
            className="text-[#90278E] hover:text-[#FF5E8C]"
          >
            ดูทั้งหมด
          </Link>
        </div>
      </div>

      <Row gutter={[16, 24]}>
        {displayProjects.map((project, index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={index}>
            <Link to={PROJECT.VIEW(project.id)}>
              <Card
                hoverable
                className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-md"
                cover={
                  <div className="relative pb-[56.25%] overflow-hidden bg-gray-100">
                    {project.image ? (
                      <img
                        alt={project.title}
                        src={project.image.startsWith('http') ? project.image : `${API_ENDPOINTS.BASE}/${project.image}`}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-100">
                        {project.type === 'academic' ? (
                          <BookOutlined className="text-3xl text-gray-300" />
                        ) : project.type === 'coursework' ? (
                          <TeamOutlined className="text-3xl text-gray-300" />
                        ) : (
                          <TrophyOutlined className="text-3xl text-gray-300" />
                        )}
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Tag 
                        color={
                          project.type === 'academic' ? 'blue' : 
                          project.type === 'coursework' ? 'green' : 
                          'gold'
                        }
                        className="opacity-90"
                      >
                        {project.type === 'academic' ? 'บทความวิชาการ' : 
                         project.type === 'coursework' ? 'งานในชั้นเรียน' : 
                         'การแข่งขัน'}
                      </Tag>
                    </div>
                  </div>
                }
                bodyStyle={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <div className="flex-1">
                  <Tooltip title={project.title}>
                    <Title level={5} ellipsis={{ rows: 2 }} className="mb-1">
                      {project.title}
                    </Title>
                  </Tooltip>
                </div>
                
                <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                  <div className="flex items-center">
                    <UserOutlined className="mr-1" />
                    <span>{project.student || 'ไม่ระบุผู้จัดทำ'}</span>
                  </div>
                  <div className="flex items-center">
                    <EyeOutlined className="mr-1" />
                    <span>{project.viewsCount || 0}</span>
                  </div>
                </div>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default RelatedProjects;