import React, { useEffect } from 'react';
import { TrophyOutlined, CrownOutlined, RocketOutlined, StarFilled } from '@ant-design/icons';

import { useProject } from '../../hooks';
import ProjectPageLayout from '../../components/Project/ProjectPageLayout';
import ProjectHeader from '../../components/Project/ProjectHeader';
import ProjectBackground from '../../components/Project/ProjectBackground';
import ProjectContentArea from '../../components/Project/ProjectContentArea';
import { createThemeColors, createBackgroundConfig } from '../../components/Project/ThemeConfig';

const CompetitionProjects = () => {
  const themeColors = createThemeColors('competition');
  const backgroundConfig = createBackgroundConfig('competition', themeColors);
  
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

  const competitionProjects = projects.filter(project => project.category === 'competition');

  useEffect(() => {
    updateFilters({ type: 'competition' });
    fetchAllProjects();
  }, []);

  const handleFilterChange = (values) => {
    updateFilters({ ...values, type: 'competition' });
  };

  const handleResetFilters = () => {
    updateFilters({
      type: 'competition',
      year: null,
      studyYear: null,
      keyword: '',
    });
  };

  const headerStats = [
    {
      value: competitionProjects.length,
      label: 'ผลงานแข่งขัน',
      color: themeColors.primary,
      animation: { scale: [1, 1.1, 1] },
      transition: { duration: 2, repeat: Infinity }
    },
    {
      icon: TrophyOutlined,
      label: 'ชิงชัย',
      color: themeColors.primary,
      animation: { rotate: [0, 15, 0] },
      transition: { duration: 3, repeat: Infinity }
    },
    {
      icon: StarFilled,
      label: 'เชิดชู',
      color: themeColors.secondary,
      animation: { scale: [1, 1.2, 1] },
      transition: { duration: 2.5, repeat: Infinity }
    },
    {
      icon: RocketOutlined,
      label: 'ก้าวหน้า',
      color: themeColors.dark,
      animation: { y: [0, -8, 0], rotate: [0, 10, 0] },
      transition: { duration: 2.2, repeat: Infinity }
    }
  ];

  return (
    <ProjectPageLayout 
      themeColors={themeColors}
      backgroundComponent={<ProjectBackground {...backgroundConfig} themeColors={themeColors} />}
    >
      <ProjectHeader
        icon={TrophyOutlined}
        title="ผลงานการแข่งขัน"
        description="คลังเก็บผลงานที่โดดเด่นจากการแข่งขันต่างๆ ผลงานที่ได้รับรางวัลและเกียรติยศ"
        themeColors={themeColors}
        stats={headerStats}
        additionalIcons={[CrownOutlined]}
      />

      <ProjectContentArea
        isLoading={isLoading}
        error={error}
        projects={competitionProjects}
        filters={filters}
        themeColors={themeColors}
        theme="competition"
        projectYears={projectYears}
        level={level}
        projectTypes={[{ value: 'competition', label: 'งานการแข่งขัน' }]}
        filterTitle="ค้นหาผลงานการแข่งขัน"
        workGridTitle="ผลงานการแข่งขัน"
        workGridDescription="ผลงานที่ได้รับรางวัลและเกียรติยศจากการแข่งขันต่างๆ"
        emptyIcon={TrophyOutlined}
        emptyMessage="ไม่พบผลงานการแข่งขันที่ตรงกับเงื่อนไขที่เลือก"
        emptySubMessage="ลองปรับเปลี่ยนตัวกรองหรือค้นหาด้วยคำค้นอื่น"
        countMessage="ผลงานการแข่งขันทั้งหมด {count} ชิ้น"
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onUpdateFilters={updateFilters}
        hideTypeFilter={true}
      />
    </ProjectPageLayout>
  );
};

export default CompetitionProjects;