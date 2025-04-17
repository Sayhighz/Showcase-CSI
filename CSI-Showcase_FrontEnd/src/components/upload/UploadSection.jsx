import React from 'react';
import { Input, Select, DatePicker, Upload, Button } from 'antd';
import { 
  FileTextOutlined, 
  VideoCameraOutlined, 
  LinkOutlined, 
  CalendarOutlined,
  TrophyOutlined, 
  FileOutlined,
  CloudUploadOutlined,
  FileImageOutlined,
  UploadOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { PROJECT_TYPE, PROJECT_TYPE_DISPLAY, PROJECT_TYPE_ICON } from '../../constants/projectTypes';

const { Option } = Select;
const { TextArea } = Input;

/**
 * Generate star background for space theme
 * @returns {JSX.Element} - Star background
 */
const generateStarBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 15 }).map((_, i) => (
        <div 
          key={i} 
          className="absolute w-1 h-1 bg-white rounded-full" 
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5 + 0.1,
            boxShadow: '0 0 2px rgba(255, 255, 255, 0.8)'
          }}
        ></div>
      ))}
    </div>
  );
};

/**
 * Get icon based on file type
 * @param {File} file - The file object
 * @param {string} type - Type of the file ('image', 'videoFile', 'videoLink')
 * @returns {JSX.Element} - Icon element
 */
const getIcon = (file, type) => {
  if (!file) {
    if (type === 'videoFile' || type === 'videoLink') {
      return <VideoCameraOutlined className="text-[#FF5E8C] text-5xl mb-2" />;
    }
    return <CloudUploadOutlined className="text-[#90278E] text-5xl mb-2" />;
  }
  if (type === 'videoFile' || type === 'videoLink') {
    return <VideoCameraOutlined className="text-green-400 text-5xl mb-2" />;
  }
  return <FileImageOutlined className="text-blue-400 text-5xl mb-2" />;
};

/**
 * คอมโพเนนต์สำหรับอัปโหลดไฟล์และข้อมูลโปรเจค
 * 
 * @param {Object} props - คุณสมบัติของคอมโพเนนต์
 * @param {Object} props.projectData - ข้อมูลโปรเจค
 * @param {Function} props.handleInputChange - ฟังก์ชันจัดการการเปลี่ยนแปลงข้อมูล input
 * @param {Function} props.handleFileChange - ฟังก์ชันจัดการการเปลี่ยนแปลงไฟล์
 * @param {Function} props.handlePdfFileChange - ฟังก์ชันจัดการการเปลี่ยนแปลงไฟล์ PDF
 * @param {Function} props.handleRemovePdf - ฟังก์ชันจัดการการลบไฟล์ PDF
 * @param {Function} props.handleDateChange - ฟังก์ชันจัดการการเปลี่ยนแปลงวันที่
 * @param {Function} props.handleSelectChange - ฟังก์ชันจัดการการเปลี่ยนแปลงข้อมูล select
 * @param {Object} props.projectTypes - ประเภทของโปรเจค (จาก constants)
 * @param {Object} props.allowedFileTypes - ประเภทไฟล์ที่อนุญาต
 */
const UploadSection = ({ 
  projectData, 
  handleInputChange, 
  handleFileChange, 
  handlePdfFileChange, 
  handleRemovePdf,
  handleDateChange, 
  handleSelectChange,
  projectTypes = PROJECT_TYPE,
  allowedFileTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/quicktime'],
    document: ['application/pdf']
  }
}) => {
  if (!projectData.category) return null;

  return (
    <div className="space-y-6 p-6 rounded-lg relative"
         style={{
           background: 'linear-gradient(to bottom, rgba(13, 2, 33, 0.05), rgba(144, 39, 142, 0.1))',
           borderRadius: '1rem',
           boxShadow: '0 4px 20px rgba(144, 39, 142, 0.15)',
           overflow: 'hidden',
         }}>
      {/* Space-themed decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#90278E]/5 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-[#90278E]/5 blur-xl"></div>
      
      <h3 className="text-xl font-bold text-[#90278E] relative inline-block">
        อัปโหลดข้อมูล
        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#90278E] via-[#FF5E8C] to-transparent"></span>
      </h3>

      <div className="grid grid-cols-2 gap-6">
        {/* Study Year Input */}
        <div className="w-full relative">
          <h4 className="font-semibold text-[#90278E] mb-2 flex items-center">
            <CalendarOutlined className="mr-2" />
            ปีการศึกษา
          </h4>
          <Input 
            type="number"
            value={projectData.study_year || ''} 
            onChange={(e) => handleInputChange(e, 'study_year')}
            placeholder="กรอกปีการศึกษา"
            className="rounded-full border-[#90278E]/30 hover:border-[#90278E] focus:border-[#90278E] transition-all"
            style={{ 
              background: 'rgba(255, 255, 255, 0.8)', 
              boxShadow: '0 2px 6px rgba(144, 39, 142, 0.1)'
            }}
          />
        </div>

        {/* Semester Input */}
        <div className="w-full relative">
          <h4 className="font-semibold text-[#90278E] mb-2 flex items-center">
            <CalendarOutlined className="mr-2" />
            ภาคการศึกษา
          </h4>
          <Select
            value={projectData.semester}
            onChange={(value) => handleSelectChange(value, 'semester')}
            className="w-full rounded-full hover:border-[#90278E] focus:border-[#90278E] transition-all"
            style={{ 
              background: 'rgba(255, 255, 255, 0.8)', 
              boxShadow: '0 2px 6px rgba(144, 39, 142, 0.1)'
            }}
          >
            <Option value="1">ภาคเรียนที่ 1</Option>
            <Option value="2">ภาคเรียนที่ 2</Option>
            <Option value="3">ภาคฤดูร้อน</Option>
          </Select>
        </div>

        {/* Cover Image Upload - Always shown for all categories */}
        <label className="relative border-2 border-dashed border-[#90278E]/30 hover:border-[#90278E] rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer w-full h-44 group transition-all duration-300 overflow-hidden"
               style={{ 
                 background: 'rgba(13, 2, 33, 0.05)',
               }}>
          <input 
            type="file" 
            className="hidden" 
            onChange={(e) => handleFileChange(e, 'coverImage')} 
            accept={allowedFileTypes.image.join(',')} 
          />
          
          {/* Star background */}
          {generateStarBackground()}
          
          {/* Upload icon and text */}
          <div className="relative z-10 flex flex-col items-center transform group-hover:scale-110 transition-transform duration-300">
            {getIcon(projectData.coverImage, 'image')}
            <span className="text-[#90278E] font-medium text-center group-hover:text-[#FF5E8C] transition-colors">
              {projectData.coverImage ? projectData.coverImage.name : 'อัปโหลดภาพหน้าปก'}
            </span>
            
            {/* Small glowing dot */}
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FF5E8C] opacity-70 group-hover:opacity-100 group-hover:animate-ping"></div>
          </div>
          
          {/* Decorative planet */}
          <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full bg-gradient-to-br from-[#90278E]/20 to-[#0D0221]/20 blur-md opacity-40 group-hover:opacity-70 transition-opacity"></div>
        </label>
        
        {/* Second upload slot that changes based on category */}
        {projectData.category === projectTypes.COURSEWORK ? (
          // For coursework, show video upload instead of poster
          <label className="relative border-2 border-dashed border-[#90278E]/30 hover:border-[#90278E] rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer w-full h-44 group transition-all duration-300 overflow-hidden"
                 style={{ background: 'rgba(13, 2, 33, 0.05)' }}>
            <input 
              type="file" 
              className="hidden" 
              onChange={(e) => handleFileChange(e, 'courseworkVideo')} 
              accept={allowedFileTypes.video.join(',')} 
            />
            {generateStarBackground()}
            <div className="relative z-10 flex flex-col items-center transform group-hover:scale-110 transition-transform duration-300">
              {getIcon(projectData.courseworkVideo, 'videoFile')}
              <span className="text-[#90278E] font-medium text-center group-hover:text-[#FF5E8C] transition-colors">
                {projectData.courseworkVideo ? projectData.courseworkVideo.name : 'อัปโหลดวีดีโอการเรียน'}
              </span>
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FF5E8C] opacity-70 group-hover:opacity-100 group-hover:animate-ping"></div>
            </div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-gradient-to-br from-[#90278E]/20 to-[#0D0221]/20 blur-md opacity-40 group-hover:opacity-70 transition-opacity"></div>
          </label>
        ) : (
          // For other categories, show poster upload
          <label className="relative border-2 border-dashed border-[#90278E]/30 hover:border-[#90278E] rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer w-full h-44 group transition-all duration-300 overflow-hidden"
                 style={{ background: 'rgba(13, 2, 33, 0.05)' }}>
            <input 
              type="file" 
              className="hidden" 
              onChange={(e) => handleFileChange(e, 'posterImage')} 
              accept={allowedFileTypes.image.join(',')} 
            />
            {generateStarBackground()}
            <div className="relative z-10 flex flex-col items-center transform group-hover:scale-110 transition-transform duration-300">
              {getIcon(projectData.posterImage, 'image')}
              <span className="text-[#90278E] font-medium text-center group-hover:text-[#FF5E8C] transition-colors">
                {projectData.posterImage ? projectData.posterImage.name : 'อัปโหลดภาพ Poster'}
              </span>
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FF5E8C] opacity-70 group-hover:opacity-100 group-hover:animate-ping"></div>
            </div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-gradient-to-br from-[#90278E]/20 to-[#0D0221]/20 blur-md opacity-40 group-hover:opacity-70 transition-opacity"></div>
          </label>
        )}
        
        {/* Video Link Input - Always shown for all categories */}
        <div className="relative col-span-2 border-2 border-dashed border-[#90278E]/30 hover:border-[#90278E] rounded-lg p-6 flex flex-col items-center justify-center w-full h-44 group transition-all duration-300 overflow-hidden"
             style={{ 
               background: 'rgba(13, 2, 33, 0.05)',
             }}>
          {/* Star background */}
          {generateStarBackground()}
          
          {/* Link icon and input */}
          <div className="relative z-10 flex flex-col items-center w-full max-w-md">
            <LinkOutlined className="text-[#FF5E8C] text-5xl mb-4" />
            <Input 
              placeholder="วางลิงก์วิดีโอจาก YouTube, Facebook, TikTok" 
              value={projectData.videoLink || ''} 
              onChange={(e) => handleInputChange(e, 'videoLink')} 
              className="text-center rounded-full border-[#90278E]/30 hover:border-[#90278E] focus:border-[#90278E] transition-all"
              style={{ 
                background: 'rgba(255, 255, 255, 0.8)', 
                boxShadow: '0 2px 10px rgba(144, 39, 142, 0.15)'
              }}
              prefix={<VideoCameraOutlined className="text-[#90278E]" />}
            />
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-3 left-3 w-12 h-12 rounded-full bg-gradient-to-br from-[#90278E]/10 to-transparent blur-md"></div>
          <div className="absolute bottom-3 right-3 w-14 h-14 rounded-full bg-gradient-to-tl from-[#FF5E8C]/10 to-transparent blur-md"></div>
        </div>
        
        {/* PDF Upload Section - Always shown for all categories */}
        <div className="col-span-2 relative">
          <h4 className="font-semibold text-[#90278E] mb-2 flex items-center">
            <FileTextOutlined className="mr-2" />
            เอกสาร PDF
          </h4>
          
          <label className="relative border-2 border-dashed border-[#90278E]/30 hover:border-[#90278E] rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer w-full h-32 group transition-all duration-300 overflow-hidden"
                 style={{ 
                   background: 'rgba(13, 2, 33, 0.05)',
                 }}>
            <input 
              type="file" 
              className="hidden" 
              onChange={handlePdfFileChange} 
              accept="application/pdf" 
            />
            
            {/* Star background */}
            {generateStarBackground()}
            
            {/* Upload icon and text */}
            <div className="relative z-10 flex flex-col items-center transform group-hover:scale-110 transition-transform duration-300">
              <FileTextOutlined className="text-[#90278E] text-4xl mb-2" />
              <span className="text-[#90278E] font-medium text-center group-hover:text-[#FF5E8C] transition-colors">
                เพิ่มไฟล์ PDF
              </span>
            </div>
          </label>
          
          {/* Display uploaded PDFs */}
          {projectData.pdfFiles && projectData.pdfFiles.length > 0 && (
            <div className="mt-4 space-y-3">
              <h5 className="font-medium text-[#90278E]">เอกสารที่อัปโหลด</h5>
              {projectData.pdfFiles.map((pdf, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between bg-white/70 p-3 rounded-lg border border-[#90278E]/20 group hover:border-[#90278E] transition-all"
                >
                  <div className="flex items-center">
                    <FileTextOutlined className="text-[#90278E] text-xl mr-3" />
                    <span>{pdf.name}</span>
                  </div>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemovePdf(index)} 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ลบ
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Tags Input */}
          <div className="mt-6 w-full">
            <h4 className="font-semibold text-[#90278E] mb-2 flex items-center">
              <FileTextOutlined className="mr-2" />
              แท็ก (Tags)
            </h4>
            <Input 
              value={projectData.tags || ''} 
              onChange={(e) => handleInputChange(e, 'tags')}
              placeholder="ใส่แท็กคั่นด้วยเครื่องหมายจุลภาค เช่น ai, web, learning"
              className="rounded-lg border-[#90278E]/30 hover:border-[#90278E] focus:border-[#90278E] transition-all"
              style={{ 
                background: 'rgba(255, 255, 255, 0.8)', 
                boxShadow: '0 2px 6px rgba(144, 39, 142, 0.1)'
              }}
            />
          </div>

          {/* Academic Paper Fields (Only shown for academic projects) */}
          {projectData.category === projectTypes.ACADEMIC && (
            <div className="col-span-2 bg-white/40 rounded-lg p-5 space-y-4 relative overflow-hidden mt-6" 
                 style={{ borderLeft: '4px solid #90278E' }}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-[#90278E]/5 blur-xl"></div>
              
              <h4 className="font-bold text-[#90278E] flex items-center">
                <FileOutlined className="mr-2" /> ข้อมูลบทความวิชาการ
              </h4>
              
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <h4 className="font-semibold text-[#90278E]/80 mb-2">วันที่เผยแพร่</h4>
                  <DatePicker
                    className="w-full rounded-lg border-[#90278E]/30 hover:border-[#90278E] focus:border-[#90278E] transition-all"
                    value={projectData.publicationDate}
                    onChange={(date) => handleDateChange(date, 'publicationDate')}
                    placeholder="เลือกวันที่เผยแพร่"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.8)', 
                      boxShadow: '0 2px 6px rgba(144, 39, 142, 0.1)'
                    }}
                  />
                </div>
                <div className="w-1/2">
                  <h4 className="font-semibold text-[#90278E]/80 mb-2">ปีที่เผยแพร่</h4>
                  <Input 
                    type="number" 
                    value={projectData.publishedYear || ''} 
                    onChange={(e) => handleInputChange(e, 'publishedYear')}
                    placeholder="ปีที่เผยแพร่"
                    className="rounded-lg border-[#90278E]/30 hover:border-[#90278E] focus:border-[#90278E] transition-all"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.8)', 
                      boxShadow: '0 2px 6px rgba(144, 39, 142, 0.1)'
                    }}
                  />
                </div>
              </div>

              {/* เพิ่มฟิลด์ที่ต้องการตาม API */}
              <div className="w-full">
                <h4 className="font-semibold text-[#90278E]/80 mb-2">บทคัดย่อ</h4>
                <TextArea
                  value={projectData.abstract || ''} 
                  onChange={(e) => handleInputChange(e, 'abstract')}
                  placeholder="บทคัดย่อของบทความ"
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  className="rounded-lg border-[#90278E]/30 hover:border-[#90278E] focus:border-[#90278E] transition-all"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.8)', 
                    boxShadow: '0 2px 6px rgba(144, 39, 142, 0.1)'
                  }}
                />
              </div>

              <div className="w-full">
                <h4 className="font-semibold text-[#90278E]/80 mb-2">ผู้เขียน</h4>
                <Input
                  value={projectData.authors || ''} 
                  onChange={(e) => handleInputChange(e, 'authors')}
                  placeholder="รายชื่อผู้เขียนทั้งหมด"
                  className="rounded-lg border-[#90278E]/30 hover:border-[#90278E] focus:border-[#90278E] transition-all"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.8)', 
                    boxShadow: '0 2px 6px rgba(144, 39, 142, 0.1)'
                  }}
                />
              </div>

              <div className="w-full">
                <h4 className="font-semibold text-[#90278E]/80 mb-2">สถานที่เผยแพร่</h4>
                <Input
                  value={projectData.publicationVenue || ''} 
                  onChange={(e) => handleInputChange(e, 'publicationVenue')}
                  placeholder="ชื่อวารสารหรืองานประชุมที่ตีพิมพ์"
                  className="rounded-lg border-[#90278E]/30 hover:border-[#90278E] focus:border-[#90278E] transition-all"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.8)', 
                    boxShadow: '0 2px 6px rgba(144, 39, 142, 0.1)'
                  }}
                />
              </div>
            </div>
          )}

          {/* Competition Fields (Only shown for competition projects) */}
          {projectData.category === projectTypes.COMPETITION && (
            <div className="col-span-2 bg-white/40 rounded-lg p-5 space-y-4 relative overflow-hidden mt-6" 
                  style={{ borderLeft: '4px solid #90278E' }}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-[#90278E]/5 blur-xl"></div>
              
              <h4 className="font-bold text-[#90278E] flex items-center">
                <TrophyOutlined className="mr-2" /> ข้อมูลการแข่งขัน
              </h4>
              
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <h4 className="font-semibold text-[#90278E]/80 mb-2">ชื่อการแข่งขัน</h4>
                  <Input 
                    value={projectData.competitionName || ''} 
                    onChange={(e) => handleInputChange(e, 'competitionName')} 
                    placeholder="ชื่อการแข่งขัน"
                    className="rounded-lg border-[#90278E]/30 hover:border-[#90278E] focus:border-[#90278E] transition-all"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.8)', 
                      boxShadow: '0 2px 6px rgba(144, 39, 142, 0.1)'
                    }}
                  />
                </div>
                <div className="w-1/2">
                  <h4 className="font-semibold text-[#90278E]/80 mb-2">ปีที่แข่งขัน</h4>
                  <Input 
                    type="number"
                    value={projectData.competitionYear || ''} 
                    onChange={(e) => handleInputChange(e, 'competitionYear')} 
                    placeholder="ปีที่แข่งขัน"
                    className="rounded-lg border-[#90278E]/30 hover:border-[#90278E] focus:border-[#90278E] transition-all"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.8)', 
                      boxShadow: '0 2px 6px rgba(144, 39, 142, 0.1)'
                    }}
                  />
                </div>
              </div>
              
              {/* เพิ่มฟิลด์ตาม API */}
              <div className="w-full">
                <h4 className="font-semibold text-[#90278E]/80 mb-2">ระดับการแข่งขัน</h4>
                <Select
                  value={projectData.competitionLevel || 'university'}
                  onChange={(value) => handleSelectChange(value, 'competitionLevel')}
                  className="w-full rounded-lg hover:border-[#90278E] focus:border-[#90278E] transition-all"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.8)', 
                    boxShadow: '0 2px 6px rgba(144, 39, 142, 0.1)'
                  }}
                >
                  <Option value="department">ระดับภาควิชา</Option>
                  <Option value="faculty">ระดับคณะ</Option>
                  <Option value="university">ระดับมหาวิทยาลัย</Option>
                  <Option value="national">ระดับประเทศ</Option>
                  <Option value="international">ระดับนานาชาติ</Option>
                </Select>
              </div>

              <div className="w-full">
                <h4 className="font-semibold text-[#90278E]/80 mb-2">ผลงานที่ได้รับ</h4>
                <Input
                  value={projectData.achievement || ''} 
                  onChange={(e) => handleInputChange(e, 'achievement')}
                  placeholder="รางวัลหรือผลงานที่ได้รับจากการแข่งขัน"
                  className="rounded-lg border-[#90278E]/30 hover:border-[#90278E] focus:border-[#90278E] transition-all"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.8)', 
                    boxShadow: '0 2px 6px rgba(144, 39, 142, 0.1)'
                  }}
                />
              </div>

              <div className="w-full">
                <h4 className="font-semibold text-[#90278E]/80 mb-2">รายชื่อสมาชิกในทีม</h4>
                <Input
                  value={projectData.teamMembers || ''} 
                  onChange={(e) => handleInputChange(e, 'teamMembers')}
                  placeholder="รายชื่อสมาชิกในทีมทั้งหมด"
                  className="rounded-lg border-[#90278E]/30 hover:border-[#90278E] focus:border-[#90278E] transition-all"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.8)', 
                    boxShadow: '0 2px 6px rgba(144, 39, 142, 0.1)'
                  }}
                />
              </div>
            </div>
          )}

          {/* Coursework Fields (Only shown for coursework projects) */}
          {projectData.category === projectTypes.COURSEWORK && (
            <div className="col-span-2 bg-white/40 rounded-lg p-5 space-y-4 relative overflow-hidden mt-6" 
                  style={{ borderLeft: '4px solid #90278E' }}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-[#90278E]/5 blur-xl"></div>
              
              <h4 className="font-bold text-[#90278E]">ข้อมูลในชั้นเรียน</h4>
              
              {/* เพิ่มฟิลด์ตาม API */}
              <div className="w-full">
                <h4 className="font-semibold text-[#90278E]/80 mb-2">รหัสวิชา</h4>
                <Input
                  value={projectData.courseCode || ''} 
                  onChange={(e) => handleInputChange(e, 'courseCode')}
                  placeholder="รหัสวิชา เช่น CS101"
                  className="rounded-lg border-[#90278E]/30 hover:border-[#90278E] focus:border-[#90278E] transition-all"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.8)', 
                    boxShadow: '0 2px 6px rgba(144, 39, 142, 0.1)'
                  }}
                />
              </div>

              <div className="w-full">
                <h4 className="font-semibold text-[#90278E]/80 mb-2">ชื่อวิชา</h4>
                <Input
                  value={projectData.courseName || ''} 
                  onChange={(e) => handleInputChange(e, 'courseName')}
                  placeholder="ชื่อวิชา"
                  className="rounded-lg border-[#90278E]/30 hover:border-[#90278E] focus:border-[#90278E] transition-all"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.8)', 
                    boxShadow: '0 2px 6px rgba(144, 39, 142, 0.1)'
                  }}
                />
              </div>

              <div className="w-full">
                <h4 className="font-semibold text-[#90278E]/80 mb-2">อาจารย์ผู้สอน</h4>
                <Input
                  value={projectData.instructor || ''} 
                  onChange={(e) => handleInputChange(e, 'instructor')}
                  placeholder="ชื่ออาจารย์ผู้สอน"
                  className="rounded-lg border-[#90278E]/30 hover:border-[#90278E] focus:border-[#90278E] transition-all"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.8)', 
                    boxShadow: '0 2px 6px rgba(144, 39, 142, 0.1)'
                  }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Replaced 3 columns with 2 since video is now in the main section */}
                <label className="relative border-2 border-dashed border-[#90278E]/30 hover:border-[#90278E] rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer w-full h-40 group transition-all duration-300 overflow-hidden"
                       style={{ background: 'rgba(13, 2, 33, 0.05)' }}>
                  <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'courseworkPoster')} accept={allowedFileTypes.image.join(',')} />
                  {generateStarBackground()}
                  <div className="relative z-10 flex flex-col items-center">
                    {getIcon(projectData.courseworkPoster, 'image')}
                    <span className="text-[#90278E] text-sm font-medium text-center group-hover:text-[#FF5E8C] transition-colors">
                      {projectData.courseworkPoster ? projectData.courseworkPoster.name : 'อัปโหลด Poster การเรียน'}
                    </span>
                  </div>
                </label>
                
                <label className="relative border-2 border-dashed border-[#90278E]/30 hover:border-[#90278E] rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer w-full h-40 group transition-all duration-300 overflow-hidden"
                       style={{ background: 'rgba(13, 2, 33, 0.05)' }}>
                  <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'courseworkImage')} accept={allowedFileTypes.image.join(',')} />
                  {generateStarBackground()}
                  <div className="relative z-10 flex flex-col items-center">
                    {getIcon(projectData.courseworkImage, 'image')}
                    <span className="text-[#90278E] text-sm font-medium text-center group-hover:text-[#FF5E8C] transition-colors">
                      {projectData.courseworkImage ? projectData.courseworkImage.name : 'อัปโหลดภาพการเรียน'}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadSection;