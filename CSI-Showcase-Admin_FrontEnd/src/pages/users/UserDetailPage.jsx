import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal } from 'antd';
import UserDetail from '../../components/users/UserDetail';
import UserForm from '../../components/users/UserForm';
import useUser from '../../hooks/useUser';

const UserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  
  const {
    userDetails,
    loading,
    error,
    updateUser,
    deleteUser,
    refreshUserDetails,
    actionLoading
  } = useUser('all', 'detail', {}, userId);

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

  return (
    <div>
      <UserDetail
        user={userDetails}
        loading={loading}
        error={error}
        onEdit={showEditModal}
        onDelete={handleDeleteUser}
        onRefresh={refreshUserDetails}
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
    </div>
  );
};

export default UserDetailPage;