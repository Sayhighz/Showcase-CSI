import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Row, 
  Col, 
  Card, 
  Tabs, 
  Form, 
  Input, 
  Button, 
  Upload, 
  Avatar, 
  Select, 
  Switch, 
  Divider,
  Typography,
  message,
  Spin,
  Modal,
  Space
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  UploadOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  BellOutlined,
  GlobalOutlined,
  FileProtectOutlined
} from '@ant-design/icons';
import { useAuth, useUpload } from '../../hooks';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

/**
 * Settings page component ใช้สำหรับการตั้งค่าบัญชีผู้ใช้
 * 
 * @returns {JSX.Element} Settings page component
 */
const Settings = () => {
  const navigate = useNavigate();
  const { user, updateUserData, logout } = useAuth();
  const { uploadProfileImage, isUploading } = useUpload();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [privacyForm] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // เตรียมข้อมูลเริ่มต้นสำหรับฟอร์ม
  useEffect(() => {
    if (user) {
      // ตั้งค่าข้อมูลสำหรับฟอร์มโปรไฟล์
      profileForm.setFieldsValue({
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        studentId: user.studentId,
        studyYear: user.studyYear,
        skills: user.skills || [],
        github: user.socialLinks?.github,
        linkedin: user.socialLinks?.linkedin,
        website: user.socialLinks?.website
      });
      
      // ตั้งค่า URL ของรูปโปรไฟล์
      setAvatarUrl(user.avatar);
      
      // ตั้งค่าข้อมูลสำหรับฟอร์มการแจ้งเตือน (ตัวอย่าง)
      notificationForm.setFieldsValue({
        emailNotifications: true,
        projectUpdates: true,
        commentNotifications: true,
        systemAnnouncements: true
      });
      
      // ตั้งค่าข้อมูลสำหรับฟอร์มความเป็นส่วนตัว (ตัวอย่าง)
      privacyForm.setFieldsValue({
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        projectsVisibility: 'public'
      });
    }
  }, [user, profileForm, notificationForm, privacyForm]);
  
  // ถ้าไม่มีข้อมูลผู้ใช้ ให้แสดง loading
  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
        <Text style={{ display: 'block', marginTop: 16 }}>กำลังโหลดข้อมูล...</Text>
      </div>
    );
  }
  
  // ฟังก์ชันสำหรับการอัปเดตโปรไฟล์
  const handleUpdateProfile = async (values) => {
    setIsLoading(true);
    try {
      // จัดรูปแบบข้อมูลสำหรับส่งไปยัง API
      const profileData = {
        ...values,
        socialLinks: {
          github: values.github,
          linkedin: values.linkedin,
          website: values.website
        }
      };
      
      // ลบ key ที่ไม่ต้องการออก
      delete profileData.github;
      delete profileData.linkedin;
      delete profileData.website;
      
      // ในตัวอย่างนี้เราจะจำลองการอัปเดตโปรไฟล์
      setTimeout(() => {
        updateUserData(profileData);
        message.success('อัปเดตโปรไฟล์สำเร็จ');
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      message.error('เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์');
      setIsLoading(false);
    }
  };
  
  // ฟังก์ชันสำหรับการเปลี่ยนรหัสผ่าน
  const handleChangePassword = async (values) => {
    setIsLoading(true);
    try {
      // ตรวจสอบว่ารหัสผ่านใหม่และยืนยันรหัสผ่านตรงกัน
      if (values.newPassword !== values.confirmPassword) {
        message.error('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน');
        setIsLoading(false);
        return;
      }
      
      // ในตัวอย่างนี้เราจะจำลองการเปลี่ยนรหัสผ่าน
      setTimeout(() => {
        message.success('เปลี่ยนรหัสผ่านสำเร็จ');
        passwordForm.resetFields();
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      message.error('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
      setIsLoading(false);
    }
  };
  
  // ฟังก์ชันสำหรับการอัปเดตการตั้งค่าการแจ้งเตือน
  const handleUpdateNotifications = (values) => {
    setIsLoading(true);
    try {
      // ในตัวอย่างนี้เราจะจำลองการอัปเดตการตั้งค่าการแจ้งเตือน
      setTimeout(() => {
        message.success('อัปเดตการตั้งค่าการแจ้งเตือนสำเร็จ');
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      message.error('เกิดข้อผิดพลาดในการอัปเดตการตั้งค่าการแจ้งเตือน');
      setIsLoading(false);
    }
  };
  
  // ฟังก์ชันสำหรับการอัปเดตการตั้งค่าความเป็นส่วนตัว
  const handleUpdatePrivacy = (values) => {
    setIsLoading(true);
    try {
      // ในตัวอย่างนี้เราจะจำลองการอัปเดตการตั้งค่าความเป็นส่วนตัว
      setTimeout(() => {
        message.success('อัปเดตการตั้งค่าความเป็นส่วนตัวสำเร็จ');
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      message.error('เกิดข้อผิดพลาดในการอัปเดตการตั้งค่าความเป็นส่วนตัว');
      setIsLoading(false);
    }
  };
  
  // ฟังก์ชันสำหรับการลบบัญชี
  const showDeleteConfirm = () => {
    confirm({
      title: 'คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีของคุณ?',
      icon: <ExclamationCircleOutlined />,
      content: 'การลบบัญชีจะไม่สามารถย้อนกลับได้ และข้อมูลทั้งหมดของคุณจะถูกลบออกจากระบบ',
      okText: 'ใช่, ลบบัญชีของฉัน',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk() {
        // ในตัวอย่างนี้เราจะจำลองการลบบัญชี
        setTimeout(() => {
          message.success('บัญชีของคุณถูกลบเรียบร้อยแล้ว');
          logout();
          navigate('/');
        }, 1000);
      }
    });
  };
  
  // ฟังก์ชันสำหรับการอัปโหลดรูปโปรไฟล์
  const handleAvatarChange = async (info) => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      // ในกรณีนี้เราใช้ URL ชั่วคราว
      const url = URL.createObjectURL(info.file.originFileObj);
      setAvatarUrl(url);
      
      // อัปโหลดรูปโปรไฟล์โดยใช้ uploadProfileImage จาก useUpload hook
      try {
        const result = await uploadProfileImage(info.file.originFileObj);
        if (result) {
          message.success('อัปโหลดรูปโปรไฟล์สำเร็จ');
          // อัปเดตข้อมูลผู้ใช้ด้วย URL ของรูปโปรไฟล์ใหม่
          updateUserData({ avatar: result.url || url });
        }
      } catch (error) {
        message.error('เกิดข้อผิดพลาดในการอัปโหลดรูปโปรไฟล์');
      }
    }
  };
  
  return (
    <div>
      {/* ปุ่มย้อนกลับ */}
      <div style={{ marginBottom: 24 }}>
        <Link to="/">
          <Button icon={<ArrowLeftOutlined />}>
            กลับหน้าหลัก
          </Button>
        </Link>
      </div>
      
      <Title level={2}>ตั้งค่าบัญชี</Title>
      <Paragraph>จัดการบัญชีและการตั้งค่าส่วนตัวของคุณ</Paragraph>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} md={6}>
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab} tabPosition="left">
              <TabPane 
                tab={
                  <span>
                    <FileProtectOutlined /> โปรไฟล์
                  </span>
                } 
                key="profile" 
              />
              <TabPane 
                tab={
                  <span>
                    <LockOutlined /> รหัสผ่าน
                  </span>
                } 
                key="password" 
              />
              <TabPane 
                tab={
                  <span>
                    <BellOutlined /> การแจ้งเตือน
                  </span>
                } 
                key="notifications" 
              />
              <TabPane 
                tab={
                  <span>
                    <UserOutlined /> ความเป็นส่วนตัว
                  </span>
                } 
                key="privacy" 
              />
              <TabPane 
                tab={
                  <span style={{ color: '#ff4d4f' }}>
                    <DeleteOutlined /> ลบบัญชี
                  </span>
                } 
                key="delete" 
              />
            </Tabs>
          </Card>
        </Col>
        
        <Col xs={24} md={18}>
          <Card>
            {/* แท็บโปรไฟล์ */}
            {activeTab === 'profile' && (
              <>
                <Title level={4}>แก้ไขโปรไฟล์</Title>
                <Paragraph>อัปเดตข้อมูลส่วนตัวและโปรไฟล์ของคุณ</Paragraph>
                <Divider />
                
                <Form
                  form={profileForm}
                  layout="vertical"
                  onFinish={handleUpdateProfile}
                  initialValues={{
                    username: user.username,
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    bio: user.bio,
                    studentId: user.studentId,
                    studyYear: user.studyYear,
                    skills: user.skills || [],
                    github: user.socialLinks?.github,
                    linkedin: user.socialLinks?.linkedin,
                    website: user.socialLinks?.website
                  }}
                >
                  <Row gutter={[16, 0]}>
                    <Col xs={24} md={6}>
                      <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <Avatar 
                          src={avatarUrl} 
                          size={100}
                          icon={<UserOutlined />}
                        />
                        <div style={{ marginTop: 16 }}>
                          <Upload
                            name="avatar"
                            showUploadList={false}
                            beforeUpload={(file) => {
                              // ตรวจสอบประเภทของไฟล์
                              const isImage = file.type.startsWith('image/');
                              if (!isImage) {
                                message.error('คุณสามารถอัปโหลดได้เฉพาะไฟล์รูปภาพเท่านั้น');
                              }
                              // ตรวจสอบขนาดของไฟล์
                              const isLt2M = file.size / 1024 / 1024 < 2;
                              if (!isLt2M) {
                                message.error('รูปภาพต้องมีขนาดไม่เกิน 2MB');
                              }
                              return isImage && isLt2M;
                            }}
                            onChange={handleAvatarChange}
                          >
                            <Button icon={<UploadOutlined />} loading={isUploading}>
                              เปลี่ยนรูปโปรไฟล์
                            </Button>
                          </Upload>
                        </div>
                      </div>
                    </Col>
                    
                    <Col xs={24} md={18}>
                      <Row gutter={[16, 0]}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="username"
                            label="ชื่อผู้ใช้"
                            rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}
                          >
                            <Input prefix={<UserOutlined />} placeholder="ชื่อผู้ใช้" />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="fullName"
                            label="ชื่อ-นามสกุล"
                            rules={[{ required: true, message: 'กรุณากรอกชื่อ-นามสกุล' }]}
                          >
                            <Input placeholder="ชื่อ-นามสกุล" />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="email"
                            label="อีเมล"
                            rules={[
                              { required: true, message: 'กรุณากรอกอีเมล' },
                              { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' }
                            ]}
                          >
                            <Input prefix={<MailOutlined />} placeholder="อีเมล" />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="phone"
                            label="เบอร์โทรศัพท์"
                          >
                            <Input prefix={<PhoneOutlined />} placeholder="เบอร์โทรศัพท์" />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="studentId"
                            label="รหัสนักศึกษา"
                          >
                            <Input placeholder="รหัสนักศึกษา" />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="studyYear"
                            label="ชั้นปี"
                          >
                            <Select placeholder="เลือกชั้นปี">
                              <Option value="1">ปี 1</Option>
                              <Option value="2">ปี 2</Option>
                              <Option value="3">ปี 3</Option>
                              <Option value="4">ปี 4</Option>
                              <Option value="5">ปี 5</Option>
                              <Option value="6">ปี 6</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24}>
                          <Form.Item
                            name="bio"
                            label="ประวัติย่อ"
                          >
                            <TextArea rows={4} placeholder="เขียนประวัติย่อของคุณสั้นๆ" />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24}>
                          <Form.Item
                            name="skills"
                            label="ทักษะ"
                          >
                            <Select 
                              mode="tags" 
                              placeholder="เพิ่มทักษะของคุณ (กด Enter เพื่อเพิ่ม)"
                              tokenSeparators={[',']}
                            >
                              <Option value="React">React</Option>
                              <Option value="Node.js">Node.js</Option>
                              <Option value="JavaScript">JavaScript</Option>
                              <Option value="Python">Python</Option>
                              <Option value="Java">Java</Option>
                              <Option value="UI/UX Design">UI/UX Design</Option>
                              <Option value="Mobile Development">Mobile Development</Option>
                              <Option value="Machine Learning">Machine Learning</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24}>
                          <Divider orientation="left">โซเชียลมีเดีย</Divider>
                        </Col>
                        
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="github"
                            label="GitHub"
                          >
                            <Input placeholder="https://github.com/username" />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="linkedin"
                            label="LinkedIn"
                          >
                            <Input placeholder="https://linkedin.com/in/username" />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="website"
                            label="เว็บไซต์"
                          >
                            <Input placeholder="https://your-website.com" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  
                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      icon={<SaveOutlined />} 
                      loading={isLoading}
                      style={{ marginTop: 16 }}
                    >
                      บันทึกการเปลี่ยนแปลง
                    </Button>
                  </Form.Item>
                </Form>
              </>
            )}
            
            {/* แท็บรหัสผ่าน */}
            {activeTab === 'password' && (
              <>
                <Title level={4}>เปลี่ยนรหัสผ่าน</Title>
                <Paragraph>อัปเดตรหัสผ่านของคุณเพื่อความปลอดภัย</Paragraph>
                <Divider />
                
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={handleChangePassword}
                >
                  <Form.Item
                    name="currentPassword"
                    label="รหัสผ่านปัจจุบัน"
                    rules={[{ required: true, message: 'กรุณากรอกรหัสผ่านปัจจุบัน' }]}
                  >
                    <Input.Password placeholder="รหัสผ่านปัจจุบัน" />
                  </Form.Item>
                  
                  <Form.Item
                    name="newPassword"
                    label="รหัสผ่านใหม่"
                    rules={[
                      { required: true, message: 'กรุณากรอกรหัสผ่านใหม่' },
                      { min: 8, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' }
                    ]}
                  >
                    <Input.Password placeholder="รหัสผ่านใหม่" />
                  </Form.Item>
                  
                  <Form.Item
                    name="confirmPassword"
                    label="ยืนยันรหัสผ่านใหม่"
                    rules={[
                      { required: true, message: 'กรุณายืนยันรหัสผ่านใหม่' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('รหัสผ่านที่ยืนยันไม่ตรงกับรหัสผ่านใหม่'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="ยืนยันรหัสผ่านใหม่" />
                  </Form.Item>
                  
                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      icon={<SaveOutlined />} 
                      loading={isLoading}
                    >
                      เปลี่ยนรหัสผ่าน
                    </Button>
                  </Form.Item>
                </Form>
              </>
            )}
            
            {/* แท็บการแจ้งเตือน */}
            {activeTab === 'notifications' && (
              <>
                <Title level={4}>การตั้งค่าการแจ้งเตือน</Title>
                <Paragraph>จัดการการแจ้งเตือนที่คุณจะได้รับ</Paragraph>
                <Divider />
                
                <Form
                  form={notificationForm}
                  layout="vertical"
                  onFinish={handleUpdateNotifications}
                >
                  <Form.Item
                    name="emailNotifications"
                    label="การแจ้งเตือนทางอีเมล"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  
                  <Form.Item
                    name="projectUpdates"
                    label="รับการแจ้งเตือนเมื่อมีการอัปเดตโปรเจค"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  
                  <Form.Item
                    name="commentNotifications"
                    label="รับการแจ้งเตือนเมื่อมีความคิดเห็นใหม่ในโปรเจคของคุณ"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  
                  <Form.Item
                    name="systemAnnouncements"
                    label="รับการแจ้งเตือนประกาศจากระบบ"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  
                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      icon={<SaveOutlined />} 
                      loading={isLoading}
                    >
                      บันทึกการตั้งค่า
                    </Button>
                  </Form.Item>
                </Form>
              </>
            )}
            
            {/* แท็บความเป็นส่วนตัว */}
            {activeTab === 'privacy' && (
              <>
                <Title level={4}>การตั้งค่าความเป็นส่วนตัว</Title>
                <Paragraph>จัดการความเป็นส่วนตัวของบัญชีและข้อมูลของคุณ</Paragraph>
                <Divider />
                
                <Form
                  form={privacyForm}
                  layout="vertical"
                  onFinish={handleUpdatePrivacy}
                >
                  <Form.Item
                    name="profileVisibility"
                    label="การมองเห็นโปรไฟล์"
                  >
                    <Select>
                      <Option value="public">สาธารณะ (ทุกคนสามารถดูได้)</Option>
                      <Option value="registered">เฉพาะผู้ใช้ที่ลงทะเบียน</Option>
                      <Option value="private">ส่วนตัว (เฉพาะคุณและผู้ดูแลระบบ)</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    name="showEmail"
                    label="แสดงอีเมลในโปรไฟล์สาธารณะ"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  
                  <Form.Item
                    name="showPhone"
                    label="แสดงเบอร์โทรศัพท์ในโปรไฟล์สาธารณะ"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  
                  <Form.Item
                    name="projectsVisibility"
                    label="การมองเห็นโปรเจคของคุณ"
                  >
                    <Select>
                      <Option value="public">สาธารณะ (ทุกคนสามารถดูได้)</Option>
                      <Option value="registered">เฉพาะผู้ใช้ที่ลงทะเบียน</Option>
                      <Option value="private">ส่วนตัว (เฉพาะคุณและผู้ดูแลระบบ)</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      icon={<SaveOutlined />} 
                      loading={isLoading}
                    >
                      บันทึกการตั้งค่า
                    </Button>
                  </Form.Item>
                </Form>
              </>
            )}
            
            {/* แท็บลบบัญชี */}
            {activeTab === 'delete' && (
              <>
                <Title level={4} type="danger">ลบบัญชี</Title>
                <Paragraph type="danger
                ">คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีของคุณ?</Paragraph>
                <Divider />
                
                <Button 
                  type="primary" 
                  icon={<DeleteOutlined />} 
                  danger 
                  onClick={showDeleteConfirm}
                >
                  ลบบัญชี
                </Button>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Settings;