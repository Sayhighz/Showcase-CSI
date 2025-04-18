import React, { useState, useEffect } from 'react';
import { Steps, message, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  RocketOutlined, 
  FileTextOutlined, 
  TeamOutlined, 
  SaveOutlined,
  EditOutlined
} from '@ant-design/icons';

// Custom hooks
import useAuth from '../../hooks/useAuth';
import useProject from '../../hooks/useProject';
import useUpload from '../../hooks/useUpload';

// Components
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import PageHeader from '../../components/common/PageHeader';

// Project Edit Components
// import ProjectCategorySelector from '../../components/editProject/ProjectCategorySelector';
import EditUploadSection from '../../components/editProject/EditUploadSection';
import EditProjectDetailsForm from '../../components/editProject/EditProjectDetailsForm';
import EditContributorSection from '../../components/editProject/EditContributorSection';
import EditPreviewSection from '../../components/editProject/EditPreviewSection';
import SaveConfirmationModal from '../../components/editProject/SaveConfirmationModal';

// Constants
import { PROJECT_TYPE } from '../../constants/projectTypes';
import { PROJECT, HOME } from '../../constants/routes';

const { Step } = Steps;

const EditProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    project, 
    fetchProjectDetails, 
    updateProject, 
    isLoading: isProjectLoading, 
    error: projectError 
  } = useProject(projectId);
  const { uploadImages, uploadDocuments, uploadVideo, isUploading } = useUpload();

  // States
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    category: '', // type in database: enum('coursework','academic','competition')
    study_year: '',
    year: new Date().getFullYear(),
    semester: '1', // enum('1','2','3')
    visibility: 1, // tinyint(1)
    status: 'pending', // enum('pending','approved','rejected')
    videoLink: '',
    pdfFiles: [],
    contributors: [],
    tags: '',
    
    // Existing files data
    existingFiles: {
      coverImage: null,
      posterImage: null,
      competitionPoster: null,
      courseworkPoster: null,
      courseworkVideo: null,
      courseworkImage: null,
      pdfFiles: []
    },
    
    // New files to upload
    coverImage: null,
    posterImage: null,
    
    // Academic paper fields
    publicationDate: null,
    publishedYear: new Date().getFullYear(),
    abstract: '',
    authors: '',
    publicationVenue: '',
    
    // Competition fields
    competitionName: '',
    competitionYear: new Date().getFullYear(),
    competitionLevel: 'university',
    achievement: '',
    teamMembers: '',
    competitionPoster: null,
    
    // Coursework fields
    courseCode: '',
    courseName: '',
    instructor: '',
    courseworkPoster: null,
    courseworkVideo: null,
    courseworkImage: null,
  });

  // For contributor search and selection
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedContributors, setSelectedContributors] = useState([]);
  
  // For preview generation
  const [previewUrls, setPreviewUrls] = useState({
    coverImage: null,
    posterImage: null,
    competitionPoster: null,
    courseworkPoster: null,
    courseworkImage: null,
    pdfFiles: [],
  });

  // Fetch project details when component mounts
  useEffect(() => {
    const loadProjectData = async () => {
      if (projectId) {
        await fetchProjectDetails(projectId);
        setInitialLoading(false);
      }
    };
    
    loadProjectData();
  }, [projectId, fetchProjectDetails]);

  // Update projectData state when project data is fetched
  useEffect(() => {
    if (project) {
      // Map project data to form fields
      const mappedData = {
        title: project.title || '',
        description: project.description || '',
        category: project.type || '',
        study_year: project.study_year || '',
        year: project.year || new Date().getFullYear(),
        semester: project.semester || '1',
        visibility: typeof project.visibility === 'number' ? project.visibility : 1,
        status: project.status || 'pending',
        videoLink: project.video_link || '',
        tags: project.tags?.join(', ') || '',
        
        // Existing files
        existingFiles: {
          coverImage: project.cover_image_url || null,
          posterImage: project.poster_image_url || null,
          competitionPoster: project.competition_poster_url || null,
          courseworkPoster: project.coursework_poster_url || null,
          courseworkVideo: project.coursework_video_url || null,
          courseworkImage: project.coursework_image_url || null,
          pdfFiles: project.pdf_files?.map(pdf => ({ 
            id: pdf.id, 
            name: pdf.name || pdf.filename || 'เอกสาร PDF',
            url: pdf.url 
          })) || []
        },
        
        // Academic paper fields
        publicationDate: project.publication_date ? new Date(project.publication_date) : null,
        publishedYear: project.published_year || new Date().getFullYear(),
        abstract: project.abstract || '',
        authors: project.authors || '',
        publicationVenue: project.publication_venue || '',
        
        // Competition fields
        competitionName: project.competition_name || '',
        competitionYear: project.competition_year || new Date().getFullYear(),
        competitionLevel: project.competition_level || 'university',
        achievement: project.achievement || '',
        teamMembers: project.team_members || '',
        
        // Coursework fields
        courseCode: project.course_code || '',
        courseName: project.course_name || '',
        instructor: project.instructor || '',
      };
      
      setProjectData(mappedData);
      
      // Set preview URLs
      setPreviewUrls({
        coverImage: project.cover_image_url || null,
        posterImage: project.poster_image_url || null,
        competitionPoster: project.competition_poster_url || null,
        courseworkPoster: project.coursework_poster_url || null,
        courseworkImage: project.coursework_image_url || null,
        pdfFiles: project.pdf_files?.map(pdf => ({ 
          url: pdf.url, 
          name: pdf.name || pdf.filename || 'เอกสาร PDF' 
        })) || [],
      });
      
      // Set contributors
      if (project.contributors && project.contributors.length > 0) {
        const formattedContributors = project.contributors.map(contributor => ({
          userId: contributor.user_id || contributor.userId,
          fullName: contributor.full_name || contributor.fullName,
          image: contributor.profile_image || contributor.image,
        }));
        
        setSelectedContributors(formattedContributors);
      }
    }
  }, [project]);

  // Update preview URLs when files change
  useEffect(() => {
    const objectUrls = [];
    
    // Function to create and track object URLs
    const createPreviewUrl = (file, key) => {
      if (file && typeof file === 'object' && !(file instanceof Date)) {
        const url = URL.createObjectURL(file);
        objectUrls.push(url);
        return url;
      }
      return null;
    };
    
    // Create preview URLs for each newly selected file,
    // fallback to existing URLs if no new file is selected
    const newPreviewUrls = {
      coverImage: projectData.coverImage ? createPreviewUrl(projectData.coverImage) : projectData.existingFiles.coverImage,
      posterImage: projectData.posterImage ? createPreviewUrl(projectData.posterImage) : projectData.existingFiles.posterImage,
      competitionPoster: projectData.competitionPoster ? createPreviewUrl(projectData.competitionPoster) : projectData.existingFiles.competitionPoster,
      courseworkPoster: projectData.courseworkPoster ? createPreviewUrl(projectData.courseworkPoster) : projectData.existingFiles.courseworkPoster,
      courseworkImage: projectData.courseworkImage ? createPreviewUrl(projectData.courseworkImage) : projectData.existingFiles.courseworkImage,
      pdfFiles: [
        // Existing PDF files
        ...(projectData.existingFiles.pdfFiles || []).map(pdf => ({
          url: pdf.url,
          name: pdf.name || "ไฟล์ PDF",
          id: pdf.id
        })),
        // Newly added PDF files
        ...(projectData.pdfFiles || []).map(pdfObj => {
          if (pdfObj.file instanceof Blob) {
            const url = URL.createObjectURL(pdfObj.file);
            objectUrls.push(url);
            return { url, name: pdfObj.name || "ไฟล์ PDF ใหม่" };
          }
          return pdfObj;
        })
      ],
    };
    
    setPreviewUrls(newPreviewUrls);
    
    // Cleanup function to revoke object URLs
    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [projectData]);

  // CONTRIBUTOR SECTION FUNCTIONS
  const handleSearchChange = async (value) => {
    setSearchKeyword(value);

    if (value.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      // Using the SearchContext or a service to search users would be better
      // This is a simplified implementation
      const response = await fetch(`/api/search/users?keyword=${value}`);
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching for users:', error);
      message.error('ไม่สามารถค้นหาผู้ใช้ได้');
    }
  };

  const handleSelectContributor = (user) => {
    // Check if already selected
    if (selectedContributors.some(contributor => contributor.userId === user.user_id)) {
      message.warning('ผู้ร่วมงานนี้ถูกเพิ่มแล้ว');
      return;
    }
    
    const newContributor = {
      userId: user.user_id,
      fullName: user.full_name,
      image: user.image,
    };
    
    setSelectedContributors(prev => [...prev, newContributor]);
    setSearchResults([]);
    setSearchKeyword('');
    
    // Update projectData with selected contributors
    setProjectData(prev => ({
      ...prev,
      contributors: [...(prev.contributors || []), newContributor]
    }));
  };

  const validateForm = () => {
    // Required fields validation
    if (!projectData.title) {
      message.error('กรุณาระบุชื่อผลงาน');
      return false;
    }
    
    if (!projectData.description) {
      message.error('กรุณาระบุรายละเอียดผลงาน');
      return false;
    }
    
    if (!projectData.existingFiles.coverImage && !projectData.coverImage) {
      message.error('กรุณาอัปโหลดภาพปก');
      return false;
    }
    
    // Category-specific validation
    if (projectData.category === PROJECT_TYPE.ACADEMIC) {
      if (!projectData.publishedYear) {
        message.error('กรุณาระบุปีที่เผยแพร่');
        return false;
      }
    } else if (projectData.category === PROJECT_TYPE.COMPETITION) {
      if (!projectData.competitionName) {
        message.error('กรุณาระบุชื่อการแข่งขัน');
        return false;
      }
    } else if (projectData.category === PROJECT_TYPE.COURSEWORK) {
      if (!projectData.courseName) {
        message.error('กรุณาระบุชื่อวิชา');
        return false;
      }
    }
    
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    
    // แสดง Modal ยืนยันการบันทึกการแก้ไข
    setIsModalVisible(true);
  };

  const handleRemoveContributor = (userId) => {
    setSelectedContributors(prev => prev.filter(contributor => contributor.userId !== userId));
    
    // Update projectData when removing contributors
    setProjectData(prev => ({
      ...prev,
      contributors: (prev.contributors || []).filter(contributor => contributor.userId !== userId)
    }));
  };

  const handleSearchSelect = (value) => {
    const selectedUser = searchResults.find(user => user.full_name === value);
    if (selectedUser) {
      handleSelectContributor(selectedUser);
    }
  };
  
  // FILE UPLOAD FUNCTIONS
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setProjectData(prev => ({ ...prev, [type]: file }));
      message.success(`${file.name} อัปโหลดสำเร็จ`);
    }
  };
  
  const handlePdfFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newPdfFile = {
        file,
        name: file.name,
      };
      
      setProjectData(prev => ({
        ...prev,
        pdfFiles: [...(prev.pdfFiles || []), newPdfFile],
      }));
      
      message.success(`${file.name} อัปโหลดสำเร็จ`);
    }
  };
  
  const handleRemovePdf = (index, isExisting = false) => {
    if (isExisting) {
      // Remove existing PDF file
      setProjectData(prev => ({
        ...prev,
        existingFiles: {
          ...prev.existingFiles,
          pdfFiles: prev.existingFiles.pdfFiles.filter((_, i) => i !== index),
        }
      }));
    } else {
      // Remove newly added PDF file
      setProjectData(prev => ({
        ...prev,
        pdfFiles: prev.pdfFiles.filter((_, i) => i !== index),
      }));
    }
  };
  
  // FORM INPUT FUNCTIONS
  const handleInputChange = (e, field) => {
    setProjectData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };
  
  const handleDateChange = (date, field) => {
    setProjectData(prev => ({
      ...prev,
      [field]: date,
    }));
  };
  
  const handleSelectChange = (value, field) => {
    setProjectData(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  // SUBMISSION FUNCTION
  const handleConfirmSave = async () => {
    setIsModalVisible(false);
    setIsSaving(true);

    try {
      // Prepare the form data for submission
      const formData = new FormData();
      
      // Add basic project data
      Object.entries(projectData).forEach(([key, value]) => {
        // Skip file fields and existingFiles that need special handling
        if (
          value !== null && 
          typeof value !== 'undefined' && 
          !['coverImage', 'posterImage', 'pdfFiles', 'competitionPoster', 'courseworkPoster', 
            'courseworkVideo', 'courseworkImage', 'contributors', 'existingFiles'].includes(key)
        ) {
          // Handle date objects
          if (value instanceof Date) {
            formData.append(key, value.toISOString());
          } else if (typeof value === 'object') {
            // For other objects, stringify them
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        }
      });
      
      // Add files - only include if a new file was selected
      if (projectData.coverImage) {
        formData.append('coverImage', projectData.coverImage);
      }
      
      if (projectData.posterImage) {
        formData.append('posterImage', projectData.posterImage);
      }
      
      // Add category-specific files
      if (projectData.category === PROJECT_TYPE.COMPETITION && projectData.competitionPoster) {
        formData.append('competitionPoster', projectData.competitionPoster);
      }
      
      if (projectData.category === PROJECT_TYPE.COURSEWORK) {
        if (projectData.courseworkPoster) {
          formData.append('courseworkPoster', projectData.courseworkPoster);
        }
        if (projectData.courseworkVideo) {
          formData.append('courseworkVideo', projectData.courseworkVideo);
        }
        if (projectData.courseworkImage) {
          formData.append('courseworkImage', projectData.courseworkImage);
        }
      }
      
      // Add PDF files
      if (projectData.pdfFiles && projectData.pdfFiles.length > 0) {
        projectData.pdfFiles.forEach((pdf, index) => {
          if (pdf.file) {
            formData.append(`pdfFiles`, pdf.file);
          }
        });
      }
      
      // Include IDs of existing PDF files to keep
      if (projectData.existingFiles.pdfFiles && projectData.existingFiles.pdfFiles.length > 0) {
        const pdfIdsToKeep = projectData.existingFiles.pdfFiles.map(pdf => pdf.id);
        formData.append('keepPdfIds', JSON.stringify(pdfIdsToKeep));
      }
      
      // Add contributors as JSON
      if (selectedContributors && selectedContributors.length > 0) {
        formData.append('contributors', JSON.stringify(selectedContributors));
      }
      
      // Use the updateProject hook function to submit the updates
      const result = await updateProject(projectId, projectData, formData);
      
      if (result) {
        message.success('บันทึกการแก้ไขโครงการสำเร็จ!');
        
        // Navigate to the project page after successful submission
        setTimeout(() => {
          navigate(PROJECT.VIEW(projectId));
        }, 2000);
      }
    } catch (error) {
      console.error('Update error:', error);
      message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSaving(false);
    }
  };

  // STEP NAVIGATION
  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Steps configuration
  const steps = [
    {
      title: 'รายละเอียด',
      icon: <FileTextOutlined />,
      content: <EditProjectDetailsForm 
                projectData={projectData}
                handleInputChange={handleInputChange}
              />,
      description: 'แก้ไขรายละเอียดของผลงาน'
    },
    {
      title: 'อัปโหลดข้อมูล',
      icon: <FileTextOutlined />,
      content: <EditUploadSection 
                projectData={projectData}
                handleInputChange={handleInputChange}
                handleFileChange={handleFileChange}
                handlePdfFileChange={handlePdfFileChange}
                handleRemovePdf={handleRemovePdf}
                handleDateChange={handleDateChange}
                handleSelectChange={handleSelectChange}
                projectTypes={PROJECT_TYPE}
                allowedFileTypes={useUpload().ALLOWED_FILE_TYPES}
              />,
      description: 'อัปโหลดเอกสารและไฟล์มีเดีย'
    },
    {
      title: 'ผู้จัดทำ',
      icon: <TeamOutlined />,
      content: <EditContributorSection 
                searchKeyword={searchKeyword}
                searchResults={searchResults}
                selectedContributors={selectedContributors}
                handleSearchChange={handleSearchChange}
                handleSearchSelect={handleSearchSelect}
                handleSelectContributor={handleSelectContributor}
                handleRemoveContributor={handleRemoveContributor}
              />,
      description: 'แก้ไขรายชื่อผู้จัดทำ'
    },
  ];

  // Show error message if there's an error
  if (projectError) {
    return <ErrorMessage 
             title="เกิดข้อผิดพลาด" 
             message={projectError}
             showReloadButton={true}
           />;
  }

  // Show loading state during initial load
  if (initialLoading || isProjectLoading) {
    return <LoadingSpinner 
            tip="กำลังโหลดข้อมูลโครงการ..." 
            size="large"
            fullPage={true}
          />;
  }

  // Check if user has permission to edit this project
  if (project && user && project.user_id !== user.id) {
    return <ErrorMessage 
            title="ไม่มีสิทธิ์เข้าถึง" 
            message="คุณไม่มีสิทธิ์ในการแก้ไขโครงการนี้"
            status={403}
            showHomeButton={true}
            showBackButton={true}
          />;
  }

  // Breadcrumb for navigation
  const breadcrumb = [
    { label: 'หน้าหลัก', path: HOME },
    { label: 'โครงการของฉัน', path: PROJECT.MY_PROJECTS },
    { label: project?.title || 'โครงการ', path: PROJECT.VIEW(projectId) },
    { label: 'แก้ไขโครงการ' }
  ];

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 mt-16 relative">
      {/* Show loading state during submission */}
      {(isSaving || isUploading) && 
        <LoadingSpinner 
          tip={isSaving ? "กำลังบันทึกข้อมูล..." : "กำลังโหลด..."} 
          size="large"
          fullPage={true}
        />
      }
      
      {/* Space-themed background */}
      <div className="fixed inset-0 -z-10" 
           style={{
             backgroundImage: `
               radial-gradient(circle at 20% 30%, rgba(144, 39, 142, 0.15) 0%, transparent 70%),
               radial-gradient(circle at 80% 70%, rgba(144, 39, 142, 0.1) 0%, transparent 70%)
             `,
             opacity: 0.6
           }}></div>
      
      {/* Stars effect */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute w-1 h-1 rounded-full bg-white animate-pulse" 
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              animationDuration: `${3 + Math.random() * 5}s`,
            }}
          ></div>
        ))}
      </div>
      
      {/* Page header with breadcrumb */}
      <PageHeader
        title={`แก้ไขโครงการ: ${project?.title || ''}`}
        subtitle="แก้ไขข้อมูลและอัปเดตผลงานของคุณ"
        breadcrumb={breadcrumb}
        icon={<EditOutlined className="mr-2" />}
      />
      
      {/* Category display (read-only during edit) */}
      {project && (
        <div className="mb-6 p-4 rounded-lg bg-[#90278E]/10 flex items-center">
          <RocketOutlined className="text-[#90278E] text-xl mr-3" />
          <span className="text-[#90278E] font-medium">ประเภทผลงาน: </span>
          <span className="ml-2 px-3 py-1 bg-[#90278E] text-white rounded-full text-sm">
            {(() => {
              switch(project.type) {
                case 'academic': return 'บทความวิชาการ';
                case 'competition': return 'การแข่งขัน';
                case 'coursework': return 'งานในชั้นเรียน';
                default: return project.type;
              }
            })()}
          </span>
        </div>
      )}
      
      {/* Space-themed Steps navigation */}
      <div className="mb-12 relative z-10">
        <Steps
          current={currentStep}
          onChange={setCurrentStep}
          className="space-steps"
          style={{
            "--step-primary-color": "#90278E",
            "--step-secondary-color": "#FF5E8C"
          }}
        >
          {steps.map((step, index) => (
            <Step 
              key={index} 
              title={
                <span className={currentStep === index ? "text-[#90278E] font-bold" : "text-gray-500"}>
                  {step.title}
                </span>
              }
              description={
                <span className={currentStep === index ? "text-[#90278E]/80" : "text-gray-400"}>
                  {step.description}
                </span>
              }
              icon={React.cloneElement(step.icon, {
                className: currentStep === index ? "text-[#90278E] animate-pulse" : "text-gray-400"
              })}
            />
          ))}
        </Steps>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {steps[currentStep].content}
        </div>
        <div className="col-span-1">
          <EditPreviewSection 
            projectData={projectData}
            previewUrls={previewUrls}
            selectedContributors={selectedContributors}
          />
        </div>
      </div>
      
      {/* Navigation buttons */}
      <div className="mt-10 flex justify-between">
        {currentStep > 0 && (
          <button 
            onClick={prevStep} 
            className="px-6 py-2 bg-gray-600 text-white font-bold rounded-full shadow-md hover:bg-gray-700 transition-all flex items-center"
            disabled={isSaving}
          >
            <span className="mr-2">&#8592;</span> ย้อนกลับ
          </button>
        )}
        
        {currentStep < steps.length - 1 ? (
          <button 
            onClick={nextStep} 
            className="px-6 py-2 bg-[#90278E] text-white font-bold rounded-full shadow-md hover:bg-[#7a1f6c] transition-all ml-auto flex items-center"
            disabled={isSaving}
          >
            ถัดไป <span className="ml-2">&#8594;</span>
          </button>
        ) : (
          <button 
            onClick={handleSave} 
            className="px-6 py-2 bg-gradient-to-r from-[#90278E] to-[#FF5E8C] text-white font-bold rounded-full shadow-md hover:opacity-90 transition-all ml-auto flex items-center"
            disabled={isSaving}
          >
            <SaveOutlined className="mr-2" /> บันทึกการแก้ไข
          </button>
        )}
      </div>
      
      {/* Confirmation Modal */}
      <SaveConfirmationModal 
        isModalVisible={isModalVisible}
        handleConfirmSave={handleConfirmSave}
        handleCancel={() => setIsModalVisible(false)}
        isSaving={isSaving}
      />
    </div>
  );
};

export default EditProject;