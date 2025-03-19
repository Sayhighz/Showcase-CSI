import React, { useState } from 'react';
import { Table, Button, Select, Input, Modal, Form, Input as AntInput } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined } from '@ant-design/icons';

// Mock data
const mockData = [
  { key: '1', projectName: 'Project A', description: 'Description of project A', status: 'pending', addedBy: 'User A', lastUpdated: '2023-03-10' },
  { key: '2', projectName: 'Project B', description: 'Description of project B', status: 'pending', addedBy: 'User B', lastUpdated: '2023-03-11' },
  { key: '3', projectName: 'Project C', description: 'Description of project C', status: 'approved', addedBy: 'User C', lastUpdated: '2023-03-12' },
  { key: '4', projectName: 'Project D', description: 'Description of project D', status: 'rejected', addedBy: 'User D', lastUpdated: '2023-03-13' },
  { key: '5', projectName: 'Project E', description: 'Description of project E', status: 'pending', addedBy: 'User E', lastUpdated: '2023-03-14' },
];

// Project Management Component
const Project = () => {
  const [filteredData, setFilteredData] = useState(mockData);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Columns for Table
  const columns = [
    {
      title: 'ลำดับ',
      dataIndex: 'index',
      key: 'index',
      render: (_, __, index) => index + 1, // Display the index + 1 for sequence number
    },
    {
      title: 'ชื่อผลงาน',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (text) => (
        <span
          className={`${
            text === 'approved' ? 'text-green-500' : text === 'rejected' ? 'text-red-500' : 'text-yellow-500'
          }`}
        >
          {text.charAt(0).toUpperCase() + text.slice(1)}
        </span>
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
    },
    {
      title: '',
      key: 'actions',
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button
            onClick={() => handleApprove(record.key)}
            icon={<CheckCircleOutlined />}
            disabled={record.status === 'approved'}
            className="text-green-500"
          >
            อนุมัติ
          </Button>
          <Button
            onClick={() => handleReject(record)}
            icon={<CloseCircleOutlined />}
            disabled={record.status === 'rejected'}
            className="text-red-500"
          >
            ปฏิเสธ
          </Button>
        </div>
      ),
    },
  ];

  // Handle Approve
  const handleApprove = (key) => {
    const updatedData = filteredData.map((project) =>
      project.key === key ? { ...project, status: 'approved', lastUpdated: new Date().toLocaleDateString() } : project
    );
    setFilteredData(updatedData);
  };

  // Handle Reject
  const handleReject = (project) => {
    setCurrentProject(project);
    setIsRejectModalVisible(true);
  };

  // Handle Filter Change
  const handleFilterChange = (value) => {
    setStatusFilter(value);
    if (value === '') {
      setFilteredData(mockData);
    } else {
      const filtered = mockData.filter((project) => project.status === value);
      setFilteredData(filtered);
    }
  };

  // Handle Edit Button Click
  const handleEdit = (project) => {
    setCurrentProject(project);
    setIsModalVisible(true);
  };

  // Handle Modal Close
  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentProject(null);
  };

  // Handle Reject Modal Close
  const handleRejectCancel = () => {
    setIsRejectModalVisible(false);
    setRejectReason('');
    setCurrentProject(null);
  };

  // Handle Form Submit (Update)
  const handleUpdate = (values) => {
    const updatedData = filteredData.map((project) =>
      project.key === currentProject.key ? { ...project, ...values, lastUpdated: new Date().toLocaleDateString() } : project
    );
    setFilteredData(updatedData);
    handleCancel();
  };

  // Handle Reject Reason Submit
  const handleRejectSubmit = () => {
    const updatedData = filteredData.map((project) =>
      project.key === currentProject.key ? { ...project, status: 'rejected', rejectReason, lastUpdated: new Date().toLocaleDateString() } : project
    );
    setFilteredData(updatedData);
    handleRejectCancel();  // Close reject modal
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          <Select
            defaultValue=""
            style={{ width: 200 }}
            onChange={handleFilterChange}
            placeholder="กรองตามสถานะ"
            className="mr-4"
          >
            <Select.Option value="">ทั้งหมด</Select.Option>
            <Select.Option value="pending">รอดำเนินการ</Select.Option>
            <Select.Option value="approved">อนุมัติ</Select.Option>
            <Select.Option value="rejected">ปฏิเสธ</Select.Option>
          </Select>
          <Input.Search
            placeholder="ค้นหาผลงาน"
            style={{ width: 200 }}
            onSearch={(value) =>
              setFilteredData(
                mockData.filter((project) => project.projectName.toLowerCase().includes(value.toLowerCase()))
              )
            }
          />
        </div>
      </div>

      <Table columns={columns} dataSource={filteredData} rowKey="key" />

      {/* Reject Modal */}
      <Modal
        title="เหตุผลในการปฏิเสธ"
        open={isRejectModalVisible}
        onCancel={handleRejectCancel}
        footer={null}
      >
        <Form onFinish={handleRejectSubmit}>
          <Form.Item
            label="เหตุผล"
            name="rejectReason"
            rules={[{ required: true, message: 'กรุณากรอกเหตุผลในการปฏิเสธ' }]}
          >
            <AntInput.TextArea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </Form.Item>

          <Form.Item className="flex justify-end">
            <Button type="primary" htmlType="submit" className="mr-2">
              ยืนยัน
            </Button>
            <Button onClick={handleRejectCancel}>ยกเลิก</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Project;
