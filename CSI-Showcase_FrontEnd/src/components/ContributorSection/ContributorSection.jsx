import React, { useState } from 'react';
import { Avatar, AutoComplete, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { axiosGet } from '../../lib/axios'; // Make sure axios is properly imported

const ContributorSection = ({ projectData, setProjectData }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedContributors, setSelectedContributors] = useState([]);

  const handleSearchChange = async (value) => {
    setSearchKeyword(value);

    if (value.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      const results = await axiosGet(`/search/users?keyword=${value}`);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching for users:', error);
    }
  };

  const handleSelectContributor = (user) => {
    // Store only user_id and full_name
    setSelectedContributors((prev) => [
      ...prev,
      {
        userId: user.user_id, // Storing only the user_id
        fullName: user.full_name, // Storing only the full_name
      },
    ]);
    setSearchResults([]); // Clear search results after selection
    setSearchKeyword(''); // Clear search field after selection
  };

  const handleRemoveContributor = (userId) => {
    setSelectedContributors((prev) => prev.filter((contributor) => contributor.userId !== userId));
  };

  const handleSearchSelect = (value) => {
    const selectedUser = searchResults.find((user) => user.full_name === value);
    if (selectedUser) {
      handleSelectContributor(selectedUser);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">เพิ่มผู้จัดทำ</h3>
      
      <AutoComplete
        placeholder="ค้นหานักศึกษา"
        value={searchKeyword}
        onSearch={handleSearchChange}
        onSelect={handleSearchSelect}  // Handle selection on click or enter
        onPressEnter={() => handleSearchSelect(searchKeyword)} // Handle Enter key press
        className="w-full"
        options={searchResults.map((user) => ({
          value: user.full_name,
          label: (
            <div onClick={() => handleSelectContributor(user)} style={{ cursor: 'pointer' }}>
              <Avatar src={user.image} size="small" />
              <span className='ml-2'>{user.full_name}</span>
            </div>
          ),
        }))}
      />
      
      <div className="flex space-x-4 items-stretch">
        {/* Display selected contributors as labels */}
        {selectedContributors.map((contributor, index) => (
          <Tag
            key={index}
            closable
            onClose={() => handleRemoveContributor(contributor.userId)}
            style={{
              backgroundColor: '#90278E', // Purple background
              color: 'white', // White text
              display: 'flex', 
              alignItems: 'center', 
              borderRadius: '50%', 
              padding: '10px', 
              justifyContent: 'center', 
              width: '120px', 
              height: '120px',
              flexDirection: 'column',
              textAlign: 'center',
            }}
          >
            <Avatar 
              size="large" 
              icon={<UserOutlined />} 
              style={{ marginBottom: '8px' }} 
            />
            <div>{contributor.fullName}</div>
            {/* Displaying only fullName, since userId is for internal use */}
          </Tag>
        ))}
      </div>
    </div>
  );
};

export default ContributorSection;
