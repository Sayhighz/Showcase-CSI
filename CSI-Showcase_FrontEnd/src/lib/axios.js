import axios from 'axios';
import { getAuthCookie } from './cookie';

// ดึงค่า secret_key จาก .env (ใน Vite ต้องใช้ VITE_ prefix)
const secretKey = import.meta.env.VITE_SECRET_KEY;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthCookie()}`,  // ใช้ token จาก cookie
  'secret_key': secretKey,  // เพิ่ม secret_key จาก .env
};

const api_url = 'http://localhost:4000';

// ฟังก์ชันสำหรับการทำ GET request
export const axiosGet = async (path) => {
  try {
    const response = await axios.get(`${api_url+path}`, { headers });
    return response.data;
  } catch (error) {
    console.error("GET request error:", error);
    throw error;
  }
};

// ฟังก์ชันสำหรับการทำ POST request
export const axiosPost = async (path, data) => {
  try {
    const response = await axios.post(`${api_url+path}`, data, { headers });
    return response.data;
  } catch (error) {
    console.error("POST request error:", error);
    throw error;
  }
};

// ฟังก์ชันสำหรับ login
export const axiosLogin = async (username, password) => {
  try {
    const response = await axios.post(`${api_url}/auth/login`, {
      username,
      password,
    });
    return response.data;  // คืนค่า token ถ้าสำเร็จ
  } catch (error) {
    if (error.response) {
      // ถ้ามีการตอบกลับจาก server
      const status = error.response.status;
      const message = error.response.data.message || 'Unknown error occurred';
      throw { status, message };
    } else {
      console.error("Login request error:", error);
      throw { status: 500, message: 'Network or server error' };
    }
  }
};
