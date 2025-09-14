import React, { useState } from 'react';
import { List, Button, Image, Typography, Empty, Tag, Popconfirm, message } from 'antd';  // เพิ่ม Tag, Popconfirm, message
import { DownloadOutlined, EyeOutlined, FileOutlined, PictureOutlined, YoutubeOutlined, PlayCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { URL } from '../../../constants/apiEndpoints';
import { formatThaiDate } from '../../../utils/dataUtils';
import ProjectMedia from './ProjectMedia';
import { deleteProjectImages } from '../../../services/projectService';

const { Title } = Typography;

const ProjectFiles = ({ projectDetails, onRefresh }) => {
  const [deleting, setDeleting] = useState(false);

  if (!projectDetails) return null;
  
  const files = projectDetails?.files || [];

  if (files.length === 0) {
    return (
      <div className="space-y-6">
        <ProjectMedia projectDetails={projectDetails} />
        <Empty description="ไม่มีไฟล์แนบ" />
      </div>
    );
  }
  
  // จัดกลุ่มไฟล์ตามประเภท
  const groupedFiles = files.reduce((acc, file) => {
    const type = file.file_type || 'other';
    // ไม่แสดงไฟล์ประเภทวิดีโอ
    if (type !== 'video') {
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(file);
    }
    return acc;
  }, {});

  // ลบรูปภาพ/สื่อ
  const handleDeleteImage = async (file) => {
    try {
      setDeleting(true);
      const projectId = projectDetails?.project_id || projectDetails?.projectId;
      const path = file.file_path;

      const cwPoster = projectDetails?.coursework?.poster || null;
      const cwImage = projectDetails?.coursework?.image || null;
      const compPoster = projectDetails?.competition?.poster || null;

      // Block poster deletion at UI level: posters must be replaced by uploading new ones
      if (
        (projectDetails?.type === 'coursework' && cwPoster && path === cwPoster) ||
        (projectDetails?.type === 'competition' && compPoster && path === compPoster)
      ) {
        message.warning('ไม่อนุญาตให้ลบโปสเตอร์ • กรุณาอัปโหลดใหม่เพื่อแทนที่');
        setDeleting(false);
        return;
      }

      let payload = {};

      if (file.file_id) {
        payload = { file_ids: [file.file_id] };
      } else if (projectDetails?.type === 'coursework' && cwImage && path === cwImage) {
        payload = { remove_primary_image: true };
      } else if (path) {
        payload = { file_paths: [path] };
      } else {
        message.error('ไม่สามารถระบุไฟล์ที่จะลบได้');
        setDeleting(false);
        return;
      }

      const resp = await deleteProjectImages(projectId, payload);
      if (resp.success) {
        message.success(resp.message || 'ลบรูปภาพสำเร็จ');
        onRefresh && onRefresh();
      } else {
        message.error(resp.message || 'เกิดข้อผิดพลาดในการลบรูปภาพ');
      }
    } catch {
      message.error('เกิดข้อผิดพลาดในการลบรูปภาพ');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <ProjectMedia projectDetails={projectDetails} />
      
      {Object.entries(groupedFiles).map(([type, files]) => {
        // ข้ามการแสดงผลหากเป็นประเภทวิดีโอหรือไม่มีไฟล์ในประเภทนั้น
        if (type === 'video' || type === 'image' || files.length === 0) return null;
        
        return (
          <div key={type} className="bg-gray-50 rounded-lg p-4">
            <Title level={5} className="mb-3 flex items-center">
              {type === 'image' && <PictureOutlined className="mr-2" />}
              {type === 'pdf' && <FileOutlined className="mr-2" />}
              {type === 'other' && <FileOutlined className="mr-2" />}
              {type === 'image' ? 'รูปภาพ' : type === 'pdf' ? 'เอกสาร PDF' : 'ไฟล์อื่นๆ'}
              <Tag color="purple" className="ml-2">{files.length}</Tag>
            </Title>
            
            {type === 'image' ? (
              <Image.PreviewGroup>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {files.map(file => (
                    <div key={file.file_id || file.file_path} className="relative group">
                      <Image
                        src={`${URL}/${file.file_path}`}
                        alt={file.file_name}
                        width={150}
                        height={150}
                        className="object-cover rounded-lg"
                        fallback="data:image/png;base64,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"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 space-x-2">
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          size="small"
                          href={`${URL}/${file.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          ดาวน์โหลด
                        </Button>
                        {(
                          (projectDetails?.type === 'coursework' && (projectDetails?.coursework?.poster) && file.file_path === projectDetails.coursework.poster) ||
                          (projectDetails?.type === 'competition' && (projectDetails?.competition?.poster) && file.file_path === projectDetails.competition.poster)
                        ) ? (
                          <small className="text-white/90">โปสเตอร์ • ไม่อนุญาตให้ลบ</small>
                        ) : (
                          <Popconfirm
                            title="ลบรูปภาพนี้?"
                            okText="ลบ"
                            cancelText="ยกเลิก"
                            okButtonProps={{ danger: true }}
                            onConfirm={() => handleDeleteImage(file)}
                          >
                            <Button
                              type="primary"
                              danger
                              icon={<DeleteOutlined />}
                              size="small"
                              loading={deleting}
                            >
                              ลบ
                            </Button>
                          </Popconfirm>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Image.PreviewGroup>
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={files}
                renderItem={file => (
                  <List.Item
                    actions={[
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        size="small"
                        href={`${URL}/${file.file_path}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        ดาวน์โหลด
                      </Button>,
                      <Button
                        type="default"
                        icon={<EyeOutlined />}
                        size="small"
                        href={`${URL}/${file.file_path}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        เปิด
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<FileOutlined style={{ fontSize: '24px', color: '#90278E' }} />}
                      title={file.file_name}
                      description={`ขนาด: ${(file.file_size / 1024).toFixed(2)} KB • อัปโหลดเมื่อ: ${formatThaiDate(file.created_at || file.upload_date)}`}
                    />
                  </List.Item>
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProjectFiles;