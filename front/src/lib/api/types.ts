import { UserRole } from '@/store/authStore';

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
  };
  token: string;
  refreshToken?: string;
}

// User types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profileImage?: string;
  bio?: string;
  phone?: string;
  createdAt: string;
}

// Trust System types
export interface UserLevelResponse {
  level: number;
  growthPoints: number;
  nextLevelPoints: number;
}

export interface BadgeResponse {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'BASIC' | 'HOST' | 'SPECIAL' | 'SEASONAL';
  icon: string;
  earnedAt?: string;
}

export interface UserStreakResponse {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}

export interface UserPointsResponse {
  current: number;
  monthlyEarned: number;
  totalEarned: number;
}

export interface PointTransaction {
  id: string;
  type: 'EARN' | 'SPEND';
  amount: number;
  description: string;
  createdAt: string;
}
