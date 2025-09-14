import React, { useState } from "react";
import { Upload, message, Form, Typography, Image, Button } from "antd";
import {
  PictureOutlined,
  PlusOutlined,
  FilePdfOutlined
} from "@ant-design/icons";

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
  pdf: ['application/pdf'],
};

// Helper functions
const isFileSizeValid = (file, maxSize) => file.size <= maxSize;

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
  // picture-card style preview handlers (ตามตัวอย่าง)
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      try {
        file.preview = await getBase64(file.originFileObj);
      } catch {
        // ignore preview error
      }
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  // ตรวจสอบไฟล์ก่อนอัปโหลด
  const beforeUpload = (file, fileType) => {
    // ตรวจสอบประเภทไฟล์
    let isValidType = false;
    let allowedTypes = [];

    if (fileType === "paperFile") {
      allowedTypes = ALLOWED_FILE_TYPES.pdf;
      isValidType = allowedTypes.includes(file.type);
    } else if (
      fileType === "courseworkPoster" ||
      fileType === "courseworkImage" ||
      fileType === "competitionPoster" ||
      fileType === "competitionImage"
    ) {
      allowedTypes = ALLOWED_FILE_TYPES.image;
      isValidType = allowedTypes.includes(file.type);
    }

    if (!isValidType) {
      message.error(
        `ไฟล์ "${file.name}" ไม่ถูกต้อง. กรุณาอัปโหลดไฟล์ประเภท: ${allowedTypes.join(", ")}`
      );
      return Upload.LIST_IGNORE;
    }

    // ตรวจสอบขนาดไฟล์
    let maxSize = 0;
    if (fileType === "paperFile") {
      maxSize = 10 * 1024 * 1024; // 10MB
    } else {
      maxSize = 5 * 1024 * 1024; // 5MB สำหรับรูปภาพ
    }

    if (!isFileSizeValid(file, maxSize)) {
      message.error(
        `ไฟล์ "${file.name}" มีขนาดใหญ่เกินไป. ขนาดสูงสุดคือ ${formatFileSize(maxSize)}`
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
    <>
      <div className="space-y-8">
        {projectType === PROJECT_TYPE.ACADEMIC && (
          <div>
            <h3 className="text-lg font-medium mb-2">อัปโหลดบทความวิชาการ</h3>
            <Form.Item label="ไฟล์บทความ (PDF)" required={true}>
              <Upload
                name="paperFile"
                listType="text"
                fileList={fileList.paperFile}
                onChange={(info) => onFileChange(info, "paperFile")}
                beforeUpload={(file) => beforeUpload(file, "paperFile")}
                accept=".pdf,application/pdf"
                maxCount={1}
                multiple={false}
              >
                <Button type="primary" icon={<FilePdfOutlined />} className="mb-2">
                  เลือกไฟล์ PDF
                </Button>
                <div className="text-xs text-gray-500 mt-1">
                  รองรับเฉพาะไฟล์ .pdf ขนาดไม่เกิน 10MB
                </div>
              </Upload>
            </Form.Item>
          </div>
        )}

        {projectType === PROJECT_TYPE.COURSEWORK && (
          <div>
            <h3 className="text-lg font-medium mb-2">อัปโหลดโปสเตอร์งานในชั้นเรียน</h3>
            <Form.Item label="รูปโปสเตอร์" required={true}>
              <Upload
                name="courseworkPoster"
                listType="picture-card"
                fileList={fileList.courseworkPoster}
                onChange={(info) => onFileChange(info, "courseworkPoster")}
                beforeUpload={(file) => beforeUpload(file, "courseworkPoster")}
                onPreview={handlePreview}
                accept=".jpg,.jpeg,.png,.gif,.webp"
                maxCount={1}
                multiple={false}
              >
                {(!fileList.courseworkPoster || fileList.courseworkPoster.length < 1) ? uploadButton : null}
              </Upload>
            </Form.Item>

            <Form.Item label="รูปเพิ่มเติม (สูงสุด 10 รูป)">
              <Upload
                name="courseworkImage"
                listType="picture-card"
                fileList={fileList.courseworkImage}
                onChange={(info) => onFileChange(info, "courseworkImage")}
                beforeUpload={(file) => beforeUpload(file, "courseworkImage")}
                onPreview={handlePreview}
                accept=".jpg,.jpeg,.png,.gif,.webp"
                maxCount={10}
                multiple
              >
                {fileList.courseworkImage && fileList.courseworkImage.length >= 10 ? null : uploadButton}
              </Upload>
            </Form.Item>

            <Text type="secondary">
              วิดีโอให้กรอกเป็นลิงก์ในขั้นตอน "ข้อมูลเฉพาะ" ของผลงานในชั้นเรียน
            </Text>
          </div>
        )}

        {projectType === PROJECT_TYPE.COMPETITION && (
          <div>
            <h3 className="text-lg font-medium mb-2">อัปโหลดโปสเตอร์การแข่งขัน</h3>
            <Form.Item label="รูปโปสเตอร์" required={true}>
              <Upload
                name="competitionPoster"
                listType="picture-card"
                fileList={fileList.competitionPoster}
                onChange={(info) => onFileChange(info, "competitionPoster")}
                beforeUpload={(file) => beforeUpload(file, "competitionPoster")}
                onPreview={handlePreview}
                accept=".jpg,.jpeg,.png,.gif,.webp"
                maxCount={1}
                multiple={false}
              >
                {(!fileList.competitionPoster || fileList.competitionPoster.length < 1) ? uploadButton : null}
              </Upload>
            </Form.Item>

            <Form.Item label="รูปเพิ่มเติม (สูงสุด 10 รูป)">
              <Upload
                name="competitionImage"
                listType="picture-card"
                fileList={fileList.competitionImage}
                onChange={(info) => onFileChange(info, "competitionImage")}
                beforeUpload={(file) => beforeUpload(file, "competitionImage")}
                onPreview={handlePreview}
                accept=".jpg,.jpeg,.png,.gif,.webp"
                maxCount={10}
                multiple
              >
                {fileList.competitionImage && fileList.competitionImage.length >= 10 ? null : uploadButton}
              </Upload>
            </Form.Item>
          </div>
        )}

        {/* ไม่มีไฟล์เพิ่มเติม: ตามสเปกใหม่ สำหรับ coursework/competition ให้มีเฉพาะโปสเตอร์ + ลิงก์วิดีโอ + รูปเพิ่มเติม */}
      </div>

      {previewImage && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(''),
          }}
          src={previewImage}
        />
      )}
    </>
  );
};

export default MediaUploadStep;