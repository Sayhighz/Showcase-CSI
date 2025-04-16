import React from 'react';
import { Card, Avatar, Typography, Divider, Space, Tag, Button, Row, Col } from 'antd';
import { EditOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, GithubOutlined, LinkedinOutlined } from '@ant-design/icons';
import { getRoleDisplay, getRoleInfo } from '../../constants/userRoles';
import { formatStudyLevel } from '../../utils/formatUtils';

const { Title, Text, Paragraph } = Typography;

/**
 * UserProfile component ใช้สำหรับแสดงข้อมูลโปรไฟล์ของผู้ใช้
 * 
 * @param {Object} props - Props ของ component
 * @param {Object} props.user - ข้อมูลผู้ใช้
 * @param {string} props.user.id - ID ของผู้ใช้
 * @param {string} props.user.username - ชื่อผู้ใช้
 * @param {string} props.user.fullName - ชื่อ-นามสกุล
 * @param {string} props.user.avatar - URL ของรูปโปรไฟล์
 * @param {string} props.user.email - อีเมล
 * @param {string} props.user.phone - เบอร์โทรศัพท์
 * @param {string} props.user.bio - ประวัติย่อ
 * @param {string} props.user.role - บทบาทของผู้ใช้
 * @param {Array} props.user.skills - ทักษะของผู้ใช้
 * @param {string} props.user.studyYear - ชั้นปีของผู้ใช้ (กรณีเป็นนักศึกษา)
 * @param {string} props.user.studentId - รหัสนักศึกษา (กรณีเป็นนักศึกษา)
 * @param {string} props.user.socialLinks - ลิงก์โซเชียลมีเดีย
 * @param {boolean} props.isCurrentUser - ใช่ผู้ใช้ปัจจุบันหรือไม่
 * @param {Function} props.onEditClick - ฟังก์ชันที่จะทำงานเมื่อคลิกปุ่มแก้ไข
 * @param {boolean} props.loading - สถานะการโหลดข้อมูล
 * @param {Object} props.style - Custom style สำหรับ component
 * @returns {JSX.Element} UserProfile component
 */
const UserProfile = ({
  user,
  isCurrentUser = false,
  onEditClick,
  loading = false,
  style
}) => {
  if (!user) return null;

  const {
    username,
    fullName,
    avatar,
    email,
    phone,
    bio,
    role,
    skills = [],
    studyYear,
    studentId,
    socialLinks = {}
  } = user;

  // ดึงข้อมูลบทบาทของผู้ใช้
  const roleInfo = getRoleInfo(role);
  const roleName = getRoleDisplay(role);

  // ตรวจสอบว่ามีข้อมูลติดต่อหรือไม่
  const hasContactInfo = email || phone;
  
  // ตรวจสอบว่ามีลิงก์โซเชียลมีเดียหรือไม่
  const hasSocialLinks = socialLinks && (
    socialLinks.github || socialLinks.linkedin || socialLinks.website
  );

  return (
    <Card
      loading={loading}
      style={{ ...style }}
      actions={isCurrentUser ? [
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={onEditClick}
        >
          แก้ไขโปรไฟล์
        </Button>
      ] : []}
    >
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <Avatar
          src={avatar}
          size={100}
          style={{ marginBottom: 16 }}
        >
          {fullName ? fullName.charAt(0) : username ? username.charAt(0) : '?'}
        </Avatar>
        <Title level={3} style={{ marginBottom: 0 }}>
          {fullName}
        </Title>
        <Text type="secondary">@{username}</Text>
        
        {roleInfo && (
          <div style={{ margin: '12px 0' }}>
            <Tag color={roleInfo.color} style={{ padding: '4px 8px' }}>
              {roleName}
            </Tag>
          </div>
        )}
        
        {studentId && (
          <Text type="secondary" style={{ display: 'block', margin: '8px 0' }}>
            รหัสนักศึกษา: {studentId}
          </Text>
        )}
        
        {studyYear && (
          <Text type="secondary" style={{ display: 'block' }}>
            {formatStudyLevel(studyYear)}
          </Text>
        )}
      </div>
      
      {bio && (
        <>
          <Divider orientation="left">เกี่ยวกับ</Divider>
          <Paragraph>
            {bio}
          </Paragraph>
        </>
      )}
      
      {skills.length > 0 && (
        <>
          <Divider orientation="left">ทักษะ</Divider>
          <div style={{ marginBottom: 16 }}>
            <Space wrap>
              {skills.map((skill, index) => (
                <Tag key={index} color="blue">
                  {skill}
                </Tag>
              ))}
            </Space>
          </div>
        </>
      )}
      
      {hasContactInfo && (
        <>
          <Divider orientation="left">ข้อมูลติดต่อ</Divider>
          <Row gutter={[16, 16]}>
            {email && (
              <Col span={24}>
                <Space>
                  <MailOutlined />
                  <Text copyable>{email}</Text>
                </Space>
              </Col>
            )}
            {phone && (
              <Col span={24}>
                <Space>
                  <PhoneOutlined />
                  <Text copyable>{phone}</Text>
                </Space>
              </Col>
            )}
          </Row>
        </>
      )}
      
      {hasSocialLinks && (
        <>
          <Divider orientation="left">โซเชียลมีเดีย</Divider>
          <Space wrap>
            {socialLinks.github && (
              <Button 
                type="link" 
                icon={<GithubOutlined />}
                href={socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </Button>
            )}
            {socialLinks.linkedin && (
              <Button 
                type="link" 
                icon={<LinkedinOutlined />}
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </Button>
            )}
            {socialLinks.website && (
              <Button 
                type="link" 
                icon={<EnvironmentOutlined />}
                href={socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                เว็บไซต์
              </Button>
            )}
          </Space>
        </>
      )}
    </Card>
  );
};

export default UserProfile;