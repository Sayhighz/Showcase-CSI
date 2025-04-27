import React, { useState, useEffect } from 'react';
import { FilePdfOutlined, PlayCircleOutlined, FileImageOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Tooltip, Button } from 'antd';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';

/**
 * ImageSlider component สำหรับแสดงรูปภาพ, วิดีโอ และไฟล์ PDF
 * พร้อมเอฟเฟกต์แบบอวกาศที่สวยงามและใช้งานง่าย
 * 
 * @param {Object} props - Props ของ component
 * @param {Array} props.images - รายการ path ของรูปภาพ
 * @param {string} props.video - URL ของวิดีโอ (ถ้ามี)
 * @param {Object} props.pdfFile - ข้อมูลของไฟล์ PDF (ถ้ามี)
 * @param {string} props.title - ชื่อของสไลด์
 * @returns {JSX.Element} ImageSlider component
 */
const ImageSlider = ({ images = [], video, pdfFile, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  // คำนวณจำนวนสไลด์ทั้งหมด
  const totalSlides = images.length + (video ? 1 : 0) + (pdfFile ? 1 : 0);
  
  // ตัวช่วยแปลง URL วิดีโอให้อยู่ในรูปแบบ embed
  const getEmbedUrl = (url) => {
    if (!url) return null;
    
    // YouTube links
    if (url.includes('youtube.com/watch')) {
      return url.replace("watch?v=", "embed/");
    }
    
    // YouTube short links
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // TikTok links
    if (url.includes('tiktok.com')) {
      // ถ้าเป็น URL ธรรมดา ให้แปลงเป็น embed URL
      if (!url.includes('/embed/')) {
        const videoId = url.split('/').pop();
        return `https://www.tiktok.com/embed/${videoId}`;
      }
      return url;
    }
    
    // Facebook links
    if (url.includes('facebook.com/watch')) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
    }
    
    return url;
  };

  // แปลง URL วิดีโอเป็นรูปแบบ embed
  const embeddedVideo = video ? getEmbedUrl(video) : null;

  // ฟังก์ชันเปลี่ยนสไลด์
  const handleNext = () => {
    setIsLoading(true);
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };
  
  const handlePrev = () => {
    setIsLoading(true);
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };
  
  // ฟังก์ชันสำหรับ swipe บนอุปกรณ์มือถือ
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // swipe left, show next slide
      handleNext();
    }
    
    if (touchEnd - touchStart > 75) {
      // swipe right, show previous slide
      handlePrev();
    }
  };
  
  // เปลี่ยนสไลด์อัตโนมัติ
  useEffect(() => {
    let interval;
    
    // ถ้าเปิดใช้งาน autoPlay และมีรูปภาพมากกว่า 1 รูป
    if (autoPlay && totalSlides > 1) {
      interval = setInterval(() => {
        // ไม่ต้องเปลี่ยนสไลด์อัตโนมัติถ้ากำลังดูวิดีโอหรือ PDF
        if (currentIndex < images.length) {
          handleNext();
        }
      }, 5000); // เปลี่ยนสไลด์ทุก 5 วินาที
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoPlay, currentIndex, images.length, totalSlides]);
  
  // เพิ่ม effect เมื่อโหลดรูปภาพเสร็จ
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [currentIndex]);

  // ดักฟังการกดปุ่มลูกศรบนคีย์บอร์ด
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // แสดงข้อความถ้าไม่มีรูปภาพหรือสื่อใดๆ
  if (totalSlides === 0) {
    return (
      <div className="relative w-full max-w-2xl mx-auto">
        <div className="h-80 flex items-center justify-center bg-gradient-to-b from-[#0D0221]/90 to-[#0D0221]/70 rounded-lg border border-[#90278E]/30 shadow-lg overflow-hidden">
          <div className="text-center text-white p-4 relative z-10">
            <FileImageOutlined className="text-5xl text-[#FF5E8C] mb-3" />
            <p className="text-lg">ไม่มีรูปภาพหรือสื่อสำหรับโปรเจคนี้</p>
            <p className="text-sm text-white/60 mt-2">ยังไม่มีการอัพโหลดสื่อใดๆ สำหรับโปรเจคนี้</p>
          </div>
          
          {/* Decorative stars */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${2 + Math.random() * 3}s`,
                opacity: Math.random() * 0.7 + 0.3
              }}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Main slider container with touch events */}
      <div 
        className="overflow-hidden relative h-80 flex items-center justify-center bg-gradient-to-b from-[#0D0221]/90 to-[#0D0221]/70 rounded-lg border border-[#90278E]/30 shadow-lg shadow-[#90278E]/20" 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          backgroundImage: `
            radial-gradient(circle, rgba(54, 16, 74, 0.3) 1px, transparent 1px), 
            radial-gradient(circle, rgba(255, 255, 255, 0.9) 0.5px, transparent 0.5px)
          `,
          backgroundSize: '100px 100px, 50px 50px',
          backgroundPosition: '0 0, 25px 25px'
        }}
      >
        {/* Counter indicator with improved styling */}
        <div className="absolute top-3 right-3 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-20 backdrop-blur-sm flex items-center space-x-1 shadow-md">
          <span className="font-medium">{currentIndex + 1}</span>
          <span className="text-white/70">/</span>
          <span className="text-white/70">{totalSlides}</span>
        </div>
        
        {/* Help tooltip for keyboard navigation */}
        <div className="absolute top-3 left-3 z-20">
          <Tooltip title="ใช้ปุ่มลูกศรซ้าย-ขวาเพื่อนำทาง">
            <div className="bg-black/50 text-white/80 px-3 py-1 rounded-full text-xs backdrop-blur-sm cursor-help">
              <span>⌨️ คำแนะนำ</span>
            </div>
          </Tooltip>
        </div>

        {/* Animated stars background */}
        <div className="absolute inset-0 z-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${2 + Math.random() * 3}s`,
                opacity: Math.random() * 0.7 + 0.3
              }}
            ></div>
          ))}
        </div>
      
        {currentIndex === images.length && embeddedVideo ? (
          // Video slide with improved layout
          <div className="relative w-full h-full z-10 flex items-center justify-center p-1">
            <div className="w-full h-full relative rounded-md overflow-hidden border border-[#90278E]/30">
              <iframe
                src={embeddedVideo}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                title={`${title} - วิดีโอ`}
                loading="lazy"
              ></iframe>
              
              {/* Decorative element */}
              <div className="absolute inset-0 pointer-events-none border-2 border-[#FF5E8C]/0 hover:border-[#FF5E8C]/20 transition-colors duration-700 rounded"></div>
            </div>
            
            {/* Video Label */}
            <div className="absolute bottom-3 left-3 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm flex items-center">
              <PlayCircleOutlined className="mr-1 text-[#FF5E8C]" /> วิดีโอ
            </div>
          </div>
        ) : currentIndex === images.length + (video ? 1 : 0) && pdfFile ? (
          // PDF slide with improved layout
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#0D0221]/60 p-4 rounded-lg backdrop-blur-sm z-10">
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm border border-white/20 flex flex-col items-center justify-center">
              <FilePdfOutlined className="text-[#FF5E8C] text-6xl mb-3 animate-pulse" style={{ animationDuration: '2s' }} />
              <p className="text-white font-medium text-center">{pdfFile.name || 'เอกสาร PDF'}</p>
              <p className="mt-1 text-white/60 text-sm text-center mb-4">{pdfFile.size ? `ขนาด: ${Math.round(pdfFile.size / 1024)} KB` : ''}</p>
              
              <a 
                href={typeof pdfFile === 'string' ? pdfFile : pdfFile.path} 
                target="_blank" 
                download
                rel="noopener noreferrer"
                className="px-6 py-2 bg-gradient-to-r from-[#90278E] to-[#FF5E8C] text-white rounded-full font-medium hover:opacity-90 transition-opacity shadow-lg flex items-center"
              >
                <FilePdfOutlined className="mr-2" /> ดาวน์โหลดเอกสาร
              </a>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute inset-0 z-0">
              <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-[#90278E]/10 blur-3xl"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-[#FF5E8C]/10 blur-3xl"></div>
            </div>
          </div>
        ) : (
          // Image slides with improved loading state and transitions
          images.map((image, index) => (
            <div 
              key={index} 
              className={`absolute w-full h-full flex items-center justify-center transition-all duration-700 ease-in-out ${
                index === currentIndex ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0'
              }`}
            >
              {isLoading && index === currentIndex ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-12 h-12 border-t-2 border-b-2 border-[#FF5E8C] rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center p-3">
                  <img
                    src={image.startsWith('http') ? image : `${API_ENDPOINTS.BASE}${image}`}
                    alt={`${title} - ภาพที่ ${index + 1}`}
                    className={`max-w-full max-h-full object-contain rounded-md z-10 transition-all duration-700 ease-in-out ${
                      index === currentIndex ? 'scale-100' : 'scale-95'
                    }`}
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(144, 39, 142, 0.4))'
                    }}
                    onLoad={() => setIsLoading(false)}
                    loading="lazy"
                  />
                  
                  {/* Caption for image */}
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/50 text-white/90 px-4 py-1 rounded-full text-sm backdrop-blur-sm z-20">
                    ภาพที่ {index + 1}
                  </div>
                </div>
              )}
              
              {/* Decorative elements for images */}
              <div className="absolute inset-0 z-0 opacity-50">
                <div className="absolute top-5 left-5 w-14 h-14 rounded-full bg-[#FF5E8C]/30 blur-xl"></div>
                <div className="absolute bottom-5 right-5 w-16 h-16 rounded-full bg-[#90278E]/30 blur-xl"></div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Navigation Dots - Using a better layout */}
      <div className="mt-4 flex justify-center space-x-2">
        {/* Dots for images */}
        {images.map((_, index) => (
          <Tooltip key={index} title={`ภาพที่ ${index + 1}`} placement="bottom">
            <button
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-gradient-to-r from-[#90278E] to-[#FF5E8C] scale-125' : 'bg-gray-400 hover:bg-gray-300'
              }`}
              style={{
                boxShadow: index === currentIndex ? '0 0 8px rgba(144, 39, 142, 0.8)' : 'none'
              }}
              aria-label={`ไปยังภาพที่ ${index + 1}`}
            ></button>
          </Tooltip>
        ))}
        
        {/* Dot for video */}
        {video && (
          <Tooltip title="วิดีโอ" placement="bottom">
            <button
              onClick={() => setCurrentIndex(images.length)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentIndex === images.length 
                  ? 'bg-gradient-to-r from-[#90278E] to-[#FF5E8C] scale-125' : 'bg-gray-400 hover:bg-gray-300'
              }`}
              style={{
                boxShadow: currentIndex === images.length ? '0 0 8px rgba(144, 39, 142, 0.8)' : 'none'
              }}
              aria-label="ดูวิดีโอ"
            ></button>
          </Tooltip>
        )}
        
        {/* Dot for PDF */}
        {pdfFile && (
          <Tooltip title="เอกสาร PDF" placement="bottom">
            <button
              onClick={() => setCurrentIndex(images.length + (video ? 1 : 0))}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentIndex === images.length + (video ? 1 : 0) 
                  ? 'bg-gradient-to-r from-[#90278E] to-[#FF5E8C] scale-125' : 'bg-gray-400 hover:bg-gray-300'
              }`}
              style={{
                boxShadow: currentIndex === images.length + (video ? 1 : 0) ? '0 0 8px rgba(144, 39, 142, 0.8)' : 'none'
              }}
              aria-label="ดูเอกสาร PDF"
            ></button>
          </Tooltip>
        )}
      </div>

      {/* Navigation Buttons - Improved with better contrast and accessibility */}
      {totalSlides > 1 && (
        <>
          <Tooltip title="ภาพก่อนหน้า" placement="right">
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/40 text-white w-10 h-10 rounded-full opacity-80 hover:opacity-100 flex items-center justify-center hover:bg-[#90278E] transition-all hover:scale-110 backdrop-blur-sm z-10 shadow-lg"
              aria-label="ภาพก่อนหน้า"
            >
              <LeftOutlined />
            </button>
          </Tooltip>
          
          <Tooltip title="ภาพถัดไป" placement="left">
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/40 text-white w-10 h-10 rounded-full opacity-80 hover:opacity-100 flex items-center justify-center hover:bg-[#90278E] transition-all hover:scale-110 backdrop-blur-sm z-10 shadow-lg"
              aria-label="ภาพถัดไป"
            >
              <RightOutlined />
            </button>
          </Tooltip>
        </>
      )}
      
      {/* AutoPlay Toggle with better accessibility */}
      {images.length > 1 && (
        <Tooltip title={autoPlay ? "หยุดการเล่นอัตโนมัติ" : "เล่นอัตโนมัติ"} placement="left">
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className={`absolute left-3 bottom-3 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all shadow-md ${
              autoPlay ? 'bg-[#90278E] text-white' : 'bg-black/40 text-white'
            }`}
            aria-label={autoPlay ? "หยุดการเล่นอัตโนมัติ" : "เล่นอัตโนมัติ"}
          >
            {autoPlay ? '⏸' : '▶'}
          </button>
        </Tooltip>
      )}
    </div>
  );
};

export default ImageSlider;