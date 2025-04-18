import React from 'react';
import { Input, Select, DatePicker, Upload, Button, Tag, Tooltip } from 'antd';
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
  DeleteOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { PROJECT_TYPE } from '../../constants/projectTypes';
import moment from 'moment';

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
 * คอมโพเนนต์สำหรับแก้ไขไฟล์และข้อมูลโปรเจค
 */
const EditUploadSection = ({ 
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
  // Helper function to display file name from URL
  const getFileNameFromUrl = (url) => {
    if (!url) return '';
    try {
      // Extract file name from URL
      const fileName = url.split('/').pop().split('?')[0];
      // Decode URI components
      return decodeURIComponent(fileName);
    } catch (error) {
      return 'ไฟล์เดิม';
    }
  };

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
        {/* Cover Image Upload - Always shown for all categories */}
        <div className="relative">
          <h4 className="font-semibold text-[#90278E] mb-2 flex items-center">
            <FileImageOutlined className="mr-2" />
            ภาพหน้าปก
            {projectData.existingFiles.coverImage && (
              <Tag color="success" className="ml-2 flex items-center">
                <CheckCircleOutlined className="mr-1" /> มีไฟล์เดิม
              </Tag>
            )}
          </h4>
          
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
            
            {/* Display existing image thumbnail if available */}
            {projectData.existingFiles.coverImage && !projectData.coverImage && (
              <div className="w-full h-full relative flex flex-col items-center justify-center">
                <div className="w-24 h-24 mb-2 rounded overflow-hidden border-2 border-[#90278E]/30">
                  <img 
                    src={projectData.existingFiles.coverImage} 
                    alt="Cover" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[#90278E] font-medium text-center group-hover:text-[#FF5E8C] transition-colors text-sm">
                  คลิกเพื่อเปลี่ยนภาพหน้าปก
                </span>
              </div>
            )}
            
            {/* Upload icon and text for new file selection */}
            {(!projectData.existingFiles.coverImage || projectData.coverImage) && (
              <div className="relative z-10 flex flex-col items-center transform group-hover:scale-110 transition-transform duration-300">
                <FileImageOutlined className="text-[#90278E] text-5xl mb-2" />
                <span className="text-[#90278E] font-medium text-center group-hover:text-[#FF5E8C] transition-colors">
                  {projectData.coverImage ? projectData.coverImage.name : 'อัปโหลดภาพหน้าปก'}
                </span>
                
                {/* Small glowing dot */}
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FF5E8C] opacity-70 group-hover:opacity-100 group-hover:animate-ping"></div>
              </div>
            )}
            
            {/* Decorative planet */}
            <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full bg-gradient-to-br from-[#90278E]/20 to-[#0D0221]/20 blur-md opacity-40 group-hover:opacity-70 transition-opacity"></div>
          </label>
        </div>
        
        {/* Poster Image Upload */}
        <div className="relative">
          <h4 className="font-semibold text-[#90278E] mb-2 flex items-center">
            <FileImageOutlined className="mr-2" />
            ภาพ Poster
            {projectData.existingFiles.posterImage && (
              <Tag color="success" className="ml-2 flex items-center">
                <CheckCircleOutlined className="mr-1" /> มีไฟล์เดิม
              </Tag>
            )}
          </h4>
          
          <label className="relative border-2 border-dashed border-[#90278E]/30 hover:border-[#90278E] rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer w-full h-44 group transition-all duration-300 overflow-hidden"
                 style={{ 
                   background: 'rgba(13, 2, 33, 0.05)',
                 }}>
            <input 
              type="file" 
              className="hidden" 
              onChange={(e) => handleFileChange(e, 'posterImage')} 
              accept={allowedFileTypes.image.join(',')} 
            />
            
            {/* Star background */}
            {generateStarBackground()}
            
            {/* Display existing image thumbnail if available */}
            {projectData.existingFiles.posterImage && !projectData.posterImage && (
              <div className="w-full h-full relative flex flex-col items-center justify-center">
                <div className="w-24 h-24 mb-2 rounded overflow-hidden border-2 border-[#90278E]/30">
                  <img 
                    src={projectData.existingFiles.posterImage} 
                    alt="Poster" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[#90278E] font-medium text-center group-hover:text-[#FF5E8C] transition-colors text-sm">
                  คลิกเพื่อเปลี่ยนภาพ Poster
                </span>
              </div>
            )}
            
            {/* Upload icon and text for new file selection */}
            {(!projectData.existingFiles.posterImage || projectData.posterImage) && (
              <div className="relative z-10 flex flex-col items-center transform group-hover:scale-110 transition-transform duration-300">
                <FileImageOutlined className="text-[#90278E] text-5xl mb-2" />
                <span className="text-[#90278E] font-medium text-center group-hover:text-[#FF5E8C] transition-colors">
                  {projectData.posterImage ? projectData.posterImage.name : 'อัปโหลดภาพ Poster'}
                </span>
                
                {/* Small glowing dot */}
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FF5E8C] opacity-70 group-hover:opacity-100 group-hover:animate-ping"></div>
              </div>
            )}
            
            {/* Decorative planet */}
            <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-gradient-to-br from-[#90278E]/20 to-[#0D0221]/20 blur-md opacity-40 group-hover:opacity-70 transition-opacity"></div>
          </label>
        </div>
        
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
            {projectData.existingFiles.pdfFiles && projectData.existingFiles.pdfFiles.length > 0 && (
              <Tag color="success" className="ml-2 flex items-center">
                <CheckCircleOutlined className="mr-1" /> มีไฟล์เดิม {projectData.existingFiles.pdfFiles.length} ไฟล์
              </Tag>
            )}
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
                เพิ่มไฟล์ PDF ใหม่
              </span>
            </div>
          </label>
          
          {/* Display existing PDFs */}
          {(projectData.existingFiles.pdfFiles && projectData.existingFiles.pdfFiles.length > 0) && (
            <div className="mt-4 space-y-3">
              <h5 className="font-medium text-[#90278E]">เอกสารที่มีอยู่เดิม</h5>
              {projectData.existingFiles.pdfFiles.map((pdf, index) => (
                <div 
                  key={`existing-${index}`} 
                  className="flex items-center justify-between bg-white/70 p-3 rounded-lg border border-[#90278E]/20 group hover:border-[#90278E] transition-all"
                >
                  <div className="flex items-center">
                    <FileTextOutlined className="text-[#90278E] text-xl mr-3" />
                    <span>{pdf.name || getFileNameFromUrl(pdf.url)}</span>
                  </div>
                  <div className="flex items-center">
                    <Tooltip title="ดูตัวอย่าง">
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        href={pdf.url}
                        target="_blank"
                        className="opacity-50 group-hover:opacity-100 transition-opacity"
                      />
                    </Tooltip>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemovePdf(index, true)} 
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ลบ
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Display newly added PDFs */}
          {projectData.pdfFiles && projectData.pdfFiles.length > 0 && (
            <div className="mt-4 space-y-3">
              <h5 className="font-medium text-[#90278E]">เอกสารที่เพิ่มใหม่</h5>
              {projectData.pdfFiles.map((pdf, index) => (
                <div 
                  key={`new-${index}`} 
                  className="flex items-center justify-between bg-white/70 p-3 rounded-lg border border-[#90278E]/20 group hover:border-[#90278E] transition-all"
                >
                  <div className="flex items-center">
                    <FileTextOutlined className="text-[#90278E] text-xl mr-3" />
                    <span>{pdf.name}</span>
                    <Tag color="processing" className="ml-2">ใหม่</Tag>
                  </div>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemovePdf(index, false)} 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ลบ
                  </Button>
                </div>
              ))}
            </div>
          )}
          
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
                    value={projectData.publicationDate ? moment(projectData.publicationDate) : null}
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
              
              {/* Competition specific fields */}
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

              {/* Competition Poster */}
              {projectData.existingFiles.competitionPoster && (
                <div className="w-full mt-4">
                  <h4 className="font-semibold text-[#90278E]/80 mb-2 flex items-center">
                    <FileImageOutlined className="mr-2" />
                    โปสเตอร์การแข่งขัน
                    <Tag color="success" className="ml-2 flex items-center">
                      <CheckCircleOutlined className="mr-1" /> มีไฟล์เดิม
                    </Tag>
                  </h4>
                  
                  <label className="relative border-2 border-dashed border-[#90278E]/30 hover:border-[#90278E] rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer w-full h-40 group transition-all duration-300 overflow-hidden"
                         style={{ background: 'rgba(13, 2, 33, 0.05)' }}>
                    <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'competitionPoster')} accept={allowedFileTypes.image.join(',')} />
                    
                    {/* Display existing image */}
                    {!projectData.competitionPoster && (
                      <div className="w-full h-full relative flex flex-col items-center justify-center">
                        <div className="w-20 h-20 mb-2 rounded overflow-hidden border-2 border-[#90278E]/30">
                          <img 
                            src={projectData.existingFiles.competitionPoster} 
                            alt="Competition Poster" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[#90278E] font-medium text-center group-hover:text-[#FF5E8C] transition-colors text-sm">
                          คลิกเพื่อเปลี่ยนโปสเตอร์การแข่งขัน
                        </span>
                      </div>
                    )}
                    
                    {/* Display upload icon for new file */}
                    {projectData.competitionPoster && (
                      <div className="flex flex-col items-center">
                        <FileImageOutlined className="text-[#90278E] text-3xl mb-2" />
                        <span className="text-[#90278E] text-sm font-medium text-center group-hover:text-[#FF5E8C] transition-colors">
                          {projectData.competitionPoster.name}
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              )}
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
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                {/* Coursework Poster */}
                {projectData.existingFiles.courseworkPoster && (
                  <div className="w-full">
                    <h4 className="font-semibold text-[#90278E]/80 mb-2 flex items-center">
                      <FileImageOutlined className="mr-2" />
                      โปสเตอร์การเรียน
                      <Tag color="success" className="ml-2 flex items-center">
                        <CheckCircleOutlined className="mr-1" /> มีไฟล์เดิม
                      </Tag>
                    </h4>
                    
                    <label className="relative border-2 border-dashed border-[#90278E]/30 hover:border-[#90278E] rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer w-full h-32 group transition-all duration-300 overflow-hidden"
                           style={{ background: 'rgba(13, 2, 33, 0.05)' }}>
                      <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'courseworkPoster')} accept={allowedFileTypes.image.join(',')} />
                      
                      {/* Display existing poster */}
                      {!projectData.courseworkPoster && (
                        <div className="w-full h-full relative flex flex-col items-center justify-center">
                          <div className="w-16 h-16 mb-2 rounded overflow-hidden border-2 border-[#90278E]/30">
                            <img 
                              src={projectData.existingFiles.courseworkPoster} 
                              alt="Coursework Poster" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-[#90278E] text-xs font-medium text-center group-hover:text-[#FF5E8C] transition-colors">
                            คลิกเพื่อเปลี่ยนโปสเตอร์
                          </span>
                        </div>
                      )}
                      
                      {/* Display upload icon for new file */}
                      {projectData.courseworkPoster && (
                        <div className="flex flex-col items-center">
                          <FileImageOutlined className="text-[#90278E] text-3xl mb-1" />
                          <span className="text-[#90278E] text-xs font-medium text-center group-hover:text-[#FF5E8C] transition-colors">
                            {projectData.courseworkPoster.name}
                          </span>
                        </div>
                      )}
                    </label>
                  </div>
                )}
                
                {/* Coursework Image */}
                {projectData.existingFiles.courseworkImage && (
                  <div className="w-full">
                    <h4 className="font-semibold text-[#90278E]/80 mb-2 flex items-center">
                      <FileImageOutlined className="mr-2" />
                      ภาพการเรียน
                      <Tag color="success" className="ml-2 flex items-center">
                        <CheckCircleOutlined className="mr-1" /> มีไฟล์เดิม
                      </Tag>
                    </h4>
                    
                    <label className="relative border-2 border-dashed border-[#90278E]/30 hover:border-[#90278E] rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer w-full h-32 group transition-all duration-300 overflow-hidden"
                           style={{ background: 'rgba(13, 2, 33, 0.05)' }}>
                      <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'courseworkImage')} accept={allowedFileTypes.image.join(',')} />
                      
                      {/* Display existing image */}
                      {!projectData.courseworkImage && (
                        <div className="w-full h-full relative flex flex-col items-center justify-center">
                          <div className="w-16 h-16 mb-2 rounded overflow-hidden border-2 border-[#90278E]/30">
                            <img 
                              src={projectData.existingFiles.courseworkImage} 
                              alt="Coursework Image" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-[#90278E] text-xs font-medium text-center group-hover:text-[#FF5E8C] transition-colors">
                            คลิกเพื่อเปลี่ยนภาพ
                          </span>
                        </div>
                      )}
                      
                      {/* Display upload icon for new file */}
                      {projectData.courseworkImage && (
                        <div className="flex flex-col items-center">
                          <FileImageOutlined className="text-[#90278E] text-3xl mb-1" />
                          <span className="text-[#90278E] text-xs font-medium text-center group-hover:text-[#FF5E8C] transition-colors">
                            {projectData.courseworkImage.name}
                          </span>
                        </div>
                      )}
                    </label>
                  </div>
                )}
              </div>
              
              {/* Coursework Video */}
              {projectData.existingFiles.courseworkVideo && (
                <div className="w-full mt-4">
                  <h4 className="font-semibold text-[#90278E]/80 mb-2 flex items-center">
                    <VideoCameraOutlined className="mr-2" />
                    วิดีโอการเรียน
                    <Tag color="success" className="ml-2 flex items-center">
                      <CheckCircleOutlined className="mr-1" /> มีไฟล์เดิม
                    </Tag>
                  </h4>
                  
                  <label className="relative border-2 border-dashed border-[#90278E]/30 hover:border-[#90278E] rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer w-full h-32 group transition-all duration-300 overflow-hidden"
                         style={{ background: 'rgba(13, 2, 33, 0.05)' }}>
                    <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'courseworkVideo')} accept={allowedFileTypes.video.join(',')} />
                    
                    {/* Display existing video info */}
                    {!projectData.courseworkVideo && (
                      <div className="flex flex-col items-center">
                        <VideoCameraOutlined className="text-[#90278E] text-3xl mb-2" />
                        <span className="text-[#90278E] text-sm font-medium text-center group-hover:text-[#FF5E8C] transition-colors">
                          คลิกเพื่อเปลี่ยนวิดีโอการเรียน
                        </span>
                        <span className="text-gray-500 text-xs mt-1">
                          {getFileNameFromUrl(projectData.existingFiles.courseworkVideo)}
                        </span>
                      </div>
                    )}
                    
                    {/* Display upload icon for new file */}
                    {projectData.courseworkVideo && (
                      <div className="flex flex-col items-center">
                        <VideoCameraOutlined className="text-[#90278E] text-3xl mb-1" />
                        <span className="text-[#90278E] text-sm font-medium text-center group-hover:text-[#FF5E8C] transition-colors">
                          {projectData.courseworkVideo.name}
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditUploadSection;