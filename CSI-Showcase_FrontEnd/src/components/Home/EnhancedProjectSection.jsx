import React, { useRef, useMemo } from 'react';
import { Typography, Card, Avatar, Tag, Button } from 'antd';
import {
  EyeOutlined,
  TeamOutlined,
  CalendarOutlined,
  ArrowRightOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../constants';
import he from 'he';

const { Title, Text, Paragraph } = Typography;

const EnhancedProjectSection = ({
  title,
  subtitle,
  icon,
  projects = [],
  sectionColor = "#90278E",
  accentColor = "#B252B0",
  backgroundStyle = {},
  onViewAll,
  maxDisplay = 3
}) => {
  const sectionRef = useRef(null);
  const navigate = useNavigate();

  // Memoize display projects to prevent unnecessary re-renders
  const displayProjects = useMemo(
    () => projects.slice(0, maxDisplay),
    [projects, maxDisplay]
  );

  const handleProjectClick = (projectLink) => {
    if (!projectLink) return;
    
    try {
      let correctedPath = projectLink;
      if (projectLink.includes('sitspu.com')) {
        const url = new URL(projectLink);
        correctedPath = url.pathname;
      }
      navigate(correctedPath);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-24 overflow-hidden"
      style={{
        ...backgroundStyle,
      }}
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-10 right-10 w-32 h-32 rounded-full opacity-10 blur-3xl"
          style={{ background: `radial-gradient(circle, ${sectionColor}, ${accentColor})` }}
        />
        <div
          className="absolute bottom-20 left-10 w-24 h-24 rounded-full opacity-15 blur-2xl"
          style={{ background: `radial-gradient(circle, ${accentColor}, ${sectionColor})` }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full opacity-8 blur-xl"
          style={{ background: `radial-gradient(circle, ${sectionColor}50, transparent)` }}
        />
      </div>

      {/* Section Header */}
      <div className="container mx-auto px-8 md:px-12 lg:px-16 mb-12 relative z-10">
        <div
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${sectionColor}, ${accentColor})`,
              boxShadow: `0 10px 30px rgba(144, 39, 142, 0.3)`
            }}
          >
            <span className="text-white text-2xl">{icon}</span>
          </div>
          
          <Title
            level={2}
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{
              background: `linear-gradient(135deg, ${sectionColor}, ${accentColor})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}
          >
            {title}
          </Title>
          
          <Text className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </Text>
        </div>

        {/* Projects Grid - Dynamic Layout */}
        <div
          className={`grid gap-8 md:gap-10 lg:gap-12 ${
            displayProjects.length === 1
              ? 'grid-cols-1 justify-items-center max-w-md mx-auto'
              : displayProjects.length === 2
              ? 'grid-cols-1 md:grid-cols-2 justify-items-center max-w-2xl mx-auto'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {displayProjects.map((project) => (
            <div
              key={project.id}
              className="w-full max-w-[260px] md:max-w-[280px] lg:max-w-[300px] mx-auto"
            >
              <Card
                  hoverable
                  className="h-full overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border-0 relative z-10 group"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(15px)',
                    transform: 'translateZ(0)',
                  }}
                cover={
                  <div className={`relative overflow-hidden ${project.category === 'academic' ? 'aspect-[16/9]' : 'aspect-[2/3]'}`}>
                    {project.image ? (
                      <img
                        src={`${API_ENDPOINTS.BASE}/${project.image}`}
                        alt={project.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-110"
                      />
                    ) : (
                      // Enhanced poster-style placeholder
                      <div
                        className="absolute inset-0 w-full h-full flex flex-col overflow-hidden"
                        style={{
                          background: project.category === 'academic'
                            ? `linear-gradient(135deg, ${sectionColor}, ${accentColor})`
                            : 'white'
                        }}
                      >
                        {project.category === 'academic' ? (
                          // Academic paper style (keep original)
                          <>
                            <div className="absolute inset-0 opacity-10 text-white">
                              <div className="absolute top-4 left-4 w-8 h-1 bg-white rounded"></div>
                              <div className="absolute top-8 left-4 w-12 h-1 bg-white rounded"></div>
                              <div className="absolute top-12 left-4 w-10 h-1 bg-white rounded"></div>
                              <div className="absolute top-20 left-4 w-16 h-1 bg-white rounded"></div>
                              <div className="absolute top-24 left-4 w-8 h-1 bg-white rounded"></div>
                              <div className="absolute top-32 left-4 w-14 h-1 bg-white rounded"></div>
                              <div className="absolute top-36 left-4 w-12 h-1 bg-white rounded"></div>
                            </div>
                            <div className="flex flex-col items-center justify-center h-full text-white p-4 text-center relative z-10">
                              <div className="text-4xl mb-3">{icon}</div>
                              <div className="space-y-2">
                                <div className="text-xs opacity-80 uppercase tracking-widest">งานวิจัย</div>
                                <div className="text-sm font-medium leading-tight line-clamp-3 max-w-48">
                                  {he.decode(project.title)}
                                </div>
                                {project.year && (
                                  <div className="text-xs opacity-90 mt-2">
                                    ปีที่ตีพิมพ์: {project.year}
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        ) : (
                          // Poster style for coursework and competition
                          <div className="relative h-full">
                            {/* Poster Header */}
                            <div
                              className="h-16 flex items-center justify-center text-white font-bold text-lg relative"
                              style={{ background: `linear-gradient(135deg, ${sectionColor}, ${accentColor})` }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{icon}</span>
                                <span className="text-sm">
                                  {project.category === 'coursework' ? 'งานในรายวิชา' : 'การแข่งขัน'}
                                </span>
                              </div>
                              {/* Decorative corner */}
                              <div className="absolute top-0 right-0 w-0 h-0 border-l-8 border-b-8 border-l-transparent border-b-white opacity-20"></div>
                            </div>
                            
                            {/* Poster Body */}
                            <div className="flex-1 p-4 flex flex-col justify-center bg-gradient-to-b from-gray-50 to-white min-h-32">
                              {/* Title */}
                              <h3 className="text-gray-800 font-bold text-base leading-tight line-clamp-3 mb-3">
                                {he.decode(project.title)}
                              </h3>
                              
                              {/* Description preview */}
                              {project.description && (
                                <p className="text-gray-600 text-xs leading-relaxed line-clamp-3 mb-3">
                                  {he.decode(project.description)}
                                </p>
                              )}
                              
                              {/* Bottom info */}
                              <div className="mt-auto pt-2 border-t border-gray-200">
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                  <span>{project.year || new Date(project.createdAt).getFullYear()}</span>
                                  <span>{project.level || 'ปี 3'}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Poster Footer */}
                            <div
                              className="h-6 relative"
                              style={{ background: `linear-gradient(45deg, ${sectionColor}20, ${accentColor}20)` }}
                            >
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-1 bg-gray-300 rounded"></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Floating badges */}
                    <div className="absolute top-3 left-3">
                      <Tag 
                        color={sectionColor} 
                        className="font-semibold"
                      >
                        {project.level || 'ปี 3'}
                      </Tag>
                    </div>
                    
                    <div className="absolute top-3 right-3">
                      <div
                        className="bg-white bg-opacity-90 rounded-full p-2 flex items-center gap-1"
                      >
                        <EyeOutlined className="text-xs" />
                        <Text className="text-xs font-medium">{project.viewsCount}</Text>
                      </div>
                    </div>
                    {/* Floating decorative element */}
                    <div
                      className="absolute bottom-2 right-2 w-8 h-8 rounded-full opacity-20 blur-sm transition-all duration-300 group-hover:opacity-30"
                      style={{ background: `linear-gradient(45deg, ${sectionColor}, ${accentColor})` }}
                    />
                  </div>
                }
                styles={{ body: { padding: '24px' } }}
                onClick={() => handleProjectClick(project.projectLink)}
              >
                <div className="space-y-4">
                  {/* Project Title */}
                  <Paragraph
                    className="mb-2 leading-snug break-words hyphens-auto line-clamp-2 min-h-[3.25rem]"
                    ellipsis={{ rows: 2, tooltip: he.decode(project.title) }}
                    style={{ fontWeight: 600, marginBottom: 0, overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                  >
                    {he.decode(project.title)}
                  </Paragraph>

                  {/* Project Description */}
                  <Paragraph className="text-gray-600 text-sm line-clamp-3 h-16 mb-4">
                    {he.decode(project.description)}
                  </Paragraph>

                  {/* Team Members */}
                  <div className="flex items-center gap-2 mb-3">
                    <TeamOutlined className="text-gray-500 text-sm" />
                    <Avatar.Group max={{ count: 3 }} size="small">
                      {/* Project owner */}
                      {project.userImage ? (
                        <Avatar
                          size="small"
                          src={`${API_ENDPOINTS.BASE}/${project.userImage}`}
                          title={project.student}
                        />
                      ) : (
                        <Avatar size="small" style={{ backgroundColor: sectionColor }}>
                          {project.student?.charAt(0)}
                        </Avatar>
                      )}
                      
                      {/* Collaborators */}
                      {project.collaborators?.slice(0, 2).map((collaborator, idx) => (
                        collaborator.image ? (
                          <Avatar
                            key={idx}
                            size="small"
                            src={`${API_ENDPOINTS.BASE}/${collaborator.image}`}
                            title={collaborator.fullName}
                          />
                        ) : (
                          <Avatar key={idx} size="small" style={{ backgroundColor: accentColor }}>
                            {collaborator.fullName?.charAt(0)}
                          </Avatar>
                        )
                      ))}
                    </Avatar.Group>
                    
                    <Text className="text-xs text-gray-500 ml-1">
                      {(project.collaborators?.length || 0) + 1} คน
                    </Text>
                  </div>

                  {/* Project Stats */}
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <CalendarOutlined />
                      <span>{project.year || new Date(project.createdAt).getFullYear()}</span>
                    </div>
                    
                    {project.featured && (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <StarOutlined />
                        <span className="font-ubuntu">Featured</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* View All Button */}
        {projects.length > maxDisplay && (
          <div
            className="text-center mt-12"
          >
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={onViewAll}
              className="px-8 py-2 h-12 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${sectionColor}, ${accentColor})`,
                border: 'none',
                borderRadius: '25px',
              }}
            >
              ดูผลงานทั้งหมด ({projects.length} <span className="font-ubuntu">projects</span>)
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default EnhancedProjectSection;