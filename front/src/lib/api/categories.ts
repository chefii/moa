import apiClient from './client';
import { ApiResponse } from './types';

export interface Category {
  id: string;
  name: string;
  displayName?: string;
  slug: string;
  icon?: string;
  color?: string;
  description?: string;
  order: number;
  type?: string[];
}

export const categoriesApi = {
  // Get all categories
  getCategories: async (params?: { type?: string }): Promise<Category[]> => {
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
