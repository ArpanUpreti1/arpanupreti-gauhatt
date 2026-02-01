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
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  unit: string;
  imageUrl?: string;
  isActive: boolean;
  farmerId?: string;
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