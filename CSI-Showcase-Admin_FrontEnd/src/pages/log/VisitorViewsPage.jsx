import React from 'react';
import { EyeOutlined } from '@ant-design/icons';
import PageTitle from '../../components/common/PageTitle';
import VisitorViewList from '../../components/log/VisitorViewList';
import FilterPanel from '../../components/common/FilterPanel';
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
    resetFilters,
    refreshLogs
  } = useLog('visitor');

  // ตัวกรองสำหรับบันทึกการเข้าชม
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
        title="บันทึกการเข้าชมของผู้เยี่ยมชม"
        subtitle="ประวัติการเข้าชมโครงงานโดยผู้เยี่ยมชม"
        icon={<EyeOutlined />}
      />
      
      <FilterPanel
        filters={filterOptions}
        initialValues={filters}
        onFilter={handleFilterChange}
        onReset={resetFilters}
        loading={loading}
        title="ตัวกรองบันทึกการเข้าชม"
        collapsed={false}
      />
      
      <VisitorViewList
        views={views}
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

export default VisitorViewsPage;