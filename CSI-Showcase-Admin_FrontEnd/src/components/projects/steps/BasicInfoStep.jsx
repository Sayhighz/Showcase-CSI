import React from "react";
import { Form, Input, Select, InputNumber } from "antd";

const { TextArea } = Input;

// Project types
const PROJECT_TYPES = [
  { value: 'coursework', label: 'งานในชั้นเรียน' },
  { value: 'academic', label: 'บทความวิชาการ' },
  { value: 'competition', label: 'การแข่งขัน' }
];

/**
 * BasicInfoStep - ขั้นตอนการกรอกข้อมูลทั่วไปของโปรเจค
 * @param {Object} props - Component properties
 * @param {Object} props.form - Form instance จาก Form.useForm()
 * @param {Function} props.onProjectTypeChange - Function สำหรับการเปลี่ยนแปลงประเภทโปรเจค
 * @returns {JSX.Element} - BasicInfoStep component
 */
const BasicInfoStep = ({ form, onProjectTypeChange }) => {
  // Year options (Thai Buddhist Era)
  const thaiYear = new Date().getFullYear() + 543;
  const years = Array.from({ length: 31 }, (_, i) => thaiYear - i);

  return (
    <div className="space-y-6">
      <Form.Item
        name="title"
        label="ชื่อโปรเจค"
        rules={[
          { required: true, message: "กรุณากรอกชื่อโปรเจค" },
          {
            min: 5,
            message: "ชื่อโปรเจคต้องมีความยาวอย่างน้อย 5 ตัวอักษร",
          },
        ]}
      >
        <Input 
          placeholder="ระบุชื่อโปรเจค" 
          maxLength={100}
        />
      </Form.Item>

      <Form.Item
        name="description"
        label="คำอธิบาย"
        rules={[
          { required: true, message: "กรุณากรอกคำอธิบายโปรเจค" },
          {
            min: 20,
            message: "คำอธิบายต้องมีความยาวอย่างน้อย 20 ตัวอักษร",
          },
        ]}
      >
        <TextArea
          placeholder="อธิบายรายละเอียดของโปรเจค"
          autoSize={{ minRows: 4, maxRows: 8 }}
          maxLength={2000}
          showCount
        />
      </Form.Item>

      <Form.Item
        name="type"
        label="ประเภทโปรเจค"
        rules={[{ required: true, message: "กรุณาเลือกประเภทโปรเจค" }]}
      >
        <Select
          placeholder="เลือกประเภทโปรเจค"
          onChange={onProjectTypeChange}
          options={PROJECT_TYPES.map((type) => ({
            value: type.value,
            label: type.label,
          }))}
        />
      </Form.Item>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Form.Item
          name="study_year"
          label="ชั้นปี"
          rules={[{ required: true, message: "กรุณาเลือกชั้นปี" }]}
        >
          <Select
            placeholder="เลือกชั้นปี"
            options={[
              { value: 1, label: "ปี 1" },
              { value: 2, label: "ปี 2" },
              { value: 3, label: "ปี 3" },
              { value: 4, label: "ปี 4" },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="year"
          label="ปีการศึกษา"
          rules={[{ required: true, message: "กรุณาเลือกปีการศึกษา" }]}
        >
          <Select
            showSearch
            placeholder="เลือกปีการศึกษา"
            options={years.map(y => ({ value: y, label: String(y) }))}
            style={{ width: "100%" }}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
      </div>

      <Form.Item
        name="semester"
        label="ภาคเรียน"
        rules={[{ required: true, message: "กรุณาเลือกภาคเรียน" }]}
      >
        <Select
          placeholder="เลือกภาคเรียน"
          options={[
            { value: "1", label: "ภาคเรียนที่ 1" },
            { value: "2", label: "ภาคเรียนที่ 2" },
            { value: "3", label: "ภาคฤดูร้อน" },
          ]}
        />
      </Form.Item>

      <Form.Item name="visibility" label="การแสดงผล" initialValue={1}>
        <Select
          placeholder="เลือกการแสดงผล"
          options={[
            { value: 1, label: "สาธารณะ" },
            { value: 0, label: "ส่วนตัว" },
          ]}
        />
      </Form.Item>
    </div>
  );
};

export default BasicInfoStep;