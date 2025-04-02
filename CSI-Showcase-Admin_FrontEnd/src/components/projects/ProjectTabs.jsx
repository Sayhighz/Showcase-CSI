import React from 'react';
import { Tabs, Badge, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const { TabPane } = Tabs;

/**
 * คอมโพเนนต์แท็บสำหรับกรองสถานะโปรเจค
 */
const ProjectTabs = ({ 
  currentTab, 
  handleTabChange,
  pendingCount 
}) => {
  const navigate = useNavigate();

  return (
    <Tabs 
      activeKey={currentTab} 
      onChange={handleTabChange} 
      className="mb-4"
      tabBarExtraContent={
        <Button 
          onClick={() => navigate('/projects/review')} 
          type="primary"
          className="bg-[#90278E]"
        >
          รายการรอตรวจสอบ
        </Button>
      }
    >
      <TabPane 
        tab={
          <span>ทั้งหมด</span>
        }
        key="all" 
      />
      <TabPane 
        tab={
          <span>
            รออนุมัติ 
            <Badge 
              count={pendingCount}
              offset={[6, -4]}
              size="small"
              style={{ backgroundColor: '#FAAD14' }}
            />
          </span>
        } 
        key="pending" 
      />
      <TabPane 
        tab={
          <span>อนุมัติแล้ว</span>
        } 
        key="approved" 
      />
      <TabPane 
        tab={
          <span>ถูกปฏิเสธ</span>
        } 
        key="rejected" 
      />
    </Tabs>
  );
};

export default ProjectTabs;