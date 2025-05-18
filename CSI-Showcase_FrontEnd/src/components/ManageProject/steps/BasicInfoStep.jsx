// สร้างไฟล์ใหม่ที่ src/components/ManageProject/steps/BasicInfoStep.jsx
import React from "react";
import { Form, Input, Select, InputNumber } from "antd";
import { PROJECT_TYPES } from "../../../constants/projectTypes";

const { TextArea } = Input;

/**
 * BasicInfoStep - ขั้นตอนการกรอกข้อมูลทั่วไปของโปรเจค
 * @param {Object} props - Component properties
 * @param {Object} props.form - Form instance จาก Form.useForm()
 * @param {Function} props.onProjectTypeChange - Function สำหรับการเปลี่ยนแปลงประเภทโปรเจค
 * @param {boolean} props.isMobile - บอกว่าเป็นหน้าจอขนาดเล็กหรือไม่
 * @param {boolean} props.isTablet - บอกว่าเป็นหน้าจอขนาดกลางหรือไม่
 * @returns {JSX.Element} - BasicInfoStep component
 */
const BasicInfoStep = ({ form, onProjectTypeChange, isMobile, isTablet }) => {
  return (
    <div className="space-y-4 sm:space-y-6">
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
          size={isMobile ? 'small' : 'middle'}
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
          autoSize={{ minRows: isMobile ? 3 : 4, maxRows: isMobile ? 6 : 8 }}
          maxLength={2000}
          showCount
          size={isMobile ? 'small' : 'middle'}
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
          size={isMobile ? 'small' : 'middle'}
        />
      </Form.Item>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
            size={isMobile ? 'small' : 'middle'}
          />
        </Form.Item>

        <Form.Item
          name="year"
          label="ปีการศึกษา"
          rules={[{ required: true, message: "กรุณากรอกปีการศึกษา" }]}
        >
          <InputNumber
            min={2520}
            max={2600}
            placeholder="เช่น 2566"
            style={{ width: "100%" }}
            size={isMobile ? 'small' : 'middle'}
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
          size={isMobile ? 'small' : 'middle'}
        />
      </Form.Item>

      <Form.Item name="visibility" label="การแสดงผล" initialValue={1}>
        <Select
          placeholder="เลือกการแสดงผล"
          options={[
            { value: 1, label: "สาธารณะ" },
            { value: 0, label: "ส่วนตัว" },
          ]}
          size={isMobile ? 'small' : 'middle'}
        />
      </Form.Item>
    </div>
  );
};

export default BasicInfoStep;