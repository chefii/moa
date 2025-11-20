import apiClient from './client';
import { ApiResponse } from './types';

export type BannerType = 'MAIN_BANNER' | 'MAIN_TOP' | 'MAIN_MIDDLE' | 'MAIN_BOTTOM' | 'EVENT' | 'POPUP';

export interface Banner {
  id: string;
  type: BannerType;
  title: string;
  description?: string;
  image: {
    id: string;
    url: string;
  };
  linkUrl?: string;
  order: number;
}

export const bannersApi = {
  // Get active banners (public API)
  getActiveBanners: async (type?: BannerType): Promise<Banner[]> => {
    let url = '/api/banners/active';
    if (type) url += `?type=${type}`;

    const response = await apiClient.get<ApiResponse<Banner[]>>(url);
    return response.data.data || [];
  },

  // Increment view count
  incrementView: async (id: string): Promise<void> => {
    await apiClient.post(`/api/banners/${id}/view`);
  },

  // Increment click count
  incrementClick: async (id: string): Promise<void> => {
    await apiClient.post(`/api/banners/${id}/click`);
  },
};
