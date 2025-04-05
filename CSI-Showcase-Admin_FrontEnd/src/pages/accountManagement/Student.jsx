import React, { useState, useEffect } from 'react';
import { Card, Typography, message, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

// Import services
import { getAllUsers, deleteUser } from '../../services/userService';

// Import custom components
import StudentFilter from '../../components/users/StudentFilter';
import StudentTable from '../../components/users/StudentTable';
import StudentForm from '../../components/users/StudentForm';
import StudentDeleteModal from '../../components/users/StudentDeleteModal';

const { Title } = Typography;

const Student = () => {
  // State for users and loading
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for modal and form
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // State for filtering
  const [filters, setFilters] = useState({
    search: '',
    studyYear: '',
    status: ''
  });

  // Load students on component mount
  useEffect(() => {
    loadStudents();
  }, []);

  // Apply filters when filter state changes
  useEffect(() => {
    filterStudents();
    console.log(students)
  }, [students, filters]);

  // Load students from API
  // ในไฟล์ Student.jsx
const loadStudents = async () => {
  setLoading(true);
  try {
    const response = await getAllUsers();
    
    // ตรวจสอบและแปลงข้อมูลเป็น array
    const data = Array.isArray(response.users) ? response.users : response || [];
    console.log(data)
    
    // กรองเอาเฉพาะผู้ใช้งานที่เป็น student
    const students = data.filter(user => user.role === 'student');
    
    setStudents(students);
    setFilteredStudents(students);
  } catch (error) {
    console.error('Failed to load students:', error);
    message.error('ไม่สามารถโหลดข้อมูลนักศึกษาได้');
  } finally {
    setLoading(false);
  }
};

  // Filter students based on search and other criteria
  const filterStudents = () => {
    let result = Array.isArray(students) ? [...students] : [];
  
    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(student => 
        student.username.toLowerCase().includes(searchLower) ||
        student.full_name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower)
      );
    }
  
    // Filter by study year
    if (filters.studyYear) {
      result = result.filter(student => 
        student.study_year === filters.studyYear
      );
    }
  
    // Filter by status
    if (filters.status) {
      result = result.filter(student => 
        student.status === filters.status
      );
    }
  
    setFilteredStudents(result);
  };
  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      studyYear: '',
      status: ''
    });
    setFilteredStudents(students);
  };

  // Open form modal for adding new student
  const handleAddStudent = () => {
    setSelectedStudent(null);
    setIsEditing(false);
    setFormModalVisible(true);
  };

  // Open form modal for editing student
  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setIsEditing(true);
    setFormModalVisible(true);
  };

  // Show delete confirmation modal
  const handleShowDeleteModal = (student) => {
    setSelectedStudent(student);
    setDeleteModalVisible(true);
  };

  // Perform student deletion
  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;

    try {
      await deleteUser(selectedStudent.user_id);
      message.success('ลบบัญชีนักศึกษาสำเร็จ');
      loadStudents(); // Refresh student list
      setDeleteModalVisible(false);
    } catch (error) {
      console.error('Failed to delete student:', error);
      message.error('ไม่สามารถลบบัญชีนักศึกษาได้');
    }
  };

  // Callback after form submission (add/edit)
  const handleFormSubmit = () => {
    setFormModalVisible(false);
    loadStudents(); // Refresh student list
  };

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Title level={4}>จัดการบัญชีนักศึกษา</Title>
          <button 
            onClick={handleAddStudent}
            className="flex items-center justify-center px-4 py-2 bg-[#90278E] text-white rounded-md hover:bg-[#7B1A73] transition-colors"
          >
            <PlusOutlined className="mr-2" />
            เพิ่มบัญชีนักศึกษา
          </button>
        </div>

        <StudentFilter 
          filters={filters}
          setFilters={setFilters}
          handleResetFilters={handleResetFilters}
        />

        <StudentTable 
          students={filteredStudents}
          loading={loading}
          handleEditStudent={handleEditStudent}
          handleShowDeleteModal={handleShowDeleteModal}
        />
      </Card>

      {/* Form Modal for Adding/Editing Students */}
      <StudentForm 
        visible={formModalVisible}
        setVisible={setFormModalVisible}
        initialData={selectedStudent}
        isEditing={isEditing}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Modal */}
      <StudentDeleteModal 
        visible={deleteModalVisible}
        setVisible={setDeleteModalVisible}
        student={selectedStudent}
        onDelete={handleDeleteStudent}
      />
    </div>
  );
};

export default Student;