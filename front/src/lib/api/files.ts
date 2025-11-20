import apiClient from './client';
import { ApiResponse } from './types';

export type FileUploadType =
  | 'banner'
  | 'popup'
  | 'event'
  | 'profile'
  | 'gathering'
  | 'category'
  | 'badge'
  | 'review'
  | 'notice';

export interface UploadedFile {
  id: string;
  originalName: string;
  savedName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  createdAt: string;
}

export interface FileUploadConfig {
  allowedExtensions: string[];
  allowedMimeTypes: string[];
  maxFileSize: number;
  recommendedSize?: {
    width: number;
    height: number;
  };
  description: string;
}

export const filesApi = {
  /**
   * 파일 업로드
   */
  uploadFile: async (
    file: File,
    uploadType: FileUploadType,
    autoResize: boolean = false
  ): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append('file', file);
    if (autoResize) {
      formData.append('resize', 'true');
    }

    const response = await apiClient.post<ApiResponse<UploadedFile>>(
      `/api/files/upload/${uploadType}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data!;
  },

  /**
   * 파일 삭제
   */
  deleteFile: async (fileId: string): Promise<void> => {
    await apiClient.delete(`/api/files/${fileId}`);
  },

  /**
   * 파일 업로드 설정 조회
   */
  getUploadConfig: async (uploadType: FileUploadType): Promise<FileUploadConfig> => {
    const response = await apiClient.get<ApiResponse<FileUploadConfig>>(
      `/api/files/config/${uploadType}`
    );
    return response.data.data!;
  },

  /**
   * 파일 크기를 사람이 읽기 쉬운 형식으로 변환
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  },

  /**
   * 파일 검증
   */
  validateFile: (file: File, config: FileUploadConfig): { valid: boolean; error?: string } => {
    // 파일 크기 검증
    if (file.size > config.maxFileSize) {
      return {
        valid: false,
        error: `파일 크기가 너무 큽니다. 최대 ${filesApi.formatFileSize(config.maxFileSize)}까지 업로드 가능합니다.`,
      };
    }

    // MIME 타입 검증
    if (!config.allowedMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: `지원하지 않는 파일 형식입니다. ${config.allowedExtensions.join(', ')} 파일만 업로드 가능합니다.`,
      };
    }

    // 확장자 검증
    const fileName = file.name.toLowerCase();
    const hasValidExtension = config.allowedExtensions.some((ext) => fileName.endsWith(ext));
    if (!hasValidExtension) {
      return {
        valid: false,
        error: `지원하지 않는 파일 확장자입니다. ${config.allowedExtensions.join(', ')} 파일만 업로드 가능합니다.`,
      };
    }

    return { valid: true };
  },
};
