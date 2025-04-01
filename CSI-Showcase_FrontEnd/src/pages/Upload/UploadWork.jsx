import React, { useState, useEffect } from 'react';
import { Steps, message } from 'antd';
import { 
  RocketOutlined, 
  FileTextOutlined, 
  TeamOutlined, 
  SendOutlined 
} from '@ant-design/icons';
import { axiosPost, axiosGet } from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';

// Import components
import ProjectCategorySelector from '../../components/upload/ProjectCategorySelector';
import UploadSection from '../../components/upload/UploadSection';
import ProjectDetailsForm from '../../components/upload/ProjectDetailsForm';
import ContributorSection from '../../components/upload/ContributorSection';
import PreviewSection from '../../components/upload/PreviewSection';
import ConfirmationModal from '../../components/upload/ConfirmationModal';

const { Step } = Steps;

const UploadWork = () => {
  const { authData } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    category: '', // type in database: enum('coursework','academic','competition')
    study_year: '',
    year: new Date().getFullYear(),
    semester: '1', // enum('1','2','3')
    visibility: 1, // tinyint(1)
    status: 'pending', // enum('pending','approved','rejected')
    coverImage: null,
    posterImage: null,
    videoLink: '',
    pdfFiles: [],
    
    // Academic paper fields
    publicationDate: null,
    publishedYear: new Date().getFullYear(),
    
    // Competition fields
    competitionName: '',
    competitionYear: new Date().getFullYear(),
    competitionPoster: null,
    
    // Coursework fields
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
  
  // For modal visibility
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Generate preview URLs for uploaded files
  useEffect(() => {
    const objectUrls = [];
    
    // Function to create and track object URLs
    const createPreviewUrl = (file, key) => {
      if (file && typeof file === 'object') {
        const url = URL.createObjectURL(file);
        objectUrls.push(url);
        return url;
      }
      return null;
    };
    
    // Create preview URLs for each relevant file
    const newPreviewUrls = {
      coverImage: createPreviewUrl(projectData.coverImage, 'coverImage'),
      posterImage: createPreviewUrl(projectData.posterImage, 'posterImage'),
      competitionPoster: createPreviewUrl(projectData.competitionPoster, 'competitionPoster'),
      courseworkPoster: createPreviewUrl(projectData.courseworkPoster, 'courseworkPoster'),
      courseworkImage: createPreviewUrl(projectData.courseworkImage, 'courseworkImage'),
      pdfFiles: projectData.pdfFiles.map(pdfObj => {
        if (pdfObj.file instanceof Blob) {
          const url = URL.createObjectURL(pdfObj.file);
          objectUrls.push(url);
          return { url, name: pdfObj.name || "ไฟล์ PDF" };
        }
        return pdfObj;
      }),
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
      const results = await axiosGet(`/search/users?keyword=${value}`);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching for users:', error);
    }
  };

  const handleSelectContributor = (user) => {
    setSelectedContributors((prev) => [
      ...prev,
      {
        userId: user.user_id,
        fullName: user.full_name,
        image: user.image,
      },
    ]);
    setSearchResults([]);
    setSearchKeyword('');
    
    // Update projectData with selected contributors
    setProjectData(prev => ({
      ...prev,
      contributors: [
        ...(prev.contributors || []),
        { userId: user.user_id, fullName: user.full_name, image: user.image }
      ]
    }));
  };

  const handleSubmit = () => {
    // ตรวจสอบข้อมูลที่จำเป็นก่อนแสดง Modal ยืนยันการส่ง
    if (!projectData.title) {
      message.error({
        content: 'กรุณาระบุชื่อผลงาน',
        style: {
          borderRadius: '8px',
          background: 'rgba(220, 38, 38, 0.9)',
          color: 'white',
        },
      });
      return;
    }
    
    if (!projectData.description) {
      message.error({
        content: 'กรุณาระบุรายละเอียดผลงาน',
        style: {
          borderRadius: '8px',
          background: 'rgba(220, 38, 38, 0.9)',
          color: 'white',
        },
      });
      return;
    }
    
    if (!projectData.coverImage) {
      message.error({
        content: 'กรุณาอัปโหลดภาพปก',
        style: {
          borderRadius: '8px',
          background: 'rgba(220, 38, 38, 0.9)',
          color: 'white',
        },
      });
      return;
    }
    
    // แสดง Modal ยืนยันการส่งผลงาน
    setIsModalVisible(true);
  };

  const handleRemoveContributor = (userId) => {
    setSelectedContributors((prev) => prev.filter((contributor) => contributor.userId !== userId));
    
    // Update projectData when removing contributors
    setProjectData(prev => ({
      ...prev,
      contributors: (prev.contributors || []).filter(contributor => contributor.userId !== userId)
    }));
  };

  const handleSearchSelect = (value) => {
    const selectedUser = searchResults.find((user) => user.full_name === value);
    if (selectedUser) {
      handleSelectContributor(selectedUser);
    }
  };
  
  // FILE UPLOAD FUNCTIONS
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setProjectData((prev) => ({ ...prev, [type]: file }));
      message.success({
        content: `${file.name} อัปโหลดสำเร็จ`,
        style: {
          marginTop: '20px',
          background: 'rgba(13, 2, 33, 0.8)',
          borderLeft: '4px solid #90278E',
          borderRadius: '4px',
          color: 'white',
        },
      });
    }
  };
  
  const handlePdfFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newPdfFile = {
        file,
        name: file.name,
      };
      
      setProjectData((prev) => ({
        ...prev,
        pdfFiles: [...(prev.pdfFiles || []), newPdfFile],
      }));
      
      message.success({
        content: `${file.name} อัปโหลดสำเร็จ`,
        style: {
          marginTop: '20px',
          background: 'rgba(13, 2, 33, 0.8)',
          borderLeft: '4px solid #90278E',
          borderRadius: '4px',
          color: 'white',
        },
      });
    }
  };
  
  const handleRemovePdf = (index) => {
    setProjectData((prev) => ({
      ...prev,
      pdfFiles: prev.pdfFiles.filter((_, i) => i !== index),
    }));
  };
  
  // FORM INPUT FUNCTIONS
  const handleInputChange = (e, field) => {
    setProjectData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };
  
  const handleDateChange = (date, field) => {
    setProjectData((prev) => ({
      ...prev,
      [field]: date,
    }));
  };
  
  const handleSelectChange = (value, field) => {
    setProjectData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  // SUBMISSION FUNCTIONS
// อัปเดตฟังก์ชัน handleConfirmSubmit
const handleConfirmSubmit = async () => {
  setIsModalVisible(false);
  setIsSubmitting(true);  // เพิ่มสถานะกำลังส่งข้อมูล

  try {
    // เตรียมข้อมูลตามโครงสร้าง API
    const formData = new FormData();
    
    // ข้อมูลพื้นฐานของโครงการ
    formData.append('title', projectData.title);
    formData.append('description', projectData.description);
    formData.append('type', projectData.category);  // 'coursework', 'academic', 'competition'
    formData.append('study_year', projectData.study_year);
    formData.append('year', projectData.year);
    formData.append('semester', projectData.semester);
    formData.append('visibility', projectData.visibility);
    formData.append('status', 'pending');
    formData.append('tags', projectData.tags || '');  // ถ้ามีการเพิ่ม tags
    
    // ข้อมูลผู้ร่วมทำผลงาน
    if (selectedContributors.length > 0) {
      // เตรียม contributors ในรูปแบบที่ API ต้องการ
      const contributors = selectedContributors.map(contributor => ({
        user_id: contributor.userId
      }));
      formData.append('contributors', JSON.stringify(contributors));
    }
    
    // อัปโหลดไฟล์ต่างๆ
    if (projectData.coverImage) {
      formData.append('coverImage', projectData.coverImage);
    }
    
    if (projectData.posterImage) {
      formData.append('posterImage', projectData.posterImage);
    }
    
    if (projectData.videoLink) {
      formData.append('videoLink', projectData.videoLink);
    }
    
    // อัปโหลดไฟล์ PDF
    if (projectData.pdfFiles && projectData.pdfFiles.length > 0) {
      projectData.pdfFiles.forEach((pdf, index) => {
        if (pdf.file) {
          formData.append(`pdfFiles`, pdf.file);
        }
      });
    }
    
    // ข้อมูลเฉพาะประเภทของโครงการ
    if (projectData.category === 'academic') {
      // ข้อมูลสำหรับบทความวิชาการ
      if (projectData.publicationDate) {
        formData.append('publication_date', projectData.publicationDate.format('YYYY-MM-DD'));
      }
      formData.append('published_year', projectData.publishedYear || new Date().getFullYear());
      formData.append('abstract', projectData.abstract || '');
      formData.append('authors', projectData.authors || '');
      formData.append('publication_venue', projectData.publicationVenue || '');
    } 
    else if (projectData.category === 'competition') {
      // ข้อมูลสำหรับการแข่งขัน
      formData.append('competition_name', projectData.competitionName || '');
      formData.append('competition_year', projectData.competitionYear || new Date().getFullYear());
      formData.append('competition_level', projectData.competitionLevel || 'university');
      formData.append('achievement', projectData.achievement || '');
      formData.append('team_members', projectData.teamMembers || '');
      
      if (projectData.competitionPoster) {
        formData.append('competition_poster', projectData.competitionPoster);
      }
    } 
    else if (projectData.category === 'coursework') {
      // ข้อมูลสำหรับงานการเรียน
      formData.append('course_code', projectData.courseCode || '');
      formData.append('course_name', projectData.courseName || '');
      formData.append('instructor', projectData.instructor || '');
      
      if (projectData.courseworkPoster) {
        formData.append('coursework_poster', projectData.courseworkPoster);
      }
      
      if (projectData.courseworkVideo) {
        formData.append('coursework_video', projectData.courseworkVideo);
      }
      
      if (projectData.courseworkImage) {
        formData.append('coursework_image', projectData.courseworkImage);
      }
    }
  
    // ส่งข้อมูลไปยัง API
    const response = await axiosPost(`/projects/upload/${authData.userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // หากส่งสำเร็จ
    message.success({
      content: 'ส่งผลงานสำเร็จ! โปรดรอเจ้าหน้าที่ตรวจสอบ 1-2 วัน',
      style: {
        borderRadius: '8px',
        background: 'rgba(13, 2, 33, 0.8)',
        border: '1px solid #90278E',
        color: 'white',
        boxShadow: '0 4px 12px rgba(144, 39, 142, 0.3)',
      },
      duration: 5,
    });
    
    // บันทึกค่า projectId ที่ได้รับกลับมา
    const projectId = response.projectId;
    
    // นำทางไปยังหน้า Dashboard หรือหน้าแสดงผลงาน
    setTimeout(() => {
      window.location.href = `/projects/${projectId}`;
    }, 3000);
    
  } catch (error) {
    console.error('Upload error:', error);
    
    let errorMessage = 'เกิดข้อผิดพลาดในการอัพโหลด! กรุณาลองใหม่อีกครั้ง';
    
    // ตรวจสอบข้อความผิดพลาดจาก API response ถ้ามี
    if (error?.message) {
      errorMessage = `เกิดข้อผิดพลาด: ${error.message}`;
    }
    
    message.error({
      content: errorMessage,
      style: {
        borderRadius: '8px',
        background: 'rgba(220, 38, 38, 0.9)',
        color: 'white',
      },
    });
  } finally {
    setIsSubmitting(false);  // จบการส่งข้อมูล
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
      title: 'ประเภทผลงาน',
      icon: <RocketOutlined />,
      content: <ProjectCategorySelector 
                projectData={projectData} 
                handleInputChange={handleInputChange} 
              />,
      description: 'เลือกประเภทผลงาน'
    },
    {
      title: 'อัปโหลดข้อมูล',
      icon: <FileTextOutlined />,
      content: <UploadSection 
                projectData={projectData}
                handleInputChange={handleInputChange}
                handleFileChange={handleFileChange}
                handlePdfFileChange={handlePdfFileChange}
                handleRemovePdf={handleRemovePdf}
                handleDateChange={handleDateChange}
                handleSelectChange={handleSelectChange}
              />,
      description: 'อัปโหลดเอกสารและไฟล์มีเดีย'
    },
    {
      title: 'รายละเอียด',
      icon: <FileTextOutlined />,
      content: <ProjectDetailsForm 
                projectData={projectData}
                handleInputChange={handleInputChange}
              />,
      description: 'เพิ่มรายละเอียดของผลงาน'
    },
    {
      title: 'ผู้จัดทำ',
      icon: <TeamOutlined />,
      content: <ContributorSection 
                searchKeyword={searchKeyword}
                searchResults={searchResults}
                selectedContributors={selectedContributors}
                handleSearchChange={handleSearchChange}
                handleSearchSelect={handleSearchSelect}
                handleSelectContributor={handleSelectContributor}
                handleRemoveContributor={handleRemoveContributor}
              />,
      description: 'เพิ่มรายชื่อผู้จัดทำ'
    },
  ];

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 mt-16 relative">
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
      
      {/* Page header */}
      <div className="text-center mb-12 relative">
        <h2 className="text-4xl font-bold text-[#90278E] relative inline-block">
          เพิ่มผลงาน
          <span className="absolute -bottom-1 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-[#90278E] to-transparent"></span>
        </h2>
        
        {/* Decorative elements */}
        <div className="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-[#90278E]/10 blur-xl"></div>
        <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-[#90278E]/10 blur-xl"></div>
      </div>
      
      {/* Space-themed Steps navigation */}
      {projectData.category && (
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
      )}
      
      {/* Main content */}
      <div className="relative">
        {/* Initial category selection */}
        {!projectData.category && (
          <ProjectCategorySelector 
            projectData={projectData} 
            handleInputChange={handleInputChange} 
          />
        )}
        
        {/* Steps content after category selection */}
        {projectData.category && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              {steps[currentStep].content}
            </div>
            <div className="col-span-1">
              <PreviewSection 
                projectData={projectData}
                previewUrls={previewUrls}
                selectedContributors={selectedContributors}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation buttons */}
      {projectData.category && (
        <div className="mt-10 flex justify-between">
          {currentStep > 0 && (
            <button 
              onClick={prevStep} 
              className="px-6 py-2 bg-gray-600 text-white font-bold rounded-full shadow-md hover:bg-gray-700 transition-all flex items-center"
            >
              <span className="mr-2">&#8592;</span> ย้อนกลับ
            </button>
          )}
          
          {currentStep < steps.length - 1 ? (
            <button 
              onClick={nextStep} 
              className="px-6 py-2 bg-[#90278E] text-white font-bold rounded-full shadow-md hover:bg-[#7a1f6c] transition-all ml-auto flex items-center"
            >
              ถัดไป <span className="ml-2">&#8594;</span>
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              className="px-6 py-2 bg-gradient-to-r from-[#90278E] to-[#FF5E8C] text-white font-bold rounded-full shadow-md hover:opacity-90 transition-all ml-auto flex items-center"
            >
              <SendOutlined className="mr-2" /> ส่งผลงาน
            </button>
          )}
        </div>
      )}
      
      {/* Confirmation Modal */}
      <ConfirmationModal 
        isModalVisible={isModalVisible}
        handleConfirmSubmit={handleConfirmSubmit}
        handleCancel={() => setIsModalVisible(false)}
      />
    </div>
  );
};

export default UploadWork;