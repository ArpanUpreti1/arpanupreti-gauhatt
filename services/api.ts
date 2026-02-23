import axios from 'axios';
import { 
  ApiResponse, 
  AuthResponseData, 
  RegisterResponseData, 
  UserRole, 
  Product, 
  ProductListResponse, 
  ProductFilter,
  ProductRating,
  RatingListResponse,
  ProductRatingSummary,
  Story,
  StoryListResponse,
  StoryFilter,
  Comment,
  CommentListResponse,
  Order, 
  PendingFarmer, 
  FarmerApprovalResult,
  UserLocation,
  LocationUpdateResponse,
  CalculateDeliveryRequest,
  DeliveryFeeResponse,
  DeliveryPricingInfo,
  CreateOrderRequest,
  OrderResponse,
  FarmerOrder,
  Notification,
  NotificationListResponse,
  RegisterDeliveryPersonData,
  DeliveryAssignment,
  DeliveryDashboardStats,
  DeliveryPersonProfile,
  AdminDashboardStats,
  AdminOrder,
  AdminUser,
  TopFarmer,
  TopProduct,
  RevenueAnalytics,
  PagedResult
} from '../types';

export const API_BASE_URL = 'http://localhost:5165';

// Create Axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
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
    // Debug log for development
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
      hasToken: !!token,
      headers: config.headers
    });
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/Auth/');
      
      // For non-auth endpoints, just log it. Don't clear data or redirect.
      // The calling code should handle 401 gracefully.
      if (!isAuthEndpoint) {
        console.warn('[API] 401 on', url, '- request may need re-authentication');
      }
    } else if (error.response?.status === 403) {
      console.error('[API] 403 Forbidden - User does not have required permissions', {
        url: error.config?.url,
      });
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

  registerDeliveryPerson: async (data: RegisterDeliveryPersonData): Promise<ApiResponse<RegisterResponseData>> => {
    const response = await api.post<ApiResponse<RegisterResponseData>>('/Auth/register/delivery-person', data);
    return response.data;
  },
};

