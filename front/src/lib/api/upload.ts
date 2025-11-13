import { apiClient } from './client';

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    filename: string;
    originalname: string;
    size: number;
    mimetype: string;
    url: string;
  };
}

export interface MultipleUploadResponse {
  success: boolean;
  message: string;
  data: Array<{
    filename: string;
    originalname: string;
    size: number;
    mimetype: string;
    url: string;
  }>;
}

/**
 * 프로필 이미지 업로드
 */
export const uploadProfileImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<UploadResponse>('/upload/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * 게시물 이미지 업로드 (다중)
 */
export const uploadPostImages = async (files: File[]): Promise<MultipleUploadResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await apiClient.post<MultipleUploadResponse>('/upload/post', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * 이벤트 이미지 업로드
 */
export const uploadEventImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<UploadResponse>('/upload/event', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * 배너 이미지 업로드 (관리자 전용)
 */
export const uploadBannerImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<UploadResponse>('/upload/banner', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * 파일 삭제
 */
export const deleteUploadedFile = async (
  fileType: 'profiles' | 'posts' | 'events' | 'banners',
  filename: string
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(`/upload/${fileType}/${filename}`);
  return response.data;
};

/**
 * 파일 크기 포맷팅 (클라이언트용)
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * 이미지 파일 유효성 검사
 */
export const validateImageFile = (
  file: File,
  options?: {
    maxSize?: number; // bytes
    allowedTypes?: string[];
  }
): { valid: boolean; error?: string } => {
  const maxSize = options?.maxSize || 5 * 1024 * 1024; // 5MB default
  const allowedTypes = options?.allowedTypes || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `허용되지 않은 파일 형식입니다. 허용된 형식: ${allowedTypes.join(', ')}`,
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `파일 크기가 너무 큽니다. 최대 크기: ${formatFileSize(maxSize)}`,
    };
  }

  return { valid: true };
};
