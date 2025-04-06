// src/services/storageService.js
import { axiosGet } from '../lib/axios';
import { UPLOAD } from '../constants/apiEndpoints';
import { formatFileSize } from '../utils/fileUtils';

/**
 * ดึงข้อมูลสถานะพื้นที่จัดเก็บ
 * @returns {Promise<Object>} - ข้อมูลสถานะพื้นที่จัดเก็บ
 */
export const getStorageStatus = async () => {
  try {
    const response = await axiosGet(UPLOAD.STORAGE_STATUS);
    
    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error('Get storage status error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสถานะพื้นที่จัดเก็บ',
      data: {}
    };
  }
};

/**
 * คำนวณพื้นที่ว่างที่เหลืออยู่
 * @param {Object} storageData - ข้อมูลพื้นที่จัดเก็บ
 * @returns {Object} - ข้อมูลพื้นที่ว่าง
 */
export const calculateFreeSpace = (storageData) => {
  if (!storageData || !storageData.total_space || !storageData.used_space) {
    return {
      freeSpace: 0,
      freeSpaceFormatted: '0 B',
      percentUsed: 0
    };
  }
  
  const totalSpace = storageData.total_space;
  const usedSpace = storageData.used_space;
  const freeSpace = totalSpace - usedSpace;
  const percentUsed = Math.round((usedSpace / totalSpace) * 100);
  
  return {
    freeSpace,
    freeSpaceFormatted: formatFileSize(freeSpace),
    percentUsed
  };
};

/**
 * ฟอร์แมตข้อมูลพื้นที่จัดเก็บสำหรับแสดงผล
 * @param {Object} storageData - ข้อมูลพื้นที่จัดเก็บ
 * @returns {Object} - ข้อมูลพื้นที่จัดเก็บที่จัดรูปแบบแล้ว
 */
export const formatStorageInfo = (storageData) => {
  if (!storageData) {
    return {
      totalSpace: '0 B',
      usedSpace: '0 B',
      freeSpace: '0 B',
      percentUsed: 0,
      storageDetails: []
    };
  }
  
  const { freeSpace, freeSpaceFormatted, percentUsed } = calculateFreeSpace(storageData);
  
  return {
    totalSpace: formatFileSize(storageData.total_space || 0),
    usedSpace: formatFileSize(storageData.used_space || 0),
    freeSpace: freeSpaceFormatted,
    percentUsed,
    storageDetails: formatStorageDetails(storageData.storage_details)
  };
};

/**
 * ฟอร์แมตรายละเอียดพื้นที่จัดเก็บสำหรับแสดงผล
 * @param {Array} storageDetails - รายละเอียดพื้นที่จัดเก็บ
 * @returns {Array} - รายละเอียดพื้นที่จัดเก็บที่จัดรูปแบบแล้ว
 */
export const formatStorageDetails = (storageDetails) => {
  if (!storageDetails || !Array.isArray(storageDetails)) {
    return [];
  }
  
  return storageDetails.map(detail => ({
    fileType: detail.file_type,
    count: detail.file_count,
    size: formatFileSize(detail.total_size),
    percentage: Math.round((detail.total_size / detail.total_storage) * 100) || 0,
    color: getFileTypeColor(detail.file_type)
  }));
};

/**
 * รับสีสำหรับประเภทไฟล์
 * @param {string} fileType - ประเภทไฟล์
 * @returns {string} - รหัสสี
 */
export const getFileTypeColor = (fileType) => {
  const colorMap = {
    image: '#1890ff',
    pdf: '#f5222d',
    video: '#52c41a',
    other: '#faad14'
  };
  
  return colorMap[fileType] || '#8c8c8c';
};

/**
 * ตรวจสอบว่าพื้นที่จัดเก็บเพียงพอหรือไม่
 * @param {number} fileSize - ขนาดไฟล์ (bytes)
 * @param {Object} storageData - ข้อมูลพื้นที่จัดเก็บ
 * @returns {boolean} - true ถ้าพื้นที่เพียงพอ, false ถ้าไม่เพียงพอ
 */
export const hasEnoughSpace = (fileSize, storageData) => {
  if (!storageData || !storageData.total_space || !storageData.used_space) {
    return false;
  }
  
  const { freeSpace } = calculateFreeSpace(storageData);
  return fileSize <= freeSpace;
};

/**
 * สร้างข้อมูลสำหรับแผนภูมิพื้นที่จัดเก็บ
 * @param {Object} storageData - ข้อมูลพื้นที่จัดเก็บ
 * @returns {Array} - ข้อมูลสำหรับแผนภูมิ
 */
export const createStorageChartData = (storageData) => {
  if (!storageData || !storageData.storage_details || !Array.isArray(storageData.storage_details)) {
    return [];
  }
  
  const { freeSpace } = calculateFreeSpace(storageData);
  
  const chartData = storageData.storage_details.map(detail => ({
    name: getFileTypeName(detail.file_type),
    value: detail.total_size,
    fill: getFileTypeColor(detail.file_type)
  }));
  
  // เพิ่มพื้นที่ว่าง
  chartData.push({
    name: 'พื้นที่ว่าง',
    value: freeSpace,
    fill: '#f0f0f0'
  });
  
  return chartData;
};

/**
 * รับชื่อประเภทไฟล์ภาษาไทย
 * @param {string} fileType - ประเภทไฟล์
 * @returns {string} - ชื่อประเภทไฟล์ภาษาไทย
 */
export const getFileTypeName = (fileType) => {
  const nameMap = {
    image: 'รูปภาพ',
    pdf: 'เอกสาร PDF',
    video: 'วิดีโอ',
    other: 'ไฟล์อื่นๆ'
  };
  
  return nameMap[fileType] || fileType;
};

export default {
  getStorageStatus,
  calculateFreeSpace,
  formatStorageInfo,
  formatStorageDetails,
  getFileTypeColor,
  hasEnoughSpace,
  createStorageChartData,
  getFileTypeName
};