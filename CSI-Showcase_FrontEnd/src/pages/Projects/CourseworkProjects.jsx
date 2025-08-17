import React, { useEffect } from 'react';
import { TeamOutlined, FileImageOutlined, EyeOutlined, StarOutlined } from '@ant-design/icons';

import { useProject } from '../../hooks';
import ProjectPageLayout from '../../components/Project/ProjectPageLayout';
import ProjectHeader from '../../components/Project/ProjectHeader';
import ProjectBackground from '../../components/Project/ProjectBackground';
import ProjectContentArea from '../../components/Project/ProjectContentArea';
import { createThemeColors, createBackgroundConfig } from '../../components/Project/ThemeConfig';

const CourseworkProjects = () => {
  const themeColors = createThemeColors('coursework');
  const backgroundConfig = createBackgroundConfig('coursework', themeColors);
  
  const { 
    projects, 
    isLoading, 
    error, 
    fetchAllProjects,
    projectYears, 
    level,
    filters,
    updateFilters
  } = useProject();

  const courseworkProjects = projects.filter(project => project.category === 'coursework');

  useEffect(() => {
    updateFilters({ type: 'coursework' });
    fetchAllProjects();
  }, []);

  const handleFilterChange = (values) => {
    updateFilters({ ...values, type: 'coursework' });
  };

  const handleResetFilters = () => {
    updateFilters({
      type: 'coursework',
      year: null,
      studyYear: null,
      keyword: '',
    });
  };

  const headerStats = [
    {
      value: courseworkProjects.length,
      label: 'ผลงานทั้งหมด',
      color: themeColors.primary
    },
    {
      icon: FileImageOutlined,
      label: 'โปสเตอร์',
      color: themeColors.primary
    },
    {
      icon: EyeOutlined,
      label: 'ดูรายละเอียด',
      color: themeColors.primary
    }
  ];

  return (
    <ProjectPageLayout 
      themeColors={themeColors}
      backgroundComponent={<ProjectBackground {...backgroundConfig} themeColors={themeColors} />}
    >
      <ProjectHeader
        icon={TeamOutlined}
        title="ผลงานในชั้นเรียน"
        description="คลังเก็บผลงานโปรเจค และงานมอบหมายที่สร้างสรรค์ในรายวิชาต่างๆ พร้อมโปสเตอร์ที่สวยงาม"
        themeColors={themeColors}
        stats={headerStats}
      />

      <ProjectContentArea
        isLoading={isLoading}
        error={error}
        projects={courseworkProjects}
        filters={filters}
        themeColors={themeColors}
        theme="coursework"
        projectYears={projectYears}
        level={level}
        projectTypes={[{ value: 'coursework', label: 'งานในชั้นเรียน' }]}
        filterTitle="ค้นหาผลงานในชั้นเรียน"
        workGridTitle="ผลงานในชั้นเรียน"
        workGridDescription="โปรเจคและงานมอบหมายจากรายวิชาต่างๆ"
        emptyIcon={TeamOutlined}
        emptyMessage="ไม่พบผลงานในชั้นเรียนที่ตรงกับเงื่อนไขที่เลือก"
        emptySubMessage="ลองปรับเปลี่ยนตัวกรองหรือค้นหาด้วยคำค้นอื่น"
        countMessage="ผลงานในชั้นเรียนทั้งหมด {count} ชิ้น"
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onUpdateFilters={updateFilters}
        hideTypeFilter={true}
      />
    </ProjectPageLayout>
  );
};

export default CourseworkProjects;