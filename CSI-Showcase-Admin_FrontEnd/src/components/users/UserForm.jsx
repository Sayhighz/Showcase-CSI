// src/components/users/UserForm.jsx
import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  Switch, 
  Space,
  Divider,
  Upload,
  message,
  Typography,
  Tooltip,
  Row,
  Col,
  Card,
  Alert
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  UploadOutlined, 
  InfoCircleOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { USER_ROLES, USER_ROLE_NAMES, USER_STATUS, USER_STATUS_NAMES } from '../../constants/userConstants';
import { isValidEmail, isStrongPassword } from '../../utils/validationUtils';
import FileUpload from '../common/FileUpload';
import UserAvatar from '../common/UserAvatar';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { Password } = Input;

/**
 * Component สำหรับสร้างหรือแก้ไขข้อมูลผู้ใช้
 * 
 * @param {Object} props
 * @param {Object} props.initialValues - ค่าเริ่มต้นสำหรับฟอร์ม
 * @param {Function} props.onSubmit - ฟังก์ชันที่จะถูกเรียกเมื่อส่งฟอร์ม
 * @param {Function} props.onCancel - ฟังก์ชันที่จะถูกเรียกเมื่อยกเลิก
 * @param {boolean} props.loading - สถานะกำลังโหลด
 * @param {string} props.mode - โหมดของฟอร์ม ('create' หรือ 'edit')
 * @param {string} props.userRole - บทบาทของผู้ใช้ ('admin' หรือ 'student')
 */
