// src/components/common/FileUpload.jsx
import React, { useState } from 'react';
import { 
  Upload, 
  Button, 
  message, 
  Progress, 
  Space, 
  Tooltip, 
  Modal,
  Image
} from 'antd';
import { 
  UploadOutlined, 
  FileOutlined, 
  FilePdfOutlined, 
  FileImageOutlined, 
  FileTextOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { 
  isAllowedFileType, 
  isAllowedFileSize, 
  formatFileSize,
  getFileExtension
} from '../../utils/fileUtils';
import { ERROR_MESSAGES } from '../../constants/errorMessages';

/**
 * Component สำหรับอัปโหลดไฟล์
 * 
 * @param {Object} props
 * @param {Function} props.onUpload - ฟังก์ชันที่เรียกเมื่ออัปโหลดสำเร็จ
 * @param {Function} props.onRemove - ฟังก์ชันที่เรียกเมื่อลบไฟล์
 * @param {Function} props.customRequest - ฟังก์ชันสำหรับการอัปโหลดแบบกำหนดเอง
 * @param {Array} props.fileList - รายการไฟล์ที่อัปโหลดแล้ว
 * @param {Array} props.allowedTypes - ประเภทไฟล์ที่อนุญาต
 * @param {number} props.maxSize - ขนาดไฟล์สูงสุดที่อนุญาต (bytes)
 * @param {boolean} props.multiple - อนุญาตให้อัปโหลดหลายไฟล์หรือไม่
 * @param {boolean} props.disabled - ปิดการใช้งานหรือไม่
 * @param {boolean} props.showUploadList - แสดงรายการไฟล์ที่อัปโหลดหรือไม่
 * @param {number} props.maxCount - จำนวนไฟล์สูงสุดที่อนุญาต
 * @param {string} props.buttonText - ข้อความบนปุ่ม
 * @param {string} props.listType - รูปแบบการแสดงรายการไฟล์ ('text', 'picture', 'picture-card')
 */
const FileUpload = ({
  onUpload,
  onRemove,
  customRequest,
  fileList = [],
  allowedTypes,
  maxSize = 5 * 1024 * 1024, // 5MB
  multiple = false,
  disabled = false,
  showUploadList = true,
  maxCount,
  buttonText = 'อัปโหลดไฟล์',
  listType = 'text'
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  // ตรวจสอบไฟล์ก่อนอัปโหลด
  const beforeUpload = (file) => {
    // ตรวจสอบประเภทไฟล์
    if (allowedTypes && !isAllowedFileType(file, allowedTypes)) {
      message.error(ERROR_MESSAGES.FILE_ERRORS.INVALID_FILE_TYPE);
      return Upload.LIST_IGNORE;
    }

    // ตรวจสอบขนาดไฟล์
    if (!isAllowedFileSize(file, maxSize)) {
      message.error(`${ERROR_MESSAGES.FILE_ERRORS.FILE_TOO_LARGE} (สูงสุด: ${formatFileSize(maxSize)})`);
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  // สร้างฟังก์ชันสำหรับการอัปโหลดแบบกำหนดเอง
  const handleCustomRequest = async ({ file, onSuccess, onError, onProgress }) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // ถ้ามีฟังก์ชัน customRequest ให้ใช้ฟังก์ชันนั้น
      if (customRequest) {
        await customRequest(file, (percent) => {
          setUploadProgress(percent);
          onProgress({ percent });
        });
        onSuccess('ok');
      } else {
        // จำลองการอัปโหลด (กรณีไม่มี customRequest)
        let percent = 0;
        const interval = setInterval(() => {
          percent += 10;
          setUploadProgress(percent);
          onProgress({ percent });
          
          if (percent >= 100) {
            clearInterval(interval);
            onSuccess('ok');
          }
        }, 200);
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error(ERROR_MESSAGES.FILE_ERRORS.UPLOAD_FAILED);
      onError();
    } finally {
      setIsUploading(false);
    }
  };

  // จัดการเมื่อมีการเปลี่ยนแปลงรายการไฟล์
  const handleChange = ({ file, fileList: newFileList }) => {
    // เมื่ออัปโหลดสำเร็จ
    if (file.status === 'done' && onUpload) {
      onUpload(newFileList);
    }
  };

  // จัดการการลบไฟล์
  const handleRemove = (file) => {
    if (onRemove) {
      onRemove(file);
    }
    return true;
  };

  // แสดงไอคอนตามประเภทไฟล์
  const getFileIcon = (file) => {
    if (!file) return <FileOutlined />;
    
    const ext = getFileExtension(file.name).toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return <FileImageOutlined />;
    } else if (ext === 'pdf') {
      return <FilePdfOutlined />;
    } else if (['doc', 'docx', 'txt', 'xlsx', 'pptx'].includes(ext)) {
      return <FileTextOutlined />;
    }
    
    return <FileOutlined />;
  };

  // แสดงตัวอย่างรูปภาพ
  const handlePreview = (file) => {
    // เฉพาะไฟล์รูปภาพเท่านั้น
    if (file.url && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(getFileExtension(file.name).toLowerCase())) {
      setPreviewImage(file.url);
      setPreviewVisible(true);
    }
  };

  return (
    <div>
      <Upload
        beforeUpload={beforeUpload}
        customRequest={handleCustomRequest}
        onChange={handleChange}
        onRemove={handleRemove}
        onPreview={handlePreview}
        fileList={fileList}
        multiple={multiple}
        disabled={disabled}
        showUploadList={
          showUploadList && {
            showDownloadIcon: true,
            showPreviewIcon: true,
            showRemoveIcon: true,
            removeIcon: <DeleteOutlined />,
            previewIcon: <Tooltip title="แสดงตัวอย่าง"><EyeOutlined /></Tooltip>
          }
        }
        maxCount={maxCount}
        listType={listType}
      >
        <Button
          icon={<UploadOutlined />}
          loading={isUploading}
          disabled={disabled || (maxCount && fileList.length >= maxCount)}
        >
          {buttonText}
        </Button>
      </Upload>
      
      {isUploading && (
        <div className="mt-2">
          <Progress percent={uploadProgress} status="active" />
        </div>
      )}

      {/* Modal แสดงตัวอย่างรูปภาพ */}
      <Modal
        open={previewVisible}
        title="ตัวอย่างรูปภาพ"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <Image
          style={{ width: '100%' }}
          src={previewImage}
          preview={false}
        />
      </Modal>
    </div>
  );
};

export default FileUpload;