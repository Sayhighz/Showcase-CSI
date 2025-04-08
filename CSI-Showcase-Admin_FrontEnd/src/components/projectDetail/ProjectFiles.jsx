// src/components/projectDetail/ProjectFiles.jsx
import React, { useState } from 'react';
import { Card, List, Typography, Image, Space, Button, Modal, Empty } from 'antd';
import { 
  FileOutlined, 
  FilePdfOutlined, 
  FileImageOutlined, 
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { formatFileSize } from '../../utils/fileUtils';

const { Title, Text } = Typography;

const ProjectFiles = ({ files = [] }) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  if (!files || files.length === 0) {
    return (
      <Empty 
        description="ไม่มีไฟล์หรือรูปภาพที่เกี่ยวข้อง" 
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  // Handle preview for image files
  const handlePreview = (file) => {
    if (file.file_type === 'image') {
      setPreviewImage(`/api/files/${file.file_path}`);
      setPreviewTitle(file.file_name);
      setPreviewVisible(true);
    }
  };
  
  // Get icon for different file types
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image':
        return <FileImageOutlined style={{ fontSize: '24px', color: '#1890ff' }} />;
      case 'pdf':
        return <FilePdfOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />;
      case 'video':
        return <FileOutlined style={{ fontSize: '24px', color: '#52c41a' }} />;
      default:
        return <FileTextOutlined style={{ fontSize: '24px', color: '#faad14' }} />;
    }
  };

  // Group files by type
  const imageFiles = files.filter(file => file.file_type === 'image');
  const otherFiles = files.filter(file => file.file_type !== 'image');

  return (
    <div>
      {/* Image files */}
      {imageFiles.length > 0 && (
        <Card className="mb-6">
          <Title level={5} className="mb-4">รูปภาพ</Title>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {imageFiles.map(file => (
              <div key={file.file_id} className="relative">
                <Image
                  src={`/api/files/${file.file_path}`}
                  alt={file.file_name}
                  className="object-cover w-full rounded"
                  style={{ height: '160px' }}
                  fallback="https://via.placeholder.com/300x200?text=Image+Not+Found"
                  onClick={() => handlePreview(file)}
                  preview={false}
                />
                <div className="mt-2 flex justify-between items-center">
                  <Text ellipsis={{ tooltip: file.file_name }} className="max-w-[70%]">
                    {file.file_name}
                  </Text>
                  <Text type="secondary" className="text-xs">
                    {formatFileSize(file.file_size)}
                  </Text>
                </div>
                <Button 
                  type="text" 
                  icon={<EyeOutlined />} 
                  onClick={() => handlePreview(file)}
                  className="absolute top-2 right-2 bg-white bg-opacity-70 rounded-full p-1"
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Other files */}
      {otherFiles.length > 0 && (
        <Card>
          <Title level={5} className="mb-4">ไฟล์เอกสาร</Title>
          <List
            itemLayout="horizontal"
            dataSource={otherFiles}
            renderItem={file => (
              <List.Item
                actions={[
                  <Button 
                    type="link" 
                    icon={<DownloadOutlined />} 
                    href={`/api/files/${file.file_path}`}
                    target="_blank"
                  >
                    ดาวน์โหลด
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={getFileIcon(file.file_type)}
                  title={file.file_name}
                  description={
                    <Space>
                      <Text type="secondary">ประเภท: {file.file_type.toUpperCase()}</Text>
                      <Text type="secondary">ขนาด: {formatFileSize(file.file_size)}</Text>
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
        visible={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default ProjectFiles;