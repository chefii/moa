import apiClient from './client';
import {
  ApiResponse,
  UserLevelResponse,
  BadgeResponse,
  UserStreakResponse,
  UserPointsResponse,
  PointTransaction,
} from './types';

export const trustApi = {
  // Get user level
  getUserLevel: async (userId?: string): Promise<UserLevelResponse> => {
    const url = userId ? `/api/trust/level/${userId}` : '/api/trust/level/me';
    const response = await apiClient.get<ApiResponse<UserLevelResponse>>(url);
    return response.data.data!;
  },

  // Get user badges
  getUserBadges: async (userId?: string): Promise<BadgeResponse[]> => {
    const url = userId ? `/api/trust/badges/${userId}` : '/api/trust/badges/me';
    const response = await apiClient.get<ApiResponse<BadgeResponse[]>>(url);
    return response.data.data!;
  },

  // Get all available badges
  getAllBadges: async (): Promise<BadgeResponse[]> => {
    const response = await apiClient.get<ApiResponse<BadgeResponse[]>>('/api/trust/badges');
    return response.data.data!;
  },

  // Get user streak
  getUserStreak: async (userId?: string): Promise<UserStreakResponse> => {
    const url = userId ? `/api/trust/streak/${userId}` : '/api/trust/streak/me';
    const response = await apiClient.get<ApiResponse<UserStreakResponse>>(url);
    return response.data.data!;
  },

  // Get user points
  getUserPoints: async (userId?: string): Promise<UserPointsResponse> => {
    const url = userId ? `/api/trust/points/${userId}` : '/api/trust/points/me';
    const response = await apiClient.get<ApiResponse<UserPointsResponse>>(url);
    return response.data.data!;
  },

  // Get point transactions
  getPointTransactions: async (limit = 10): Promise<PointTransaction[]> => {
    const response = await apiClient.get<ApiResponse<PointTransaction[]>>(
      `/api/trust/points/transactions?limit=${limit}`
    );
    return response.data.data!;
  },
};
