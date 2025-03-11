import React from 'react';

const ProjectCategorySelector = ({ projectData, setProjectData }) => {
  const handleChange = (e) => {
    setProjectData({ category: e.target.value }); // Reset all data when category changes
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">เลือกประเภทผลงาน</h3>
      <select className="w-full p-2 border" value={projectData.category} onChange={handleChange}>
        <option value="">โปรดเลือกประเภทงาน</option>
        <option value="ประเภท1">ประเภท 1</option>
        <option value="ประเภท2">ประเภท 2</option>
      </select>
    </div>
  );
};

export default ProjectCategorySelector;