const UserForm = ({ 
  initialValues = {}, 
  onSubmit, 
  onCancel, 
  loading = false,
  mode = 'create',
  userRole = 'student'
}) => {
  const [form] = Form.useForm();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(initialValues.image || null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');
  
  // เมื่อ initialValues เปลี่ยน ให้ reset ฟอร์มและอัพเดตรูปภาพ
  useEffect(() => {
    form.resetFields();
    setPreviewImage(initialValues.image || null);
  }, [form, initialValues]);
  
  // จัดการการส่งฟอร์ม
  const handleSubmit = (values) => {
    // ถ้ามีการอัปโหลดรูปภาพใหม่
    if (uploadedImage) {
      // สร้าง FormData
      const formData = new FormData();
      
      // เพิ่มข้อมูลผู้ใช้ลงใน FormData
      Object.keys(values).forEach(key => {
        if (key !== 'confirm_password') {
          formData.append(key, values[key]);
        }
      });
      
      // เพิ่มไฟล์รูปภาพ
      formData.append('profileImage', uploadedImage);
      
      // ส่ง FormData แทนข้อมูลปกติ
      onSubmit(formData, true); // ส่งพารามิเตอร์ที่สองเพื่อระบุว่ามีการอัปโหลดรูปภาพ
    } else {
      // ถ้าไม่มีการอัปโหลดรูปภาพ ใช้ข้อมูลเดิม
      const userData = {
        ...values,
        image: initialValues.image
      };
      
      onSubmit(userData, false);
    }
  };
  
  // จัดการการอัพโหลดรูปภาพ
  const handleImageUpload = (fileList) => {
    if (fileList.length > 0) {
      const file = fileList[0];
      
      // ตรวจสอบนามสกุลไฟล์
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('คุณสามารถอัปโหลดได้เฉพาะไฟล์รูปภาพเท่านั้น!');
        return;
      }
      
      // ตรวจสอบขนาดไฟล์ (2MB)
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('รูปภาพต้องมีขนาดเล็กกว่า 2MB!');
        return;
      }
      
      // สร้าง URL สำหรับแสดงตัวอย่าง
      setPreviewImage(URL.createObjectURL(file.originFileObj));
      setUploadedImage(file.originFileObj);
      message.success('อัปโหลดรูปภาพสำเร็จ');
    }
  };
  
  // ลบรูปภาพ
  const handleRemoveImage = () => {
    setPreviewImage(null);
    setUploadedImage(null);
    message.success('ลบรูปภาพเรียบร้อยแล้ว');
  };
  
  // ตรวจสอบรหัสผ่าน
  const validatePassword = (_, value) => {
    if (mode === 'edit' && !value) {
      setPasswordStrength(0);
      setPasswordFeedback('');
      return Promise.resolve();
    }
    
    if (!value) {
      setPasswordStrength(0);
      setPasswordFeedback('กรุณากรอกรหัสผ่าน');
      return Promise.reject('กรุณากรอกรหัสผ่าน');
    }
    
    // ตรวจสอบความซับซ้อนของรหัสผ่าน
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(value);
    const isLongEnough = value.length >= 8;
    
    const passwordStrengthScore = 
      (hasUpperCase ? 1 : 0) + 
      (hasLowerCase ? 1 : 0) + 
      (hasNumber ? 1 : 0) + 
      (hasSpecialChar ? 1 : 0) + 
      (isLongEnough ? 1 : 0);
    
    setPasswordStrength(passwordStrengthScore);
    
    if (passwordStrengthScore < 3) {
      setPasswordFeedback('รหัสผ่านไม่ปลอดภัย ควรมีตัวอักษรพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และอักขระพิเศษ');
      return Promise.reject('รหัสผ่านไม่ปลอดภัยเพียงพอ');
    } else if (passwordStrengthScore < 5) {
      setPasswordFeedback('รหัสผ่านมีความปลอดภัยปานกลาง');
    } else {
      setPasswordFeedback('รหัสผ่านมีความปลอดภัยสูง');
    }
    
    return Promise.resolve();
  };
  
  // ตรวจสอบยืนยันรหัสผ่าน
  const validateConfirmPassword = (_, value) => {
    if (mode === 'edit' && !value && !form.getFieldValue('password')) {
      return Promise.resolve();
    }
    
    if (!value) {
      return Promise.reject('กรุณายืนยันรหัสผ่าน');
    }
    
    if (value !== form.getFieldValue('password')) {
      return Promise.reject('รหัสผ่านไม่ตรงกัน');
    }
    
    return Promise.resolve();
  };

  // สีและข้อความของ Strength Indicator
  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength < 3) return '#ff4d4f';
    if (passwordStrength < 5) return '#faad14';
    return '#52c41a';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength < 3) return 'ต่ำ';
    if (passwordStrength < 5) return 'ปานกลาง';
    return 'สูง';
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ 
        ...initialValues,
        role: initialValues.role || userRole,
        status: initialValues.status || 'active'
      }}
      onFinish={handleSubmit}
      requiredMark="optional"
      className="user-form"
    >
      {mode === 'edit' && (
        <Alert
          message="การแก้ไขข้อมูลผู้ใช้"
          description="คุณกำลังแก้ไขข้อมูลผู้ใช้งาน คุณสามารถแก้ไขข้อมูลได้ตามต้องการ หากต้องการเปลี่ยนรหัสผ่าน โปรดป้อนรหัสผ่านใหม่ หากต้องการคงรหัสผ่านเดิม ให้เว้นว่างไว้"
          type="info"
          showIcon
          className="mb-6"
        />
      )}
      
      <Card 
        className="mb-6" 
        title={
          <div className="flex items-center">
            <UserOutlined className="mr-2 text-blue-500" />
            <span>รูปโปรไฟล์</span>
          </div>
        }
        bordered={false}
      >
        <div className="flex flex-col sm:flex-row items-center">
          <div className="mb-4 sm:mb-0 sm:mr-6 flex flex-col items-center">
            <div className="mb-2">
              {previewImage ? (
                <div className="relative">
                  <UserAvatar 
                    user={{ ...initialValues, image: previewImage }} 
                    size={100}
                    showTooltip={false}
                  />
                  <Button 
                    danger
                    icon={<DeleteOutlined />} 
                    size="small"
                    shape="circle"
                    className="absolute -top-2 -right-2"
                    onClick={handleRemoveImage}
                    title="ลบรูปภาพ"
                  />
                </div>
              ) : (
                <UserAvatar 
                  user={initialValues} 
                  size={100}
                  showTooltip={false}
                />
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <Upload
              beforeUpload={() => false}
              onChange={({ fileList }) => handleImageUpload(fileList)}
              showUploadList={false}
              accept="image/*"
              maxCount={1}
            >
              <Button 
                icon={<UploadOutlined />} 
                type="primary" 
                ghost
                className="mb-2 hover:shadow-sm transition-shadow"
              >
                อัปโหลดรูปโปรไฟล์
              </Button>
            </Upload>
            <Text type="secondary" className="block text-xs">
              แนะนำ: รูปภาพควรมีขนาดไม่เกิน 2MB (รองรับไฟล์ JPG, PNG)
            </Text>
          </div>
        </div>
      </Card>
      
      <Card 
        className="mb-6" 
        title={
          <div className="flex items-center">
            <IdcardOutlined className="mr-2 text-blue-500" />
            <span>ข้อมูลส่วนตัว</span>
          </div>
        }
        bordered={false}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="username"
              label={
                <div className="flex items-center">
                  <span className="mr-1">ชื่อผู้ใช้</span>
                  <Tooltip title="ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 4 ตัวอักษร">
                    <InfoCircleOutlined className="text-gray-400" />
                  </Tooltip>
                </div>
              }
              rules={[
                { required: true, message: 'กรุณากรอกชื่อผู้ใช้' },
                { min: 4, message: 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 4 ตัวอักษร' }
              ]}
              tooltip={mode === 'edit' ? 'ไม่สามารถเปลี่ยนชื่อผู้ใช้ได้หลังจากสร้างบัญชีแล้ว' : null}
            >
              <Input 
                prefix={<UserOutlined className="site-form-item-icon" />} 
                placeholder="ชื่อผู้ใช้" 
                disabled={mode === 'edit'}
                className="rounded"
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label={
                <div className="flex items-center">
                  <span className="mr-1">อีเมล</span>
                  <Tooltip title="กรุณากรอกอีเมลให้ถูกต้อง">
                    <InfoCircleOutlined className="text-gray-400" />
                  </Tooltip>
                </div>
              }
              rules={[
                { required: true, message: 'กรุณากรอกอีเมล' },
                { 
                  validator: (_, value) => 
                    value && isValidEmail(value) 
                      ? Promise.resolve() 
                      : Promise.reject('รูปแบบอีเมลไม่ถูกต้อง') 
                }
              ]}
            >
              <Input 
                prefix={<MailOutlined className="site-form-item-icon" />} 
                placeholder="อีเมล"
                className="rounded" 
              />
            </Form.Item>
          </Col>
          
          <Col span={24}>
            <Form.Item
              name="full_name"
              label="ชื่อ-นามสกุล"
              rules={[
                { required: true, message: 'กรุณากรอกชื่อ-นามสกุล' }
              ]}
            >
              <Input 
                placeholder="ชื่อ-นามสกุล" 
                className="rounded"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>
      
      <Card 
        className="mb-6"
        title={
          <div className="flex items-center">
            <LockOutlined className="mr-2 text-blue-500" />
            <span>ตั้งค่ารหัสผ่าน</span>
          </div>
        }
        bordered={false}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="password"
              label={
                <div className="flex items-center">
                  <span className="mr-1">รหัสผ่าน</span>
                  <Tooltip title="รหัสผ่านควรมีความยาวอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวอักษรพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และอักขระพิเศษ">
                    <InfoCircleOutlined className="text-gray-400" />
                  </Tooltip>
                </div>
              }
              rules={[
                { required: mode === 'create', message: 'กรุณากรอกรหัสผ่าน' },
                { validator: validatePassword }
              ]}
              help={
                passwordFeedback && (
                  <div className="password-strength">
                    <div className="flex items-center mt-1">
                      <div className="flex-1 mr-2">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-full rounded-full transition-all duration-300" 
                            style={{ 
                              width: `${(passwordStrength / 5) * 100}%`,
                              backgroundColor: getPasswordStrengthColor() 
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-xs whitespace-nowrap" style={{ color: getPasswordStrengthColor() }}>
                        {getPasswordStrengthText()}
                      </div>
                    </div>
                    <div className="text-xs mt-1">{passwordFeedback}</div>
                  </div>
                )
              }
            >
              <Password 
                prefix={<LockOutlined className="site-form-item-icon" />} 
                placeholder={mode === 'create' ? "รหัสผ่าน" : "เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน"}
                className="rounded" 
                onChange={(e) => validatePassword('password', e.target.value)}
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="confirm_password"
              label="ยืนยันรหัสผ่าน"
              dependencies={['password']}
              rules={[
                { required: mode === 'create', message: 'กรุณายืนยันรหัสผ่าน' },
                { validator: validateConfirmPassword }
              ]}
            >
              <Password 
                prefix={<LockOutlined className="site-form-item-icon" />} 
                placeholder={mode === 'create' ? "ยืนยันรหัสผ่าน" : "เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน"}
                className="rounded" 
              />
            </Form.Item>
          </Col>
        </Row>
        
        {mode === 'create' && (
          <Alert
            message="คำแนะนำการตั้งรหัสผ่าน"
            description={
              <ul className="list-disc pl-5 mt-1">
                <li>ใช้รหัสผ่านที่มีความยาวอย่างน้อย 8 ตัวอักษร</li>
                <li>ควรมีตัวอักษรพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และอักขระพิเศษ</li>
                <li>หลีกเลี่ยงการใช้ข้อมูลส่วนตัวที่คาดเดาได้ง่าย</li>
              </ul>
            }
            type="info"
            showIcon
            className="mt-4"
          />
        )}
      </Card>
      
      <Card 
        className="mb-6" 
        title={
          <div className="flex items-center">
            <SafetyCertificateOutlined className="mr-2 text-blue-500" />
            <span>การตั้งค่าบัญชี</span>
          </div>
        }
        bordered={false}
        bodyStyle={{ padding: '12px 16px' }}
        size="small"
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="role"
              label="บทบาท"
              rules={[
                { required: true, message: 'กรุณาเลือกบทบาท' }
              ]}
            >
              <Select 
                placeholder="เลือกบทบาท"
                suffixIcon={<SafetyCertificateOutlined className="text-blue-500" />}
                className="rounded"
              >
                {Object.entries(USER_ROLE_NAMES).map(([key, value]) => (
                  <Option key={key} value={key}>
                    <div className="flex items-center">
                      {key === 'admin' && <SafetyCertificateOutlined className="mr-2 text-purple-500" />}
                      {key === 'student' && <UserOutlined className="mr-2 text-blue-500" />}
                      {key === 'visitor' && <UserOutlined className="mr-2 text-green-500" />}
                      {value}
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="status"
              label="สถานะ"
              rules={[
                { required: true, message: 'กรุณาเลือกสถานะ' }
              ]}
            >
              <Select 
                placeholder="เลือกสถานะ" 
                className="rounded"
              >
                {Object.entries(USER_STATUS_NAMES).map(([key, value]) => (
                  <Option key={key} value={key}>
                    <div className="flex items-center">
                      {key === 'active' ? (
                        <CheckCircleOutlined className="mr-2 text-green-500" />
                      ) : (
                        <ExclamationCircleOutlined className="mr-2 text-red-500" />
                      )}
                      {value}
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Card>
      
      <div className="flex justify-end space-x-2">
        <Button 
          onClick={onCancel}
          size="large"
          className="min-w-[100px]"
        >
          ยกเลิก
        </Button>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading}
          size="large"
          className="min-w-[120px] hover:shadow-md transition-shadow"
          icon={mode === 'create' ? <UserAddOutlined /> : <CheckCircleOutlined />}
        >
          {mode === 'create' ? 'สร้างผู้ใช้' : 'บันทึกการเปลี่ยนแปลง'}
        </Button>
      </div>

      <style jsx global>{`
        .user-form .ant-form-item-label {
          font-weight: 500;
        }
        .user-form .ant-input-affix-wrapper:hover,
        .user-form .ant-select-selector:hover {
          border-color: #40a9ff;
        }
        .user-form .ant-select-focused .ant-select-selector,
        .user-form .ant-input-affix-wrapper-focused {
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }
      `}</style>
    </Form>
  );
};

export default UserForm;