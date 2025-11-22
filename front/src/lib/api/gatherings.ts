import apiClient from './client';
import { ApiResponse } from './types';

export type GatheringType = 'FREE' | 'PAID_CLASS' | 'DEPOSIT';
export type GatheringStatus = 'RECRUITING' | 'FULL' | 'COMPLETED' | 'CANCELLED';

export interface CreateGatheringDto {
  title: string;
  description: string;
  categoryId: string;
  imageId?: string;
  gatheringType?: GatheringType;
  locationAddress: string;
  locationDetail?: string;
  latitude?: number;
  longitude?: number;
  scheduledAt: string;
  durationMinutes?: number;
  maxParticipants: number;
  price?: number;
  depositAmount?: number;
  tags?: string[];
}

export interface UpdateGatheringDto {
  title?: string;
  description?: string;
  imageId?: string;
  locationAddress?: string;
  locationDetail?: string;
  latitude?: number;
  longitude?: number;
  scheduledAt?: string;
  durationMinutes?: number;
  maxParticipants?: number;
  price?: number;
  depositAmount?: number;
  tags?: string[];
  status?: GatheringStatus;
}

export interface Gathering {
  id: string;
  hostId: string;
  categoryId: string;
  title: string;
  description: string;
  gatheringType: GatheringType;
  imageId?: string;
  image?: {
    id: string;
    url: string;
    savedName: string;
  };
  locationAddress: string;
  locationDetail?: string;
  latitude?: number;
  longitude?: number;
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
  host?: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
    bio?: string;
  };
  category?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
    description?: string;
  };
  participants?: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      profileImage?: string;
    };
  }>;
  _count?: {
    participants: number;
    bookmarks: number;
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

export const gatheringsApi = {
  // 모임 생성
  createGathering: async (data: CreateGatheringDto): Promise<Gathering> => {
    const response = await apiClient.post<ApiResponse<Gathering>>('/api/gatherings', data);
    return response.data.data!;
  },

  // 모임 목록 조회
  getGatherings: async (params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    status?: GatheringStatus;
    sort?: 'recent' | 'popular' | 'upcoming';
    cityCode?: string;
    districtCode?: string;
  }): Promise<GatheringListResponse> => {
    const response = await apiClient.get<ApiResponse<Gathering[]>>('/api/gatherings', {
      params,
    });
    return {
      data: response.data.data || [],
      pagination: response.data.pagination || {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      },
    };
  },

  // 모임 상세 조회
  getGatheringById: async (id: string): Promise<Gathering> => {
    const response = await apiClient.get<ApiResponse<Gathering>>(`/api/gatherings/${id}`);
    return response.data.data!;
  },

  // 모임 수정
  updateGathering: async (id: string, data: UpdateGatheringDto): Promise<Gathering> => {
    const response = await apiClient.put<ApiResponse<Gathering>>(`/api/gatherings/${id}`, data);
    return response.data.data!;
  },

  // 모임 삭제
  deleteGathering: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/gatherings/${id}`);
  },

  // 모임 통계 조회 (관리자용)
  getGatheringStats: async (): Promise<{
    totalGatherings: number;
    activeGatherings: number;
    completedGatherings: number;
  }> => {
    const response = await apiClient.get<
      ApiResponse<{
        totalGatherings: number;
        activeGatherings: number;
        completedGatherings: number;
      }>
    >('/api/gatherings/stats');
    return response.data.data!;
  },
};
