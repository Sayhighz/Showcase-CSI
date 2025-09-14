import React from "react";
import { Card, Typography, Tag, Descriptions, List, Avatar } from "antd";
import { UserOutlined, FileOutlined, LinkOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const PROJECT_TYPE = {
  COURSEWORK: 'coursework',
  ACADEMIC: 'academic',
  COMPETITION: 'competition'
};

const PROJECT_TYPE_LABELS = {
  [PROJECT_TYPE.COURSEWORK]: 'งานในชั้นเรียน',
  [PROJECT_TYPE.ACADEMIC]: 'บทความวิชาการ',
  [PROJECT_TYPE.COMPETITION]: 'การแข่งขัน'
};

/**
 * ReviewStep - ขั้นตอนการตรวจสอบข้อมูลก่อนบันทึก
 * @param {Object} props - Component properties
 * @param {string} props.projectType - ประเภทของโปรเจค
 * @param {Object} props.validatedValues - ข้อมูลที่ได้รับการตรวจสอบแล้ว
 * @param {Object} props.fileList - รายการไฟล์ที่อัปโหลด
 * @param {Array} props.contributors - รายชื่อผู้ร่วมโครงการ
 * @returns {JSX.Element} - ReviewStep component
 */
const ReviewStep = ({ projectType, validatedValues, fileList, contributors }) => {
  // แสดงรายการไฟล์
  const renderFileList = () => {
    const files = [];
    
    if (projectType === PROJECT_TYPE.ACADEMIC && fileList.paperFile?.length > 0) {
      files.push(...fileList.paperFile.map(file => ({
        name: file.name || 'ไฟล์บทความ',
        type: 'PDF',
        size: file.size
      })));
    }
    
    if (projectType === PROJECT_TYPE.COURSEWORK) {
      if (fileList.courseworkPoster?.length > 0) {
        files.push(...fileList.courseworkPoster.map(file => ({
          name: file.name || 'โปสเตอร์',
          type: 'รูปภาพ',
          size: file.size
        })));
      }
      
      if (fileList.courseworkImage?.length > 0) {
        files.push(...fileList.courseworkImage.map(file => ({
          name: file.name || 'รูปภาพเพิ่มเติม',
          type: 'รูปภาพ',
          size: file.size
        })));
      }
      
      if (fileList.courseworkVideo?.length > 0) {
        files.push(...fileList.courseworkVideo.map(file => ({
          name: file.name || 'วิดีโอ',
          type: 'วิดีโอ',
          size: file.size
        })));
      }
    }
    
    if (projectType === PROJECT_TYPE.COMPETITION && fileList.competitionPoster?.length > 0) {
      files.push(...fileList.competitionPoster.map(file => ({
        name: file.name || 'โปสเตอร์',
        type: 'รูปภาพ',
        size: file.size
      })));
    }

    if (projectType === PROJECT_TYPE.COMPETITION && fileList.competitionImage?.length > 0) {
      files.push(...fileList.competitionImage.map(file => ({
        name: file.name || 'รูปภาพเพิ่มเติม',
        type: 'รูปภาพ',
        size: file.size
      })));
    }
    
    return files;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const files = renderFileList();

  return (
    <div className="space-y-6">
      <div>
        <Title level={4}>ตรวจสอบข้อมูลโปรเจค</Title>
        <Text type="secondary">
          กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนบันทึก
        </Text>
      </div>

      {/* ข้อมูลทั่วไป */}
      <Card title="ข้อมูลทั่วไป" size="small">
        <Descriptions column={1} size="small">
          <Descriptions.Item label="ชื่อโปรเจค">
            <Text strong>{validatedValues.title}</Text>
          </Descriptions.Item>
          
          <Descriptions.Item label="คำอธิบาย">
            <Text>{validatedValues.description}</Text>
          </Descriptions.Item>
          
          <Descriptions.Item label="ประเภทโปรเจค">
            <Tag color="blue">{PROJECT_TYPE_LABELS[projectType]}</Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="ชั้นปี">
            ปี {validatedValues.study_year}
          </Descriptions.Item>
          
          <Descriptions.Item label="ปีการศึกษา">
            {validatedValues.year}
          </Descriptions.Item>
          
          <Descriptions.Item label="ภาคเรียน">
            {validatedValues.semester === '1' && 'ภาคเรียนที่ 1'}
            {validatedValues.semester === '2' && 'ภาคเรียนที่ 2'}
            {validatedValues.semester === '3' && 'ภาคฤดูร้อน'}
          </Descriptions.Item>
          
          <Descriptions.Item label="การแสดงผล">
            <Tag color={validatedValues.visibility === 1 ? 'green' : 'orange'}>
              {validatedValues.visibility === 1 ? 'สาธารณะ' : 'ส่วนตัว'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* ข้อมูลเฉพาะ */}
      {projectType && (
        <Card title="ข้อมูลเฉพาะ" size="small">
          <Descriptions column={1} size="small">
            {projectType === PROJECT_TYPE.ACADEMIC && (
              <>
                <Descriptions.Item label="ปีที่ตีพิมพ์">
                  {validatedValues.published_year}
                </Descriptions.Item>
                <Descriptions.Item label="วันที่ตีพิมพ์">
                  {validatedValues.publication_date ? 
                    (validatedValues.publication_date.format ? 
                      validatedValues.publication_date.format('DD/MM/YYYY') : 
                      validatedValues.publication_date) : '-'}
                </Descriptions.Item>
              </>
            )}
            
            {projectType === PROJECT_TYPE.COMPETITION && (
              <>
                <Descriptions.Item label="ชื่อการแข่งขัน">
                  {validatedValues.competition_name}
                </Descriptions.Item>
                <Descriptions.Item label="ปีที่จัดการแข่งขัน">
                  {validatedValues.competition_year}
                </Descriptions.Item>
              </>
            )}
            
            {projectType === PROJECT_TYPE.COURSEWORK && validatedValues.clip_video && (
              <Descriptions.Item label="ลิงก์วิดีโอ">
                <a href={validatedValues.clip_video} target="_blank" rel="noopener noreferrer">
                  <LinkOutlined /> ดูวิดีโอ
                </a>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}

      {/* ผู้ร่วมโครงการ */}
      {contributors && contributors.length > 0 && (
        <Card title={`ผู้ร่วมโครงการ (${contributors.length} คน)`} size="small">
          <List
            dataSource={contributors}
            renderItem={(contributor) => {
              const isRegistered = !!contributor.user_id || contributor.memberType === 'registered';
              const name = isRegistered
                ? (contributor.username || contributor.fullName || 'ไม่ระบุชื่อ')
                : (contributor.name || contributor.memberName || 'ไม่ระบุชื่อ');
              const idText = isRegistered
                ? (contributor.user_id ? `รหัส: ${contributor.user_id}` : '')
                : [
                    contributor.student_id ? `รหัส: ${contributor.student_id}` : '',
                    contributor.email ? `อีเมล: ${contributor.email}` : ''
                  ].filter(Boolean).join(' | ');
              const roleLabel = contributor.role === 'advisor' ? 'อาจารย์ที่ปรึกษา'
                : contributor.role === 'contributor' ? 'ผู้ร่วมงาน'
                : contributor.role || 'ผู้ร่วมงาน';

              return (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={name}
                    description={[idText, `บทบาท: ${roleLabel}`].filter(Boolean).join(' | ')}
                  />
                </List.Item>
              );
            }}
          />
        </Card>
      )}

      {/* ไฟล์ที่อัปโหลด */}
      {files.length > 0 && (
        <Card title={`ไฟล์ที่อัปโหลด (${files.length} ไฟล์)`} size="small">
          <List
            dataSource={files}
            renderItem={(file) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<FileOutlined />} />}
                  title={file.name}
                  description={`ประเภท: ${file.type} | ขนาด: ${formatFileSize(file.size)}`}
                />
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
};

export default ReviewStep;