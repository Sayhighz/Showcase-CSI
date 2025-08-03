/**
 * Service สำหรับการจัดการข้อมูลโปรเจค
 * ให้บริการฟังก์ชันเกี่ยวกับการดึงข้อมูล, สร้าง, แก้ไข, ลบโปรเจค เป็นต้น
 */
import { get, post, put, del, uploadFile, updateFile } from './apiService';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { message } from 'antd';

/**
 * ดึงข้อมูลโปรเจคทั้งหมด
 * @param {Object} params - พารามิเตอร์สำหรับการค้นหา
 * @param {number} params.page - หน้าที่ต้องการ
 * @param {number} params.limit - จำนวนผลลัพธ์ต่อหน้า
 * @param {string} params.category - ประเภทของโปรเจค (coursework, academic, competition)
 * @param {number} params.year - ปีของโปรเจค
 * @param {number} params.level - ชั้นปีของผู้สร้างโปรเจค (ปี 1, ปี 2, ปี 3, ปี 4)
 * @param {string} params.keyword - คำค้นหา
 * @returns {Promise} - รายการโปรเจค
 */
export const getAllProjects = async (params = {}) => {
  try {
    // ตรวจสอบและแปลงค่าตัวเลขให้เป็น number
    if (params.page) params.page = Number(params.page);
    if (params.limit) params.limit = Number(params.limit);
    if (params.year) params.year = Number(params.year);
    if (params.level) params.level = Number(params.level);
    
    // console.log('API params before filtering:', params);
    
    // กรองพารามิเตอร์ที่เป็น null, undefined หรือ empty string ออก
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => 
        value !== null && value !== undefined && value !== ''
      )
    );
    
    // console.log('API params after filtering (sent to API):', filteredParams);
    
    const response = await get(API_ENDPOINTS.PROJECT.GET_ALL, filteredParams);
    
    if (response && response.success) {
      return {
        projects: response.data.projects || [],
        pagination: response.data.pagination || {
          page: params.page || 1,
          limit: params.limit || 10,
          totalItems: 0,
          totalPages: 0
        }
      };
    } else {
      throw new Error(response?.message || 'ไม่สามารถดึงข้อมูลโปรเจคได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจค:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลโปรเจคที่มียอดเข้าชมสูงสุด 9 อันดับแรก
 * @returns {Promise} - รายการโปรเจคยอดนิยม
 */
export const getTopProjects = async () => {
  try {
    const response = await get(API_ENDPOINTS.PROJECT.TOP);
    
    if (response && response.success) {
      return response.data.projects || [];
    } else {
      throw new Error(response?.message || 'ไม่สามารถดึงข้อมูลโปรเจคยอดนิยมได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคยอดนิยม:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลโปรเจคล่าสุด
 * @param {number} limit - จำนวนโปรเจคที่ต้องการ (default: 9)
 * @returns {Promise} - รายการโปรเจคล่าสุด
 */
export const getLatestProjects = async (limit = 9) => {
  try {
    const response = await get(API_ENDPOINTS.PROJECT.LATEST, { limit: Number(limit) });
    // console.log(response)
    
    if (response && response.success) {
      return response.data.projects || [];
    } else {
      throw new Error(response?.message || 'ไม่สามารถดึงข้อมูลโปรเจคล่าสุดได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคล่าสุด:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลโปรเจคของผู้ใช้
 * @param {string} userId - ID ของผู้ใช้
 * @param {Object} params - พารามิเตอร์สำหรับการค้นหา
 * @param {number} params.page - หน้าที่ต้องการ
 * @param {number} params.limit - จำนวนผลลัพธ์ต่อหน้า
 * @returns {Promise} - รายการโปรเจคของผู้ใช้
 */
export const getMyProjects = async (userId, params = {}) => {
  try {
    if (!userId) {
      throw new Error('ไม่มี ID ผู้ใช้');
    }
    
    // ตรวจสอบและแปลงค่าตัวเลขให้เป็น number
    if (params.page) params.page = Number(params.page);
    if (params.limit) params.limit = Number(params.limit);
    
    const response = await get(API_ENDPOINTS.PROJECT.MY_PROJECTS(userId), params);
    
    if (response && response.success) {
      return {
        projects: response.data.projects || [],
        pagination: response.data.pagination || {
          page: params.page || 1,
          limit: params.limit || 10,
          totalItems: 0,
          totalPages: 0
        }
      };
    } else {
      throw new Error(response?.message || 'ไม่สามารถดึงข้อมูลโปรเจคของคุณได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจคของคุณ:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลรายละเอียดของโปรเจค
 * @param {string} projectId - ID ของโปรเจค
 * @returns {Promise} - ข้อมูลรายละเอียดของโปรเจค
 */
export const getProjectDetails = async (projectId) => {
  try {
    if (!projectId) {
      throw new Error('ไม่มี ID ของโปรเจค');
    }
    
    const response = await get(API_ENDPOINTS.PROJECT.GET_BY_ID(projectId));
    
    if (response && response.success) {
      return response.data;
    } else {
      throw new Error(response?.message || 'ไม่สามารถดึงข้อมูลรายละเอียดของโปรเจคได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลรายละเอียดของโปรเจค:', error);
    throw error;
  }
};

/**
 * อัปโหลดโปรเจคใหม่
 * @param {string} userId - ID ของผู้ใช้
 * @param {Object} projectData - ข้อมูลของโปรเจค
 * @param {Object} files - ไฟล์ที่ต้องการอัปโหลด
 * @returns {Promise} - ผลลัพธ์จากการอัปโหลดโปรเจค
 */
export const uploadProject = async (userId, projectData, files) => {
  try {
    if (!userId) {
      throw new Error('ไม่มี ID ผู้ใช้');
    }
    
    // สร้าง FormData
    const formData = new FormData();
    
    // เพิ่มข้อมูลโปรเจค
    Object.keys(projectData).forEach(key => {
      if (projectData[key] !== null && projectData[key] !== undefined && projectData[key] !== '') {
        // แปลง array หรือ object เป็น JSON string
        if (typeof projectData[key] === 'object' && !(projectData[key] instanceof File)) {
          formData.append(key, JSON.stringify(projectData[key]));
        } else {
          formData.append(key, projectData[key]);
        }
      }
    });
    
    // ตรวจสอบและเพิ่มไฟล์
    if (files) {
      // ตรวจสอบประเภทและจัดการไฟล์ตามชนิด
      const projectType = projectData.type;
      
      // ไฟล์สำหรับ Academic
      if (projectType === 'academic' && files.paperFile) {
        formData.append('paperFile', files.paperFile);
      }
      
      // ไฟล์สำหรับ Coursework
      if (projectType === 'coursework') {
        if (files.courseworkPoster) {
          formData.append('courseworkPoster', files.courseworkPoster);
        }
        if (files.courseworkImage) {
          formData.append('courseworkImage', files.courseworkImage);
        }
        if (files.courseworkVideo) {
          formData.append('courseworkVideo', files.courseworkVideo);
        }
      }
      
      // ไฟล์สำหรับ Competition
      if (projectType === 'competition' && files.competitionPoster) {
        formData.append('competitionPoster', files.competitionPoster);
      }
    }
    
    // ตรวจสอบการสร้าง FormData
    // console.log("FormData entries:");
    for (let pair of formData.entries()) {
      // console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]));
    }
    
    // ส่งข้อมูลไปยัง API
    const response = await uploadFile(API_ENDPOINTS.PROJECT.UPLOAD(userId), formData);
    
    if (response && response.success) {
      message.success('อัปโหลดโปรเจคสำเร็จ');
      return response.data;
    } else {
      throw new Error(response?.message || 'ไม่สามารถอัปโหลดโปรเจคได้');
    }
  } catch (error) {
    message.error(error.message || 'เกิดข้อผิดพลาดในการอัปโหลดโปรเจค');
    console.error('เกิดข้อผิดพลาดในการอัปโหลดโปรเจค:', error);
    throw error;
  }
};

/**
 * อัปเดตข้อมูลโปรเจค
 * @param {string} projectId - ID ของโปรเจค
 * @param {Object} projectData - ข้อมูลที่ต้องการอัปเดต
 * @param {Object} files - ไฟล์ที่ต้องการอัปโหลดใหม่
 * @returns {Promise} - ผลลัพธ์จากการอัปเดตโปรเจค
 */
export const updateProject = async (projectId, projectData, files) => {
  try {
    if (!projectId) {
      throw new Error('ไม่มี ID ของโปรเจค');
    }
    
    // สร้าง FormData สำหรับการส่งข้อมูลและไฟล์
    const formData = new FormData();
    
    // เพิ่มข้อมูลของโปรเจคลงใน FormData
    Object.keys(projectData).forEach(key => {
      // ข้ามค่า null, undefined และ empty string
      if (projectData[key] === null || projectData[key] === undefined || projectData[key] === '') {
        return;
      }
      
      // ถ้าเป็น Object หรือ Array ให้แปลงเป็น JSON string (ยกเว้น File objects)
      if (typeof projectData[key] === 'object' && projectData[key] !== null && !(projectData[key] instanceof File)) {
        formData.append(key, JSON.stringify(projectData[key]));
      } else {
        formData.append(key, projectData[key]);
      }
    });
    
    // จัดการไฟล์ตามประเภทโปรเจค
    if (files) {
      const projectType = projectData.type;
      
      // ไฟล์สำหรับ Academic
      if (projectType === 'academic') {
        if (files.paperFile) {
          // ตรวจสอบว่าเป็น File object จริงๆ (originFileObj จาก Ant Design Upload)
          if (files.paperFile.originFileObj) {
            formData.append('paperFile', files.paperFile.originFileObj);
          } else if (files.paperFile instanceof File) {
            formData.append('paperFile', files.paperFile);
          }
        }
      }
      
      // ไฟล์สำหรับ Coursework
      else if (projectType === 'coursework') {
        if (files.courseworkPoster) {
          if (files.courseworkPoster.originFileObj) {
            formData.append('courseworkPoster', files.courseworkPoster.originFileObj);
          } else if (files.courseworkPoster instanceof File) {
            formData.append('courseworkPoster', files.courseworkPoster);
          }
        }
        
        if (files.courseworkImage) {
          if (files.courseworkImage.originFileObj) {
            formData.append('courseworkImage', files.courseworkImage.originFileObj);
          } else if (files.courseworkImage instanceof File) {
            formData.append('courseworkImage', files.courseworkImage);
          }
        }
        
        if (files.courseworkVideo) {
          if (files.courseworkVideo.originFileObj) {
            formData.append('courseworkVideo', files.courseworkVideo.originFileObj);
          } else if (files.courseworkVideo instanceof File) {
            formData.append('courseworkVideo', files.courseworkVideo);
          }
        }
      }
      
      // ไฟล์สำหรับ Competition
      else if (projectType === 'competition') {
        if (files.competitionPoster) {
          if (files.competitionPoster.originFileObj) {
            formData.append('competitionPoster', files.competitionPoster.originFileObj);
          } else if (files.competitionPoster instanceof File) {
            formData.append('competitionPoster', files.competitionPoster);
          }
        }
      }
      
      // จัดการกับ arrays ของไฟล์ (ถ้ามี)
      ['documents', 'images'].forEach(fieldName => {
        if (files[fieldName] && Array.isArray(files[fieldName]) && files[fieldName].length > 0) {
          files[fieldName].forEach(file => {
            if (file.originFileObj) {
              formData.append(fieldName, file.originFileObj);
            } else if (file instanceof File) {
              formData.append(fieldName, file);
            }
          });
        }
      });
    }
    
    // แสดง log เพื่อตรวจสอบ FormData
    // console.log("FormData entries for update:");
    for (let pair of formData.entries()) {
      // console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]));
    }
    
    // ส่งข้อมูลไปยัง API
    const response = await updateFile(API_ENDPOINTS.PROJECT.UPDATE(projectId), formData);
    
    if (response && response.success) {
      message.success('อัปเดตโปรเจคสำเร็จ');
      return response.data;
    } else {
      throw new Error(response?.message || 'ไม่สามารถอัปเดตโปรเจคได้');
    }
  } catch (error) {
    message.error(error.message || 'เกิดข้อผิดพลาดในการอัปเดตโปรเจค');
    console.error('เกิดข้อผิดพลาดในการอัปเดตโปรเจค:', error);
    throw error;
  }
};

/**
 * ลบโปรเจค
 * @param {string} projectId - ID ของโปรเจคที่ต้องการลบ
 * @returns {Promise} - ผลลัพธ์จากการลบโปรเจค
 */
export const deleteProject = async (projectId) => {
  try {
    if (!projectId) {
      throw new Error('ไม่มี ID ของโปรเจค');
    }
    
    const response = await del(API_ENDPOINTS.PROJECT.DELETE(projectId));
    
    if (response && response.success) {
      message.success('ลบโปรเจคสำเร็จ');
      return response.data;
    } else {
      throw new Error(response?.message || 'ไม่สามารถลบโปรเจคได้');
    }
  } catch (error) {
    message.error(error.message || 'เกิดข้อผิดพลาดในการลบโปรเจค');
    console.error('เกิดข้อผิดพลาดในการลบโปรเจค:', error);
    throw error;
  }
};

/**
 * ค้นหาโปรเจค
 * @param {Object} params - พารามิเตอร์สำหรับการค้นหา
 * @param {string} params.keyword - คำค้นหา
 * @param {string} params.category - ประเภทของโปรเจค
 * @param {number} params.year - ปีของโปรเจค
 * @param {number} params.level - ชั้นปีของผู้สร้างโปรเจค
 * @param {number} params.page - หน้าที่ต้องการ
 * @param {number} params.limit - จำนวนผลลัพธ์ต่อหน้า
 * @returns {Promise} - ผลลัพธ์จากการค้นหาโปรเจค
 */
export const searchProjects = async (params = {}) => {
  try {
    // ตรวจสอบและแปลงค่าตัวเลขให้เป็น number
    if (params.page) params.page = Number(params.page);
    if (params.limit) params.limit = Number(params.limit);
    if (params.year) params.year = Number(params.year);
    if (params.level) params.level = Number(params.level);
    
    // console.log('Search params before filtering:', params);
    
    // กรองพารามิเตอร์ที่เป็น null, undefined หรือ empty string ออก
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => 
        value !== null && value !== undefined && value !== ''
      )
    );
    
    // console.log('Search params after filtering (sent to API):', filteredParams);
    
    const response = await get(API_ENDPOINTS.SEARCH.PROJECTS, filteredParams);
    
    if (response && response.success) {
      return {
        projects: response.data.projects || [],
        pagination: response.data.pagination || {
          page: params.page || 1,
          limit: params.limit || 10,
          totalItems: 0,
          totalPages: 0
        }
      };
    } else {
      throw new Error(response?.message || 'ไม่สามารถค้นหาโปรเจคได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการค้นหาโปรเจค:', error);
    throw error;
  }
};

export default {
  getAllProjects,
  getTopProjects,
  getLatestProjects,
  getMyProjects,
  getProjectDetails,
  uploadProject,
  updateProject,
  deleteProject,
  searchProjects,
};