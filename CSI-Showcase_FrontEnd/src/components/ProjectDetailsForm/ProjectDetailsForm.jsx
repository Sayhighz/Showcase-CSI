import React from 'react';

const ProjectDetailsForm = ({ projectData, setProjectData }) => {
  if (!projectData.category) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">รายละเอียดผลงาน</h3>
      <input
        type="text"
        name="title"
        placeholder="ชื่อผลงาน"
        className="w-full p-2 border"
        value={projectData.title}
        onChange={handleChange}
      />
      <textarea
        name="description"
        placeholder="คำอธิบาย"
        className="w-full p-2 border"
        value={projectData.description}
        onChange={handleChange}
      ></textarea>
      <div className="flex space-x-4">
        <select name="year" className="p-2 border w-1/2" onChange={handleChange} value={projectData.year}>
          <option value="">เลือกปีที่ทำเสร็จ</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
      </div>
    </div>
  );
};

export default ProjectDetailsForm;