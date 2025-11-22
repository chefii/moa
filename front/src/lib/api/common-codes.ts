import apiClient from './client';
import { ApiResponse } from './types';

export interface CommonCode {
  id: string;
  code: string;
  name: string;
  description?: string;
  value: string;
  order: number;
}

// Region type alias for backward compatibility
export type Region = CommonCode;

export const commonCodesApi = {
  // Get common codes by group code
  getByGroup: async (groupCode: string): Promise<CommonCode[]> => {
    const response = await apiClient.get<ApiResponse<CommonCode[]>>(
      `/api/common-codes/group/${groupCode}`
    );
    return response.data.data || [];
  },

  // Alias for getByGroup
  getCommonCodes: async (groupCode: string): Promise<CommonCode[]> => {
    const response = await apiClient.get<ApiResponse<CommonCode[]>>(
      `/api/common-codes/group/${groupCode}`
    );
    return response.data.data || [];
  },

  // Get category types
  getCategoryTypes: async (): Promise<CommonCode[]> => {
    return commonCodesApi.getByGroup('CATEGORY_TYPE');
  },

  // Get regions
  getRegions: async (): Promise<CommonCode[]> => {
    const response = await apiClient.get<ApiResponse<CommonCode[]>>(
      '/api/common-codes/regions'
    );
    return response.data.data || [];
  },

  // Get districts by region code
  getDistricts: async (regionCode: string): Promise<CommonCode[]> => {
    const response = await apiClient.get<ApiResponse<CommonCode[]>>(
      `/api/common-codes/regions/${regionCode}/districts`
    );
    return response.data.data || [];
  },
};
