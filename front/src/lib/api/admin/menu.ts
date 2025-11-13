import apiClient from '../client';
import { ApiResponse } from '../types';

export interface MenuCategory {
  id: string;
  name: string;
  nameEn?: string;
  icon?: string;
  order: number;
  isActive: boolean;
  description?: string;
  requiredRoles: string[];
  createdAt: string;
  updatedAt: string;
  menuItems?: MenuItem[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  category?: MenuCategory;
  name: string;
  nameEn?: string;
  path: string;
  icon?: string;
  order: number;
  isActive: boolean;
  badge?: number;
  description?: string;
  requiredRoles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuCategoryDto {
  name: string;
  nameEn?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
  description?: string;
  requiredRoles?: string[];
}

export interface UpdateMenuCategoryDto {
  name?: string;
  nameEn?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
  description?: string;
  requiredRoles?: string[];
}

export interface CreateMenuItemDto {
  categoryId: string;
  name: string;
  nameEn?: string;
  path: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
  badge?: number;
  description?: string;
  requiredRoles?: string[];
}

export interface UpdateMenuItemDto {
  categoryId?: string;
  name?: string;
  nameEn?: string;
  path?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
  badge?: number;
  description?: string;
  requiredRoles?: string[];
}

// Menu Categories API
export const menuCategoriesApi = {
  // Get all menu categories
  getMenuCategories: async (includeInactive = false): Promise<MenuCategory[]> => {
    const url = `/api/admin/menu-categories?includeInactive=${includeInactive}`;
    const response = await apiClient.get<ApiResponse<MenuCategory[]>>(url);
    return response.data.data!;
  },

  // Get menu category by ID
  getMenuCategoryById: async (id: string): Promise<MenuCategory> => {
    const response = await apiClient.get<ApiResponse<MenuCategory>>(
      `/api/admin/menu-categories/${id}`
    );
    return response.data.data!;
  },

  // Create menu category
  createMenuCategory: async (data: CreateMenuCategoryDto): Promise<MenuCategory> => {
    const response = await apiClient.post<ApiResponse<MenuCategory>>(
      '/api/admin/menu-categories',
      data
    );
    return response.data.data!;
  },

  // Update menu category
  updateMenuCategory: async (
    id: string,
    data: UpdateMenuCategoryDto
  ): Promise<MenuCategory> => {
    const response = await apiClient.put<ApiResponse<MenuCategory>>(
      `/api/admin/menu-categories/${id}`,
      data
    );
    return response.data.data!;
  },

  // Delete menu category
  deleteMenuCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/menu-categories/${id}`);
  },
};

// Menu Items API
export const menuItemsApi = {
  // Get all menu items
  getMenuItems: async (
    categoryId?: string,
    includeInactive = false
  ): Promise<MenuItem[]> => {
    let url = `/api/admin/menu-items?includeInactive=${includeInactive}`;
    if (categoryId) url += `&categoryId=${categoryId}`;

    const response = await apiClient.get<ApiResponse<MenuItem[]>>(url);
    return response.data.data!;
  },

  // Get menu item by ID
  getMenuItemById: async (id: string): Promise<MenuItem> => {
    const response = await apiClient.get<ApiResponse<MenuItem>>(
      `/api/admin/menu-items/${id}`
    );
    return response.data.data!;
  },

  // Create menu item
  createMenuItem: async (data: CreateMenuItemDto): Promise<MenuItem> => {
    const response = await apiClient.post<ApiResponse<MenuItem>>(
      '/api/admin/menu-items',
      data
    );
    return response.data.data!;
  },

  // Update menu item
  updateMenuItem: async (id: string, data: UpdateMenuItemDto): Promise<MenuItem> => {
    const response = await apiClient.put<ApiResponse<MenuItem>>(
      `/api/admin/menu-items/${id}`,
      data
    );
    return response.data.data!;
  },

  // Delete menu item
  deleteMenuItem: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/menu-items/${id}`);
  },
};
