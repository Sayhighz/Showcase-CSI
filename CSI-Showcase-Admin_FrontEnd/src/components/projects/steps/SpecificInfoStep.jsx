import React from "react";
import { Form, Input, DatePicker, Select } from "antd";

const PROJECT_TYPE = {
  COURSEWORK: 'coursework',
  ACADEMIC: 'academic',
  COMPETITION: 'competition'
};

/**
 * SpecificInfoStep - ขั้นตอนการกรอกข้อมูลเฉพาะตามประเภทโปรเจค
 * @param {Object} props - Component properties
 * @param {string} props.projectType - ประเภทของโปรเจค
 * @returns {JSX.Element} - SpecificInfoStep component
 */
const SpecificInfoStep = ({ projectType }) => {
  if (!projectType) {
    return (
      <div className="py-4 text-center text-gray-500">
        กรุณาเลือกประเภทโปรเจคในขั้นตอนก่อนหน้า
      </div>
    );
  }

  // สร้างรายการปี พ.ศ. ย้อนหลัง 30 ปีจากปีปัจจุบัน
  const thaiYear = new Date().getFullYear() + 543;
  const years = Array.from({ length: 31 }, (_, i) => thaiYear - i);

  return (
    <div className="space-y-6">
      {projectType === PROJECT_TYPE.ACADEMIC && (
        <>
          <h3 className="text-lg font-medium mb-4">ข้อมูลบทความวิชาการ</h3>
          
          <Form.Item
            name="published_year"
            label="ปีที่ตีพิมพ์"
            rules={[{ required: true, message: "กรุณาเลือกปีที่ตีพิมพ์" }]}
          >
            <Select
              showSearch
              placeholder="เลือกปีที่ตีพิมพ์"
              options={years.map(y => ({ value: y, label: String(y) }))}
              style={{ width: "100%" }}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
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
            rules={[{ required: true, message: "กรุณาเลือกปีที่จัดการแข่งขัน" }]}
          >
            <Select
              showSearch
              placeholder="เลือกปีที่จัดการแข่งขัน"
              options={years.map(y => ({ value: y, label: String(y) }))}
              style={{ width: "100%" }}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
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