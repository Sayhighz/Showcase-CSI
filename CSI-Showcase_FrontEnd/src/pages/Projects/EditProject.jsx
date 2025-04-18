import React, { useState, useEffect } from 'react';
import { Steps, Button, message, Card, Row, Col, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { PROJECT } from '../../constants/routes';
import useAuth from '../../hooks/useAuth';
import useProject from '../../hooks/useProject';
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

const EditProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const { project, isLoading, error: projectError, fetchProjectDetails, updateProject } = useProject();
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
  const [existingFiles, setExistingFiles] = useState({});
  
  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Fetch project data when component mounts
  useEffect(() => {
    const loadProject = async () => {
      try {
        if (projectId && isAuthenticated && !isLoading) {
          console.log("Fetching project details for ID:", projectId);
          await fetchProjectDetails(projectId);
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError(err.message || "ไม่สามารถดึงข้อมูลโครงงานได้");
      } finally {
        setInitialLoadDone(true);
      }
    };

    loadProject();
  }, [projectId, isAuthenticated, fetchProjectDetails]);

  // Populate form with project data when it loads
  useEffect(() => {
    if (project && Object.keys(project).length > 0) {
      console.log("Project loaded:", project.title);
      
      // Set project type
      setProjectType(project.type || '');
      
      // Set basic info
      setBasicInfo({
        title: project.title || '',
        description: project.description || '',
        study_year: project.study_year || '',
        year: project.year?.toString() || new Date().getFullYear().toString(),
        semester: project.semester?.toString() || '1',
        visibility: project.visibility || 1,
        tags: Array.isArray(project.tags) ? project.tags.join(', ') : (project.tags || '')
      });
      
      // Set additional info based on project type
      const additionalData = {};
      
      // Extract additional fields based on project type
      if (project.type === 'coursework') {
        additionalData.course_code = project.course_code || '';
        additionalData.course_name = project.course_name || '';
        additionalData.instructor = project.instructor || '';
        additionalData.team_members = project.team_members || '';
      } else if (project.type === 'academic') {
        additionalData.abstract = project.abstract || '';
        additionalData.authors = project.authors || '';
        additionalData.publication = project.publication || '';
        additionalData.doi = project.doi || '';
      } else if (project.type === 'competition') {
        additionalData.competition_name = project.competition_name || '';
        additionalData.competition_level = project.competition_level || '';
        additionalData.achievement = project.achievement || '';
        additionalData.team_members = project.team_members || '';
      }
      
      setAdditionalInfo(additionalData);
      
      // Set existing files
      if (project.files) {
        const fileObj = {};
        if (project.cover_image) {
          fileObj.coverImage = project.cover_image;
        }
        if (project.files.images && project.files.images.length > 0) {
          fileObj.images = project.files.images;
        }
        if (project.files.documents && project.files.documents.length > 0) {
          fileObj.documents = project.files.documents;
        }
        if (project.files.video) {
          fileObj.video = project.files.video;
        }
        setExistingFiles(fileObj);
      }
    }
  }, [project]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      message.error('โปรดเข้าสู่ระบบก่อนแก้ไขโครงงาน');
      navigate('/login', { state: { from: `/edit/project/${projectId}` } });
    }
  }, [isAuthenticated, isAuthLoading, navigate, projectId]);

  // Reset uploaded files when component unmounts
  useEffect(() => {
    return () => {
      resetUpload();
    };
  }, [resetUpload]);

  // Check if user is authorized to edit this project
  useEffect(() => {
    // ทำการตรวจสอบเมื่อมีทั้ง project และ user ข้อมูลแล้วเท่านั้น
    if (project && user && initialLoadDone) {
      console.log("Checking authorization for user:", user.id);
      console.log("Project author:", project.author?.id);
      
      // ตรวจสอบว่าเป็นเจ้าของโครงงานหรือแอดมิน
      const isOwner = project.author?.id === user.id || project.user_id === user.id;
      const isAdmin = user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        showError('คุณไม่มีสิทธิ์ในการแก้ไขโครงงานนี้');
        navigate(PROJECT.VIEW(projectId));
      }
    }
  }, [project, user, projectId, navigate, showError, initialLoadDone]);

  // Step items for the stepper
  const steps = [
    {
      title: 'ประเภทโครงงาน',
      description: 'เลือกประเภทโครงงาน',
      content: (
        <ProjectTypeStep 
          projectType={projectType} 
          setProjectType={setProjectType} 
          isEditing={true}
        />
      ),
    },
    {
      title: 'ข้อมูลพื้นฐาน',
      description: 'แก้ไขข้อมูลพื้นฐาน',
      content: (
        <BasicInfoStep 
          basicInfo={basicInfo} 
          setBasicInfo={setBasicInfo} 
          projectType={projectType}
          isEditing={true}
        />
      ),
    },
    {
      title: 'ข้อมูลเพิ่มเติม',
      description: 'แก้ไขข้อมูลเฉพาะประเภท',
      content: (
        <AdditionalInfoStep 
          projectType={projectType} 
          additionalInfo={additionalInfo} 
          setAdditionalInfo={setAdditionalInfo}
          isEditing={true} 
        />
      ),
    },
    {
      title: 'จัดการไฟล์',
      description: 'จัดการไฟล์ที่เกี่ยวข้อง',
      content: (
        <UploadFilesStep 
          projectType={projectType} 
          files={files} 
          setFiles={setFiles}
          existingFiles={existingFiles}
          isEditing={true}
        />
      ),
    },
    {
      title: 'ตรวจสอบ',
      description: 'ตรวจสอบข้อมูลก่อนบันทึก',
      content: (
        <PreviewStep 
          projectType={projectType}
          basicInfo={basicInfo}
          additionalInfo={additionalInfo}
          files={files}
          existingFiles={existingFiles}
          isEditing={true}
          originalProject={project}
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
      if (projectType === 'coursework') {
        return (
          additionalInfo.course_code && 
          additionalInfo.course_name
        );
      } else if (projectType === 'academic') {
        return (
          additionalInfo.abstract && 
          additionalInfo.authors
        );
      } else if (projectType === 'competition') {
        return (
          additionalInfo.competition_name && 
          additionalInfo.competition_level && 
          additionalInfo.achievement
        );
      }
    }
    if (currentStep === 3) {
      // Check if required files are present (either new uploads or existing files)
      return (files.coverImage || (existingFiles && existingFiles.coverImage));
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

  // Handle form submission for updating the project
  const handleSubmit = async () => {
    if (!user || !user.id) {
      showError('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
      return;
    }
    
    if (!projectId) {
      showError('ไม่พบรหัสโครงงาน');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
  
    try {
      // Prepare project data
      const projectData = {
        ...basicInfo,
        ...additionalInfo,
        type: projectType,
        // Add information about files that should be kept
        retained_files: existingFiles || {}
      };
      
      // Convert tags from string to array if needed
      if (typeof projectData.tags === 'string' && projectData.tags) {
        projectData.tags = projectData.tags.split(',').map(tag => tag.trim());
      }
      
      // Update the project
      console.log("Updating project with data:",projectId,projectData,files);
      const response = await updateProject(projectId, projectData, files);
      
      if (response) {
        showSuccess('อัปเดตโครงงานสำเร็จ');
        
        // Navigate to project detail page
        navigate(PROJECT.VIEW(projectId));
      } else {
        throw new Error('ไม่สามารถอัปเดตโครงงานได้');
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอัปเดตโครงงาน');
      showError(err.message || 'เกิดข้อผิดพลาดในการอัปเดตโครงงาน');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking authentication or fetching project data
  if (isAuthLoading || isLoading) {
    return <LoadingSpinner tip="กำลังโหลดข้อมูล..." />;
  }

  // Show error if any
  if (error || projectError) {
    return (
      <ErrorMessage 
        title="เกิดข้อผิดพลาด" 
        message={error || projectError}
        onReloadClick={() => window.location.reload()}
        showBackButton={true}
        onBackClick={() => navigate(-1)}
      />
    );
  }

  // Show loading if project data is not yet loaded
  if (!project || Object.keys(project).length === 0) {
    return <LoadingSpinner tip="กำลังโหลดข้อมูลโครงงาน..." />;
  }

  return (
    <div className="edit-project-container mx-auto px-4 py-6 max-w-6xl">
      <PageHeader 
        title={`แก้ไขโครงงาน: ${project.title}`}
        subtitle="แก้ไขรายละเอียดและไฟล์ที่เกี่ยวข้องกับโครงงานของคุณ"
        breadcrumb={[
          { label: 'หน้าหลัก', path: '/' },
          { label: 'โครงงานของฉัน', path: PROJECT.MY_PROJECTS },
          { label: project.title, path: PROJECT.VIEW(projectId) },
          { label: 'แก้ไขโครงงาน' }
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
              บันทึกการเปลี่ยนแปลง
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EditProject;