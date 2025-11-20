import apiClient from './client';
import { ApiResponse } from './types';
import { Gathering } from './gatherings';

export interface Bookmark {
  id: string;
  userId: string;
  gatheringId: string;
  createdAt: string;
  gathering?: Gathering;
}

export interface BookmarkListResponse {
  data: Bookmark[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const bookmarksApi = {
  // 북마크 추가
  addBookmark: async (gatheringId: string): Promise<Bookmark> => {
    const response = await apiClient.post<ApiResponse<Bookmark>>(
      `/api/bookmarks/${gatheringId}`
    );
    return response.data.data!;
  },

  // 북마크 삭제
  removeBookmark: async (gatheringId: string): Promise<void> => {
    await apiClient.delete(`/api/bookmarks/${gatheringId}`);
  },

  // 북마크 여부 확인
  checkBookmark: async (gatheringId: string): Promise<boolean> => {
    const response = await apiClient.get<ApiResponse<{ isBookmarked: boolean }>>(
      `/api/bookmarks/${gatheringId}/check`
    );
    return response.data.data?.isBookmarked || false;
  },

  // 내 북마크 목록 조회
  getBookmarks: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<BookmarkListResponse> => {
    const response = await apiClient.get<ApiResponse<Bookmark[]>>('/api/bookmarks', {
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
};
