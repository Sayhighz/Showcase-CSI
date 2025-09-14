import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Card, Tabs, Modal, Input, message,
  Empty, Button, Select, Upload, Switch, Image, Popconfirm, DatePicker
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
import { URL } from '../../constants/apiEndpoints';
import { deleteProjectImages as apiDeleteProjectImages } from '../../services/projectService';
import ContributorsStep from '../../components/projects/steps/ContributorsStep';
import { FileOutlined, TeamOutlined, HistoryOutlined, ArrowLeftOutlined, PlusOutlined, FilePdfOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { TabPane } = Tabs;

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { admin, user } = useAuth();
  const currentUser = admin || user;
  const role = currentUser?.role;
  const fallbackPath = role === 'student' ? '/projects/my-projects' : '/projects';
  
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
  const [posterFileList, setPosterFileList] = useState([]);
  const [clipVideoLink, setClipVideoLink] = useState('');
  const [courseworkImageList, setCourseworkImageList] = useState([]);
  const [replaceImages, setReplaceImages] = useState(false);
  const [competitionImageList, setCompetitionImageList] = useState([]);
  const [replaceCompImages, setReplaceCompImages] = useState(false);
  const [deletingExisting, setDeletingExisting] = useState(false);
  const [contributorsEdit, setContributorsEdit] = useState([]);
  const [paperFileList, setPaperFileList] = useState([]);
  // Preview state for picture-card Upload
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      try {
        file.preview = await getBase64(file.originFileObj || file);
      } catch {
        // ignore preview error
      }
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };
  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );
  console.log(competitionImageList)

  // แปลงไฟล์รูปภาพประกอบเดิมเพื่อแสดงในโมดัล
  const galleryImages = useMemo(
    () => (projectDetails?.files || []).filter(f => f.file_type === 'image'),
    [projectDetails]
  );

  // เลือกรูปหลักของ coursework รองรับรูปแบบ array/JSON-string/เดี่ยว
  const primaryCwImage = useMemo(() => {
    const cw = projectDetails?.coursework;
    if (!cw) return null;
    const raw = cw.image;
    if (Array.isArray(raw)) {
      return raw[0] || null;
    }
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (!trimmed) return null;
      if (trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          return Array.isArray(parsed) ? (parsed[0] || null) : trimmed;
        } catch {
          return trimmed;
        }
      }
      return trimmed;
    }
    if (Array.isArray(cw.images) && cw.images.length > 0) {
      return cw.images[0] || null;
    }
    return null;
  }, [projectDetails]);

  // Modal อนุมัติ (ต้องใส่เหตุผล)
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewAction, setReviewAction] = useState('approve');

  // เมื่อโหลดข้อมูลโปรเจคสำเร็จ ให้กำหนดค่าเริ่มต้นสำหรับฟอร์มแก้ไข
  useEffect(() => {
    if (projectDetails) {
      const pubDate = projectDetails?.academic?.publication_date
        ? dayjs(projectDetails.academic.publication_date).format('YYYY-MM-DD')
        : '';
      setEditForm({
        title: projectDetails.title || '',
        description: projectDetails.description || '',
        type: projectDetails.type || '',
        study_year: projectDetails.study_year || '',
        year: projectDetails.year || '',
        semester: projectDetails.semester || '',
        visibility: projectDetails.visibility !== undefined ? projectDetails.visibility : 1,
        published_year: projectDetails?.academic?.published_year || projectDetails.year || '',
        publication_date: pubDate,
        competition_name: projectDetails?.competition?.competition_name || '',
        competition_year: projectDetails?.competition?.competition_year || projectDetails.year || ''
      });
      // Prefill clip video (coursework)
      setClipVideoLink(projectDetails?.coursework?.clip_video || '');

      // Prefill contributors for editing
      try {
        const rawContributors = Array.isArray(projectDetails?.contributors) ? projectDetails.contributors : [];
        const mapped = rawContributors.map(m => {
          if (m.memberType === 'registered') {
            return {
              memberType: 'registered',
              user_id: m.userId,
              username: m.username,
              full_name: m.fullName,
              role: m.role || 'contributor'
            };
          }
          return {
            memberType: 'external',
            name: m.memberName,
            student_id: m.memberStudentId || '',
            email: m.memberEmail || '',
            role: m.role || 'contributor'
          };
        });
        setContributorsEdit(mapped);
      } catch {
        setContributorsEdit([]);
      }
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
      setRejectModalVisible(false);
      refreshProjectDetails();
    }
  };

  // ยืนยันจากฟอร์มรีวิว
  const handleReviewFinish = async (values) => {
    if (reviewAction === 'approve') {
      const success = await approveProject(projectId, values.comment);
      if (success) {
        setReviewModalVisible(false);
        refreshProjectDetails();
      }
    }
  };

  // ลบโปรเจค
  const handleDeleteProject = async () => {
    const success = await deleteProject(projectId);
    if (success) {
      navigate(fallbackPath);
    }
  };

  // แสดง modal แก้ไขโปรเจค
  const showEditModal = () => {
    // Reset transient states each time modal opens
    setPosterFileList([]);
    setCourseworkImageList([]);
    setCompetitionImageList([]);
    setPaperFileList([]);
    setReplaceImages(false);
    setReplaceCompImages(false);
    setPreviewImage('');
    setPreviewOpen(false);
    // Prefill form from latest project details
    if (projectDetails) {
      const pubDate = projectDetails?.academic?.publication_date
        ? dayjs(projectDetails.academic.publication_date).format('YYYY-MM-DD')
        : '';
      setEditForm({
        title: projectDetails.title || '',
        description: projectDetails.description || '',
        type: projectDetails.type || '',
        study_year: projectDetails.study_year || '',
        year: projectDetails.year || '',
        semester: projectDetails.semester || '',
        visibility: projectDetails.visibility !== undefined ? projectDetails.visibility : 1,
        published_year: projectDetails?.academic?.published_year || projectDetails.year || '',
        publication_date: pubDate,
        competition_name: projectDetails?.competition?.competition_name || '',
        competition_year: projectDetails?.competition?.competition_year || projectDetails.year || ''
      });
      setClipVideoLink(projectDetails?.coursework?.clip_video || '');
    }
    setEditModalVisible(true);
  };

  // ลบสื่อ/รูปเดิมแบบเฉพาะรายการในโมดัล
  const handleDeleteExistingMedia = async (payload) => {
    try {
      setDeletingExisting(true);
      const resp = await apiDeleteProjectImages(projectId, payload);
      if (resp.success) {
        message.success(resp.message || 'ลบรูปภาพสำเร็จ');
        await refreshProjectDetails();
      } else {
        message.error(resp.message || 'เกิดข้อผิดพลาดในการลบรูปภาพ');
      }
    } catch {
      message.error('เกิดข้อผิดพลาดในการลบรูปภาพ');
    } finally {
      setDeletingExisting(false);
    }
  };

  // แก้ไขโปรเจค
  const handleEditProject = async () => {
    if (!editForm.title.trim()) {
      message.error('กรุณาระบุชื่อโปรเจค');
      return;
    }

    // Prepare FormData to support file replacement and video URL update
    const formData = new FormData();
    Object.entries(editForm).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        formData.append(k, v);
      }
    });

    if (editForm.type === 'coursework' && clipVideoLink !== undefined) {
      formData.append('clip_video', clipVideoLink || '');
    }

    if (posterFileList.length > 0) {
      const fileItem = posterFileList[0];
      const fileObj = fileItem.originFileObj || fileItem;
      const posterKey =
        editForm.type === 'competition' ? 'competitionPoster' :
        editForm.type === 'coursework' ? 'courseworkPoster' : null;
      if (posterKey && fileObj) {
        formData.append(posterKey, fileObj);
      }
    }

    // เพิ่มรูปภาพประกอบ coursework หลายรูป
    if (editForm.type === 'coursework' && courseworkImageList.length > 0) {
      courseworkImageList.forEach((item) => {
        const fileObj = item.originFileObj || item;
        if (fileObj instanceof File) {
          // ส่ง key เดียวกันหลายครั้งเพื่อแนบหลายไฟล์
          formData.append('courseworkImage', fileObj);
        }
      });
      if (replaceImages) {
        formData.append('replace_existing_images', 'true');
      }
    }

    // เพิ่มรูปภาพประกอบ competition หลายรูป
    if (editForm.type === 'competition' && competitionImageList.length > 0) {
      competitionImageList.forEach((item) => {
        const fileObj = item.originFileObj || item;
        if (fileObj instanceof File) {
          // ส่ง key เดียวกันหลายครั้งเพื่อแนบหลายไฟล์
          formData.append('competitionImage', fileObj);
        }
      });
      if (replaceCompImages) {
        formData.append('replace_existing_images', 'true');
      }
    }

    // ส่งข้อมูลผู้ร่วมงาน (contributors) เป็น JSON string ตามสเปคของ backend
    if (Array.isArray(contributorsEdit)) {
      const payload = contributorsEdit.map(c => (
        c.memberType === 'registered'
          ? { user_id: c.user_id, role: c.role || 'contributor' }
          : { name: c.name, student_id: c.student_id || null, email: c.email || null, role: c.role || 'contributor' }
      ));
      formData.append('contributors', JSON.stringify(payload));
    }

    // แนบไฟล์สำหรับประเภทบทความวิชาการ (academic)
    if (editForm.type === 'academic') {
      if (paperFileList && paperFileList.length > 0) {
        const fileItem = paperFileList[0];
        const fileObj = fileItem.originFileObj || fileItem;
        if (fileObj) {
          formData.append('paperFile', fileObj);
        }
      }
    }

    const success = await updateProject(projectId, formData);
    if (success) {
      await refreshProjectDetails();
      // Reset transient upload states; editForm will be refreshed by useEffect when projectDetails updates
      setPosterFileList([]);
      setCourseworkImageList([]);
      setCompetitionImageList([]);
      setPaperFileList([]);
      setReplaceImages(false);
      setReplaceCompImages(false);
      setPreviewImage('');
      setPreviewOpen(false);
      // Close modal so next open reflects current data cleanly
      setEditModalVisible(false);
    }
  };

  // จัดการการเปลี่ยนแปลงข้อมูลในฟอร์มแก้ไข
  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // กลับไปหน้ารายการโปรเจค (ย้อนกลับถ้าได้, ไม่งั้นไปตามสิทธิ์)
  const goBack = () => {
    const state = window.history.state;
    if (state && state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
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
        canDelete={role === 'admin' ? true : (projectDetails?.status !== 'approved')}
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
                <ProjectFiles projectDetails={projectDetails} onRefresh={refreshProjectDetails} />
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
        okButtonProps={{ danger: true, loading: actionLoading }}
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
        confirmLoading={actionLoading}
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
                disabled
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
          
          {/* รูปภาพ/สื่อเดิม: แสดงสื่อตัวอย่างเดิมและปุ่มลบได้ทันที */}
          {editForm.type === 'coursework' && (
            <div className="space-y-3">
              <label className="block mb-1 font-medium">รูปภาพ/สื่อเดิม</label>

              <div className="flex flex-wrap gap-4">
                {/* โปสเตอร์เดิม */}
                {projectDetails?.coursework?.poster && (
                  <div className="flex flex-col items-start">
                    <Image
                      src={`${URL}/${projectDetails.coursework.poster}`}
                      alt="โปสเตอร์เดิม"
                      width={150}
                      height={150}
                      className="object-cover rounded-lg"
                    />
                    <small className="text-gray-500 mt-2">ไม่อนุญาตให้ลบโปสเตอร์ • อัปโหลดใหม่เพื่อแทนที่</small>
                  </div>
                )}

                {/* รูปหลักเดิม (courseworks.image) */}
                {primaryCwImage && (
                  <div className="flex flex-col items-start">
                    <Image
                      src={`${URL}/${primaryCwImage}`}
                      alt="รูปหลักเดิม"
                      width={150}
                      height={150}
                      className="object-cover rounded-lg"
                    />
                    <Popconfirm
                      title="ลบรูปหลักเดิม?"
                      okText="ลบ"
                      cancelText="ยกเลิก"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => handleDeleteExistingMedia({ remove_primary_image: true })}
                    >
                      <Button
                        type="primary"
                        danger
                        size="small"
                        loading={deletingExisting}
                        className="mt-2"
                      >
                        ลบรูปหลักเดิม
                      </Button>
                    </Popconfirm>
                  </div>
                )}
              </div>

            </div>
          )}

          {editForm.type === 'competition' && projectDetails?.competition?.poster && (
            <div className="space-y-3">
              <label className="block mb-1 font-medium">โปสเตอร์เดิม</label>
              <div className="flex flex-col items-start">
                <Image
                  src={`${URL}/${projectDetails.competition.poster}`}
                  alt="โปสเตอร์เดิม"
                  width={150}
                  height={150}
                  className="object-cover rounded-lg"
                />
                <small className="text-gray-500 mt-2">ไม่อนุญาตให้ลบโปสเตอร์ • อัปโหลดใหม่เพื่อแทนที่</small>
              </div>
            </div>
          )}

          {/* รูปภาพประกอบจาก project_files (ใช้ได้ทั้ง coursework และ competition) */}
          {(editForm.type === 'coursework' || editForm.type === 'competition') && galleryImages && galleryImages.length > 0 && (
            <div className="mt-4">
              <div className="text-sm text-gray-600 mb-2">รูปภาพประกอบเดิม</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {galleryImages.map((img) => (
                  <div key={img.file_id || img.file_path} className="flex flex-col items-start">
                    <Image
                      src={`${URL}/${img.file_path}`}
                      alt={img.file_name}
                      width={150}
                      height={150}
                      className="object-cover rounded-lg"
                    />
                    {(img.file_path === projectDetails?.coursework?.poster || img.file_path === projectDetails?.competition?.poster) ? (
                      <small className="text-gray-500 mt-2">โปสเตอร์ • ไม่อนุญาตให้ลบ</small>
                    ) : (
                      <Popconfirm
                        title="ลบรูปนี้?"
                        okText="ลบ"
                        cancelText="ยกเลิก"
                        okButtonProps={{ danger: true }}
                        onConfirm={() =>
                          handleDeleteExistingMedia(
                            img.file_id ? { file_ids: [img.file_id] } : { file_paths: [img.file_path] }
                          )
                        }
                      >
                        <Button
                          type="primary"
                          danger
                          size="small"
                          loading={deletingExisting}
                          className="mt-2"
                        >
                          ลบ
                        </Button>
                      </Popconfirm>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ข้อมูลการแข่งขันเพิ่มเติม */}
          {editForm.type === 'competition' && (
            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">ชื่อการแข่งขัน</label>
                  <Input
                    placeholder="ระบุชื่อการแข่งขัน"
                    value={editForm.competition_name}
                    onChange={(e) => handleEditFormChange('competition_name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">ปีที่จัดการแข่งขัน</label>
                  <Select
                    placeholder="เลือกปีที่จัดการแข่งขัน"
                    value={editForm.competition_year}
                    onChange={(value) => handleEditFormChange('competition_year', value)}
                    options={Array.from({ length: 31 }, (_, i) => {
                      const thaiYear = new Date().getFullYear() + 543;
                      const y = thaiYear - i;
                      return { value: y, label: String(y) };
                    })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <label className="block mb-1 font-medium mt-2">รูปภาพประกอบ (อัปโหลดเพิ่ม)</label>
              <Upload
                name="competitionImage"
                accept=".jpg,.jpeg,.png,.gif,.webp"
                listType="picture-card"
                multiple
                beforeUpload={() => false}
                fileList={competitionImageList}
                onChange={(info) => setCompetitionImageList(info.fileList)}
                onPreview={handlePreview}
              >
                {competitionImageList && competitionImageList.length >= 10 ? null : uploadButton}
              </Upload>

              <div className="mt-2 flex items-center space-x-2">
                <Switch checked={replaceCompImages} onChange={setReplaceCompImages} />
                <span>แทนที่รูปภาพประกอบเดิมทั้งหมด</span>
              </div>
            </div>
          )}

          {/* Poster upload for coursework/competition */}
          {(editForm.type === 'coursework' || editForm.type === 'competition') && (
            <div>
              <label className="block mb-1 font-medium">
                {editForm.type === 'competition' ? 'โปสเตอร์การแข่งขัน (อัปโหลดใหม่เพื่อแทนที่)' : 'โปสเตอร์งานในชั้นเรียน (อัปโหลดใหม่เพื่อแทนที่)'}
              </label>
              <Upload
                name="poster"
                accept=".jpg,.jpeg,.png,.gif,.webp"
                listType="picture-card"
                maxCount={1}
                multiple={false}
                beforeUpload={() => false}
                fileList={posterFileList}
                onChange={(info) => setPosterFileList(info.fileList.slice(-1))}
                onPreview={handlePreview}
              >
                {posterFileList.length >= 1 ? null : uploadButton}
              </Upload>
            </div>
          )}

          {/* Video link for coursework */}
          {editForm.type === 'coursework' && (
            <>
              <div>
                <label htmlFor="clip_video" className="block mb-1 font-medium">ลิงก์วิดีโอ (YouTube/TikTok/Facebook)</label>
                <Input
                  id="clip_video"
                  value={clipVideoLink}
                  onChange={(e) => setClipVideoLink(e.target.value)}
                  placeholder="เช่น https://www.youtube.com/watch?v=XXXXXXXXXXX"
                />
                <small className="text-gray-500">เว้นว่างหากไม่ต้องการเปลี่ยน</small>
              </div>

              {/* เพิ่มรูปประกอบ coursework หลายรูป */}
              <div className="mt-4">
                <label className="block mb-1 font-medium">รูปภาพประกอบ (อัปโหลดเพิ่ม)</label>
                <Upload
                  name="courseworkImage"
                  accept=".jpg,.jpeg,.png,.gif,.webp"
                  listType="picture-card"
                  multiple
                  beforeUpload={() => false}
                  fileList={courseworkImageList}
                  onChange={(info) => setCourseworkImageList(info.fileList)}
                  onPreview={handlePreview}
                >
                  {courseworkImageList && courseworkImageList.length >= 10 ? null : uploadButton}
                </Upload>

                <div className="mt-2 flex items-center space-x-2">
                  <Switch checked={replaceImages} onChange={setReplaceImages} />
                  <span>แทนที่รูปภาพประกอบเดิมทั้งหมด</span>
                </div>
              </div>
            </>
          )}

          {editForm.type === 'academic' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">ปีที่ตีพิมพ์</label>
                  <Select
                    placeholder="เลือกปีที่ตีพิมพ์"
                    value={editForm.published_year}
                    onChange={(value) => handleEditFormChange('published_year', value)}
                    options={Array.from({ length: 31 }, (_, i) => {
                      const thaiYear = new Date().getFullYear() + 543;
                      const y = thaiYear - i;
                      return { value: y, label: String(y) };
                    })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">วันที่ตีพิมพ์</label>
                  <DatePicker
                    style={{ width: '100%' }}
                    format="YYYY-MM-DD"
                    value={editForm.publication_date ? dayjs(editForm.publication_date) : null}
                    onChange={(_, dateString) => handleEditFormChange('publication_date', dateString)}
                    allowClear
                  />
                </div>
              </div>

              <label className="block mb-1 font-medium mt-2">ไฟล์บทความวิชาการ (PDF)</label>
              <Upload
                name="paperFile"
                accept=".pdf,application/pdf"
                beforeUpload={() => false}
                maxCount={1}
                multiple={false}
                fileList={paperFileList}
                onChange={(info) => setPaperFileList(info.fileList.slice(-1))}
              >
                <Button type="primary" icon={<FilePdfOutlined />} className="mb-2">
                  เลือกไฟล์ PDF
                </Button>
                <div className="text-xs text-gray-500 mt-1">รองรับไฟล์ PDF สูงสุด 10MB</div>
              </Upload>

              {projectDetails?.academic?.paper_file && (
                <div className="mt-2">
                  <div className="text-sm text-gray-600 mb-1">ไฟล์ PDF ปัจจุบัน</div>
                  <div className="flex items-center gap-3">
                    <a
                      href={`${URL}/${projectDetails.academic.paper_file}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline break-all"
                    >
                      {projectDetails.academic.paper_file.split('/').pop()}
                    </a>
                    <small className="text-gray-500">ไม่อนุญาตให้ลบไฟล์ PDF • อัปโหลดไฟล์ใหม่เพื่อแทนที่ ระบบจะลบไฟล์เดิมอัตโนมัติ</small>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <label className="block mb-1 font-medium">ผู้ร่วมงาน</label>
            <ContributorsStep contributors={contributorsEdit} onChange={setContributorsEdit} />
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
          {previewImage && (
            <Image
              wrapperStyle={{ display: 'none' }}
              preview={{
                visible: previewOpen,
                onVisibleChange: (visible) => setPreviewOpen(visible),
                afterOpenChange: (visible) => !visible && setPreviewImage(''),
              }}
              src={previewImage}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetailPage;