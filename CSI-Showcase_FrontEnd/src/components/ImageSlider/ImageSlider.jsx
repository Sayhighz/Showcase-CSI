import React, { useState } from 'react';
import { Carousel, Image, Button, Tabs } from 'antd';
import { 
  LeftOutlined, 
  RightOutlined, 
  PictureOutlined, 
  FilePdfOutlined, 
  VideoCameraOutlined
} from '@ant-design/icons';
import { API_ENDPOINTS } from '../../constants';

/**
 * Component สำหรับแสดงรูปภาพแบบ slider ด้วยปรับแต่งการแสดงผลให้สวยงาม
 * และรองรับการแสดงวิดีโอหรือ PDF
 * 
 * @param {Object} props - Props ของ component
 * @param {Array} props.images - รายการ path ของรูปภาพ
 * @param {string} props.video - path ของวิดีโอ (ถ้ามี)
 * @param {Object} props.pdfFile - ข้อมูลไฟล์ PDF (ถ้ามี)
 * @param {string} props.posterImage - รูปปกหลัก (ถ้ามี)
 * @param {string} props.title - ชื่อของผลงาน
 * @returns {JSX.Element} ImageSlider component
 */
const ImageSlider = ({ images = [], video, pdfFile, posterImage, title }) => {
  const [activeTab, setActiveTab] = useState('images');
  const carouselRef = React.useRef();

  // ตรวจสอบและจัดรูปแบบรายการภาพ
  const formattedImages = images.map(img => {
    // เพิ่มโดเมนให้กับ path ที่ไม่มี http หรือ https
    if (img && !img.startsWith('http')) {
      return `${API_ENDPOINTS.BASE}/${img}`;
    }
    return img;
  }).filter(Boolean);

  // เพิ่มภาพหน้าปกเป็นภาพแรก (ถ้ามี)
  if (posterImage && !formattedImages.includes(posterImage)) {
    const formattedPoster = posterImage.startsWith('http') 
      ? posterImage 
      : `${API_ENDPOINTS.BASE}/${posterImage}`;
    formattedImages.unshift(formattedPoster);
  }

  // ตรวจสอบถ้าไม่มีรูปและไม่มีวิดีโอ ให้ใช้รูปแทน
  const hasMedia = formattedImages.length > 0 || video || pdfFile;
  
  if (!hasMedia) {
    return (
      <div className="bg-gray-100 p-8 rounded-lg shadow-inner flex items-center justify-center flex-col">
        <PictureOutlined className="text-4xl text-gray-400 mb-2" />
        <p className="text-gray-500 text-center">ไม่มีรูปภาพหรือสื่อสำหรับผลงานนี้</p>
      </div>
    );
  }

  const items = [];
  
  // Tab รูปภาพ (แสดงเฉพาะเมื่อมีรูปภาพ)
  if (formattedImages.length > 0) {
    items.push({
      key: 'images',
      label: (
        <span>
          <PictureOutlined />
          รูปภาพ
        </span>
      ),
      children: (
        <div className="relative image-carousel-container">
          <Carousel
            ref={carouselRef}
            autoplay={formattedImages.length > 1}
            autoplaySpeed={5000}
            pauseOnHover
            className="rounded-lg overflow-hidden bg-black/5"
          >
            {formattedImages.map((img, index) => (
              <div key={index} className="carousel-item">
                <Image
                  src={img}
                  alt={`${title} - รูปที่ ${index + 1}`}
                  className="w-full object-contain max-h-96"
                  style={{ maxHeight: '400px', objectFit: 'contain' }}
                  preview={{ 
                    mask: <div className="flex items-center justify-center">
                      <span className="text-sm mr-1">คลิกเพื่อขยาย</span>
                    </div>
                  }}
                />
              </div>
            ))}
          </Carousel>
          
          {formattedImages.length > 1 && (
            <div className="flex justify-between absolute top-1/2 left-0 right-0 transform -translate-y-1/2 px-2">
              <Button
                type="primary"
                shape="circle"
                icon={<LeftOutlined />}
                onClick={() => carouselRef.current.prev()}
                className="opacity-70 hover:opacity-100 bg-[#90278E]"
              />
              <Button
                type="primary"
                shape="circle"
                icon={<RightOutlined />}
                onClick={() => carouselRef.current.next()}
                className="opacity-70 hover:opacity-100 bg-[#90278E]"
              />
            </div>
          )}
        </div>
      ),
    });
  }
  
  // Tab วิดีโอ (แสดงเฉพาะเมื่อมีวิดีโอ)
  if (video) {
    const videoUrl = video.startsWith('http') ? video : `${API_ENDPOINTS.BASE}/${video}`;
    const isYouTube = video.includes('youtube.com') || video.includes('youtu.be');

    items.push({
      key: 'video',
      label: (
        <span>
          <VideoCameraOutlined />
          วิดีโอ
        </span>
      ),
      children: (
        <div className="rounded-lg overflow-hidden">
          {isYouTube ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoUrl.split('v=')[1] || videoUrl.split('/').pop()}`}
              title={`${title} - วิดีโอ`}
              className="w-full aspect-video rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={videoUrl}
              controls
              className="w-full aspect-video rounded-lg"
              title={`${title} - วิดีโอ`}
            />
          )}
        </div>
      ),
    });
  }
  
  // Tab PDF (แสดงเฉพาะเมื่อมี PDF)
  if (pdfFile) {
    const pdfUrl = pdfFile.path.startsWith('http') 
      ? pdfFile.path 
      : `${API_ENDPOINTS.BASE}/${pdfFile.path}`;

    items.push({
      key: 'pdf',
      label: (
        <span>
          <FilePdfOutlined />
          PDF
        </span>
      ),
      children: (
        <div className="rounded-lg overflow-hidden">
          <iframe
            src={`${pdfUrl}#toolbar=0&scrollbar=0`}
            title={pdfFile.name || `${title} - PDF`}
            className="w-full h-96 rounded-lg border border-gray-200"
          />
          <div className="mt-2 flex justify-center">
            <Button
              type="primary"
              icon={<FilePdfOutlined />}
              href={pdfUrl}
              target="_blank"
              className="bg-[#90278E] hover:bg-[#FF5E8C]"
            >
              เปิด PDF ในแท็บใหม่
            </Button>
          </div>
        </div>
      ),
    });
  }

  return (
    <div className="image-slider">
      {items.length > 1 ? (
        <Tabs
          items={items}
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          tabBarStyle={{ marginBottom: 16 }}
        />
      ) : (
        items[0]?.children
      )}
    </div>
  );
};

export default ImageSlider;