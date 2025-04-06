// src/components/common/LoadingState.jsx
import React from 'react';
import { Spin, Row, Col, Skeleton, Card, Table } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { STATUS_MESSAGES } from '../../constants/thaiMessages';

/**
 * Component แสดงสถานะกำลังโหลด
 * 
 * @param {Object} props
 * @param {string} props.type - ประเภทของการโหลด ('full', 'card', 'list', 'table')
 * @param {string} props.message - ข้อความที่ต้องการแสดง
 * @param {string} props.size - ขนาดของไอคอนการโหลด ('small', 'default', 'large')
 * @param {number} props.count - จำนวนรายการที่จะแสดงในกรณี type เป็น 'list' หรือ 'card'
 * @param {number} props.columns - จำนวนคอลัมน์ในกรณี type เป็น 'table'
 */
const LoadingState = ({
  type = 'full',
  message = STATUS_MESSAGES.LOADING,
  size = 'default',
  count = 3,
  columns = 5
}) => {
  // ไอคอนการโหลด
  const antIcon = (
    <LoadingOutlined style={{ fontSize: size === 'large' ? 40 : size === 'small' ? 16 : 24 }} spin />
  );

  // การแสดงผลตามประเภท
  switch (type) {
    case 'full':
      return (
        <div className="flex items-center justify-center min-h-[200px] w-full">
          <Spin indicator={antIcon} size={size} tip={message} />
        </div>
      );

    case 'card':
      return (
        <Row gutter={[16, 16]}>
          {Array.from({ length: count }).map((_, index) => (
            <Col key={index} xs={24} sm={12} lg={8}>
              <Card>
                <Skeleton active avatar paragraph={{ rows: 3 }} />
              </Card>
            </Col>
          ))}
        </Row>
      );

    case 'list':
      return (
        <Row gutter={[16, 16]}>
          {Array.from({ length: count }).map((_, index) => (
            <Col key={index} xs={24} sm={12} lg={8}>
              <Skeleton active avatar paragraph={{ rows: 3 }} />
            </Col>
          ))}
        </Row>
      );

    case 'table':
      return (
        <Table
          dataSource={Array.from({ length: count })}
          columns={Array.from({ length: columns }).map((_, index) => ({
            title: `Column ${index + 1}`,
            dataIndex: `column${index + 1}`,
            key: `column${index + 1}`,
            render: () => <Skeleton active />
          }))}
          pagination={false}
        />
      );

    default:
      return null;
  }
};

export default LoadingState;