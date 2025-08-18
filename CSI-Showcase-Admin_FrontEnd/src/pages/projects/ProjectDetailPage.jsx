import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, Tabs, Modal, Input, message,
  Empty, Button, Select
} from 'antd';
import useProject from '../../hooks/useProject';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import PageTitle from '../../components/common/PageTitle';
import { 
  ProjectHeader, 
  ProjectInfo, 
  ProjectFiles, 
  Contributors, 
  ReviewHistory, 
  CreatorInfo, 
  CategoryDetails
} from '../../components/projects/detail';
import ProjectReviewForm from '../../components/projects/ProjectReviewForm';
import { FileOutlined, TeamOutlined, HistoryOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // ใช้ hook จัดการข้อมูลโครงงาน
  const {
    projectDetails,
    loading,
    error,
    approveProject,
    rejectProject,
    deleteProject,
    updateProject,
    refreshProjectDetails,
    actionLoading
  } = useProject('detail', 'detail', {}, projectId);

  // สถานะสำหรับแสดง modal
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    type: '',
    study_year: '',
    year: '',
    semester: '',
    visibility: 1
  });

  // Modal อนุมัติ (ต้องใส่เหตุผล)
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewAction, setReviewAction] = useState('approve');

  // เมื่อโหลดข้อมูลโปรเจคสำเร็จ ให้กำหนดค่าเริ่มต้นสำหรับฟอร์มแก้ไข
  useEffect(() => {
    if (projectDetails) {
      setEditForm({
        title: projectDetails.title || '',
        description: projectDetails.description || '',
        type: projectDetails.type || '',
        study_year: projectDetails.study_year || '',
        year: projectDetails.year || '',
        semester: projectDetails.semester || '',
        visibility: projectDetails.visibility !== undefined ? projectDetails.visibility : 1
      });
    }
  }, [projectDetails]);

  // อนุมัติโปรเจค (เปิดโมดัลเพื่อระบุเหตุผลก่อน)
  const handleApproveProject = () => {
    setReviewAction('approve');
    setReviewModalVisible(true);
  };

  // แสดง modal ปฏิเสธโปรเจค
  const showRejectModal = () => {
    setRejectReason('');
    setRejectModalVisible(true);
  };

  // ปฏิเสธโปรเจค
  const handleRejectProject = async () => {
    if (!rejectReason.trim()) {
      message.error('กรุณาระบุเหตุผลที่ปฏิเสธ');
      return;
    }

    const success = await rejectProject(projectId, rejectReason);
    if (success) {
      message.success('ปฏิเสธโปรเจคสำเร็จ');
      setRejectModalVisible(false);
      refreshProjectDetails();
    }
  };

  // ยืนยันจากฟอร์มรีวิว
  const handleReviewFinish = async (values) => {
    if (reviewAction === 'approve') {
      const success = await approveProject(projectId, values.comment);
      if (success) {
        message.success('อนุมัติโปรเจคสำเร็จ');
        setReviewModalVisible(false);
        refreshProjectDetails();
      }
    }
  };

  // ลบโปรเจค
  const handleDeleteProject = async () => {
    const success = await deleteProject(projectId);
    if (success) {
      message.success('ลบโปรเจคสำเร็จ');
      navigate('/projects');
    }
  };

  // แสดง modal แก้ไขโปรเจค
  const showEditModal = () => {
    setEditModalVisible(true);
  };

  // แก้ไขโปรเจค
  const handleEditProject = async () => {
    if (!editForm.title.trim()) {
      message.error('กรุณาระบุชื่อโปรเจค');
      return;
    }

    const success = await updateProject(projectId, editForm);
    if (success) {
      message.success('แก้ไขโปรเจคสำเร็จ');
      setEditModalVisible(false);
      refreshProjectDetails();
    }
  };

  // จัดการการเปลี่ยนแปลงข้อมูลในฟอร์มแก้ไข
  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // กลับไปหน้ารายการโปรเจค
  const goBack = () => {
    navigate('/projects');
  };
  
  // ถ้ากำลังโหลดข้อมูล แสดง Loading
  if (loading) {
    return (
      <div className="space-y-6">
        <PageTitle title="รายละเอียดผลงาน" subtitle="กำลังโหลดข้อมูล..." />
        <Card>
          <LoadingSpinner />
        </Card>
      </div>
    );
  }
  
  // ถ้ามีข้อผิดพลาด แสดงข้อความผิดพลาด
  if (error) {
    return (
      <div className="space-y-6">
        <PageTitle title="รายละเอียดผลงาน" subtitle="เกิดข้อผิดพลาด" />
        <Card>
          <ErrorDisplay error={error} />
          <div className="flex justify-center mt-4">
            <Button 
              type="primary" 
              icon={<ArrowLeftOutlined />} 
              onClick={goBack}
              className="bg-purple-600 hover:bg-purple-700"
            >
              กลับไปหน้ารายการโปรเจค
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  // ถ้าไม่พบข้อมูลโปรเจค
  if (!projectDetails) {
    return (
      <div className="space-y-6">
        <PageTitle title="รายละเอียดผลงาน" subtitle="ไม่พบข้อมูลโปรเจค" />
        <Card>
          <Empty description="ไม่พบข้อมูลโปรเจคที่ต้องการ" />
          <div className="flex justify-center mt-4">
            <Button 
              type="primary" 
              icon={<ArrowLeftOutlined />} 
              onClick={goBack}
              className="bg-purple-600 hover:bg-purple-700"
            >
              กลับไปหน้ารายการโปรเจค
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <ProjectHeader 
        title={projectDetails.title}
        projectId={projectDetails.project_id}
        onEdit={showEditModal}
        onDelete={handleDeleteProject}
        onBack={goBack}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* คอลัมน์ซ้าย: ข้อมูลทั่วไป */}
        <div className="lg:col-span-2 space-y-6">
          <ProjectInfo 
            projectDetails={projectDetails}
            onApprove={handleApproveProject}
            onReject={showRejectModal}
          />
          
          <Card title="รายละเอียดเพิ่มเติม" className="shadow-md">
            <Tabs defaultActiveKey="1">
              <TabPane 
                tab={
                  <span className="flex items-center">
                    <FileOutlined className="mr-2" />
                    ไฟล์และรูปภาพ
                  </span>
                } 
                key="1"
              >
                <ProjectFiles projectDetails={projectDetails} />
              </TabPane>
              
              <TabPane 
                tab={
                  <span className="flex items-center">
                    <TeamOutlined className="mr-2" />
                    ผู้ร่วมงาน
                  </span>
                } 
                key="2"
              >
                <Contributors projectDetails={projectDetails} />
              </TabPane>
              
              <TabPane 
                tab={
                  <span className="flex items-center">
                    <HistoryOutlined className="mr-2" />
                    ประวัติการตรวจสอบ
                  </span>
                } 
                key="3"
              >
                <ReviewHistory projectDetails={projectDetails} />
              </TabPane>
            </Tabs>
          </Card>
        </div>
        
        {/* คอลัมน์ขวา: ข้อมูลผู้สร้าง */}
        <div className="space-y-6">
          <CreatorInfo projectDetails={projectDetails} />
          
          {/* ข้อมูลเฉพาะตามประเภทโปรเจค */}
          <CategoryDetails projectDetails={projectDetails} />
        </div>
      </div>
      
      {/* Modal ปฏิเสธโปรเจค */}
      <Modal
        title="ปฏิเสธโปรเจค"
        open={rejectModalVisible}
        onOk={handleRejectProject}
        onCancel={() => setRejectModalVisible(false)}
        okText="ยืนยันการปฏิเสธ"
        cancelText="ยกเลิก"
        okButtonProps={{ danger: true }}
      >
        <p className="text-red-500 mb-2">* กรุณาระบุเหตุผลที่ปฏิเสธโปรเจคนี้ เพื่อให้นักศึกษาได้ปรับปรุงแก้ไข</p>
        <Input.TextArea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="ระบุเหตุผลที่ปฏิเสธ เช่น ข้อมูลไม่ครบถ้วน, เนื้อหาไม่เหมาะสม..."
        />
      </Modal>

      {/* Modal อนุมัติโปรเจค (ต้องมีเหตุผล) */}
      <Modal
        title="อนุมัติโปรเจค"
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        footer={null}
      >
        <ProjectReviewForm
          initialValues={{ action: 'approve' }}
          onFinish={handleReviewFinish}
          onCancel={() => setReviewModalVisible(false)}
          loading={actionLoading}
        />
      </Modal>
      
      {/* Modal แก้ไขโปรเจค */}
      <Modal
        title="แก้ไขโปรเจค"
        open={editModalVisible}
        onOk={handleEditProject}
        onCancel={() => setEditModalVisible(false)}
        okText="บันทึกการเปลี่ยนแปลง"
        cancelText="ยกเลิก"
        width={700}
      >
        <div className="space-y-4 mt-4">
          <div>
            <label htmlFor="title" className="block mb-1 font-medium">ชื่อโปรเจค *</label>
            <Input
              id="title"
              value={editForm.title}
              onChange={(e) => handleEditFormChange('title', e.target.value)}
              placeholder="ชื่อโปรเจค"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="type" className="block mb-1 font-medium">ประเภทโปรเจค</label>
              <Select
                id="type"
                value={editForm.type}
                onChange={(value) => handleEditFormChange('type', value)}
                style={{ width: '100%' }}
              >
                <Select.Option value="coursework">ผลงานการเรียน</Select.Option>
                <Select.Option value="academic">บทความวิชาการ</Select.Option>
                <Select.Option value="competition">การแข่งขัน</Select.Option>
              </Select>
            </div>
            
            <div>
              <label htmlFor="study_year" className="block mb-1 font-medium">ชั้นปี</label>
              <Select
                id="study_year"
                value={editForm.study_year}
                onChange={(value) => handleEditFormChange('study_year', value)}
                style={{ width: '100%' }}
              >
                <Select.Option value="1">ปี 1</Select.Option>
                <Select.Option value="2">ปี 2</Select.Option>
                <Select.Option value="3">ปี 3</Select.Option>
                <Select.Option value="4">ปี 4</Select.Option>
              </Select>
            </div>
            
            <div>
              <label htmlFor="year" className="block mb-1 font-medium">ปีการศึกษา</label>
              <Input
                id="year"
                value={editForm.year}
                onChange={(e) => handleEditFormChange('year', e.target.value)}
                placeholder="ปีการศึกษา เช่น 2566"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="semester" className="block mb-1 font-medium">ภาคการศึกษา</label>
              <Select
                id="semester"
                value={editForm.semester}
                onChange={(value) => handleEditFormChange('semester', value)}
                style={{ width: '100%' }}
              >
                <Select.Option value="1">ภาคต้น</Select.Option>
                <Select.Option value="2">ภาคปลาย</Select.Option>
                <Select.Option value="3">ภาคฤดูร้อน</Select.Option>
              </Select>
            </div>
            
            <div>
              <label htmlFor="visibility" className="block mb-1 font-medium">การแสดงผล</label>
              <Select
                id="visibility"
                value={editForm.visibility}
                onChange={(value) => handleEditFormChange('visibility', value)}
                style={{ width: '100%' }}
              >
                <Select.Option value={1}>เปิดเผย</Select.Option>
                <Select.Option value={0}>ไม่เปิดเผย</Select.Option>
              </Select>
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block mb-1 font-medium">รายละเอียด</label>
            <Input.TextArea
              id="description"
              value={editForm.description}
              onChange={(e) => handleEditFormChange('description', e.target.value)}
              rows={4}
              placeholder="รายละเอียดของโปรเจค..."
            />
          </div>
          
          <div>
            <small className="text-gray-500">* หมายถึงจำเป็นต้องกรอก</small>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetailPage;