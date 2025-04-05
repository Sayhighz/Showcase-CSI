import React from 'react';
import { Modal, Button, Alert } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const AdminDeleteModal = ({ 
  visible, 
  setVisible, 
  admin, 
  onDelete 
}) => {
  // If no admin is selected, return null
  if (!admin) return null;

  return (
    <Modal
      title={
        <div className="flex items-center text-red-600">
          <DeleteOutlined className="mr-2" />
          <span>ลบบัญชีผู้ดูแลระบบ</span>
        </div>
      }
      open={visible}
      onCancel={() => setVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setVisible(false)}>
          ยกเลิก
        </Button>,
        <Button 
          key="delete" 
          type="primary" 
          danger 
          onClick={onDelete}
        >
          ยืนยันการลบ
        </Button>
      ]}
    >
      <Alert
        message="คำเตือน: การลบบัญชีผู้ดูแลระบบ"
        description={`คุณกำลังจะลบบัญชีของ ${admin.full_name} (ชื่อผู้ใช้: ${admin.username}) การดำเนินการนี้จะลบข้อมูลทั้งหมดที่เกี่ยวข้องกับผู้ใช้รายนี้ คุณแน่ใจหรือไม่?`}
        type="error"
        showIcon
        className="mb-4"
      />

      <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
        <p className="text-yellow-700 text-sm">
          <strong>ข้อควรระวัง:</strong> 
          การลบบัญชีผู้ดูแลระบบอาจส่งผลกระทบต่อการทำงานของระบบ 
          โปรดตรวจสอบให้แน่ใจว่าจำเป็นต้องลบบัญชีนี้
        </p>
      </div>
    </Modal>
  );
};

export default AdminDeleteModal;