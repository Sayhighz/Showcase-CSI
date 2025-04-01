import React from 'react';
import { Avatar } from 'antd';
import { FileTextOutlined, UserOutlined } from '@ant-design/icons';
import { getEmbedUrl } from './utils/helpers';

const PreviewSection = ({ projectData, previewUrls, selectedContributors }) => {
  // Helper function to get display images
  const getDisplayImages = () => {
    const images = [];
    
    if (previewUrls.coverImage) images.push(previewUrls.coverImage);
    if (previewUrls.posterImage) images.push(previewUrls.posterImage);
    
    // Add category-specific images
    if (projectData.category === 'competition' && previewUrls.competitionPoster) {
      images.push(previewUrls.competitionPoster);
    }
    
    if (projectData.category === 'coursework') {
      if (previewUrls.courseworkPoster) images.push(previewUrls.courseworkPoster);
      if (previewUrls.courseworkImage) images.push(previewUrls.courseworkImage);
    }
    
    return images;
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-[#90278E] relative inline-block">
          ตัวอย่างผลงาน
          <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#90278E] via-[#FF5E8C] to-transparent"></span>
        </h3>
      </div>
      
      {/* Space-themed preview container */}
      <div className="flex-grow relative rounded-2xl overflow-hidden shadow-xl border border-[#90278E]/30"
           style={{
             background: 'linear-gradient(to bottom, rgba(13, 2, 33, 0.6), rgba(13, 2, 33, 0.9))',
             boxShadow: '0 10px 30px -5px rgba(144, 39, 142, 0.3)'
           }}>
        {/* Space background with stars and nebula effect */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-40">
          {/* Stars */}
          {Array.from({ length: 30 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute w-1 h-1 rounded-full bg-white" 
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.7 + 0.3,
                boxShadow: '0 0 3px rgba(255, 255, 255, 0.8)'
              }}
            ></div>
          ))}
          
          {/* Nebula effects */}
          <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-[#90278E]/20 blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/3 w-40 h-40 rounded-full bg-[#FF5E8C]/10 blur-3xl"></div>
        </div>
        
        {/* Main preview content */}
        <div className="relative z-10 max-w-2xl mx-auto mt-6 p-6 rounded-xl"
             style={{
               background: 'rgba(255, 255, 255, 0.1)',
               backdropFilter: 'blur(5px)',
               border: '1px solid rgba(144, 39, 142, 0.3)',
             }}>
          
          {/* Image Preview Section */}
          {getDisplayImages().length > 0 && (
            <div className="relative h-60 mb-6 overflow-hidden rounded-lg flex items-center justify-center bg-[#0D0221]">
              <img 
                src={getDisplayImages()[0]} 
                alt="Preview" 
                className="max-h-full max-w-full object-contain"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(144, 39, 142, 0.6))'
                }}
              />
              
              {/* Decorative elements */}
              <div className="absolute inset-0 z-0 opacity-30">
                <div className="absolute top-2 left-2 w-10 h-10 rounded-full bg-[#FF5E8C] blur-lg"></div>
                <div className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#90278E] blur-xl"></div>
              </div>
            </div>
          )}
          
          {/* Video Preview Section */}
          {projectData.videoLink && (
            <div className="relative h-60 mb-6 overflow-hidden rounded-lg">
              <iframe
                src={getEmbedUrl(projectData.videoLink)}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg"
              ></iframe>
            </div>
          )}
          
          {/* Title & Description */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#90278E] mb-2">
              {projectData.title || "ชื่อผลงาน"}
            </h2>
            <p className="text-white/80 text-sm">
              {new Date().toLocaleDateString('th-TH')}
            </p>
          </div>
          
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm mb-4">
            <p className="text-white/90">
              {projectData.description || "รายละเอียดผลงานจะแสดงที่นี่"}
            </p>
          </div>
          
          {/* Contributors Preview */}
          {selectedContributors.length > 0 && (
            <div className="mt-6">
              <h3 className="text-center text-white text-lg mb-4">ผู้จัดทำ</h3>
              <div className="flex justify-center flex-wrap gap-3">
                {selectedContributors.map((contributor, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <Avatar 
                      size={40}
                      src={contributor.image} 
                      icon={!contributor.image && <UserOutlined />}
                      className="border-2 border-[#90278E]"
                    />
                    <p className="text-xs text-white mt-1">{contributor.fullName}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* PDF Files Preview */}
          {previewUrls.pdfFiles && previewUrls.pdfFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-white font-semibold mb-2">เอกสาร PDF:</h4>
              <ul className="space-y-2">
                {previewUrls.pdfFiles.map((pdf, index) => (
                  <li key={index} className="bg-white/10 px-3 py-2 rounded flex items-center">
                    <FileTextOutlined className="text-[#FF5E8C] mr-2" />
                    <span className="text-white text-sm">{pdf.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Empty state with space theme */}
        {!projectData.title && !projectData.description && getDisplayImages().length === 0 && !projectData.videoLink && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 p-10 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#90278E] to-[#0D0221] flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-lg">เพิ่มข้อมูลผลงานเพื่อดูตัวอย่าง</p>
            <p className="text-sm opacity-70 mt-1">ภาพ ข้อมูล และไฟล์ที่เพิ่มจะปรากฏที่นี่</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewSection;