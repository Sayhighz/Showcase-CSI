import React from 'react';
import { Modal, Spin } from 'antd';
import { SaveOutlined, LoadingOutlined } from '@ant-design/icons';

/**
 * แสดง Modal ยืนยันการบันทึกการแก้ไขโครงการ
 * 
 * @param {Object} props - คุณสมบัติของคอมโพเนนต์
 * @param {boolean} props.isModalVisible - สถานะการแสดง Modal
 * @param {Function} props.handleConfirmSave - ฟังก์ชันที่ทำงานเมื่อกดปุ่มยืนยัน
 * @param {Function} props.handleCancel - ฟังก์ชันที่ทำงานเมื่อกดปุ่มยกเลิก
 * @param {boolean} props.isSaving - สถานะกำลังบันทึกข้อมูล
 */
const SaveConfirmationModal = ({ isModalVisible, handleConfirmSave, handleCancel, isSaving }) => {
  return (
    <Modal
      title={
        <div className="flex items-center text-[#90278E]">
          <SaveOutlined className="mr-2" /> ยืนยันการบันทึกการแก้ไข
        </div>
      }
      open={isModalVisible}
      onOk={handleConfirmSave}
      onCancel={handleCancel}
      okText="ยืนยัน"
      cancelText="ยกเลิก"
      okButtonProps={{ 
        style: { 
          background: '#90278E', 
          borderColor: '#90278E' 
        },
        disabled: isSaving  // ปิดปุ่มเมื่อกำลังบันทึกข้อมูล
      }}
      cancelButtonProps={{ 
        style: { borderColor: '#90278E', color: '#90278E' },
        disabled: isSaving  // ปิดปุ่มเมื่อกำลังบันทึกข้อมูล 
      }}
      style={{ 
        top: 20,
      }}
      bodyStyle={{
        background: 'linear-gradient(to bottom, rgba(13, 2, 33, 0.02), rgba(144, 39, 142, 0.05))',
        borderRadius: '0.5rem',
        padding: '20px',
      }}
      maskClosable={!isSaving}  // ไม่ให้คลิกพื้นหลังปิด Modal ขณะกำลังบันทึกข้อมูล
      closable={!isSaving}     // ไม่ให้มีปุ่มปิด X ขณะกำลังบันทึกข้อมูล
    >
      <Spin spinning={isSaving} indicator={<LoadingOutlined style={{ fontSize: 24, color: '#90278E' }} spin />}>
        <div className="p-4 relative">
          {/* Space-themed decorative elements */}
          <div className="absolute top-0 right-0 w-12 h-12 rounded-full bg-[#90278E]/5 blur-lg"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-[#90278E]/5 blur-xl"></div>
          
          <p className="text-center text-lg mb-4">คุณแน่ใจหรือไม่ว่าต้องการบันทึกการแก้ไขนี้?</p>
          <p className="text-center text-sm text-gray-500">การแก้ไขจะมีผลทันทีและจะปรากฏต่อผู้ใช้อื่นหากโครงการเป็นสาธารณะ</p>
          
          {/* Save icon animation */}
          <div className="mt-6 flex justify-center">
            <div className={isSaving ? "animate-bounce animate-pulse" : "animate-pulse"}>
              <SaveOutlined style={{ fontSize: '2.5rem', color: '#90278E' }} />
            </div>
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default SaveConfirmationModal;