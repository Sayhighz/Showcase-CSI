// src/components/ManageProject/steps/ContributorsStep.jsx
import React, { useState, useEffect } from "react";
import { 
  Table, 
  Button, 
  Input, 
  Select, 
  Space, 
  Empty, 
  Avatar, 
  Popconfirm,
  Alert,
  Typography
} from "antd";
import { 
  UserOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  SearchOutlined 
} from "@ant-design/icons";
import useSearch from "../../../hooks/useSearch";

const { Option } = Select;
const { Text } = Typography;

/**
 * ContributorsStep - ขั้นตอนการเพิ่มผู้ร่วมโปรเจค
 * @param {Object} props - Component properties
 * @param {Array} props.contributors - รายการผู้ร่วมโปรเจค
 * @param {Function} props.onChange - ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงของผู้ร่วมโปรเจค
 * @param {boolean} props.isMobile - บอกว่าเป็นหน้าจอขนาดเล็กหรือไม่
 * @param {boolean} props.isTablet - บอกว่าเป็นหน้าจอขนาดกลางหรือไม่
 * @returns {JSX.Element} - ContributorsStep component
 */
const ContributorsStep = ({ contributors = [], onChange, isMobile, isTablet }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("contributor");
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // ใช้ useSearch hook เพื่อค้นหาผู้ใช้
  const { searchUsers, searchResults, isSearching } = useSearch();
  
  // ค้นหาผู้ใช้เมื่อ searchTerm เปลี่ยนแปลง
  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchUsers(searchTerm, 5);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchTerm, searchUsers]);
  
  // ล้างค่าการค้นหาเมื่อเลือกผู้ใช้
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchTerm("");
    setShowSearchResults(false);
  };
  
  // เพิ่มผู้ร่วมโปรเจค
 const addContributor = () => {
  if (!selectedUser) return;
  
  // ตรวจสอบว่าผู้ใช้นี้ถูกเพิ่มไปแล้วหรือไม่
  const isDuplicate = contributors.some(c => c.user_id === selectedUser.user_id);
  
  if (isDuplicate) {
    Alert.warning("ผู้ใช้นี้ถูกเพิ่มเป็นผู้ร่วมโปรเจคแล้ว");
    return;
  }
  
  // สร้างข้อมูลผู้ร่วมโปรเจคใหม่ตาม response จาก API
  const newContributor = {
    user_id: selectedUser.user_id,
    username: selectedUser.username,
    fullName: selectedUser.full_name,
    image: selectedUser.image,
    role: selectedRole
  };
  
  // เพิ่มผู้ร่วมโปรเจคใหม่
  const updatedContributors = [...contributors, newContributor];
  onChange(updatedContributors);
  
  // ล้างค่าการเลือก
  setSelectedUser(null);
  setSelectedRole("contributor");
};

// ลบผู้ร่วมโปรเจค
const removeContributor = (userId) => {
  const updatedContributors = contributors.filter(c => c.user_id !== userId);
  onChange(updatedContributors);
};

// คอลัมน์สำหรับตาราง
const getColumns = () => {
  const baseColumns = [
    {
      title: "ผู้ร่วมโปรเจค",
      dataIndex: "fullName",
      key: "fullName",
      render: (text, record) => (
        <div className="flex items-center">
          <Avatar 
            src={record.image} 
            icon={<UserOutlined />} 
            size={isMobile ? 'small' : 'default'} 
            className="mr-2" 
          />
          <div>
            <div className={isMobile ? "text-sm" : ""}>{text}</div>
            <div className={`text-xs text-gray-500 ${isMobile ? "hidden sm:block" : ""}`}>@{record.username}</div>
          </div>
        </div>
      ),
    },
    {
      title: "บทบาท",
      dataIndex: "role",
      key: "role",
      width: isMobile ? 120 : 200,
      render: (text, record) => (
        <Select
          value={text}
          style={{ width: "100%" }}
          size={isMobile ? 'small' : 'middle'}
          onChange={(value) => {
            const updatedContributors = contributors.map(c => 
              c.user_id === record.user_id ? { ...c, role: value } : c
            );
            onChange(updatedContributors);
          }}
        >
          <Option value="contributor">ผู้ร่วมพัฒนา</Option>
          <Option value="researcher">นักวิจัย</Option>
          <Option value="designer">นักออกแบบ</Option>
          <Option value="developer">นักพัฒนา</Option>
          <Option value="documenter">ผู้จัดทำเอกสาร</Option>
          <Option value="tester">ผู้ทดสอบ</Option>
        </Select>
      ),
    },
    {
      title: isMobile ? "" : "จัดการ",
      key: "action",
      width: isMobile ? 50 : 100,
      render: (_, record) => (
        <Popconfirm
          title="ต้องการลบผู้ร่วมโปรเจคนี้หรือไม่?"
          onConfirm={() => removeContributor(record.user_id)}
          okText="ใช่"
          cancelText="ไม่"
        >
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />}
            size={isMobile ? 'small' : 'middle'}
          />
        </Popconfirm>
      ),
    },
  ];

  return baseColumns;
};

