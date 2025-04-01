import React, { useState } from 'react';
import { FilePdfOutlined } from '@ant-design/icons';

const ImageSlider = ({ images = [], video, pdfFile, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = images.length + (video ? 1 : 0) + (pdfFile ? 1 : 0);

  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com')) return url.replace("watch?v=", "embed/");
    if (url.includes('tiktok.com')) return `https://www.tiktok.com/embed/${url.split('/').pop()}`;
    if (url.includes('facebook.com')) return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}`;
    return url;
  };

  const embeddedVideo = video ? getEmbedUrl(video) : null;

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % totalSlides);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Space-themed background with stars */}
      <div className="overflow-hidden relative h-80 flex items-center justify-center bg-[#0D0221] rounded-lg border-2 border-[#90278E] shadow-lg shadow-[#90278E]/20" 
           style={{
             backgroundImage: `radial-gradient(circle, rgba(54, 16, 74, 0.3) 1px, transparent 1px), 
                               radial-gradient(circle, rgba(255, 255, 255, 0.9) 0.5px, transparent 0.5px)`,
             backgroundSize: '100px 100px, 50px 50px',
           }}>
        {currentIndex === images.length && embeddedVideo ? (
          <iframe
            src={embeddedVideo}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg"
          ></iframe>
        ) : currentIndex === images.length + (video ? 1 : 0) && pdfFile ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#0D0221] bg-opacity-80 p-4 rounded-lg backdrop-blur-sm">
            <FilePdfOutlined className="text-[#FF5E8C] text-6xl animate-pulse" />
            <p className="mt-2 text-white font-medium">{pdfFile.name || 'ไฟล์ PDF'}</p>
            <div className="mt-3 px-4 py-2 bg-[#90278E] text-white rounded-full font-medium hover:bg-[#693184] transition-colors">
              ดาวน์โหลดเอกสาร
            </div>
          </div>
        ) : (
          images.map((image, index) => (
            <div 
              key={index} 
              className={`absolute w-full h-full flex items-center justify-center transition-opacity duration-1000 ease-in-out ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image}
                alt={title}
                className="max-w-full max-h-full object-contain transform rounded-lg z-10"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(144, 39, 142, 0.6))'
                }}
              />
              {/* Decorative elements */}
              <div className="absolute inset-0 z-0 opacity-40">
                <div className="absolute top-2 left-2 w-10 h-10 rounded-full bg-[#FF5E8C] blur-lg"></div>
                <div className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#90278E] blur-xl"></div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Navigation Dots */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-[#90278E] scale-125' : 'bg-gray-400'
            }`}
            style={{
              boxShadow: index === currentIndex ? '0 0 8px rgba(144, 39, 142, 0.8)' : 'none'
            }}
          ></button>
        ))}
        {video && (
          <button
            onClick={() => setCurrentIndex(images.length)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentIndex === images.length ? 'bg-[#90278E] scale-125' : 'bg-gray-400'
            }`}
            style={{
              boxShadow: currentIndex === images.length ? '0 0 8px rgba(144, 39, 142, 0.8)' : 'none'
            }}
          ></button>
        )}
        {pdfFile && (
          <button
            onClick={() => setCurrentIndex(images.length + (video ? 1 : 0))}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentIndex === images.length + (video ? 1 : 0) ? 'bg-[#90278E] scale-125' : 'bg-gray-400'
            }`}
            style={{
              boxShadow: currentIndex === images.length + (video ? 1 : 0) ? '0 0 8px rgba(144, 39, 142, 0.8)' : 'none'
            }}
          ></button>
        )}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-[#90278E] text-white w-8 h-8 rounded-full opacity-75 hover:opacity-100 flex items-center justify-center hover:bg-[#693184] transition-all hover:scale-110"
      >
        &#10094;
      </button>
      <button
        onClick={handleNext}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#90278E] text-white w-8 h-8 rounded-full opacity-75 hover:opacity-100 flex items-center justify-center hover:bg-[#693184] transition-all hover:scale-110"
      >
        &#10095;
      </button>
    </div>
  );
};

export default ImageSlider;