import apiClient from '../client';
import { ApiResponse } from '../types';

export type BannerType = 'MAIN_TOP' | 'MAIN_MIDDLE' | 'MAIN_BOTTOM' | 'EVENT' | 'POPUP';

export interface Banner {
  id: string;
  type: BannerType;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  order: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  viewCount: number;
  clickCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BannerListResponse {
  data: Banner[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateBannerDto {
  type: BannerType;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  order?: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface UpdateBannerDto {
  type?: BannerType;
  title?: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  order?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export const bannersApi = {
  // Get all banners
  getBanners: async (
    page = 1,
    limit = 10,
    type?: BannerType,
    isActive?: boolean
  ): Promise<BannerListResponse> => {
    let url = `/api/admin/banners?page=${page}&limit=${limit}`;
    if (type) url += `&type=${type}`;
    if (isActive !== undefined) url += `&isActive=${isActive}`;

    const response = await apiClient.get<any>(url);
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  // Get banner by ID
  getBannerById: async (id: string): Promise<Banner> => {
    const response = await apiClient.get<ApiResponse<Banner>>(
      `/api/admin/banners/${id}`
    );
    return response.data.data!;
  },

  // Create banner
  createBanner: async (data: CreateBannerDto): Promise<Banner> => {
    const response = await apiClient.post<ApiResponse<Banner>>(
      '/api/admin/banners',
      data
    );
    return response.data.data!;
  },

  // Update banner
  updateBanner: async (id: string, data: UpdateBannerDto): Promise<Banner> => {
    const response = await apiClient.put<ApiResponse<Banner>>(
      `/api/admin/banners/${id}`,
      data
    );
    return response.data.data!;
  },

  // Delete banner
  deleteBanner: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/banners/${id}`);
  },

  // Increment view count
  incrementView: async (id: string): Promise<void> => {
    await apiClient.post(`/api/admin/banners/${id}/view`);
  },

  // Increment click count
  incrementClick: async (id: string): Promise<void> => {
    await apiClient.post(`/api/admin/banners/${id}/click`);
  },
};
