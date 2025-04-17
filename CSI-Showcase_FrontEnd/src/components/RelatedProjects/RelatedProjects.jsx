import React from 'react';
import { StarFilled, StarOutlined, RocketOutlined, AppstoreOutlined, FilterOutlined } from '@ant-design/icons';
import Work_Col from '../Work/Work_Col';
import { Empty, Button, Tooltip } from 'antd';
import { PROJECT } from '../../constants';

/**
 * RelatedProjects component แสดงโปรเจคที่เกี่ยวข้องในรูปแบบกริด
 * พร้อมการตกแต่งในรูปแบบอวกาศที่สวยงามและใช้งานง่าย
 * 
 * @param {Object} props - Props ของ component
 * @param {Array} props.projects - รายการโปรเจคที่เกี่ยวข้อง
 * @returns {JSX.Element} RelatedProjects component
 */
const RelatedProjects = ({ projects }) => {
  // ถ้าไม่มีข้อมูลหรือข้อมูลว่างเปล่า ให้แสดง Empty component
  if (!projects || projects.length === 0) {
    return (
      <div className="w-full py-10 px-8 relative">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span className="text-[#90278E]/60">
              ไม่มีผลงานที่เกี่ยวข้องในขณะนี้
            </span>
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full py-8 px-8 relative">
      {/* Space-themed decorative elements */}
      <div className="absolute -top-10 right-10 w-20 h-20 rounded-full bg-[#90278E]/10 blur-xl animate-pulse" style={{ animationDuration: '15s' }}></div>
      <div className="absolute -bottom-10 left-10 w-24 h-24 rounded-full bg-[#FF5E8C]/10 blur-xl animate-pulse" style={{ animationDuration: '18s' }}></div>
      
      {/* Header with enhanced space theme */}
      <div className="relative mb-8">
        <div className="flex justify-center mb-2">
          <div className="flex items-center space-x-3">
            <div className="w-1 h-1 bg-[#FF5E8C] rounded-full animate-pulse" style={{ animationDuration: '2s' }}></div>
            <div className="w-2 h-2 bg-[#90278E] rounded-full"></div>
            <div className="w-1 h-1 bg-[#FF5E8C] rounded-full animate-pulse" style={{ animationDuration: '3s' }}></div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-[#0D0221] relative mb-3">
          ผลงานอื่นๆ ที่น่าสนใจ
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#90278E] to-[#FF5E8C] rounded-full"></span>
        </h2>
        
        <p className="text-center text-gray-500 flex items-center justify-center">
          <RocketOutlined className="mr-2 text-[#90278E]" />
          ผลงานล่าสุดที่คุณอาจสนใจ
        </p>
      </div>
      
      {/* Actions bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm">
          <span className="px-3 py-1 bg-[#0D0221]/5 rounded-full text-gray-500">
            พบ {projects.length} ผลงาน
          </span>
        </div>
        
      </div>
      
      {/* Projects grid with improved layout */}
      <div className="relative bg-white/40 backdrop-blur-sm rounded-xl border border-[#90278E]/10 shadow-sm overflow-hidden">
        {/* Accent corners */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#90278E]/20 rounded-tl-lg"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#90278E]/20 rounded-tr-lg"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#90278E]/20 rounded-bl-lg"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#90278E]/20 rounded-br-lg"></div>
        
        {/* Star decorations - subtle and non-distracting */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 10 }).map((_, i) => (
            <div 
              key={`star-${i}`} 
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${3 + Math.random() * 7}s`,
                opacity: Math.random() * 0.4 + 0.1
              }}
            ></div>
          ))}
        </div>
        
        {/* Projects grid with padding */}
        <div className="p-6">
          <Work_Col items={projects} />
        </div>
      </div>
      
      {/* "View All" button */}
      <div className="mt-6 flex justify-center">
        <Button 
          type="primary" 
          size="large"
          className="bg-gradient-to-r from-[#90278E] to-[#FF5E8C] border-none px-8"
          icon={<RocketOutlined />}
          href={PROJECT.ALL}
        >
          ดูโปรเจคทั้งหมด
        </Button>
      </div>
    </div>
  );
};

export default RelatedProjects;