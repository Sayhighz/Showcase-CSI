import React, { useState } from 'react';
import { Row, Col, Card, Image, Typography, Button, Modal, Spin, Empty } from 'antd';
import { DownloadOutlined, ExpandOutlined, CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * ProjectGallery component ใช้สำหรับแสดงรูปภาพของโปรเจคในรูปแบบแกลเลอรี่
 * 
 * @param {Object} props - Props ของ component
 * @param {Array} props.images - รายการรูปภาพ
 * @param {string} props.title - หัวข้อของแกลเลอรี่
 * @param {number} props.columns - จำนวนคอลัมน์ที่ต้องการแสดง
 * @param {boolean} props.showPreview - อนุญาตให้คลิกดูรูปขนาดใหญ่หรือไม่
 * @param {boolean} props.showDownload - แสดงปุ่มดาวน์โหลดหรือไม่
 * @param {boolean} props.loading - สถานะการโหลดข้อมูล
 * @param {Object} props.style - Custom style สำหรับ component
 * @returns {JSX.Element} ProjectGallery component
 */
const ProjectGallery = ({
  images = [],
  title = 'รูปภาพโปรเจค',
  columns = 3,
  showPreview = true,
  showDownload = true,
  loading = false,
  style
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // ตรวจสอบว่ามีรูปภาพหรือไม่
  const hasImages = images && images.length > 0;

  // ฟังก์ชันสำหรับการแสดงรูปภาพขนาดใหญ่
  const handlePreview = (image, index) => {
    if (!showPreview) return;
    
    setPreviewImage(image.url || image.src || image);
    setPreviewTitle(image.title || image.alt || `รูปภาพที่ ${index + 1}`);
    setCurrentIndex(index);
    setPreviewVisible(true);
  };

  // ฟังก์ชันสำหรับการปิดการแสดงรูปภาพขนาดใหญ่
  const handleCancel = () => {
    setPreviewVisible(false);
  };

  // ฟังก์ชันสำหรับการดาวน์โหลดรูปภาพ
  const handleDownload = (imageUrl, imageName) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = imageName || 'download-image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ฟังก์ชันสำหรับการเลื่อนไปยังรูปภาพก่อนหน้า
  const handlePrevious = () => {
    const newIndex = (currentIndex - 1 + images.length) % images.length;
    const image = images[newIndex];
    setPreviewImage(image.url || image.src || image);
    setPreviewTitle(image.title || image.alt || `รูปภาพที่ ${newIndex + 1}`);
    setCurrentIndex(newIndex);
  };

  // ฟังก์ชันสำหรับการเลื่อนไปยังรูปภาพถัดไป
  const handleNext = () => {
    const newIndex = (currentIndex + 1) % images.length;
    const image = images[newIndex];
    setPreviewImage(image.url || image.src || image);
    setPreviewTitle(image.title || image.alt || `รูปภาพที่ ${newIndex + 1}`);
    setCurrentIndex(newIndex);
  };

  // กำหนดจำนวนคอลัมน์ตามขนาดหน้าจอ
  const getColumnSpan = () => {
    switch (columns) {
      case 1:
        return { xs: 24, sm: 24, md: 24 };
      case 2:
        return { xs: 24, sm: 12, md: 12 };
      case 4:
        return { xs: 12, sm: 8, md: 6 };
      case 3:
      default:
        return { xs: 24, sm: 12, md: 8 };
    }
  };

  // ปรับขนาดคอลัมน์
  const colSpan = getColumnSpan();

  // แสดง loading state
  if (loading) {
    return (
      <Card style={{ textAlign: 'center', padding: '40px 0', ...style }}>
        <Spin size="large" />
        <Text style={{ display: 'block', marginTop: 16 }}>กำลังโหลดรูปภาพ...</Text>
      </Card>
    );
  }

  // แสดงข้อความเมื่อไม่มีรูปภาพ
  if (!hasImages) {
    return (
      <Card 
        title={title}
        style={{ ...style }}
      >
        <Empty 
          description="ไม่มีรูปภาพในโปรเจคนี้" 
          style={{ margin: '40px 0' }}
        />
      </Card>
    );
  }

  return (
    <div style={{ ...style }}>
      {title && (
        <Title level={4} style={{ marginBottom: 16 }}>{title}</Title>
      )}

      <Row gutter={[16, 16]}>
        {images.map((image, index) => {
          // ดึง URL และชื่อของรูปภาพ
          const imageUrl = image.url || image.src || image;
          const imageName = image.title || image.alt || `image-${index + 1}`;
          
          return (
            <Col key={index} {...colSpan}>
              <Card
                hoverable={showPreview}
                cover={
                  <div style={{ height: 200, overflow: 'hidden' }}>
                    <img
                      alt={imageName}
                      src={imageUrl}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        cursor: showPreview ? 'pointer' : 'default'
                      }}
                      onClick={() => handlePreview(image, index)}
                    />
                  </div>
                }
                actions={showDownload ? [
                  <Button 
                    type="text" 
                    icon={<DownloadOutlined />} 
                    onClick={() => handleDownload(imageUrl, imageName)}
                  >
                    ดาวน์โหลด
                  </Button>,
                  <Button 
                    type="text" 
                    icon={<ExpandOutlined />} 
                    onClick={() => handlePreview(image, index)}
                    disabled={!showPreview}
                  >
                    ขยาย
                  </Button>
                ] : undefined}
              >
                <Card.Meta
                  title={imageName}
                  description={image.description || ''}
                />
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Modal สำหรับแสดงรูปภาพขนาดใหญ่ */}
      <Modal
        visible={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
        width="80%"
        style={{ top: 20 }}
        closeIcon={<CloseOutlined style={{ color: '#fff' }} />}
      >
        <div style={{ position: 'relative' }}>
          <img
            alt={previewTitle}
            src={previewImage}
            style={{ width: '100%' }}
          />
          
          {/* ปุ่มเลื่อนไปยังรูปภาพก่อนหน้า */}
          <Button
            shape="circle"
            icon={<LeftOutlined />}
            onClick={handlePrevious}
            style={{
              position: 'absolute',
              top: '50%',
              left: 10,
              transform: 'translateY(-50%)',
            }}
          />
          
          {/* ปุ่มเลื่อนไปยังรูปภาพถัดไป */}
          <Button
            shape="circle"
            icon={<RightOutlined />}
            onClick={handleNext}
            style={{
              position: 'absolute',
              top: '50%',
              right: 10,
              transform: 'translateY(-50%)',
            }}
          />
        </div>
        
        {/* ปุ่มดาวน์โหลด */}
        {showDownload && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(previewImage, previewTitle)}
            >
              ดาวน์โหลดรูปภาพ
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProjectGallery;