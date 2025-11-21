import logger from '../config/logger';
import { Router, Request, Response } from 'express';
import { GatheringType, GatheringStatus } from '@prisma/client';
import { authenticate, authorize } from '../middlewares/auth';
import { prisma } from '../config/prisma';

const router = Router();

/**
 * @swagger
 * /api/gatherings/stats:
 *   get:
 *     summary: 모임 통계 조회
 *     tags: [Gatherings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 모임 통계 조회 성공
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
 *                     totalGatherings:
 *                       type: integer
 *                       example: 150
 *                     activeGatherings:
 *                       type: integer
 *                       example: 45
 *                     completedGatherings:
 *                       type: integer
 *                       example: 100
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 */
router.get('/stats', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MODERATOR'), async (req: Request, res: Response) => {
  try {
    const now = new Date();

    const [totalGatherings, activeGatherings, completedGatherings] = await Promise.all([
      prisma.gathering.count(),
      prisma.gathering.count({
        where: {
          status: 'RECRUITING',
          scheduledAt: {
            gte: now,
          },
        },
      }),
      prisma.gathering.count({
        where: {
          status: 'COMPLETED',
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalGatherings,
        activeGatherings,
        completedGatherings,
      },
    });
  } catch (error) {
    logger.error('Gatherings stats error:', error);
    res.status(500).json({
      success: false,
      message: '모임 통계 조회에 실패했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/gatherings:
 *   post:
 *     summary: 모임 생성
 *     tags: [Gatherings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - categoryId
 *               - locationAddress
 *               - scheduledAt
 *               - maxParticipants
 *             properties:
 *               title:
 *                 type: string
 *                 description: 모임 제목
 *               description:
 *                 type: string
 *                 description: 모임 설명
 *               categoryId:
 *                 type: string
 *                 description: 카테고리 ID
 *               image:
 *                 type: string
 *                 description: 모임 이미지 URL
 *               gatheringType:
 *                 type: string
 *                 enum: [FREE, PAID_CLASS, DEPOSIT]
 *                 default: FREE
 *               locationAddress:
 *                 type: string
 *                 description: 모임 장소 주소
 *               locationDetail:
 *                 type: string
 *                 description: 상세 장소 정보
 *               latitude:
 *                 type: number
 *                 description: 위도
 *               longitude:
 *                 type: number
 *                 description: 경도
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 description: 모임 예정 시간
 *               durationMinutes:
 *                 type: integer
 *                 default: 120
 *                 description: 모임 소요 시간 (분)
 *               maxParticipants:
 *                 type: integer
 *                 description: 최대 참가자 수
 *               price:
 *                 type: integer
 *                 default: 0
 *                 description: 참가비
 *               depositAmount:
 *                 type: integer
 *                 default: 0
 *                 description: 보증금
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 태그 목록
 *     responses:
 *       201:
 *         description: 모임 생성 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 필요
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
      return;
    }

    const {
      title,
      description,
      categoryId,
      imageId,
      gatheringType = 'FREE',
      locationAddress,
      locationDetail,
      latitude,
      longitude,
      scheduledAt,
      durationMinutes = 120,
      maxParticipants,
      price = 0,
      depositAmount = 0,
      tags = [],
    } = req.body;

    // 필수 필드 검증
    if (!title || !description || !categoryId || !locationAddress || !scheduledAt || !maxParticipants) {
      res.status(400).json({
        success: false,
        message: '필수 필드가 누락되었습니다.',
      });
      return;
    }

    // 카테고리 존재 확인
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      res.status(400).json({
        success: false,
        message: '존재하지 않는 카테고리입니다.',
      });
      return;
    }

    // 모임 생성
    const gathering = await prisma.gathering.create({
      data: {
        hostId: userId,
        categoryId,
        title,
        description,
        gatheringType: gatheringType as GatheringType,
        imageId,
        locationAddress,
        locationDetail,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        scheduledAt: new Date(scheduledAt),
        durationMinutes,
        maxParticipants,
        currentParticipants: 0,
        price,
        depositAmount,
        status: 'RECRUITING' as GatheringStatus,
        tags: Array.isArray(tags) ? tags : [],
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
        image: {
          select: {
            id: true,
            url: true,
            savedName: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: '모임이 생성되었습니다.',
      data: gathering,
    });
  } catch (error) {
    logger.error('Gathering creation error:', error);
    res.status(500).json({
      success: false,
      message: '모임 생성에 실패했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/gatherings:
 *   get:
 *     summary: 모임 목록 조회
 *     tags: [Gatherings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [RECRUITING, FULL, COMPLETED, CANCELLED]
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [recent, popular, upcoming]
 *           default: recent
 *     responses:
 *       200:
 *         description: 모임 목록 조회 성공
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const categoryId = req.query.categoryId as string;
    const status = req.query.status as string;
    const sort = (req.query.sort as string) || 'recent';

    const skip = (page - 1) * limit;

    // 필터 조건 생성
    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    // 정렬 조건
    let orderBy: any = { createdAt: 'desc' };

    if (sort === 'upcoming') {
      orderBy = { scheduledAt: 'asc' };
    } else if (sort === 'popular') {
      orderBy = { currentParticipants: 'desc' };
    }

    const [gatherings, total] = await Promise.all([
      prisma.gathering.findMany({
        where,
        include: {
          host: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
          image: {
            select: {
              id: true,
              url: true,
              savedName: true,
            },
          },
          _count: {
            select: {
              participants: true,
              bookmarks: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.gathering.count({ where }),
    ]);

    res.json({
      success: true,
      data: gatherings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Gatherings fetch error:', error);
    res.status(500).json({
      success: false,
      message: '모임 목록 조회에 실패했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/gatherings/{id}:
 *   get:
 *     summary: 모임 상세 조회
 *     tags: [Gatherings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 모임 상세 조회 성공
 *       404:
 *         description: 모임을 찾을 수 없음
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const gathering = await prisma.gathering.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            bio: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            description: true,
          },
        },
        image: {
          select: {
            id: true,
            url: true,
            savedName: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
        },
        _count: {
          select: {
            participants: true,
            bookmarks: true,
            reviews: true,
          },
        },
      },
    });

    if (!gathering) {
      res.status(404).json({
        success: false,
        message: '모임을 찾을 수 없습니다.',
      });
      return;
    }

    res.json({
      success: true,
      data: gathering,
    });
  } catch (error) {
    logger.error('Gathering fetch error:', error);
    res.status(500).json({
      success: false,
      message: '모임 조회에 실패했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/gatherings/{id}:
 *   put:
 *     summary: 모임 수정
 *     tags: [Gatherings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 모임 수정 성공
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 모임을 찾을 수 없음
 */
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
      return;
    }

    // 모임 존재 및 권한 확인
    const gathering = await prisma.gathering.findUnique({
      where: { id },
    });

    if (!gathering) {
      res.status(404).json({
        success: false,
        message: '모임을 찾을 수 없습니다.',
      });
      return;
    }

    if (gathering.hostId !== userId) {
      res.status(403).json({
        success: false,
        message: '모임을 수정할 권한이 없습니다.',
      });
      return;
    }

    const {
      title,
      description,
      imageId,
      locationAddress,
      locationDetail,
      latitude,
      longitude,
      scheduledAt,
      durationMinutes,
      maxParticipants,
      price,
      depositAmount,
      tags,
      status,
    } = req.body;

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (imageId !== undefined) updateData.imageId = imageId;
    if (locationAddress !== undefined) updateData.locationAddress = locationAddress;
    if (locationDetail !== undefined) updateData.locationDetail = locationDetail;
    if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
    if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
    if (scheduledAt !== undefined) updateData.scheduledAt = new Date(scheduledAt);
    if (durationMinutes !== undefined) updateData.durationMinutes = durationMinutes;
    if (maxParticipants !== undefined) updateData.maxParticipants = maxParticipants;
    if (price !== undefined) updateData.price = price;
    if (depositAmount !== undefined) updateData.depositAmount = depositAmount;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
    if (status !== undefined) updateData.status = status;

    const updatedGathering = await prisma.gathering.update({
      where: { id },
      data: updateData,
      include: {
        host: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
        image: {
          select: {
            id: true,
            url: true,
            savedName: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: '모임이 수정되었습니다.',
      data: updatedGathering,
    });
  } catch (error) {
    logger.error('Gathering update error:', error);
    res.status(500).json({
      success: false,
      message: '모임 수정에 실패했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/gatherings/{id}:
 *   delete:
 *     summary: 모임 삭제
 *     tags: [Gatherings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 모임 삭제 성공
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 모임을 찾을 수 없음
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
      return;
    }

    // 모임 존재 및 권한 확인
    const gathering = await prisma.gathering.findUnique({
      where: { id },
    });

    if (!gathering) {
      res.status(404).json({
        success: false,
        message: '모임을 찾을 수 없습니다.',
      });
      return;
    }

    if (gathering.hostId !== userId) {
      res.status(403).json({
        success: false,
        message: '모임을 삭제할 권한이 없습니다.',
      });
      return;
    }

    await prisma.gathering.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: '모임이 삭제되었습니다.',
    });
  } catch (error) {
    logger.error('Gathering deletion error:', error);
    res.status(500).json({
      success: false,
      message: '모임 삭제에 실패했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
