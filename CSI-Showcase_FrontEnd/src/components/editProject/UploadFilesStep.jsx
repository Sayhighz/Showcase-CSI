import React, { useState } from 'react';
import { 
  Typography, 
  Upload, 
  Card, 
  Row, 
  Col, 
  Button, 
  Divider, 
  Alert, 
  Image, 
  Space, 
  List 
} from 'antd';
import { 
  UploadOutlined, 
  PictureOutlined, 
  FilePdfOutlined, 
  FileOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import { formatFileSize } from '../../utils/fileUtils';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

/**
 * UploadFilesStep component for uploading project files
 * 
 * @param {Object} props - Component props
 * @param {string} props.projectType - Selected project type
 * @param {Object} props.files - Uploaded files object
 * @param {Function} props.setFiles - Function to update files
 * @param {Object} props.existingFiles - Existing files (for edit mode)
 * @param {boolean} props.isEditing - Whether we're editing an existing project
 * @returns {JSX.Element} UploadFilesStep component
 */
const UploadFilesStep = ({ projectType, files, setFiles, existingFiles = {}, isEditing = false }) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  
  // File upload limits
  const MAX_COVER_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024; // 20MB
  const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
  
  // Allowed file types
  const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];
  const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
  
  // Get file type icon based on file type
  const getFileIcon = (file) => {
    const fileType = file.type || '';
    
    if (fileType.startsWith('image/')) {
      return <PictureOutlined style={{ fontSize: 24 }} />;
    } else if (fileType === 'application/pdf') {
      return <FilePdfOutlined style={{ fontSize: 24 }} />;
    } else if (fileType.startsWith('video/')) {
      return <VideoCameraOutlined style={{ fontSize: 24 }} />;
    } else {
      return <FileOutlined style={{ fontSize: 24 }} />;
    }
  };
  
  // Check file size
  const checkFileSize = (file, maxSize) => {
    if (file.size > maxSize) {
      return false;
    }
    return true;
  };
  
  // Check file type
  const checkFileType = (file, allowedTypes) => {
    if (!allowedTypes.includes(file.type)) {
      return false;
    }
    return true;
  };
  
  // Handle preview for image files
  const handlePreview = (file) => {
    if (file.url) {
      setPreviewImage(file.url);
      setPreviewVisible(true);
      setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    } else if (file.originFileObj) {
      const reader = new FileReader();
      reader.readAsDataURL(file.originFileObj);
      reader.onload = () => {
        setPreviewImage(reader.result);
        setPreviewVisible(true);
        setPreviewTitle(file.name);
      };
    }
  };
  
  // Handle cover image upload
  const handleCoverImageUpload = (info) => {
    const { file, fileList } = info;
    
    // Check file size
    if (!checkFileSize(file, MAX_COVER_IMAGE_SIZE)) {
      alert(`ไฟล์มีขนาดใหญ่เกินไป สูงสุด ${formatFileSize(MAX_COVER_IMAGE_SIZE)}`);
      return;
    }
    
    // Check file type
    if (!checkFileType(file, IMAGE_TYPES)) {
      alert('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น (JPEG, PNG, GIF, WEBP)');
      return;
    }
    
    // Update files state
    setFiles(prev => ({
      ...prev,
      coverImage: file
    }));
  };
  
  // Handle images upload
  const handleImagesUpload = (info) => {
    const { fileList } = info;
    
    // Filter valid files
    const validFiles = fileList.filter(file => {
      const isValidSize = checkFileSize(file.originFileObj || file, MAX_IMAGE_SIZE);
      const isValidType = checkFileType(file.originFileObj || file, IMAGE_TYPES);
      return isValidSize && isValidType;
    });
    
    // Update files state
    setFiles(prev => ({
      ...prev,
      images: validFiles.map(file => file.originFileObj || file)
    }));
  };
  
  // Handle documents upload
  const handleDocumentsUpload = (info) => {
    const { fileList } = info;
    
    // Filter valid files
    const validFiles = fileList.filter(file => {
      const isValidSize = checkFileSize(file.originFileObj || file, MAX_DOCUMENT_SIZE);
      const isValidType = checkFileType(file.originFileObj || file, DOCUMENT_TYPES);
      return isValidSize && isValidType;
    });
    
    // Update files state
    setFiles(prev => ({
      ...prev,
      documents: validFiles.map(file => file.originFileObj || file)
    }));
  };
  
  // Handle video upload
  const handleVideoUpload = (info) => {
    const { file, fileList } = info;
    
    // Check file size
    if (!checkFileSize(file, MAX_VIDEO_SIZE)) {
      alert(`ไฟล์มีขนาดใหญ่เกินไป สูงสุด ${formatFileSize(MAX_VIDEO_SIZE)}`);
      return;
    }
    
    // Check file type
    if (!checkFileType(file, VIDEO_TYPES)) {
      alert('กรุณาอัปโหลดไฟล์วิดีโอเท่านั้น (MP4, WEBM, MOV)');
      return;
    }
    
    // Update files state
    setFiles(prev => ({
      ...prev,
      video: file
    }));
  };
  
  // Remove file
  const handleRemoveFile = (fileKey, fileIndex = null) => {
    if (fileIndex !== null) {
      // Remove file at index from array
      setFiles(prev => {
        const newFiles = { ...prev };
        newFiles[fileKey] = newFiles[fileKey].filter((_, index) => index !== fileIndex);
        return newFiles;
      });
    } else {
      // Remove single file
      setFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[fileKey];
        return newFiles;
      });
    }
  };
  
  // Render existing file
  const renderExistingFile = (file, type, index = null) => {
    const isImage = file.url && (file.url.match(/\.(jpeg|jpg|gif|png|webp)$/) !== null);
    
    return (
      <List.Item
        key={file.uid || file.id || index}
        actions={[
          <Button 
            key="preview" 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => window.open(file.url, '_blank')}
          >
            ดูไฟล์
          </Button>,
          <Button 
            key="delete" 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => {
              // Mark file for deletion
              setFiles(prev => ({
                ...prev,
                filesToDelete: [...(prev.filesToDelete || []), file.id || file.url]
              }));
              
              // Remove from existing files
              const newExistingFiles = { ...existingFiles };
              if (index !== null) {
                newExistingFiles[type] = newExistingFiles[type].filter((_, i) => i !== index);
              } else {
                delete newExistingFiles[type];
              }
              setExistingFiles(newExistingFiles);
            }}
          >
            ลบไฟล์
          </Button>
        ]}
      >
        <List.Item.Meta
          avatar={isImage ? 
            <Image src={file.url} width={48} height={48} style={{ objectFit: 'cover' }} /> : 
            getFileIcon(file)
          }
          title={file.name || file.url.split('/').pop()}
          description={`${isImage ? 'รูปภาพ' : 'เอกสาร'} ${formatFileSize(file.size || 0)}`}
        />
      </List.Item>
    );
  };

  return (
    <div className="upload-files-step">
      <Title level={3} className="mb-6">อัปโหลดไฟล์</Title>
      
      {isEditing && (
        <Alert
          message="การอัปโหลดไฟล์ใหม่"
          description="ไฟล์ที่อัปโหลดใหม่จะแทนที่ไฟล์เดิม หากไม่ต้องการเปลี่ยนแปลงไฟล์ใด ให้ปล่อยว่างไว้"
          type="info"
          showIcon
          className="mb-6"
        />
      )}
      
      <Row gutter={[16, 16]}>
        {/* Cover Image Upload */}
        <Col xs={24}>
          <Card title="รูปภาพปก (จำเป็น)" className="mb-6">
            <Paragraph>
              อัปโหลดรูปภาพปกสำหรับโครงงานของคุณ รองรับไฟล์ JPEG, PNG, GIF, WEBP ขนาดไม่เกิน {formatFileSize(MAX_COVER_IMAGE_SIZE)}
            </Paragraph>
            
            {/* Show existing cover image if available */}
            {existingFiles && existingFiles.coverImage && !files.coverImage && (
              <div className="mb-4">
                <Title level={5}>รูปภาพปกปัจจุบัน</Title>
                <Image 
                  src={existingFiles.coverImage.url} 
                  alt="Cover" 
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                />
                <Space className="mt-2">
                  <Button 
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      // Mark for deletion
                      setFiles(prev => ({
                        ...prev,
                        filesToDelete: [...(prev.filesToDelete || []), existingFiles.coverImage.id || existingFiles.coverImage.url]
                      }));
                      
                      // Remove from existing files
                      const newExistingFiles = { ...existingFiles };
                      delete newExistingFiles.coverImage;
                      setExistingFiles(newExistingFiles);
                    }}
                  >
                    ลบรูปภาพปก
                  </Button>
                </Space>
              </div>
            )}
            
            <Dragger
              name="coverImage"
              accept="image/*"
              onChange={handleCoverImageUpload}
              beforeUpload={() => false}
              showUploadList={false}
              disabled={isUploading}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">คลิกหรือลากไฟล์มาที่นี่เพื่ออัปโหลด</p>
              <p className="ant-upload-hint">
                รูปภาพปกสำหรับแสดงในหน้ารายการโครงงาน
              </p>
            </Dragger>
            
            {files.coverImage && (
              <div className="mt-4">
                <Title level={5}>รูปภาพที่เลือก</Title>
                <div className="flex items-center space-x-4">
                  <Image 
                    src={URL.createObjectURL(files.coverImage)} 
                    alt="Preview" 
                    style={{ width: 100, height: 100, objectFit: 'cover' }} 
                  />
                  <div>
                    <div>{files.coverImage.name}</div>
                    <div>{formatFileSize(files.coverImage.size)}</div>
                    <Button 
                      danger 
                      size="small" 
                      icon={<DeleteOutlined />} 
                      onClick={() => handleRemoveFile('coverImage')}
                    >
                      ลบรูปภาพ
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </Col>
        
        {/* Project Images Upload */}
        <Col xs={24} md={12}>
          <Card title="รูปภาพประกอบ" className="h-full">
            <Paragraph>
              อัปโหลดรูปภาพประกอบโครงงาน รองรับไฟล์ JPEG, PNG, GIF, WEBP ขนาดไม่เกิน {formatFileSize(MAX_IMAGE_SIZE)} ต่อไฟล์
            </Paragraph>
            
            {/* Show existing images if available */}
            {existingFiles && existingFiles.images && existingFiles.images.length > 0 && (
              <div className="mb-4">
                <Title level={5}>รูปภาพประกอบปัจจุบัน ({existingFiles.images.length})</Title>
                <List
                  itemLayout="horizontal"
                  dataSource={existingFiles.images}
                  renderItem={(file, index) => renderExistingFile(file, 'images', index)}
                />
                <Divider />
              </div>
            )}
            
            <Dragger
              name="images"
              accept="image/*"
              onChange={handleImagesUpload}
              beforeUpload={() => false}
              multiple={true}
              disabled={isUploading}
              fileList={files.images || []}
              showUploadList={{ showRemoveIcon: true }}
              onPreview={handlePreview}
              onRemove={(file) => {
                const index = (files.images || []).indexOf(file);
                handleRemoveFile('images', index);
              }}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">คลิกหรือลากไฟล์มาที่นี่เพื่ออัปโหลด</p>
              <p className="ant-upload-hint">
                รูปภาพประกอบโครงงาน สามารถอัปโหลดได้หลายไฟล์
              </p>
            </Dragger>
          </Card>
        </Col>
        
        {/* Documents Upload */}
        <Col xs={24} md={12}>
          <Card title="เอกสารประกอบ" className="h-full">
            <Paragraph>
              อัปโหลดไฟล์เอกสารประกอบโครงงาน รองรับไฟล์ PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX ขนาดไม่เกิน {formatFileSize(MAX_DOCUMENT_SIZE)} ต่อไฟล์
            </Paragraph>
            
            {/* Show existing documents if available */}
            {existingFiles && existingFiles.documents && existingFiles.documents.length > 0 && (
              <div className="mb-4">
                <Title level={5}>เอกสารประกอบปัจจุบัน ({existingFiles.documents.length})</Title>
                <List
                  itemLayout="horizontal"
                  dataSource={existingFiles.documents}
                  renderItem={(file, index) => renderExistingFile(file, 'documents', index)}
                />
                <Divider />
              </div>
            )}
            
            <Dragger
              name="documents"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={handleDocumentsUpload}
              beforeUpload={() => false}
              multiple={true}
              disabled={isUploading}
              fileList={files.documents || []}
              showUploadList={{ showRemoveIcon: true }}
              onRemove={(file) => {
                const index = (files.documents || []).indexOf(file);
                handleRemoveFile('documents', index);
              }}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">คลิกหรือลากไฟล์มาที่นี่เพื่ออัปโหลด</p>
              <p className="ant-upload-hint">
                เอกสารประกอบโครงงาน เช่น รายงาน, บทความ, สไลด์นำเสนอ
              </p>
            </Dragger>
          </Card>
        </Col>
        
        {/* Video Upload */}
        <Col xs={24}>
          <Card title="วิดีโอประกอบ">
            <Paragraph>
              อัปโหลดไฟล์วิดีโอประกอบโครงงาน รองรับไฟล์ MP4, WEBM, MOV ขนาดไม่เกิน {formatFileSize(MAX_VIDEO_SIZE)}
            </Paragraph>
            
            {/* Show existing video if available */}
            {existingFiles && existingFiles.video && !files.video && (
              <div className="mb-4">
                <Title level={5}>วิดีโอประกอบปัจจุบัน</Title>
                {renderExistingFile(existingFiles.video, 'video')}
                <Divider />
              </div>
            )}
            
            <Dragger
              name="video"
              accept="video/*"
              onChange={handleVideoUpload}
              beforeUpload={() => false}
              showUploadList={false}
              disabled={isUploading || (files.video !== undefined)}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">คลิกหรือลากไฟล์มาที่นี่เพื่ออัปโหลด</p>
              <p className="ant-upload-hint">
                วิดีโอประกอบโครงงาน
              </p>
            </Dragger>
            
            {files.video && (
              <div className="mt-4">
                <Title level={5}>วิดีโอที่เลือก</Title>
                <div className="flex items-center space-x-4">
                  <VideoCameraOutlined style={{ fontSize: 32 }} />
                  <div>
                    <div>{files.video.name}</div>
                    <div>{formatFileSize(files.video.size)}</div>
                    <Button 
                      danger 
                      size="small" 
                      icon={<DeleteOutlined />} 
                      onClick={() => handleRemoveFile('video')}
                    >
                      ลบวิดีโอ
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
      
      {/* Preview Modal for Images */}
      <Image
        style={{ display: 'none' }}
        preview={{
          visible: previewVisible,
          onVisibleChange: (visible) => setPreviewVisible(visible),
          title: previewTitle,
          src: previewImage,
        }}
      />
    </div>
  );
};

export default UploadFilesStep;