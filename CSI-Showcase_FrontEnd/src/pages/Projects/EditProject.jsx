import React, { useState, useEffect } from 'react';
import { Card, Typography, Alert, Breadcrumb, Spin, Modal } from 'antd';
import useAuth from '../../hooks/useAuth';
import useProject from '../../hooks/useProject';
import { useNavigate, useParams, Link } from 'react-router-dom';
import ProjectForm from '../../components/ManageProject/ProjectForm';
import { PROJECT } from '../../constants/routes';
import { ExclamationCircleOutlined, HomeOutlined, ProjectOutlined } from '@ant-design/icons';

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
      onOk() {
        handleDeleteProject();
      },
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
        <Spin tip="กำลังโหลดข้อมูลโปรเจค..." size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item>
          <Link to="/">
            <HomeOutlined /> หน้าหลัก
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to={PROJECT.MY_PROJECTS}>
            <ProjectOutlined /> โปรเจคของฉัน
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to={PROJECT.VIEW(projectId)}>
            {project.title}
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>แก้ไขโปรเจค</Breadcrumb.Item>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-6">
        <Title level={2}>แก้ไขโปรเจค</Title>
        <div>
          <button
            onClick={showDeleteConfirm}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
          >
            ลบโปรเจค
          </button>
        </div>
      </div>

      <Paragraph className="mb-6">
        แก้ไขข้อมูลและไฟล์ของโปรเจค "{project.title}" การแก้ไขจะถูกบันทึกและอาจต้องได้รับการอนุมัติก่อนแสดงผลสู่สาธารณะ
      </Paragraph>

      {error && (
        <Alert
          message="เกิดข้อผิดพลาด"
          description={error}
          type="error"
          showIcon
          className="mb-6"
          closable
        />
      )}

      <Card className="mb-6">
        {initialValues && (
          <ProjectForm 
            isEdit={true}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        )}
      </Card>
    </div>
  );
};

export default EditProject;