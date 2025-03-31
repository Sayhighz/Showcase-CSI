const ProjectCategorySelector = ({ projectData, setProjectData }) => {
  const handleChange = (e) => {
    setProjectData({ ...projectData, category: e.target.value }); // Ensure category is updated properly
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">เลือกประเภทผลงาน</h3>
      <select className="w-full p-2 border" value={projectData.category} onChange={handleChange}>
        <option value="">โปรดเลือกประเภทงาน</option>
        <option value="academic">วิชาการ</option>
        <option value="competition">การแข่งขัน</option>
        <option value="coursework">ในชั้นเรียน</option>
      </select>
    </div>
  );
};

export default ProjectCategorySelector
