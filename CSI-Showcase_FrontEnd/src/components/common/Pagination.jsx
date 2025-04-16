import React from 'react';
import { Pagination as AntPagination, Select, Space, Typography } from 'antd';

const { Text } = Typography;
const { Option } = Select;

/**
 * Pagination component ใช้สำหรับแบ่งหน้าแสดงผลข้อมูล
 * 
 * @param {Object} props - Props ของ component
 * @param {number} props.current - หน้าปัจจุบัน
 * @param {number} props.total - จำนวนรายการทั้งหมด
 * @param {number} props.pageSize - จำนวนรายการต่อหน้า
 * @param {Function} props.onChange - ฟังก์ชันที่จะทำงานเมื่อเปลี่ยนหน้า
 * @param {Function} props.onPageSizeChange - ฟังก์ชันที่จะทำงานเมื่อเปลี่ยนจำนวนรายการต่อหน้า
 * @param {boolean} props.showSizeChanger - แสดงตัวเลือกจำนวนรายการต่อหน้าหรือไม่
 * @param {boolean} props.showQuickJumper - แสดงช่องกระโดดไปยังหน้าที่ต้องการหรือไม่
 * @param {boolean} props.showTotal - แสดงจำนวนรายการทั้งหมดหรือไม่
 * @param {string} props.position - ตำแหน่งของ pagination ('left', 'center', 'right')
 * @param {boolean} props.simple - แสดงแบบง่ายหรือไม่
 * @param {boolean} props.disabled - ปิดใช้งานหรือไม่
 * @param {Array} props.pageSizeOptions - ตัวเลือกจำนวนรายการต่อหน้า
 * @param {Object} props.style - Custom style สำหรับ component
 * @returns {JSX.Element} Pagination component
 */
const Pagination = ({
  current = 1,
  total = 0,
  pageSize = 10,
  onChange,
  onPageSizeChange,
  showSizeChanger = true,
  showQuickJumper = false,
  showTotal = true,
  position = 'center',
  simple = false,
  disabled = false,
  pageSizeOptions = ['10', '20', '50', '100'],
  style
}) => {
  // ฟังก์ชันสำหรับแสดงจำนวนรายการทั้งหมด
  const showTotalFunc = (total, range) => {
    return `${range[0]}-${range[1]} จาก ${total} รายการ`;
  };

  // ฟังก์ชันสำหรับการเปลี่ยนหน้า
  const handleChange = (page, pageSize) => {
    if (onChange) {
      onChange(page, pageSize);
    }
  };

  // ฟังก์ชันสำหรับการเปลี่ยนจำนวนรายการต่อหน้า
  const handlePageSizeChange = (current, size) => {
    if (onPageSizeChange) {
      onPageSizeChange(current, size);
    } else if (onChange) {
      onChange(current, size);
    }
  };

  // กำหนด style ตำแหน่งของ pagination
  const getPositionStyle = () => {
    switch (position) {
      case 'left':
        return { justifyContent: 'flex-start' };
      case 'right':
        return { justifyContent: 'flex-end' };
      case 'center':
      default:
        return { justifyContent: 'center' };
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      margin: '16px 0',
      ...getPositionStyle(),
      ...style 
    }}>
      <AntPagination
        current={current}
        total={total}
        pageSize={pageSize}
        onChange={handleChange}
        onShowSizeChange={handlePageSizeChange}
        showSizeChanger={showSizeChanger}
        showQuickJumper={showQuickJumper}
        showTotal={showTotal ? showTotalFunc : undefined}
        simple={simple}
        disabled={disabled}
        pageSizeOptions={pageSizeOptions}
        size={simple ? 'small' : 'default'}
      />
    </div>
  );
};

export default Pagination;