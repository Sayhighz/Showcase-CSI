import React from 'react';
import { Form, Input, Radio, Button, Space, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

const ProjectReviewForm = ({
  initialValues = {},
  onFinish,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [action, setAction] = React.useState(initialValues.action || 'approve');

  // เรียกใช้ฟังก์ชัน onFinish เมื่อกดปุ่มยืนยัน
  const handleFinish = (values) => {
    if (onFinish) {
      onFinish(values);
    }
  };

  // อัปเดตค่า action เมื่อมีการเปลี่ยนแปลง
  React.useEffect(() => {
    form.setFieldsValue({ action });
  }, [action, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ ...initialValues, action }}
      onFinish={handleFinish}
    >
      <Form.Item
        name="action"
        label="การดำเนินการ"
        rules={[{ required: true, message: 'กรุณาเลือกการดำเนินการ' }]}
      >
        <Radio.Group 
          onChange={(e) => setAction(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="approve" style={{ color: '#52c41a' }}>
            <CheckCircleOutlined /> อนุมัติ
          </Radio.Button>
          <Radio.Button value="reject" style={{ color: '#f5222d' }}>
            <CloseCircleOutlined /> ปฏิเสธ
          </Radio.Button>
        </Radio.Group>
      </Form.Item>
      
      <Form.Item
        name="comment"
        label="ความคิดเห็น"
        rules={[
          { 
            required: true, 
            message: action === 'approve' ? 'กรุณาระบุความคิดเห็นประกอบการอนุมัติ' : 'กรุณาระบุเหตุผลที่ปฏิเสธ'
          }
        ]}
      >
        <TextArea 
          rows={4} 
          placeholder={
            action === 'approve' 
              ? 'กรุณาระบุความคิดเห็นประกอบการอนุมัติ' 
              : 'กรุณาระบุเหตุผลที่ปฏิเสธ'
          }
        />
      </Form.Item>

      {action === 'approve' && (
        <div className="mb-4">
          <Text type="success">
            *โปรดระบุความคิดเห็นประกอบการอนุมัติโครงงานนี้
          </Text>
        </div>
      )}

      {action === 'reject' && (
        <div className="mb-4">
          <Text type="danger">
            *โปรดระบุเหตุผลที่ชัดเจนในการปฏิเสธโครงงานนี้ เพื่อให้ผู้สร้างสามารถปรับปรุงได้
          </Text>
        </div>
      )}
      
      <Form.Item>
        <Space className="flex justify-end">
          <Button onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button
            type={action === 'approve' ? 'primary' : 'danger'}
            htmlType="submit"
            loading={loading}
            style={
              action === 'approve' 
                ? { backgroundColor: '#52c41a', borderColor: '#52c41a' } 
                : {}
            }
          >
            {action === 'approve' ? 'ยืนยันการอนุมัติ' : 'ยืนยันการปฏิเสธ'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ProjectReviewForm;