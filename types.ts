import React from 'react';

export enum UserRole {
  USER = 'USER',
  FARMER = 'FARMER'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  location?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}