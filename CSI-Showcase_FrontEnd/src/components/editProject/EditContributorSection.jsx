import React from 'react';
import { AutoComplete, Avatar, Tag, Tooltip } from 'antd';
import { PlusOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons';

/**
 * คอมโพเนนต์สำหรับแก้ไขผู้ร่วมโปรเจค
 * 
 * @param {Object} props - คุณสมบัติของคอมโพเนนต์
 * @param {string} props.searchKeyword - คำค้นหาปัจจุบัน
 * @param {Array} props.searchResults - ผลลัพธ์จากการค้นหา
 * @param {Array} props.selectedContributors - ผู้ร่วมโปรเจคที่เลือกแล้ว
 * @param {Function} props.handleSearchChange - ฟังก์ชันจัดการการเปลี่ยนแปลงคำค้นหา
 * @param {Function} props.handleSearchSelect - ฟังก์ชันจัดการการเลือกจากผลการค้นหา
 * @param {Function} props.handleSelectContributor - ฟังก์ชันจัดการการเลือกผู้ร่วมโปรเจค
 * @param {Function} props.handleRemoveContributor - ฟังก์ชันจัดการการลบผู้ร่วมโปรเจค
 */
const EditContributorSection = ({ 
  searchKeyword, 
  searchResults, 
  selectedContributors, 
  handleSearchChange, 
  handleSearchSelect, 
  handleSelectContributor, 
  handleRemoveContributor 
}) => {
  return (
    <div className="space-y-6 p-6 rounded-lg relative" 
         style={{
           background: 'linear-gradient(to bottom, rgba(13, 2, 33, 0.05), rgba(144, 39, 142, 0.1))',
           borderRadius: '1rem',
           boxShadow: '0 4px 20px rgba(144, 39, 142, 0.15)',
           overflow: 'hidden',
         }}>
      {/* Space-themed decorative elements */}
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-[#90278E]/5 blur-xl"></div>
      <div className="absolute bottom-0 left-10 w-16 h-16 rounded-full bg-[#90278E]/5 blur-xl"></div>
      
      {/* Tiny stars */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute w-1 h-1 bg-white rounded-full" 
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.4 + 0.1,
              boxShadow: '0 0 3px 1px rgba(255, 255, 255, 0.3)'
            }}
          ></div>
        ))}
      </div>
      
      <h3 className="text-xl font-bold text-[#90278E] relative inline-block">
        แก้ไขผู้จัดทำ
        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#90278E] via-[#FF5E8C] to-transparent"></span>
      </h3>
      
      <div className="relative">
        <AutoComplete
          placeholder="ค้นหานักศึกษา"
          value={searchKeyword}
          onSearch={handleSearchChange}
          onSelect={handleSearchSelect}
          onPressEnter={() => handleSearchSelect(searchKeyword)}
          className="w-full"
          style={{
            borderRadius: '1.5rem',
          }}
          dropdownStyle={{
            background: 'rgba(13, 2, 33, 0.95)',
            borderRadius: '0.5rem',
            border: '1px solid rgba(144, 39, 142, 0.3)',
          }}
          options={searchResults.map((user) => ({
            value: user.full_name,
            label: (
              <div 
                onClick={() => handleSelectContributor(user)} 
                style={{ 
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  transition: 'all 0.2s ease',
                  background: 'transparent',
                }}
                className="hover:bg-[#90278E]/20"
              >
                <Avatar src={user.image} size="small" />
                <span className='ml-2 text-white'>{user.full_name}</span>
              </div>
            ),
          }))}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#90278E]">
          <PlusOutlined style={{ fontSize: '1.25rem' }} className="animate-pulse" />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 items-stretch relative mt-8">
        {/* Display selected contributors with space theme */}
        {selectedContributors.map((contributor, index) => (
          <div
            key={index}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#90278E] to-[#0D0221] rounded-full opacity-50 blur group-hover:opacity-70 transition-all duration-300"></div>
            <div
              className="relative bg-[rgba(13,2,33,0.7)] border-2 border-[rgba(144,39,142,0.7)] text-white flex flex-col items-center justify-center rounded-full p-2 w-32 h-32 transition-all duration-300 group-hover:border-[#FF5E8C] group-hover:scale-105"
              style={{
                boxShadow: '0 0 15px rgba(144, 39, 142, 0.3)',
              }}
            >
              <div className="p-1 bg-gradient-to-b from-[#90278E] to-[#FF5E8C] rounded-full mb-3">
                <Avatar 
                  size={40} 
                  icon={<UserOutlined />} 
                  src={contributor.image}
                  style={{ 
                    background: '#0D0221',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                  }} 
                />
              </div>
              <div className="text-white font-medium text-sm text-center px-1 truncate w-full">
                {contributor.fullName}
              </div>
              
              {/* Delete button with tooltip */}
              <Tooltip title="ลบผู้ร่วมงาน">
                <button
                  className="absolute -top-1 -right-1 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                  onClick={() => handleRemoveContributor(contributor.userId)}
                >
                  <DeleteOutlined className="text-white text-xs" />
                </button>
              </Tooltip>
              
              {/* Orbit animation effect */}
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#90278E]/30 border-r-[#90278E]/30 animate-spin" 
                   style={{ animationDuration: '10s' }}></div>
            </div>
          </div>
        ))}
        
        {/* Empty state with space theme */}
        {selectedContributors.length === 0 && (
          <div className="w-full text-center p-6 rounded-lg text-[#90278E]/70 italic">
            ยังไม่มีผู้ร่วมงาน
            <div className="mt-2 text-xs animate-pulse">ค้นหาและเพิ่มผู้ร่วมงาน...</div>
          </div>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-white/20 rounded-lg border border-[#90278E]/20">
        <h4 className="text-[#90278E] font-bold mb-2">คำแนะนำ</h4>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>ค้นหาชื่อนักศึกษาเพื่อเพิ่มผู้ร่วมงาน</li>
          <li>หากไม่พบรายชื่อนักศึกษา อาจเป็นเพราะนักศึกษายังไม่ได้ลงทะเบียนใช้งานระบบ</li>
          <li>แนะนำให้นักศึกษาที่ต้องการเพิ่มเป็นผู้ร่วมงาน สมัครใช้งานระบบก่อน</li>
        </ul>
      </div>
    </div>
  );
};

export default EditContributorSection;