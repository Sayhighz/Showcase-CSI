import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Upload, message, Avatar } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  BookOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  uploadProfileImage,
  updateUser,
  registerUser,
} from "../../services/userService";

const { Option } = Select;

const StudentForm = ({
  visible,
  setVisible,
  initialData,
  isEditing,
  onSubmit,
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
          study_year: initialData.study_year
            ? initialData.study_year.toString()
            : undefined,
          status: initialData.status || "active",
        });
        setProfileImage(initialData.image);
      } else {
        // Reset form for adding new student
        form.resetFields();
        setProfileImage(null);
        setImageFile(null);
      }
    }
  }, [visible, isEditing, initialData, form]);

  // Handle file upload
  const handleFileUpload = (info) => {
    // The file is directly available in info.file, not in info.file.originFileObj
    const file = info.file;
    
    // Only proceed if there's a valid file object
    if (file && file instanceof Blob) {
      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
      
      setImageFile(file);
    } else {
      console.warn('Invalid file object received:', info.file);
    }
    
    return false; // Prevent default upload behavior
  };

  // Submit form
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Prepare form data
      const formData = new FormData();
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (isEditing) {
        // Update existing user
        const updateData = {
          username: values.username,
          full_name: values.full_name,
          email: values.email,
          status: values.status,
        };

        // Only add study_year if it's provided
        if (values.study_year) {
          updateData.study_year = values.study_year;
        }

        await updateUser(initialData.user_id, updateData);

        // Upload profile image if exists
        if (imageFile) {
          await uploadProfileImage(initialData.user_id, formData);
        }

        message.success("อัปเดตข้อมูลนักศึกษาสำเร็จ");
      } else {
        // Create new user
        const newUserData = {
          username: values.username,
          password: values.password,
          full_name: values.full_name,
          email: values.email,
          role: "student",
          study_year: values.study_year,
        };

        const response = await registerUser(newUserData);

        // If image exists, upload after user creation
        if (imageFile) {
          await uploadProfileImage(response.data.user.id, formData);
        }

        message.success("เพิ่มบัญชีนักศึกษาสำเร็จ");
      }

      // Close modal and refresh list
      setVisible(false);
      onSubmit();
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error(
        error.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEditing ? "แก้ไขข้อมูลนักศึกษา" : "เพิ่มบัญชีนักศึกษา"}
      open={visible}
      onCancel={() => setVisible(false)}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={isEditing ? "บันทึก" : "เพิ่ม"}
      cancelText="ยกเลิก"
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Profile Image Upload */}
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

        {/* Username */}
        <Form.Item
          name="username"
          label="ชื่อผู้ใช้"
          rules={[
            { required: true, message: "กรุณากรอกชื่อผู้ใช้" },
            {
              pattern: /^[a-zA-Z0-9_]+$/,
              message:
                "ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษร ตัวเลข และ underscore เท่านั้น",
            },
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
              { required: true, message: "กรุณากรอกรหัสผ่าน" },
              {
                min: 6,
                message: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร",
              },
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
          rules={[{ required: true, message: "กรุณากรอกชื่อ-นามสกุล" }]}
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
            { required: true, message: "กรุณากรอกอีเมล" },
            { type: "email", message: "กรุณากรอกอีเมลให้ถูกต้อง" },
          ]}
        >
          <Input
            prefix={<MailOutlined className="text-gray-400" />}
            placeholder="กรอกอีเมล"
          />
        </Form.Item>

        {/* Study Year */}
        <Form.Item name="study_year" label="ชั้นปี">
          <Select
            placeholder="เลือกชั้นปี"
            allowClear
            prefix={<BookOutlined className="text-gray-400" />}
          >
            <Option value="1">ปี 1</Option>
            <Option value="2">ปี 2</Option>
            <Option value="3">ปี 3</Option>
            <Option value="4">ปี 4</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StudentForm;
