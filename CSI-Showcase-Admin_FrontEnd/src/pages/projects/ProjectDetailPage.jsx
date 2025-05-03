import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../../components/common/PageTitle';
import ProjectList from '../../components/projects/ProjectList';
import useProject from '../../hooks/useProject';

const PendingProjectsPage = () => {
  const navigate = useNavigate();
  
  const {
    projects,
    loading,
    error,
    pagination,
    filters,
    handleFilterChange,
    handlePaginationChange,
    approveProject,
    rejectProject,
    deleteProject,
    refreshProjects,
  } = useProject('pending', 'list', { status: 'pending' });

  return (
    <div>
      <PageTitle
        title="โครงงานรอการอนุมัติ"
        subtitle={`มีโครงงานรออนุมัติ ${pagination.total} รายการ`}
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
        filters={filters}
        searchQuery={filters.search || ''}
        searchLoading={loading}
        status="pending"
        filterOptions={{
          type: true,
          year: true,
          studyYear: true,
          tag: false
        }}
      />
    </div>
  );
};

export default PendingProjectsPage;