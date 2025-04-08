// src/pages/Log/Log.jsx
import React, { useState } from 'react';
import { Card, Tabs, Alert, Divider, Row, Col, Statistic, Button, Badge, Progress, Space } from 'antd';
import { 
  ClockCircleOutlined, 
  FileTextOutlined, 
  InfoCircleOutlined, 
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  LaptopOutlined,
  GlobalOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  EyeOutlined
} from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import LoginLogTable from '../../components/log/LoginLogTable';
import LoginLogFilter from '../../components/log/LoginLogFilter';
import LoginLogDetailModal from '../../components/log/LoginLogDetailModal';
import LoadingState from '../../components/common/LoadingState';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import useLoginLog from '../../hooks/useLoginLog';
import { HEADERS, HEADER_DESCRIPTIONS } from '../../constants/thaiMessages';

const Log = () => {
  // นำเข้า hook สำหรับจัดการข้อมูลประวัติการเข้าสู่ระบบ
  const {
    logs,
    stats,
    chartData,
    loading,
    statsLoading,
    error,
    pagination,
    filters,
    handleFilterChange,
    resetFilters,
    handlePaginationChange,
    refreshLogs,
    refreshStats
  } = useLoginLog();
  
  // สถานะสำหรับการแสดง Modal รายละเอียด
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  
  // แสดง Modal รายละเอียด
  const showDetailModal = (log) => {
    setSelectedLog(log);
    setDetailModalVisible(true);
  };
  
  // ปิด Modal รายละเอียด
  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedLog(null);
  };
  
  // รีเฟรชข้อมูล
  const handleRefresh = () => {
    refreshLogs(pagination.current, pagination.pageSize);
    refreshStats();
  };

  // คำนวณอัตราความสำเร็จ
  const getSuccessRate = () => {
    if (!stats) return 0;
    const totalLogins = stats.totalSuccess + stats.totalFailed || 0;
    if (totalLogins === 0) return 0;
    return Math.round((stats.totalSuccess / totalLogins) * 100);
  };

  // สร้างข้อมูลสถิติ
  const renderStatistics = () => {
    if (statsLoading) {
      return <LoadingState type="card" count={4} />;
    }
    
    if (!stats) {
      return (
        <EmptyState 
          type="stats" 
          onAction={refreshStats}
          actionText="โหลดข้อมูลสถิติ"
        />
      );
    }

    const successRate = getSuccessRate();
    
    return (
      <div className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card 
              className="h-full hover:shadow-md transition-shadow duration-300 border-t-4 border-t-blue-500"
              bodyStyle={{ padding: '20px' }}
            >
              <Statistic
                title={<div className="flex items-center"><UserOutlined className="mr-2 text-blue-500" /> จำนวนผู้ใช้ทั้งหมด</div>}
                value={stats.totalUsers || 0}
                valueStyle={{ color: '#1890ff' }}
                prefix={<UserOutlined />}
              />
              <div className="text-xs text-gray-500 mt-2">ผู้ใช้ที่มีการเข้าสู่ระบบ</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card 
              className="h-full hover:shadow-md transition-shadow duration-300 border-t-4 border-t-green-500"
              bodyStyle={{ padding: '20px' }}
            >
              <Statistic
                title={<div className="flex items-center"><CheckCircleOutlined className="mr-2 text-green-500" /> เข้าสู่ระบบสำเร็จ</div>}
                value={stats.totalSuccess || 0}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
              <div className="text-xs text-gray-500 mt-2">จำนวนครั้งที่เข้าสู่ระบบสำเร็จ</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card 
              className="h-full hover:shadow-md transition-shadow duration-300 border-t-4 border-t-red-500"
              bodyStyle={{ padding: '20px' }}
            >
              <Statistic
                title={<div className="flex items-center"><CloseCircleOutlined className="mr-2 text-red-500" /> เข้าสู่ระบบล้มเหลว</div>}
                value={stats.totalFailed || 0}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<CloseCircleOutlined />}
              />
              <div className="text-xs text-gray-500 mt-2">จำนวนครั้งที่เข้าสู่ระบบล้มเหลว</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card 
              className="h-full hover:shadow-md transition-shadow duration-300 border-t-4 border-t-purple-500"
              bodyStyle={{ padding: '20px' }}
            >
              <Statistic
                title={<div className="flex items-center"><PieChartOutlined className="mr-2 text-purple-500" /> อัตราความสำเร็จ</div>}
                value={successRate}
                suffix="%"
                valueStyle={{ color: successRate > 90 ? '#52c41a' : successRate > 70 ? '#faad14' : '#ff4d4f' }}
              />
              <Progress 
                percent={successRate} 
                size="small" 
                status={successRate > 90 ? 'success' : successRate > 70 ? 'normal' : 'exception'} 
                className="mt-2"
                showInfo={false}
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  };
  
  // รายการแท็บ
  const tabItems = [
    {
      key: 'login-logs',
      label: <span><ClockCircleOutlined /> ประวัติการเข้าสู่ระบบ</span>,
      children: (
        <div>
          <LoginLogFilter 
            onFilterChange={handleFilterChange}
            onReset={resetFilters}
            filters={filters}
          />
          
          {error ? (
            <ErrorAlert 
              message="ไม่สามารถโหลดข้อมูลได้" 
              description={error} 
              onRetry={handleRefresh}
            />
          ) : (
            <>
              {loading ? (
                <LoadingState type="table" columns={6} count={5} />
              ) : logs.length === 0 ? (
                <EmptyState 
                  type="log" 
                  onAction={handleRefresh}
                  actionText="รีเฟรชข้อมูล"
                />
              ) : (
                <LoginLogTable 
                  data={logs}
                  loading={loading}
                  onRefresh={handleRefresh}
                  pagination={pagination}
                  onPaginationChange={handlePaginationChange}
                  onViewDetail={showDetailModal}
                />
              )}
            </>
          )}
        </div>
      ),
    },
  ];
  
  return (
    <div className="page-container">
      <PageHeader
        title={
          <Space>
            {HEADERS.LOGIN_INFO}
            <Badge 
              count={logs.length} 
              overflowCount={999} 
              style={{ backgroundColor: '#1890ff' }}
            />
          </Space>
        }
        subtitle={HEADER_DESCRIPTIONS.LOGIN_INFO}
        breadcrumb={[
          { title: 'แดชบอร์ด', path: '/dashboard' },
          { title: 'ข้อมูลการเข้าสู่ระบบ' }
        ]}
        extra={
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading || statsLoading}
            className="bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600"
          >
            รีเฟรชข้อมูล
          </Button>
        }
      />
      
      <Alert
        message={
          <div className="font-medium">คำแนะนำการใช้งาน</div>
        }
        description={
          <div className="text-sm">
            <p>หน้านี้แสดงประวัติการเข้าสู่ระบบของผู้ใช้ทั้งหมด คุณสามารถดูได้ทั้งในรูปแบบตารางและสถิติ</p>
            <ul className="mt-2 list-disc list-inside">
              <li>แท็บ <strong>ประวัติการเข้าสู่ระบบ</strong> แสดงรายละเอียดการเข้าสู่ระบบแต่ละครั้ง</li>
              <li>คลิกที่ปุ่ม <EyeOutlined /> เพื่อดูรายละเอียดเพิ่มเติมของการเข้าสู่ระบบแต่ละครั้ง</li>
            </ul>
          </div>
        }
        type="info"
        showIcon
        icon={<InfoCircleOutlined className="text-blue-500" />}
        closable
        className="mb-6 border-blue-200 bg-blue-50"
      />
      
      <Card 
        className="shadow-sm hover:shadow-md transition-shadow duration-300 mb-6 rounded-lg overflow-hidden"
        bodyStyle={{ padding: 0 }}
      >
        <Tabs 
          defaultActiveKey="login-logs" 
          items={tabItems} 
          className="login-log-tabs"
          tabBarStyle={{ background: '#f5f7fa', padding: '8px 16px 0' }}
          size="large"
        />
      </Card>
      
      {/* Modal แสดงรายละเอียดประวัติการเข้าสู่ระบบ */}
      <LoginLogDetailModal
        visible={detailModalVisible}
        onClose={closeDetailModal}
        log={selectedLog}
      />
      
      {/* CSS สำหรับ styling */}
      <style jsx global>{`
        .login-log-tabs .ant-tabs-nav::before {
          border-bottom: none;
        }
        
        .login-log-tabs .ant-tabs-tab {
          margin-right: 24px;
          padding: 12px 0;
          font-size: 15px;
        }
        
        .login-log-tabs .ant-tabs-tab-active {
          font-weight: 600;
        }
        
        .login-log-tabs .ant-tabs-ink-bar {
          height: 3px;
          border-radius: 3px 3px 0 0;
        }
        
        .login-log-tabs .ant-tabs-tab:hover {
          color: #1890ff;
        }
        
        .page-container {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Log;