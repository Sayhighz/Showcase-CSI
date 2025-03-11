import React from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined, PictureOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

const PDFUploadSection = ({ projectData, setProjectData }) => {
  const handleFileChange = (info) => {
    if (info.file.status === "removed") {
      handleRemoveFile(info.file);
      return;
    }

    const file = info.file.originFileObj || info.file;
    if (file) {
      const newPdf = {
        file: file, // Keep original file reference
        name: file.name,
      };

      // Append new PDF to projectData.pdfFiles
      setProjectData((prev) => ({
        ...prev,
        pdfFiles: [...(prev.pdfFiles || []), newPdf], // Append properly
      }));

      message.success(`${file.name} อัปโหลดสำเร็จ`);
    } else {
      message.error("เกิดข้อผิดพลาดในการอัปโหลดไฟล์");
    }
  };

  const handleRemoveFile = (file) => {
    setProjectData((prev) => ({
      ...prev,
      pdfFiles: prev.pdfFiles?.filter((pdf) => pdf.name !== file.name) || [],
    }));
    message.success("ลบไฟล์สำเร็จ");
  };

  const handleCoverChange = (info) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      setProjectData((prev) => ({
        ...prev,
        coverImage: file, // Store cover image file
      }));
      message.success("อัปโหลดภาพหน้าปกสำเร็จ");
    } else {
      message.error("เกิดข้อผิดพลาดในการอัปโหลดภาพหน้าปก");
    }
  };

  return (
    <div className="space-y-4 flex flex-col">
      <div className="w-full max-w-md">
        <h3 className="text-lg font-semibold">อัปโหลดภาพหน้าปก</h3>
        <Upload
          accept="image/*"
          beforeUpload={() => false} // Prevent automatic upload
          onChange={handleCoverChange}
          showUploadList={false} // Hide upload list
          maxCount={1} // Allow only one image upload
        >
          <div className="border p-4 rounded-md cursor-pointer text-center bg-gray-100 h-40 flex flex-col items-center justify-center">
            <PictureOutlined className="text-[#90278E] text-4xl" />
            <p className="text-sm">คลิกเพื่อเลือกภาพหน้าปก</p>
          </div>
        </Upload>
      </div>
      
      <div className="w-full max-w-md">
        <h3 className="text-lg font-semibold">อัปโหลดไฟล์ PDF</h3>
        <Dragger
          accept=".pdf"
          beforeUpload={() => false} // Prevent automatic upload
          onChange={handleFileChange}
          onRemove={handleRemoveFile} // Properly remove files
          showUploadList={{ showRemoveIcon: true }}
          multiple // ✅ Allow multiple PDF uploads
          className="h-40 flex items-center justify-center"
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined className="text-[#90278E] text-5xl" />
          </p>
          <p className="ant-upload-text">ลากและวางไฟล์ที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
          <p className="ant-upload-hint">รองรับเฉพาะไฟล์ PDF</p>
        </Dragger>
      </div>

    </div>
  );
};

export default PDFUploadSection;