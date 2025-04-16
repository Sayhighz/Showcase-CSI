import React, { useState, useEffect, useCallback } from 'react';
import { Button, message, Tabs, Badge, Card, Typography } from 'antd';
import { 
  PlusOutlined, 
  ReloadOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import './projectStyle.css'

// Components
import PageHeader from '../../components/common/PageHeader';
import ProjectList from '../../components/projects/ProjectList';
import ProjectFilter from '../../components/projects/ProjectFilter';
import ProjectStats from '../../components/projects/ProjectStats';
import LoadingState from '../../components/common/LoadingState';
import ErrorAlert from '../../components/common/ErrorAlert';
import ApproveRejectModal from '../../components/projects/ApproveRejectModal';
import DeleteProjectModal from '../../components/projects/DeleteProjectModal';

// Hooks and Services
import useProject from '../../hooks/useProject';
import { getProjectStats } from '../../services/projectService';
import useNotification from '../../hooks/useNotification';

// Constants
import { TABS } from '../../constants/thaiMessages';

const { Title } = Typography;

/**
 * หน้าจัดการผลงาน
 * แสดงรายการผลงานทั้งหมด สามารถค้นหา กรอง ดูรายละเอียด อนุมัติ ปฏิเสธ และลบผลงานได้
 * @returns {React.ReactElement} หน้าจัดการผลงาน
 */
const Project = () => {
  const { showSuccess, showError } = useNotification();
  
  // สถานะสำหรับแท็บปัจจุบัน
  const [activeTab, setActiveTab] = useState('all');
  
  // สถานะสำหรับข้อมูลสถิติ
  const [stats, setStats] = useState({
    total_projects: 0,
    approved_count: 0,
    pending_count: 0,
    rejected_count: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);
  
  // สถานะสำหรับ Modal
  const [approveRejectModal, setApproveRejectModal] = useState({
    visible: false,
    type: 'approve',
    projectId: null,
    projectTitle: ''
  });
  const [deleteModal, setDeleteModal] = useState({
    visible: false,
    projectId: null,
    projectTitle: ''
  });
  
  // ใช้ custom hook สำหรับจัดการข้อมูลโปรเจค
  const {
    projects,
    loading,
    error,
    pagination,
    filters,
    handleFilterChange,
    resetFilters,
    handlePaginationChange,
    approveProject,
    rejectProject,
    deleteProject,
    refreshProjects
  } = useProject(
    // กำหนดค่าเริ่มต้นของ filter ตาม tab ที่เลือก
    activeTab === 'all' ? 'all' : (
      activeTab === 'pending' ? 'pending' : 'all'
    ),
    'list',
    { status: activeTab === 'all' ? '' : activeTab }
  );
  
  // Breadcrumb สำหรับ PageHeader
  const breadcrumb = [
    { title: 'หน้าหลัก', href: '/' },
    { title: 'จัดการผลงาน' }
  ];
  
  // ดึงข้อมูลสถิติโปรเจค
  const fetchProjectStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await getProjectStats();
      if (response.success) {
        setStats(response.data.project_counts);
      } else {
        showError('ไม่สามารถโหลดข้อมูลสถิติได้');
      }
    } catch (err) {
      console.error('Error fetching project stats:', err);
      showError('เกิดข้อผิดพลาดในการโหลดข้อมูลสถิติ');
    } finally {
      setStatsLoading(false);
    }
  }, [showError]);
  
  // โหลดข้อมูลสถิติเมื่อ component mount
  useEffect(() => {
    fetchProjectStats();
  }, [fetchProjectStats]);
  
  // สร้างตัวเลือกปีการศึกษา
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear() + 543; // แปลงเป็นปี พ.ศ.
    const years = [];
    // แสดงย้อนหลัง 5 ปี และปีปัจจุบัน
    for (let i = 0; i <= 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  };
  
  // จัดการเมื่อเปลี่ยนแท็บ
  const handleTabChange = (key) => {
    setActiveTab(key);
    
    // ตั้งค่าตัวกรองสถานะตาม tab ที่เลือก
    let statusFilter = '';
    if (key !== 'all') {
      statusFilter = key;
    }
    
    handleFilterChange({ status: statusFilter });
  };
  
  // จัดการเมื่อกดปุ่มรีเฟรช
  const handleRefresh = async () => {
    await refreshProjects();
    await fetchProjectStats();
    showSuccess('รีเฟรชข้อมูลสำเร็จ');
  };
  
  // จัดการเมื่อกดปุ่มอนุมัติจากตาราง
  const handleApproveClick = (projectId) => {
    if (!projectId) {
      showError('เกิดข้อผิดพลาด: ไม่พบรหัสโปรเจค');
      return;
    }
    
    // ตรวจสอบว่า projects เป็น array และมีข้อมูลหรือไม่
    if (!Array.isArray(projects)) {
      setApproveRejectModal({
        visible: true,
        type: 'approve',
        projectId: projectId,
        projectTitle: `โปรเจค #${projectId}`
      });
      return;
    }
    
    // หาโปรเจคที่ต้องการอนุมัติ
    const project = projects.find(p => String(p.project_id) === String(projectId));
    
    // ตั้งค่า modal
    setApproveRejectModal({
      visible: true,
      type: 'approve',
      projectId: projectId,
      projectTitle: project ? project.title : `โปรเจค #${projectId}`
    });
  };
  
  // จัดการเมื่อกดปุ่มปฏิเสธจากตาราง
  const handleRejectClick = (projectId) => {
    if (!projectId) {
      showError('เกิดข้อผิดพลาด: ไม่พบรหัสโปรเจค');
      return;
    }
    
    // ตรวจสอบว่า projects เป็น array และมีข้อมูลหรือไม่
    if (!Array.isArray(projects)) {
      setApproveRejectModal({
        visible: true,
        type: 'reject',
        projectId: projectId,
        projectTitle: `โปรเจค #${projectId}`
      });
      return;
    }
    
    // หาโปรเจคที่ต้องการปฏิเสธ
    const project = projects.find(p => String(p.project_id) === String(projectId));
    
    // ตั้งค่า modal
    setApproveRejectModal({
      visible: true,
      type: 'reject',
      projectId: projectId,
      projectTitle: project ? project.title : `โปรเจค #${projectId}`
    });
  };
  
  // จัดการเมื่อกดปุ่มลบจากตาราง
  const handleDeleteClick = (projectId) => {
    if (!projectId) {
      showError('เกิดข้อผิดพลาด: ไม่พบรหัสโปรเจค');
      return;
    }
    
    // ตรวจสอบว่า projects เป็น array และมีข้อมูลหรือไม่
    if (!Array.isArray(projects)) {
      setDeleteModal({
        visible: true,
        projectId: projectId,
        projectTitle: `โปรเจค #${projectId}`
      });
      return;
    }
    
    // หาโปรเจคที่ต้องการลบ
    const project = projects.find(p => String(p.project_id) === String(projectId));
    
    // ตั้งค่า modal
    setDeleteModal({
      visible: true,
      projectId: projectId,
      projectTitle: project ? project.title : `โปรเจค #${projectId}`
    });
  };
  
  // จัดการเมื่อยืนยันการอนุมัติหรือปฏิเสธ
  const handleApproveRejectConfirm = async (comment) => {
    const projectId = approveRejectModal.projectId;
    
    if (!projectId) {
      showError('เกิดข้อผิดพลาด: ไม่พบรหัสโปรเจค');
      return;
    }
    
    try {
      let success = false;
      
      if (approveRejectModal.type === 'approve') {
        // เรียกใช้ฟังก์ชันอนุมัติโปรเจคพร้อมส่ง projectId
        success = await approveProject(projectId, comment);
        
        if (success) {
          showSuccess('อนุมัติผลงานสำเร็จ');
        }
      } else {
        // เรียกใช้ฟังก์ชันปฏิเสธโปรเจคพร้อมส่ง projectId และ comment
        success = await rejectProject(projectId, comment);
        
        if (success) {
          showSuccess('ปฏิเสธผลงานสำเร็จ');
        }
      }
      
      if (success) {
        // ปิด modal และอัพเดตสถิติ
        setApproveRejectModal({
          visible: false,
          type: 'approve',
          projectId: null,
          projectTitle: ''
        });
        
        // อัพเดตสถิติ
        await fetchProjectStats();
        // รีเฟรชโปรเจค
        await refreshProjects();
      }
    } catch (err) {
      console.error('Error in approve/reject confirmation:', err);
      showError('เกิดข้อผิดพลาดในการดำเนินการ');
    }
  };
  
  // จัดการเมื่อยืนยันการลบ
  const handleDeleteConfirm = async () => {
    // ดึง projectId จาก state ที่เก็บไว้
    const projectId = deleteModal.projectId;
    
    if (!projectId) {
      showError('เกิดข้อผิดพลาด: ไม่พบรหัสโปรเจค');
      return;
    }
    
    try {
      const success = await deleteProject(projectId);
      if (success) {
        showSuccess('ลบผลงานสำเร็จ');
        setDeleteModal({ 
          visible: false, 
          projectId: null, 
          projectTitle: '' 
        });
        
        // อัพเดตสถิติหลังจากลบ
        await fetchProjectStats();
        // รีเฟรชโปรเจค
        await refreshProjects();
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      showError('เกิดข้อผิดพลาดในการลบผลงาน');
    }
  };

  // สร้าง items สำหรับ Tabs
  const createTabItems = () => {
    return [
      {
        key: 'all',
        label: (
          <span className="flex items-center">
            <FileTextOutlined className="mr-1" />
            <span>{TABS.ALL}</span>
            <Badge count={stats.total_projects} className="ml-2" />
          </span>
        ),
      },
      {
        key: 'pending',
        label: (
          <span className="flex items-center">
            <ClockCircleOutlined className="mr-1" style={{ color: '#faad14' }} />
            <span>{TABS.PENDING}</span>
            <Badge count={stats.pending_count} className="ml-2" style={{ backgroundColor: '#faad14' }} />
          </span>
        ),
      },
      {
        key: 'approved',
        label: (
          <span className="flex items-center">
            <CheckCircleOutlined className="mr-1" style={{ color: '#52c41a' }} />
            <span>{TABS.APPROVED}</span>
            <Badge count={stats.approved_count} className="ml-2" style={{ backgroundColor: '#52c41a' }} />
          </span>
        ),
      },
      {
        key: 'rejected',
        label: (
          <span className="flex items-center">
            <CloseCircleOutlined className="mr-1" style={{ color: '#ff4d4f' }} />
            <span>{TABS.REJECTED}</span>
            <Badge count={stats.rejected_count} className="ml-2" style={{ backgroundColor: '#ff4d4f' }} />
          </span>
        ),
      },
    ];
  };

  console.log('projects', projects);
  
  return (
    <div className="project-management-page">
      {/* Header */}
      <PageHeader
        title="จัดการผลงาน"
        subtitle="จัดการผลงานนักศึกษาทั้งหมด รวมถึงอนุมัติ ปฏิเสธ และดูรายละเอียด"
        breadcrumb={breadcrumb}
        extra={
          <div className="flex space-x-2">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={loading || statsLoading}
              className="flex items-center rounded-md shadow-sm hover:shadow"
              size="large"
            >
              รีเฟรช
            </Button>
          </div>
        }
        className="mb-6 shadow-sm"
      />
      
      {/* สถิติโปรเจค */}
      <ProjectStats stats={stats} loading={statsLoading} />
      
      {/* แสดงข้อความผิดพลาด (ถ้ามี) */}
      {error && (
        <ErrorAlert
          message={error}
          description="ไม่สามารถโหลดข้อมูลผลงานได้ กรุณาลองใหม่อีกครั้ง"
          onRetry={refreshProjects}
          className="mb-6"
        />
      )}
      
      {/* กรองข้อมูล */}
      <ProjectFilter
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        filters={filters}
        yearOptions={generateYearOptions()}
      />
      
      {/* แท็บสถานะ */}
      <Card 
        className="rounded-md overflow-hidden shadow-sm mb-6 hover:shadow-md transition-all duration-300"
        bodyStyle={{ padding: 0 }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={createTabItems()}
          className="px-4 pt-4"
          size="large"
          type="card"
          animated={{ inkBar: true, tabPane: true }}
        />
        
        {/* ตารางรายการผลงาน */}
        <div className="p-4">
          {loading ? (
            <LoadingState type="table" columns={8} count={5} />
          ) : (
            <ProjectList
              projects={projects}
              pagination={pagination}
              onPaginationChange={handlePaginationChange}
              onApprove={handleApproveClick}
              onReject={handleRejectClick}
              onDelete={handleDeleteClick}
              loading={loading}
            />
          )}
        </div>
      </Card>
      
      {/* Modal สำหรับอนุมัติหรือปฏิเสธโปรเจค */}
      <ApproveRejectModal
        visible={approveRejectModal.visible}
        modalType={approveRejectModal.type}
        projectId={approveRejectModal.projectId}
        projectTitle={approveRejectModal.projectTitle}
        onConfirm={handleApproveRejectConfirm}
        onCancel={() => setApproveRejectModal({ 
          visible: false, 
          type: 'approve', 
          projectId: null, 
          projectTitle: '' 
        })}
        loading={loading}
      />
      
      {/* Modal สำหรับลบโปรเจค */}
      <DeleteProjectModal
        visible={deleteModal.visible}
        projectId={deleteModal.projectId}
        projectTitle={deleteModal.projectTitle}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ 
          visible: false, 
          projectId: null, 
          projectTitle: '' 
        })}
        loading={loading}
      />
    </div>
  );
};

export default Project;