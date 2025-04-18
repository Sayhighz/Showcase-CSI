import React from 'react';
import { Input, Radio } from 'antd';
import { FileTextOutlined, EyeOutlined, EyeInvisibleOutlined, EditOutlined } from '@ant-design/icons';

const { TextArea } = Input;

/**
 * คอมโพเนนต์แบบฟอร์มสำหรับแก้ไขรายละเอียดโปรเจค
 * 
 * @param {Object} props - คุณสมบัติของคอมโพเนนต์
 * @param {Object} props.projectData - ข้อมูลโปรเจค
 * @param {Function} props.handleInputChange - ฟังก์ชันจัดการการเปลี่ยนแปลงข้อมูล input
 */
const EditProjectDetailsForm = ({ projectData, handleInputChange }) => {
  return (
    <div className="space-y-6 p-6 rounded-lg relative"
         style={{
           background: 'linear-gradient(to bottom, rgba(13, 2, 33, 0.05), rgba(144, 39, 142, 0.1))',
           borderRadius: '1rem',
           boxShadow: '0 4px 20px rgba(144, 39, 142, 0.15)',
           overflow: 'hidden',
         }}>
      {/* Space-themed decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#90278E]/5 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-[#90278E]/5 blur-xl"></div>
      
      {/* Tiny stars */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute w-1 h-1 bg-white rounded-full" 
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.4 + 0.1,
              boxShadow: '0 0 3px 1px rgba(255, 255, 255, 0.2)'
            }}
          ></div>
        ))}
      </div>
      
      <h3 className="text-xl font-bold text-[#90278E] relative inline-block z-10">
        แก้ไขรายละเอียดผลงาน
        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#90278E] via-[#FF5E8C] to-transparent"></span>
      </h3>
      
      {/* Project Title Input */}
      <div className="relative z-10">
        <label className="block text-[#90278E] font-semibold mb-2 flex items-center">
          <FileTextOutlined className="mr-2" />
          ชื่อผลงาน
        </label>
        
        <div className="relative group">
          <Input
            value={projectData.title || ''}
            onChange={(e) => handleInputChange(e, 'title')}
            placeholder="ใส่ชื่อผลงาน"
            className="pl-10 py-2 rounded-lg border-[#90278E]/30 hover:border-[#90278E] focus:border-[#90278E] transition-all"
            style={{ 
              background: 'rgba(255, 255, 255, 0.8)', 
              boxShadow: '0 2px 6px rgba(144, 39, 142, 0.1)'
            }}
          />
          <EditOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#90278E] opacity-50 group-hover:opacity-100 transition-opacity" />
          
          {/* Animated particle effect on focus */}
          {projectData.title && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4">
              <div className="absolute w-1 h-1 bg-[#90278E] rounded-full animate-ping opacity-75"></div>
              <div className="absolute w-1 h-1 bg-[#FF5E8C] rounded-full animate-ping opacity-75" style={{ animationDelay: '0.5s' }}></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Project Description TextArea */}
      <div className="relative z-10">
        <label className="block text-[#90278E] font-semibold mb-2 flex items-center">
          <FileTextOutlined className="mr-2" />
          รายละเอียดผลงาน
        </label>
        
        <div className="relative">
          <TextArea
            value={projectData.description || ''}
            onChange={(e) => handleInputChange(e, 'description')}
            placeholder="อธิบายรายละเอียดของผลงาน"
            autoSize={{ minRows: 5, maxRows: 10 }}
            className="rounded-lg border-[#90278E]/30 hover:border-[#90278E] focus:border-[#90278E] transition-all"
            style={{ 
              background: 'rgba(255, 255, 255, 0.8)', 
              boxShadow: '0 2px 8px rgba(144, 39, 142, 0.1)'
            }}
          />
          
          {/* Word counter with space theme */}
          <div className="absolute right-3 bottom-3 px-2 py-1 bg-[#0D0221]/70 text-white text-xs rounded-full">
            {projectData.description ? projectData.description.length : 0} ตัวอักษร
          </div>
        </div>
      </div>
      
      {/* Year and Semester */}
      <div className="grid grid-cols-2 gap-6">
        <div className="w-full relative z-10">
          <label className="block text-[#90278E] font-semibold mb-2 flex items-center">
            <FileTextOutlined className="mr-2" />
            ปีการศึกษา
          </label>
          
          <Input
            type="number"
            value={projectData.study_year || ''}
            onChange={(e) => handleInputChange(e, 'study_year')}
            placeholder="ระบุปีการศึกษา"
            className="rounded-lg border-[#90278E]/30 hover:border-[#90278E] focus:border-[#90278E] transition-all"
            style={{ 
              background: 'rgba(255, 255, 255, 0.8)', 
              boxShadow: '0 2px 6px rgba(144, 39, 142, 0.1)'
            }}
          />
        </div>
        
        <div className="w-full relative z-10">
          <label className="block text-[#90278E] font-semibold mb-2 flex items-center">
            <FileTextOutlined className="mr-2" />
            ภาคการศึกษา
          </label>
          
          <Radio.Group 
            value={projectData.semester} 
            onChange={(e) => handleInputChange(e, 'semester')}
            className="w-full flex space-x-3"
          >
            <Radio.Button 
              value="1"
              className={`flex-1 text-center ${projectData.semester === '1' ? 'bg-[#90278E] text-white border-[#90278E]' : ''}`}
            >
              ภาคเรียนที่ 1
            </Radio.Button>
            <Radio.Button 
              value="2"
              className={`flex-1 text-center ${projectData.semester === '2' ? 'bg-[#90278E] text-white border-[#90278E]' : ''}`}
            >
              ภาคเรียนที่ 2
            </Radio.Button>
            <Radio.Button 
              value="3" 
              className={`flex-1 text-center ${projectData.semester === '3' ? 'bg-[#90278E] text-white border-[#90278E]' : ''}`}
            >
              ภาคฤดูร้อน
            </Radio.Button>
          </Radio.Group>
        </div>
      </div>
      
      {/* Tags Input */}
      <div className="relative z-10">
        <label className="block text-[#90278E] font-semibold mb-2 flex items-center">
          <FileTextOutlined className="mr-2" />
          แท็ก (Tags)
        </label>
        
        <Input
          value={projectData.tags || ''}
          onChange={(e) => handleInputChange(e, 'tags')}
          placeholder="ใส่แท็กคั่นด้วยเครื่องหมายจุลภาค เช่น ai, web, learning"
          className="rounded-lg border-[#90278E]/30 hover:border-[#90278E] focus:border-[#90278E] transition-all"
          style={{ 
            background: 'rgba(255, 255, 255, 0.8)', 
            boxShadow: '0 2px 6px rgba(144, 39, 142, 0.1)'
          }}
        />
        <p className="text-xs text-gray-500 mt-1 ml-1">แท็กจะช่วยให้ผู้อื่นค้นหาผลงานของคุณได้ง่ายขึ้น</p>
      </div>
      
      {/* Project Visibility Radio Group */}
      <div className="relative z-10">
        <label className="block text-[#90278E] font-semibold mb-3 flex items-center">
          <EyeOutlined className="mr-2" />
          การมองเห็น
        </label>
        
        <Radio.Group 
          value={projectData.visibility} 
          onChange={(e) => handleInputChange(e, 'visibility')}
          className="space-radio-group"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label 
              className={`
                flex items-center p-4 rounded-lg cursor-pointer transition-all duration-300 border-2
                ${projectData.visibility === 1 
                  ? 'bg-[#90278E] text-white border-[#FF5E8C]' 
                  : 'bg-white text-gray-700 border-[#90278E]/20 hover:border-[#90278E]/50'}
              `}
            >
              <Radio value={1} className={projectData.visibility === 1 ? "text-white" : ""} />
              <div className="ml-2">
                <div className="font-medium flex items-center">
                  <EyeOutlined className="mr-2" /> สาธารณะ
                </div>
                <div className="text-xs mt-1 opacity-80">ทุกคนสามารถเห็นผลงานนี้ได้</div>
              </div>
              
              {/* Space glow effect for selected option */}
              {projectData.visibility === 1 && (
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                  <div className="absolute top-0 right-0 w-8 h-8 rounded-full bg-[#FF5E8C]/40 blur-md"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 rounded-full bg-[#90278E]/40 blur-md"></div>
                </div>
              )}
            </label>
            
            <label 
              className={`
                flex items-center p-4 rounded-lg cursor-pointer transition-all duration-300 border-2 relative
                ${projectData.visibility === 0 
                  ? 'bg-[#90278E] text-white border-[#FF5E8C]' 
                  : 'bg-white text-gray-700 border-[#90278E]/20 hover:border-[#90278E]/50'}
              `}
            >
              <Radio value={0} className={projectData.visibility === 0 ? "text-white" : ""} />
              <div className="ml-2 z-10">
                <div className="font-medium flex items-center">
                  <EyeInvisibleOutlined className="mr-2" /> ส่วนตัว
                </div>
                <div className="text-xs mt-1 opacity-80">เฉพาะผู้ที่มีลิงก์เท่านั้นที่สามารถดูได้</div>
              </div>
              
              {/* Space glow effect for selected option */}
              {projectData.visibility === 0 && (
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                  <div className="absolute top-0 right-0 w-8 h-8 rounded-full bg-[#FF5E8C]/40 blur-md"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 rounded-full bg-[#90278E]/40 blur-md"></div>
                </div>
              )}
            </label>
          </div>
        </Radio.Group>
      </div>
    </div>
  );
};

export default EditProjectDetailsForm;