// Real Product Service
export const ProductService = {
  // Get all products with filters (public)
  getAll: async (filter?: ProductFilter): Promise<ApiResponse<ProductListResponse>> => {
    const params = new URLSearchParams();
    if (filter?.search) params.append('search', filter.search);
    if (filter?.category) params.append('category', filter.category);
    if (filter?.minPrice) params.append('minPrice', filter.minPrice.toString());
    if (filter?.maxPrice) params.append('maxPrice', filter.maxPrice.toString());
    if (filter?.maxDistance) params.append('maxDistance', filter.maxDistance.toString());
    if (filter?.isOrganic !== undefined) params.append('isOrganic', filter.isOrganic.toString());
    if (filter?.sortBy) params.append('sortBy', filter.sortBy);
    if (filter?.sortOrder) params.append('sortOrder', filter.sortOrder);
    if (filter?.page) params.append('page', filter.page.toString());
    if (filter?.pageSize) params.append('pageSize', filter.pageSize.toString());
    // Location params for distance calculation
    if (filter?.consumerLatitude) params.append('consumerLatitude', filter.consumerLatitude.toString());
    if (filter?.consumerLongitude) params.append('consumerLongitude', filter.consumerLongitude.toString());
    if (filter?.enforceDeliveryLimit !== undefined) params.append('enforceDeliveryLimit', filter.enforceDeliveryLimit.toString());

    const response = await api.get<ApiResponse<ProductListResponse>>(`/Products?${params.toString()}`);
    return response.data;
  },

  // Get single product by ID
  getById: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await api.get<ApiResponse<Product>>(`/Products/${id}`);
    return response.data;
  },

  // Get farmer's own products
  getMyProducts: async (page: number = 1, pageSize: number = 10): Promise<ApiResponse<ProductListResponse>> => {
    const response = await api.get<ApiResponse<ProductListResponse>>(`/Products/my-products?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  // Get all categories
  getCategories: async (): Promise<ApiResponse<string[]>> => {
    const response = await api.get<ApiResponse<string[]>>('/Products/categories');
    return response.data;
  },

  // Create new product (Farmer only)
  create: async (formData: FormData): Promise<ApiResponse<Product>> => {
    const token = localStorage.getItem('token');
    const response = await api.post<ApiResponse<Product>>('/Products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    return response.data;
  },

  // Update product (Farmer only)
  update: async (id: string, formData: FormData): Promise<ApiResponse<Product>> => {
    const token = localStorage.getItem('token');
    const response = await api.put<ApiResponse<Product>>(`/Products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    return response.data;
  },

  // Delete product (Farmer only)
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/Products/${id}`);
    return response.data;
  },

  // ============ RATING METHODS ============

  // Add or update a rating for a product (Consumer only)
  rateProduct: async (productId: string, rating: number, review?: string): Promise<ApiResponse<ProductRating>> => {
    const response = await api.post<ApiResponse<ProductRating>>(`/Products/${productId}/ratings`, {
      rating,
      review
    });
    return response.data;
  },

  // Get all ratings for a product
  getProductRatings: async (productId: string, page: number = 1, pageSize: number = 10): Promise<ApiResponse<RatingListResponse>> => {
    const response = await api.get<ApiResponse<RatingListResponse>>(`/Products/${productId}/ratings?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  // Get rating summary for a product
  getProductRatingSummary: async (productId: string): Promise<ApiResponse<ProductRatingSummary>> => {
    const response = await api.get<ApiResponse<ProductRatingSummary>>(`/Products/${productId}/ratings/summary`);
    return response.data;
  },

  // Delete your rating for a product
  deleteRating: async (productId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/Products/${productId}/ratings`);
    return response.data;
  },
};

// Real Story Service
export const StoryService = {
  // Get all stories with filters (public)
  getAll: async (filter?: StoryFilter): Promise<ApiResponse<StoryListResponse>> => {
    const params = new URLSearchParams();
    if (filter?.search) params.append('search', filter.search);
    if (filter?.farmerId) params.append('farmerId', filter.farmerId);
    if (filter?.productId) params.append('productId', filter.productId);
    if (filter?.sortBy) params.append('sortBy', filter.sortBy);
    if (filter?.sortOrder) params.append('sortOrder', filter.sortOrder);
    if (filter?.page) params.append('page', filter.page.toString());
    if (filter?.pageSize) params.append('pageSize', filter.pageSize.toString());

    const response = await api.get<ApiResponse<StoryListResponse>>(`/Stories?${params.toString()}`);
    return response.data;
  },

  // Get single story by ID (also increments view count)
  getById: async (id: string): Promise<ApiResponse<Story>> => {
    const response = await api.get<ApiResponse<Story>>(`/Stories/${id}`);
    return response.data;
  },

  // Get farmer's own stories
  getMyStories: async (page: number = 1, pageSize: number = 10): Promise<ApiResponse<StoryListResponse>> => {
    const response = await api.get<ApiResponse<StoryListResponse>>(`/Stories/my-stories?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  // Create new story (Farmer only)
  create: async (formData: FormData): Promise<ApiResponse<Story>> => {
    const response = await api.post<ApiResponse<Story>>('/Stories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update story (Farmer only)
  update: async (id: string, formData: FormData): Promise<ApiResponse<Story>> => {
    const response = await api.put<ApiResponse<Story>>(`/Stories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete story (Farmer only)
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/Stories/${id}`);
    return response.data;
  },

  // Like a story
  like: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>(`/Stories/${id}/like`);
    return response.data;
  },

  // Get comments for a story
  getComments: async (storyId: string, page: number = 1, pageSize: number = 20): Promise<ApiResponse<CommentListResponse>> => {
    const response = await api.get<ApiResponse<CommentListResponse>>(`/Stories/${storyId}/comments?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  // Add a comment to a story
  addComment: async (storyId: string, content: string): Promise<ApiResponse<Comment>> => {
    const response = await api.post<ApiResponse<Comment>>(`/Stories/${storyId}/comments`, { content });
    return response.data;
  },

  // Delete a comment
  deleteComment: async (commentId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/Stories/comments/${commentId}`);
    return response.data;
  },

  // Get stories by product ID
  getByProductId: async (productId: string): Promise<ApiResponse<StoryListResponse>> => {
    const params = new URLSearchParams();
    params.append('productId', productId);
    params.append('pageSize', '5');
    const response = await api.get<ApiResponse<StoryListResponse>>(`/Stories?${params.toString()}`);
    return response.data;
  },
};

export const OrderService = {
  // Create a new order (Consumer)
  create: async (orderData: CreateOrderRequest): Promise<ApiResponse<OrderResponse>> => {
    try {
      const response = await api.post<ApiResponse<OrderResponse>>('/Orders', orderData);
      return response.data;
    } catch (error: any) {
      // Handle validation errors from the server
      if (error.response?.data) {
        const errorData = error.response.data;
        // Handle ValidationProblemDetails format
        if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors).flat().join(', ');
          return {
            success: false,
            message: errorMessages || errorData.title || 'Validation failed',
            data: null as any,
            errors: Object.entries(errorData.errors).map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`)
          };
        }
        // Handle ApiResponse format
        if (errorData.message) {
          return errorData;
        }
      }
      throw error;
    }
  },

  // Get consumer's orders
  getMyOrders: async (): Promise<ApiResponse<OrderResponse[]>> => {
    const response = await api.get<ApiResponse<OrderResponse[]>>('/Orders/my-orders');
    return response.data;
  },

  // Get farmer's orders
  getFarmerOrders: async (): Promise<ApiResponse<FarmerOrder[]>> => {
    const response = await api.get<ApiResponse<FarmerOrder[]>>('/Orders/farmer-orders');
    return response.data;
  },

  // Get order by ID
  getById: async (orderId: string): Promise<ApiResponse<OrderResponse>> => {
    const response = await api.get<ApiResponse<OrderResponse>>(`/Orders/${orderId}`);
    return response.data;
  },

  // Update order status (Consumer/Admin)
  updateStatus: async (orderId: string, status: string): Promise<ApiResponse<any>> => {
    const response = await api.put<ApiResponse<any>>(`/Orders/${orderId}/status`, { status });
    return response.data;
  },

  // Update order item status (Farmer)
  updateItemStatus: async (itemId: string, itemStatus: string): Promise<ApiResponse<any>> => {
    const response = await api.put<ApiResponse<any>>(`/Orders/items/${itemId}/status`, { itemStatus });
    return response.data;
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

  // Dashboard stats
  getDashboardStats: async (): Promise<ApiResponse<AdminDashboardStats>> => {
    const response = await api.get<ApiResponse<AdminDashboardStats>>('/Admin/dashboard/stats');
    return response.data;
  },

  // Orders
  getRecentOrders: async (count: number = 10): Promise<ApiResponse<AdminOrder[]>> => {
    const response = await api.get<ApiResponse<AdminOrder[]>>(`/Admin/orders/recent?count=${count}`);
    return response.data;
  },

  getAllOrders: async (page: number = 1, pageSize: number = 20, status?: string, search?: string): Promise<ApiResponse<PagedResult<AdminOrder>>> => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const response = await api.get<ApiResponse<PagedResult<AdminOrder>>>(`/Admin/orders?${params}`);
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<ApiResponse<string>> => {
    const response = await api.put<ApiResponse<string>>(`/Admin/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Users
  getAllUsers: async (page: number = 1, pageSize: number = 20, role?: string, search?: string): Promise<ApiResponse<PagedResult<AdminUser>>> => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (role) params.append('role', role);
    if (search) params.append('search', search);
    const response = await api.get<ApiResponse<PagedResult<AdminUser>>>(`/Admin/users?${params}`);
    return response.data;
  },

  // Top performers
  getTopFarmers: async (count: number = 10): Promise<ApiResponse<TopFarmer[]>> => {
    const response = await api.get<ApiResponse<TopFarmer[]>>(`/Admin/farmers/top?count=${count}`);
    return response.data;
  },

  getTopProducts: async (count: number = 10): Promise<ApiResponse<TopProduct[]>> => {
    const response = await api.get<ApiResponse<TopProduct[]>>(`/Admin/products/top?count=${count}`);
    return response.data;
  },

  // Analytics
  getRevenueAnalytics: async (days: number = 30): Promise<ApiResponse<RevenueAnalytics>> => {
    const response = await api.get<ApiResponse<RevenueAnalytics>>(`/Admin/analytics/revenue?days=${days}`);
    return response.data;
  },
};

// Delivery Service for location and delivery fee calculations
export const DeliveryService = {
  // Calculate delivery fee for cart items
  calculateFee: async (request: CalculateDeliveryRequest): Promise<ApiResponse<DeliveryFeeResponse>> => {
    const response = await api.post<ApiResponse<DeliveryFeeResponse>>('/Delivery/calculate', request);
    return response.data;
  },

  // Get delivery pricing information
  getPricingInfo: async (): Promise<ApiResponse<DeliveryPricingInfo>> => {
    const response = await api.get<ApiResponse<DeliveryPricingInfo>>('/Delivery/pricing-info');
    return response.data;
  },

  // Update user's delivery location
  updateLocation: async (location: UserLocation): Promise<ApiResponse<LocationUpdateResponse>> => {
    const response = await api.put<ApiResponse<LocationUpdateResponse>>('/Delivery/location', {
      latitude: location.latitude,
      longitude: location.longitude,
      locationAddress: location.address
    });
    return response.data;
  },

  // Get user's saved delivery location
  getLocation: async (): Promise<ApiResponse<LocationUpdateResponse>> => {
    const response = await api.get<ApiResponse<LocationUpdateResponse>>('/Delivery/location');
    return response.data;
  },
};

// Location utilities
export const LocationUtils = {
  // Get current location from browser
  getCurrentLocation: (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      });
    });
  },

  // Get saved location from localStorage
  getSavedLocation: (): UserLocation | null => {
    const saved = localStorage.getItem('userLocation');
    return saved ? JSON.parse(saved) : null;
  },

  // Save location to localStorage
  saveLocation: (location: UserLocation): void => {
    localStorage.setItem('userLocation', JSON.stringify(location));
  },

  // Clear saved location
  clearLocation: (): void => {
    localStorage.removeItem('userLocation');
  },

  // Calculate distance between two points using Haversine formula (client-side)
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal
  },

  // Calculate delivery fee (client-side mirror of backend logic)
  calculateDeliveryFee: (distanceKm: number): number => {
    if (distanceKm <= 0) return 0;
    if (distanceKm > 100) return -1; // Not deliverable
    const roundedDistance = Math.ceil(distanceKm / 10) * 10;
    return (roundedDistance / 10) * 50; // NPR 50 per 10km
  },

  // Check if delivery is possible
  isDeliveryPossible: (distanceKm: number): boolean => {
    return distanceKm > 0 && distanceKm <= 100;
  }
};

