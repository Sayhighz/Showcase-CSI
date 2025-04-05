import React from 'react';
import { Modal, Button, Alert } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const StudentDeleteModal = ({ 
  visible, 
  setVisible, 
  student, 
  onDelete 
}) => {
  // If no student is selected, return null
  if (!student) return null;

  return (
    <Modal
      title={
        <div className="flex items-center text-red-600">
          <DeleteOutlined className="mr-2" />
          <span>ลบบัญชีนักศึกษา</span>
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
        message="คำเตือน: การลบบัญชีนักศึกษา"
        description={`คุณกำลังจะลบบัญชีของ ${student.full_name} (ชื่อผู้ใช้: ${student.username}) การดำเนินการนี้จะลบข้อมูลทั้งหมดที่เกี่ยวข้องกับผู้ใช้รายนี้ รวมถึงโปรเจคและข้อมูลส่วนตัว คุณแน่ใจหรือไม่?`}
        type="error"
        showIcon
        className="mb-4"
      />
    </Modal>
  );
};

export default StudentDeleteModal;