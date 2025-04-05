import React, { useEffect, useState } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  Upload, 
  message, 
  Avatar 
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  UploadOutlined 
} from '@ant-design/icons';
import { uploadProfileImage, updateUser, registerUser } from '../../services/userService';

const AdminForm = ({ 
  visible, 
  setVisible, 
  initialData, 
  isEditing,
  onSubmit 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Reset form when modal opens or closes
  useEffect(() => {
    if (visible) {
      if (isEditing && initialData) {
        // Set initial form values for editing
        form.setFieldsValue({
          username: initialData.username,
          full_name: initialData.full_name,
          email: initialData.email,
          status: initialData.status || 'active'
        });
        setProfileImage(initialData.image);
      } else {
        // Reset form for adding new admin
        form.resetFields();
        setProfileImage(null);
        setImageFile(null);
      }
    }
  }, [visible, isEditing, initialData, form]);

  // Handle file upload
  const handleFileUpload = (info) => {
    const file = info.file.originFileObj;
    
    // Preview image
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
    };
    reader.readAsDataURL(file);
    
    setImageFile(file);
    return false; // Prevent default upload behavior
  };

  // Submit form
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Prepare form data
      const formData = new FormData();
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (isEditing) {
        // Update existing user
        const updateData = {
          username: values.username,
          full_name: values.full_name,
          email: values.email,
          status: values.status
        };

        await updateUser(initialData.user_id, updateData);

        // Upload profile image if exists
        if (imageFile) {
          await uploadProfileImage(initialData.user_id, formData);
        }

        message.success('อัปเดตข้อมูลผู้ดูแลระบบสำเร็จ');
      } else {
        // Create new admin user
        const newUserData = {
          username: values.username,
          password: values.password,
          full_name: values.full_name,
          email: values.email,
          role: 'admin'
        };

        const response = await registerUser(newUserData);
        
        // If image exists, upload after user creation
        if (imageFile) {
          await uploadProfileImage(response.data.user.id, formData);
        }

        message.success('เพิ่มบัญชีผู้ดูแลระบบสำเร็จ');
      }

      // Close modal and refresh list
      setVisible(false);
      onSubmit();
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEditing ? 'แก้ไขข้อมูลผู้ดูแลระบบ' : 'เพิ่มบัญชีผู้ดูแลระบบ'}
      open={visible}
      onCancel={() => setVisible(false)}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={isEditing ? 'บันทึก' : 'เพิ่ม'}
      cancelText="ยกเลิก"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        {/* Profile Image Upload */}
        <div className="flex justify-center mb-6">
          <Upload
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleFileUpload}
          >
            {profileImage ? (
              <Avatar 
                src={profileImage} 
                size={120} 
                icon={<UserOutlined />} 
                className="object-cover"
              />
            ) : (
              <div>
                <UploadOutlined />
                <div className="mt-2">อัปโหลดรูปโปรไฟล์</div>
              </div>
            )}
          </Upload>
        </div>

        {/* Username */}
        <Form.Item
          name="username"
          label="ชื่อผู้ใช้"
          rules={[
            { required: true, message: 'กรุณากรอกชื่อผู้ใช้' },
            { 
              pattern: /^[a-zA-Z0-9_]+$/, 
              message: 'ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษร ตัวเลข และ underscore เท่านั้น' 
            }
          ]}
        >
          <Input 
            prefix={<UserOutlined className="text-gray-400" />} 
            placeholder="กรอกชื่อผู้ใช้" 
            disabled={isEditing}
          />
        </Form.Item>

        {/* Password (only for new users) */}
        {!isEditing && (
          <Form.Item
            name="password"
            label="รหัสผ่าน"
            rules={[
              { required: true, message: 'กรุณากรอกรหัสผ่าน' },
              { 
                min: 8, 
                message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' 
              }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              placeholder="กรอกรหัสผ่าน" 
            />
          </Form.Item>
        )}

        {/* Full Name */}
        <Form.Item
          name="full_name"
          label="ชื่อ-นามสกุล"
          rules={[{ required: true, message: 'กรุณากรอกชื่อ-นามสกุล' }]}
        >
          <Input 
            prefix={<UserOutlined className="text-gray-400" />} 
            placeholder="กรอกชื่อ-นามสกุล" 
          />
        </Form.Item>

        {/* Email */}
        <Form.Item
          name="email"
          label="อีเมล"
          rules={[
            { required: true, message: 'กรุณากรอกอีเมล' },
            { type: 'email', message: 'กรุณากรอกอีเมลให้ถูกต้อง' }
          ]}
        >
          <Input 
            prefix={<MailOutlined className="text-gray-400" />} 
            placeholder="กรอกอีเมล" 
          />
        </Form.Item>

        {/* Status */}
        {isEditing && (
          <Form.Item
            name="status"
            label="สถานะ"
            rules={[{ required: true, message: 'กรุณาเลือกสถานะ' }]}
          >
            <Select placeholder="เลือกสถานะ">
              <Select.Option value="active">ใช้งานอยู่</Select.Option>
              <Select.Option value="inactive">ระงับการใช้งาน</Select.Option>
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default AdminForm;