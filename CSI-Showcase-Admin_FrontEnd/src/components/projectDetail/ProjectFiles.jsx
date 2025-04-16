// src/components/projectDetail/ProjectFiles.jsx
import React, { useState } from 'react';
import { Card, List, Typography, Image, Space, Button, Modal, Empty, Tag, Tooltip, Badge } from 'antd';
import { 
  FileOutlined, 
  FilePdfOutlined, 
  FileImageOutlined, 
  FileTextOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FilePptOutlined,
  FileZipOutlined,
  DownloadOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  PictureOutlined
} from '@ant-design/icons';
import { formatFileSize } from '../../utils/fileUtils';

const { Title, Text, Paragraph } = Typography;

const ProjectFiles = ({ files = [] }) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [fileInfoVisible, setFileInfoVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  if (!files || files.length === 0) {
    return (
      <div className="empty-state-container">
        <Empty 
          description="ไม่มีไฟล์หรือรูปภาพที่เกี่ยวข้อง" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  // Handle preview for image files
  const handlePreview = (file) => {
    if (file.file_type === 'image') {
      setPreviewImage(`http://localhost:4000/${file.file_path}`);
      setPreviewTitle(file.file_name);
      setPreviewVisible(true);
    }
  };
  
  // Show file info modal
  const showFileInfo = (file) => {
    setSelectedFile(file);
    setFileInfoVisible(true);
  };
  
  // Get icon for different file types
  const getFileIcon = (fileType) => {
    switch (fileType.toLowerCase()) {
      case 'image':
        return <FileImageOutlined style={{ fontSize: '24px', color: '#1677ff' }} />;
      case 'pdf':
        return <FilePdfOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />;
      case 'video':
        return <FileOutlined style={{ fontSize: '24px', color: '#52c41a' }} />;
      case 'excel':
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileExcelOutlined style={{ fontSize: '24px', color: '#52c41a' }} />;
      case 'doc':
      case 'docx':
      case 'word':
        return <FileWordOutlined style={{ fontSize: '24px', color: '#1677ff' }} />;
      case 'ppt':
      case 'pptx':
        return <FilePptOutlined style={{ fontSize: '24px', color: '#fa541c' }} />;
      case 'zip':
      case 'rar':
        return <FileZipOutlined style={{ fontSize: '24px', color: '#722ed1' }} />;
      default:
        return <FileTextOutlined style={{ fontSize: '24px', color: '#faad14' }} />;
    }
  };

  // Get tag color for file type
  const getFileTypeColor = (fileType) => {
    switch (fileType.toLowerCase()) {
      case 'image':
        return 'blue';
      case 'pdf':
        return 'red';
      case 'video':
        return 'green';
      case 'excel':
      case 'xlsx':
      case 'xls':
      case 'csv':
        return 'green';
      case 'doc':
      case 'docx':
      case 'word':
        return 'blue';
      case 'ppt':
      case 'pptx':
        return 'orange';
      case 'zip':
      case 'rar':
        return 'purple';
      default:
        return 'gold';
    }
  };

  // Group files by type
  const imageFiles = files.filter(file => file.file_type.toLowerCase() === 'image');
  const otherFiles = files.filter(file => file.file_type.toLowerCase() !== 'image');

  return (
    <div className="fade-in">
      {/* Image files */}
      {imageFiles.length > 0 && (
        <Card 
          className="mb-6 hover-shadow" 
          title={
            <Title level={5} className="flex items-center my-0">
              <PictureOutlined className="mr-2 text-blue-500" /> รูปภาพ ({imageFiles.length})
            </Title>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {imageFiles.map((file, index) => (
              <div key={file.file_id || index} className="relative group">
                <div className="relative overflow-hidden rounded-lg shadow-sm">
                  <Image
                    src={`/api/files/${file.file_path}`}
                    alt={file.file_name}
                    className="object-cover w-full rounded-lg transition-all duration-300 group-hover:scale-105"
                    style={{ height: '180px' }}
                    fallback="https://via.placeholder.com/300x200?text=Image+Not+Found"
                    onClick={() => handlePreview(file)}
                    preview={false}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Button 
                        type="primary" 
                        shape="circle" 
                        icon={<EyeOutlined />} 
                        onClick={() => handlePreview(file)}
                        className="mr-2"
                      />
                      <Button 
                        shape="circle" 
                        icon={<InfoCircleOutlined />} 
                        onClick={() => showFileInfo(file)}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <Tooltip title={file.file_name}>
                    <Text ellipsis={{ tooltip: true }} className="max-w-[70%]">
                      {file.file_name}
                    </Text>
                  </Tooltip>
                  <Text type="secondary" className="text-xs">
                    {formatFileSize(file.file_size)}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Other files */}
      {otherFiles.length > 0 && (
        <Card
          className="hover-shadow"
          title={
            <Title level={5} className="flex items-center my-0">
              <FileOutlined className="mr-2 text-blue-500" /> ไฟล์เอกสาร ({otherFiles.length})
            </Title>
          }
        >
          <List
            itemLayout="horizontal"
            dataSource={otherFiles}
            renderItem={(file, index) => (
              <List.Item
                key={file.file_id || index}
                className="file-card rounded-lg transition-all duration-300 mb-2"
                actions={[
                  <Button 
                    type="primary"
                    icon={<DownloadOutlined />} 
                    href={`/api/files/${file.file_path}`}
                    target="_blank"
                    size="small"
                  >
                    ดาวน์โหลด
                  </Button>,
                  <Button 
                    icon={<InfoCircleOutlined />}
                    onClick={() => showFileInfo(file)}
                    size="small"
                  >
                    ข้อมูล
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div className="p-2 bg-gray-50 rounded-full">
                      {getFileIcon(file.file_type)}
                    </div>
                  }
                  title={
                    <div className="flex items-center">
                      <Text strong>{file.file_name}</Text>
                    </div>
                  }
                  description={
                    <Space size={12} className="mt-1">
                      <Tag color={getFileTypeColor(file.file_type)}>
                        {file.file_type.toUpperCase()}
                      </Tag>
                      <Text type="secondary">ขนาด: {formatFileSize(file.file_size)}</Text>
                      {file.upload_date && (
                        <Text type="secondary">อัพโหลด: {file.upload_date}</Text>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Image preview modal */}
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
      >
        <img alt={previewTitle} style={{ width: '100%' }} src={previewImage} />
      </Modal>

      {/* File info modal */}
      <Modal
        open={fileInfoVisible}
        title={
          <div className="flex items-center">
            {selectedFile && getFileIcon(selectedFile.file_type)}
            <span className="ml-2">รายละเอียดไฟล์</span>
          </div>
        }
        onCancel={() => setFileInfoVisible(false)}
        footer={[
          <Button 
            key="download" 
            type="primary" 
            icon={<DownloadOutlined />}
            href={selectedFile ? `/api/files/${selectedFile.file_path}` : '#'}
            target="_blank"
          >
            ดาวน์โหลด
          </Button>,
          <Button key="close" onClick={() => setFileInfoVisible(false)}>
            ปิด
          </Button>
        ]}
      >
        {selectedFile && (
          <div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="ชื่อไฟล์">{selectedFile.file_name}</Descriptions.Item>
              <Descriptions.Item label="ประเภทไฟล์">
                <Tag color={getFileTypeColor(selectedFile.file_type)}>
                  {selectedFile.file_type.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="ขนาดไฟล์">{formatFileSize(selectedFile.file_size)}</Descriptions.Item>
              {selectedFile.upload_date && (
                <Descriptions.Item label="วันที่อัพโหลด">{selectedFile.upload_date}</Descriptions.Item>
              )}
              {selectedFile.description && (
                <Descriptions.Item label="คำอธิบาย">{selectedFile.description}</Descriptions.Item>
              )}
            </Descriptions>
            
            {selectedFile.file_type.toLowerCase() === 'image' && (
              <div className="mt-4 text-center">
                <img 
                  src={`/api/files/${selectedFile.file_path}`} 
                  alt={selectedFile.file_name}
                  style={{ maxWidth: '100%', maxHeight: '300px' }}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProjectFiles;