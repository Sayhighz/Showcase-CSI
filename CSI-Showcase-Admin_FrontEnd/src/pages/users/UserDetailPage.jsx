import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Input, message } from 'antd';
import UserDetail from '../../components/users/UserDetail';
import UserForm from '../../components/users/UserForm';
import useUser from '../../hooks/useUser';

const UserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPwdModalVisible, setIsPwdModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const {
    userDetails,
    loading,
    error,
    updateUser,
    deleteUser,
    refreshUserDetails,
    actionLoading,
    changeUserPassword
  } = useUser('all', 'detail', {}, userId);
  console.log(userDetails)

  // แสดงโมดัลแก้ไขผู้ใช้
  const showEditModal = () => {
    setIsEditModalVisible(true);
  };

  // ซ่อนโมดัลแก้ไขผู้ใช้
  const hideEditModal = () => {
    setIsEditModalVisible(false);
  };

  // จัดการการแก้ไขผู้ใช้
  const handleUpdateUser = async (values) => {
    const success = await updateUser(userId, values);
    if (success) {
      hideEditModal();
      refreshUserDetails();
    }
  };

  // จัดการการลบผู้ใช้
  const handleDeleteUser = async () => {
    const success = await deleteUser(userId);
    if (success) {
      navigate('/users');
    }
  };

  // เปลี่ยนรหัสผ่าน - เปิด/ปิดโมดัล
  const openChangePasswordModal = () => {
    setNewPassword('');
    setConfirmPassword('');
    setIsPwdModalVisible(true);
  };
  const closeChangePasswordModal = () => {
    setIsPwdModalVisible(false);
  };

  // ยืนยันการเปลี่ยนรหัสผ่าน
  const handleConfirmChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      message.error('กรุณากรอกรหัสผ่านใหม่และยืนยันรหัสผ่าน');
      return;
    }
    if (newPassword.length < 8) {
      message.error('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }
    if (newPassword !== confirmPassword) {
      message.error('รหัสผ่านไม่ตรงกัน');
      return;
    }
    const ok = await changeUserPassword(userId, newPassword);
    if (ok) {
      setIsPwdModalVisible(false);
      refreshUserDetails();
    }
  };

  return (
    <div>
      <UserDetail
        user={userDetails}
        loading={loading}
        error={error}
        onEdit={showEditModal}
        onDelete={handleDeleteUser}
        onRefresh={refreshUserDetails}
        onChangePassword={openChangePasswordModal}
      />
      
      <Modal
        title="แก้ไขข้อมูลผู้ใช้"
        open={isEditModalVisible}
        onCancel={hideEditModal}
        footer={null}
        width={800}
      >
        <UserForm
          initialValues={userDetails}
          onFinish={handleUpdateUser}
          onCancel={hideEditModal}
          loading={actionLoading}
          isEdit={true}
        />
      </Modal>
      {/* Modal เปลี่ยนรหัสผ่าน */}
      <Modal
        title="เปลี่ยนรหัสผ่านผู้ใช้"
        open={isPwdModalVisible}
        onOk={handleConfirmChangePassword}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
        confirmLoading={actionLoading}
        onCancel={closeChangePasswordModal}
      >
        <div className="space-y-3">
          <div>
            <label className="block mb-1">รหัสผ่านใหม่</label>
            <Input.Password
              placeholder="อย่างน้อย 8 ตัวอักษร พร้อมตัวเลขและตัวอักษร"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1">ยืนยันรหัสผ่านใหม่</label>
            <Input.Password
              placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserDetailPage;