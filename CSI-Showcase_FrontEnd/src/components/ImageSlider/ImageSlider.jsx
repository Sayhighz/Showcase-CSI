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
      <div className="overflow-hidden relative h-80 flex items-center justify-center bg-gray-200 rounded-lg">
        {currentIndex === images.length && embeddedVideo ? (
          <iframe
            src={embeddedVideo}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg"
          ></iframe>
        ) : currentIndex === images.length + (video ? 1 : 0) && pdfFile ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-white p-4 rounded-lg">
            <FilePdfOutlined className="text-red-600 text-6xl" />
            <p className="mt-2 text-gray-700 font-medium">{pdfFile.name || 'ไฟล์ PDF'}</p>
          </div>
        ) : (
          images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={title}
              className={`absolute max-w-full max-h-full object-contain transition-opacity duration-1000 ease-in-out transform rounded-lg ${
                index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-100'
              }`}
            />
          ))
        )}
      </div>
      
      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-white' : 'bg-gray-500'
            }`}
          ></button>
        ))}
        {video && (
          <button
            onClick={() => setCurrentIndex(images.length)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentIndex === images.length ? 'bg-white' : 'bg-gray-500'
            }`}
          ></button>
        )}
        {pdfFile && (
          <button
            onClick={() => setCurrentIndex(images.length + (video ? 1 : 0))}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentIndex === images.length + (video ? 1 : 0) ? 'bg-white' : 'bg-gray-500'
            }`}
          ></button>
        )}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white px-2 py-1 rounded-full opacity-75 hover:opacity-100"
      >
        &#10094;
      </button>
      <button
        onClick={handleNext}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white px-2 py-1 rounded-full opacity-75 hover:opacity-100"
      >
        &#10095;
      </button>
    </div>
  );
};

export default ImageSlider;