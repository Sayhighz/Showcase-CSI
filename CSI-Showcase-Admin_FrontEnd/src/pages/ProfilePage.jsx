import React, { useState, useEffect, useCallback } from 'react';
import { Card, Modal, Input, message, Spin } from 'antd';
import PageTitle from '../components/common/PageTitle';
import UserDetail from '../components/users/UserDetail';
import UserForm from '../components/users/UserForm';
import { useAuth } from '../context/AuthContext';
import { updateMyProfile, changeMyPassword } from '../services/userService';

const ProfilePage = () => {
  const { user: authUser, updateUserData } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Map auth user data to match UserDetail component expectations
  const mapUserData = useCallback((userData) => {
    return {
      user_id: userData.id || userData.user_id,
      username: userData.username,
      full_name: userData.full_name || userData.fullName,
      email: userData.email,
      image: userData.avatar || userData.image, // Use avatar from auth context
      imageVersion: userData.imageVersion || userData.imageUpdatedAt || userData.updatedAt || null,
      role: userData.role,
      created_at: userData.created_at || userData.createdAt,
      projects: [], // We'll populate this if needed
      loginHistory: [], // We'll populate this if needed
      stats: userData.stats || {}
    };
  }, []);

  // Update user details when auth user changes
  useEffect(() => {
    if (authUser) {
      setUserDetails(mapUserData(authUser));
    }
  }, [authUser, mapUserData]);

  const handleUpdateUser = async (values) => {
    if (!authUser?.id) return;
  
    try {
      const response = await updateMyProfile(values);
      if (response.success) {
        // Try to extract updated user from response
        const updatedUser =
          response.data?.user ||
          response.user ||
          response.data ||
          null;
  
        // Update user data in auth context so sidebar and Profile detail reflect changes
        if (updatedUser) {
          updateUserData({
            full_name: updatedUser.full_name || authUser.full_name,
            email: updatedUser.email || authUser.email,
            image: updatedUser.image || values.image || authUser.image
          });
        } else if (values) {
          // Fallback: merge what user submitted (in case backend doesn't echo)
          updateUserData({
            ...(values.full_name ? { full_name: values.full_name } : {}),
            ...(values.email ? { email: values.email } : {}),
            ...(values.image ? { image: values.image } : {})
          });
        }
  
        setEditModalVisible(false);
        message.success('บันทึกโปรไฟล์สำเร็จ');
        // userDetails will be synced by useEffect when authUser updates
      } else {
        message.error(response.message || 'เกิดข้อผิดพลาดในการบันทึกโปรไฟล์');
      }
    } catch {
      message.error('เกิดข้อผิดพลาดในการบันทึกโปรไฟล์');
    }
  };

  const handleChangePassword = async () => {
    if (!authUser?.id) return;
    if (!newPassword || newPassword.length < 8) {
      message.error('รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }
    if (newPassword !== confirmPassword) {
      message.error('รหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      const response = await changeMyPassword(newPassword);
      if (response.success) {
        setPasswordModalVisible(false);
        setNewPassword('');
        setConfirmPassword('');
        message.success('เปลี่ยนรหัสผ่านสำเร็จ');
      } else {
        message.error(response.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
      }
    } catch {
      message.error('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
    }
  };

  if (!authUser?.id) {
    return (
      <div className="space-y-6">
        <PageTitle title="โปรไฟล์ของฉัน" subtitle="กำลังตรวจสอบสิทธิ์..." />
        <Card>
          <Spin />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle title="โปรไฟล์ของฉัน" subtitle="ดูและแก้ไขข้อมูลบัญชี" />

      <Card className="shadow-md">
        <UserDetail
          user={userDetails}
          loading={false}
          onEdit={() => setEditModalVisible(true)}
          onChangePassword={() => setPasswordModalVisible(true)}
          onDelete={null} // Users cannot delete their own accounts
          isOwnProfile={true}
        />
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        title="แก้ไขโปรไฟล์"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <UserForm
          isEdit
          initialValues={userDetails ? { ...userDetails, username: userDetails.username } : {}}
          onFinish={handleUpdateUser}
          onCancel={() => setEditModalVisible(false)}
          isOwnProfile={true}
        />
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title="เปลี่ยนรหัสผ่าน"
        open={passwordModalVisible}
        onOk={handleChangePassword}
        onCancel={() => {
          setPasswordModalVisible(false);
          setNewPassword('');
          setConfirmPassword('');
        }}
        okText="บันทึก"
        cancelText="ยกเลิก"
        destroyOnClose
      >
        <p className="text-gray-600 mb-4">กรอกรหัสผ่านใหม่ของคุณ</p>
        <div className="space-y-3">
          <Input.Password
            placeholder="รหัสผ่านใหม่"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input.Password
            placeholder="ยืนยันรหัสผ่านใหม่"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;