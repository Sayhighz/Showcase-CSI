import React, { useRef, useMemo, useEffect } from 'react';
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
import { ScrollReveal } from '../ui/ScrollReveal';
import { GridPattern } from '../ui/GridPattern';
import clsx from 'clsx';
import he from 'he';
import { activateTextTruncateScroll } from "text-truncate-scroll"

const { Title, Text } = Typography;

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

  useEffect(() => {
		activateTextTruncateScroll()
	}, [])

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-24 overflow-hidden"
      style={{
        ...backgroundStyle,
      }}
    >
      {/* Decorative Background Elements with GridPattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* GridPattern Background */}
        <GridPattern
          offsetX={0}
          offsetY={0}
          size={64}
          className="absolute -inset-x-0.5 -top-1/4 h-[150%] w-full skew-y-12 opacity-30 [mask-image:radial-gradient(white,transparent_70%)]"
          style={{ stroke: sectionColor, strokeWidth: 2 }}
        >
          {/* Grid blocks positioned strategically */}
          <GridPattern.Block
            row={1}
            column={1}
            className="transition duration-500 hover:fill-white/10"
            style={{ fill: `${sectionColor}20` }}
          />
          <GridPattern.Block
            row={2}
            column={4}
            className="transition duration-500 hover:fill-white/10"
            style={{ fill: `${accentColor}15` }}
          />
          <GridPattern.Block
            row={3}
            column={2}
            className="transition duration-500 hover:fill-white/10"
            style={{ fill: `${sectionColor}15` }}
          />
          <GridPattern.Block
            row={3}
            column={7}
            className="transition duration-500 hover:fill-white/10"
            style={{ fill: `${accentColor}20` }}
          />
          <GridPattern.Block
            row={4}
            column={5}
            className="transition duration-500 hover:fill-white/10"
            style={{ fill: `${sectionColor}10` }}
          />
          <GridPattern.Block
            row={5}
            column={0}
            className="transition duration-500 hover:fill-white/10"
            style={{ fill: `${accentColor}25` }}
          />
          <GridPattern.Block
            row={5}
            column={6}
            className="transition duration-500 hover:fill-white/10"
            style={{ fill: `${sectionColor}25` }}
          />
        </GridPattern>
        
        {/* Original decorative elements */}
        <div
          className="absolute top-10 right-10 w-32 h-32 rounded-full opacity-7 blur-3xl"
          style={{ background: `radial-gradient(circle, ${sectionColor}, ${accentColor})` }}
        />
        <div
          className="absolute bottom-20 left-10 w-24 h-24 rounded-full opacity-10 blur-2xl"
          style={{ background: `radial-gradient(circle, ${accentColor}, ${sectionColor})` }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full opacity-6 blur-xl"
          style={{ background: `radial-gradient(circle, ${sectionColor}40, transparent)` }}
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
          
          <Text className="text-lg text-gray-800 max-w-2xl mx-auto leading-relaxed" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            {subtitle}
          </Text>
        </div>

        {/* Projects Grid - Dynamic Layout */}
        <div
          className={`${
            // Check if all projects are academic to use row layout
            displayProjects.every(p => p.category === 'academic')
              ? 'flex flex-col gap-4 md:gap-6 max-w-4xl mx-auto'
              : `grid gap-8 md:gap-10 lg:gap-12 ${
                  displayProjects.length === 1
                    ? 'grid-cols-1 justify-items-center max-w-md mx-auto'
                    : displayProjects.length === 2
                    ? 'grid-cols-1 md:grid-cols-2 justify-items-center max-w-2xl mx-auto'
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`
          }`}
        >
          {displayProjects.map((project, index) => {
            const isPortrait = project.category !== 'academic';
            const isAcademic = project.category === 'academic';
            
            // Special row layout for academic projects
            if (isAcademic && displayProjects.every(p => p.category === 'academic')) {
              return (
                <ScrollReveal
                  key={project.id}
                  offset={50}
                  once={true}
                  className="w-full [--duration:600ms]"
                  style={{ "--delay": `${index * 150}ms` }}
                >
                  {(isActive) => (
                    <div
                      className={clsx(
                        { "translate-y-8 opacity-0": !isActive },
                        "transition-[transform,opacity] duration-[--duration] ease-out delay-[--delay]"
                      )}
                    >
                      <Card
                        hoverable
                        className="group relative z-10 overflow-hidden rounded-2xl border border-white/10 bg-white/10 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] hover:shadow-2xl hover:-translate-y-1 will-change-transform [transform:translateZ(0)]"
                        style={{
                          boxShadow: '0 12px 40px rgba(144,39,142,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
                        }}
                        styles={{ body: { padding: '16px' } }}
                        onClick={() => handleProjectClick(project.projectLink)}
                      >
                    {/* Academic Row Layout */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      {/* Left: Small Image */}
                      <div className="relative w-full sm:w-32 md:w-40 flex-shrink-0">
                        <div className="relative overflow-hidden rounded-lg aspect-[4/3]">
                          {project.image ? (
                            <img
                              src={`${API_ENDPOINTS.BASE}/${project.image}`}
                              alt={project.title}
                              className="absolute inset-0 w-full h-full object-cover transform-gpu will-change-transform [transform:translateZ(0)]"
                            />
                          ) : (
                            <div
                              className="absolute inset-0 w-full h-full flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg, ${sectionColor}, ${accentColor})`
                              }}
                            >
                              {/* Academic paper style placeholder */}
                              <div className="relative w-full h-full">
                                <div className="absolute inset-0 opacity-15 text-white">
                                  <div className="absolute top-2 left-2 w-6 h-0.5 bg-white rounded"></div>
                                  <div className="absolute top-4 left-2 w-8 h-0.5 bg-white rounded"></div>
                                  <div className="absolute top-6 left-2 w-7 h-0.5 bg-white rounded"></div>
                                  <div className="absolute top-10 left-2 w-10 h-0.5 bg-white rounded"></div>
                                  <div className="absolute top-12 left-2 w-6 h-0.5 bg-white rounded"></div>
                                </div>
                                <div className="flex items-center justify-center h-full">
                                  <span className="text-white text-2xl">{icon}</span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Small floating badges */}
                          <div className="absolute top-1 left-1">
                            <Tag
                              className="font-semibold rounded text-xs"
                              style={{
                                color: 'white',
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                backdropFilter: 'blur(4px)',
                                fontSize: '10px',
                                padding: '2px 6px',
                                lineHeight: '1.2'
                              }}
                            >
                              {project.level || 'ปี 3'}
                            </Tag>
                          </div>
                        </div>
                      </div>

                      {/* Right: Content */}
                      <div className="flex-1 min-w-0">
                        {/* Accent Bar */}
                        <div
                          className="w-8 h-0.5 rounded mb-2"
                          style={{
                            background: `linear-gradient(to right, ${sectionColor}, ${accentColor})`,
                          }}
                        />

                        {/* Title */}
                        <h3
                          className="text-white font-bold text-base md:text-lg leading-tight mb-2 overflow-hidden"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                            lineHeight: 1.3
                          }}
                          title={project.title}
                        >
                          <p className='text-truncate-scroll'>{project.title}</p>
                        </h3>

                        {/* Description */}
                        {project.description && (
                          <p
                            className="text-white/90 text-sm leading-relaxed mb-3 overflow-hidden"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                              lineHeight: 1.4
                            }}
                          >
                            {he.decode(project.description)}
                          </p>
                        )}

                        {/* Bottom Row: Stats */}
                        <div className="flex items-center justify-between text-xs text-white/80">
                          <div className="flex items-center gap-3">
                            {/* Team info */}
                            <div className="flex items-center gap-1">
                              <TeamOutlined className="text-white" />
                              <span>{(project.collaborators?.length || 0) + 1} คน</span>
                            </div>
                            
                            {/* Year */}
                            <div className="flex items-center gap-1">
                              <CalendarOutlined className="text-white" />
                              <span>{project.year || new Date(project.createdAt).getFullYear()}</span>
                            </div>
                          </div>

                          {/* Views and Featured */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <EyeOutlined className="text-xs" />
                              <span>{project.viewsCount}</span>
                            </div>
                            
                            {project.featured && (
                              <div className="flex items-center gap-1 text-yellow-300">
                                <StarOutlined />
                                <span className="font-ubuntu">Featured</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                        </div>
                      </Card>
                    </div>
                  )}
                </ScrollReveal>
              );
            }
            
            return (
              <ScrollReveal
                key={project.id}
                offset={50}
                once={true}
                className={`w-full ${isPortrait ? 'max-w-[340px] md:max-w-[420px] lg:max-w-[460px]' : 'max-w-[260px] md:max-w-[280px] lg:max-w-[300px]'} mx-auto [--duration:700ms]`}
                style={{ "--delay": `${index * 200}ms` }}
              >
                {(isActive) => (
                  <div
                    className={clsx(
                      { "translate-y-8 opacity-0": !isActive },
                      "transition-[transform,opacity] duration-[--duration] ease-out delay-[--delay]"
                    )}
                  >
                    <Card
                      hoverable
                      className="group relative z-10 h-full overflow-hidden rounded-2xl border border-white/10 bg-white/10 text-white shadow-lg backdrop-blur-md transition-all duration-500 hover:bg-white/15 hover:scale-[1.05] hover:shadow-2xl hover:-translate-y-2 hover:rotate-1 will-change-transform [transform:translateZ(0)]"
                      style={{
                        boxShadow:
                          '0 12px 40px rgba(144,39,142,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
                      }}
                  cover={
                    isPortrait
                      ? undefined
                      : (
                        <div className={`relative overflow-hidden [contain:paint] ${project.category === 'academic' ? 'aspect-[16/9]' : 'aspect-[2/3]'}`}>
                          {project.image ? (
                            <img
                              src={`${API_ENDPOINTS.BASE}/${project.image}`}
                              alt={project.title}
                              className="absolute inset-0 w-full h-full object-cover transform-gpu will-change-transform [transform:translateZ(0)]"
                            />
                          ) : (
                            // Enhanced poster-style placeholder
                            <div
                              className="absolute inset-0 w-full h-full flex flex-col overflow-hidden"
                              style={{
                                background: project.category === 'academic'
                                  ? `linear-gradient(135deg, ${sectionColor}, ${accentColor})`
                                  : 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))'
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
                                      <div className="text-sm font-medium leading-tight max-w-48 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                        <p className='text-truncate-scroll'>{project.title}</p>
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
                                    <div className="flex items-center text-white gap-2">
                                      <span className="text-xl">{icon}</span>
                                      <span className="text-sm">
                                        {project.category === 'coursework' ? 'งานในรายวิชา' : 'การแข่งขัน'}
                                      </span>
                                    </div>
                                    {/* Decorative corner */}
                                    <div className="absolute top-0 right-0 w-0 h-0 border-l-8 border-b-8 border-l-transparent border-b-white opacity-20"></div>
                                  </div>
                                  
                                  {/* Poster Body */}
                                  <div className="flex-1 p-4 flex flex-col justify-center bg-gradient-to-b from-zinc-800/80 to-zinc-900/60 min-h-32">
                                    {/* Title */}
                                    <h3
                                      className="text-white font-bold text-sm leading-tight mb-2 overflow-hidden"
                                      style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                                        overflowWrap: 'anywhere',
                                        wordBreak: 'break-word',
                                        hyphens: 'auto',
                                        lineHeight: 1.25,
                                        minHeight: '2.2rem',
                                        maxHeight: '2.2rem'
                                      }}
                                      title=<p className='text-truncate-scroll'>{project.title}</p>
                                    >
                                      <p className='text-truncate-scroll'>{project.title}</p>
                                    </h3>
                                    
                                    {/* Description preview */}
                                    {project.description && (
                                      <p
                                        className="text-white/80 text-xs leading-relaxed mb-3 overflow-hidden"
                                        style={{
                                          textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                                          display: '-webkit-box',
                                          WebkitLineClamp: 3,
                                          WebkitBoxOrient: 'vertical',
                                          overflowWrap: 'anywhere',
                                          wordBreak: 'break-word'
                                        }}
                                      >
                                        {he.decode(project.description)}
                                      </p>
                                    )}
                                    
                                    {/* Bottom info */}
                                    <div className="mt-auto pt-2 border-t border-white/10">
                                      <div className="flex justify-between items-center text-xs text-white/80">
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
                              className="font-semibold rounded-full"
                              style={{
                                color: 'white',
                                backgroundColor: 'rgba(0,0,0,0.35)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(4px)'
                              }}
                            >
                              {project.level || 'ปี 3'}
                            </Tag>
                          </div>
                          
                          <div className="absolute top-3 right-3">
                            <div
                              className="bg-gray-800 bg-opacity-90 rounded-full p-2 flex items-center gap-1"
                            >
                              <EyeOutlined className="text-xs bg-black" />
                              <Text className="text-xs font-medium text-white">{project.viewsCount}</Text>
                            </div>
                          </div>
                          {/* Floating decorative element */}
                          <div
                            className="absolute bottom-2 right-2 w-8 h-8 rounded-full opacity-20 blur-sm transition-all duration-300 group-hover:opacity-30"
                            style={{ background: `linear-gradient(45deg, ${sectionColor}, ${accentColor})` }}
                          />
                        </div>
                      )
                  }
                  styles={{ body: { padding: isPortrait ? 0 : '24px' } }}
                  onClick={() => handleProjectClick(project.projectLink)}
                >
                  {isPortrait ? (
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                      {/* Left: Image */}
                      <div className="relative w-full md:w-[45%] overflow-hidden rounded-xl md:rounded-l-2xl md:rounded-r-none">
                        <div className="relative overflow-hidden [contain:paint] aspect-[2/3]">
                          {project.image ? (
                            <img
                              src={`${API_ENDPOINTS.BASE}/${project.image}`}
                              alt={project.title}
                              className="absolute inset-0 w-full h-full object-cover transform-gpu will-change-transform [transform:translateZ(0)]"
                            />
                          ) : (
                            <div
                              className="absolute inset-0 w-full h-full flex items-center justify-center"
                              style={{ background: `linear-gradient(135deg, ${sectionColor}, ${accentColor})` }}
                            >
                              <span className="text-white/80 text-4xl">{icon}</span>
                            </div>
                          )}

                          {/* Floating badges on image */}
                          <div className="absolute top-3 left-3">
                            <Tag
                              className="font-semibold rounded-full"
                              style={{
                                color: 'white',
                                backgroundColor: 'rgba(0,0,0,0.35)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(4px)'
                              }}
                            >
                              {project.level || 'ปี 3'}
                            </Tag>
                          </div>

                          <div className="absolute top-3 right-3">
                            <div className="bg-gray-800 bg-opacity-90 rounded-full p-2 flex items-center gap-1">
                              <EyeOutlined className="text-xs" />
                              <Text className="text-xs text-white font-medium">{project.viewsCount}</Text>
                            </div>
                          </div>

                          <div
                            className="absolute bottom-2 right-2 w-8 h-8 rounded-full opacity-20 blur-sm transition-all duration-300 group-hover:opacity-30"
                            style={{ background: `linear-gradient(45deg, ${sectionColor}, ${accentColor})` }}
                          />
                        </div>
                      </div>

                      {/* Right: Text panel with improved contrast */}
                      <div className="flex-1 p-4 md:p-6 bg-zinc-800 backdrop-blur-sm rounded-xl md:rounded-r-2xl md:rounded-l-none">
                        {/* Accent Bar */}
                        <div
                          className="w-12 h-1 rounded mb-3"
                          style={{
                            background: `linear-gradient(to right, ${sectionColor}, ${accentColor})`,
                          }}
                        />

                        {/* Project Title */}
                        <div
                          className="mb-3 text-white font-bold text-base leading-tight overflow-hidden"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.25,
                            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                            overflowWrap: 'anywhere',
                            wordBreak: 'break-word',
                            hyphens: 'auto',
                            minHeight: '2.5rem',
                            maxHeight: '2.5rem',
                            marginBottom: 12
                          }}
                          title=<p className='text-truncate-scroll'>{project.title}</p>
                        >
                          <p className='text-truncate-scroll'>{project.title}</p>
                        </div>

                        {/* Project Description */}
                        <div
                          className="text-white/90 text-sm mb-4 overflow-hidden"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                            minHeight: '3.75rem',
                            maxHeight: '3.75rem'
                          }}
                          title={he.decode(project.description)}
                        >
                          {he.decode(project.description)}
                        </div>

                        {/* Team Members */}
                        <div className="flex items-center gap-2 mb-3">
                          <TeamOutlined className="text-white text-sm" />
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

                          <Text className="text-xs text-white/90 ml-1">
                            {(project.collaborators?.length || 0) + 1} คน
                          </Text>
                        </div>

                        {/* Project Stats */}
                        <div className="flex justify-between items-center text-xs text-white/90">
                          <div className="flex items-center gap-1">
                            <CalendarOutlined className="text-white" />
                            <span>{project.year || new Date(project.createdAt).getFullYear()}</span>
                          </div>

                          {project.featured && (
                            <div className="flex items-center gap-1 text-yellow-300">
                              <StarOutlined />
                              <span className="font-ubuntu">Featured</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Accent Bar */}
                      <div
                        className="w-12 h-1 rounded mb-3"
                        style={{
                          background: `linear-gradient(to right, ${sectionColor}, ${accentColor})`,
                        }}
                      />

                      {/* Project Title */}
                      <div
                        className="mb-3 text-white font-bold text-base leading-tight overflow-hidden"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.25,
                          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                          overflowWrap: 'anywhere',
                          wordBreak: 'break-word',
                          hyphens: 'auto',
                          minHeight: '2.5rem',
                          maxHeight: '2.5rem',
                          marginBottom: 12
                        }}
                        title=<p className='text-truncate-scroll'>{project.title}</p>
                      >
                        <p className='text-truncate-scroll'>{project.title}</p>
                      </div>

                      {/* Project Description */}
                      <div
                        className="text-white/95 text-sm mb-4 overflow-hidden"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                          minHeight: '3.75rem',
                          maxHeight: '3.75rem'
                        }}
                        title={he.decode(project.description)}
                      >
                        {he.decode(project.description)}
                      </div>

                      {/* Team Members */}
                      <div className="flex items-center gap-2 mb-3">
                        <TeamOutlined className="text-white text-sm" />
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
                        
                        <Text className="text-xs text-white/90 ml-1">
                          {(project.collaborators?.length || 0) + 1} คน
                        </Text>
                      </div>

                      {/* Project Stats */}
                      <div className="flex justify-between items-center text-xs text-white/90" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                        <div className="flex items-center gap-1">
                          <CalendarOutlined className="text-white" />
                          <span>{project.year || new Date(project.createdAt).getFullYear()}</span>
                        </div>
                        
                        {project.featured && (
                          <div className="flex items-center gap-1 text-yellow-300">
                            <StarOutlined />
                            <span className="font-ubuntu">Featured</span>
                          </div>
                        )}
                      </div>
                      </div>
                    )}
                  </Card>
                </div>
              )}
            </ScrollReveal>
            )
          })}
        </div>

        {/* View All Button */}
        {projects.length > maxDisplay && (
          <ScrollReveal offset={50} once={true} className="text-center mt-12 [--duration:500ms]">
            {(isActive) => (
              <div
                className={clsx(
                  { "translate-y-4 opacity-0": !isActive },
                  "transition-[transform,opacity] duration-[--duration] ease-out delay-300"
                )}
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowRightOutlined />}
                  onClick={onViewAll}
                  className="px-8 py-2 h-12 text-lg font-medium shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${sectionColor}, ${accentColor})`,
                    border: 'none',
                    borderRadius: '25px',
                  }}
                >
                  ดูผลงานทั้งหมด
                </Button>
              </div>
            )}
          </ScrollReveal>
        )}
      </div>
    </section>
  );
};

export default EnhancedProjectSection;