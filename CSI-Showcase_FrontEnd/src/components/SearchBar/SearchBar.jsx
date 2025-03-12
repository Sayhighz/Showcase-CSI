import React, { useState } from 'react';
import { Input, AutoComplete, Avatar } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const mockProjects = [
  { 
    name: 'ระบบถังดับเพลิง', 
    path: '/projects/fire-extinguisher', 
    image: '/images/fire-extinguisher.jpg',
    student: 'สมชาย ทดสอบ',
    year: '2023',
    classYear: 'ปี 3'
  },
  { 
    name: 'ระบบจัดการข้อมูล', 
    path: '/projects/data-management', 
    image: '/images/data-management.jpg',
    student: 'สุภาพร ทดสอบ',
    year: '2022',
    classYear: 'ปี 2'
  },
  { 
    name: 'ระบบติดตามการทำงาน', 
    path: '/projects/work-tracking', 
    image: '/images/work-tracking.jpg',
    student: 'กิตติ ทดสอบ',
    year: '2021',
    classYear: 'ปี 4'
  },
  { 
    name: 'ระบบตรวจสอบความปลอดภัย', 
    path: '/projects/security-check', 
    image: '/images/security-check.jpg',
    student: 'มาลี ทดสอบ',
    year: '2020',
    classYear: 'ปี 1'
  },
  { 
    name: 'ระบบการเงิน', 
    path: '/projects/finance-system', 
    image: '/images/finance-system.jpg',
    student: 'ประยุทธ ทดสอบ',
    year: '2023',
    classYear: 'ปี 3'
  }
];

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value) {
      const filtered = mockProjects.filter((project) =>
        project.name.toLowerCase().includes(value.toLowerCase()) ||
        project.student.toLowerCase().includes(value.toLowerCase()) ||
        project.year.includes(value) ||
        project.classYear.includes(value)
      );
      setFilteredProjects(filtered);
      setSelectedIndex(0);
    } else {
      setFilteredProjects([]);
      setSelectedIndex(0);
    }
  };

  const handleSelect = (path) => {
    navigate(path);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown' && selectedIndex < filteredProjects.length - 1) {
      setSelectedIndex((prevIndex) => prevIndex + 1);
    } else if (e.key === 'ArrowUp' && selectedIndex > 0) {
      setSelectedIndex((prevIndex) => prevIndex - 1);
    } else if (e.key === 'Enter' && filteredProjects.length > 0) {
      navigate(filteredProjects[selectedIndex].path);
    }
  };

  // Format the filtered projects for AutoComplete dropdown
  const options = filteredProjects.map((project, index) => ({
    value: project.name,
    label: (
      <div 
        key={project.path}
        onClick={() => handleSelect(project.path)} 
        className={`flex items-center space-x-3 p-2 cursor-pointer ${index === selectedIndex ? 'bg-gray-200' : ''}`}
      >
        <Avatar src={project.image} size={40} />
        <div>
          <div className="font-bold">{project.name}</div>
          <div className="text-sm text-gray-500">{project.student} - {project.classYear} ({project.year})</div>
        </div>
      </div>
    ),
  }));

  return (
    <div className="flex flex-col items-center w-full max-w-4xl px-4">
      <div className="bg-white bg-opacity-80 backdrop-blur-md rounded flex items-center px-4 py-2 w-full relative shadow-md">
        <AutoComplete
          options={options}
          onSearch={handleSearch}
          value={searchTerm}
          onChange={(e) => handleSearch(e)}
          onKeyDown={handleKeyDown}
          className="w-full"
        >
          <Input
            placeholder="ค้นหาโปรเจค ชื่อ ชั้นปี ปีที่สร้าง..."
            className="flex-1 border-none focus:outline-none bg-transparent"
            prefix={<SearchOutlined className="text-gray-500" />}
          />
        </AutoComplete>
      </div>
    </div>
  );
};

export default SearchBar;
