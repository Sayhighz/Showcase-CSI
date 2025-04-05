import React, { useState, useEffect } from 'react';
import { Card, Typography, message, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

// Import services
import { getAllUsers, deleteUser } from '../../services/userService';

// Import custom components
import AdminFilter from '../../components/users/AdminFilter';
import AdminTable from '../../components/users/AdminTable';
import AdminForm from '../../components/users/AdminForm';
import AdminDeleteModal from '../../components/users/AdminDeleteModal';

const { Title } = Typography;

const Admin = () => {
  // State for users and loading
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for modal and form
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // State for filtering
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });

  // Load admins on component mount
  useEffect(() => {
    loadAdmins();
  }, []);

  // Apply filters when filter state changes
  useEffect(() => {
    filterAdmins();
  }, [admins, filters]);

  // Load admins from API
  const loadAdmins = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers({ role: 'admin' });
      setAdmins(data);
      setFilteredAdmins(data);
    } catch (error) {
      console.error('Failed to load admins:', error);
      message.error('ไม่สามารถโหลดข้อมูลผู้ดูแลระบบได้');
    } finally {
      setLoading(false);
    }
  };

  // Filter admins based on search and other criteria
  const filterAdmins = () => {
    let result = [...admins];

    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(admin => 
        admin.username.toLowerCase().includes(searchLower) ||
        admin.full_name.toLowerCase().includes(searchLower) ||
        admin.email.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (filters.status) {
      result = result.filter(admin => 
        admin.status === filters.status
      );
    }

    setFilteredAdmins(result);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: ''
    });
    setFilteredAdmins(admins);
  };

  // Open form modal for adding new admin
  const handleAddAdmin = () => {
    setSelectedAdmin(null);
    setIsEditing(false);
    setFormModalVisible(true);
  };

  // Open form modal for editing admin
  const handleEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    setIsEditing(true);
    setFormModalVisible(true);
  };

  // Show delete confirmation modal
  const handleShowDeleteModal = (admin) => {
    setSelectedAdmin(admin);
    setDeleteModalVisible(true);
  };

  // Perform admin deletion
  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      await deleteUser(selectedAdmin.user_id);
      message.success('ลบบัญชีผู้ดูแลระบบสำเร็จ');
      loadAdmins(); // Refresh admin list
      setDeleteModalVisible(false);
    } catch (error) {
      console.error('Failed to delete admin:', error);
      message.error('ไม่สามารถลบบัญชีผู้ดูแลระบบได้');
    }
  };

  // Callback after form submission (add/edit)
  const handleFormSubmit = () => {
    setFormModalVisible(false);
    loadAdmins(); // Refresh admin list
  };

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Title level={4}>จัดการบัญชีผู้ดูแลระบบ</Title>
          <button 
            onClick={handleAddAdmin}
            className="flex items-center justify-center px-4 py-2 bg-[#90278E] text-white rounded-md hover:bg-[#7B1A73] transition-colors"
          >
            <PlusOutlined className="mr-2" />
            เพิ่มบัญชีผู้ดูแล
          </button>
        </div>

        <AdminFilter 
          filters={filters}
          setFilters={setFilters}
          handleResetFilters={handleResetFilters}
        />

        <AdminTable 
          admins={filteredAdmins}
          loading={loading}
          handleEditAdmin={handleEditAdmin}
          handleShowDeleteModal={handleShowDeleteModal}
        />
      </Card>

      {/* Form Modal for Adding/Editing Admins */}
      <AdminForm 
        visible={formModalVisible}
        setVisible={setFormModalVisible}
        initialData={selectedAdmin}
        isEditing={isEditing}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Modal */}
      <AdminDeleteModal 
        visible={deleteModalVisible}
        setVisible={setDeleteModalVisible}
        admin={selectedAdmin}
        onDelete={handleDeleteAdmin}
      />
    </div>
  );
};

export default Admin;