import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// 업로드 베이스 디렉토리
const UPLOAD_BASE_DIR = process.env.UPLOAD_DIR || '/Users/philip/project/moa_file';

// 파일 타입별 서브 디렉토리
export const FILE_TYPES = {
  PROFILE: 'profiles',
  POST: 'posts',
  EVENT: 'events',
  BANNER: 'banners',
  TEMP: 'temp',
} as const;

export type FileType = typeof FILE_TYPES[keyof typeof FILE_TYPES];

// 허용된 이미지 확장자
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

// 허용된 MIME 타입
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

/**
 * 디렉토리가 존재하지 않으면 생성
 */
const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * 고유한 파일명 생성
 */
const generateUniqueFilename = (originalname: string): string => {
  const ext = path.extname(originalname);
  const timestamp = Date.now();
  const randomHash = crypto.randomBytes(8).toString('hex');
  return `${timestamp}-${randomHash}${ext}`;
};

/**
 * Multer storage 설정
 */
const createStorage = (fileType: FileType) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(UPLOAD_BASE_DIR, fileType);
      ensureDirectoryExists(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueFilename = generateUniqueFilename(file.originalname);
      cb(null, uniqueFilename);
    },
  });
};

/**
 * 파일 필터 (이미지만 허용)
 */
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    return cb(
      new Error(`허용되지 않은 파일 형식입니다. 허용된 형식: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`)
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('허용되지 않은 MIME 타입입니다.'));
  }

  cb(null, true);
};

/**
 * 파일 업로드 미들웨어 생성
 */
export const createUploadMiddleware = (
  fileType: FileType,
  options?: {
    maxFileSize?: number; // bytes
    allowMultiple?: boolean;
    maxCount?: number;
  }
) => {
  const maxFileSize = options?.maxFileSize || parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB default

  const upload = multer({
    storage: createStorage(fileType),
    limits: {
      fileSize: maxFileSize,
    },
    fileFilter,
  });

  if (options?.allowMultiple) {
    return upload.array('files', options.maxCount || 10);
  }

  return upload.single('file');
};

/**
 * 업로드된 파일 URL 생성
 */
export const getFileUrl = (filename: string, fileType: FileType): string => {
  const baseUrl = process.env.UPLOAD_BASE_URL || 'http://localhost:4000/uploads';
  return `${baseUrl}/${fileType}/${filename}`;
};

/**
 * 파일 삭제
 */
export const deleteFile = async (filename: string, fileType: FileType): Promise<boolean> => {
  try {
    const filePath = path.join(UPLOAD_BASE_DIR, fileType, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }

    return false;
  } catch (error) {
    console.error('File deletion error:', error);
    return false;
  }
};

/**
 * 여러 파일 삭제
 */
export const deleteFiles = async (
  files: Array<{ filename: string; fileType: FileType }>
): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  for (const file of files) {
    const deleted = await deleteFile(file.filename, file.fileType);
    if (deleted) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
};

/**
 * 파일 존재 여부 확인
 */
export const fileExists = (filename: string, fileType: FileType): boolean => {
  const filePath = path.join(UPLOAD_BASE_DIR, fileType, filename);
  return fs.existsSync(filePath);
};

/**
 * 파일 크기 포맷팅
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
