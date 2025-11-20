import { Router, Request, Response } from 'express';
import { prisma } from '../../main';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /api/admin/gatherings:
 *   get:
 *     summary: 모임 목록 조회 (관리자)
 *     tags: [Admin - Gatherings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [RECRUITING, FULL, COMPLETED, CANCELLED]
 *         description: 모임 상태 필터
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: 카테고리 ID 필터
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 제목 검색
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
 *           default: 20
 *         description: 페이지당 항목 수
 *     responses:
 *       200:
 *         description: 모임 목록 조회 성공
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 */
router.get('/', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { status, categoryId, search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (search) {
      where.title = {
        contains: String(search),
        mode: 'insensitive',
      };
    }

    const [gatherings, total] = await Promise.all([
      prisma.gathering.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        include: {
          host: {
            select: {
              id: true,
              email: true,
              nickname: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          image: {
            select: {
              id: true,
              url: true,
            },
          },
          _count: {
            select: {
              participants: true,
              reviews: true,
            },
          },
        },
      }),
      prisma.gathering.count({ where }),
    ]);

    res.json({
      success: true,
      data: gatherings,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get gatherings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gatherings',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/gatherings/{id}:
 *   get:
 *     summary: 모임 상세 조회 (관리자)
 *     tags: [Admin - Gatherings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 모임 ID
 *     responses:
 *       200:
 *         description: 모임 상세 조회 성공
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 모임을 찾을 수 없음
 */
router.get('/:id', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const gathering = await prisma.gathering.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            email: true,
            nickname: true,
            profileImage: {
              select: {
                url: true,
              },
            },
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        image: {
          select: {
            id: true,
            url: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                nickname: true,
              },
            },
          },
        },
        _count: {
          select: {
            participants: true,
            reviews: true,
          },
        },
      },
    });

    if (!gathering) {
      res.status(404).json({
        success: false,
        message: 'Gathering not found',
      });
      return;
    }

    res.json({
      success: true,
      data: gathering,
    });
  } catch (error) {
    console.error('Get gathering error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gathering',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/gatherings/{id}:
 *   put:
 *     summary: 모임 수정 (관리자)
 *     tags: [Admin - Gatherings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 모임 ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [RECRUITING, CONFIRMED, COMPLETED, CANCELLED]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               maxParticipants:
 *                 type: integer
 *               price:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 모임 수정 성공
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 모임을 찾을 수 없음
 */
router.put('/:id', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, title, description, maxParticipants, price } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (maxParticipants !== undefined) updateData.maxParticipants = maxParticipants;
    if (price !== undefined) updateData.price = price;

    const gathering = await prisma.gathering.update({
      where: { id },
      data: updateData,
      include: {
        host: {
          select: {
            id: true,
            email: true,
            nickname: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        image: {
          select: {
            id: true,
            url: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: gathering,
    });
  } catch (error) {
    console.error('Update gathering error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update gathering',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/gatherings/{id}:
 *   delete:
 *     summary: 모임 삭제 (관리자)
 *     tags: [Admin - Gatherings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 모임 ID
 *     responses:
 *       200:
 *         description: 모임 삭제 성공
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 모임을 찾을 수 없음
 */
router.delete('/:id', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.gathering.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Gathering deleted successfully',
    });
  } catch (error) {
    console.error('Delete gathering error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete gathering',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/gatherings/stats/overview:
 *   get:
 *     summary: 모임 통계 조회 (관리자)
 *     tags: [Admin - Gatherings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 통계 조회 성공
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 */
router.get('/stats/overview', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const [total, recruiting, full, completed, cancelled] = await Promise.all([
      prisma.gathering.count(),
      prisma.gathering.count({ where: { status: 'RECRUITING' } }),
      prisma.gathering.count({ where: { status: 'FULL' } }),
      prisma.gathering.count({ where: { status: 'COMPLETED' } }),
      prisma.gathering.count({ where: { status: 'CANCELLED' } }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        recruiting,
        full,
        completed,
        cancelled,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
