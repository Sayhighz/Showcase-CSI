import React, { useEffect } from 'react';
import { BookOutlined, FileTextOutlined, DownloadOutlined } from '@ant-design/icons';

import { useProject } from '../../hooks';
import ProjectPageLayout from '../../components/Project/ProjectPageLayout';
import ProjectHeader from '../../components/Project/ProjectHeader';
import ProjectBackground from '../../components/Project/ProjectBackground';
import ProjectContentArea from '../../components/Project/ProjectContentArea';
import { createThemeColors, createBackgroundConfig } from '../../components/Project/ThemeConfig';

const AcademicProjects = () => {
  const themeColors = createThemeColors('academic');
  const backgroundConfig = createBackgroundConfig('academic', themeColors);
  
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

  const academicProjects = projects.filter(project => project.category === 'academic');

  useEffect(() => {
    updateFilters({ type: 'academic' });
    fetchAllProjects();
  }, []);

  const handleFilterChange = (values) => {
    updateFilters({ ...values, type: 'academic' });
  };

  const handleResetFilters = () => {
    updateFilters({
      type: 'academic',
      year: null,
      studyYear: null,
      keyword: '',
    });
  };

  const headerStats = [
    {
      value: academicProjects.length,
      label: 'ผลงานทั้งหมด',
      color: themeColors.primary
    },
    {
      icon: FileTextOutlined,
      label: 'เอกสาร PDF',
      color: themeColors.primary
    },
    {
      icon: DownloadOutlined,
      label: 'ดาวน์โหลดได้',
      color: themeColors.primary
    }
  ];

  return (
    <ProjectPageLayout 
      themeColors={themeColors}
      backgroundComponent={<ProjectBackground {...backgroundConfig} themeColors={themeColors} />}
    >
      <ProjectHeader
        icon={BookOutlined}
        title="ผลงานวิชาการ"
        description="คลังเก็บผลงานวิจัย วิทยานิพนธ์ และเอกสารวิชาการ ที่สร้างสรรค์โดยนักศึกษาและบุคลากร"
        themeColors={themeColors}
        stats={headerStats}
      />

      <ProjectContentArea
        isLoading={isLoading}
        error={error}
        projects={academicProjects}
        filters={filters}
        themeColors={themeColors}
        theme="academic"
        projectYears={projectYears}
        level={level}
        projectTypes={[{ value: 'academic', label: 'งานวิชาการ' }]}
        filterTitle="ค้นหาผลงานวิชาการ"
        workGridTitle="ผลงานวิชาการ"
        workGridDescription="เอกสารวิชาการ วิทยานิพนธ์ และงานวิจัย"
        emptyIcon={BookOutlined}
        emptyMessage="ไม่พบผลงานวิชาการที่ตรงกับเงื่อนไขที่เลือก"
        emptySubMessage="ลองปรับเปลี่ยนตัวกรองหรือค้นหาด้วยคำค้นอื่น"
        countMessage="ผลงานวิชาการทั้งหมด {count} ชิ้น"
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onUpdateFilters={updateFilters}
        hideTypeFilter={true}
      />
    </ProjectPageLayout>
  );
};

export default AcademicProjects;