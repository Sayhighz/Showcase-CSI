import React from 'react';
import { CloudUploadOutlined, FileImageOutlined, VideoCameraOutlined, LinkOutlined } from '@ant-design/icons';
import { message, Input } from 'antd';

const UploadSection = ({ projectData, setProjectData }) => {
  if (!projectData.category) return null;

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setProjectData((prev) => ({ ...prev, [type]: file }));
      message.success(`${file.name} อัปโหลดสำเร็จ`);
    }
  };

  const handleVideoLinkChange = (e) => {
    setProjectData((prev) => ({ ...prev, videoLink: e.target.value }));
  };

  const getIcon = (file, type) => {
    if (!file) return <CloudUploadOutlined className="text-[#90278E] text-5xl mb-2" />;
    if (type === 'videoFile' || type === 'videoLink') return <VideoCameraOutlined className="text-green-600 text-5xl mb-2" />;
    return <FileImageOutlined className="text-blue-600 text-5xl mb-2" />;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">อัปโหลดรูปภาพ</h3>
      <div className="grid grid-cols-2 gap-4">
        {/* Cover Image Upload */}
        <label className="border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer w-full h-40 shadow-md">
          <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'coverImage')} />
          {getIcon(projectData.coverImage, 'image')}
          <span className="text-gray-700 font-medium text-center">
            {projectData.coverImage ? projectData.coverImage.name : 'อัปโหลดภาพหน้าปก'}
          </span>
          <span className="text-gray-400 text-sm">ขนาด 77 x 77</span>
        </label>
        
        {/* Poster Image Upload */}
        <label className="border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer w-full h-40 shadow-md">
          <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'posterImage')} />
          {getIcon(projectData.posterImage, 'image')}
          <span className="text-gray-700 font-medium text-center">
            {projectData.posterImage ? projectData.posterImage.name : 'อัปโหลดภาพ Poster'}
          </span>
          <span className="text-gray-400 text-sm">ขนาด 77 x 77</span>
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
      </div>
    </div>
  );
};

export default UploadSection;