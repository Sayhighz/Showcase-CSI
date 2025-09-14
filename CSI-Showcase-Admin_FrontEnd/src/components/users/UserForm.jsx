import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Upload, Button, Card, Row, Col, message } from 'antd';
import { UserOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import { URL } from '../../constants/apiEndpoints';
import { uploadUserProfileImage } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const { Option } = Select;

const UserForm = ({
  initialValues = {},
  loading = false,
  onFinish,
  onCancel,
  isEdit = false,
  isOwnProfile = false,
}) => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState(initialValues?.image || null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const { updateUserData } = useAuth();
  const [imgTs, setImgTs] = useState(Date.now());

  // Set form values when initialValues change
  useEffect(() => {
    form.setFieldsValue(initialValues || {});

    if (initialValues?.image) {
      setImageUrl(initialValues.image);
      setFileList([
        {
          uid: '-1',
          name: 'profile-image.png',
          status: 'done',
          url: `${URL}/${initialValues.image}`,
        },
      ]);
    }
  }, [form, initialValues]);

  // refresh preview cache-buster whenever imageUrl changes
  useEffect(() => {
    setImgTs(Date.now());
  }, [imageUrl]);

  // Handle image upload status from Upload component
  const handleImageChange = (info) => {
    // Keep file list in sync with Upload
    setFileList(info.fileList);

    // When using customRequest, show notifications only in handleCustomUpload to avoid duplicates.
    if (info.file.status === 'done') {
      setImageUrl(info.file.response?.filename || info.file.response?.data?.image || imageUrl);
    }
    // Do not toggle uploadLoading or show message here; handleCustomUpload manages those.
  };

  // Target user id for profile image uploads
  const targetUserId = initialValues?.user_id || initialValues?.id;

  // Validate file before upload
  const beforeUpload = (file) => {
    const isImage = ['image/jpeg','image/png','image/gif'].includes(file.type);
    if (!isImage) {
      message.error('รองรับเฉพาะไฟล์ JPG, PNG หรือ GIF');
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('ขนาดไฟล์ต้องไม่เกิน 5MB');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  // Custom upload via API
  const handleCustomUpload = async ({ file, onSuccess, onError }) => {
    try {
      if (!targetUserId) {
        message.error('ไม่พบรหัสผู้ใช้สำหรับอัปโหลดรูปโปรไฟล์');
        onError(new Error('Missing user id'));
        return;
      }
      setUploadLoading(true);
      const resp = await uploadUserProfileImage(targetUserId, file);
      if (!resp.success) {
        throw new Error(resp.message || 'อัปโหลดรูปโปรไฟล์ไม่สำเร็จ');
      }
      const updatedUser = resp?.data?.user || resp?.user || resp?.data?.data?.user || null;
      const newImagePath = updatedUser?.image || resp?.data?.image || resp?.image || null;

      if (newImagePath) {
        setImageUrl(newImagePath);
        setFileList([
          {
            uid: String(Date.now()),
            name: file.name,
            status: 'done',
            url: `${URL}/${newImagePath}`,
          },
        ]);
        // Immediately update auth context so header/sidebar refresh the avatar
        if (isOwnProfile && typeof updateUserData === 'function') {
          updateUserData({ image: newImagePath });
        }
        // Bump local timestamp to bypass browser cache on preview
        setImgTs(Date.now());
      }
      message.success('อัปโหลดรูปภาพสำเร็จ');
      onSuccess(resp, file);
    } catch (e) {
      console.error('Profile image upload error:', e);
      message.error(e.message || 'อัปโหลดรูปภาพล้มเหลว');
      onError(e);
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (values) => {
    // Prepare the data according to API requirements
    const formData = {
      full_name: values.full_name,
      email: values.email,
    };

    // Add username only when not editing own profile
    if (!isOwnProfile) {
      formData.username = values.username;
    }

    // Add role only when not editing own profile
    if (!isOwnProfile && values.role) {
      formData.role = values.role;
    }

    // Add password only for new users
    if (!isEdit && values.password) {
      formData.password = values.password;
    }

    // Add image if available
    if (imageUrl) {
      formData.image = imageUrl;
    }

    if (onFinish) {
      onFinish(formData);
    }
  };

  // Upload button component
  const uploadButton = (
    <div>
      {uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div className="mt-2">เลือกรูปภาพ</div>
    </div>
  );

  // Upload configuration
//   const uploadProps = {
//     name: 'profileImage',
//     action: '/api/admin/upload/profile-image',
//     headers: {
//       authorization: 'auth-token',
//     },
//     fileList,
//     onChange: handleImageChange,
//     accept: 'image/png, image/jpeg, image/gif',
//     maxCount: 1,
//   };

  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
      >
        <Row gutter={24}>
          <Col xs={24} md={8} className="mb-4 text-center">
            <Form.Item
              name="profileImage"
              label="รูปโปรไฟล์"
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                if (Array.isArray(e)) {
                  return e;
                }
                return e && e.fileList;
              }}
            >
              <ImgCrop rotationSlider>
                <Upload
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  fileList={fileList}
                  beforeUpload={beforeUpload}
                  customRequest={handleCustomUpload}
                  accept="image/png,image/jpeg,image/gif"
                  onChange={handleImageChange}
                >
                  {imageUrl ? (
                    <img
                      src={`${URL}/${imageUrl}${imgTs ? `?v=${imgTs}` : ''}`}
                      alt="avatar"
                      style={{ width: '100%' }}
                      loading="lazy"
                      onError={(e) => {
                        const img = e.currentTarget;
                        // ป้องกันการ onError loop กรณี fallback โหลดไม่ได้
                        img.onerror = null;
                        // ใช้ data URI ที่มีอยู่แน่นอน เพื่อตัดปัญหา 404 ซ้ำ
                        img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
                      }}
                    />
                  ) : (
                    uploadButton
                  )}
                </Upload>
              </ImgCrop>
            </Form.Item>
            <div className="text-gray-500 text-sm mt-2">
              แนะนำรูปภาพขนาด 300x300 พิกเซล<br />
              รองรับไฟล์ JPG, PNG และ GIF
            </div>
          </Col>
          
          <Col xs={24} md={16}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="username"
                  label="ชื่อผู้ใช้"
                  rules={[
                    { required: true, message: 'กรุณาระบุชื่อผู้ใช้' },
                    { min: 4, message: 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 4 ตัวอักษร' },
                    { max: 20, message: 'ชื่อผู้ใช้ต้องมีความยาวไม่เกิน 20 ตัวอักษร' },
                    { 
                      pattern: /^[a-zA-Z0-9_]+$/, 
                      message: 'ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษรภาษาอังกฤษ ตัวเลข และเครื่องหมาย _ เท่านั้น' 
                    }
                  ]}
                >
                  <Input prefix={<UserOutlined />} placeholder="ชื่อผู้ใช้" disabled={isEdit} />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="full_name"
                  label="ชื่อ-นามสกุล"
                  rules={[
                    { required: true, message: 'กรุณาระบุชื่อ-นามสกุล' }
                  ]}
                >
                  <Input placeholder="ชื่อ-นามสกุล" />
                </Form.Item>
              </Col>
              
              <Col xs={24}>
                <Form.Item
                  name="email"
                  label="อีเมล"
                  rules={[
                    { required: true, message: 'กรุณาระบุอีเมล' },
                    { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' }
                  ]}
                >
                  <Input placeholder="อีเมล" />
                </Form.Item>
              </Col>
              
              {!isEdit && (
                <Col xs={24} md={12}>
                  <Form.Item
                    name="password"
                    label="รหัสผ่าน"
                    rules={[
                      { required: !isEdit, message: 'กรุณาระบุรหัสผ่าน' },
                      { min: 8, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' },
                      { 
                        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, 
                        message: 'รหัสผ่านต้องประกอบด้วยตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข' 
                      }
                    ]}
                  >
                    <Input.Password placeholder="รหัสผ่าน" />
                  </Form.Item>
                </Col>
              )}
              
              {!isEdit && (
                <Col xs={24} md={12}>
                  <Form.Item
                    name="confirm_password"
                    label="ยืนยันรหัสผ่าน"
                    dependencies={['password']}
                    rules={[
                      { required: !isEdit, message: 'กรุณายืนยันรหัสผ่าน' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('รหัสผ่านไม่ตรงกัน'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="ยืนยันรหัสผ่าน" />
                  </Form.Item>
                </Col>
              )}
              
              {!isOwnProfile && (
                <Col xs={24} md={12}>
                  <Form.Item
                    name="role"
                    label="บทบาท"
                    rules={[
                      { required: true, message: 'กรุณาเลือกบทบาท' }
                    ]}
                    initialValue="student"
                  >
                    <Select placeholder="เลือกบทบาท">
                      <Option value="admin">ผู้ดูแลระบบ</Option>
                      <Option value="student">นักศึกษา</Option>
                      <Option value="visitor">ผู้เยี่ยมชม</Option>
                    </Select>
                  </Form.Item>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
        
        <Form.Item className="mt-4 text-right">
          <Button onClick={onCancel} className="mr-2">
            ยกเลิก
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างผู้ใช้'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default UserForm;