import apiClient from '../client';
import { Terms } from '../terms';

export interface CreateTermsDto {
  type: string;
  title: string;
  content: string;
  version: string;
  isRequired?: boolean;
  isActive?: boolean;
}

export interface UpdateTermsDto {
  title?: string;
  content?: string;
  version?: string;
  isRequired?: boolean;
  isActive?: boolean;
}

export const termsAdminApi = {
  // 약관 목록 조회 (관리자)
  getTerms: async (params?: {
    type?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    terms: Terms[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> => {
    const response = await apiClient.get('/api/admin/terms', { params });
    return response.data.data;
  },

  // 약관 상세 조회
  getTermsById: async (id: string): Promise<Terms> => {
    const response = await apiClient.get(`/api/admin/terms/${id}`);
    return response.data.data;
  },

  // 약관 생성
  createTerms: async (data: CreateTermsDto): Promise<Terms> => {
    const response = await apiClient.post('/api/admin/terms', data);
    return response.data.data;
  },

  // 약관 수정
  updateTerms: async (id: string, data: UpdateTermsDto): Promise<Terms> => {
    const response = await apiClient.put(`/api/admin/terms/${id}`, data);
    return response.data.data;
  },

  // 약관 삭제
  deleteTerms: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/terms/${id}`);
  },
};
