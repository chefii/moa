import apiClient from './client';
import { ApiResponse } from './types';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'BUSINESS_ADMIN' | 'SUPER_ADMIN';
  phone?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface UserDetail extends User {
  bio?: string;
  profileImage?: string;
  updatedAt: string;
  userLevel?: {
    level: number;
    growthPoints: number;
  };
  userStreak?: {
    currentStreak: number;
    longestStreak: number;
  };
}

export interface UserListResponse {
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserStatsResponse {
  totalUsers: number;
  roleStats: Record<string, number>;
  recentUsers: number;
}

export const usersApi = {
  // Get all users (Admin only)
  getUsers: async (page = 1, limit = 10): Promise<UserListResponse> => {
    const response = await apiClient.get<any>(
      `/api/users?page=${page}&limit=${limit}`
    );
    // Backend returns { success, data: users[], pagination: {...} } at the same level
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  // Get user by ID (Admin only)
  getUserById: async (userId: string): Promise<UserDetail> => {
    const response = await apiClient.get<ApiResponse<UserDetail>>(`/api/users/${userId}`);
    return response.data.data!;
  },

  // Get user statistics (Admin only)
  getUserStats: async (): Promise<UserStatsResponse> => {
    const response = await apiClient.get<ApiResponse<UserStatsResponse>>('/api/users/stats/overview');
    return response.data.data!;
  },
};
