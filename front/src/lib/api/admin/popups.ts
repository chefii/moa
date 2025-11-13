import apiClient from '../client';
import { ApiResponse } from '../types';

export type PopupType = 'MODAL' | 'BOTTOM_SHEET' | 'TOAST';

export interface Popup {
  id: string;
  type: PopupType;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  buttonText?: string;
  priority: number;
  showOnce: boolean;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PopupListResponse {
  data: Popup[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreatePopupDto {
  type: PopupType;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  buttonText?: string;
  priority?: number;
  showOnce?: boolean;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface UpdatePopupDto {
  type?: PopupType;
  title?: string;
  content?: string;
  imageUrl?: string;
  linkUrl?: string;
  buttonText?: string;
  priority?: number;
  showOnce?: boolean;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export const popupsApi = {
  // Get all popups
  getPopups: async (
    page = 1,
    limit = 10,
    type?: PopupType,
    isActive?: boolean
  ): Promise<PopupListResponse> => {
    let url = `/api/admin/popups?page=${page}&limit=${limit}`;
    if (type) url += `&type=${type}`;
    if (isActive !== undefined) url += `&isActive=${isActive}`;

    const response = await apiClient.get<any>(url);
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  // Get popup by ID
  getPopupById: async (id: string): Promise<Popup> => {
    const response = await apiClient.get<ApiResponse<Popup>>(
      `/api/admin/popups/${id}`
    );
    return response.data.data!;
  },

  // Create popup
  createPopup: async (data: CreatePopupDto): Promise<Popup> => {
    const response = await apiClient.post<ApiResponse<Popup>>(
      '/api/admin/popups',
      data
    );
    return response.data.data!;
  },

  // Update popup
  updatePopup: async (id: string, data: UpdatePopupDto): Promise<Popup> => {
    const response = await apiClient.put<ApiResponse<Popup>>(
      `/api/admin/popups/${id}`,
      data
    );
    return response.data.data!;
  },

  // Delete popup
  deletePopup: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/popups/${id}`);
  },
};
