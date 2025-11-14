import { Router, Request, Response } from 'express';
import { prisma } from '../../main';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /api/admin/banners:
 *   get:
 *     summary: 배너 목록 조회
 *     tags: [Admin - Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: 배너 타입 필터
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: 활성화 상태 필터
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
 *         description: 배너 목록 조회 성공
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
// Get all banners
router.get('/', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { type, isActive, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (type) {
      where.type = type;
    }
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [banners, total] = await Promise.all([
      prisma.banner.findMany({
        where,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: Number(limit),
      }),
      prisma.banner.count({ where }),
    ]);

    res.json({
      success: true,
      data: banners,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/banners/{id}:
 *   get:
 *     summary: 배너 상세 조회
 *     tags: [Admin - Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 배너 ID
 *     responses:
 *       200:
 *         description: 배너 상세 조회 성공
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
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 배너를 찾을 수 없음
 */
// Get banner by ID
router.get('/:id', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const banner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
      return;
    }

    res.json({
      success: true,
      data: banner,
    });
  } catch (error) {
    console.error('Get banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banner',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/banners:
 *   post:
 *     summary: 배너 생성
 *     tags: [Admin - Banners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - imageUrl
 *               - startDate
 *               - endDate
 *             properties:
 *               type:
 *                 type: string
 *                 example: MAIN
 *               title:
 *                 type: string
 *                 example: 신규 이벤트 배너
 *               description:
 *                 type: string
 *                 example: 이벤트 상세 설명
 *               imageUrl:
 *                 type: string
 *                 example: https://example.com/banner.jpg
 *               linkUrl:
 *                 type: string
 *                 example: https://example.com/event
 *               order:
 *                 type: integer
 *                 example: 1
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-01-01T00:00:00Z
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-12-31T23:59:59Z
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: 배너 생성 성공
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
 *       400:
 *         description: 필수 필드 누락
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 */
// Create banner
router.post('/', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { type, title, description, imageUrl, linkUrl, order, startDate, endDate, isActive } = req.body;

    if (!type || !title || !imageUrl || !startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: 'Type, title, imageUrl, startDate, and endDate are required',
      });
      return;
    }

    const banner = await prisma.banner.create({
      data: {
        type,
        title,
        description,
        imageUrl,
        linkUrl,
        order: order || 0,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? isActive : true,
        createdBy: req.user!.userId,
      },
    });

    res.status(201).json({
      success: true,
      data: banner,
    });
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create banner',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/banners/{id}:
 *   put:
 *     summary: 배너 수정
 *     tags: [Admin - Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 배너 ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               linkUrl:
 *                 type: string
 *               order:
 *                 type: integer
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 배너 수정 성공
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
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 배너를 찾을 수 없음
 */
// Update banner
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, title, description, imageUrl, linkUrl, order, startDate, endDate, isActive } = req.body;

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        type,
        title,
        description,
        imageUrl,
        linkUrl,
        order,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive,
      },
    });

    res.json({
      success: true,
      data: banner,
    });
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update banner',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/banners/{id}:
 *   delete:
 *     summary: 배너 삭제
 *     tags: [Admin - Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 배너 ID
 *     responses:
 *       200:
 *         description: 배너 삭제 성공
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
 *                   example: Banner deleted successfully
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 배너를 찾을 수 없음
 */
// Delete banner
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.banner.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Banner deleted successfully',
    });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete banner',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/banners/{id}/view:
 *   post:
 *     summary: 배너 조회수 증가
 *     tags: [Admin - Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 배너 ID
 *     responses:
 *       200:
 *         description: 조회수 증가 성공
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
 *                   example: View count incremented
 *       404:
 *         description: 배너를 찾을 수 없음
 */
// Increment view count
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
 * /api/admin/banners/{id}/click:
 *   post:
 *     summary: 배너 클릭수 증가
 *     tags: [Admin - Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 배너 ID
 *     responses:
 *       200:
 *         description: 클릭수 증가 성공
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
 *                   example: Click count incremented
 *       404:
 *         description: 배너를 찾을 수 없음
 */
// Increment click count
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
