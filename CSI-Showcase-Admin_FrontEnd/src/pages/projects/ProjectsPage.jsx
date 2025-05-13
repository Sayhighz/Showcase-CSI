import React from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../../components/common/PageTitle';
import ProjectList from '../../components/projects/ProjectList';
import useProject from '../../hooks/useProject';

const ProjectsPage = () => {
  const navigate = useNavigate();
  
  const {
    projects,
    loading,
    error,
    pagination,
    filters,
    searchQuery,
    handleFilterChange,
    handlePaginationChange,
    approveProject,
    rejectProject,
    deleteProject,
    refreshProjects,
  } = useProject('all', 'list');

  return (
    <div>
      <PageTitle
        title="จัดการโครงงานทั้งหมด"
        subtitle={`โครงงานทั้งหมด ${pagination.total} รายการ`}
      />
      
      <ProjectList
        projects={projects}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={handlePaginationChange}
        onDelete={deleteProject}
        onApprove={approveProject}
        onReject={rejectProject}
        onSearch={(value) => handleFilterChange({ search: value })}
        onFilter={handleFilterChange}
        onAddProject={() => navigate('/projects/new')}
        filters={filters}
        searchQuery={filters.search || ''}
        searchLoading={loading}
        status="all"
      />
    </div>
  );
};

export default ProjectsPage;