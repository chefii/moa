import apiClient from '../client';
import { ApiResponse } from '../types';

export interface CommonCode {
  id: string;
  groupCode: string;
  code: string;
  name: string;
  description?: string;
  value?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommonCodeListResponse {
  data: CommonCode[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateCommonCodeDto {
  groupCode: string;
  code: string;
  name: string;
  description?: string;
  value?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateCommonCodeDto {
  groupCode?: string;
  code?: string;
  name?: string;
  description?: string;
  value?: string;
  order?: number;
  isActive?: boolean;
}

export const commonCodesApi = {
  // Get all common codes
  getCommonCodes: async (
    page = 1,
    limit = 10,
    groupCode?: string
  ): Promise<CommonCodeListResponse> => {
    let url = `/api/admin/common-codes?page=${page}&limit=${limit}`;
    if (groupCode) {
      url += `&groupCode=${groupCode}`;
    }
    const response = await apiClient.get<any>(url);
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  // Get unique group codes
  getGroupCodes: async (): Promise<string[]> => {
    const response = await apiClient.get<ApiResponse<string[]>>(
      '/api/admin/common-codes/groups/list'
    );
    return response.data.data!;
  },

  // Get common code by ID
  getCommonCodeById: async (id: string): Promise<CommonCode> => {
    const response = await apiClient.get<ApiResponse<CommonCode>>(
      `/api/admin/common-codes/${id}`
    );
    return response.data.data!;
  },

  // Create common code
  createCommonCode: async (data: CreateCommonCodeDto): Promise<CommonCode> => {
    const response = await apiClient.post<ApiResponse<CommonCode>>(
      '/api/admin/common-codes',
      data
    );
    return response.data.data!;
  },

  // Update common code
  updateCommonCode: async (
    id: string,
    data: UpdateCommonCodeDto
  ): Promise<CommonCode> => {
    const response = await apiClient.put<ApiResponse<CommonCode>>(
      `/api/admin/common-codes/${id}`,
      data
    );
    return response.data.data!;
  },

  // Delete common code
  deleteCommonCode: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/common-codes/${id}`);
  },
};
