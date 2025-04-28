import React from 'react';
import { Row, Col, Card, Tag, Tooltip, Typography } from 'antd';
import { EyeOutlined, UserOutlined, BookOutlined, TeamOutlined, TrophyOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { PROJECT } from '../../constants/routes';
import { API_ENDPOINTS } from '../../constants';

const { Title } = Typography;

/**
 * Component สำหรับแสดงโปรเจคที่เกี่ยวข้อง
 * 
 * @param {Object} props - Props ของ component
 * @param {Array} props.projects - รายการโปรเจคที่เกี่ยวข้อง
 * @returns {JSX.Element} RelatedProjects component
 */
const RelatedProjects = ({ projects = [] }) => {
  if (!projects || projects.length === 0) return null;

  // ตัดให้แสดงไม่เกิน 4 โปรเจค
  const displayProjects = projects.slice(0, 4);

  return (
    <div className="py-8 px-6 mt-12 bg-gradient-to-r from-purple-50 to-white rounded-xl shadow-md border border-purple-100 relative overflow-hidden">
      {/* Galaxy decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-900 opacity-5 rounded-full blur-xl -mr-12 -mt-12 z-0"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-600 opacity-5 rounded-full blur-xl -ml-6 -mb-6 z-0"></div>
      <div className="absolute top-3/4 left-1/2 w-24 h-24 bg-purple-400 opacity-5 rounded-full blur-xl z-0"></div>
      
      <div className="relative z-10">
        <div className="flex items-center mb-8">
          <div className="flex items-center">
            <span className="w-1 h-6 bg-[#90278E] mr-2 rounded inline-block"></span>
            <Title level={4} className="m-0 text-[#90278E]">
              ผลงานที่เกี่ยวข้อง
            </Title>
          </div>
          <div className="ml-auto">
            <Link 
              to={PROJECT.ALL} 
              className="text-[#90278E] hover:text-[#FF5E8C] transition-colors"
            >
              ดูทั้งหมด
            </Link>
          </div>
        </div>

        <Row gutter={[16, 24]}>
          {displayProjects.map((project, index) => (
            <Col xs={24} sm={12} md={12} lg={6} key={index}>
              <Link to={PROJECT.VIEW(project.id)}>
                <Card
                  hoverable
                  className="h-full flex flex-col overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg border border-purple-100 transform hover:-translate-y-1"
                  cover={
                    <div className="relative pb-[56.25%] overflow-hidden bg-gradient-to-r from-purple-50 to-white">
                      {project.image ? (
                        <img
                          alt={project.title}
                          src={project.image.startsWith('http') ? project.image : `${API_ENDPOINTS.BASE}/${project.image}`}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-50 to-white">
                          {project.type === 'academic' ? (
                            <BookOutlined className="text-4xl text-purple-200" />
                          ) : project.type === 'coursework' ? (
                            <TeamOutlined className="text-4xl text-purple-200" />
                          ) : (
                            <TrophyOutlined className="text-4xl text-purple-200" />
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
                          className="opacity-90 shadow-sm"
                        >
                          {project.type === 'academic' ? 'บทความวิชาการ' : 
                          project.type === 'coursework' ? 'งานในชั้นเรียน' : 
                          'การแข่งขัน'}
                        </Tag>
                      </div>
                    </div>
                  }
                  bodyStyle={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}
                >
                  <div className="flex-1">
                    <Tooltip title={project.title}>
                      <h3 className="text-base font-medium mb-2 line-clamp-2 h-12 text-gray-800">
                        {project.title}
                      </h3>
                    </Tooltip>
                  </div>
                  
                  <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                    <div className="flex items-center truncate pr-2">
                      <UserOutlined className="mr-1 text-[#90278E]" />
                      <span className="truncate">{project.student || 'ไม่ระบุผู้จัดทำ'}</span>
                    </div>
                    <div className="flex items-center flex-shrink-0">
                      <EyeOutlined className="mr-1 text-[#90278E]" />
                      <span>{project.viewsCount || 0}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default RelatedProjects;