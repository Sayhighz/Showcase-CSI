import React from 'react';
import { EyeOutlined } from '@ant-design/icons';
import PageTitle from '../../components/common/PageTitle';
import VisitorViewList from '../../components/log/VisitorViewList';
import useLog from '../../hooks/useLog';

const VisitorViewsPage = () => {
  const {
    logs: views,
    loading,
    error,
    pagination,
    filters,
    handleFilterChange,
    handlePaginationChange,
    resetFilters, // ดึงฟังก์ชัน resetFilters มาจาก hook
    refreshLogs
  } = useLog('visitor');


  // การจัดการค้นหา
  const handleSearch = (value) => {
    handleFilterChange({ search: value });
  };

  return (
    <div>
      <PageTitle
        title="บันทึกการเข้าชมของผู้เยี่ยมชม"
        subtitle="ประวัติการเข้าชมโครงงานโดยผู้เยี่ยมชม"
        icon={<EyeOutlined />}
      />
      
      <VisitorViewList
        views={views}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={handlePaginationChange}
        onSearch={handleSearch}
        searchQuery={filters.search || ''}
        onRefresh={refreshLogs}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters} // เพิ่ม prop onReset และส่ง resetFilters ไปให้ VisitorViewList
      />
    </div>
  );
};

export default VisitorViewsPage;