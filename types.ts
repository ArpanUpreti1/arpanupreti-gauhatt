import React from 'react';

export enum UserRole {
  CONSUMER = 'Consumer',
  FARMER = 'Farmer',
  ADMIN = 'Admin'
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
  // If true, only show products from farms within delivery range (100km)
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