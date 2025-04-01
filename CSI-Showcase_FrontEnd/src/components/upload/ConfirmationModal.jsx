import React from 'react';
import { Modal, Spin } from 'antd';
import { RocketOutlined, LoadingOutlined } from '@ant-design/icons';

const ConfirmationModal = ({ isModalVisible, handleConfirmSubmit, handleCancel, isSubmitting }) => {
  return (
    <Modal
      title={
        <div className="flex items-center text-[#90278E]">
          <RocketOutlined className="mr-2" /> ยืนยันการส่งผลงาน
        </div>
      }
      open={isModalVisible}
      onOk={handleConfirmSubmit}
      onCancel={handleCancel}
      okText="ยืนยัน"
      cancelText="ยกเลิก"
      okButtonProps={{ 
        style: { 
          background: '#90278E', 
          borderColor: '#90278E' 
        },
        disabled: isSubmitting  // ปิดปุ่มเมื่อกำลังส่งข้อมูล
      }}
      cancelButtonProps={{ 
        style: { borderColor: '#90278E', color: '#90278E' },
        disabled: isSubmitting  // ปิดปุ่มเมื่อกำลังส่งข้อมูล 
      }}
      style={{ 
        top: 20,
      }}
      bodyStyle={{
        background: 'linear-gradient(to bottom, rgba(13, 2, 33, 0.02), rgba(144, 39, 142, 0.05))',
        borderRadius: '0.5rem',
        padding: '20px',
      }}
      maskClosable={!isSubmitting}  // ไม่ให้คลิกพื้นหลังปิด Modal ขณะกำลังส่งข้อมูล
      closable={!isSubmitting}     // ไม่ให้มีปุ่มปิด X ขณะกำลังส่งข้อมูล
    >
      <Spin spinning={isSubmitting} indicator={<LoadingOutlined style={{ fontSize: 24, color: '#90278E' }} spin />}>
        <div className="p-4 relative">
          {/* Space-themed decorative elements */}
          <div className="absolute top-0 right-0 w-12 h-12 rounded-full bg-[#90278E]/5 blur-lg"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-[#90278E]/5 blur-xl"></div>
          
          <p className="text-center text-lg mb-4">คุณแน่ใจหรือไม่ว่าต้องการส่งผลงานนี้?</p>
          <p className="text-center text-sm text-gray-500">หลังจากส่งแล้ว โปรดรอการตรวจสอบจากเจ้าหน้าที่ประมาณ 1-2 วัน</p>
          
          {/* Rocket animation */}
          <div className="mt-6 flex justify-center">
            <div className={isSubmitting ? "animate-bounce animate-pulse" : "animate-bounce"}>
              <RocketOutlined style={{ fontSize: '2.5rem', color: '#90278E' }} />
            </div>
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default ConfirmationModal;