import logger from '../config/logger';
import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { authenticate, authorize } from '../middlewares/auth';
import { createFileUploadMiddleware, createFileInfo, resizeImage } from '../utils/fileUpload';
import { mapUploadTypeToFileType } from '../utils/fileUploadConfig';
import { getNextFileSequence } from '../utils/fileSequence';
import { FileType, Prisma } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 사용자 목록 조회 (관리자 전용)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지당 항목 수
 *     responses:
 *       200:
 *         description: 사용자 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 */
// Get all users (Admin only)
router.get('/', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          nickname: true,
          phone: true,
          location: true,
          isVerified: true,
          isPhoneVerified: true,
          emailVerifiedAt: true,
          phoneVerifiedAt: true,
          createdAt: true,
          userRoles: {
            select: {
              roleCode: true,
              isPrimary: true,
            },
            orderBy: {
              isPrimary: 'desc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: 사용자 상세 조회 (관리자 전용)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 사용자 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     nickname:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     location:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     profileImage:
 *                       type: string
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
// Get user by ID (Admin only)
router.get('/:userId', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        phone: true,
        location: true,
        bio: true,
        profileImage: true,
        isVerified: true,
        isPhoneVerified: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          select: {
            roleCode: true,
            isPrimary: true,
          },
          orderBy: {
            isPrimary: 'desc',
          },
        },
        userLevel: {
          select: {
            level: true,
            growthPoints: true,
          },
        },
        userStreak: {
          select: {
            currentStreak: true,
            longestStreak: true,
          },
        },
        interests: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
                color: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/users/stats/overview:
 *   get:
 *     summary: 사용자 통계 조회 (슈퍼 관리자 전용)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 통계 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                       example: 1000
 *                     roleStats:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                       example:
 *                         MEMBER: 950
 *                         BUSINESS: 45
 *                         SUPER_ADMIN: 5
 *                     recentUsers:
 *                       type: integer
 *                       example: 50
 *                       description: 최근 7일간 가입한 사용자 수
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음 (슈퍼 관리자만 접근 가능)
 */
// Get user statistics (Admin only)
router.get('/stats/overview', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const [totalUsers, usersByRole, recentUsers] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Users by role - now using userRoles table
      prisma.userRole.groupBy({
        by: ['roleCode'],
        _count: true,
      }),

      // Recent users (last 7 days)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const roleStats = usersByRole.reduce((acc, item) => {
      acc[item.roleCode] = item._count;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        totalUsers,
        roleStats,
        recentUsers,
      },
    });
  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/users/{userId}/terms-agreements:
 *   get:
 *     summary: 특정 사용자의 약관 동의 내역 조회 (관리자 전용)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 약관 동의 내역 조회 성공
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
router.get('/:userId/terms-agreements', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Get all active terms
    const allTerms = await prisma.terms.findMany({
      where: { isActive: true },
      select: {
        id: true,
        type: true,
        title: true,
        version: true,
        isRequired: true,
      },
      orderBy: [
        { isRequired: 'desc' },
        { type: 'asc' },
      ],
    });

    // Get user's terms agreements
    const userAgreements = await prisma.userTermsAgreement.findMany({
      where: { userId },
      include: {
        terms: {
          select: {
            id: true,
            type: true,
            title: true,
            version: true,
            isRequired: true,
          },
        },
      },
      orderBy: {
        agreedAt: 'desc',
      },
    });

    // Create agreement map
    const agreementMap = new Map(
      userAgreements.map(agreement => [agreement.termsId, agreement])
    );

    // Combine all terms with agreement status
    const termsWithStatus = allTerms.map(term => {
      const agreement = agreementMap.get(term.id);
      return {
        ...term,
        agreed: !!agreement,
        agreedAt: agreement?.agreedAt || null,
        ipAddress: agreement?.ipAddress || null,
        userAgent: agreement?.userAgent || null,
      };
    });

    // Calculate statistics
    const totalTerms = allTerms.length;
    const requiredTerms = allTerms.filter(t => t.isRequired).length;
    const agreedTerms = userAgreements.length;
    const agreedRequiredTerms = userAgreements.filter(a => a.terms.isRequired).length;

    res.json({
      success: true,
      data: {
        terms: termsWithStatus,
        statistics: {
          totalTerms,
          requiredTerms,
          agreedTerms,
          agreedRequiredTerms,
          completionRate: totalTerms > 0 ? Math.round((agreedTerms / totalTerms) * 100) : 0,
          requiredCompletionRate: requiredTerms > 0 ? Math.round((agreedRequiredTerms / requiredTerms) * 100) : 0,
        },
      },
    });
  } catch (error) {
    logger.error('Get user terms agreements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user terms agreements',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/users/me/profile-image:
 *   put:
 *     summary: 프로필 이미지 업로드
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *                 description: 프로필 이미지 파일 (JPG, PNG / 권장 128x128px / 최대 250KB)
 *     responses:
 *       200:
 *         description: 프로필 이미지 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile image uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     profileImage:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         url:
 *                           type: string
 *                         originalName:
 *                           type: string
 *                         size:
 *                           type: number
 *       400:
 *         description: 잘못된 요청 (파일 없음, 잘못된 형식)
 *       401:
 *         description: 인증 필요
 */
const profileUpload = createFileUploadMiddleware('profile');

router.put('/me/profile-image', authenticate, profileUpload.single('file'), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
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

    // 이미지 리사이징 (128x128px)
    await resizeImage(req.file.path, 128, 128);

    // 파일 정보 생성
    const fileInfo = createFileInfo(req.file, 'profile');
    const fileType = mapUploadTypeToFileType('profile') as FileType;
    const fileExtension = req.file.originalname.substring(req.file.originalname.lastIndexOf('.'));

    // File 테이블에 저장
    const fileRecord = await prisma.file.create({
      data: {
        url: fileInfo.url,
        fileType: fileType,
        originalName: fileInfo.originalName,
        savedName: fileInfo.savedName,
        filePath: fileInfo.path,
        fileExtension: fileExtension,
        mimeType: fileInfo.mimeType,
        fileSize: fileInfo.size,
      },
    });

    // 기존 프로필 이미지 ID 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profileImageId: true },
    });

    // User의 profileImageId 업데이트
    await prisma.user.update({
      where: { id: userId },
      data: {
        profileImageId: fileRecord.id,
      },
    });

    // 기존 프로필 이미지가 있었다면 삭제 (선택사항)
    if (user?.profileImageId) {
      await prisma.file.delete({
        where: { id: user.profileImageId },
      }).catch(err => {
        logger.warn(`Failed to delete old profile image: ${err.message}`);
      });
    }

    logger.info(`✅ Profile image uploaded for user: ${userId}`);

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        profileImage: {
          id: fileRecord.id,
          url: fileRecord.url,
          originalName: fileRecord.originalName,
          size: fileRecord.fileSize,
        },
      },
    });
  } catch (error) {
    logger.error('Upload profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile image',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/users/me/background-images:
 *   post:
 *     summary: 배경 이미지 업로드 (최대 10개)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 배경 이미지 파일들 (JPG, PNG, WEBP / 최대 500KB)
 *     responses:
 *       200:
 *         description: 배경 이미지 업로드 성공
 */
const backgroundUpload = createFileUploadMiddleware('background');

router.post('/me/background-images', authenticate, backgroundUpload.array('files', 10), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
      return;
    }

    // 기존 배경 이미지 개수 확인
    const existingCount = await prisma.userBackgroundImage.count({
      where: { userId },
    });

    if (existingCount + files.length > 10) {
      res.status(400).json({
        success: false,
        message: `최대 10개까지 업로드 가능합니다. 현재 ${existingCount}개가 등록되어 있습니다.`,
      });
      return;
    }

    const uploadedImages = [];
    const fileType = mapUploadTypeToFileType('background') as FileType;

    for (const file of files) {
      // 이미지 리사이징 (1200x600px)
      await resizeImage(file.path, 1200, 600);

      // 파일 정보 생성
      const fileInfo = createFileInfo(file, 'background');
      const fileExtension = file.originalname.substring(file.originalname.lastIndexOf('.'));

      // File 테이블에 저장
      const fileRecord = await prisma.file.create({
        data: {
          url: fileInfo.url,
          fileType: fileType,
          originalName: fileInfo.originalName,
          savedName: fileInfo.savedName,
          filePath: fileInfo.path,
          fileExtension: fileExtension,
          mimeType: fileInfo.mimeType,
          fileSize: fileInfo.size,
        },
      });

      // UserBackgroundImage 테이블에 저장
      const backgroundImage: Prisma.UserBackgroundImageGetPayload<{ include: { file: true } }> = await prisma.userBackgroundImage.create({
        data: {
          userId,
          fileId: fileRecord.id,
          order: existingCount + uploadedImages.length,
        },
        include: {
          file: true,
        },
      });

      uploadedImages.push({
        id: backgroundImage.id,
        url: backgroundImage.file.url,
        order: backgroundImage.order,
      });
    }

    logger.info(`✅ Background images uploaded for user: ${userId}`);

    res.json({
      success: true,
      message: 'Background images uploaded successfully',
      data: {
        images: uploadedImages,
      },
    });
  } catch (error) {
    logger.error('Upload background images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload background images',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/users/me/background-images:
 *   get:
 *     summary: 내 배경 이미지 목록 조회
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 배경 이미지 목록 조회 성공
 */
router.get('/me/background-images', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const backgroundImages = await prisma.userBackgroundImage.findMany({
      where: { userId },
      include: {
        file: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    res.json({
      success: true,
      data: backgroundImages.map(img => ({
        id: img.id,
        url: img.file.url,
        order: img.order,
      })),
    });
  } catch (error) {
    logger.error('Get background images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get background images',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/users/me/background-images/{id}:
 *   delete:
 *     summary: 배경 이미지 삭제
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 배경 이미지 ID
 *     responses:
 *       200:
 *         description: 배경 이미지 삭제 성공
 */
router.delete('/me/background-images/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // 배경 이미지 조회 및 권한 확인
    const backgroundImage = await prisma.userBackgroundImage.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!backgroundImage) {
      res.status(404).json({
        success: false,
        message: 'Background image not found',
      });
      return;
    }

    // File 삭제
    await prisma.file.delete({
      where: { id: backgroundImage.fileId },
    });

    // UserBackgroundImage 삭제
    await prisma.userBackgroundImage.delete({
      where: { id },
    });

    logger.info(`✅ Background image deleted: ${id}`);

    res.json({
      success: true,
      message: 'Background image deleted successfully',
    });
  } catch (error) {
    logger.error('Delete background image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete background image',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/users/me/marketing-agreement:
 *   patch:
 *     summary: 마케팅 정보 수신 동의 업데이트
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - marketingAgreed
 *             properties:
 *               marketingAgreed:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: 마케팅 동의 업데이트 성공
 *       401:
 *         description: 인증 필요
 */
router.patch('/me/marketing-agreement', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { marketingAgreed } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    if (typeof marketingAgreed !== 'boolean') {
      res.status(400).json({
        success: false,
        message: 'marketingAgreed must be a boolean value',
      });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        marketingAgreed,
        marketingAgreedAt: marketingAgreed ? new Date() : null,
        marketingAgreedMethod: marketingAgreed ? 'EMAIL' : null,
      },
      select: {
        id: true,
        email: true,
        marketingAgreed: true,
        marketingAgreedAt: true,
      },
    });

    logger.info(`✅ Marketing agreement updated for user: ${userId}`);

    res.json({
      success: true,
      message: 'Marketing agreement updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    logger.error('Update marketing agreement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update marketing agreement',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
