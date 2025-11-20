import { Router, Request, Response } from 'express';
import { prisma } from '../main';

const router = Router();

/**
 * @swagger
 * /api/banners/active:
 *   get:
 *     summary: 활성 배너 조회 (공개 API)
 *     tags: [Banners]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [MAIN_BANNER, MAIN_TOP, MAIN_MIDDLE, MAIN_BOTTOM, EVENT, POPUP]
 *         description: 배너 타입 필터
 *     responses:
 *       200:
 *         description: 활성 배너 목록 조회 성공
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
 */
router.get('/active', async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    const now = new Date();

    const where: any = {
      isActive: true,
    };

    // MAIN_BANNER 타입이 아닐 때만 날짜 검증
    if (type !== 'MAIN_BANNER') {
      where.startDate = {
        lte: now,
      };
      where.endDate = {
        gte: now,
      };
    }

    if (type) {
      where.type = type;
    }

    const banners = await prisma.banner.findMany({
      where,
      orderBy: { order: 'asc' },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        image: {
          select: {
            id: true,
            url: true,
          },
        },
        linkUrl: true,
        order: true,
      },
    });

    res.json({
      success: true,
      data: banners,
    });
  } catch (error) {
    console.error('Get active banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active banners',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/banners/{id}/view:
 *   post:
 *     summary: 배너 조회수 증가
 *     tags: [Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 조회수 증가 성공
 */
router.post('/:id/view', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.banner.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    res.json({
      success: true,
      message: 'View count incremented',
    });
  } catch (error) {
    console.error('Increment view count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to increment view count',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/banners/{id}/click:
 *   post:
 *     summary: 배너 클릭수 증가
 *     tags: [Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 클릭수 증가 성공
 */
router.post('/:id/click', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.banner.update({
      where: { id },
      data: {
        clickCount: {
          increment: 1,
        },
      },
    });

    res.json({
      success: true,
      message: 'Click count incremented',
    });
  } catch (error) {
    console.error('Increment click count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to increment click count',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
