import React, { useState, useEffect, useMemo } from 'react';
import { Form, Input, Select, Upload, Button, Card, Row, Col, message } from 'antd';
import { UserOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import { URL } from '../../constants/apiEndpoints';
import { uploadUserProfileImage, adminUploadUserProfileImage } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const toDataUrl = (file) =>
  new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    } catch (err) {
      reject(err);
    }
  });

const getBase64 = toDataUrl;

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
  
  // Local selection for create flow (no existing user_id)
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Target user id for profile image uploads
  const targetUserId = initialValues?.user_id || initialValues?.id;

  // Set form values when initialValues change
  useEffect(() => {
    form.setFieldsValue(initialValues || {});
    
    // Reset local states
    setSelectedFile(null);
    setImagePreview(null);

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
    } else {
      setImageUrl(null);
      setFileList([]);
    }
  }, [form, initialValues]);

  // Revoke blob preview URL when changed/unmounted
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Calculate preview source with proper priority
  const previewSrc = useMemo(() => {
    // For create flow: prioritize local preview over server image
    if (!targetUserId) {
      if (imagePreview) return imagePreview;
      if (fileList.length > 0 && fileList[0].url) return fileList[0].url;
    }
    
    // For edit flow: prioritize server image
    if (imageUrl) return `${URL}/${imageUrl}`;
    if (fileList.length > 0 && fileList[0].url) return fileList[0].url;
    if (imagePreview) return imagePreview;
    
    return null;
  }, [targetUserId, imagePreview, fileList, imageUrl]);

  // Handle image upload status from Upload component
  const handleImageChange = async (info) => {
    const file = info?.file?.originFileObj || info?.file;
    
    // Create flow (no user id): generate preview and manage local state
    if (!targetUserId) {
      if (file && ['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setSelectedFile(file);
        
        try {
          const preview = await getBase64(file);
          setImagePreview(preview);
          setFileList([{
            uid: String(Date.now()),
            name: file.name || 'profile-image',
            status: 'done',
            url: preview,
            thumbUrl: preview,
            originFileObj: file,
          }]);
          // Clear server image URL since we have local preview
          setImageUrl(null);
        } catch (error) {
          console.error('Error generating preview:', error);
          message.error('ไม่สามารถสร้างตัวอย่างรูปภาพได้');
        }
      }
      return;
    }

    // Edit flow (has user id): let Upload manage the list; preview comes from server path
    setFileList(info.fileList || []);
    if (info?.file?.status === 'done') {
      const newImagePath = info.file.response?.filename || 
                           info.file.response?.data?.image || 
                           imageUrl;
      setImageUrl(newImagePath);
    }
  };

  // Validate file before upload
  const beforeUpload = (file) => {
    const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
    if (!isImage) {
      message.error('รองรับเฉพาะไฟล์ JPG, PNG หรือ GIF');
      return Upload.LIST_IGNORE;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('ขนาดไฟล์ต้องไม่เกิน 5MB');
      return Upload.LIST_IGNORE;
    }
    
    // In create flow (no user id yet), prevent auto upload so we can send with form submit
    if (!targetUserId) {
      return false; // antd will add to fileList and not upload
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
      
      // Choose proper endpoint: self update vs admin updating another user
      const uploader = isOwnProfile ? uploadUserProfileImage : adminUploadUserProfileImage;
      const resp = await uploader(targetUserId, file);
      
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
  const handleSubmit = async (values) => {
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

    // Attach image: for create flow send selected file; for edit send image path if present
    if (!isEdit && selectedFile) {
      formData.profileImage = selectedFile;
    } else if (imageUrl) {
      formData.image = imageUrl;
    }

    // Submit to parent
    try {
      if (onFinish) {
        const maybePromise = onFinish(formData);
        if (maybePromise && typeof maybePromise.then === 'function') {
          await maybePromise;
        }
      }
    } finally {
      // Clear form and local preview after creating a new user
      if (!isEdit) {
        clearForm();
      }
    }
  };

  // Clear form function
  const clearForm = () => {
    try {
      form.resetFields();
    } catch (e) {
      // ignore
    }
    
    // Clean up blob URL
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    
    setSelectedFile(null);
    setImagePreview(null);
    setImageUrl(null);
    setFileList([]);
  };

  // Handle remove image
  const handleRemoveImage = () => {
    if (!targetUserId) {
      // Create flow: clean up local preview
      if (imagePreview && imagePreview.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(imagePreview);
        } catch {
          // ignore
        }
      }
      setSelectedFile(null);
      setImagePreview(null);
      setImageUrl(null);
      setFileList([]);
    }
    return true;
  };

  // Upload button component
  const uploadButton = (
    <div>
      {uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div className="mt-2">เลือกรูปภาพ</div>
    </div>
  );

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
                  fileList={targetUserId ? fileList : []}
                  beforeUpload={beforeUpload}
                  customRequest={targetUserId ? handleCustomUpload : undefined}
                  accept="image/png,image/jpeg,image/gif"
                  onChange={handleImageChange}
                  maxCount={1}
                  onRemove={handleRemoveImage}
                >
                  {previewSrc ? (
                    <img
                      src={previewSrc}
                      alt="avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                      onError={(e) => {
                        const img = e.currentTarget;
                        img.onerror = null;
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
          <Button
            onClick={() => {
              clearForm();
              if (onCancel) onCancel();
            }}
            className="mr-2"
          >
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