import React, { useState } from 'react';
import { Table, Button, Input, Modal, Form, Space, Select } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'; // Import icons directly

// Mock data for student accounts
const mockData = [
  {
    key: '1',
    username: 'john_doe',
    password: '1234',
    lastUpdated: '22 มี.ค. 68',
    addedBy: 'admin',
  },
  {
    key: '2',
    username: 'jane_smith',
    password: '1234',
    lastUpdated: '20 มี.ค. 68',
    addedBy: 'admin',
  },
  {
    key: '3',
    username: 'alice_jones',
    password: '1234',
    lastUpdated: '18 มี.ค. 68',
    addedBy: 'admin',
  },
  {
    key: '4',
    username: 'bob_brown',
    password: '1234',
    lastUpdated: '15 มี.ค. 68',
    addedBy: 'admin',
  },
];

const Student = () => {
  const [studentData, setStudentData] = useState(mockData);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState({}); // State for each password visibility
  const [usernameFilter, setUsernameFilter] = useState(''); // Username filter
  const [addedByFilter, setAddedByFilter] = useState(''); // AddedBy filter
  const [filteredData, setFilteredData] = useState(mockData); // State for filtered data

  // Table columns
  const columns = [
    {
      title: 'ลำดับ',
      dataIndex: 'index',
      key: 'index',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'ชื่อผู้ใช้',
      dataIndex: 'username',
      key: 'username',
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="ค้นหาชื่อผู้ใช้"
            value={usernameFilter}
            onChange={(e) => setUsernameFilter(e.target.value)}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={handleFilterData}
            size="small"
            style={{ width: 90, marginBottom: 8 }}
          >
            กรอง
          </Button>
        </div>
      ),
      onFilter: (value, record) => record.username.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'รหัสผ่าน',
      dataIndex: 'password',
      key: 'password',
      render: (text, record) => (
        <Space>
          <span>{passwordVisible[record.key] ? text : '******'}</span>
          <EyeOutlined 
            style={{ color: '#1890ff', cursor: 'pointer' }} 
            onClick={() => handlePasswordToggle(record.key)} 
          />
        </Space>
      ),
    },
    {
      title: 'อัพเดทล่าสุด',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
    },
    {
      title: 'เพิ่มโดย',
      dataIndex: 'addedBy',
      key: 'addedBy',
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="ค้นหาผู้เพิ่ม"
            value={addedByFilter}
            onChange={(e) => setAddedByFilter(e.target.value)}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={handleFilterData}
            size="small"
            style={{ width: 90, marginBottom: 8 }}
          >
            กรอง
          </Button>
        </div>
      ),
      onFilter: (value, record) => record.addedBy.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'ดำเนินการ',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="primary"
            size="small"
          >
            แก้ไข
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.key)}
            danger
            type="primary"
            size="small"
          >
            ลบ
          </Button>
        </Space>
      ),
    },
  ];

  // Handle Edit action
  const handleEdit = (student) => {
    setCurrentStudent(student);
    setIsModalVisible(true);
  };

  // Handle Delete action with confirmation
  const handleDelete = (key) => {
    Modal.confirm({
      title: 'คุณแน่ใจหรือไม่?',
      content: 'คุณต้องการลบบัญชีผู้ใช้นักศึกษานี้หรือไม่?',
      okText: 'ใช่, ลบเลย',
      cancelText: 'ยกเลิก',
      onOk: () => {
        setStudentData(studentData.filter((student) => student.key !== key));
      },
    });
  };

  // Toggle Password Visibility
  const handlePasswordToggle = (key) => {
    setPasswordVisible((prevState) => ({
      ...prevState,
      [key]: !prevState[key], // Toggle visibility for the specific row
    }));
  };

  // Handle Modal Close
  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentStudent(null);
  };

  // Handle Form Submit (Update Student Data)
  const handleUpdate = (values) => {
    const updatedData = studentData.map((student) =>
      student.key === currentStudent.key ? { ...student, ...values } : student
    );
    setStudentData(updatedData);
    handleCancel();
  };

  // Handle filter data based on username and addedBy
  const handleFilterData = () => {
    let filtered = mockData;

    if (usernameFilter) {
      filtered = filtered.filter((student) =>
        student.username.toLowerCase().includes(usernameFilter.toLowerCase())
      );
    }

    if (addedByFilter) {
      filtered = filtered.filter((student) =>
        student.addedBy.toLowerCase().includes(addedByFilter.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  return (
    <div className="p-6">
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="key"
        pagination={{ pageSize: 5 }} // Pagination with 5 items per page
        bordered
      />
      
      {/* Edit Modal */}
      <Modal
        title="แก้ไขข้อมูลบัญชีผู้ใช้นักศึกษา"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          initialValues={{
            username: currentStudent?.username,
            password: currentStudent?.password,
          }}
          onFinish={handleUpdate}
        >
          <Form.Item
            label="ชื่อผู้ใช้"
            name="username"
            rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="รหัสผ่าน"
            name="password"
            rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item className="flex justify-end">
            <Button type="primary" htmlType="submit" className="mr-2">
              อัปเดต
            </Button>
            <Button onClick={handleCancel}>ยกเลิก</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Student;
