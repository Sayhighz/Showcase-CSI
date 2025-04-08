// src/components/dashboard/ApprovalRatioCard.jsx
import React from 'react';
import { Card, Progress, Row, Col, Statistic, Divider } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined 
} from '@ant-design/icons';
import { formatNumber } from '../../utils/numberUtils';

/**
 * Component แสดงอัตราส่วนการอนุมัติโปรเจค
 * 
 * @param {Object} props
 * @param {Object} props.approvalStats - ข้อมูลสถิติการอนุมัติ
 */
const ApprovalRatioCard = ({ approvalStats }) => {
  if (!approvalStats) return null;
  // const approvalStats = Array.isArray(approvalStats) ? approvalStats : [];

  const { approved, rejected, pending, total } = approvalStats;

  // คำนวณเปอร์เซ็นต์
  const approvedPercent = total > 0 ? Math.round((approved / total) * 100) : 0;
  const rejectedPercent = total > 0 ? Math.round((rejected / total) * 100) : 0;
  const pendingPercent = total > 0 ? Math.round((pending / total) * 100) : 0;

  // คำนวณอัตราส่วนการอนุมัติ (approved / (approved + rejected))
  const totalReviewed = approved + rejected;
  const approvalRatio = totalReviewed > 0 ? Math.round((approved / totalReviewed) * 100) : 0;

  return (
    <Card title="อัตราส่วนการอนุมัติโปรเจค">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={6}>
          <div className="text-center">
            <Progress
              type="dashboard"
              percent={approvalRatio}
              strokeColor={approvalRatio >= 70 ? '#52c41a' : approvalRatio >= 40 ? '#faad14' : '#f5222d'}
              format={percent => `${percent}%`}
            />
            <h3 className="mt-2">อัตราส่วนการอนุมัติ</h3>
            <p className="text-gray-500">
              {approved} อนุมัติ จากการตรวจสอบ {totalReviewed} โปรเจค</p>
          </div>
        </Col>

        <Col xs={24} lg={18}>
          <Row gutter={[16, 16]}>
            {/* Approved Stats */}
            <Col xs={24} md={8}>
              <Statistic
                title="อนุมัติแล้ว"
                value={formatNumber(approved)}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
                suffix={<small className="ml-1">{approvedPercent}%</small>}
              />
              <Progress 
                percent={approvedPercent} 
                status="success" 
                showInfo={false} 
                className="mt-2"
              />
            </Col>

            {/* Rejected Stats */}
            <Col xs={24} md={8}>
              <Statistic
                title="ถูกปฏิเสธ"
                value={formatNumber(rejected)}
                valueStyle={{ color: '#f5222d' }}
                prefix={<CloseCircleOutlined />}
                suffix={<small className="ml-1">{rejectedPercent}%</small>}
              />
              <Progress 
                percent={rejectedPercent} 
                status="exception" 
                showInfo={false} 
                className="mt-2"
              />
            </Col>

            {/* Pending Stats */}
            <Col xs={24} md={8}>
              <Statistic
                title="รอการตรวจสอบ"
                value={formatNumber(pending)}
                valueStyle={{ color: '#faad14' }}
                prefix={<ClockCircleOutlined />}
                suffix={<small className="ml-1">{pendingPercent}%</small>}
              />
              <Progress 
                percent={pendingPercent} 
                status="active" 
                strokeColor="#faad14" 
                showInfo={false} 
                className="mt-2"
              />
            </Col>
          </Row>

          <Divider />

          <div className="text-center text-gray-500">
            จำนวนโปรเจคทั้งหมด: <span className="font-medium">{formatNumber(total)}</span>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default ApprovalRatioCard;