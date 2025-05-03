import React from 'react';
import { CalendarOutlined } from '@ant-design/icons';
import PageTitle from '../../components/common/PageTitle';
import LoginLogList from '../../components/log/LoginLogList';
import FilterPanel from '../../components/common/FilterPanel';
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
    resetFilters,
    refreshLogs
  } = useLog('login');
  console.log("asdasd",logs)

  // ตัวกรองสำหรับบันทึกการเข้าสู่ระบบ
  const filterOptions = [
    {
      name: 'userId',
      label: 'รหัสผู้ใช้',
      type: 'select',
      placeholder: 'เลือกผู้ใช้',
      options: [], // ต้องโหลดข้อมูลผู้ใช้เพิ่มเติม
      showSearch: true
    },
    {
      name: 'startDate',
      label: 'วันที่เริ่มต้น',
      type: 'date',
      placeholder: 'เลือกวันที่เริ่มต้น'
    },
    {
      name: 'endDate',
      label: 'วันที่สิ้นสุด',
      type: 'date',
      placeholder: 'เลือกวันที่สิ้นสุด'
    }
  ];

  return (
    <div>
      <PageTitle
        title="บันทึกการเข้าสู่ระบบ"
        subtitle="ประวัติการเข้าสู่ระบบของผู้ใช้ทั้งหมด"
        icon={<CalendarOutlined />}
      />
      
      <FilterPanel
        filters={filterOptions}
        initialValues={filters}
        onFilter={handleFilterChange}
        onReset={resetFilters}
        loading={loading}
        title="ตัวกรองบันทึกการเข้าสู่ระบบ"
        collapsed={false}
      />
      
      <LoginLogList
        logs={logs}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={handlePaginationChange}
        onSearch={(value) => handleFilterChange({ search: value })}
        searchQuery={filters.search || ''}
        onRefresh={refreshLogs}
      />
    </div>
  );
};

export default LoginLogsPage;