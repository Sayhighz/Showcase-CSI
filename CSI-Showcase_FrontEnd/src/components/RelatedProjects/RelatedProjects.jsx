import React from 'react';
import Work_Col from '../Work/Work_Col';

const RelatedProjects = ({ projects }) => {
  return (
    <div className="max-w-6xl w-full mt-10">
      <h2 className="text-2xl font-bold text-[#90278E] text-center">ผลงานอื่นๆ</h2>
      <p className="text-center text-gray-600">ผลงานล่าสุด</p>
      <Work_Col items={projects} />
    </div>
  );
};

export default RelatedProjects;
