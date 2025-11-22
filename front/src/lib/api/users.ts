import apiClient from './client';
import { ApiResponse } from './types';

export interface UserSso {
  provider: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  nickname?: string;
  role: string; // Flexible role from CommonCode
  phone?: string;
  location?: string;
  isVerified: boolean;
  isPhoneVerified?: boolean;
  emailVerifiedAt?: string;
  phoneVerifiedAt?: string;
  createdAt: string;
  userSso?: UserSso[];
  hasPassword?: boolean; // true if user signed up with email/password
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
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
  interests?: {
    category: Category;
  }[];
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

  // Update user profile
  updateProfile: async (data: {
    name?: string;
    nickname?: string;
    phone?: string;
    location?: string;
    bio?: string;
    gender?: string;
    age?: number;
  }): Promise<UserDetail> => {
    const response = await apiClient.put<ApiResponse<UserDetail>>('/api/auth/profile', data);
    return response.data.data!;
  },

  // Upload profile image
  uploadProfileImage: async (file: File): Promise<{ url: string; id: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.put<ApiResponse<{ profileImage: { url: string; id: string } }>>(
      '/api/users/me/profile-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data!.profileImage;
  },

  // Upload background images
  uploadBackgroundImages: async (files: File[]): Promise<{ id: string; url: string; order: number }[]> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await apiClient.post<ApiResponse<{ images: { id: string; url: string; order: number }[] }>>(
      '/api/users/me/background-images',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data!.images;
  },

  // Get background images
  getBackgroundImages: async (): Promise<{ id: string; url: string; order: number }[]> => {
    const response = await apiClient.get<ApiResponse<{ id: string; url: string; order: number }[]>>(
      '/api/users/me/background-images'
    );
    return response.data.data!;
  },

  // Delete background image
  deleteBackgroundImage: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/users/me/background-images/${id}`);
  },
};
