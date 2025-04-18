import React, { useState, useEffect } from 'react';
import { Steps, Button, message, Card, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import PROJECT_TYPES from '../../constants/projectTypes';
import useAuth from '../../hooks/useAuth';
import useUpload from '../../hooks/useUpload';
import useNotification from '../../hooks/useNotification';

import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

// Import step components
import ProjectTypeStep from '../../components/upload/ProjectTypeStep';
import BasicInfoStep from '../../components/upload/BasicInfoStep';
import AdditionalInfoStep from '../../components/upload/AdditionalInfoStep';
import UploadFilesStep from '../../components/upload/UploadFilesStep';
import PreviewStep from '../../components/upload/PreviewStep';

// Import services
import { uploadProject } from '../../services/projectService';

const UploadProject = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const { uploadedFiles, isUploading, resetUpload } = useUpload();
  const { showSuccess, showError } = useNotification();

  // Current step state
  const [currentStep, setCurrentStep] = useState(0);
  
  // Project data states
  const [projectType, setProjectType] = useState('');
  const [basicInfo, setBasicInfo] = useState({
    title: '',
    description: '',
    study_year: '',
    year: new Date().getFullYear().toString(),
    semester: '1',
    visibility: 1,
    tags: ''
  });
  
  // Additional info based on project type
  const [additionalInfo, setAdditionalInfo] = useState({});
  
  // Files to upload
  const [files, setFiles] = useState({});
  
  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      message.error('โปรดเข้าสู่ระบบก่อนอัปโหลดโครงงาน');
      navigate('/login', { state: { from: '/upload' } });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  // Reset uploaded files when component unmounts
  useEffect(() => {
    return () => {
      resetUpload();
    };
  }, [resetUpload]);

  // Step items definition
  const steps = [
    {
      title: 'เลือกประเภท',
      description: 'เลือกประเภทโครงงาน',
      content: (
        <ProjectTypeStep 
          projectType={projectType} 
          setProjectType={setProjectType} 
        />
      ),
    },
    {
      title: 'ข้อมูลพื้นฐาน',
      description: 'กรอกข้อมูลพื้นฐาน',
      content: (
        <BasicInfoStep 
          basicInfo={basicInfo} 
          setBasicInfo={setBasicInfo} 
          projectType={projectType}
        />
      ),
    },
    {
      title: 'ข้อมูลเฉพาะ',
      description: 'กรอกข้อมูลเฉพาะประเภท',
      content: (
        <AdditionalInfoStep 
          projectType={projectType} 
          additionalInfo={additionalInfo} 
          setAdditionalInfo={setAdditionalInfo} 
        />
      ),
    },
    {
      title: 'อัปโหลดไฟล์',
      description: 'อัปโหลดไฟล์ที่เกี่ยวข้อง',
      content: (
        <UploadFilesStep 
          projectType={projectType} 
          files={files} 
          setFiles={setFiles} 
        />
      ),
    },
    {
      title: 'ตรวจสอบ',
      description: 'ตรวจสอบข้อมูลก่อนส่ง',
      content: (
        <PreviewStep 
          projectType={projectType}
          basicInfo={basicInfo}
          additionalInfo={additionalInfo}
          files={files}
        />
      ),
    },
  ];

  // Check if current step is valid to proceed
  const isStepValid = () => {
    if (currentStep === 0) {
      return !!projectType;
    }
    if (currentStep === 1) {
      return (
        basicInfo.title.trim() !== '' && 
        basicInfo.description.trim() !== '' && 
        basicInfo.study_year && 
        basicInfo.year && 
        basicInfo.semester
      );
    }
    if (currentStep === 2) {
      // Validate based on project type
      if (projectType === PROJECT_TYPES.COURSEWORK) {
        return (
          additionalInfo.course_code && 
          additionalInfo.course_name
        );
      } else if (projectType === PROJECT_TYPES.ACADEMIC) {
        return (
          additionalInfo.abstract && 
          additionalInfo.authors
        );
      } else if (projectType === PROJECT_TYPES.COMPETITION) {
        return (
          additionalInfo.competition_name && 
          additionalInfo.competition_level && 
          additionalInfo.achievement
        );
      }
    }
    if (currentStep === 3) {
      // Check if required files are uploaded
      return files.coverImage !== undefined;
    }
    return true;
  };

  // Navigation functions
  const next = () => {
    if (isStepValid()) {
      setCurrentStep(currentStep + 1);
    } else {
      message.warning('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!user || !user.id) {
      showError('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
      return;
    }
  
    setIsSubmitting(true);
    setError(null);
  
    try {
      // สร้างข้อมูลโครงงาน
      const projectData = {
        ...basicInfo,
        ...additionalInfo,
        type: projectType, // เพิ่ม type ให้ชัดเจน
      };
  
      // ส่งข้อมูลและไฟล์แยกกัน
      const response = await uploadProject(user.id, projectData, files);
  
      if (response && response.projectId) {
        showSuccess('อัปโหลดโครงงานสำเร็จ กรุณารอการอนุมัติจากผู้ดูแลระบบ');
        
        // Reset form states
        setProjectType('');
        setBasicInfo({
          title: '',
          description: '',
          study_year: '',
          year: new Date().getFullYear().toString(),
          semester: '1',
          visibility: 1,
          tags: ''
        });
        setAdditionalInfo({});
        setFiles({});
        resetUpload();
        
        // Navigate to project detail or my projects
        navigate(`/projects/${response.projectId}`);
      } else {
        throw new Error('ไม่สามารถอัปโหลดโครงงานได้');
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอัปโหลดโครงงาน');
      showError(err.message || 'เกิดข้อผิดพลาดในการอัปโหลดโครงงาน');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking authentication
  if (isAuthLoading) {
    return <LoadingSpinner tip="กำลังตรวจสอบข้อมูลผู้ใช้..." />;
  }

  // Show error if any
  if (error) {
    return (
      <ErrorMessage 
        title="เกิดข้อผิดพลาด" 
        message={error}
        onReloadClick={() => setError(null)}
      />
    );
  }

  return (
    <div className="upload-project-container mx-auto px-4 py-6 max-w-6xl">
      <PageHeader 
        title="อัปโหลดโครงงาน" 
        subtitle="แบ่งปันผลงานของคุณกับผู้อื่น"
        breadcrumb={[
          { label: 'หน้าหลัก', path: '/' },
          { label: 'อัปโหลดโครงงาน' }
        ]}
      />

      <Card className="mb-8 shadow-md">
        <Steps
          current={currentStep}
          items={steps.map(item => ({
            title: item.title,
            description: item.description,
          }))}
          className="mb-8"
        />

        <div className="steps-content p-4 bg-gray-50 rounded-md min-h-[300px]">
          {steps[currentStep].content}
        </div>

        <div className="steps-action mt-6 flex justify-between">
          {currentStep > 0 && (
            <Button onClick={() => prev()} disabled={isSubmitting}>
              ย้อนกลับ
            </Button>
          )}
          
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={() => next()} disabled={!isStepValid() || isSubmitting}>
              ถัดไป
            </Button>
          )}
          
          {currentStep === steps.length - 1 && (
            <Button 
              type="primary" 
              onClick={handleSubmit} 
              loading={isSubmitting}
              disabled={!isStepValid()}
            >
              อัปโหลดโครงงาน
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default UploadProject;