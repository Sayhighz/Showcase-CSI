import React from "react";
import { Upload, message, Form, Typography } from "antd";
import {
  FileTextOutlined,
  PictureOutlined
} from "@ant-design/icons";

const { Dragger } = Upload;
const { Text } = Typography;

const PROJECT_TYPE = {
  COURSEWORK: 'coursework',
  ACADEMIC: 'academic',
  COMPETITION: 'competition'
};

// File type configurations
const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  pdf: ['application/pdf']
};

// Helper functions
const isFileSizeValid = (file, maxSize) => {
  return file.size <= maxSize;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * MediaUploadStep - ขั้นตอนการอัปโหลดไฟล์ที่เกี่ยวข้องกับโปรเจค
 * @param {Object} props - Component properties
 * @param {string} props.projectType - ประเภทของโปรเจค
 * @param {Object} props.fileList - รายการไฟล์ที่อัปโหลด
 * @param {Function} props.onFileChange - ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงของไฟล์
 * @returns {JSX.Element} - MediaUploadStep component
 */
const MediaUploadStep = ({ projectType, fileList, onFileChange }) => {
  // ตรวจสอบไฟล์ก่อนอัปโหลด
  const beforeUpload = (file, fileType) => {
    // ตรวจสอบประเภทไฟล์
    let isValidType = false;
    let allowedTypes = [];

    if (fileType === "paperFile") {
      allowedTypes = ["application/pdf"];
      isValidType = file.type === "application/pdf";
    } else if (
      fileType === "courseworkPoster" ||
      fileType === "courseworkImage" ||
      fileType === "competitionPoster"
    ) {
      allowedTypes = ALLOWED_FILE_TYPES.image;
      isValidType = allowedTypes.includes(file.type);
    } else if (fileType === "courseworkVideo") {
      allowedTypes = ALLOWED_FILE_TYPES.video;
      isValidType = allowedTypes.includes(file.type);
    }

    if (!isValidType) {
      message.error(
        `ไฟล์ "${
          file.name
        }" ไม่ถูกต้อง. กรุณาอัปโหลดไฟล์ประเภท: ${allowedTypes.join(", ")}`
      );
      return Upload.LIST_IGNORE;
    }

    // ตรวจสอบขนาดไฟล์
    let maxSize = 0;
    if (fileType === "paperFile") {
      maxSize = 10 * 1024 * 1024; // 10MB
    } else if (fileType === "courseworkVideo") {
      maxSize = 50 * 1024 * 1024; // 50MB
    } else {
      maxSize = 5 * 1024 * 1024; // 5MB สำหรับรูปภาพ
    }

    if (!isFileSizeValid(file, maxSize)) {
      message.error(
        `ไฟล์ "${file.name}" มีขนาดใหญ่เกินไป. ขนาดสูงสุดคือ ${formatFileSize(
          maxSize
        )}`
      );
      return Upload.LIST_IGNORE;
    }

    // ป้องกันไม่ให้มีการอัปโหลดไปยังเซิร์ฟเวอร์โดยตรง
    return false;
  };

  if (!projectType) {
    return (
      <div className="py-4 text-center text-gray-500">
        กรุณาเลือกประเภทโปรเจคก่อน
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {projectType === PROJECT_TYPE.ACADEMIC && (
        <div>
          <h3 className="text-lg font-medium mb-2">
            อัปโหลดบทความวิชาการ
          </h3>
          <Form.Item label="ไฟล์บทความ (PDF)" required={true}>
            <Dragger
              name="paperFile"
              fileList={fileList.paperFile}
              onChange={(info) => onFileChange(info, "paperFile")}
              beforeUpload={(file) => beforeUpload(file, "paperFile")}
              accept=".pdf"
              maxCount={1}
              multiple={false}
              height={160}
            >
              <p className="ant-upload-drag-icon">
                <FileTextOutlined style={{ fontSize: 36 }} />
              </p>
              <p className="ant-upload-text">
                คลิกหรือลากไฟล์มาที่นี่เพื่ออัปโหลด
              </p>
              <p className="ant-upload-hint">
                รองรับเฉพาะไฟล์ PDF ขนาดไม่เกิน 10MB
              </p>
            </Dragger>
          </Form.Item>
        </div>
      )}

      {projectType === PROJECT_TYPE.COURSEWORK && (
        <div>
          <h3 className="text-lg font-medium mb-2">
            อัปโหลดโปสเตอร์งานในชั้นเรียน
          </h3>
          <Form.Item label="รูปโปสเตอร์" required={true}>
            <Dragger
              name="courseworkPoster"
              fileList={fileList.courseworkPoster}
              onChange={(info) => onFileChange(info, "courseworkPoster")}
              beforeUpload={(file) => beforeUpload(file, "courseworkPoster")}
              accept=".jpg,.jpeg,.png,.gif,.webp"
              maxCount={1}
              multiple={false}
              height={160}
            >
              <p className="ant-upload-drag-icon">
                <PictureOutlined style={{ fontSize: 36 }} />
              </p>
              <p className="ant-upload-text">
                คลิกหรือลากรูปภาพมาที่นี่เพื่ออัปโหลด
              </p>
              <p className="ant-upload-hint">
                รองรับไฟล์รูปภาพ JPG, PNG, GIF, WebP ขนาดไม่เกิน 5MB
              </p>
            </Dragger>
          </Form.Item>
          <Text type="secondary">
            วิดีโอให้กรอกเป็นลิงก์ในขั้นตอน "ข้อมูลเฉพาะ" ของผลงานในชั้นเรียน
          </Text>
        </div>
      )}

      {projectType === PROJECT_TYPE.COMPETITION && (
        <div>
          <h3 className="text-lg font-medium mb-2">
            อัปโหลดโปสเตอร์การแข่งขัน
          </h3>
          <Form.Item label="รูปโปสเตอร์" required={true}>
            <Dragger
              name="competitionPoster"
              fileList={fileList.competitionPoster}
              onChange={(info) => onFileChange(info, "competitionPoster")}
              beforeUpload={(file) => beforeUpload(file, "competitionPoster")}
              accept=".jpg,.jpeg,.png,.gif,.webp"
              maxCount={1}
              multiple={false}
              height={160}
            >
              <p className="ant-upload-drag-icon">
                <PictureOutlined style={{ fontSize: 36 }} />
              </p>
              <p className="ant-upload-text">
                คลิกหรือลากรูปภาพมาที่นี่เพื่ออัปโหลด
              </p>
              <p className="ant-upload-hint">
                รองรับไฟล์รูปภาพ JPG, PNG, GIF, WebP ขนาดไม่เกิน 5MB
              </p>
            </Dragger>
          </Form.Item>
        </div>
      )}
    </div>
  );
};

export default MediaUploadStep;