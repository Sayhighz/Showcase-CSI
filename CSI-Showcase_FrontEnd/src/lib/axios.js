import axios from 'axios';
import { getAuthCookie } from './cookie';

// Get the secret_key from .env (in Vite, use the VITE_ prefix)
const api_url = 'http://localhost:4000'
const secretKey = import.meta.env.VITE_SECRET_KEY;

// Set up the headers for the request
const headers = () => {
  const token = getAuthCookie(); 
  console.log("Token retrieved:", token);  // Log the token to verify if it's correct
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,  // Ensure the token is passed correctly
    'secret_key': secretKey,
  };
};

export const axiosGet = async (path) => {
  try {
    const response = await axios.get(`${api_url + path}`, {
      headers: headers(),  // Call headers function here
      withCredentials: true, // Ensure cookies are included
    });
    return response.data;
  } catch (error) {
    console.error("GET request error:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Function for POST requests
export const axiosPost = async (path, data) => {
  try {
    const response = await axios.post(`${api_url + path}`, data, { 
      headers: headers(), // Call headers function here
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("POST request error:", error);
    throw error;
  }
};

// Function for login
export const axiosLogin = async (username, password) => {
  try {
    const response = await axios.post(
      `${api_url}/auth/login`, 
      {
        username,
        password,
      }, 
      { 
        headers: {
          'secret_key': secretKey,
        }
      }
    );
    return response.data;  // Return the token if successful
  } catch (error) {
    if (error.response) {
      // If there's a response from the server
      const status = error.response.status;
      const message = error.response.data.message || 'Unknown error occurred';
      throw { status, message };
    } else {
      console.error("Login request error:", error);
      throw { status: 500, message: 'Network or server error' };
    }
  }
};