// Notification Service
export const DeliveryPersonService = {
  getDashboard: async (): Promise<ApiResponse<DeliveryDashboardStats>> => {
    const response = await api.get<ApiResponse<DeliveryDashboardStats>>('/DeliveryPerson/dashboard');
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<DeliveryPersonProfile>> => {
    const response = await api.get<ApiResponse<DeliveryPersonProfile>>('/DeliveryPerson/profile');
    return response.data;
  },

  getAssignments: async (status?: string): Promise<ApiResponse<DeliveryAssignment[]>> => {
    const params = status ? `?status=${status}` : '';
    const response = await api.get<ApiResponse<DeliveryAssignment[]>>(`/DeliveryPerson/assignments${params}`);
    return response.data;
  },

  getAssignmentById: async (assignmentId: string): Promise<ApiResponse<DeliveryAssignment>> => {
    const response = await api.get<ApiResponse<DeliveryAssignment>>(`/DeliveryPerson/assignments/${assignmentId}`);
    return response.data;
  },

  updateAssignmentStatus: async (assignmentId: string, status: string): Promise<ApiResponse<DeliveryAssignment>> => {
    const response = await api.put<ApiResponse<DeliveryAssignment>>(`/DeliveryPerson/assignments/${assignmentId}/status`, { status });
    return response.data;
  },

  updateAvailability: async (isAvailable: boolean): Promise<ApiResponse<any>> => {
    const response = await api.put<ApiResponse<any>>('/DeliveryPerson/availability', { isAvailable });
    return response.data;
  },

  updateLocation: async (location: UserLocation): Promise<ApiResponse<LocationUpdateResponse>> => {
    const response = await api.put<ApiResponse<LocationUpdateResponse>>('/DeliveryPerson/location', {
      latitude: location.latitude,
      longitude: location.longitude,
      locationAddress: location.address
    });
    return response.data;
  },
};

export const NotificationService = {
  // Get all notifications for the current user
  getNotifications: async (page: number = 1, pageSize: number = 20): Promise<ApiResponse<NotificationListResponse>> => {
    const response = await api.get<ApiResponse<NotificationListResponse>>(`/Notifications?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  // Get unread count
  getUnreadCount: async (): Promise<ApiResponse<number>> => {
    const response = await api.get<ApiResponse<number>>('/Notifications/unread-count');
    return response.data;
  },

  // Mark a notification as read
  markAsRead: async (notificationId: string): Promise<ApiResponse<null>> => {
    const response = await api.put<ApiResponse<null>>(`/Notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<ApiResponse<null>> => {
    const response = await api.put<ApiResponse<null>>('/Notifications/mark-all-read');
    return response.data;
  }
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