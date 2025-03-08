import React from 'react';
import SearchBar from '../SearchBar/SearchBar';

const Banner = () => {
  return (
    <div className="w-full h-screen bg-[#90278E] py-16 flex flex-col items-center justify-center text-center text-white">
      {/* ข้อความหัวข้อใหญ่ */}
      <h1 className="text-4xl md:text-6xl font-bold mb-4">
        Explore Projects
      </h1>
      <h1 className="text-4xl md:text-6xl font-bold mb-4">
        From CSI Students
      </h1>
      
      {/* ข้อความรอง */}
      <p className="text-xl md:text-2xl mb-8">
        ค้นหาโปรเจคสุดเจ๋งจากนักศึกษา CSI
      </p>

      {/* แสดงผล SearchBar */}
      <SearchBar />
    </div>
  );
};

export default Banner;
