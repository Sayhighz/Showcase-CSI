import React from 'react';
import { Row, Col, Card, Tag, Tooltip, Typography } from 'antd';
import { EyeOutlined, UserOutlined, BookOutlined, TeamOutlined, TrophyOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { PROJECT } from '../../constants/routes';
import { API_ENDPOINTS } from '../../constants';

// Utility function to truncate text
const truncateText = (text, maxLength = 60) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

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
    <div className="py-8 px-6 mt-12 bg-gradient-to-b from-[#F5EAFF] to-[#E0D1FF] rounded-xl shadow-lg border border-[#90278E] border-opacity-20 relative overflow-hidden backdrop-filter backdrop-blur-md">
      {/* Galaxy decorative elements ปรับตามธีมสี */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#5E1A5C] opacity-10 rounded-full blur-xl -mr-12 -mt-12 z-0"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#90278E] opacity-10 rounded-full blur-xl -ml-6 -mb-6 z-0"></div>
      <div className="absolute top-3/4 left-1/2 w-24 h-24 bg-[#B252B0] opacity-10 rounded-full blur-xl z-0"></div>
      
      <div className="relative z-10">
        <div className="flex items-center mb-8">
          <div className="flex items-center">
            <span className="w-1 h-6 bg-[#90278E] mr-2 rounded inline-block"></span>
            <Title level={4} className="m-0 text-[#90278E] font-bold">
              ผลงานที่เกี่ยวข้อง
            </Title>
          </div>
          <div className="ml-auto">
            <Link 
              to={PROJECT.ALL} 
              className="text-[#90278E] hover:text-[#B252B0] transition-all duration-300 font-medium"
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
                  className="h-full flex flex-col overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg border border-[#90278E] border-opacity-20 bg-white bg-opacity-80 backdrop-filter backdrop-blur-md transform hover:-translate-y-1 hover:shadow-xl"
                  cover={
                    <div className="relative pb-[56.25%] overflow-hidden bg-gradient-to-b from-[#F5EAFF] to-white">
                      {project.image ? (
                        <img
                          alt={project.title}
                          src={project.image.startsWith('http') ? project.image : `${API_ENDPOINTS.BASE}/${project.image}`}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gradient-to-b from-[#F5EAFF] to-white">
                          {project.type === 'academic' ? (
                            <BookOutlined className="text-4xl text-[#B252B0] opacity-40" />
                          ) : project.type === 'coursework' ? (
                            <TeamOutlined className="text-4xl text-[#B252B0] opacity-40" />
                          ) : (
                            <TrophyOutlined className="text-4xl text-[#B252B0] opacity-40" />
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
                          className="opacity-90 shadow-md"
                        >
                          {project.type === 'academic' ? 'บทความวิชาการ' : 
                          project.type === 'coursework' ? 'งานในชั้นเรียน' : 
                          'การแข่งขัน'}
                        </Tag>
                      </div>
                    </div>
                  }
                  styles={{ body: { padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' } }}
                >
                  <div className="flex-1">
                    <Tooltip title={project.title}>
                      <h3 className="text-sm font-medium mb-2 line-clamp-2 h-10 text-[#24292f] leading-5">
                        {truncateText(project.title, 55)}
                      </h3>
                    </Tooltip>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    {/* Display all group members */}
                    <div className="flex items-start text-xs text-[#8b949e]">
                      <TeamOutlined className="mr-1 text-[#90278E] mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[#90278E] mb-1">สมาชิกทีม:</div>
                        <div className="space-y-1">
                          {/* Project Owner */}
                          <div className="truncate">
                            <span className="inline-block w-2 h-2 bg-[#90278E] rounded-full mr-2 flex-shrink-0"></span>
                            <span className="font-medium">{truncateText(project.student || 'ไม่ระบุผู้สร้าง', 25)}</span>
                            <span className="text-[#B252B0] ml-1">(หัวหน้าทีม)</span>
                          </div>
                          
                          {/* Collaborators */}
                          {project.collaborators && project.collaborators.length > 0 ? (
                            project.collaborators.map((collaborator, idx) => (
                              <div key={idx} className="truncate">
                                <span className="inline-block w-2 h-2 bg-[#B252B0] rounded-full mr-2 flex-shrink-0"></span>
                                <span>{truncateText(collaborator.fullName || collaborator.full_name || `สมาชิกคนที่ ${idx + 1}`, 20)}</span>
                                {collaborator.role && (
                                  <span className="text-[#8b949e] ml-1">
                                    ({collaborator.role === 'contributor' ? 'ผู้ร่วมงาน' :
                                      collaborator.role === 'advisor' ? 'ที่ปรึกษา' :
                                      collaborator.role})
                                  </span>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-[#8b949e] italic text-xs">
                              ไม่มีข้อมูลสมาชิกอื่น
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Views count */}
                    <div className="flex items-center justify-end text-xs text-[#8b949e]">
                      <EyeOutlined className="mr-1 text-[#90278E]" />
                      <span>{project.viewsCount || 0} ครั้ง</span>
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