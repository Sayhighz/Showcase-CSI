import React from 'react';
import { Typography, Descriptions, Divider, Card, Image, Tag, List, Alert, Row, Col } from 'antd';
import { 
  FileOutlined, 
  FilePdfOutlined, 
  PictureOutlined, 
  VideoCameraOutlined, 
  CheckCircleOutlined, 
  WarningOutlined 
} from '@ant-design/icons';
import { 
  getProjectTypeDisplay,
  getProjectTypeInfo 
} from '../../constants/projectTypes';
import { formatFileSize } from '../../utils/fileUtils';

const { Title, Text, Paragraph } = Typography;

/**
 * PreviewStep component for previewing the project before submission
 * 
 * @param {Object} props - Component props
 * @param {string} props.projectType - Selected project type
 * @param {Object} props.basicInfo - Basic project information
 * @param {Object} props.additionalInfo - Additional project information
 * @param {Object} props.files - Files to upload
 * @param {Object} props.existingFiles - Existing files (for edit mode)
 * @param {boolean} props.isEditing - Whether we're editing an existing project
 * @param {Object} props.originalProject - Original project data (for edit mode)
 * @returns {JSX.Element} PreviewStep component
 */
const PreviewStep = ({ 
  projectType, 
  basicInfo, 
  additionalInfo, 
  files, 
  existingFiles = {}, 
  isEditing = false,
  originalProject = {}
}) => {
  const projectTypeInfo = getProjectTypeInfo(projectType);
  
  // Get file icon based on file type
  const getFileIcon = (file) => {
    const fileType = file.type || '';
    const fileName = file.name || '';
    
    if (fileType.startsWith('image/') || fileName.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
      return <PictureOutlined style={{ fontSize: 16 }} />;
    } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return <FilePdfOutlined style={{ fontSize: 16 }} />;
    } else if (fileType.startsWith('video/') || fileName.match(/\.(mp4|webm|mov)$/i)) {
      return <VideoCameraOutlined style={{ fontSize: 16 }} />;
    } else {
      return <FileOutlined style={{ fontSize: 16 }} />;
    }
  };
  
  // Get file name
  const getFileName = (file) => {
    return file.name || (file.url ? file.url.split('/').pop() : 'Unknown file');
  };
  
  // Format visibility status
  const formatVisibility = (visibility) => {
    return visibility === 1 ? 
      <Tag color="green">เผยแพร่ (ทุกคนสามารถเข้าชมได้)</Tag> : 
      <Tag color="orange">ส่วนตัว (เฉพาะผู้ที่มีลิงก์เท่านั้น)</Tag>;
  };
  
  // Format competition level
  const formatCompetitionLevel = (level) => {
    const levelMap = {
      'university': 'ระดับมหาวิทยาลัย',
      'regional': 'ระดับภูมิภาค',
      'national': 'ระดับประเทศ',
      'international': 'ระดับนานาชาติ'
    };
    
    return levelMap[level] || level;
  };
  
  // Render preview based on project type
  const renderTypeSpecificPreview = () => {
    switch (projectType) {
      case 'coursework':
        return (
          <Descriptions column={{ xs: 1, sm: 2 }} layout="vertical" bordered>
            <Descriptions.Item label="รหัสวิชา" span={1}>
              {additionalInfo.course_code || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="ชื่อวิชา" span={1}>
              {additionalInfo.course_name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="อาจารย์ผู้สอน" span={2}>
              {additionalInfo.instructor || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="สมาชิกในทีม" span={2}>
              {additionalInfo.team_members || '-'}
            </Descriptions.Item>
          </Descriptions>
        );
        
      case 'academic':
        return (
          <Descriptions column={{ xs: 1, sm: 2 }} layout="vertical" bordered>
            <Descriptions.Item label="บทคัดย่อ" span={2}>
              {additionalInfo.abstract || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="ผู้เขียน/คณะผู้วิจัย" span={2}>
              {additionalInfo.authors || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="แหล่งตีพิมพ์" span={1}>
              {additionalInfo.publication || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="DOI" span={1}>
              {additionalInfo.doi || '-'}
            </Descriptions.Item>
          </Descriptions>
        );
        
      case 'competition':
        return (
          <Descriptions column={{ xs: 1, sm: 2 }} layout="vertical" bordered>
            <Descriptions.Item label="ชื่อการแข่งขัน" span={2}>
              {additionalInfo.competition_name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="ระดับการแข่งขัน" span={1}>
              {formatCompetitionLevel(additionalInfo.competition_level) || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="ผลการแข่งขัน" span={1}>
              {additionalInfo.achievement || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="สมาชิกในทีม" span={2}>
              {additionalInfo.team_members || '-'}
            </Descriptions.Item>
          </Descriptions>
        );
        
      default:
        return (
          <Alert
            message="ไม่พบข้อมูลเฉพาะ"
            description="ไม่พบข้อมูลเฉพาะประเภทโครงงาน กรุณาตรวจสอบว่าได้เลือกประเภทโครงงานแล้ว"
            type="warning"
            showIcon
          />
        );
    }
  };
  
  // Check what files are being uploaded or updated
  const getCoverImagePreview = () => {
    if (files.coverImage) {
      return (
        <div>
          <Title level={5} className="text-green-600">
            <CheckCircleOutlined className="mr-2" />
            รูปภาพปกใหม่
          </Title>
          <Image 
            src={URL.createObjectURL(files.coverImage)} 
            alt="Cover Preview" 
            style={{ maxWidth: '100%', height: 200, objectFit: 'contain' }} 
          />
          <div>{files.coverImage.name} - {formatFileSize(files.coverImage.size)}</div>
        </div>
      );
    } else if (existingFiles && existingFiles.coverImage) {
      return (
        <div>
          <Title level={5}>รูปภาพปกเดิม</Title>
          <Image 
            src={existingFiles.coverImage.url} 
            alt="Cover Preview" 
            style={{ maxWidth: '100%', height: 200, objectFit: 'contain' }} 
          />
        </div>
      );
    } else {
      return (
        <Alert 
          message="ไม่พบรูปภาพปก" 
          description="รูปภาพปกเป็นสิ่งจำเป็น กรุณาอัปโหลดรูปภาพปก" 
          type="error" 
          showIcon 
        />
      );
    }
  };
  
  // Get list of files for preview
  const getFilesList = (fileType) => {
    const newFiles = files[fileType] || [];
    const existingFilesList = (existingFiles && existingFiles[fileType]) || [];
    
    return (
      <div>
        {newFiles.length > 0 && (
          <div className="mb-4">
            <Title level={5} className="text-green-600">
              <CheckCircleOutlined className="mr-2" />
              {fileType === 'images' ? 'รูปภาพประกอบใหม่' : 'เอกสารประกอบใหม่'}
            </Title>
            <List
              size="small"
              dataSource={newFiles}
              renderItem={(file, index) => (
                <List.Item>
                  <div className="flex items-center">
                    {getFileIcon(file)}
                    <span className="ml-2">{getFileName(file)} - {formatFileSize(file.size)}</span>
                  </div>
                </List.Item>
              )}
            />
          </div>
        )}
        
        {existingFilesList.length > 0 && (
          <div>
            <Title level={5}>
              {fileType === 'images' ? 'รูปภาพประกอบเดิม' : 'เอกสารประกอบเดิม'}
            </Title>
            <List
              size="small"
              dataSource={existingFilesList}
              renderItem={(file, index) => (
                <List.Item>
                  <div className="flex items-center">
                    {getFileIcon(file)}
                    <span className="ml-2">{getFileName(file)}</span>
                  </div>
                </List.Item>
              )}
            />
          </div>
        )}
        
        {newFiles.length === 0 && existingFilesList.length === 0 && (
          <Text type="secondary">ไม่มีการอัปโหลด{fileType === 'images' ? 'รูปภาพประกอบ' : 'เอกสารประกอบ'}</Text>
        )}
      </div>
    );
  };
  
  // Get video preview
  const getVideoPreview = () => {
    if (files.video) {
      return (
        <div>
          <Title level={5} className="text-green-600">
            <CheckCircleOutlined className="mr-2" />
            วิดีโอประกอบใหม่
          </Title>
          <div className="flex items-center">
            <VideoCameraOutlined className="mr-2" style={{ fontSize: 24 }} />
            <div>
              <div>{files.video.name}</div>
              <div>{formatFileSize(files.video.size)}</div>
            </div>
          </div>
        </div>
      );
    } else if (existingFiles && existingFiles.video) {
      return (
        <div>
          <Title level={5}>วิดีโอประกอบเดิม</Title>
          <div className="flex items-center">
            <VideoCameraOutlined className="mr-2" style={{ fontSize: 24 }} />
            <div>
              <div>{getFileName(existingFiles.video)}</div>
            </div>
          </div>
        </div>
      );
    } else {
      return <Text type="secondary">ไม่มีการอัปโหลดวิดีโอประกอบ</Text>;
    }
  };
  
  // Files being deleted
  const getFilesBeingDeleted = () => {
    const filesToDelete = files.filesToDelete || [];
    
    if (filesToDelete.length === 0) {
      return null;
    }
    
    return (
      <div className="mt-4">
        <Title level={5} className="text-red-600">
          <WarningOutlined className="mr-2" />
          ไฟล์ที่จะถูกลบ
        </Title>
        <List
          size="small"
          dataSource={filesToDelete}
          renderItem={(fileId) => (
            <List.Item>
              <div className="flex items-center">
                <span className="ml-2">{fileId}</span>
              </div>
            </List.Item>
          )}
        />
      </div>
    );
  };

  return (
    <div className="preview-step">
      <Title level={3} className="mb-6">ตรวจสอบข้อมูลโครงงาน</Title>
      
      {isEditing && (
        <Alert
          message="กำลังแก้ไขโครงงาน"
          description="โปรดตรวจสอบข้อมูลให้ถูกต้องก่อนบันทึกการเปลี่ยนแปลง การเปลี่ยนแปลงนี้จะแทนที่ข้อมูลเดิมทั้งหมด"
          type="info"
          showIcon
          className="mb-6"
        />
      )}
      
      <Card className="mb-6">
        <Title level={4} className="mb-4">
          {projectTypeInfo ? (
            <span>
              {projectTypeInfo.emoji} {projectTypeInfo.label} - {basicInfo.title || "ไม่มีชื่อโครงงาน"}
            </span>
          ) : (
            <span>ไม่ได้เลือกประเภทโครงงาน - {basicInfo.title || "ไม่มีชื่อโครงงาน"}</span>
          )}
        </Title>
        
        <Descriptions column={{ xs: 1, sm: 2 }} layout="vertical" bordered>
          <Descriptions.Item label="ประเภทโครงงาน" span={1}>
            {projectTypeInfo ? (
              <Tag color={projectTypeInfo.color}>{projectTypeInfo.label}</Tag>
            ) : (
              <Tag color="red">ไม่ได้เลือกประเภท</Tag>
            )}
          </Descriptions.Item>
          
          <Descriptions.Item label="การมองเห็น" span={1}>
            {formatVisibility(basicInfo.visibility)}
          </Descriptions.Item>
          
          <Descriptions.Item label="คำอธิบายโครงงาน" span={2}>
            {basicInfo.description || '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label="ชั้นปีของผู้จัดทำ" span={1}>
            ปี {basicInfo.study_year || '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label="ปี/ภาคการศึกษา" span={1}>
            ปีการศึกษา {basicInfo.year || '-'} / ภาคการศึกษาที่ {basicInfo.semester || '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label="แท็ก (Tags)" span={2}>
            {basicInfo.tags ? (
              <div>
                {basicInfo.tags.split(',').map((tag, index) => (
                  <Tag key={index} color="blue">{tag.trim()}</Tag>
                ))}
              </div>
            ) : (
              '-'
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      
      <Card title="ข้อมูลเฉพาะประเภทโครงงาน" className="mb-6">
        {renderTypeSpecificPreview()}
      </Card>
      
      <Card title="ไฟล์แนบ">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="รูปภาพปก" className="h-full">
              {getCoverImagePreview()}
            </Card>
          </Col>
          
          <Col xs={24} md={12}>
            <Card title="รูปภาพประกอบ" className="h-full">
              {getFilesList('images')}
            </Card>
          </Col>
          
          <Col xs={24} md={12}>
            <Card title="เอกสารประกอบ" className="h-full">
              {getFilesList('documents')}
            </Card>
          </Col>
          
          <Col xs={24} md={12}>
            <Card title="วิดีโอประกอบ" className="h-full">
              {getVideoPreview()}
            </Card>
          </Col>
        </Row>
        
        {isEditing && getFilesBeingDeleted()}
      </Card>
    </div>
  );
};

export default PreviewStep;