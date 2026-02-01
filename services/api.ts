import axios from 'axios';
import { ApiResponse, AuthResponseData, RegisterResponseData, UserRole, Product, Order, PendingFarmer, FarmerApprovalResult } from '../types';

// Create Axios instance
const api = axios.create({
  baseURL: 'https://localhost:7216/api',
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
      localStorage.removeItem('user');
      window.location.hash = '#/login';
    }
    return Promise.reject(error);
  }
);

// Auth Service with real API calls
export const AuthService = {
  login: async (emailOrUsername: string, password: string): Promise<ApiResponse<AuthResponseData>> => {
    const response = await api.post<ApiResponse<AuthResponseData>>('/Auth/signin', {
      emailOrUsername,
      password,
    });
    return response.data;
  },

  registerConsumer: async (data: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<ApiResponse<RegisterResponseData>> => {
    const response = await api.post<ApiResponse<RegisterResponseData>>('/Auth/register/consumer', data);
    return response.data;
  },

  registerFarmerStep1: async (data: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<ApiResponse<{ tempUserId: string; nextStep: number }>> => {
    const response = await api.post<ApiResponse<{ tempUserId: string; nextStep: number }>>('/Auth/register/farmer/step1', data);
    return response.data;
  },

  registerFarmer: async (formData: FormData): Promise<ApiResponse<RegisterResponseData>> => {
    const response = await api.post<ApiResponse<RegisterResponseData>>('/Auth/register/farmer', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  verifyOtp: async (email: string, token: string): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>('/Auth/verify-email', {
      Email: email,
      Token: token
    });
    return response.data;
  },

  resendVerification: async (email: string): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>('/Auth/resend-verification', { email });
    return response.data;
  },

  getDistricts: async (): Promise<ApiResponse<string[]>> => {
    const response = await api.get<ApiResponse<string[]>>('/Auth/districts');
    return response.data;
  },
};

export const ProductService = {
  getAll: async (): Promise<ApiResponse<Product[]>> => {
    // MOCK DATA
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            { id: '1', name: 'Organic Tomatoes', description: 'Fresh farm tomatoes', price: 40, stockQuantity: 100, category: 'Vegetables', unit: 'kg', isActive: true, imageUrl: '' },
            { id: '2', name: 'Fresh Milk', description: 'Pure cow milk', price: 60, stockQuantity: 50, category: 'Dairy', unit: 'liter', isActive: true, imageUrl: '' },
            { id: '3', name: 'Potatoes', description: 'Organic potatoes', price: 30, stockQuantity: 200, category: 'Vegetables', unit: 'kg', isActive: true, imageUrl: '' },
            { id: '4', name: 'Honey', description: 'Raw forest honey', price: 500, stockQuantity: 20, category: 'Others', unit: 'bottle', isActive: true, imageUrl: '' },
          ]
        });
      }, 500);
    });
  },

  getById: async (id: string): Promise<ApiResponse<Product>> => {
    return new Promise((resolve) => {
      resolve({
        success: true,
        data: { id: '1', name: 'Organic Tomatoes', description: 'Fresh farm tomatoes', price: 40, stockQuantity: 100, category: 'Vegetables', unit: 'kg', isActive: true, imageUrl: '' }
      });
    });
  },

  create: async (formData: FormData): Promise<ApiResponse<Product>> => {
    return new Promise((resolve) => {
      resolve({
        success: true,
        data: { id: Math.random().toString(), name: formData.get('name') as string, description: 'New Product', price: 100, stockQuantity: 10, category: 'Vegetables', unit: 'kg', isActive: true }
      });
    });
  },

  update: async (id: string, formData: FormData): Promise<ApiResponse<Product>> => {
    return new Promise((resolve) => {
      resolve({
        success: true,
        data: { id, name: 'Updated Product', description: 'Updated', price: 100, stockQuantity: 10, category: 'Vegetables', unit: 'kg', isActive: true }
      });
    });
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return new Promise((resolve) => {
      resolve({ success: true, data: null });
    });
  },
};

export const OrderService = {
  getFarmerOrders: async (): Promise<ApiResponse<Order[]>> => {
    // MOCK DATA
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            {
              id: 'ORD-001',
              consumerName: 'Rahul Sharma',
              consumerId: 'C1',
              totalAmount: 450,
              status: 'Pending',
              orderDate: '2025-01-02T10:30:00',
              deliveryAddress: '123, Green Park, New Delhi',
              paymentStatus: 'Paid',
              items: [
                { productId: '1', productName: 'Organic Tomatoes', quantity: 2, price: 40, unit: 'kg' },
                { productId: '2', productName: 'Fresh Milk', quantity: 3, price: 60, unit: 'liter' }
              ]
            },
            {
              id: 'ORD-002',
              consumerName: 'Priya Verma',
              consumerId: 'C2',
              totalAmount: 1200,
              status: 'Confirmed',
              orderDate: '2025-01-03T14:15:00',
              deliveryAddress: '45/B, Lake View, Bangalore',
              paymentStatus: 'Pending',
              items: [
                { productId: '3', productName: 'Basmati Rice', quantity: 5, price: 200, unit: 'kg' }
              ]
            },
            {
              id: 'ORD-003',
              consumerName: 'Amit Patel',
              consumerId: 'C3',
              totalAmount: 850,
              status: 'Delivered',
              orderDate: '2024-12-28T09:00:00',
              deliveryAddress: '12, MG Road, Mumbai',
              paymentStatus: 'Paid',
              items: [
                { productId: '4', productName: 'Honey', quantity: 1, price: 500, unit: 'bottle' },
                { productId: '3', productName: 'Basmati Rice', quantity: 2, price: 175, unit: 'kg' }
              ]
            }
          ]
        });
      }, 500);
    });
  },

  updateStatus: async (orderId: string, status: string): Promise<ApiResponse<Order>> => {
    return new Promise((resolve) => {
      resolve({
        success: true,
        data: {} as Order // simplified return
      });
    });
  },
};

// Admin Service for farmer approval management
export const AdminService = {
  getPendingFarmers: async (): Promise<ApiResponse<PendingFarmer[]>> => {
    const response = await api.get<ApiResponse<PendingFarmer[]>>('/Admin/farmers/pending');
    return response.data;
  },

  approveFarmer: async (farmerId: string): Promise<ApiResponse<FarmerApprovalResult>> => {
    const response = await api.post<ApiResponse<FarmerApprovalResult>>(`/Admin/farmers/${farmerId}/approve`);
    return response.data;
  },

  rejectFarmer: async (farmerId: string, reason: string): Promise<ApiResponse<FarmerApprovalResult>> => {
    const response = await api.post<ApiResponse<FarmerApprovalResult>>(`/Admin/farmers/${farmerId}/reject`, {
      farmerId,
      reason
    });
    return response.data;
  },
};



// Helper to store auth data
export const storeAuthData = (data: AuthResponseData) => {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
};

// Helper to get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Helper to clear auth data
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export default api;