import React, { useState } from "react";
import { Button, Input, Select, Card, Typography, Space, Empty } from "antd";
import { PlusOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";

const { Text } = Typography;

/**
 * ContributorsStep - ขั้นตอนการเพิ่มผู้ร่วมโครงการ
 * @param {Object} props - Component properties
 * @param {Array} props.contributors - รายชื่อผู้ร่วมโครงการ
 * @param {Function} props.onChange - ฟังก์ชันสำหรับการเปลี่ยนแปลงรายชื่อผู้ร่วมโครงการ
 * @returns {JSX.Element} - ContributorsStep component
 */
const ContributorsStep = ({ contributors = [], onChange }) => {
  const [newContributor, setNewContributor] = useState({
    user_id: '',
    username: '',
    role: 'contributor'
  });

  // เพิ่มผู้ร่วมโครงการ
  const addContributor = () => {
    if (!newContributor.user_id || !newContributor.username) {
      return;
    }

    // ตรวจสอบว่าไม่ซ้ำ
    const exists = contributors.find(c => c.user_id === newContributor.user_id);
    if (exists) {
      return;
    }

    const updatedContributors = [...contributors, { ...newContributor }];
    onChange(updatedContributors);
    
    // รีเซ็ตฟอร์ม
    setNewContributor({
      user_id: '',
      username: '',
      role: 'contributor'
    });
  };

  // ลบผู้ร่วมโครงการ
  const removeContributor = (user_id) => {
    const updatedContributors = contributors.filter(c => c.user_id !== user_id);
    onChange(updatedContributors);
  };

  // ปรับปรุงบทบาท
  const updateRole = (user_id, role) => {
    const updatedContributors = contributors.map(c => 
      c.user_id === user_id ? { ...c, role } : c
    );
    onChange(updatedContributors);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">เพิ่มผู้ร่วมโครงการ</h3>
        <Text type="secondary">
          เพิ่มรายชื่อผู้ร่วมสร้างโครงการ (ถ้ามี)
        </Text>
      </div>

      {/* ฟอร์มเพิ่มผู้ร่วมโครงการ */}
      <Card size="small">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <Text className="block mb-1">รหัสนักศึกษา</Text>
            <Input
              placeholder="เช่น 640610001"
              value={newContributor.user_id}
              onChange={(e) => setNewContributor({
                ...newContributor,
                user_id: e.target.value
              })}
            />
          </div>
          
          <div>
            <Text className="block mb-1">ชื่อผู้ใช้</Text>
            <Input
              placeholder="username"
              value={newContributor.username}
              onChange={(e) => setNewContributor({
                ...newContributor,
                username: e.target.value
              })}
            />
          </div>
          
          <div>
            <Text className="block mb-1">บทบาท</Text>
            <Select
              value={newContributor.role}
              onChange={(role) => setNewContributor({
                ...newContributor,
                role
              })}
              style={{ width: '100%' }}
              options={[
                { value: 'contributor', label: 'ผู้ร่วมงาน' },
                { value: 'advisor', label: 'อาจารย์ที่ปรึกษา' }
              ]}
            />
          </div>
          
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={addContributor}
            disabled={!newContributor.user_id || !newContributor.username}
          >
            เพิ่ม
          </Button>
        </div>
      </Card>

      {/* รายชื่อผู้ร่วมโครงการ */}
      <div>
        <h4 className="text-base font-medium mb-3">
          ผู้ร่วมโครงการ ({contributors.length} คน)
        </h4>
        
        {contributors.length === 0 ? (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="ยังไม่มีผู้ร่วมโครงการ"
            className="py-8"
          />
        ) : (
          <div className="space-y-3">
            {contributors.map((contributor) => (
              <Card key={contributor.user_id} size="small">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <UserOutlined className="text-gray-400" />
                    <div>
                      <Text strong>{contributor.username}</Text>
                      <br />
                      <Text type="secondary" className="text-sm">
                        รหัส: {contributor.user_id}
                      </Text>
                    </div>
                  </div>
                  
                  <Space>
                    <Select
                      value={contributor.role}
                      onChange={(role) => updateRole(contributor.user_id, role)}
                      style={{ width: 140 }}
                      size="small"
                      options={[
                        { value: 'contributor', label: 'ผู้ร่วมงาน' },
                        { value: 'advisor', label: 'อาจารย์ที่ปรึกษา' }
                      ]}
                    />
                    
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removeContributor(contributor.user_id)}
                    />
                  </Space>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContributorsStep;