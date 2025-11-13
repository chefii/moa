import apiClient from './client';
import { ApiResponse } from './types';

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  category: string;
  label: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface FooterLink {
  id: string;
  title: string;
  url: string;
  order: number;
  isExternal: boolean;
  isActive: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export const settingsApi = {
  // Get all site settings
  getSiteSettings: async (category?: string): Promise<SiteSetting[]> => {
    const url = category
      ? `/api/settings/site-settings?category=${category}`
      : '/api/settings/site-settings';
    const response = await apiClient.get<ApiResponse<SiteSetting[]>>(url);
    return response.data.data!;
  },

  // Get settings by category as key-value object
  getSettingsByCategory: async (category: string): Promise<Record<string, string>> => {
    const response = await apiClient.get<ApiResponse<Record<string, string>>>(
      `/api/settings/site-settings/category/${category}`
    );
    return response.data.data!;
  },

  // Get footer links
  getFooterLinks: async (category?: string, includeInactive = false): Promise<FooterLink[]> => {
    let url = `/api/settings/footer-links?includeInactive=${includeInactive}`;
    if (category) url += `&category=${category}`;

    const response = await apiClient.get<ApiResponse<FooterLink[]>>(url);
    return response.data.data!;
  },
};
