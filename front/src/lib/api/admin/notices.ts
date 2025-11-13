import apiClient from '../client';
import { ApiResponse } from '../types';

export type NoticeType = 'GENERAL' | 'IMPORTANT' | 'MAINTENANCE' | 'EVENT';

export interface Notice {
  id: string;
  type: NoticeType;
  title: string;
  content: string;
  isPinned: boolean;
  viewCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeListResponse {
  data: Notice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateNoticeDto {
  type: NoticeType;
  title: string;
  content: string;
  isPinned?: boolean;
}

export interface UpdateNoticeDto {
  type?: NoticeType;
  title?: string;
  content?: string;
  isPinned?: boolean;
}

export const noticesApi = {
  // Get all notices
  getNotices: async (
    page = 1,
    limit = 10,
    type?: NoticeType,
    isPinned?: boolean
  ): Promise<NoticeListResponse> => {
    let url = `/api/admin/notices?page=${page}&limit=${limit}`;
    if (type) url += `&type=${type}`;
    if (isPinned !== undefined) url += `&isPinned=${isPinned}`;

    const response = await apiClient.get<any>(url);
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  // Get notice by ID
  getNoticeById: async (id: string): Promise<Notice> => {
    const response = await apiClient.get<ApiResponse<Notice>>(
      `/api/admin/notices/${id}`
    );
    return response.data.data!;
  },

  // Create notice
  createNotice: async (data: CreateNoticeDto): Promise<Notice> => {
    const response = await apiClient.post<ApiResponse<Notice>>(
      '/api/admin/notices',
      data
    );
    return response.data.data!;
  },

  // Update notice
  updateNotice: async (id: string, data: UpdateNoticeDto): Promise<Notice> => {
    const response = await apiClient.put<ApiResponse<Notice>>(
      `/api/admin/notices/${id}`,
      data
    );
    return response.data.data!;
  },

  // Delete notice
  deleteNotice: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/notices/${id}`);
  },
};
