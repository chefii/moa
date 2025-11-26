import apiClient from './client';

export interface Terms {
  id: string;
  type: string;
  title: string;
  content: string;
  version: string;
  isActive: boolean;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TermsType {
  id: string;
  groupCode: string;
  code: string;
  name: string;
  description: string | null;
  order: number;
}

export const termsApi = {
  // 약관 타입 목록 조회
  getTermsTypes: async (): Promise<TermsType[]> => {
    const response = await apiClient.get('/api/terms/types');
    return response.data.data;
  },

  // 타입별 최신 약관 조회
  getTermsByType: async (type: string): Promise<Terms> => {
    const response = await apiClient.get(`/api/terms/type/${type}`);
    return response.data.data;
  },

  // 모든 활성 약관 조회
  getAllTerms: async (): Promise<Terms[]> => {
    const response = await apiClient.get('/api/terms');
    return response.data.data;
  },

  // 약관 ID로 조회
  getTermsById: async (id: string): Promise<Terms> => {
    const response = await apiClient.get(`/api/terms/${id}`);
    return response.data.data;
  },
};
