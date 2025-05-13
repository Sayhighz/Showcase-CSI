// src/components/users/UserImportModal.jsx
import React, { useState } from 'react';
import { 
  Modal, 
  Upload, 
  Button, 
  message, 
  Typography, 
  Steps, 
  Result, 
  Card, 
  Table, 
  Tabs, 
  Alert, 
  Space, 
  Divider 
} from 'antd';
import { 
  InboxOutlined, 
  DownloadOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';

const { Dragger } = Upload;
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TabPane } = Tabs;

const UserImportModal = ({
  visible,
  onCancel,
  onImport,
  onDownloadTemplate,
  importLoading = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [fileList, setFileList] = useState([]);
  const [importResult, setImportResult] = useState(null);

  // การจัดการการอัปโหลดไฟล์
  const handleUploadChange = (info) => {
    let newFileList = [...info.fileList];
    
    // จำกัดให้อัปโหลดได้แค่ 1 ไฟล์
    newFileList = newFileList.slice(-1);
    
    // อัปเดตสถานะ
    newFileList = newFileList.map(file => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });
    
    setFileList(newFileList);
  };

  // การจัดการการนำเข้าผู้ใช้
  const handleImport = async () => {
    if (fileList.length === 0) {
      message.error('กรุณาเลือกไฟล์ CSV ก่อนนำเข้าผู้ใช้');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', fileList[0].originFileObj);
    
    try {
      const result = await onImport(formData);
      if (result.success) {
        setImportResult(result.data);
        setCurrentStep(1);
      } else {
        message.error(result.message || 'เกิดข้อผิดพลาดในการนำเข้าผู้ใช้');
      }
    } catch (error) {
      console.error('Error importing users:', error);
      message.error('เกิดข้อผิดพลาดในการนำเข้าผู้ใช้');
    }
  };

  // การดาวน์โหลดเทมเพลต
  const handleDownloadTemplate = async () => {
    try {
      const result = await onDownloadTemplate();
      if (result.success) {
        message.success('เริ่มดาวน์โหลดเทมเพลต CSV แล้ว');
      } else {
        message.error(result.message || 'เกิดข้อผิดพลาดในการดาวน์โหลดเทมเพลต CSV');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      message.error('เกิดข้อผิดพลาดในการดาวน์โหลดเทมเพลต CSV');
    }
  };

  // รีเซ็ตสถานะเมื่อปิดโมดัล
  const handleModalClose = () => {
    setCurrentStep(0);
    setFileList([]);
    setImportResult(null);
    onCancel();
  };

  // แปลงบทบาทให้เป็นภาษาไทย
  const translateRole = (role) => {
    switch (role) {
      case 'admin': return 'ผู้ดูแลระบบ';
      case 'student': return 'นักศึกษา';
      case 'visitor': return 'ผู้เยี่ยมชม';
      default: return role;
    }
  };

  // คอลัมน์สำหรับตารางผู้ใช้ที่นำเข้าสำเร็จ
  const successColumns = [
    {
      title: 'ชื่อผู้ใช้',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'ชื่อ-นามสกุล',
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: 'อีเมล',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'บทบาท',
      dataIndex: 'role',
      key: 'role',
      render: (role) => translateRole(role),
    }
  ];

  // คอลัมน์สำหรับตารางผู้ใช้ที่นำเข้าไม่สำเร็จ
  const failedColumns = [
    {
      title: 'แถวที่',
      dataIndex: 'row',
      key: 'row',
    },
    {
      title: 'ชื่อผู้ใช้',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'อีเมล',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'ข้อผิดพลาด',
      dataIndex: 'error',
      key: 'error',
      render: (text) => <Text type="danger">{text}</Text>,
    }
  ];

  // คอลัมน์สำหรับตารางผู้ใช้ที่ข้ามไป
  const skippedColumns = [
    {
      title: 'แถวที่',
      dataIndex: 'row',
      key: 'row',
    },
    {
      title: 'ชื่อผู้ใช้',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'อีเมล',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (text) => <Text type="warning">{text}</Text>,
    },
    {
      title: 'ข้อมูลผู้ใช้ที่มีอยู่แล้ว',
      dataIndex: 'existingUser',
      key: 'existingUser',
      render: (user) => user ? (
        <div>
          <Text strong>{user.username}</Text>
          <Divider type="vertical" />
          <Text>{user.email}</Text>
        </div>
      ) : null,
    }
  ];

  // แสดงสรุปผลการนำเข้า
  const renderImportSummary = () => {
    if (!importResult) return null;
    
    const { totalRecords, successCount, failedCount, skippedCount } = importResult;
    
    return (
      <div>
        <Alert
          message={
            <Space direction="vertical">
              <div><Text strong>จำนวนผู้ใช้ทั้งหมดในไฟล์: {totalRecords} คน</Text></div>
              <div>
                <Space>
                  <Text type="success"><CheckCircleOutlined /> นำเข้าสำเร็จ: {successCount} คน</Text>
                  <Divider type="vertical" />
                  <Text type="warning"><WarningOutlined /> ข้ามไป (มีอยู่แล้ว): {skippedCount} คน</Text>
                  <Divider type="vertical" />
                  <Text type="danger"><CloseCircleOutlined /> ล้มเหลว: {failedCount} คน</Text>
                </Space>
              </div>
            </Space>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      </div>
    );
  };

  // ขั้นตอนการเลือกไฟล์ CSV
  const renderSelectFileStep = () => (
    <div>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Card>
          <Dragger
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={(file) => {
              // ตรวจสอบนามสกุลไฟล์
              const isCsv = file.type === 'text/csv' || file.name.endsWith('.csv');
              if (!isCsv) {
                message.error('กรุณาอัปโหลดไฟล์ CSV เท่านั้น');
                return Upload.LIST_IGNORE;
              }
              return false; // ป้องกันการอัปโหลดอัตโนมัติ
            }}
            maxCount={1}
            accept=".csv"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">คลิกหรือลากไฟล์ CSV มาที่นี่เพื่ออัปโหลด</p>
            <p className="ant-upload-hint">
              รองรับเฉพาะไฟล์ CSV เท่านั้น
            </p>
          </Dragger>
        </Card>

        <div className="text-center mt-4">
          <Text>ไม่มีไฟล์ CSV? </Text>
          <Button 
            type="link" 
            icon={<DownloadOutlined />} 
            onClick={handleDownloadTemplate}
          >
            ดาวน์โหลดเทมเพลตสำหรับการนำเข้า
          </Button>
        </div>
        
        <div className="mt-4">
          <Alert
            message="คำแนะนำการนำเข้าผู้ใช้"
            description={
              <ul>
                <li>ไฟล์ CSV ต้องมีคอลัมน์ username, full_name, email เป็นอย่างน้อย</li>
                <li>คอลัมน์ role ระบุบทบาทของผู้ใช้ (admin, student, visitor)</li>
                <li>คอลัมน์ password ใช้สำหรับกำหนดรหัสผ่านเอง (ไม่ระบุจะใช้รหัสผ่านแบบสุ่ม)</li>
                <li>หากชื่อผู้ใช้หรืออีเมลมีอยู่ในระบบแล้ว ผู้ใช้นั้นจะถูกข้ามในการนำเข้า</li>
              </ul>
            }
            type="info"
            showIcon
          />
        </div>
      </Space>
    </div>
  );

  // ขั้นตอนแสดงผลการนำเข้า
  const renderResultStep = () => (
    <div>
      {renderImportSummary()}
      
      <Tabs defaultActiveKey="success">
        <TabPane 
          tab={`นำเข้าสำเร็จ (${importResult?.successCount || 0})`} 
          key="success"
        >
          <Table
            columns={successColumns}
            dataSource={importResult?.successRecords?.map((record, index) => ({
              ...record,
              key: index
            })) || []}
            pagination={{ pageSize: 5 }}
            size="small"
          />
        </TabPane>
        
        <TabPane 
          tab={`ข้ามไป (${importResult?.skippedCount || 0})`} 
          key="skipped"
          disabled={!importResult?.skippedCount}
        >
          <Table
            columns={skippedColumns}
            dataSource={importResult?.skippedRecords?.map((record, index) => ({
              ...record,
              key: index
            })) || []}
            pagination={{ pageSize: 5 }}
            size="small"
          />
        </TabPane>
        
        <TabPane 
          tab={`ล้มเหลว (${importResult?.failedCount || 0})`} 
          key="failed"
          disabled={!importResult?.failedCount}
        >
          <Table
            columns={failedColumns}
            dataSource={importResult?.failedRecords?.map((record, index) => ({
              ...record,
              key: index
            })) || []}
            pagination={{ pageSize: 5 }}
            size="small"
          />
        </TabPane>
      </Tabs>
    </div>
  );

  return (
    <Modal
      title={currentStep === 0 ? "นำเข้าผู้ใช้จากไฟล์ CSV" : "ผลการนำเข้าผู้ใช้"}
      open={visible}
      onCancel={handleModalClose}
      width={800}
      footer={currentStep === 0 ? [
        <Button key="back" onClick={handleModalClose}>
          ยกเลิก
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleImport}
          loading={importLoading}
          disabled={fileList.length === 0}
        >
          นำเข้าผู้ใช้
        </Button>
      ] : [
        <Button key="close" type="primary" onClick={handleModalClose}>
          ปิด
        </Button>
      ]}
    >
      <Steps current={currentStep} className="mb-6">
        <Step title="เลือกไฟล์ CSV" />
        <Step title="ผลการนำเข้า" />
      </Steps>
      
      {currentStep === 0 ? renderSelectFileStep() : renderResultStep()}
    </Modal>
  );
};

export default UserImportModal;