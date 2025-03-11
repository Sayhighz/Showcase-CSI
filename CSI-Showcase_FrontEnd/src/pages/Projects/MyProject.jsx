import React, { useState } from 'react';
import Work_Row from '../../components/Work/Work_Row';
import { Select, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const sampleProjects = [
  {
    title: 'ระบบดับเพลิง',
    description: 'ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง',
    image: 'https://via.placeholder.com/150',
    projectLink: '/projects/1',
    category: 'ประเภท1',
    year: '2025',
  },
  {
    title: 'ระบบดับเพลิง',
    description: 'ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง',
    image: 'https://via.placeholder.com/150',
    projectLink: '/projects/2',
    category: 'ประเภท2',
    year: '2026',
  }
];

const MyProject = () => {
  const [category, setCategory] = useState('ทั้งหมด');
  const [year, setYear] = useState('ทั้งหมด');
  const navigate = useNavigate();

  const filteredProjects = sampleProjects.filter(project => 
    (category === 'ทั้งหมด' || project.category === category) &&
    (year === 'ทั้งหมด' || project.year === year)
  );

  const handleEdit = (project) => {
    navigate(`/edit/project/${project.projectLink.split('/').pop()}`);
  };

  const handleDelete = (project) => {
    console.log('Deleting project:', project.title);
    // Implement delete logic here
  };

  return (
    <div className="flex flex-col items-center w-full py-20 px-4">
      <h2 className="text-3xl font-bold text-[#90278E] mb-6">ผลงานของฉัน</h2>
      
      <div className="flex justify-between w-full max-w-6xl mt-4">
        <div className="flex space-x-4">
          <Select defaultValue={category} className="w-40" onChange={setCategory}>
            <Option value="ทั้งหมด">ประเภทงาน</Option>
            <Option value="ประเภท1">ประเภท 1</Option>
            <Option value="ประเภท2">ประเภท 2</Option>
          </Select>
          <Select defaultValue={year} className="w-40" onChange={setYear}>
            <Option value="ทั้งหมด">ปีที่ทำเสร็จ</Option>
            <Option value="2025">2025</Option>
            <Option value="2026">2026</Option>
          </Select>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          className="bg-[#90278E] hover:bg-[#6d216c] border-none"
          onClick={() => navigate('/upload/coursework')}
        >
          เพิ่มผลงาน
        </Button>
      </div>
      
      <div className="w-full max-w-6xl">
        <Work_Row 
          title="" 
          items={filteredProjects} 
          side="center" 
          showActions={true} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      </div>
    </div>
  );
};

export default MyProject;
