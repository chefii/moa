import apiClient from '../client';
import { ApiResponse } from '../types';

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryListResponse {
  data: Category[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
}

export const categoriesApi = {
  // Get all categories
  getCategories: async (
    page = 1,
    limit = 10,
    isActive?: boolean
  ): Promise<CategoryListResponse> => {
    let url = `/api/admin/categories?page=${page}&limit=${limit}`;
    if (isActive !== undefined) url += `&isActive=${isActive}`;

    const response = await apiClient.get<any>(url);
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  // Get category by ID
  getCategoryById: async (id: string): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(
      `/api/admin/categories/${id}`
    );
    return response.data.data!;
  },

  // Create category
  createCategory: async (data: CreateCategoryDto): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>(
      '/api/admin/categories',
      data
    );
    return response.data.data!;
  },

  // Update category
  updateCategory: async (
    id: string,
    data: UpdateCategoryDto
  ): Promise<Category> => {
    const response = await apiClient.put<ApiResponse<Category>>(
      `/api/admin/categories/${id}`,
      data
    );
    return response.data.data!;
  },

  // Delete category
  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/categories/${id}`);
  },
};
