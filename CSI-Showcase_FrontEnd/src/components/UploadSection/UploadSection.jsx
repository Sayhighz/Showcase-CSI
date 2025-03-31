import React from 'react';
import { CloudUploadOutlined, FileImageOutlined, VideoCameraOutlined, LinkOutlined } from '@ant-design/icons';
import { message, Input, DatePicker } from 'antd';

const UploadSection = ({ projectData, setProjectData }) => {
  if (!projectData.category) return null; // Return null if project category is not set

  // Handle file input change
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setProjectData((prev) => ({ ...prev, [type]: file }));
      message.success(`${file.name} อัปโหลดสำเร็จ`);
    }
  };

  // Handle video link input change
  const handleVideoLinkChange = (e) => {
    setProjectData((prev) => ({ ...prev, videoLink: e.target.value }));
  };

  // Handle academic paper publication date change
  const handlePublicationDateChange = (date) => {
    setProjectData((prev) => ({ ...prev, publicationDate: date }));
  };

  // Handle the competition name change
  const handleCompetitionNameChange = (e) => {
    setProjectData((prev) => ({ ...prev, competitionName: e.target.value }));
  };

  // Handle competition year change
  const handleCompetitionYearChange = (e) => {
    setProjectData((prev) => ({ ...prev, competitionYear: e.target.value }));
  };

  // Handle study year input change
  const handleStudyYearChange = (e) => {
    setProjectData((prev) => ({ ...prev, study_year: e.target.value }));
  };

  // Handle semester input change
  const handleSemesterChange = (e) => {
    setProjectData((prev) => ({ ...prev, semester: e.target.value }));
  };

  // Get the icon for file inputs based on type
  const getIcon = (file, type) => {
    if (!file) return <CloudUploadOutlined className="text-[#90278E] text-5xl mb-2" />;
    if (type === 'videoFile' || type === 'videoLink') return <VideoCameraOutlined className="text-green-600 text-5xl mb-2" />;
    return <FileImageOutlined className="text-blue-600 text-5xl mb-2" />;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">อัปโหลดข้อมูล</h3>
      <div className="grid grid-cols-2 gap-4">
        {/* Study Year Input */}
        <div className="w-full">
          <h4 className="font-semibold">ปีการศึกษา</h4>
          <Input 
            type="number"
            value={projectData.study_year || ''} 
            onChange={handleStudyYearChange}
            placeholder="กรอกปีการศึกษา"
          />
        </div>

        {/* Semester Input */}
        <div className="w-full">
          <h4 className="font-semibold">ภาคการศึกษา</h4>
          <Input 
            type="number"
            value={projectData.semester || ''} 
            onChange={handleSemesterChange}
            placeholder="กรอกภาคการศึกษา"
          />
        </div>

        {/* Cover Image Upload */}
        <label className="border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer w-full h-40 shadow-md">
          <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'coverImage')} />
          {getIcon(projectData.coverImage, 'image')}
          <span className="text-gray-700 font-medium text-center">
            {projectData.coverImage ? projectData.coverImage.name : 'อัปโหลดภาพหน้าปก'}
          </span>
        </label>
        
        {/* Poster Image Upload */}
        <label className="border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer w-full h-40 shadow-md">
          <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'posterImage')} />
          {getIcon(projectData.posterImage, 'image')}
          <span className="text-gray-700 font-medium text-center">
            {projectData.posterImage ? projectData.posterImage.name : 'อัปโหลดภาพ Poster'}
          </span>
        </label>
        
        {/* Video Link Input */}
        <div className="border rounded-lg p-6 flex flex-col items-center justify-center w-full h-40 shadow-md col-span-2">
          <LinkOutlined className="text-blue-500 text-5xl mb-2" />
          <Input 
            placeholder="วางลิงก์วิดีโอจาก YouTube, Facebook, TikTok" 
            value={projectData.videoLink || ''} 
            onChange={handleVideoLinkChange} 
            className="text-center"
          />
        </div>

        {/* Academic Paper Fields (Only shown for academic projects) */}
        {projectData.category === 'academic' && (
          <div className="col-span-2">
            <div className="flex space-x-4">
              <div className="w-1/2">
                <h4 className="font-semibold">วันที่เผยแพร่</h4>
                <DatePicker
                  className="w-full"
                  value={projectData.publicationDate}
                  onChange={handlePublicationDateChange}
                  placeholder="เลือกวันที่เผยแพร่"
                />
              </div>
              <div className="w-1/2">
                <h4 className="font-semibold">ปีที่เผยแพร่</h4>
                <Input 
                  type="number" 
                  value={projectData.publishedYear || ''} 
                  onChange={(e) => setProjectData({ ...projectData, publishedYear: e.target.value })}
                  placeholder="ปีที่เผยแพร่"
                />
              </div>
            </div>
          </div>
        )}

        {/* Competition Fields (Only shown for competition projects) */}
        {projectData.category === 'competition' && (
          <div className="col-span-2">
            <div className="flex space-x-4">
              <div className="w-1/2">
                <h4 className="font-semibold">ชื่อการแข่งขัน</h4>
                <Input 
                  value={projectData.competitionName || ''} 
                  onChange={handleCompetitionNameChange} 
                  placeholder="ชื่อการแข่งขัน"
                />
              </div>
              <div className="w-1/2">
                <h4 className="font-semibold">ปีที่แข่งขัน</h4>
                <Input 
                  type="number"
                  value={projectData.competitionYear || ''} 
                  onChange={handleCompetitionYearChange} 
                  placeholder="ปีที่แข่งขัน"
                />
              </div>
            </div>
            <label className="border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer w-full h-40 shadow-md mt-4">
              <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'competitionPoster')} />
              {getIcon(projectData.competitionPoster, 'image')}
              <span className="text-gray-700 font-medium text-center">
                {projectData.competitionPoster ? projectData.competitionPoster.name : 'อัปโหลด Poster การแข่งขัน'}
              </span>
            </label>
          </div>
        )}

        {/* Coursework Fields (Only shown for coursework projects) */}
        {projectData.category === 'coursework' && (
          <div className="col-span-2">
            <div className="flex space-x-4">
              <div className="w-1/3">
                <label className="font-semibold">Poster</label>
                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'courseworkPoster')} />
                {getIcon(projectData.courseworkPoster, 'image')}
                <span className="text-gray-700 font-medium text-center">
                  {projectData.courseworkPoster ? projectData.courseworkPoster.name : 'อัปโหลด Poster การเรียน'}
                </span>
              </div>
              <div className="w-1/3">
                <label className="font-semibold">Video</label>
                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'courseworkVideo')} />
                {getIcon(projectData.courseworkVideo, 'videoFile')}
                <span className="text-gray-700 font-medium text-center">
                  {projectData.courseworkVideo ? projectData.courseworkVideo.name : 'อัปโหลดวีดีโอการเรียน'}
                </span>
              </div>
              <div className="w-1/3">
                <label className="font-semibold">Image</label>
                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'courseworkImage')} />
                {getIcon(projectData.courseworkImage, 'image')}
                <span className="text-gray-700 font-medium text-center">
                  {projectData.courseworkImage ? projectData.courseworkImage.name : 'อัปโหลดภาพการเรียน'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadSection;
