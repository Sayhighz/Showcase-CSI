import React from 'react';
import { Button, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import PageTitle from '../../common/PageTitle';

const ProjectHeader = ({
  title,
  projectId,
  onEdit,
  onDelete,
  onBack,
  canDelete = true
}) => {
  return (
    <PageTitle 
      title={title} 
      subtitle={`รหัสโปรเจค: ${projectId}`}
      extra={
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={onBack}
          >
            กลับ
          </Button>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={onEdit}
            className="bg-{#90278E} hover:bg-purple-700"
          >
            แก้ไข
          </Button>
          {canDelete && (
            <Popconfirm
              title="ลบโปรเจค"
              description="คุณแน่ใจหรือไม่ที่ต้องการลบโปรเจคนี้? การลบข้อมูลไม่สามารถเรียกคืนได้"
              onConfirm={onDelete}
              okText="ลบ"
              cancelText="ยกเลิก"
              okButtonProps={{ danger: true }}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
              >
                ลบ
              </Button>
            </Popconfirm>
          )}
        </Space>
      }
    />
  );
};

export default ProjectHeader;