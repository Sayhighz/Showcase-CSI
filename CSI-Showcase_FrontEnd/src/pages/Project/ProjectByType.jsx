import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Typography, Tabs, Card, Spin, Empty, Button } from 'antd';
import { ArrowLeftOutlined, FilterOutlined } from '@ant-design/icons';
import { PROJECT } from '../../constants/routes';
import { getProjectTypeInfo, PROJECT_TYPES } from '../../constants/projectTypes';
import { useProject } from '../../hooks';
import ProjectCard from '../../components/Project/ProjectCard';
import ProjectFilter from '../../components/Project/ProjectFilter';
import Pagination from '../../components/common/Pagination';
import ErrorMessage from '../../components/common/ErrorMessage';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

/**
 * ProjectByType component ใช้สำหรับแสดงโปรเจคตามประเภท
 * 
 * @param {Object} props - Props ของ component
 * @param {string} props.defaultType - ประเภทโปรเจคเริ่มต้น
 * @param {boolean} props.showFilter - แสดงตัวกรองหรือไม่
 * @param {boolean} props.showTabs - แสดงแท็บประเภทหรือไม่
 * @param {number} props.pageSize - จำนวนโปรเจคต่อหน้า
 * @param {Object} props.style - Custom style สำหรับ component
 * @returns {JSX.Element} ProjectByType component
 */
const ProjectByType = ({
  defaultType = '',
  showFilter = true,
  showTabs = true,
  pageSize = 9,
  style
}) => {
  // ดึงพารามิเตอร์จาก URL
  const { type: typeParam } = useParams();
  const [activeType, setActiveType] = useState(typeParam || defaultType);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // เรียกใช้ hook เพื่อดึงข้อมูลโปรเจค
  const { 
    fetchAllProjects, 
    projects, 
    isLoading, 
    error, 
    pagination, 
    changePage,
    filters,
    updateFilters
  } = useProject();

  // ดึงข้อมูลประเภทโปรเจคที่ใช้งานอยู่
  const activeTypeInfo = getProjectTypeInfo(activeType);

  // ดึงข้อมูลโปรเจคเมื่อ component ถูกโหลดหรือเมื่อมีการเปลี่ยนประเภท
  useEffect(() => {
    if (activeType) {
      updateFilters({ type: activeType });
      fetchAllProjects({ type: activeType, page: 1, limit: pageSize });
    } else {
      fetchAllProjects({ page: 1, limit: pageSize });
    }
  }, [activeType, fetchAllProjects, updateFilters, pageSize]);

  // ฟังก์ชันสำหรับการเปลี่ยนประเภทโปรเจค
  const handleChangeType = (type) => {
    setActiveType(type);
  };

  // ฟังก์ชันสำหรับการกรองโปรเจค
  const handleFilterChange = (values) => {
    updateFilters(values);
  };

  // ฟังก์ชันสำหรับการค้นหาโปรเจค
  const handleSearch = (values) => {
    fetchAllProjects({ ...values, page: 1, limit: pageSize });
  };

  // ฟังก์ชันสำหรับการรีเซ็ตตัวกรอง
  const handleReset = () => {
    updateFilters({ type: activeType });
    fetchAllProjects({ type: activeType, page: 1, limit: pageSize });
  };

  // ฟังก์ชันสำหรับการเปลี่ยนหน้า
  const handlePageChange = (page, size) => {
    changePage(page, size);
    fetchAllProjects({ ...filters, page, limit: size || pageSize });
  };

  // แสดงข้อความเมื่อเกิดข้อผิดพลาด
  if (error) {
    return (
      <ErrorMessage
        title="เกิดข้อผิดพลาดในการโหลดโปรเจค"
        message={error}
        onReloadClick={() => fetchAllProjects(filters)}
        style={{ ...style }}
      />
    );
  }

  return (
    <div style={{ ...style }}>
      {/* ส่วนหัวของหน้า */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <Link to={PROJECT.ALL}>
            <Button icon={<ArrowLeftOutlined />} style={{ marginRight: 16 }}>
              กลับ
            </Button>
          </Link>
          <Title level={2} style={{ margin: 0 }}>
            {activeTypeInfo ? (
              <>
                {activeTypeInfo.emoji} {activeTypeInfo.label}
              </>
            ) : (
              'โปรเจคทั้งหมด'
            )}
          </Title>
        </div>
        {activeTypeInfo && (
          <Text type="secondary">
            {activeTypeInfo.description}
          </Text>
        )}
      </div>

      {/* แท็บสำหรับเลือกประเภทโปรเจค */}
      {showTabs && (
        <Tabs 
          activeKey={activeType || 'all'} 
          onChange={handleChangeType}
          style={{ marginBottom: 24 }}
        >
          <TabPane tab="ทั้งหมด" key="all" />
          {PROJECT_TYPES.map((type) => (
            <TabPane 
              tab={
                <span>
                  {type.emoji} {type.label}
                </span>
              } 
              key={type.value} 
            />
          ))}
        </Tabs>
      )}

      {/* ตัวกรองโปรเจค */}
      {showFilter && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 16
          }}>
            <Title level={4} style={{ margin: 0 }}>กรองโปรเจค</Title>
            <Button 
              type={showFilterPanel ? 'primary' : 'default'} 
              icon={<FilterOutlined />}
              onClick={() => setShowFilterPanel(!showFilterPanel)}
            >
              {showFilterPanel ? 'ซ่อนตัวกรอง' : 'แสดงตัวกรอง'}
            </Button>
          </div>
          
          {showFilterPanel && (
            <ProjectFilter
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
              onReset={handleReset}
              initialValues={{ ...filters, type: activeType }}
              loading={isLoading}
            />
          )}
        </div>
      )}

      {/* แสดง loading state */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <Text style={{ display: 'block', marginTop: 16 }}>กำลังโหลดโปรเจค...</Text>
        </div>
      )}

      {/* แสดงข้อความเมื่อไม่มีโปรเจค */}
      {!isLoading && (!projects || projects.length === 0) && (
        <Empty 
          description="ไม่พบโปรเจคที่ตรงกับเงื่อนไข" 
          style={{ margin: '40px 0' }}
        />
      )}

      {/* แสดงรายการโปรเจค */}
      {!isLoading && projects && projects.length > 0 && (
        <>
          <Row gutter={[24, 24]}>
            {projects.map((project) => (
              <Col key={project.id} xs={24} sm={12} md={8}>
                <ProjectCard project={project} />
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {pagination.total > pageSize && (
            <Pagination
              current={pagination.current}
              total={pagination.total}
              pageSize={pagination.pageSize}
              onChange={handlePageChange}
              style={{ marginTop: 40 }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ProjectByType;