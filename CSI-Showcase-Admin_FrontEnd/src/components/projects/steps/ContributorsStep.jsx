import React, { useState, useRef } from "react";
import { Button, Input, Select, Card, Typography, Space, Empty, Radio, Divider, message } from "antd";
import { PlusOutlined, DeleteOutlined, UserOutlined, TeamOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import { searchStudents as searchStudentsApi } from "../../../services/searchService";

const { Text } = Typography;

/**
 * ContributorsStep - ขั้นตอนการเพิ่มผู้ร่วมโครงการ (รองรับทั้งสมาชิกที่ลงทะเบียนและภายนอก)
 * @param {Object} props - Component properties
 * @param {Array} props.contributors - รายชื่อผู้ร่วมโครงการ
 * @param {Function} props.onChange - ฟังก์ชันสำหรับการเปลี่ยนแปลงรายชื่อผู้ร่วมโครงการ
 * @returns {JSX.Element} - ContributorsStep component
 */
const ContributorsStep = ({ contributors = [], onChange }) => {
  const [memberType, setMemberType] = useState('registered'); // 'registered' หรือ 'external'
  const [newContributor, setNewContributor] = useState({
    // สำหรับสมาชิกที่ลงทะเบียน
    user_id: '',
    username: '',
    // สำหรับสมาชิกภายนอก
    name: '',
    student_id: '',
    email: '',
    // ทั่วไป
    role: 'contributor'
  });

  // Current logged-in user (prevent self-adding)
  const { user: authUser } = useAuth();

  // Autocomplete state
  const [options, setOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimerRef = useRef(null);

  const handleSearchUsers = (query) => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(async () => {
      try {
        if (!query || !query.trim()) {
          setOptions([]);
          return;
        }
        setSearchLoading(true);
        const results = await searchStudentsApi(query, 10);
        setOptions(
          (Array.isArray(results) ? results : []).map((s) => ({
            value: String(s.user_id),
            label: `${s.full_name} (${s.username}) - ${s.email || "-"}`,
            user_id: s.user_id,
            username: s.username,
          }))
        );
      } catch (e) {
        console.error("Search students error:", e);
        setOptions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  const isSelfSelected =
    authUser && newContributor.user_id && String(newContributor.user_id) === String(authUser.id);

  // เพิ่มผู้ร่วมโครงการ
  const addContributor = () => {
    // ตรวจสอบข้อมูลที่จำเป็นตามประเภทสมาชิก
    if (memberType === 'registered') {
      if (!newContributor.user_id || !newContributor.username) {
        return;
      }
      // ป้องกันไม่ให้ใส่ตัวเอง
      if (isSelfSelected) {
        message.warning('ไม่สามารถเพิ่มตนเองเป็นผู้ร่วมโครงการได้');
        return;
      }
      // ตรวจสอบว่าไม่ซ้ำ (สมาชิกที่ลงทะเบียน)
      const exists = contributors.find(c => String(c.user_id) === String(newContributor.user_id));
      if (exists) {
        message.warning('รายชื่อผู้ใช้นี้ถูกเพิ่มอยู่แล้ว');
        return;
      }
    } else {
      if (!newContributor.name) {
        return;
      }
      // ตรวจสอบว่าไม่ซ้ำ (สมาชิกภายนอก)
      const exists = contributors.find(c =>
        c.name === newContributor.name && c.student_id === newContributor.student_id
      );
      if (exists) {
        message.warning('รายชื่อนี้ถูกเพิ่มอยู่แล้ว');
        return;
      }
    }

    // สร้างข้อมูลสมาชิกใหม่
    const contributorData = {
      role: newContributor.role,
      memberType: memberType
    };

    if (memberType === 'registered') {
      contributorData.user_id = newContributor.user_id;
      contributorData.username = newContributor.username;
    } else {
      contributorData.name = newContributor.name;
      contributorData.student_id = newContributor.student_id;
      contributorData.email = newContributor.email;
    }

    const updatedContributors = [...contributors, contributorData];
    onChange(updatedContributors);
    
    // รีเซ็ตฟอร์ม
    setNewContributor({
      user_id: '',
      username: '',
      name: '',
      student_id: '',
      email: '',
      role: 'contributor'
    });
  };

  // ลบผู้ร่วมโครงการ
  const removeContributor = (index) => {
    const updatedContributors = contributors.filter((_, i) => i !== index);
    onChange(updatedContributors);
  };

  // ปรับปรุงบทบาท
  const updateRole = (index, role) => {
    const updatedContributors = contributors.map((c, i) =>
      i === index ? { ...c, role } : c
    );
    onChange(updatedContributors);
  };

  // ตรวจสอบว่าสามารถเพิ่มได้หรือไม่
  const canAdd = () => {
    if (memberType === 'registered') {
      return newContributor.user_id && newContributor.username;
    } else {
      return newContributor.name;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">เพิ่มผู้ร่วมโครงการ</h3>
        <Text type="secondary">
          เพิ่มรายชื่อผู้ร่วมสร้างโครงการ (ถ้ามี) - รองรับทั้งสมาชิกที่ลงทะเบียนและบุคคลภายนอก
        </Text>
      </div>

      {/* ฟอร์มเพิ่มผู้ร่วมโครงการ */}
      <Card size="small">
        {/* เลือกประเภทสมาชิก */}
        <div className="mb-4">
          <Text className="block mb-2">ประเภทสมาชิก</Text>
          <Radio.Group
            value={memberType}
            onChange={(e) => {
              setMemberType(e.target.value);
              // รีเซ็ตฟอร์มเมื่อเปลี่ยนประเภท
              setNewContributor({
                user_id: '',
                username: '',
                name: '',
                student_id: '',
                email: '',
                role: 'contributor'
              });
            }}
          >
            <Radio value="registered">
              <UserOutlined /> สมาชิกที่ลงทะเบียนในระบบ
            </Radio>
            <Radio value="external">
              <TeamOutlined /> บุคคลภายนอก
            </Radio>
          </Radio.Group>
        </div>

        <Divider />

        {/* ฟอร์มสำหรับสมาชิกที่ลงทะเบียน */}
        {memberType === 'registered' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text className="block mb-1">ค้นหาสมาชิกที่ลงทะเบียน</Text>
                <Select
                  showSearch
                  placeholder="ค้นหา username / ชื่อ / อีเมล"
                  filterOption={false}
                  onSearch={handleSearchUsers}
                  onSelect={(_, option) =>
                    setNewContributor({
                      ...newContributor,
                      user_id: option.user_id,
                      username: option.username
                    })
                  }
                  options={options}
                  loading={searchLoading}
                  style={{ width: '100%' }}
                  value={
                    newContributor.user_id
                      ? `${newContributor.username}`
                      : undefined
                  }
                  allowClear
                  onClear={() =>
                    setNewContributor({
                      ...newContributor,
                      user_id: '',
                      username: ''
                    })
                  }
                />
                {isSelfSelected && (
                  <Text type="danger" className="mt-2 block">
                    ไม่สามารถเพิ่มตนเองเป็นผู้ร่วมโครงการได้
                  </Text>
                )}
              </div>

              <div>
                <Text className="block mb-1">บทบาท</Text>
                <Select
                  value={newContributor.role}
                  onChange={(role) =>
                    setNewContributor({
                      ...newContributor,
                      role
                    })
                  }
                  style={{ width: '100%' }}
                  options={[
                    { value: 'contributor', label: 'ผู้ร่วมงาน' },
                    { value: 'advisor', label: 'อาจารย์ที่ปรึกษา' }
                  ]}
                />
              </div>
            </div>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={addContributor}
              disabled={!canAdd() || isSelfSelected}
            >
              เพิ่ม
            </Button>
          </div>
        )}

        {/* ฟอร์มสำหรับบุคคลภายนอก */}
        {memberType === 'external' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text className="block mb-1">ชื่อ-นามสกุล <span className="text-red-500">*</span></Text>
                <Input
                  placeholder="เช่น นายสมชาย ใจดี"
                  value={newContributor.name}
                  onChange={(e) => setNewContributor({
                    ...newContributor,
                    name: e.target.value
                  })}
                />
              </div>
              
              <div>
                <Text className="block mb-1">รหัสนักศึกษา/รหัสประจำตัว</Text>
                <Input
                  placeholder="เช่น 640610001 (ถ้ามี)"
                  value={newContributor.student_id}
                  onChange={(e) => setNewContributor({
                    ...newContributor,
                    student_id: e.target.value
                  })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Text className="block mb-1">อีเมล</Text>
                <Input
                  placeholder="example@email.com (ถ้ามี)"
                  value={newContributor.email}
                  onChange={(e) => setNewContributor({
                    ...newContributor,
                    email: e.target.value
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
                disabled={!canAdd()}
              >
                เพิ่ม
              </Button>
            </div>
          </div>
        )}
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
            {contributors.map((contributor, index) => (
              <Card key={index} size="small">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {contributor.memberType === 'registered' ? (
                      <UserOutlined className="text-blue-500" />
                    ) : (
                      <TeamOutlined className="text-green-500" />
                    )}
                    <div>
                      {contributor.memberType === 'registered' ? (
                        <>
                          <Text strong>{contributor.username}</Text>
                          <br />
                          <Text type="secondary" className="text-sm">
                            รหัส: {contributor.user_id}
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text strong>{contributor.name}</Text>
                          <br />
                          <Text type="secondary" className="text-sm">
                            {contributor.student_id && `รหัส: ${contributor.student_id}`}
                            {contributor.student_id && contributor.email && ' | '}
                            {contributor.email && `อีเมล: ${contributor.email}`}
                            {!contributor.student_id && !contributor.email && 'บุคคลภายนอก'}
                          </Text>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <Space>
                    <Select
                      value={contributor.role}
                      onChange={(role) => updateRole(index, role)}
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
                      onClick={() => removeContributor(index)}
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