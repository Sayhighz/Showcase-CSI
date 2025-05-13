import React from 'react';
import { LineChartOutlined } from '@ant-design/icons';
import PageTitle from '../../components/common/PageTitle';
import ProjectStats from '../../components/projects/ProjectStats';
import useProject from '../../hooks/useProject';

const ProjectStatsPage = () => {
  const {
    projectStats,
    loading,
    error,
    refreshProjects,
  } = useProject('stats', 'stats');
//   console.log("asdd",projectStats)

  return (
    <div>
      <PageTitle
        title="สถิติโครงงาน"
        subtitle="ภาพรวมสถิติการใช้งานระบบโครงงาน"
        icon={<LineChartOutlined />}
      />
      
      <ProjectStats
        stats={projectStats}
        loading={loading}
        error={error}
        onRefresh={refreshProjects}
      />
    </div>
  );
};

export default ProjectStatsPage;