/**
 * 파일 업로드 설정
 * 각 페이지/기능별로 파일 업로드 제한사항을 정의합니다.
 */

export interface FileUploadConfig {
  // 디렉토리 이름 (파일이 저장될 폴더)
  directory: string;
  // 허용되는 파일 확장자 (소문자)
  allowedExtensions: string[];
  // 허용되는 MIME 타입
  allowedMimeTypes: string[];
  // 최대 파일 크기 (바이트)
  maxFileSize: number;
  // 권장 이미지 크기 (선택적)
  recommendedSize?: {
    width: number;
    height: number;
  };
  // 설명 (에러 메시지에 사용)
  description: string;
}

/**
 * 파일 업로드 설정 타입
 */
export type FileUploadType =
  | 'banner'
  | 'popup'
  | 'event'
  | 'profile'
  | 'background'
  | 'gathering'
  | 'category'
  | 'badge'
  | 'review'
  | 'notice';

/**
 * FileUploadType을 Prisma FileType enum으로 매핑
 */
export function mapUploadTypeToFileType(uploadType: FileUploadType): string {
  const mapping: Record<FileUploadType, string> = {
    banner: 'BANNER',
    popup: 'POPUP',
    event: 'EVENT',
    profile: 'PROFILE',
    background: 'BACKGROUND',
    gathering: 'GATHERING',
    category: 'CATEGORY',
    badge: 'BADGE',
    review: 'REVIEW',
    notice: 'NOTICE',
  };
  return mapping[uploadType];
}

/**
 * 각 타입별 파일 업로드 설정
 */
export const FILE_UPLOAD_CONFIGS: Record<FileUploadType, FileUploadConfig> = {
  banner: {
    directory: 'banners',
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    recommendedSize: {
      width: 1200,
      height: 400,
    },
    description: '배너 이미지 (JPG, PNG, GIF, WEBP / 권장: 1200x400px / 최대: 5MB)',
  },
  popup: {
    directory: 'popups',
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif'],
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
    maxFileSize: 2 * 1024 * 1024, // 2MB
    recommendedSize: {
      width: 600,
      height: 800,
    },
    description: '팝업 이미지 (JPG, PNG, GIF / 권장: 600x800px / 최대: 2MB)',
  },
  event: {
    directory: 'events',
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: 3 * 1024 * 1024, // 3MB
    recommendedSize: {
      width: 1000,
      height: 600,
    },
    description: '이벤트 이미지 (JPG, PNG, WEBP / 권장: 1000x600px / 최대: 3MB)',
  },
  profile: {
    directory: 'profiles',
    allowedExtensions: ['.jpg', '.jpeg', '.png'],
    allowedMimeTypes: ['image/jpeg', 'image/png'],
    maxFileSize: 250 * 1024, // 250KB (카카오 디벨로퍼 기준)
    recommendedSize: {
      width: 128,
      height: 128,
    },
    description: '프로필 이미지 (JPG, PNG / 권장: 128x128px / 최대: 250KB)',
  },
  background: {
    directory: 'backgrounds',
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: 500 * 1024, // 500KB
    recommendedSize: {
      width: 1200,
      height: 600,
    },
    description: '배경 이미지 (JPG, PNG, WEBP / 권장: 1200x600px / 최대: 500KB)',
  },
  gathering: {
    directory: 'gatherings',
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: 2 * 1024 * 1024, // 2MB
    recommendedSize: {
      width: 800,
      height: 600,
    },
    description: '모임 이미지 (JPG, PNG, WEBP / 권장: 800x600px / 최대: 2MB)',
  },
  category: {
    directory: 'categories',
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.svg'],
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml'],
    maxFileSize: 500 * 1024, // 500KB
    recommendedSize: {
      width: 256,
      height: 256,
    },
    description: '카테고리 아이콘 (JPG, PNG, SVG / 권장: 256x256px / 최대: 500KB)',
  },
  badge: {
    directory: 'badges',
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.svg'],
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml'],
    maxFileSize: 500 * 1024, // 500KB
    recommendedSize: {
      width: 128,
      height: 128,
    },
    description: '배지 아이콘 (JPG, PNG, SVG / 권장: 128x128px / 최대: 500KB)',
  },
  review: {
    directory: 'reviews',
    allowedExtensions: ['.jpg', '.jpeg', '.png'],
    allowedMimeTypes: ['image/jpeg', 'image/png'],
    maxFileSize: 1 * 1024 * 1024, // 1MB
    recommendedSize: {
      width: 800,
      height: 600,
    },
    description: '리뷰 이미지 (JPG, PNG / 권장: 800x600px / 최대: 1MB)',
  },
  notice: {
    directory: 'notices',
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf'],
    allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    description: '공지사항 첨부파일 (JPG, PNG, PDF / 최대: 5MB)',
  },
};

/**
 * 파일 크기를 사람이 읽기 쉬운 형식으로 변환
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 파일 확장자 추출
 */
export function getFileExtension(filename: string): string {
  return filename.toLowerCase().substring(filename.lastIndexOf('.'));
}

/**
 * 파일 검증
 */
export function validateFile(
  file: Express.Multer.File,
  config: FileUploadConfig
): { valid: boolean; error?: string } {
  // 파일 크기 검증
  if (file.size > config.maxFileSize) {
    return {
      valid: false,
      error: `파일 크기가 너무 큽니다. 최대 ${formatFileSize(config.maxFileSize)}까지 업로드 가능합니다.`,
    };
  }

  // MIME 타입 검증
  if (!config.allowedMimeTypes.includes(file.mimetype)) {
    return {
      valid: false,
      error: `지원하지 않는 파일 형식입니다. ${config.allowedExtensions.join(', ')} 파일만 업로드 가능합니다.`,
    };
  }

  // 확장자 검증
  const ext = getFileExtension(file.originalname);
  if (!config.allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `지원하지 않는 파일 확장자입니다. ${config.allowedExtensions.join(', ')} 파일만 업로드 가능합니다.`,
    };
  }

  return { valid: true };
}
