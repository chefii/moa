import apiClient from '../client';
import { ApiResponse } from '../types';

export interface AdminBoardPost {
  id: string;
  title: string;
  content: string;
  categoryId: string | null;
  authorId: string;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  isPinned: boolean;
  images: string[];
  status: 'PUBLISHED' | 'DELETED' | 'HIDDEN';
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    nickname?: string;
    email: string;
  };
  category?: {
    id: string;
    name: string;
    displayName?: string;
    color?: string;
  } | null;
}

export interface BoardStats {
  totalPosts: number;
  activePosts: number;
  deletedPosts: number;
  hiddenPosts: number;
  totalComments: number;
  totalLikes: number;
}

export interface BoardListParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  status?: 'PUBLISHED' | 'DELETED' | 'HIDDEN';
}

export interface BoardListResponse {
  data: AdminBoardPost[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const adminBoardsApi = {
  // Get all board posts
  getPosts: async (params?: BoardListParams): Promise<BoardListResponse> => {
    const response = await apiClient.get<ApiResponse<AdminBoardPost[]>>('/api/admin/boards', {
      params,
    });
    return {
      data: response.data.data!,
      pagination: response.data.pagination || {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    };
  },

  // Get post by ID
  getPostById: async (id: string): Promise<AdminBoardPost> => {
    const response = await apiClient.get<ApiResponse<AdminBoardPost>>(
      `/api/admin/boards/${id}`
    );
    return response.data.data!;
  },

  // Update post status
  updatePostStatus: async (
    id: string,
    status: 'PUBLISHED' | 'DELETED' | 'HIDDEN'
  ): Promise<AdminBoardPost> => {
    const response = await apiClient.patch<ApiResponse<AdminBoardPost>>(
      `/api/admin/boards/${id}/status`,
      { status }
    );
    return response.data.data!;
  },

  // Delete post
  deletePost: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/boards/${id}`);
  },

  // Get board stats
  getStats: async (): Promise<BoardStats> => {
    const response = await apiClient.get<ApiResponse<BoardStats>>(
      '/api/admin/boards/stats/overview'
    );
    return response.data.data!;
  },
};
