import apiClient from './client';
import { ApiResponse } from './types';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  description?: string;
  order: number;
}

export const categoriesApi = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/api/categories');
    return response.data.data!;
  },

  // Get category by slug
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/api/categories/${slug}`);
    return response.data.data!;
  },
};
