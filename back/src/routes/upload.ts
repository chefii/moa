import { Router, Request, Response } from 'express';
import { authenticate } from '../middlewares/auth';
import {
  createUploadMiddleware,
  FILE_TYPES,
  FileType,
  getFileUrl,
  deleteFile,
  fileExists,
} from '../utils/upload';

const router = Router();

/**
 * 프로필 이미지 업로드
 */
router.post(
  '/profile',
  authenticate,
  createUploadMiddleware(FILE_TYPES.PROFILE, { maxFileSize: 5 * 1024 * 1024 }), // 5MB
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: '파일이 업로드되지 않았습니다.',
        });
        return;
      }

      const fileUrl = getFileUrl(req.file.filename, FILE_TYPES.PROFILE);

      res.json({
        success: true,
        message: '프로필 이미지가 업로드되었습니다.',
        data: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          url: fileUrl,
        },
      });
    } catch (error) {
      console.error('Profile upload error:', error);
      res.status(500).json({
        success: false,
        message: '프로필 이미지 업로드에 실패했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * 게시물 이미지 업로드 (다중 파일)
 */
router.post(
  '/post',
  authenticate,
  createUploadMiddleware(FILE_TYPES.POST, {
    allowMultiple: true,
    maxCount: 10,
    maxFileSize: 10 * 1024 * 1024, // 10MB per file
  }),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          message: '파일이 업로드되지 않았습니다.',
        });
        return;
      }

      const uploadedFiles = files.map((file) => ({
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: getFileUrl(file.filename, FILE_TYPES.POST),
      }));

      res.json({
        success: true,
        message: `${files.length}개의 이미지가 업로드되었습니다.`,
        data: uploadedFiles,
      });
    } catch (error) {
      console.error('Post upload error:', error);
      res.status(500).json({
        success: false,
        message: '게시물 이미지 업로드에 실패했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * 이벤트 이미지 업로드
 */
router.post(
  '/event',
  authenticate,
  createUploadMiddleware(FILE_TYPES.EVENT, { maxFileSize: 10 * 1024 * 1024 }), // 10MB
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: '파일이 업로드되지 않았습니다.',
        });
        return;
      }

      const fileUrl = getFileUrl(req.file.filename, FILE_TYPES.EVENT);

      res.json({
        success: true,
        message: '이벤트 이미지가 업로드되었습니다.',
        data: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          url: fileUrl,
        },
      });
    } catch (error) {
      console.error('Event upload error:', error);
      res.status(500).json({
        success: false,
        message: '이벤트 이미지 업로드에 실패했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * 배너 이미지 업로드 (관리자 전용)
 */
router.post(
  '/banner',
  authenticate,
  createUploadMiddleware(FILE_TYPES.BANNER, { maxFileSize: 10 * 1024 * 1024 }), // 10MB
  async (req: Request, res: Response) => {
    try {
      // 관리자 권한 체크
      if (req.user?.role !== 'SUPER_ADMIN' && req.user?.role !== 'BUSINESS_ADMIN') {
        res.status(403).json({
          success: false,
          message: '배너 업로드 권한이 없습니다.',
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          message: '파일이 업로드되지 않았습니다.',
        });
        return;
      }

      const fileUrl = getFileUrl(req.file.filename, FILE_TYPES.BANNER);

      res.json({
        success: true,
        message: '배너 이미지가 업로드되었습니다.',
        data: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          url: fileUrl,
        },
      });
    } catch (error) {
      console.error('Banner upload error:', error);
      res.status(500).json({
        success: false,
        message: '배너 이미지 업로드에 실패했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * 파일 삭제
 */
router.delete('/:fileType/:filename', authenticate, async (req: Request, res: Response) => {
  try {
    const { fileType, filename } = req.params;

    // 파일 타입 검증
    if (!Object.values(FILE_TYPES).includes(fileType as FileType)) {
      res.status(400).json({
        success: false,
        message: '유효하지 않은 파일 타입입니다.',
      });
      return;
    }

    // 파일 존재 여부 확인
    if (!fileExists(filename, fileType as FileType)) {
      res.status(404).json({
        success: false,
        message: '파일을 찾을 수 없습니다.',
      });
      return;
    }

    // 파일 삭제
    const deleted = await deleteFile(filename, fileType as FileType);

    if (deleted) {
      res.json({
        success: true,
        message: '파일이 삭제되었습니다.',
      });
    } else {
      res.status(500).json({
        success: false,
        message: '파일 삭제에 실패했습니다.',
      });
    }
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({
      success: false,
      message: '파일 삭제 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
