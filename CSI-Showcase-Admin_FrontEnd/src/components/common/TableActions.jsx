import React from 'react';
import { Space, Button, Tooltip, Dropdown } from 'antd';
import { 
  EyeOutlined, EditOutlined, DeleteOutlined, 
  CheckCircleOutlined, CloseCircleOutlined, 
  FileTextOutlined, MoreOutlined
} from '@ant-design/icons';

/**
 * คอมโพเนนต์ปุ่มดำเนินการในตาราง
 * @param {Object} props - พร็อพเพอร์ตี้ของคอมโพเนนต์
 * @param {string|number} props.recordId - ไอดีของรายการ
 * @param {Object} props.record - ข้อมูลแถวในตาราง (เพิ่มเติม)
 * @param {boolean} props.showView - แสดงปุ่มดูรายละเอียดหรือไม่
 * @param {boolean} props.showEdit - แสดงปุ่มแก้ไขหรือไม่
 * @param {boolean} props.showDelete - แสดงปุ่มลบหรือไม่
 * @param {boolean} props.showApprove - แสดงปุ่มอนุมัติหรือไม่
 * @param {boolean} props.showReject - แสดงปุ่มปฏิเสธหรือไม่
 * @param {boolean} props.showReview - แสดงปุ่มตรวจสอบหรือไม่
 * @param {boolean} props.useDropdown - ใช้ดรอปดาวน์แทนปุ่มหรือไม่
 * @param {function} props.onView - ฟังก์ชันเมื่อกดดูรายละเอียด
 * @param {function} props.onEdit - ฟังก์ชันเมื่อกดแก้ไข
 * @param {function} props.onDelete - ฟังก์ชันเมื่อกดลบ
 * @param {function} props.onApprove - ฟังก์ชันเมื่อกดอนุมัติ
 * @param {function} props.onReject - ฟังก์ชันเมื่อกดปฏิเสธ
 * @param {function} props.onReview - ฟังก์ชันเมื่อกดตรวจสอบ
 * @returns {JSX.Element} - คอมโพเนนต์ปุ่มดำเนินการ
 */
const TableActions = ({
  recordId,
  record,
  showView = true,
  showEdit = false,
  showDelete = true,
  showApprove = false,
  showReject = false,
  showReview = false,
  useDropdown = false,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onReview,
  disabled = false,
}) => {
  // ถ้าใช้ดรอปดาวน์
  if (useDropdown) {
    const items = [];
    
    // เพิ่มรายการในดรอปดาวน์
    if (showView && onView) {
      items.push({
        key: 'view',
        label: 'ดูรายละเอียด',
        icon: <EyeOutlined />,
        onClick: () => onView(recordId, record),
      });
    }
    
    if (showReview && onReview) {
      items.push({
        key: 'review',
        label: 'ตรวจสอบ',
        icon: <FileTextOutlined />,
        onClick: () => onReview(recordId, record),
      });
    }
    
    if (showEdit && onEdit) {
      items.push({
        key: 'edit',
        label: 'แก้ไข',
        icon: <EditOutlined />,
        onClick: () => onEdit(recordId, record),
      });
    }
    
    if (showApprove && onApprove) {
      items.push({
        key: 'approve',
        label: 'อนุมัติ',
        icon: <CheckCircleOutlined style={{ color: 'green' }} />,
        onClick: () => onApprove(recordId, record),
      });
    }
    
    if (showReject && onReject) {
      items.push({
        key: 'reject',
        label: 'ปฏิเสธ',
        icon: <CloseCircleOutlined style={{ color: 'red' }} />,
        onClick: () => onReject(recordId, record),
      });
    }
    
    if (showDelete && onDelete) {
      items.push({
        key: 'delete',
        label: 'ลบ',
        icon: <DeleteOutlined style={{ color: 'red' }} />,
        onClick: () => onDelete(recordId, record),
      });
    }
    
    return (
      <Dropdown menu={{ items }} disabled={disabled}>
        <Button icon={<MoreOutlined />} size="small" />
      </Dropdown>
    );
  }
  
  // ถ้าใช้ปุ่มปกติ
  return (
    <Space size="small">
      {showView && onView && (
        <Tooltip title="ดูรายละเอียด">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => onView(recordId, record)}
            disabled={disabled}
          />
        </Tooltip>
      )}
      
      {showReview && onReview && (
        <Tooltip title="ตรวจสอบ">
          <Button
            icon={<FileTextOutlined />}
            size="small"
            onClick={() => onReview(recordId, record)}
            disabled={disabled}
          />
        </Tooltip>
      )}
      
      {showEdit && onEdit && (
        <Tooltip title="แก้ไข">
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => onEdit(recordId, record)}
            disabled={disabled}
          />
        </Tooltip>
      )}
      
      {showApprove && onApprove && (
        <Tooltip title="อนุมัติ">
          <Button
            icon={<CheckCircleOutlined />}
            type="primary"
            className="bg-green-600 hover:bg-green-700"
            size="small"
            onClick={() => onApprove(recordId, record)}
            disabled={disabled}
          />
        </Tooltip>
      )}
      
      {showReject && onReject && (
        <Tooltip title="ปฏิเสธ">
          <Button
            icon={<CloseCircleOutlined />}
            type="primary"
            danger
            size="small"
            onClick={() => onReject(recordId, record)}
            disabled={disabled}
          />
        </Tooltip>
      )}
      
      {showDelete && onDelete && (
        <Tooltip title="ลบ">
          <Button
            icon={<DeleteOutlined />}
            type="primary"
            danger
            size="small"
            onClick={() => onDelete(recordId, record)}
            disabled={disabled}
          />
        </Tooltip>
      )}
    </Space>
  );
};

export default TableActions;