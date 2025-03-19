import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import { axiosGet } from '../../lib/axios';  // Import axiosGet function
import SearchBar from '../../components/SearchBar/SearchBar';
import Work_Row from '../../components/Work/Work_Row';

const { Option } = Select;

const AllProject = () => {
  const [projects, setProjects] = useState([]);
  const [category, setCategory] = useState('ทั้งหมด');
  const [level, setLevel] = useState('ทั้งหมด');
  const [year, setYear] = useState('ทั้งหมด');

  useEffect(() => {
    // Fetch projects using axiosGet
    const fetchProjects = async () => {
      try {
        const data = await axiosGet('/projects/all');  // Fetch project data
        setProjects(data);  // Store the fetched data
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project =>
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
          <Option value="academic">งานวิจัย</Option>
          <Option value="coursework">งานหลักสูตร</Option>
          <Option value="competition">การแข่งขัน</Option>
        </Select>
        <Select defaultValue={level} className="w-40" onChange={setLevel}>
          <Option value="ทั้งหมด">ชั้นปีที่ทำผลงาน</Option>
          <Option value="ปี 1">ปี 1</Option>
          <Option value="ปี 2">ปี 2</Option>
          <Option value="ปี 3">ปี 3</Option>
          <Option value="ปี 4">ปี 4</Option>
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
