import React, { useState } from 'react';
import { Modal, message } from 'antd';
import ProjectCategorySelector from '../../components/ProjectCategorySelector/ProjectCategorySelector';
import UploadSection from '../../components/UploadSection/UploadSection';
import PDFUploadSection from '../../components/PDFUploadSection/PDFUploadSection';
import ProjectDetailsForm from '../../components/ProjectDetailsForm/ProjectDetailsForm';
import PreviewSection from '../../components/PreviewSection/PreviewSection';
import ContributorSection from '../../components/ContributorSection/ContributorSection';
import { axiosPost } from '../../lib/axios'; // Import the axiosPost function
import { useAuth } from '../../context/AuthContext';

const UploadWork = () => {
  const { authData } = useAuth(); // Access the auth data (including userId)
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    category: '',
    study_year: '',
    year: '',
    semester: '',
    visibility: 1, // default visibility
    status: 'pending', // default status
    coverImage: null,
    posterImage: null,
    videoFile: null,
    videoLink: '',
    pdfFile: null,
    contributors: [],
    // Additional fields based on project type
    publication_date: '',
    published_year: '',
    competition_name: '',
    competition_year: '',
    competition_poster: null,
    coursework_poster: null,
    coursework_video: null,
    coursework_image: null,
  });

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSubmit = () => {
    setIsModalVisible(true);
  };

  const handleConfirmSubmit = async () => {
    setIsModalVisible(false);
  
    // เตรียมข้อมูลเพื่อส่ง
    const data = {
      title: projectData.title,
      description: projectData.description,
      type: projectData.category,
      study_year: projectData.study_year,
      year: projectData.year,
      semester: projectData.semester,
      visibility: projectData.visibility,
      status: projectData.status,
      contributors: projectData.contributors.map(contributor => ({
        user_id: contributor.studentId,  // เปลี่ยนเป็น user_id ตามที่กำหนด
      })),
      // ฟิลด์พิเศษสำหรับโปรเจกต์ประเภท academic
      ...(projectData.category === 'academic' && {
        publication_date: projectData.publicationDate,
        published_year: projectData.publishedYear,
      }),
      // ฟิลด์พิเศษสำหรับโปรเจกต์ประเภท competition
      ...(projectData.category === 'competition' && {
        competition_name: projectData.competitionName,
        competition_year: projectData.competitionYear,
        competition_poster: projectData.competitionPoster,
      }),
      // ฟิลด์พิเศษสำหรับโปรเจกต์ประเภท coursework
      ...(projectData.category === 'coursework' && {
        coursework_poster: projectData.courseworkPoster,
        coursework_video: projectData.courseworkVideo,
        coursework_image: projectData.courseworkImage,
      }),
    };
  
    try {
      // ส่งข้อมูลไปยัง backend
      await axiosPost(`/projects/upload/${authData.userId}`, data);
      message.success('โปรดรอเจ้าหน้าที่ตรวจสอบ 1-2 วัน');
    } catch (error) {
      message.error('เกิดข้อผิดพลาดในการอัพโหลด');
    }
  };
  

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 mt-10">
      <h2 className="text-3xl font-bold text-[#90278E] text-center mb-8">เพิ่มผลงาน</h2>

      {/* เลือกประเภทงานก่อน */}
      <ProjectCategorySelector projectData={projectData} setProjectData={setProjectData} />

      {/* แสดงฟอร์มเมื่อเลือกประเภทแล้ว */}
      {projectData.category && (
        <div className="grid grid-cols-3 gap-6 mt-6">
          <div className="col-span-2 space-y-6">
            {projectData.category === 'ประเภท2' ? (
              <PDFUploadSection projectData={projectData} setProjectData={setProjectData} />
            ) : (
              <UploadSection projectData={projectData} setProjectData={setProjectData} />
            )}
            <ProjectDetailsForm projectData={projectData} setProjectData={setProjectData} />
            <ContributorSection projectData={projectData} setProjectData={setProjectData} />
          </div>
          <div className="col-span-1">
            <PreviewSection projectData={projectData} />
          </div>
        </div>
      )}

      {/* Submit Button */}
      {projectData.category && (
        <div className="mt-6 text-center">
          <button 
            onClick={handleSubmit} 
            className="px-6 py-2 bg-[#90278E] text-white font-bold rounded-lg shadow-md hover:bg-[#7a1f6c] transition"
          >
            ส่งผลงาน
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        title="ยืนยันการส่งผลงาน"
        open={isModalVisible}
        onOk={handleConfirmSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
      >
        <p>คุณแน่ใจหรือไม่ว่าต้องการส่งผลงานนี้?</p>
      </Modal>
    </div>
  );
};

export default UploadWork;
