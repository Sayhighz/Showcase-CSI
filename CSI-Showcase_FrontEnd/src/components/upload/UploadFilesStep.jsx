import React, { useState } from "react";
import {
  Upload,
  Button,
  Typography,
  Row,
  Col,
  Card,
  Space,
  Divider,
  Alert,
  Progress,
  message,
} from "antd";
import {
  UploadOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  FilePdfOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  PROJECT_TYPE,
  PROJECT_TYPE_DISPLAY,
} from "../../constants/projectTypes";
import { formatFileSize } from "../../utils/fileUtils";

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

/**
 * Component for uploading project files
 *
 * @param {Object} props - Component props
 * @param {string} props.projectType - Selected project type
 * @param {Object} props.files - Files object
 * @param {Function} props.setFiles - Function to update files
 * @returns {React.ReactElement} - File upload component
 */
const UploadFilesStep = ({ projectType, files, setFiles }) => {
  // File upload states
  const [fileList, setFileList] = useState({
    coverImage: [],
    courseworkPoster: [],
    courseworkVideo: [],
    paperFile: [],
    competitionPoster: [],
  });

  // File size limits
  const FILE_SIZE_LIMITS = {
    image: 5 * 1024 * 1024, // 5MB
    video: 50 * 1024 * 1024, // 50MB
    document: 10 * 1024 * 1024, // 10MB
  };

  // Allowed file types
  const ALLOWED_FILE_TYPES = {
    image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    video: ["video/mp4", "video/webm", "video/quicktime"],
    document: ["application/pdf"],
  };

  // File validators
  const validateFile = (file, fileType) => {
    // Validate file type
    if (!ALLOWED_FILE_TYPES[fileType].includes(file.type)) {
      const allowedExtensions = ALLOWED_FILE_TYPES[fileType]
        .map((type) => type.split("/")[1].toUpperCase())
        .join(", ");

      message.error(
        `ไฟล์ "${file.name}" ไม่ถูกต้อง กรุณาอัปโหลดไฟล์ประเภท ${allowedExtensions}`
      );
      return Upload.LIST_IGNORE;
    }

    // Validate file size
    if (file.size > FILE_SIZE_LIMITS[fileType]) {
      message.error(
        `ไฟล์ "${file.name}" มีขนาดใหญ่เกินไป ขนาดสูงสุดคือ ${formatFileSize(
          FILE_SIZE_LIMITS[fileType]
        )}`
      );
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  // Handle file upload
  const handleFileChange = (field, fileType, info) => {
    // Update file list
    setFileList({
      ...fileList,
      [field]: info.fileList,
    });

    // Update files object with latest file
    // เปลี่ยนเป็น
    if (info.fileList.length > 0) {
      setFiles({
        ...files,
        [field]: info.fileList[info.fileList.length - 1].originFileObj,
      });
    } else {
      // Remove file from files object if no files are selected
      const newFiles = { ...files };
      delete newFiles[field];
      setFiles(newFiles);
    }
  };

  // Create custom upload props
  const createUploadProps = (field, fileType, required = false) => ({
    accept: ALLOWED_FILE_TYPES[fileType].join(","),
    beforeUpload: (file) => {
      const valid = validateFile(file, fileType);
      if (valid === true) {
        return false; // Prevent auto upload, we're handling files manually
      }
      return valid; // Return LIST_IGNORE if invalid
    },
    fileList: fileList[field],
    onChange: (info) => handleFileChange(field, fileType, info),
    maxCount: 1,
    multiple: false,
    listType: "picture",
    className: `${
      required && fileList[field].length === 0 ? "border-red-500" : ""
    } 
               ${fileList[field].length > 0 ? "border-green-500" : ""}`,
  });

  // Get required files based on project type
  const getRequiredFiles = () => {
    switch (projectType) {
      case PROJECT_TYPE.COURSEWORK:
        return ["coverImage"];
      case PROJECT_TYPE.ACADEMIC:
        return ["coverImage"];
      case PROJECT_TYPE.COMPETITION:
        return ["coverImage"];
      default:
        return ["coverImage"];
    }
  };

  const requiredFiles = getRequiredFiles();

  // Check if required files are uploaded
  const isRequiredFilesMissing = () => {
    return requiredFiles.some((field) => !files[field]);
  };

  // Check if file is required
  const isRequired = (field) => {
    return requiredFiles.includes(field);
  };

  return (
    <div className="upload-files-step">
      <div className="mb-6">
        <Title level={3}>อัปโหลดไฟล์โครงงาน</Title>
        <Paragraph className="text-gray-600">
          กรุณาอัปโหลดไฟล์ที่เกี่ยวข้องกับโครงงานประเภท{" "}
          <Text strong>{PROJECT_TYPE_DISPLAY[projectType] || "ที่เลือก"}</Text>
        </Paragraph>
      </div>

      <Divider />

      {isRequiredFilesMissing() && (
        <Alert
          message="กรุณาอัปโหลดไฟล์ที่จำเป็น"
          description="ไฟล์ที่มีเครื่องหมาย * เป็นไฟล์ที่จำเป็นต้องอัปโหลด"
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          className="mb-6"
        />
      )}

      <Row gutter={[16, 16]}>
        {/* Cover Image - Required for all project types */}
        <Col xs={24} md={12}>
          <Card
            title={
              <span>
                รูปภาพหน้าปก
                {isRequired("coverImage") && <Text type="danger"> *</Text>}
              </span>
            }
            size="small"
            className="shadow-sm h-full"
          >
            <Dragger
              {...createUploadProps(
                "coverImage",
                "image",
                isRequired("coverImage")
              )}
            >
              <p className="ant-upload-drag-icon">
                <FileImageOutlined style={{ color: "#1890ff" }} />
              </p>
              <p className="ant-upload-text">คลิกหรือลากไฟล์มาวางที่นี่</p>
              <p className="ant-upload-hint">
                รูปภาพหน้าปกสำหรับแสดงในหน้ารายละเอียดโครงงาน
              </p>
              <p className="ant-upload-hint text-xs mt-2">
                รองรับ JPEG, PNG, GIF ขนาดไม่เกิน 5MB
              </p>
            </Dragger>
          </Card>
        </Col>

        {/* Project type specific files */}
        {projectType === PROJECT_TYPE.COURSEWORK && (
          <>
            <Col xs={24} md={12}>
              <Card
                title="โปสเตอร์โครงงาน"
                size="small"
                className="shadow-sm h-full"
              >
                <Dragger {...createUploadProps("courseworkPoster", "image")}>
                  <p className="ant-upload-drag-icon">
                    <FileImageOutlined style={{ color: "#52c41a" }} />
                  </p>
                  <p className="ant-upload-text">คลิกหรือลากไฟล์มาวางที่นี่</p>
                  <p className="ant-upload-hint">โปสเตอร์สำหรับนำเสนอโครงงาน</p>
                  <p className="ant-upload-hint text-xs mt-2">
                    รองรับ JPEG, PNG, GIF ขนาดไม่เกิน 5MB
                  </p>
                </Dragger>
              </Card>
            </Col>

            <Col xs={24}>
              <Card
                title="วิดีโอนำเสนอผลงาน"
                size="small"
                className="shadow-sm"
              >
                <Dragger {...createUploadProps("courseworkVideo", "video")}>
                  <p className="ant-upload-drag-icon">
                    <VideoCameraOutlined style={{ color: "#fa8c16" }} />
                  </p>
                  <p className="ant-upload-text">คลิกหรือลากไฟล์มาวางที่นี่</p>
                  <p className="ant-upload-hint">
                    วิดีโอนำเสนอผลงานหรือการทำงานของโครงงาน
                  </p>
                  <p className="ant-upload-hint text-xs mt-2">
                    รองรับ MP4, WEBM, MOV ขนาดไม่เกิน 50MB
                  </p>
                </Dragger>
              </Card>
            </Col>
          </>
        )}

        {projectType === PROJECT_TYPE.ACADEMIC && (
          <Col xs={24} md={12}>
            <Card
              title="ไฟล์บทความ (PDF)"
              size="small"
              className="shadow-sm h-full"
            >
              <Dragger {...createUploadProps("paperFile", "document")}>
                <p className="ant-upload-drag-icon">
                  <FilePdfOutlined style={{ color: "#f5222d" }} />
                </p>
                <p className="ant-upload-text">คลิกหรือลากไฟล์มาวางที่นี่</p>
                <p className="ant-upload-hint">ไฟล์บทความวิชาการฉบับเต็ม</p>
                <p className="ant-upload-hint text-xs mt-2">
                  รองรับ PDF ขนาดไม่เกิน 10MB
                </p>
              </Dragger>
            </Card>
          </Col>
        )}

        {projectType === PROJECT_TYPE.COMPETITION && (
          <Col xs={24} md={12}>
            <Card
              title="โปสเตอร์การแข่งขัน"
              size="small"
              className="shadow-sm h-full"
            >
              <Dragger {...createUploadProps("competitionPoster", "image")}>
                <p className="ant-upload-drag-icon">
                  <FileImageOutlined style={{ color: "#faad14" }} />
                </p>
                <p className="ant-upload-text">คลิกหรือลากไฟล์มาวางที่นี่</p>
                <p className="ant-upload-hint">โปสเตอร์สำหรับการแข่งขัน</p>
                <p className="ant-upload-hint text-xs mt-2">
                  รองรับ JPEG, PNG, GIF ขนาดไม่เกิน 5MB
                </p>
              </Dragger>
            </Card>
          </Col>
        )}
      </Row>

      <Divider className="my-6" />

      <div className="mt-4">
        <Paragraph className="text-gray-600">
          <Text strong>หมายเหตุ:</Text>
          <ul className="list-disc ml-5 mt-2">
            <li>
              ไฟล์ที่มีเครื่องหมาย <Text type="danger">*</Text>{" "}
              เป็นไฟล์ที่จำเป็นต้องอัปโหลด
            </li>
            <li>
              ขนาดไฟล์สูงสุดที่อนุญาต: รูปภาพ 5MB, วิดีโอ 50MB, เอกสาร 10MB
            </li>
            <li>รูปภาพรองรับไฟล์ประเภท JPEG, PNG, GIF และ WEBP</li>
            <li>ไฟล์บทความรองรับเฉพาะไฟล์ PDF</li>
            <li>วิดีโอรองรับไฟล์ประเภท MP4, WEBM และ MOV</li>
          </ul>
        </Paragraph>
      </div>
    </div>
  );
};

export default UploadFilesStep;
