import apiClient from './client';
import { ApiResponse } from './types';

export interface Category {
  id: string;
  name: string;
  displayName?: string;
  slug: string;
  icon?: string;
  color?: string;
  imageUrl?: string;
  description?: string;
  order: number;
  type?: string[];
  isFeatured?: boolean;
  _count?: {
    gatherings: number;
  };
}

export const categoriesApi = {
  // Get all categories
  getCategories: async (params?: { type?: string; featured?: boolean }): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/api/categories', {
      params,
    });
    return response.data.data!;
  },

  // Get category by slug
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/api/categories/${slug}`);
    return response.data.data!;
  },
};
