import apiClient from './client';
import { ApiResponse } from './types';

export type PostStatus = 'PUBLISHED' | 'HIDDEN' | 'REPORTED' | 'DELETED';
export type CommentStatus = 'ACTIVE' | 'HIDDEN' | 'REPORTED' | 'DELETED';

export interface CreatePostDto {
  title: string;
  content: string;
  categoryId: string;
  imageId?: string;
  isAnonymous?: boolean;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  imageId?: string;
}

export interface CreateCommentDto {
  postId: string;
  content: string;
  parentId?: string;
  isAnonymous?: boolean;
}

export interface UpdateCommentDto {
  content: string;
}

export interface BoardPost {
  id: string;
  authorId: string;
  categoryId: string;
  title: string;
  content: string;
  imageId?: string;
  image?: {
    id: string;
    url: string;
    savedName: string;
  };
  isAnonymous: boolean;
  status: PostStatus;
  isDeleted: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    nickname?: string;
    profileImage?: string;
  };
  category?: {
    id: string;
    name: string;
    displayName?: string;
    slug: string;
    icon?: string;
    color?: string;
  };
  isLiked?: boolean;
  comments?: BoardComment[];
  _count?: {
    likes: number;
    comments: number;
  };
}

export interface BoardComment {
  id: string;
  postId: string;
  authorId: string;
  parentId?: string;
  content: string;
  isAnonymous: boolean;
  status: CommentStatus;
  isDeleted: boolean;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    nickname?: string;
    profileImage?: string;
  };
  isLiked?: boolean;
  replies?: BoardComment[];
  _count?: {
    likes: number;
    replies: number;
  };
}

export interface PostListResponse {
  data: BoardPost[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const boardApi = {
  // 게시글 목록 조회
  getPosts: async (params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    sort?: 'recent' | 'popular' | 'views';
  }): Promise<PostListResponse> => {
    const response = await apiClient.get<ApiResponse<BoardPost[]>>('/api/board/posts', {
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

  // 게시글 상세 조회
  getPostById: async (id: string): Promise<BoardPost> => {
    const response = await apiClient.get<ApiResponse<BoardPost>>(`/api/board/posts/${id}`);
    return response.data.data!;
  },

  // 게시글 작성
  createPost: async (data: CreatePostDto): Promise<BoardPost> => {
    const response = await apiClient.post<ApiResponse<BoardPost>>('/api/board/posts', data);
    return response.data.data!;
  },

  // 게시글 수정
  updatePost: async (id: string, data: UpdatePostDto): Promise<BoardPost> => {
    const response = await apiClient.put<ApiResponse<BoardPost>>(`/api/board/posts/${id}`, data);
    return response.data.data!;
  },

  // 게시글 삭제
  deletePost: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/board/posts/${id}`);
  },

  // 게시글 좋아요/좋아요 취소
  togglePostLike: async (id: string): Promise<{ liked: boolean; likeCount: number }> => {
    const response = await apiClient.post<
      ApiResponse<{ liked: boolean; likeCount: number }>
    >(`/api/board/posts/${id}/like`);
    return response.data.data!;
  },

  // 댓글 작성
  createComment: async (data: CreateCommentDto): Promise<BoardComment> => {
    const response = await apiClient.post<ApiResponse<BoardComment>>(
      '/api/board/comments',
      data
    );
    return response.data.data!;
  },

  // 댓글 수정
  updateComment: async (id: string, data: UpdateCommentDto): Promise<BoardComment> => {
    const response = await apiClient.put<ApiResponse<BoardComment>>(
      `/api/board/comments/${id}`,
      data
    );
    return response.data.data!;
  },

  // 댓글 삭제
  deleteComment: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/board/comments/${id}`);
  },

  // 댓글 좋아요/좋아요 취소
  toggleCommentLike: async (id: string): Promise<{ liked: boolean; likeCount: number }> => {
    const response = await apiClient.post<
      ApiResponse<{ liked: boolean; likeCount: number }>
    >(`/api/board/comments/${id}/like`);
    return response.data.data!;
  },
};
