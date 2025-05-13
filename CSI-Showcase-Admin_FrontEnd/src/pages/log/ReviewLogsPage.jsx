import React from 'react';
import { CheckCircleOutlined } from '@ant-design/icons';
import PageTitle from '../../components/common/PageTitle';
import ReviewLogList from '../../components/log/ReviewLogList';
import useLog from '../../hooks/useLog';

const ReviewLogsPage = () => {
  const {
    logs: reviews,
    loading,
    error,
    pagination,
    filters,
    handleFilterChange,
    handlePaginationChange,
    resetFilters, // ดึงฟังก์ชัน resetFilters มาจาก hook
    refreshLogs
  } = useLog('review');

  // การจัดการค้นหา
  const handleSearch = (value) => {
    handleFilterChange({ search: value });
  };

  return (
    <div>
      <PageTitle
        title="บันทึกการตรวจสอบโครงงาน"
        subtitle="ประวัติการตรวจสอบโครงงานโดยผู้ดูแลระบบ"
        icon={<CheckCircleOutlined />}
      />
      
      <ReviewLogList
        reviews={reviews}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={handlePaginationChange}
        onSearch={handleSearch}
        searchQuery={filters.search || ''}
        onRefresh={refreshLogs}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters} // เพิ่ม prop onReset และส่ง resetFilters ไปให้ ReviewLogList
      />
    </div>
  );
};

export default ReviewLogsPage;