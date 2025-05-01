// src/components/ManageProject/steps/SpecificInfoStep.jsx
import React from "react";
import { Form, Input, InputNumber, DatePicker } from "antd";
import { PROJECT_TYPE } from "../../../constants/projectTypes";

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
        กรุณาเลือกประเภทโปรเจคก่อน
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {projectType === PROJECT_TYPE.ACADEMIC && (
        <>
          <Form.Item
            name="published_year"
            label="ปีที่ตีพิมพ์"
            rules={[{ required: true, message: "กรุณากรอกปีที่ตีพิมพ์" }]}
          >
            <InputNumber
              min={2520}
              max={2600}
              placeholder="เช่น 2566"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="publication_date"
            label="วันที่ตีพิมพ์"
            rules={[
              { required: true, message: "กรุณาเลือกวันที่ตีพิมพ์" },
            ]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
        </>
      )}

      {projectType === PROJECT_TYPE.COMPETITION && (
        <>
          <Form.Item
            name="competition_name"
            label="ชื่อการแข่งขัน"
            rules={[
              { required: true, message: "กรุณากรอกชื่อการแข่งขัน" },
            ]}
          >
            <Input placeholder="ระบุชื่อการแข่งขัน" />
          </Form.Item>

          <Form.Item
            name="competition_year"
            label="ปีที่แข่งขัน"
            rules={[{ required: true, message: "กรุณากรอกปีที่แข่งขัน" }]}
          >
            <InputNumber
              min={2520}
              max={2600}
              placeholder="เช่น 2566"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </>
      )}

      {projectType === PROJECT_TYPE.COURSEWORK && (
        <>
          <Form.Item
            name="clip_video"
            label="ลิงก์วิดีโอ (ถ้ามี)"
            rules={[
              {
                pattern:
                  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|facebook\.com|fb\.watch|tiktok\.com)\/.+/,
                message:
                  "กรุณากรอกลิงก์วิดีโอจาก YouTube, Facebook หรือ TikTok ที่ถูกต้อง",
                validateTrigger: "onBlur",
              },
            ]}
          >
            <Input placeholder="URL จาก YouTube, Facebook หรือ TikTok" />
          </Form.Item>
        </>
      )}
    </div>
  );
};

export default SpecificInfoStep;