import React, { useState, useEffect } from 'react';
import { Card, Typography, Alert, Breadcrumb, Spin, Modal, Button } from 'antd';
import useAuth from '../../hooks/useAuth';
import useProject from '../../hooks/useProject';
import { useNavigate, useParams, Link } from 'react-router-dom';
import ProjectForm from '../../components/ManageProject/ProjectForm';
import { PROJECT } from '../../constants/routes';
import { ExclamationCircleOutlined, HomeOutlined, ProjectOutlined, DeleteOutlined } from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';

const { Title, Paragraph } = Typography;
const { confirm } = Modal;

/**
 * EditProject - หน้าสำหรับแก้ไขโปรเจคที่มีอยู่แล้ว
 * @returns {JSX.Element} - EditProject component
 */
const EditProject = () => {
  const { user } = useAuth();
  const { projectId } = useParams();
  const { project, fetchProjectDetails, updateProject, deleteProject, isLoading } = useProject(projectId);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [initialValues, setInitialValues] = useState(null);

  // ตรวจสอบขนาดหน้าจอ
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 });

  // ตรวจสอบว่ามีผู้ใช้งานหรือไม่
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // ดึงข้อมูลโปรเจคเมื่อหน้าถูกโหลด
  useEffect(() => {
    if (projectId) {
      fetchProjectDetails(projectId);
    }
  }, [projectId, fetchProjectDetails]);

  // เตรียมข้อมูลสำหรับฟอร์ม
  useEffect(() => {
    if (project) {
      // ตรวจสอบสิทธิ์ในการแก้ไข
      const isAuthor = project.author?.id === user?.id;
      if (!isAuthor) {
        navigate(PROJECT.VIEW(projectId));
        return;
      }
      
      // แปลงข้อมูลโปรเจคให้อยู่ในรูปแบบที่ฟอร์มต้องการ
      const formValues = {
        title: project.title,
        description: project.description,
        type: project.type,
        study_year: project.studyYear,
        year: project.year,
        semester: project.semester,
        visibility: project.visibility,
      };
      
      // เพิ่มข้อมูลตามประเภทโปรเจค
      if (project.type === 'academic' && project.academic) {
        formValues.published_year = project.academic.published_year;
        formValues.publication_date = project.academic.publication_date;
      } else if (project.type === 'competition' && project.competition) {
        formValues.competition_name = project.competition.name;
        formValues.competition_year = project.competition.year;
      } else if (project.type === 'coursework' && project.coursework) {
        formValues.clip_video = project.coursework.clip_video;
      }
      
      // จัดการไฟล์ที่มีอยู่
      let existingFiles = {};
      if (project.files && project.files.length > 0) {
        existingFiles = project.files.reduce((acc, file) => {
          // สร้างออบเจ็กต์ที่ตรงกับรูปแบบที่ Upload component ต้องการ
          const fileObj = {
            uid: file.id || `-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            status: 'done',
            url: file.path,
            size: file.size,
            type: file.type,
          };
          
          // จัดไฟล์ตามประเภท
          if (file.type === 'pdf' && project.type === 'academic') {
            acc.paperFile = [fileObj];
          } else if (file.type === 'image') {
            if (project.type === 'coursework') {
              if (!acc.courseworkPoster || acc.courseworkPoster.length === 0) {
                acc.courseworkPoster = [fileObj];
              } else {
                acc.courseworkImage = [...(acc.courseworkImage || []), fileObj];
              }
            } else if (project.type === 'competition') {
              acc.competitionPoster = [fileObj];
            }
          } else if (file.type === 'video' && project.type === 'coursework') {
            acc.courseworkVideo = [fileObj];
          }
          return acc;
        }, {});
      }
      
      setInitialValues({
        ...formValues,
        ...existingFiles
      });
    }
  }, [project, user, projectId, navigate]);

  // จัดการการส่งฟอร์ม
  const handleSubmit = async (formData) => {
    try {
      setError(null);
      
      if (!projectId) {
        throw new Error('ไม่พบข้อมูล ID ของโปรเจค');
      }
      
      // ตรวจสอบและจัดการข้อมูลไฟล์
      const { data, files } = formData;
      
      // ตรวจสอบความถูกต้องของข้อมูล
      if (!data || !data.title) {
        throw new Error('กรุณากรอกชื่อโปรเจค');
      }
      
      // แสดงข้อมูลที่จะส่ง
      console.log('Project data to update:', data);
      console.log('Files to update:', files);
      
      // เรียกใช้ API อัปเดตโปรเจค
      const response = await updateProject(projectId, data, files);
      
      if (response) {
        // นำทางไปยังหน้ารายละเอียดโปรเจค
        navigate(PROJECT.VIEW(projectId));
      }
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการแก้ไขโปรเจค:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการแก้ไขโปรเจค');
    }
  };

  // แสดงกล่องยืนยันการลบโปรเจค
  const showDeleteConfirm = () => {
    confirm({
      title: 'คุณต้องการลบโปรเจคนี้หรือไม่?',
      icon: <ExclamationCircleOutlined />,
      content: 'การลบจะไม่สามารถกู้คืนได้ โปรเจคและไฟล์ทั้งหมดที่เกี่ยวข้องจะถูกลบถาวร',
      okText: 'ใช่ ลบโปรเจค',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      okButtonProps: { size: isMobile ? 'small' : 'middle' },
      cancelButtonProps: { size: isMobile ? 'small' : 'middle' },
      onOk() {
        handleDeleteProject();
      },
      className: isMobile ? 'delete-confirm-modal-mobile' : '',
      width: isMobile ? 300 : 416,
    });
  };

  // จัดการการลบโปรเจค
  const handleDeleteProject = async () => {
    try {
      if (!projectId) {
        throw new Error('ไม่พบข้อมูล ID ของโปรเจค');
      }
      
      await deleteProject(projectId);
      // การนำทางจะถูกจัดการใน deleteProject function
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการลบโปรเจค:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการลบโปรเจค');
    }
  };

  if (isLoading || !project) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin tip={<span className={isMobile ? "text-sm" : ""}>กำลังโหลดข้อมูลโปรเจค...</span>} size={isMobile ? "small" : "large"} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <Breadcrumb className="mb-2 sm:mb-4 text-xs sm:text-sm overflow-x-auto whitespace-nowrap">
        <Breadcrumb.Item>
          <Link to="/">
            <HomeOutlined className="mr-1" /> <span className={isMobile ? "hidden sm:inline" : ""}>หน้าหลัก</span>
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to={PROJECT.MY_PROJECTS}>
            <ProjectOutlined className="mr-1" /> <span className={isMobile ? "hidden sm:inline" : ""}>โปรเจคของฉัน</span>
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item className="truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">
          <Link to={PROJECT.VIEW(projectId)} className="truncate">
            {project.title.length > 30 && isMobile ? project.title.substring(0, 30) + '...' : project.title}
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>แก้ไขโปรเจค</Breadcrumb.Item>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-6 gap-2 sm:gap-0">
        <Title level={isMobile ? 3 : 2} className="mb-1 sm:mb-0">แก้ไขโปรเจค</Title>
        <div>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={showDeleteConfirm}
            size={isMobile ? "small" : "middle"}
            className="w-full sm:w-auto"
          >
            ลบโปรเจค
          </Button>
        </div>
      </div>

      <Paragraph className="mb-3 sm:mb-6 text-xs sm:text-sm">
        แก้ไขข้อมูลและไฟล์ของโปรเจค "{project.title}" การแก้ไขจะถูกบันทึกและอาจต้องได้รับการอนุมัติก่อนแสดงผลสู่สาธารณะ
      </Paragraph>

      {error && (
        <Alert
          message={<span className={isMobile ? "text-sm" : ""}>เกิดข้อผิดพลาด</span>}
          description={<span className={isMobile ? "text-xs" : "text-sm"}>{error}</span>}
          type="error"
          showIcon
          className="mb-3 sm:mb-6"
          closable
        />
      )}

      <Card className="mb-4 sm:mb-6" size={isMobile ? "small" : "default"} bodyStyle={{ padding: isMobile ? '12px' : '24px' }}>
        {initialValues && (
          <ProjectForm 
            isEdit={true}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        )}
      </Card>

      {/* Custom styles for modals */}
      <style jsx global>{`
        @media (max-width: 767px) {
          .delete-confirm-modal-mobile .ant-modal-body {
            padding: 12px;
            font-size: 14px;
          }
          .delete-confirm-modal-mobile .ant-modal-confirm-title {
            font-size: 16px;
          }
          .delete-confirm-modal-mobile .ant-modal-confirm-content {
            font-size: 12px;
            margin-top: 8px;
          }
          .delete-confirm-modal-mobile .ant-modal-confirm-btns {
            margin-top: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default EditProject;