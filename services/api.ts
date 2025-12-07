import axios from 'axios';
import { AuthResponse, User, UserRole } from '../types';

// Create Axios instance
const api = axios.create({
  baseURL: 'https://api.gauhatt.com/v1', // Placeholder API URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors (e.g., 401 Unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.hash = '#/login';
    }
    return Promise.reject(error);
  }
);

// Mock Services for Frontend Demo
export const AuthService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'mock-jwt-token',
          user: {
            id: '1',
            username: 'DemoUser',
            email,
            role: UserRole.USER,
          },
        });
      }, 1000);
    });
  },

  register: async (data: any): Promise<AuthResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'mock-jwt-token',
          user: {
            id: '2',
            username: data.username,
            email: data.email,
            role: data.role,
          },
        });
      }, 1000);
    });
  },

  verifyOtp: async (otp: string): Promise<boolean> => {
    return new Promise((resolve) => setTimeout(() => resolve(otp === '123456'), 1000));
  }
};

export default api;