import React from 'react';

export enum UserRole {
  CONSUMER = 'Consumer',
  FARMER = 'Farmer',
  ADMIN = 'Admin',
  DELIVERY_PERSON = 'DeliveryPerson'
}

export enum ApprovalStatus {
  NOT_APPLICABLE = 'NotApplicable',
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  approvalStatus?: ApprovalStatus;
  phoneNumber?: string;
  farmName?: string;
  district?: string;
  farmAddress?: string;
  cropTypes?: string;
  farmPhotoUrl?: string;
  identityProofUrl?: string;
  latitude?: number;
  longitude?: number;
  locationAddress?: string;
  fullName?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  isAvailableForDelivery?: boolean;
}

export interface PendingFarmer {
  id: string;
  username: string;
  email: string;
  farmName?: string;
  district?: string;
  farmAddress?: string;
  cropTypes?: string;
  farmPhotoUrl?: string;
  identityProofUrl?: string;
  phoneNumber?: string;
  createdAt: string;
}

export interface FarmerApprovalResult {
  farmerId: string;
  username: string;
  email: string;
  status: string;
  approvalDate?: string;
}

export interface AuthResponseData {
  token: string;
  refreshToken: string;
  user: User;
  expiresAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface RegisterResponseData {
  userId: string;
  username: string;
  email: string;
  role: string;
  farmName?: string;
}

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  unit: string;
  category: string;
  imageUrl?: string;
  isActive: boolean;
  isOrganic: boolean;
  distanceKm: number;
  deliveryFee?: number;
  canDeliver: boolean;
  farmerId: string;
  farmerName: string;
  farmName?: string;
  farmerLatitude?: number;
  farmerLongitude?: number;
  averageRating: number;
  totalRatings: number;
  userRating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRating {
  id: string;
  productId: string;
  userId: string;
  username: string;
  rating: number;
  review?: string;
  createdAt: string;
}

export interface RatingListResponse {
  ratings: ProductRating[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductRatingSummary {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: number[];
}

export interface ProductListResponse {
  products: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductFilter {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  maxDistance?: number;
  isOrganic?: boolean;
  sortBy?: 'name' | 'price' | 'newest' | 'distance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  // Consumer location for distance calculation
  consumerLatitude?: number;
  consumerLongitude?: number;
  // If true, only show products from farms within delivery range (40km)
  enforceDeliveryLimit?: boolean;
}

// Location types
export interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface LocationUpdateResponse {
  success: boolean;
  latitude?: number;
  longitude?: number;
  locationAddress?: string;
  message: string;
}

// Delivery types
export interface CartItemForDelivery {
  productId: string;
  quantity: number;
}

export interface CalculateDeliveryRequest {
  consumerLatitude: number;
  consumerLongitude: number;
  cartItems: CartItemForDelivery[];
}

export interface FarmerDeliveryInfo {
  farmerId: string;
  farmerName: string;
  farmName?: string;
  distanceKm: number;
  deliveryFee: number;
  productNames: string[];
}

export interface UndeliverableProduct {
  productId: string;
  productName: string;
  farmerName: string;
  distanceKm: number;
  reason: string;
}

export interface DeliveryFeeResponse {
  canDeliver: boolean;
  totalDeliveryFee: number;
  farmerDeliveries: FarmerDeliveryInfo[];
  undeliverableProducts: UndeliverableProduct[];
  message: string;
}

export interface DeliveryPriceExample {
  distanceRange: string;
  fee: number;
}

export interface DeliveryPricingInfo {
  maxDistanceKm: number;
  baseRatePer10Km: number;
  currency: string;
  pricingRules: string[];
  examples: DeliveryPriceExample[];
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  unit: string;
  category: string;
  isOrganic?: boolean;
  distanceKm?: number;
  image?: File;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  unit?: string;
  category?: string;
  isActive?: boolean;
  isOrganic?: boolean;
  distanceKm?: number;
  image?: File;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  isPublished: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  farmerId: string;
  farmerName: string;
  farmName?: string;
  farmerPhotoUrl?: string;
  district?: string;
  productId?: string;
  productName?: string;
  productImageUrl?: string;
  productPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userRole: string;
  storyId: string;
  createdAt: string;
}

export interface CommentListResponse {
  comments: Comment[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface StoryListResponse {
  stories: Story[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface StoryFilter {
  search?: string;
  farmerId?: string;
  productId?: string;
  sortBy?: 'newest' | 'popular' | 'views';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface CreateStoryDto {
  title: string;
  content: string;
  productId?: string;
  isPublished?: boolean;
  image?: File;
  videoUrl?: string;
}

export interface UpdateStoryDto {
  title?: string;
  content?: string;
  productId?: string;
  isPublished?: boolean;
  image?: File;
  videoUrl?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  unit: string;
}

export interface Order {
  id: string;
  consumerName: string;
  consumerId: string;
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  orderDate: string;
  items: OrderItem[];
  deliveryAddress: string;
  paymentStatus: 'Pending' | 'Paid';
}

// New order types for API
export interface DeliveryAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  landmark?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateOrderItem {
  productId: string;
  farmerId: string;
  name: string;
  imageUrl?: string;
  farmName?: string;
  quantity: number;
  price: number;
  unit: string;
  distanceKm?: number;
  deliveryFee?: number;
}

export interface CreateOrderRequest {
  items: CreateOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: DeliveryAddress;
  paymentMethod?: string;
  deliveryDetails?: FarmerDeliveryInfo[];
}

export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  productImageUrl?: string;
  farmerId: string;
  farmName?: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  subtotal: number;
  deliveryFee: number;
  distanceKm?: number;
  itemStatus: string;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  consumerId: string;
  consumerName: string;
  orderDate: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryStatus?: string;
  deliveryPartnerName?: string;
  deliveryAssignedAt?: string;
  deliveryAddress: DeliveryAddress;
  items: OrderItemResponse[];
}

export interface FarmerOrderItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl?: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  subtotal: number;
  itemStatus: string;
}

export interface FarmerOrder {
  orderId: string;
  orderNumber: string;
  consumerName: string;
  consumerPhone: string;
  orderDate: string;
  orderStatus: string;
  deliveryStatus?: string;
  deliveryPartnerName?: string;
  deliveryAssignedAt?: string;
  deliveryAddress: DeliveryAddress;
  items: FarmerOrderItem[];
  itemsSubtotal: number;
  deliveryFee: number;
  total: number;
  distanceKm?: number;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string; // info, success, warning, error, order
  relatedEntityId?: string;
  relatedEntityType?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  totalCount: number;
  unreadCount: number;
}

// Admin Dashboard Types
export interface AdminDashboardStats {
  totalUsers: number;
  totalFarmers: number;
  totalConsumers: number;
  pendingFarmers: number;
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  organicProducts: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  todayRevenue: number;
  todayOrders: number;
  todayNewUsers: number;
  totalStories: number;
  totalRatings: number;
  averageRating: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  consumerName: string;
  consumerEmail: string;
  totalAmount: number;
  deliveryFee: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  itemCount: number;
  farmerNames: string[];
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  role: string;
  approvalStatus: string;
  phoneNumber?: string;
  address?: string;
  profilePictureUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

export interface TopFarmer {
  id: string;
  username: string;
  fullName?: string;
  email: string;
  profilePictureUrl?: string;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  joinedAt: string;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  imageUrl?: string;
  farmerName: string;
  totalSold: number;
  totalRevenue: number;
  averageRating: number;
  ratingCount: number;
  stock: number;
  isOrganic: boolean;
}

export interface RevenueAnalytics {
  dailyRevenue: DailyRevenue[];
  categoryRevenue: CategoryRevenue[];
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
  orderCount: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Growth Analytics
export interface DailyGrowth {
  date: string;
  count: number;
}

export interface GrowthAnalytics {
  dailyUserRegistrations: DailyGrowth[];
  dailyOrderCounts: DailyGrowth[];
}

// Platform Health
export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  farmerName: string;
  category: string;
  imageUrl?: string;
}

export interface PeakHour {
  hour: number;
  orderCount: number;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface PlatformHealth {
  lowStockProducts: LowStockProduct[];
  peakHours: PeakHour[];
  thisWeekRevenue: number;
  lastWeekRevenue: number;
  thisWeekOrders: number;
  lastWeekOrders: number;
  productsByCategory: CategoryCount[];
}

// Delivery Person Types

export interface RegisterDeliveryPersonData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  fullName: string;
  vehicleType: string;
  vehicleNumber?: string;
  latitude: number;
  longitude: number;
  locationAddress?: string;
}

export interface DeliveryAssignment {
  id: string;
  orderId: string;
  orderNumber: string;
  deliveryPersonId: string;
  status: 'Pending' | 'Accepted' | 'PickedUp' | 'InTransit' | 'Delivered' | 'Rejected';
  distanceToPickupKm: number;
  distanceToDeliveryKm: number;
  totalDistanceKm: number;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupAddress?: string;
  dropoffLatitude: number;
  dropoffLongitude: number;
  dropoffAddress?: string;
  consumerName: string;
  consumerPhone: string;
  farmerName: string;
  farmName?: string;
  orderTotal: number;
  deliveryFee: number;
  itemCount: number;
  createdAt: string;
  acceptedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
}

export interface DeliveryDashboardStats {
  totalAssignments: number;
  pendingAssignments: number;
  activeDeliveries: number;
  completedDeliveries: number;
  rejectedAssignments: number;
  totalDistanceKm: number;
  totalEarnings: number;
  todayDeliveries: number;
  todayEarnings: number;
  isAvailable: boolean;
}

export interface DeliveryPersonProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  vehicleType: string;
  vehicleNumber?: string;
  isAvailableForDelivery: boolean;
  latitude?: number;
  longitude?: number;
  locationAddress?: string;
  lastLocationUpdate?: string;
  totalDeliveries: number;
  totalEarnings: number;
  joinedAt: string;
}

// Demand Prediction Types
export interface TopCropsPredictionRequest {
  month: number;
  year: number;
  topN: number;
}

export interface TopCropPrediction {
  commodityName: string;
  predictedDemand?: number;
  confidenceScore?: number;
}

export interface TopCropsPredictionResponse {
  topCrops: TopCropPrediction[];
}

export interface DemandGatewayHealth {
  api: {
    status: string;
  };
  python: {
    status: string;
    statusCode: number;
    message: string;
  };
}