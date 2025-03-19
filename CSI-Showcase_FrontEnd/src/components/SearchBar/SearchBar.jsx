import React, { useState } from 'react';
import { Input, AutoComplete, Avatar, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { axiosGet } from '../../lib/axios';  // Import the axiosGet function
import { debounce } from 'lodash';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);  // To handle loading state

  const handleSearch = async (value) => {
    setSearchTerm(value);

    if (value) {
      setLoading(true);  // Show loading spinner while fetching
      try {
        const response = await axiosGet(`/search/projects?keyword=${value}`);
        
        // Remove duplicate projects by using a Map to keep only the unique ones
        const uniqueProjects = [...new Map(response.map(item => [item.project_id, item])).values()];
        
        setFilteredProjects(uniqueProjects);  // Assume response is the list of filtered projects
        setSelectedIndex(0);
      } catch (error) {
        console.error("Search error:", error);
        setFilteredProjects([]);
      } finally {
        setLoading(false);  // Hide loading spinner once data is fetched
      }
    } else {
      setFilteredProjects([]);
    }
  };

  const handleSelect = (project_id) => {
    window.location.href = `/projects/${project_id}`;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown' && selectedIndex < filteredProjects.length - 1) {
      setSelectedIndex((prevIndex) => prevIndex + 1);
    } else if (e.key === 'ArrowUp' && selectedIndex > 0) {
      setSelectedIndex((prevIndex) => prevIndex - 1);
    } else if (e.key === 'Enter' && filteredProjects.length > 0) {
      window.location.href = `/projects/${filteredProjects[selectedIndex].project_id}`;
    }
  };

  // Format the filtered projects for AutoComplete dropdown
  const options = filteredProjects.map((project, index) => ({
    value: project.title,
    label: (
      <div
        key={`${project.project_id}-${index}`}  // Combining project ID and index for uniqueness
        onClick={() => handleSelect(project.project_id)}
        className={`flex items-center space-x-3 p-2 cursor-pointer ${index === selectedIndex ? 'bg-gray-200' : ''}`}
      >
        <Avatar src={project.image} size={40} />
        <div>
          <div className="font-bold">{project.title}</div>
          <div className="text-sm text-gray-500">{project.student} - {project.study_year} ({project.year})</div>
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
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          className="w-full"
          notFoundContent={
            loading ? <Spin size="small" /> : "ไม่พบข้อมูลที่ตรงกับคำค้นหา"
          }
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
