import React from 'react';
import { 
  Card, Typography, Button, Image, Alert 
} from 'antd';
import { 
  FileTextOutlined, DownloadOutlined, 
  PlayCircleOutlined 
} from '@ant-design/icons';

const { Paragraph, Text } = Typography;

const ProjectFilesTab = ({ project }) => {
  if (!project.files || project.files.length === 0) {
    return (
      <Alert message="ไม่มีไฟล์ที่เกี่ยวข้อง" type="info" showIcon />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {project.files.map((file, index) => (
        <Card key={index} size="small" className="hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="mr-4">
              {file.file_type === 'pdf' ? (
                <FileTextOutlined style={{ fontSize: 36, color: '#f5222d' }} />
              ) : file.file_type === 'image' ? (
                <Image 
                  src={file.file_path} 
                  alt={file.file_name} 
                  style={{ width: 60, height: 60, objectFit: 'cover' }}
                  fallback="https://via.placeholder.com/60"
                  preview={false}
                />
              ) : file.file_type === 'video' ? (
                <div className="bg-gray-200 w-16 h-16 flex items-center justify-center rounded">
                  <PlayCircleOutlined style={{ fontSize: 36, color: '#1890ff' }} />
                </div>
              ) : (
                <FileTextOutlined style={{ fontSize: 36, color: '#1890ff' }} />
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <Paragraph ellipsis={{ rows: 1 }} className="mb-1 font-medium">
                {file.file_name}
              </Paragraph>
              <Text type="secondary" className="text-xs">
                ขนาด: {Math.round(file.file_size / 1024)} KB
              </Text>
              <div className="mt-2">
                <Button 
                  type="link" 
                  size="small" 
                  href={file.file_path} 
                  target="_blank"
                  className="p-0"
                >
                  <DownloadOutlined /> ดาวน์โหลด
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ProjectFilesTab;