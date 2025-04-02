import React from 'react';
import { 
  Modal, Button, Alert 
} from 'antd';

const ProjectDeleteModal = ({ 
  deleteModalVisible, 
  setDeleteModalVisible, 
  project, 
  handleDeleteProject, 
  deletingProject 
}) => {
  return (
    <Modal
      title="ยืนยันการลบโปรเจค"
      open={deleteModalVisible}
      onCancel={() => setDeleteModalVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setDeleteModalVisible(false)}>
          ยกเลิก
        </Button>,
        <Button 
          key="delete" 
          type="primary" 
          danger 
          loading={deletingProject}
          onClick={handleDeleteProject}
        >
          ยืนยันการลบ
        </Button>
      ]}
    >
      <Alert
        message="คำเตือน: การลบโปรเจคไม่สามารถเรียกคืนได้"
        description={`คุณกำลังจะลบโปรเจค "${project.title}" การลบโปรเจคจะลบข้อมูลทั้งหมดรวมถึงไฟล์ที่เกี่ยวข้องโดยถาวร ไม่สามารถเรียกคืนได้ คุณแน่ใจหรือไม่?`}
        type="error"
        showIcon
      />
    </Modal>
  );
};

export default ProjectDeleteModal;