return (
  <div className="space-y-4 sm:space-y-6">
    <Alert
      message="เพิ่มผู้ร่วมโปรเจค"
      description="เพิ่มผู้ที่มีส่วนร่วมในการพัฒนาโปรเจคนี้ โดยค้นหาจากชื่อผู้ใช้หรืออีเมล"
      type="info"
      showIcon
      className="mb-2 sm:mb-4"
    />
    
    <div className="space-y-2 sm:space-y-4">
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} ${isMobile ? 'space-y-2' : 'items-start space-x-4'}`}>
        <div className={`${isMobile ? 'w-full' : 'flex-1'} relative`}>
          <Input
            placeholder="ค้นหาผู้ใช้จากชื่อผู้ใช้หรืออีเมล"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<SearchOutlined />}
            suffix={isSearching ? <span className="text-gray-400 text-xs sm:text-sm">กำลังค้นหา...</span> : null}
            allowClear
            size={isMobile ? 'small' : 'middle'}
          />
          
          {/* แสดงผลการค้นหา */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-40 sm:max-h-60 overflow-y-auto">
              {searchResults.map((user) => (
                <div 
                  key={user.user_id}
                  className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => handleUserSelect(user)}
                >
                  <Avatar 
                    src={user.image} 
                    icon={<UserOutlined />} 
                    size={isMobile ? 'small' : 'default'}
                    className="mr-2" 
                  />
                  <div>
                    <div className={isMobile ? "text-sm" : ""}>{user.full_name}</div>
                    <div className="text-xs text-gray-500">@{user.username}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {showSearchResults && searchResults.length === 0 && !isSearching && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg p-2 sm:p-4">
              <Empty 
                description="ไม่พบผู้ใช้" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                imageStyle={{ height: isMobile ? 40 : 60 }}
              />
            </div>
          )}
        </div>
        
        <div className={isMobile ? "w-full" : "w-[180px]"}>
          <Select
            placeholder="เลือกบทบาท"
            value={selectedRole}
            onChange={setSelectedRole}
            style={{ width: "100%" }}
            size={isMobile ? 'small' : 'middle'}
          >
            <Option value="contributor">ผู้ร่วมพัฒนา</Option>
            <Option value="researcher">นักวิจัย</Option>
            <Option value="designer">นักออกแบบ</Option>
            <Option value="developer">นักพัฒนา</Option>
            <Option value="documenter">ผู้จัดทำเอกสาร</Option>
            <Option value="tester">ผู้ทดสอบ</Option>
          </Select>
        </div>
        
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={addContributor}
          disabled={!selectedUser}
          size={isMobile ? 'small' : 'middle'}
          className={isMobile ? "w-full" : ""}
        >
          เพิ่ม
        </Button>
      </div>
      
      {selectedUser && (
        <div className="bg-blue-50 p-2 sm:p-3 rounded-md flex items-center">
          <Avatar 
            src={selectedUser.image} 
            icon={<UserOutlined />} 
            size={isMobile ? 'small' : 'default'}
            className="mr-2" 
          />
          <div className="flex-1">
            <div className={`font-medium ${isMobile ? "text-sm" : ""}`}>{selectedUser.full_name}</div>
            <div className="text-xs text-gray-500">@{selectedUser.username}</div>
          </div>
        </div>
      )}
    </div>

    <div className="mt-4 sm:mt-6">
      <h3 className={`${isMobile ? "text-base" : "text-lg"} font-medium mb-2 sm:mb-3`}>รายชื่อผู้ร่วมโปรเจค</h3>
      
      {contributors.length === 0 ? (
        <Empty 
          description="ยังไม่มีผู้ร่วมโปรเจค" 
          className="py-4 sm:py-8" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          imageStyle={{ height: isMobile ? 60 : 80 }}
        />
      ) : (
        <Table
          columns={getColumns()}
          dataSource={contributors}
          rowKey="user_id"
          pagination={false}
          size={isMobile ? "small" : "middle"}
          scroll={{ x: isMobile ? 400 : undefined }}
        />
      )}
    </div>
  </div>
);
};

export default ContributorsStep;