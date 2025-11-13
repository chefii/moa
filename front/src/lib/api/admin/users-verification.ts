import apiClient from '../client';
import { ApiResponse } from '../types';

export interface VerificationStats {
  total: number;
  emailVerified: {
    count: number;
    percentage: string;
  };
  phoneVerified: {
    count: number;
    percentage: string;
  };
  bothVerified: {
    count: number;
    percentage: string;
  };
  notVerified: {
    count: number;
    percentage: string;
  };
}

export interface UnverifiedUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  isVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
}

export interface UnverifiedUsersResponse {
  data: UnverifiedUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const usersVerificationApi = {
  // 사용자 인증 상태 수동 변경
  updateVerificationStatus: async (
    userId: string,
    data: {
      isVerified?: boolean;
      isPhoneVerified?: boolean;
    }
  ): Promise<any> => {
    const response = await apiClient.patch<ApiResponse<any>>(
      `/api/admin/users-verification/${userId}/verification`,
      data
    );
    return response.data.data!;
  },

  // 인증 이메일 재발송
  resendVerificationEmail: async (userId: string): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/api/admin/users-verification/${userId}/resend-email`
    );
    return response.data.data!;
  },

  // 인증 통계 조회
  getVerificationStats: async (): Promise<VerificationStats> => {
    const response = await apiClient.get<ApiResponse<VerificationStats>>(
      '/api/admin/users-verification/stats'
    );
    return response.data.data!;
  },

  // 미인증 사용자 목록 조회
  getUnverifiedUsers: async (
    page = 1,
    limit = 20
  ): Promise<UnverifiedUsersResponse> => {
    const response = await apiClient.get<any>(
      `/api/admin/users-verification/unverified?page=${page}&limit=${limit}`
    );
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },
};
