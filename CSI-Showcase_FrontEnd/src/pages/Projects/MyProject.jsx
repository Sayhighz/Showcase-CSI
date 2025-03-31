import React, { useState, useEffect } from 'react';
import Work_Row from '../../components/Work/Work_Row';
import { Select, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { axiosGet } from '../../lib/axios'; // Import the axiosGet function
import { useAuth } from '../../context/AuthContext'; // Import the useAuth hook

const { Option } = Select;

const MyProject = () => {
  const { authData } = useAuth(); // Access the auth data (including userId)
  const [category, setCategory] = useState('ทั้งหมด');
  const [year, setYear] = useState('ทั้งหมด');
  const [sampleProjects, setSampleProjects] = useState([]); // State to hold the fetched projects
  const navigate = useNavigate();

  // Fetch projects from the API when the component mounts
  useEffect(() => {
    const fetchProjects = async () => {
      if (authData.userId) { // Ensure userId is available
        try {
          const data = await axiosGet(`/projects/myprojects/${authData.userId}`); // Pass userId in the URL
          console.log(data, authData)
          setSampleProjects(data); // Set fetched projects to state
        } catch (error) {
          console.error("Failed to fetch projects:", error);
        }
      }
    };

    fetchProjects();
    console.log(authData)
  }, [authData.userId]); // Dependency array to run effect when userId changes

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
