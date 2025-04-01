import React from 'react';
import { AutoComplete, Avatar, Tag } from 'antd';
import { PlusOutlined, UserOutlined } from '@ant-design/icons';

const ContributorSection = ({ 
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
        เพิ่มผู้จัดทำ
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
            <Tag
              closable
              onClose={() => handleRemoveContributor(contributor.userId)}
              style={{
                background: 'rgba(13, 2, 33, 0.7)',
                border: '2px solid rgba(144, 39, 142, 0.7)',
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                borderRadius: '50%', 
                padding: '10px', 
                justifyContent: 'center', 
                width: '140px', 
                height: '140px',
                flexDirection: 'column',
                textAlign: 'center',
                position: 'relative',
                boxShadow: '0 0 15px rgba(144, 39, 142, 0.3)',
                transition: 'all 0.3s ease',
              }}
              className="group-hover:border-[#FF5E8C] group-hover:scale-105"
            >
              <div className="p-1 bg-gradient-to-b from-[#90278E] to-[#FF5E8C] rounded-full mb-3">
                <Avatar 
                  size={50} 
                  icon={<UserOutlined />} 
                  src={contributor.image}
                  style={{ 
                    background: '#0D0221',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                  }} 
                />
              </div>
              <div className="text-white font-medium">{contributor.fullName}</div>
              
              {/* Orbit animation effect */}
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#90278E]/30 border-r-[#90278E]/30 animate-spin" 
                   style={{ animationDuration: '10s' }}></div>
            </Tag>
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
    </div>
  );
};

export default ContributorSection;