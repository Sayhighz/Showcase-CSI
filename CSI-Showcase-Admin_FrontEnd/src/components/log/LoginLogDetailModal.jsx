// src/components/logs/LoginLogDetailModal.jsx
import React from 'react';
import { Modal, Descriptions, Badge, Divider, Typography, Space, Row, Col, Card, Tooltip, Tag } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined, 
  GlobalOutlined, 
  DesktopOutlined,
  InfoCircleOutlined,
  UserOutlined,
  KeyOutlined,
  EnvironmentOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { formatThaiDate } from '../../utils/dataUtils';
import UserAvatar from '../common/UserAvatar';
import UserRoleBadge from '../common/UserRoleBadge';
import { LOGIN_STATUS } from '../../constants/userConstants';

const { Text, Title, Paragraph } = Typography;

/**
 * Component แสดงรายละเอียดประวัติการเข้าสู่ระบบในรูปแบบ Modal
 * 
 * @param {Object} props
 * @param {boolean} props.visible - สถานะการแสดง Modal
 * @param {Function} props.onClose - ฟังก์ชันที่เรียกเมื่อปิด Modal
 * @param {Object} props.log - ข้อมูลประวัติการเข้าสู่ระบบ
 */
const LoginLogDetailModal = ({ visible, onClose, log }) => {
  if (!log) return null;

  // จัดรูปแบบวันที่
  const formattedDate = formatThaiDate(log.loginTime, {
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  // ใช้ข้อมูลที่ส่งมาจาก backend โดยตรง แทนที่จะวิเคราะห์เอง
  const deviceInfo = {
    // ถ้ามี device_type จาก backend ให้ใช้ ถ้าไม่มีให้ใช้ค่าเดิม
    device: log.device_type || log.device || 'ไม่มีข้อมูล',
    // ถ้ามี os จาก backend ให้ใช้ ถ้าไม่มีให้ใช้ค่าเดิม
    os: log.os || 'ไม่มีข้อมูล',
    // ถ้ามี browser จาก backend ให้ใช้ ถ้าไม่มีให้ใช้ค่าเดิม
    browser: log.browser || 'ไม่มีข้อมูล'
  };

  return (
    <Modal
      title={
        <div className="flex items-center text-blue-700">
          <HistoryOutlined className="mr-2 text-lg" />
          <span className="text-lg">รายละเอียดการเข้าสู่ระบบ</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      className="login-log-detail-modal"
      centered
      maskClosable={false}
      closeIcon={<CloseCircleOutlined className="text-gray-500 hover:text-red-500" />}
    >
      <div className="py-4">
        {/* ส่วนหัวแสดงข้อมูลผู้ใช้ */}
        <Card className="mb-4 bg-gray-50 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center">
            <div className="relative">
              <UserAvatar
                user={{
                  full_name: log.full_name,
                  role: log.role,
                  image: log.image
                }}
                size={64}
                showBadge
              />
              <Badge
                status={log.status === LOGIN_STATUS.SUCCESS ? "success" : "error"}
                className="absolute bottom-0 right-0 border-2 border-white"
              />
            </div>
            <div className="ml-4 flex-1">
              <Title level={4} className="mb-0 flex items-center">
                <UserOutlined className="mr-2 text-blue-500" />
                {log.full_name}
              </Title>
              <Space wrap>
                <Text type="secondary" className="flex items-center">
                  <KeyOutlined className="mr-1" />
                  {log.username}
                </Text>
                <UserRoleBadge role={log.role} size="default" />
              </Space>
            </div>
          </div>
        </Card>
        
        
        {/* ส่วนแสดงรายละเอียดเวลาและอุปกรณ์ */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} md={12}>
            <Card 
              title={
                <div className="flex items-center">
                  <ClockCircleOutlined className="mr-2 text-orange-500" />
                  <span>ข้อมูลเวลา</span>
                </div>
              }
              className="h-full hover:shadow-md transition-shadow duration-300"
              bodyStyle={{ height: 'calc(100% - 58px)' }}
            >
              <Paragraph className="flex items-start mb-2">
                <ClockCircleOutlined className="mr-2 mt-1 text-gray-500" />
                <span>
                  <Text strong className="block text-sm">วันและเวลาที่เข้าสู่ระบบ</Text>
                  <Text className="text-gray-600">{formattedDate}</Text>
                </span>
              </Paragraph>
            </Card>
          </Col>
          
          <Col xs={24} md={12}>
            <Card 
              title={
                <div className="flex items-center">
                  <EnvironmentOutlined className="mr-2 text-blue-500" />
                  <span>ข้อมูลตำแหน่ง</span>
                </div>
              }
              className="h-full hover:shadow-md transition-shadow duration-300"
              bodyStyle={{ height: 'calc(100% - 58px)' }}
            >
              <Paragraph className="flex items-start mb-2">
                <GlobalOutlined className="mr-2 mt-1 text-gray-500" />
                <span>
                  <Text strong className="block text-sm">IP Address</Text>
                  <Text className="text-gray-600" copyable>{log.ipAddress || log.ip_address || 'ไม่มีข้อมูล'}</Text>
                </span>
              </Paragraph>
            </Card>
          </Col>
        </Row>
        
        {/* ส่วนแสดงข้อมูลอุปกรณ์ */}
        <Card 
          title={
            <div className="flex items-center">
              <DesktopOutlined className="mr-2 text-purple-500" />
              <span>ข้อมูลอุปกรณ์</span>
            </div>
          }
          className="mb-4 hover:shadow-md transition-shadow duration-300"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card className="text-center h-full bg-gray-50">
                <div className="text-3xl text-gray-500 mb-2">
                  <DesktopOutlined />
                </div>
                <div className="text-sm font-medium">อุปกรณ์</div>
                <div className="text-gray-600">{deviceInfo.device}</div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="text-center h-full bg-gray-50">
                <div className="text-3xl text-gray-500 mb-2">
                  <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
                    <path d="M512.2 896.1c-168.8 0-305.9-137.1-305.9-305.9S343.4 284.3 512.2 284.3s305.9 137.1 305.9 305.9-137.1 305.9-305.9 305.9zm0-531.8c-124.8 0-225.9 101.1-225.9 225.9s101.1 225.9 225.9 225.9 225.9-101.1 225.9-225.9-101.1-225.9-225.9-225.9zM880.2 272.4c-38-38-87.5-58.9-140.5-58.9h-455c-53 0-102.5 20.9-140.5 58.9-38 38-58.9 87.5-58.9 140.5v455c0 53 20.9 102.5 58.9 140.5 38 38 87.5 58.9 140.5 58.9h455c53 0 102.5-20.9 140.5-58.9 38-38 58.9-87.5 58.9-140.5v-455c0-53-20.9-102.5-58.9-140.5zM512.2 825.1c-129.8 0-234.9-105.1-234.9-234.9S382.4 355.3 512.2 355.3s234.9 105.1 234.9 234.9-105.1 234.9-234.9 234.9z" />
                  </svg>
                </div>
                <div className="text-sm font-medium">ระบบปฏิบัติการ</div>
                <div className="text-gray-600">{deviceInfo.os}</div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="text-center h-full bg-gray-50">
                <div className="text-3xl text-gray-500 mb-2">
                  <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
                    <path d="M928 444H820V330.4c0-17.7-14.3-32-32-32H473L355.7 186.2a8.15 8.15 0 00-5.5-2.2H96c-17.7 0-32 14.3-32 32v592c0 17.7 14.3 32 32 32h698c13 0 24.8-7.9 29.7-20l134-332c1.5-3.8 2.3-7.9 2.3-12 0-17.7-14.3-32-32-32zM136 256h188.5l119.6 114.4H748V444H238c-13 0-24.8 7.9-29.7 20L136 643.2V256zm635.3 512H159l103.3-256h612.4L771.3 768z" />
                  </svg>
                </div>
                <div className="text-sm font-medium">เบราว์เซอร์</div>
                <div className="text-gray-600">{deviceInfo.browser}</div>
              </Card>
            </Col>
          </Row>
          
          <Divider className="my-4" />
          
          <Descriptions 
            title={<Text strong>ข้อมูล User Agent</Text>} 
            bordered 
            column={1} 
            size="small"
            className="mt-4"
          >
            <Descriptions.Item label="User Agent">
              <div className="text-xs break-words" style={{ wordBreak: 'break-all' }}>
                {log.userAgent || 'ไม่มีข้อมูล'}
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>
        
        {/* ส่วนแสดงข้อมูลเพิ่มเติม (ถ้ามี) */}
        {log.details && (
          <Card 
            title={
              <div className="flex items-center">
                <InfoCircleOutlined className="mr-2 text-teal-500" />
                <span>ข้อมูลเพิ่มเติม</span>
              </div>
            }
            className="hover:shadow-md transition-shadow duration-300"
          >
            <Descriptions bordered column={1} size="small">
              {Object.entries(log.details).map(([key, value]) => (
                <Descriptions.Item 
                  key={key} 
                  label={<Text strong>{key}</Text>}
                  labelStyle={{ background: '#f5f5f5' }}
                >
                  {typeof value === 'object' ? (
                    <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  ) : (
                    <Text>{value}</Text>
                  )}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default LoginLogDetailModal;