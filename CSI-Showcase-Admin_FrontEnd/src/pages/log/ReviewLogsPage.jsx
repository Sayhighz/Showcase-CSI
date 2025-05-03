import React from 'react';
import { CheckCircleOutlined } from '@ant-design/icons';
import PageTitle from '../../components/common/PageTitle';
import ReviewLogList from '../../components/log/ReviewLogList';
import FilterPanel from '../../components/common/FilterPanel';
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
    resetFilters,
    refreshLogs
  } = useLog('review');

  // ตัวกรองสำหรับบันทึกการตรวจสอบ
  const filterOptions = [
    {
      name: 'projectId',
      label: 'รหัสโครงงาน',
      type: 'select',
      placeholder: 'เลือกโครงงาน',
      options: [], // ต้องโหลดข้อมูลโครงงานเพิ่มเติม
      showSearch: true
    },
    {
      name: 'status',
      label: 'สถานะ',
      type: 'select',
      placeholder: 'เลือกสถานะ',
      options: [
        { value: 'approved', label: 'อนุมัติ' },
        { value: 'rejected', label: 'ปฏิเสธ' },
        { value: 'updated', label: 'อัปเดต' }
      ]
    },
    {
      name: 'adminId',
      label: 'ผู้ดูแลระบบ',
      type: 'select',
      placeholder: 'เลือกผู้ดูแลระบบ',
      options: [], // ต้องโหลดข้อมูลผู้ดูแลระบบเพิ่มเติม
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
        title="บันทึกการตรวจสอบโครงงาน"
        subtitle="ประวัติการตรวจสอบโครงงานโดยผู้ดูแลระบบ"
        icon={<CheckCircleOutlined />}
      />
      
      <FilterPanel
        filters={filterOptions}
        initialValues={filters}
        onFilter={handleFilterChange}
        onReset={resetFilters}
        loading={loading}
        title="ตัวกรองบันทึกการตรวจสอบ"
        collapsed={false}
      />
      
      <ReviewLogList
        reviews={reviews}
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

export default ReviewLogsPage;