import React, { useState } from 'react';
import { Modal, Input, Button, Avatar, Select, Tooltip } from 'antd';
import { PlusOutlined, UserOutlined, EditOutlined } from '@ant-design/icons';

const { Option } = Select;

const ContributorSection = ({ projectData, setProjectData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [newContributor, setNewContributor] = useState({
    firstName: '',
    lastName: '',
    studentId: '',
    classYear: '1',
    profilePic: null,
  });

  const showModal = (index = null) => {
    if (index !== null) {
      setNewContributor(projectData?.contributors?.[index] || {});
      setEditIndex(index);
    } else {
      setNewContributor({ firstName: '', lastName: '', studentId: '', classYear: '1', profilePic: null });
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => setIsModalOpen(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewContributor((prev) => ({ ...prev, profilePic: URL.createObjectURL(file) }));
    }
  };

  const handleSaveContributor = () => {
    if (newContributor.firstName && newContributor.lastName && newContributor.studentId) {
      setProjectData((prev) => ({
        ...prev,
        contributors: editIndex !== null
          ? prev.contributors.map((c, i) => (i === editIndex ? newContributor : c))
          : [...(prev.contributors || []), newContributor], // ป้องกัน `undefined`
      }));
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">เพิ่มผู้จัดทำ</h3>
      <div className="flex space-x-4 items-stretch">
        {(projectData?.contributors || []).map((contributor, index) => (
          <div key={index} className="relative text-center cursor-pointer group" onClick={() => showModal(index)}>
            <Avatar size={64} src={contributor.profilePic} icon={<UserOutlined />} className="bg-[#90278E]" />
            <p className="text-sm font-medium">{contributor.firstName} {contributor.lastName}</p>
            <p className="text-xs text-gray-500">{contributor.studentId}</p>
            <p className="text-xs text-gray-500">ชั้นปีที่ {contributor.classYear}</p>
            <Tooltip title="แก้ไขข้อมูล">
              <EditOutlined className="absolute top-0 right-0 bg-white text-[#90278E] p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </Tooltip>
          </div>
        ))}
        <div
          className="flex flex-col items-center justify-center border-2 border-dashed border-[#90278E] rounded-full w-16 h-16 cursor-pointer"
          onClick={() => showModal()}
        >
          <PlusOutlined className="text-[#90278E] text-xl" />
        </div>
      </div>
      
      <Modal title={editIndex !== null ? "แก้ไขผู้จัดทำ" : "เพิ่มผู้จัดทำ"} open={isModalOpen} onCancel={handleCancel} footer={null}>
        <div className="flex flex-col items-center space-y-4">
          <label className="border-2 border-dashed border-[#90278E] rounded-full w-24 h-24 flex items-center justify-center cursor-pointer">
            <input type="file" className="hidden" onChange={handleFileChange} />
            {newContributor.profilePic ? (
              <Avatar size={88} src={newContributor.profilePic} />
            ) : (
              <PlusOutlined className="text-[#90278E] text-3xl" />
            )}
          </label>
          <Input placeholder="ชื่อ" value={newContributor.firstName} onChange={(e) => setNewContributor({ ...newContributor, firstName: e.target.value })} />
          <Input placeholder="นามสกุล" value={newContributor.lastName} onChange={(e) => setNewContributor({ ...newContributor, lastName: e.target.value })} />
          <Input placeholder="รหัสนักศึกษา" value={newContributor.studentId} onChange={(e) => setNewContributor({ ...newContributor, studentId: e.target.value })} />
          <Select
            placeholder="เลือกชั้นปีที่"
            className="w-full"
            value={newContributor.classYear}
            onChange={(value) => setNewContributor({ ...newContributor, classYear: value })}
          >
            <Option value="1">ปี 1</Option>
            <Option value="2">ปี 2</Option>
            <Option value="3">ปี 3</Option>
            <Option value="4">ปี 4</Option>
          </Select>
          <Button type="primary" className="bg-[#90278E] w-full" onClick={handleSaveContributor}>{editIndex !== null ? "บันทึก" : "เพิ่ม"}</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ContributorSection;
