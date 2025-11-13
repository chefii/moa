import apiClient from './client';
import { ApiResponse } from './types';

export interface CommonCode {
  id: string;
  code: string;
  name: string;
  description?: string;
  value?: string;
  order: number;
}

export interface Region {
  code: string;
  name: string;
  order: number;
}

export const commonCodesApi = {
  // Get common codes by group
  getCodesByGroup: async (groupCode: string): Promise<CommonCode[]> => {
    const response = await apiClient.get<ApiResponse<CommonCode[]>>(
      `/api/common-codes/group/${groupCode}`
    );
    return response.data.data!;
  },

  // Get all regions (metro)
  getRegions: async (): Promise<Region[]> => {
    const response = await apiClient.get<ApiResponse<Region[]>>('/api/common-codes/regions');
    return response.data.data!;
  },

  // Get districts by region code
  getDistricts: async (regionCode: string): Promise<Region[]> => {
    const response = await apiClient.get<ApiResponse<Region[]>>(
      `/api/common-codes/regions/${regionCode}/districts`
    );
    return response.data.data!;
  },
};
