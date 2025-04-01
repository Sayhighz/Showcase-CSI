import axios from 'axios';
import { getAuthCookie } from './cookie';

// Get the secret_key from .env (in Vite, use the VITE_ prefix)
const api_url = 'http://localhost:4000/api';
const secretKey = import.meta.env.VITE_SECRET_KEY;

// Set up the headers for the request
const headers = () => {
  const token = getAuthCookie(); 
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    'secret_key': secretKey,
  };
};

export const axiosGet = async (path) => {
  try {
    const response = await axios.get(`${api_url}${path}`, {
      headers: headers(),
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error, 'GET');
    throw formatError(error);
  }
};

// Function for POST requests
export const axiosPost = async (path, data) => {
  try {
    const response = await axios.post(`${api_url}${path}`, data, { 
      headers: headers(),
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error, 'POST');
    throw formatError(error);
  }
};

// Function for PUT requests
export const axiosPut = async (path, data) => {
  try {
    const response = await axios.put(`${api_url}${path}`, data, { 
      headers: headers(),
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error, 'PUT');
    throw formatError(error);
  }
};

// Function for DELETE requests
export const axiosDelete = async (path) => {
  try {
    const response = await axios.delete(`${api_url}${path}`, { 
      headers: headers(),
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error, 'DELETE');
    throw formatError(error);
  }
};

// Function for login
export const axiosLogin = async (username, password) => {
  try {
    const response = await axios.post(
      `${api_url}/auth/login`, 
      { username, password }, 
      { 
        headers: {
          'Content-Type': 'application/json',
          'secret_key': secretKey,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, 'LOGIN');
    throw formatError(error);
  }
};

// Helper function to log and format errors
function handleAxiosError(error, requestType) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error(`${requestType} request error:`, {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers,
    });
  } else if (error.request) {
    // The request was made but no response was received
    console.error(`${requestType} request error: No response received`, error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error(`${requestType} request error:`, error.message);
  }
}

// Format error for consistent error handling
function formatError(error) {
  if (error.response) {
    return {
      status: error.response.status,
      message: error.response.data.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์',
      data: error.response.data
    };
  } else if (error.request) {
    return {
      status: 0,
      message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
    };
  } else {
    return {
      status: 500,
      message: error.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
    };
  }
}