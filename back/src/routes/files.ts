import { Router, Request, Response } from 'express';
import { prisma } from '../main';
import { authenticate } from '../middlewares/auth';
import {
  createFileUploadMiddleware,
  createFileInfo,
  deleteFile,
  resizeImage,
} from '../utils/fileUpload';
import { FileUploadType, FILE_UPLOAD_CONFIGS, getFileExtension, mapUploadTypeToFileType } from '../utils/fileUploadConfig';
import { generatePhysicalFileName } from '../utils/fileSequence';
import path from 'path';
import fs from 'fs';

const router = Router();

/**
 * @swagger
 * /api/files/upload/{type}:
 *   post:
 *     summary: 파일 업로드
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [banner, popup, event, profile, gathering, category, badge, review, notice]
 *         description: 파일 업로드 타입
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 업로드할 파일
 *               resize:
 *                 type: boolean
 *                 description: 자동 리사이징 여부 (선택적)
 *     responses:
 *       201:
 *         description: 파일 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     originalName:
 *                       type: string
 *                     savedName:
 *                       type: string
 *                     mimeType:
 *                       type: string
 *                     size:
 *                       type: integer
 *                     url:
 *                       type: string
 *       400:
 *         description: 잘못된 요청 또는 파일 검증 실패
 *       401:
 *         description: 인증 필요
 */
router.post('/upload/:type', authenticate, async (req: Request, res: Response) => {
  try {
    const uploadType = req.params.type as FileUploadType;

    // 유효한 업로드 타입인지 확인
    if (!FILE_UPLOAD_CONFIGS[uploadType]) {
      res.status(400).json({
        success: false,
        message: `Invalid upload type: ${uploadType}`,
      });
      return;
    }

    const config = FILE_UPLOAD_CONFIGS[uploadType];
    const upload = createFileUploadMiddleware(uploadType);

    // Multer 미들웨어 실행
    upload.single('file')(req, res, async (err: any) => {
      if (err) {
        console.error('File upload error:', err);
        res.status(400).json({
          success: false,
          message: err.message || 'File upload failed',
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
        return;
      }

      try {
        const fileExtension = getFileExtension(req.file.originalname);

        // 물리 파일명 생성 (YYMMDD-0000001.jpg 형식)
        const physicalFileName = await generatePhysicalFileName(uploadType, fileExtension);

        // 파일명 변경
        const oldPath = req.file.path;
        const newPath = path.join(path.dirname(oldPath), physicalFileName);
        fs.renameSync(oldPath, newPath);

        // 자동 리사이징 옵션 (이미지 파일이고 권장 사이즈가 있는 경우)
        if (req.body.resize === 'true' && config.recommendedSize) {
          const isImage = req.file.mimetype.startsWith('image/');
          if (isImage && !req.file.mimetype.includes('svg')) {
            await resizeImage(
              newPath,
              config.recommendedSize.width,
              config.recommendedSize.height
            );
          }
        }

        // 파일 URL 생성 - 상대 경로로 저장 (환경에 독립적)
        const fileUrl = `/uploads/${config.directory}/${physicalFileName}`;

        // 데이터베이스에 파일 정보 저장
        const file = await prisma.file.create({
          data: {
            fileType: mapUploadTypeToFileType(uploadType) as any,
            originalName: req.file.originalname,
            physicalFileName: physicalFileName,
            savedName: physicalFileName, // 저장된 파일명
            filePath: config.directory, // 파일 경로 (디렉토리)
            fileExtension: fileExtension,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            url: fileUrl,
            uploadedBy: req.user!.userId,
          },
        });

        res.status(201).json({
          success: true,
          data: file,
        });
      } catch (error) {
        // 오류 발생 시 업로드된 파일 삭제
        if (req.file) {
          deleteFile(req.file.path);
        }
        throw error;
      }
    });
  } catch (error) {
    console.error('Upload endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/files/{id}:
 *   delete:
 *     summary: 파일 삭제
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 파일 ID
 *     responses:
 *       200:
 *         description: 파일 삭제 성공
 *       404:
 *         description: 파일을 찾을 수 없음
 *       401:
 *         description: 인증 필요
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 파일 정보 조회
    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      res.status(404).json({
        success: false,
        message: 'File not found',
      });
      return;
    }

    // 파일 시스템에서 파일 삭제
    const UPLOAD_BASE_DIR = process.env.UPLOAD_DIR || './uploads';
    const filePath = path.join(UPLOAD_BASE_DIR, file.savedName);
    deleteFile(filePath);

    // 데이터베이스에서 파일 정보 삭제
    await prisma.file.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('File delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/files/config/{type}:
 *   get:
 *     summary: 파일 업로드 설정 조회
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [banner, popup, event, profile, gathering, category, badge, review, notice]
 *         description: 파일 업로드 타입
 *     responses:
 *       200:
 *         description: 설정 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */
router.get('/config/:type', async (req: Request, res: Response) => {
  try {
    const uploadType = req.params.type as FileUploadType;

    if (!FILE_UPLOAD_CONFIGS[uploadType]) {
      res.status(400).json({
        success: false,
        message: `Invalid upload type: ${uploadType}`,
      });
      return;
    }

    const config = FILE_UPLOAD_CONFIGS[uploadType];

    res.json({
      success: true,
      data: {
        allowedExtensions: config.allowedExtensions,
        allowedMimeTypes: config.allowedMimeTypes,
        maxFileSize: config.maxFileSize,
        recommendedSize: config.recommendedSize,
        description: config.description,
      },
    });
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upload config',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
