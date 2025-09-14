import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import PageTitle from '../../components/common/PageTitle';
import ProjectForm from '../../components/projects/ProjectForm';
import { createProject } from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';
import { message } from 'antd';
import { clearCacheByUrl } from '../../lib/axiosCached';
import { BASE_URL } from '../../constants/apiEndpoints';

const UploadProjectPage = () => {
  const navigate = useNavigate();
  const { admin, user } = useAuth();
  const currentUser = admin || user;
  const [actionLoading, setActionLoading] = useState(false);
  
  // Check if current user is a student (only students can upload projects)
  const isStudent = currentUser?.role === 'student';
  
  // Redirect admins away from this page
  useEffect(() => {
    if (currentUser && !isStudent) {
      message.warning('เฉพาะนักศึกษาเท่านั้นที่สามารถอัปโหลดโปรเจคได้');
      navigate('/admin/projects');
    }
  }, [currentUser, isStudent, navigate]);
  
  const handleSubmit = async (formInput) => {
    try {
      setActionLoading(true);
      
      if (!currentUser?.id) {
        message.error('ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่');
        return;
      }

      if (!isStudent) {
        message.error('เฉพาะนักศึกษาเท่านั้นที่สามารถอัปโหลดโปรเจคได้');
        return;
      }

      console.log('Data to send:', formInput.data);
      console.log('Files to upload:', formInput.files);
      
      // สร้าง FormData สำหรับส่งไปยัง API
      const formData = new FormData();
      
      // เพิ่มข้อมูลโปรเจคลงใน FormData
      const { data, files } = formInput;
      
      // เพิ่มข้อมูลทั่วไป
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });
      
      // เพิ่มไฟล์ที่อัปโหลด (รองรับทั้งค่าเดี่ยวและอาร์เรย์)
      if (files) {
        Object.keys(files).forEach(fileKey => {
          const val = files[fileKey];
          if (!val) return;

          if (Array.isArray(val)) {
            val.forEach((f) => {
              if (f) formData.append(fileKey, f);
            });
          } else {
            formData.append(fileKey, val);
          }
        });
      }
      
      // เรียกใช้ createProject function
      const result = await createProject(currentUser.id, formData);
      
      if (result.success) {
        message.success('อัปโหลดโปรเจคสำเร็จ! รอการอนุมัติจากแอดมิน');
        // ล้างแคชรายการ "โปรเจคของฉัน" เพื่อให้แสดงรายการล่าสุดทันที
        clearCacheByUrl(`${BASE_URL}/projects/user/${currentUser.id}/my-projects`);
        // นำทางไปยังหน้าโปรเจคของฉัน
        navigate('/projects/my-projects');
      } else {
        message.error(result.message || 'เกิดข้อผิดพลาดในการอัปโหลดโปรเจค');
      }
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการอัปโหลดโปรเจค:', err);
      message.error(err.message || 'เกิดข้อผิดพลาดในการอัปโหลดโปรเจค');
    } finally {
      setActionLoading(false);
    }
  };

  // Show access denied for non-students
  if (currentUser && !isStudent) {
    return (
      <div>
        <PageTitle
          title="ไม่มีสิทธิ์เข้าถึง"
          subtitle="การอัปโหลดโปรเจค"
        />
        <Result
          status="403"
          title="ไม่มีสิทธิ์เข้าถึง"
          subTitle="เฉพาะนักศึกษาเท่านั้นที่สามารถอัปโหลดโปรเจคได้"
          extra={
            <Button type="primary" onClick={() => navigate('/admin/projects')}>
              กลับไปหน้าโปรเจค
            </Button>
          }
        />
      </div>
    );
  }
  
  return (
    <div>
      <PageTitle
        title="อัปโหลดโปรเจคใหม่"
        subtitle="เพิ่มโปรเจคใหม่เข้าสู่ระบบ"
      />
      
      <ProjectForm
        isEdit={false}
        onSubmit={handleSubmit}
        isLoading={actionLoading}
        initialValues={{ visibility: 1 }}
      />
    </div>
  );
};

export default UploadProjectPage;