import logger from '../../config/logger';
import { Router, Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /api/admin/notices:
 *   get:
 *     summary: 공지사항 목록 조회
 *     tags: [Admin - Notices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: 공지사항 타입 필터
 *       - in: query
 *         name: isPinned
 *         schema:
 *           type: boolean
 *         description: 고정 여부 필터
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
 *         description: 공지사항 목록 조회 성공
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
// Get all notices
router.get('/', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { type, isPinned, isActive, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (type) where.type = type;
    if (isPinned !== undefined) where.isPinned = isPinned === 'true';
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: Number(limit),
      }),
      prisma.notice.count({ where }),
    ]);

    res.json({
      success: true,
      data: notices,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Get notices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notices',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/notices/{id}:
 *   get:
 *     summary: 공지사항 상세 조회
 *     tags: [Admin - Notices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 공지사항 ID
 *     responses:
 *       200:
 *         description: 공지사항 상세 조회 성공 (조회수 자동 증가)
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
 *         description: 공지사항을 찾을 수 없음
 */
// Get notice by ID
router.get('/:id', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const notice = await prisma.notice.findUnique({
      where: { id },
    });

    if (!notice) {
      res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
      return;
    }

    // Increment view count
    await prisma.notice.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    res.json({
      success: true,
      data: notice,
    });
  } catch (error) {
    logger.error('Get notice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notice',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/notices:
 *   post:
 *     summary: 공지사항 생성
 *     tags: [Admin - Notices]
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
 *               - content
 *             properties:
 *               type:
 *                 type: string
 *                 example: GENERAL
 *               title:
 *                 type: string
 *                 example: 중요 공지사항
 *               content:
 *                 type: string
 *                 example: 공지사항 내용입니다.
 *               isPinned:
 *                 type: boolean
 *                 example: false
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-01-01T00:00:00Z
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-12-31T23:59:59Z
 *     responses:
 *       201:
 *         description: 공지사항 생성 성공
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
// Create notice
router.post('/', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { type, title, content, isPinned, isActive, startDate, endDate } = req.body;

    if (!title || !content) {
      res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
      return;
    }

    const notice = await prisma.notice.create({
      data: {
        type: type || 'GENERAL',
        title,
        content,
        isPinned: isPinned || false,
        isActive: isActive !== undefined ? isActive : true,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        createdBy: req.user!.userId,
      },
    });

    res.status(201).json({
      success: true,
      data: notice,
    });
  } catch (error) {
    logger.error('Create notice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notice',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/notices/{id}:
 *   put:
 *     summary: 공지사항 수정
 *     tags: [Admin - Notices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 공지사항 ID
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
 *               content:
 *                 type: string
 *               isPinned:
 *                 type: boolean
 *               isActive:
 *                 type: boolean
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: 공지사항 수정 성공
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
 *         description: 공지사항을 찾을 수 없음
 */
// Update notice
router.put('/:id', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = { ...req.body };

    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    const notice = await prisma.notice.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      data: notice,
    });
  } catch (error) {
    logger.error('Update notice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notice',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/notices/{id}:
 *   delete:
 *     summary: 공지사항 삭제
 *     tags: [Admin - Notices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 공지사항 ID
 *     responses:
 *       200:
 *         description: 공지사항 삭제 성공
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
 *                   example: Notice deleted successfully
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 공지사항을 찾을 수 없음
 */
// Delete notice
router.delete('/:id', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.notice.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Notice deleted successfully',
    });
  } catch (error) {
    logger.error('Delete notice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notice',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
