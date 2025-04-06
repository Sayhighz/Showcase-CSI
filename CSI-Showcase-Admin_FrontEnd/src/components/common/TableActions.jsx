// src/components/common/TableActions.jsx
import React from 'react';
import { Button, Dropdown, Tooltip, Space } from 'antd';
import { 
  EllipsisOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined 
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { hasPermission } from '../../config/roles';
import { useAuth } from '../../context/AuthContext';

/**
 * Component สำหรับแสดงปุ่มดำเนินการในตาราง
 * 
 * @param {Object} props
 * @param {string} props.recordId - รหัสของรายการ
 * @param {string} props.viewPath - เส้นทางสำหรับดูรายละเอียด
 * @param {Function} props.onEdit - ฟังก์ชันที่เรียกเมื่อกดปุ่มแก้ไข
 * @param {Function} props.onDelete - ฟังก์ชันที่เรียกเมื่อกดปุ่มลบ
 * @param {Function} props.onApprove - ฟังก์ชันที่เรียกเมื่อกดปุ่มอนุมัติ
 * @param {Function} props.onReject - ฟังก์ชันที่เรียกเมื่อกดปุ่มปฏิเสธ
 * @param {boolean} props.showView - แสดงปุ่มดูรายละเอียดหรือไม่
 * @param {boolean} props.showEdit - แสดงปุ่มแก้ไขหรือไม่
 * @param {boolean} props.showDelete - แสดงปุ่มลบหรือไม่
 * @param {boolean} props.showApprove - แสดงปุ่มอนุมัติหรือไม่
 * @param {boolean} props.showReject - แสดงปุ่มปฏิเสธหรือไม่
 * @param {string} props.type - ประเภทของรายการ ('project', 'user')
 */
const TableActions = ({ 
  recordId,
  viewPath,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  showView = true,
  showEdit = true,
  showDelete = true,
  showApprove = false,
  showReject = false,
  type = 'project'
}) => {
  const { admin } = useAuth();
  const role = admin?.role || '';

  // ตรวจสอบสิทธิ์การเข้าถึง
  const canEdit = type === 'project' 
    ? hasPermission(role, 'project:edit') 
    : hasPermission(role, 'user:edit');

  const canDelete = type === 'project' 
    ? hasPermission(role, 'project:delete') 
    : hasPermission(role, 'user:delete');

  const canReview = type === 'project' && hasPermission(role, 'project:review');

  // สร้างรายการเมนู dropdown
  const getMenuItems = () => {
    const items = [];

    if (showView && viewPath) {
      items.push({
        key: 'view',
        icon: <EyeOutlined />,
        label: <Link to={viewPath}>ดูรายละเอียด</Link>
      });
    }

    if (showEdit && onEdit && canEdit) {
      items.push({
        key: 'edit',
        icon: <EditOutlined />,
        label: <span onClick={() => onEdit(recordId)}>แก้ไข</span>
      });
    }

    if (showDelete && onDelete && canDelete) {
      items.push({
        key: 'delete',
        icon: <DeleteOutlined />,
        label: <span onClick={() => onDelete(recordId)}>ลบ</span>,
        danger: true
      });
    }

    if (showApprove && onApprove && canReview) {
      items.push({
        key: 'approve',
        icon: <CheckOutlined />,
        label: <span onClick={() => onApprove(recordId)}>อนุมัติ</span>
      });
    }

    if (showReject && onReject && canReview) {
      items.push({
        key: 'reject',
        icon: <CloseOutlined />,
        label: <span onClick={() => onReject(recordId)}>ปฏิเสธ</span>,
        danger: true
      });
    }

    return items;
  };

  const menuItems = getMenuItems();

  // ถ้าไม่มีรายการใดๆ ให้แสดง "ไม่มีการดำเนินการ"
  if (menuItems.length === 0) {
    return <span className="text-gray-400">ไม่มีการดำเนินการ</span>;
  }

  // ถ้ามีเพียงปุ่มเดียว แสดงปุ่มตรงๆ
  if (menuItems.length === 1) {
    const item = menuItems[0];
    return (
      <Button 
        type="link"
        icon={item.icon}
        onClick={item.onClick}
        className="p-0"
      >
        {item.label}
      </Button>
    );
  }

  // ถ้ามีหลายปุ่ม แสดงเป็น dropdown
  return (
    <Dropdown 
      menu={{ items: menuItems }} 
      trigger={['click']}
      placement="bottomRight"
    >
      <Button type="text" icon={<EllipsisOutlined />} />
    </Dropdown>
  );
};

export default TableActions;