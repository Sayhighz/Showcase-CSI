import React from 'react';
import { CalendarOutlined } from '@ant-design/icons';
import PageTitle from '../../components/common/PageTitle';
import LoginLogList from '../../components/log/LoginLogList';
import useLog from '../../hooks/useLog';

const LoginLogsPage = () => {
  const {
    logs,
    loading,
    error,
    pagination,
    filters,
    handleFilterChange,
    handlePaginationChange,
    resetFilters, // ดึงฟังก์ชัน resetFilters มาจาก hook
    refreshLogs
  } = useLog('login');


  // การจัดการค้นหา
  const handleSearch = (value) => {
    handleFilterChange({ search: value });
  };

  return (
    <div>
      <PageTitle
        title="บันทึกการเข้าสู่ระบบ"
        subtitle="ประวัติการเข้าสู่ระบบของผู้ใช้ทั้งหมด"
        icon={<CalendarOutlined />}
      />
      
      <LoginLogList
        logs={logs}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={handlePaginationChange}
        onSearch={handleSearch}
        searchQuery={filters.search || ''}
        onRefresh={refreshLogs}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters} // เพิ่ม prop onReset และส่ง resetFilters ไปให้ LoginLogList
      />
    </div>
  );
};

export default LoginLogsPage;