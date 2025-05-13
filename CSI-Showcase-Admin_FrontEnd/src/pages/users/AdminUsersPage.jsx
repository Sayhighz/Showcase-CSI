import React, { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/common/PageTitle";
import UserList from "../../components/users/UserList";
import UserForm from "../../components/users/UserForm";
import { Modal } from "antd";
import useUser from "../../hooks/useUser";

const AdminUsersPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  const {
    users,
    loading,
    error,
    pagination,
    filters,
    handleFilterChange,
    handlePaginationChange,
    createUser,
    deleteUser,
    resetFilters,
    actionLoading,
  } = useUser("admin", "list");

  // แสดงโมดัลสร้างผู้ดูแลระบบใหม่
  const showCreateModal = () => {
    setIsModalVisible(true);
  };

  // ซ่อนโมดัลสร้างผู้ดูแลระบบใหม่
  const hideCreateModal = () => {
    setIsModalVisible(false);
  };

  // จัดการการสร้างผู้ดูแลระบบใหม่
  const handleCreateUser = async (values) => {
    // กำหนดค่า role เป็น admin
    const userData = { ...values, role: "admin" };
    const success = await createUser(userData);
    if (success) {
      hideCreateModal();
    }
  };

  return (
    <div>
      <PageTitle
        title="จัดการผู้ดูแลระบบ"
        subtitle={`ผู้ดูแลระบบทั้งหมด ${pagination.total || 0} คน`}
      />
      <UserList
        users={users}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={handlePaginationChange} // ฟังก์ชันนี้ถูกแก้ไขใน useUser hook แล้ว
        onDelete={deleteUser}
        onSearch={(value) => handleFilterChange({ search: value })}
        searchQuery={filters.search || ""}
        searchLoading={loading}
        onAddUser={showCreateModal}
        role="admin"
      />
      <Modal
        title="เพิ่มผู้ดูแลระบบใหม่"
        open={isModalVisible}
        onCancel={hideCreateModal}
        footer={null}
        width={800}
      >
        <UserForm
          initialValues={{ role: "admin", status: "active" }}
          onFinish={handleCreateUser}
          onCancel={hideCreateModal}
          loading={actionLoading}
        />
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
