import React, { useState } from 'react';
import SearchBar from '../../components/SearchBar/SearchBar';
import Work_Row from '../../components/Work/Work_Row';
import { Select } from 'antd';

const { Option } = Select;

const sampleProjects = [
  {
    title: 'ระบบดับเพลิง',
    description: 'ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง ระบบตรวจสอบดับเพลิง',
    image: 'https://via.placeholder.com/150',
    projectLink: '/projects/1',
    category: 'ประเภท1',
    level: 'ปี1',
    year: '2025',
  },
  {
    title: 'ระบบรักษาความปลอดภัย',
    description: 'ระบบควบคุมการเข้าออก ระบบควบคุมการเข้าออก ระบบควบคุมการเข้าออก ระบบควบคุมการเข้าออก',
    image: 'https://via.placeholder.com/150',
    projectLink: '/projects/2',
    category: 'ประเภท2',
    level: 'ปี2',
    year: '2026',
  },
  {
    title: 'ระบบแจ้งเตือน',
    description: 'ระบบแจ้งเตือนอัจฉริยะ ระบบแจ้งเตือนอัจฉริยะ ระบบแจ้งเตือนอัจฉริยะ',
    image: 'https://via.placeholder.com/150',
    projectLink: '/projects/3',
    category: 'ประเภท1',
    level: 'ปี1',
    year: '2026',
  },
  {
    title: 'ระบบควบคุมไฟฟ้า',
    description: 'ระบบควบคุมไฟอัตโนมัติ ระบบควบคุมไฟอัตโนมัติ',
    image: 'https://via.placeholder.com/150',
    projectLink: '/projects/4',
    category: 'ประเภท2',
    level: 'ปี2',
    year: '2025',
  },
];

const AllProject = () => {
  const [category, setCategory] = useState('ทั้งหมด');
  const [level, setLevel] = useState('ทั้งหมด');
  const [year, setYear] = useState('ทั้งหมด');

  const filteredProjects = sampleProjects.filter(project => 
    (category === 'ทั้งหมด' || project.category === category) &&
    (level === 'ทั้งหมด' || project.level === level) &&
    (year === 'ทั้งหมด' || project.year === year)
  );

  return (
    <div className="flex flex-col items-center w-full py-20 px-4">
      <h2 className="text-3xl font-bold text-[#90278E] mb-6">ผลงานทั้งหมด</h2>
      <SearchBar />
      
      <div className="flex justify-end w-full max-w-6xl mt-10 space-x-4">
        <Select defaultValue={category} className="w-40" onChange={setCategory}>
          <Option value="ทั้งหมด">ประเภทงาน</Option>
          <Option value="ประเภท1">ประเภท 1</Option>
          <Option value="ประเภท2">ประเภท 2</Option>
        </Select>
        <Select defaultValue={level} className="w-40" onChange={setLevel}>
          <Option value="ทั้งหมด">ชั้นปีที่ทำผลงาน</Option>
          <Option value="ปี1">ปี 1</Option>
          <Option value="ปี2">ปี 2</Option>
        </Select>
        <Select defaultValue={year} className="w-40" onChange={setYear}>
          <Option value="ทั้งหมด">ปีที่ทำเสร็จ</Option>
          <Option value="2025">2025</Option>
          <Option value="2026">2026</Option>
        </Select>
      </div>
      
      <div className="w-full max-w-6xl">
        <Work_Row title="" items={filteredProjects} side="center" />
      </div>
    </div>
  );
};

export default AllProject;
