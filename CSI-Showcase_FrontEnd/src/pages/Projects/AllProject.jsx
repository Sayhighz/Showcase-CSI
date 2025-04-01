import React, { useState, useEffect } from 'react';
import { Select, Spin, Empty } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { axiosGet } from '../../lib/axios';
import SearchBar from '../../components/SearchBar/SearchBar';
import Work_Row from '../../components/Work/Work_Row';
import { FilterOutlined, RocketOutlined, TeamOutlined, CalendarOutlined } from '@ant-design/icons';

const { Option } = Select;

const AllProject = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ทั้งหมด');
  const [level, setLevel] = useState('ทั้งหมด');
  const [year, setYear] = useState('ทั้งหมด');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    // Fetch projects using axiosGet
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const data = await axiosGet('/projects/all');  // Fetch project data
        setProjects(data);  // Store the fetched data
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project =>
    (category === 'ทั้งหมด' || project.category === category) &&
    (level === 'ทั้งหมด' || project.level === level) &&
    (year === 'ทั้งหมด' || project.year === year)
  );

  const categoryOptions = [
    { value: 'ทั้งหมด', label: 'ทุกประเภท' },
    { value: 'academic', label: 'งานวิจัย' },
    { value: 'coursework', label: 'งานหลักสูตร' },
    { value: 'competition', label: 'การแข่งขัน' }
  ];

  const levelOptions = [
    { value: 'ทั้งหมด', label: 'ทุกชั้นปี' },
    { value: 'ปี 1', label: 'ปี 1' },
    { value: 'ปี 2', label: 'ปี 2' },
    { value: 'ปี 3', label: 'ปี 3' },
    { value: 'ปี 4', label: 'ปี 4' }
  ];

  const yearOptions = [
    { value: 'ทั้งหมด', label: 'ทุกปี' },
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' }
  ];

  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

  return (
    <div className="flex flex-col items-center w-full py-20 px-4 min-h-screen bg-gradient-to-b from-[#F9F2FF] to-white relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-0 w-64 h-64 rounded-full bg-gradient-to-r from-purple-200 to-purple-300 opacity-30 blur-3xl"
          animate={{ 
            x: [0, 50, 0], 
            y: [0, 30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-96 h-96 rounded-full bg-gradient-to-r from-blue-200 to-indigo-200 opacity-20 blur-3xl"
          animate={{ 
            x: [0, -70, 0], 
            y: [0, 50, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <motion.h1
          className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-700 text-transparent bg-clip-text inline-block"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          ผลงานทั้งหมด
        </motion.h1>
        <motion.div
          className="h-1 w-24 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto mt-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: 96 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="w-full max-w-2xl mb-12"
      >
        <SearchBar />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full max-w-6xl flex flex-col items-end mb-8"
      >
        <motion.button
          onClick={toggleFilters}
          className="flex items-center gap-2 px-5 py-2.5 mb-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <FilterOutlined /> 
          <span>กรองผลลัพธ์</span>
        </motion.button>

        <AnimatePresence>
          {isFiltersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full overflow-hidden"
            >
              <div className="p-4 bg-white rounded-xl shadow-lg border border-purple-100 flex flex-wrap gap-4">
                <div className="flex flex-col space-y-2 flex-1 min-w-[200px]">
                  <div className="flex items-center text-purple-700 font-medium">
                    <RocketOutlined className="mr-2" />
                    ประเภทงาน
                  </div>
                  <Select
                    value={category}
                    onChange={setCategory}
                    className="w-full"
                    style={{ borderRadius: '8px' }}
                    dropdownStyle={{ borderRadius: '8px' }}
                  >
                    {categoryOptions.map(option => (
                      <Option key={option.value} value={option.value}>{option.label}</Option>
                    ))}
                  </Select>
                </div>
                
                <div className="flex flex-col space-y-2 flex-1 min-w-[200px]">
                  <div className="flex items-center text-purple-700 font-medium">
                    <TeamOutlined className="mr-2" />
                    ชั้นปีที่ทำผลงาน
                  </div>
                  <Select
                    value={level}
                    onChange={setLevel}
                    className="w-full"
                    style={{ borderRadius: '8px' }}
                    dropdownStyle={{ borderRadius: '8px' }}
                  >
                    {levelOptions.map(option => (
                      <Option key={option.value} value={option.value}>{option.label}</Option>
                    ))}
                  </Select>
                </div>
                
                <div className="flex flex-col space-y-2 flex-1 min-w-[200px]">
                  <div className="flex items-center text-purple-700 font-medium">
                    <CalendarOutlined className="mr-2" />
                    ปีที่ทำเสร็จ
                  </div>
                  <Select
                    value={year}
                    onChange={setYear}
                    className="w-full"
                    style={{ borderRadius: '8px' }}
                    dropdownStyle={{ borderRadius: '8px' }}
                  >
                    {yearOptions.map(option => (
                      <Option key={option.value} value={option.value}>{option.label}</Option>
                    ))}
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6 }}
        className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-6 min-h-[300px]"
      >
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="กำลังโหลดข้อมูล..." />
          </div>
        ) : filteredProjects.length > 0 ? (
          <Work_Row title="" items={filteredProjects} side="center" />
        ) : (
          <div className="flex justify-center items-center h-64 flex-col">
            <Empty 
              description={
                <span className="text-gray-500 text-lg">ไม่พบผลงานที่ตรงกับเงื่อนไขที่เลือก</span>
              }
            />
            <motion.button
              onClick={() => {
                setCategory('ทั้งหมด');
                setLevel('ทั้งหมด');
                setYear('ทั้งหมด');
              }}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ล้างตัวกรอง
            </motion.button>
          </div>
        )}
      </motion.div>
      
      {!loading && filteredProjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1 }}
          className="mt-8 text-center text-gray-500"
        >
          แสดงผลงานทั้งหมด {filteredProjects.length} ชิ้น
        </motion.div>
      )}
    </div>
  );
};

export default AllProject