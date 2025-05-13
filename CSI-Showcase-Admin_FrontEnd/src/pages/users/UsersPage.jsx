// src/pages/admin/UsersPage.jsx
import React, { useState } from "react";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/common/PageTitle";
import UserList from "../../components/users/UserList";
import UserForm from "../../components/users/UserForm";
import UserImportModal from "../../components/users/UserImportModal";
import { Modal, Button, Space } from "antd";
import useUser from "../../hooks/useUser";

const UsersPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
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
    // เพิ่มฟังก์ชันใหม่
    importUsers,
    downloadCSVTemplate,
    importLoading
  } = useUser("all", "list");

  // แสดงโมดัลสร้างผู้ใช้ใหม่
  const showCreateModal = () => {
    setIsModalVisible(true);
  };

  // ซ่อนโมดัลสร้างผู้ใช้ใหม่
  const hideCreateModal = () => {
    setIsModalVisible(false);
  };

  // จัดการการสร้างผู้ใช้ใหม่
  const handleCreateUser = async (values) => {
    const success = await createUser(values);
    if (success) {
      hideCreateModal();
    }
  };

  // แสดงโมดัลนำเข้าผู้ใช้
  const showImportModal = () => {
    setIsImportModalVisible(true);
  };

  // ซ่อนโมดัลนำเข้าผู้ใช้
  const hideImportModal = () => {
    setIsImportModalVisible(false);
  };

  return (
    <div>
      <PageTitle
        title="จัดการผู้ใช้ทั้งหมด"
        subtitle={`ผู้ใช้ทั้งหมด ${pagination.total || 0} คน`}
        actions={[
          <Space key="actions">
            <Button icon={<UploadOutlined />} onClick={showImportModal}>
              นำเข้าผู้ใช้
            </Button>
          </Space>
        ]}
      />

      <UserList
        users={users}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={handlePaginationChange}
        onDelete={deleteUser}
        onSearch={(value) => handleFilterChange({ search: value })}
        searchQuery={filters.search || ""}
        searchLoading={loading}
        onAddUser={showCreateModal}
        role="all"
      />

      {/* โมดัลสร้างผู้ใช้ใหม่ */}
      <Modal
        title="เพิ่มผู้ใช้ใหม่"
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

      {/* โมดัลนำเข้าผู้ใช้ */}
      <UserImportModal
        visible={isImportModalVisible}
        onCancel={hideImportModal}
        onImport={importUsers}
        onDownloadTemplate={downloadCSVTemplate}
        importLoading={importLoading}
      />
    </div>
  );
};

export default UsersPage;