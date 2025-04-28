import React from 'react';
import { Modal, Image, Button } from 'antd';
import { DownloadOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

/**
 * MediaViewer component for displaying media in a modal
 * 
 * @param {boolean} visible - Whether the modal is visible
 * @param {function} onClose - Function to call when closing the modal
 * @param {string} type - Type of media ('image', 'video', 'pdf')
 * @param {string} url - URL of the media to display
 * @param {string} title - Title to display in the modal
 */
const MediaViewer = ({ visible, onClose, type, url, title, projectType }) => {
  const { isAuthenticated } = useAuth();
  
  if (!url) return null;
  
  // ตรวจสอบว่าเป็นเอกสาร academic และผู้ใช้ยังไม่ได้ login หรือไม่
  const isRestrictedContent = type === 'pdf' && projectType === 'academic' && !isAuthenticated;

  // Render content based on media type
  const renderContent = () => {
    switch (type) {
      case 'image':
        return (
          <div className="flex justify-center items-center p-4 bg-gradient-to-b from-purple-50 to-white rounded-lg">
            <Image 
              src={url} 
              alt={title} 
              className="max-h-[80vh] object-contain rounded-md shadow-lg"
              preview={false}
            />
          </div>
        );
        
      case 'video':
        // Handle different video types (file vs embed)
        const isEmbedVideo = url.includes('youtube.com') || 
          url.includes('youtu.be') || 
          url.includes('facebook.com') || 
          url.includes('tiktok.com');
          
        if (isEmbedVideo) {
          return (
            <div className="relative w-full h-0 pb-[56.25%] overflow-hidden bg-black rounded-lg shadow-lg">
              <iframe 
                src={url}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full border-none rounded-lg"
              />
            </div>
          );
        } else {
          return (
            <div className="relative w-full h-0 pb-[56.25%] overflow-hidden bg-black rounded-lg shadow-lg">
              <video 
                controls 
                autoPlay
                src={url}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
              />
            </div>
          );
        }
        
      case 'pdf':
        if (isRestrictedContent) {
          return (
            <div className="py-16 px-4 text-center bg-gradient-to-b from-purple-50 to-white rounded-lg">
              <div className="mb-4 flex justify-center">
                <LockOutlined className="text-6xl text-[#90278E] opacity-70" />
              </div>
              <h3 className="text-xl font-semibold text-[#90278E] mb-3">เอกสารนี้ต้องการการเข้าสู่ระบบ</h3>
              <p className="text-gray-600 mb-4">เอกสารประเภทบทความวิชาการเข้าถึงได้เฉพาะผู้ใช้ที่ลงทะเบียนเท่านั้น</p>
              <p className="text-gray-500 text-sm mb-6">กรุณาเข้าสู่ระบบเพื่อดาวน์โหลดหรือเปิดดูเอกสาร</p>
              <Button 
                type="primary" 
                href="/login"
                className="bg-[#90278E] hover:bg-[#7b1f79] shadow-md transition-all"
                size="large"
              >
                เข้าสู่ระบบ
              </Button>
            </div>
          );
        }
        
        return (
          <div className="relative w-full h-0 pb-[100%] overflow-hidden bg-gradient-to-b from-purple-50 to-white rounded-lg shadow-lg">
            <iframe 
              src={`${url}#toolbar=0`} 
              title={title}
              className="absolute top-0 left-0 w-full h-full border-none rounded-lg"
            />
          </div>
        );
        
      default:
        if (isRestrictedContent) {
          return (
            <div className="py-16 px-4 text-center bg-gradient-to-b from-purple-50 to-white rounded-lg">
              <div className="mb-4 flex justify-center">
                <LockOutlined className="text-6xl text-[#90278E] opacity-70" />
              </div>
              <h3 className="text-xl font-semibold text-[#90278E] mb-3">เอกสารนี้ต้องการการเข้าสู่ระบบ</h3>
              <p className="text-gray-600 mb-4">เอกสารประเภทบทความวิชาการเข้าถึงได้เฉพาะผู้ใช้ที่ลงทะเบียนเท่านั้น</p>
              <p className="text-gray-500 text-sm mb-6">กรุณาเข้าสู่ระบบเพื่อดาวน์โหลดหรือเปิดดูเอกสาร</p>
              <Button 
                type="primary" 
                href="/login"
                className="bg-[#90278E] hover:bg-[#7b1f79] shadow-md transition-all"
                size="large"
              >
                เข้าสู่ระบบ
              </Button>
            </div>
          );
        }
        
        return (
          <div className="py-8 px-4 text-center bg-gradient-to-b from-purple-50 to-white rounded-lg">
            <p className="text-gray-600 mb-4">ไม่สามารถแสดงตัวอย่างได้ กรุณาคลิกที่ปุ่มเพื่อดาวน์โหลด</p>
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-[#90278E] text-white rounded-md hover:bg-[#7b1f79] transition-colors shadow-md"
            >
              <DownloadOutlined className="mr-2" /> ดาวน์โหลดไฟล์
            </a>
          </div>
        );
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      centered
      title={
        <div className="flex items-center">
          <span className="w-1 h-6 bg-[#90278E] mr-2 rounded inline-block"></span>
          <span className="text-[#90278E] font-semibold">{title}</span>
        </div>
      }
      className="media-modal"
      styles={{
        header: {
          borderBottom: '1px solid #f0e6fa',
          padding: '16px 24px'
        },
        body: {
          padding: '24px',
          background: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)'
        },
        mask: {
          backdropFilter: 'blur(2px)',
          background: 'rgba(0, 0, 0, 0.6)'
        },
        content: {
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(144, 39, 142, 0.15)'
        }
      }}
    >
      <div className="relative overflow-hidden">
        {/* Galaxy decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600 opacity-5 rounded-full blur-xl -mr-10 -mt-10 z-0"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-800 opacity-5 rounded-full blur-xl -ml-6 -mb-6 z-0"></div>
        
        <div className="relative z-10">
          {renderContent()}
        </div>
      </div>
    </Modal>
  );
};

export default MediaViewer;