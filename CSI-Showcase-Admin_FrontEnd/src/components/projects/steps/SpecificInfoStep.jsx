import React from "react";
import { Form, Input, InputNumber, DatePicker } from "antd";

const PROJECT_TYPE = {
  COURSEWORK: 'coursework',
  ACADEMIC: 'academic',
  COMPETITION: 'competition'
};

/**
 * SpecificInfoStep - ขั้นตอนการกรอกข้อมูลเฉพาะตามประเภทโปรเจค
 * @param {Object} props - Component properties
 * @param {Object} props.form - Form instance จาก Form.useForm()
 * @param {string} props.projectType - ประเภทของโปรเจค
 * @returns {JSX.Element} - SpecificInfoStep component
 */
const SpecificInfoStep = ({ form, projectType }) => {
  if (!projectType) {
    return (
      <div className="py-4 text-center text-gray-500">
        กรุณาเลือกประเภทโปรเจคในขั้นตอนก่อนหน้า
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {projectType === PROJECT_TYPE.ACADEMIC && (
        <>
          <h3 className="text-lg font-medium mb-4">ข้อมูลบทความวิชาการ</h3>
          
          <Form.Item
            name="published_year"
            label="ปีที่ตีพิมพ์"
            rules={[{ required: true, message: "กรุณากรอกปีที่ตีพิมพ์" }]}
          >
            <InputNumber
              min={2500}
              max={2600}
              placeholder="เช่น 2566"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="publication_date"
            label="วันที่ตีพิมพ์"
            rules={[{ required: true, message: "กรุณาเลือกวันที่ตีพิมพ์" }]}
          >
            <DatePicker
              placeholder="เลือกวันที่ตีพิมพ์"
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
            />
          </Form.Item>
        </>
      )}

      {projectType === PROJECT_TYPE.COMPETITION && (
        <>
          <h3 className="text-lg font-medium mb-4">ข้อมูลการแข่งขัน</h3>
          
          <Form.Item
            name="competition_name"
            label="ชื่อการแข่งขัน"
            rules={[
              { required: true, message: "กรุณากรอกชื่อการแข่งขัน" },
              {
                min: 3,
                message: "ชื่อการแข่งขันต้องมีความยาวอย่างน้อย 3 ตัวอักษร",
              },
            ]}
          >
            <Input
              placeholder="ระบุชื่อการแข่งขัน"
              maxLength={200}
            />
          </Form.Item>

          <Form.Item
            name="competition_year"
            label="ปีที่จัดการแข่งขัน"
            rules={[{ required: true, message: "กรุณากรอกปีที่จัดการแข่งขัน" }]}
          >
            <InputNumber
              min={2500}
              max={2600}
              placeholder="เช่น 2566"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </>
      )}

      {projectType === PROJECT_TYPE.COURSEWORK && (
        <>
          <h3 className="text-lg font-medium mb-4">ข้อมูลงานในชั้นเรียน</h3>
          
          <Form.Item
            name="clip_video"
            label="ลิงก์วิดีโอ (ถ้ามี)"
            rules={[
              {
                type: "url",
                message: "กรุณากรอก URL ที่ถูกต้อง",
              },
            ]}
          >
            <Input
              placeholder="https://www.youtube.com/watch?v=... หรือ https://www.tiktok.com/..."
              maxLength={500}
            />
          </Form.Item>
        </>
      )}
    </div>
  );
};

export default SpecificInfoStep;