import apiClient from '../client';
import { ApiResponse } from '../types';

export type GatheringStatus = 'RECRUITING' | 'FULL' | 'COMPLETED' | 'CANCELLED';
export type GatheringType = 'FREE' | 'PAID';

export interface Gathering {
  id: string;
  hostId: string;
  categoryId: string;
  title: string;
  description: string;
  gatheringType: GatheringType;
  imageId?: string;
  locationAddress: string;
  locationDetail?: string;
  latitude?: string;
  longitude?: string;
  scheduledAt: string;
  durationMinutes: number;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  depositAmount: number;
  status: GatheringStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  host: {
    id: string;
    email: string;
    nickname: string;
  };
  category: {
    id: string;
    name: string;
  };
  image?: {
    id: string;
    url: string;
  };
  _count: {
    participants: number;
    reviews: number;
  };
}

export interface GatheringListResponse {
  data: Gathering[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UpdateGatheringDto {
  status?: GatheringStatus;
  title?: string;
  description?: string;
  maxParticipants?: number;
  price?: number;
}

export const gatheringsApi = {
  // Get all gatherings
  getGatherings: async (
    page = 1,
    limit = 10,
    status?: GatheringStatus,
    categoryId?: string,
    search?: string
  ): Promise<GatheringListResponse> => {
    let url = `/api/admin/gatherings?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (categoryId) url += `&categoryId=${categoryId}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const response = await apiClient.get<any>(url);
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  // Get gathering by ID
  getGatheringById: async (id: string): Promise<Gathering> => {
    const response = await apiClient.get<ApiResponse<Gathering>>(
      `/api/admin/gatherings/${id}`
    );
    return response.data.data!;
  },

  // Update gathering
  updateGathering: async (id: string, data: UpdateGatheringDto): Promise<Gathering> => {
    const response = await apiClient.put<ApiResponse<Gathering>>(
      `/api/admin/gatherings/${id}`,
      data
    );
    return response.data.data!;
  },

  // Delete gathering
  deleteGathering: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/gatherings/${id}`);
  },

  // Get stats
  getStats: async (): Promise<{
    total: number;
    recruiting: number;
    full: number;
    completed: number;
    cancelled: number;
  }> => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/api/admin/gatherings/stats/overview'
    );
    return response.data.data!;
  },
};
