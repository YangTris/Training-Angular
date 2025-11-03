/**
 * Authentication related models
 */

import { Order } from './order.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  userId: string;
  email: string;
  roles?: string[]; // Roles will be decoded from JWT token
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  phoneNumber?: string;
  orderDetails?: Order[];
}
