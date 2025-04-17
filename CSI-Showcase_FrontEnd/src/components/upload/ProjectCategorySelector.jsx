import React from 'react';
import { PROJECT_TYPES } from '../../constants/projectTypes';

/**
 * คอมโพเนนต์แสดงตัวเลือกประเภทของผลงาน
 * 
 * @param {Object} props - คุณสมบัติของคอมโพเนนต์
 * @param {Object} props.projectData - ข้อมูลโปรเจค
 * @param {Function} props.handleInputChange - ฟังก์ชันจัดการการเปลี่ยนแปลงข้อมูล input
 * @param {Function} props.handleSelectChange - ฟังก์ชันจัดการการเปลี่ยนแปลงข้อมูล select
 * @param {Object} props.projectTypes - ประเภทของโปรเจค (จาก constants)
 */
const ProjectCategorySelector = ({ 
  projectData, 
  handleInputChange, 
  handleSelectChange,
  projectTypes
}) => {
  // ใช้ PROJECT_TYPES จาก constants หรือใช้ค่าที่ส่งมาจาก props
  const categories = PROJECT_TYPES || [
    { value: "academic", label: "วิชาการ", emoji: "📚", description: "บทความ งานวิจัย หรือเอกสารทางวิชาการ" },
    { value: "competition", label: "การแข่งขัน", emoji: "🏆", description: "ผลงานที่ส่งเข้าประกวดหรือแข่งขัน" },
    { value: "coursework", label: "ในชั้นเรียน", emoji: "🎓", description: "ผลงานที่ทำในรายวิชาต่างๆ" }
  ];

  return (
    <div className="mb-10 relative overflow-hidden">
      {/* Space-themed decorative elements */}
      <div className="absolute -z-10 inset-0" 
           style={{
             backgroundImage: `
               radial-gradient(circle at 20% 30%, rgba(144, 39, 142, 0.1) 0%, transparent 50%),
               radial-gradient(circle at 80% 70%, rgba(144, 39, 142, 0.05) 0%, transparent 50%)
             `,
           }}>
        {/* Stars */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse" 
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              animationDuration: `${3 + Math.random() * 5}s`,
            }}
          ></div>
        ))}
      </div>
      
      <div className="p-6 rounded-lg relative z-10"
           style={{
             background: 'linear-gradient(to bottom, rgba(13, 2, 33, 0.05), rgba(144, 39, 142, 0.08))',
             boxShadow: '0 4px 20px rgba(144, 39, 142, 0.1)',
             borderRadius: '1rem',
           }}>
        <h3 className="text-xl font-bold text-[#90278E] relative inline-block">
          เลือกประเภทผลงาน
          <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#90278E] via-[#FF5E8C] to-transparent"></span>
        </h3>
        
        {/* Custom styled radio buttons that look like cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <label 
              key={category.value}
              className={`
                flex flex-col items-center justify-center p-6 rounded-xl cursor-pointer transition-all duration-300
                ${projectData.category === category.value 
                  ? 'bg-gradient-to-br from-[#90278E]/90 to-[#0D0221] text-white shadow-lg border-[#FF5E8C] transform scale-105' 
                  : 'bg-white/70 hover:bg-white text-gray-700 hover:shadow-md border-transparent hover:border-[#90278E]/30'}
                border-2 relative overflow-hidden
              `}
            >
              {/* Selected indicator - orbital circle */}
              {projectData.category === category.value && (
                <div className="absolute inset-0 border-2 border-transparent border-t-[#FF5E8C]/40 border-r-[#FF5E8C]/40 rounded-xl animate-spin"
                     style={{ animationDuration: '10s' }}></div>
              )}
              
              <input
                type="radio"
                name="category"
                value={category.value}
                checked={projectData.category === category.value}
                onChange={(e) => handleInputChange(e, 'category')}
                className="sr-only" // Hide actual radio input
              />
              
              <div className="text-4xl mb-3">{category.emoji}</div>
              <div className={`text-lg font-bold ${projectData.category === category.value ? 'text-white' : 'text-[#90278E]'}`}>
                {category.label}
              </div>
              <div className={`text-xs mt-2 text-center ${projectData.category === category.value ? 'text-white/80' : 'text-gray-500'}`}>
                {category.description}
              </div>
              
              {/* Glowing effect for selected option */}
              {projectData.category === category.value && (
                <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-[#FF5E8C]/50 blur-xl"></div>
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectCategorySelector;