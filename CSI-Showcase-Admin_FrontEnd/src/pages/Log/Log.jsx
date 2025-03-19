import React, { useState } from 'react';
import { Table, Button, Input, Modal, Form, Space, Select } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'; // Import icons directly
import 'tailwindcss/tailwind.css';

// Mock data for login history
const mockData = [
  {
    key: '1',
    username: 'john_doe',
    loginTime: '22 มิ.ย. 68 10:30 AM',
    ipAddress: '192.168.1.1',
    status: 'สำเร็จ', // Success
    details: 'Chrome, Windows 10',
  },
  {
    key: '2',
    username: 'jane_smith',
    loginTime: '22 มิ.ย. 68 11:00 AM',
    ipAddress: '192.168.1.2',
    status: 'ล้มเหลว', // Failed
    details: 'Firefox, MacOS',
  },
  {
    key: '3',
    username: 'alice_jones',
    loginTime: '22 มิ.ย. 68 11:30 AM',
    ipAddress: '192.168.1.3',
    status: 'สำเร็จ', // Success
    details: 'Safari, iPhone',
  },
  {
    key: '4',
    username: 'bob_brown',
    loginTime: '22 มิ.ย. 68 12:00 PM',
    ipAddress: '192.168.1.4',
    status: 'ล้มเหลว', // Failed
    details: 'Edge, Windows 7',
  },
];

const Log = () => {
  const [logData, setLogData] = useState(mockData);
  const [filteredData, setFilteredData] = useState(mockData);
  const [statusFilter, setStatusFilter] = useState(''); // For filtering status
  const [usernameFilter, setUsernameFilter] = useState(''); // For filtering username
  const [passwordVisible, setPasswordVisible] = useState({}); // State for each password visibility

  // Table columns
  const columns = [
    {
      title: 'ลำดับ',
      dataIndex: 'index',
      key: 'index',
      render: (_, __, index) => index + 1, // Display index as sequence number
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
            onClick={() => handleFilterData()}
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
      title: 'เวลาเข้าระบบ',
      dataIndex: 'loginTime',
      key: 'loginTime',
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
    {
      title: 'สถานะการเข้าใช้งาน',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'สำเร็จ', value: 'สำเร็จ' },
        { text: 'ล้มเหลว', value: 'ล้มเหลว' },
      ],
      onFilter: (value, record) => record.status.indexOf(value) === 0,
      render: (text) => (
        <span className={text === 'สำเร็จ' ? 'text-green-500' : 'text-red-500'}>{text}</span>
      ),
    },
    {
      title: 'รายละเอียดการเข้าใช้งาน',
      dataIndex: 'details',
      key: 'details',
    },
  ];

  // Handle filtering based on the selected filters
  const handleFilterData = () => {
    let filtered = mockData;

    if (statusFilter) {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    if (usernameFilter) {
      filtered = filtered.filter((item) =>
        item.username.toLowerCase().includes(usernameFilter.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  // Handle password visibility toggle
  const handlePasswordToggle = (key) => {
    setPasswordVisible((prevState) => ({
      ...prevState,
      [key]: !prevState[key], // Toggle visibility for the specific row
    }));
  };

  return (
    <div className="p-6">

      {/* Filters */}
      <div className="mb-4 flex space-x-4">
        <Select
          placeholder="กรองตามสถานะ"
          style={{ width: 200 }}
          onChange={(value) => setStatusFilter(value)}
          value={statusFilter}
        >
          <Select.Option value="">ทั้งหมด</Select.Option>
          <Select.Option value="สำเร็จ">สำเร็จ</Select.Option>
          <Select.Option value="ล้มเหลว">ล้มเหลว</Select.Option>
        </Select>

        <Button
          type="primary"
          onClick={handleFilterData}
          size="small"
          style={{ width: 90 }}
        >
          กรอง
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="key"
        pagination={{ pageSize: 5 }} // Pagination with 5 items per page
        bordered
      />
    </div>
  );
};

export default Log;
