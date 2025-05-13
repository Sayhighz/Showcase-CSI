import React, { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/common/PageTitle";
import UserList from "../../components/users/UserList";
import UserForm from "../../components/users/UserForm";
import { Modal } from "antd";
import useUser from "../../hooks/useUser";

const StudentUsersPage = () => {
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
  } = useUser("student", "list");

  // แสดงโมดัลสร้างนักศึกษาใหม่
  const showCreateModal = () => {
    setIsModalVisible(true);
  };

  // ซ่อนโมดัลสร้างนักศึกษาใหม่
  const hideCreateModal = () => {
    setIsModalVisible(false);
  };

  // จัดการการสร้างนักศึกษาใหม่
  const handleCreateUser = async (values) => {
    // กำหนดค่า role เป็น student
    const userData = { ...values, role: "student" };
    const success = await createUser(userData);
    if (success) {
      hideCreateModal();
    }
  };

  return (
    <div>
      <PageTitle
        title="จัดการนักศึกษา"
        subtitle={`นักศึกษาทั้งหมด ${pagination.total || 0} คน`}
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
        role="user"
      />
      <Modal
        title="เพิ่มนักศึกษาใหม่"
        open={isModalVisible}
        onCancel={hideCreateModal}
        footer={null}
        width={800}
      >
        <UserForm
          initialValues={{ role: "student", status: "active" }}
          onFinish={handleCreateUser}
          onCancel={hideCreateModal}
          loading={actionLoading}
        />
      </Modal>
    </div>
  );
};

export default StudentUsersPage;
