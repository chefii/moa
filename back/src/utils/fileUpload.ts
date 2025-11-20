import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import sharp from 'sharp';
import {
  FileUploadType,
  FILE_UPLOAD_CONFIGS,
  validateFile,
  getFileExtension,
} from './fileUploadConfig';

/**
 * 업로드 디렉토리 기본 경로
 */
const UPLOAD_BASE_DIR = process.env.UPLOAD_DIR || '/Users/philip/project/moa_file';

/**
 * 디렉토리 생성 (존재하지 않을 경우)
 */
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Multer storage 설정 생성
 */
function createStorage(uploadType: FileUploadType): multer.StorageEngine {
  const config = FILE_UPLOAD_CONFIGS[uploadType];

  return multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
      const uploadDir = path.join(UPLOAD_BASE_DIR, config.directory);
      ensureDirectoryExists(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
      // 파일명: timestamp_random_originalname
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const ext = getFileExtension(file.originalname);
      const sanitizedOriginalName = file.originalname
        .replace(ext, '')
        .replace(/[^a-zA-Z0-9가-힣]/g, '_')
        .substring(0, 50);
      const filename = `${timestamp}_${random}_${sanitizedOriginalName}${ext}`;
      cb(null, filename);
    },
  });
}

/**
 * Multer 파일 필터 생성
 */
function createFileFilter(uploadType: FileUploadType): multer.Options['fileFilter'] {
  const config = FILE_UPLOAD_CONFIGS[uploadType];

  return (req: Request, file: Express.Multer.File, cb) => {
    const validation = validateFile(file, config);
    if (!validation.valid) {
      cb(new Error(validation.error));
      return;
    }
    cb(null, true);
  };
}

/**
 * 파일 업로드 미들웨어 생성
 */
export function createFileUploadMiddleware(uploadType: FileUploadType) {
  const config = FILE_UPLOAD_CONFIGS[uploadType];

  return multer({
    storage: createStorage(uploadType),
    fileFilter: createFileFilter(uploadType),
    limits: {
      fileSize: config.maxFileSize,
    },
  });
}

/**
 * 이미지 리사이징 (선택적)
 */
export async function resizeImage(
  filePath: string,
  width?: number,
  height?: number
): Promise<void> {
  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // 리사이징이 필요한 경우만 처리
    if (width || height) {
      await image
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFile(filePath + '.resized');

      // 원본 파일 삭제 후 리사이즈된 파일로 교체
      fs.unlinkSync(filePath);
      fs.renameSync(filePath + '.resized', filePath);
    }
  } catch (error) {
    console.error('Image resize error:', error);
    throw new Error('Failed to resize image');
  }
}

/**
 * 파일 삭제
 */
export function deleteFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('File delete error:', error);
  }
}

/**
 * 파일 URL 생성
 */
export function getFileUrl(savedName: string, uploadType: FileUploadType): string {
  const config = FILE_UPLOAD_CONFIGS[uploadType];
  const baseUrl = process.env.BASE_URL || 'http://loaclhost:4000';
  return `${baseUrl}/uploads/${config.directory}/${savedName}`;
}

/**
 * 업로드된 파일 정보 생성
 */
export interface UploadedFileInfo {
  originalName: string;
  savedName: string;
  mimeType: string;
  size: number;
  url: string;
  path: string;
}

export function createFileInfo(
  file: Express.Multer.File,
  uploadType: FileUploadType
): UploadedFileInfo {
  return {
    originalName: file.originalname,
    savedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    url: getFileUrl(file.filename, uploadType),
    path: file.path,
  };
}
