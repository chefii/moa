import { Router, Request, Response } from 'express';
import { prisma } from '../../main';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /api/admin/popups:
 *   get:
 *     summary: 팝업 목록 조회
 *     tags: [Admin - Popups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: 팝업 타입 필터
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
 *         description: 팝업 목록 조회 성공
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
// Get all popups
router.get('/', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { type, isActive, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [popups, total] = await Promise.all([
      prisma.popup.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: Number(limit),
      }),
      prisma.popup.count({ where }),
    ]);

    res.json({
      success: true,
      data: popups,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get popups error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popups',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/popups:
 *   post:
 *     summary: 팝업 생성
 *     tags: [Admin - Popups]
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
 *               - content
 *               - startDate
 *               - endDate
 *             properties:
 *               type:
 *                 type: string
 *                 example: NOTICE
 *               title:
 *                 type: string
 *                 example: 중요 공지사항
 *               content:
 *                 type: string
 *                 example: 팝업 내용
 *               imageUrl:
 *                 type: string
 *                 example: https://example.com/popup.jpg
 *               linkUrl:
 *                 type: string
 *                 example: https://example.com/detail
 *               buttonText:
 *                 type: string
 *                 example: 자세히 보기
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
 *               showOnce:
 *                 type: boolean
 *                 example: false
 *               priority:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: 팝업 생성 성공
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
// Create popup
router.post('/', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { type, title, content, imageUrl, linkUrl, buttonText, startDate, endDate, isActive, showOnce, priority } = req.body;

    if (!type || !title || !content || !startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: 'Type, title, content, startDate, and endDate are required',
      });
      return;
    }

    const popup = await prisma.popup.create({
      data: {
        type,
        title,
        content,
        imageUrl,
        linkUrl,
        buttonText,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? isActive : true,
        showOnce: showOnce || false,
        priority: priority || 0,
        createdBy: req.user!.userId,
      },
    });

    res.status(201).json({
      success: true,
      data: popup,
    });
  } catch (error) {
    console.error('Create popup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create popup',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/popups/{id}:
 *   put:
 *     summary: 팝업 수정
 *     tags: [Admin - Popups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 팝업 ID
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
 *               imageUrl:
 *                 type: string
 *               linkUrl:
 *                 type: string
 *               buttonText:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               isActive:
 *                 type: boolean
 *               showOnce:
 *                 type: boolean
 *               priority:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 팝업 수정 성공
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
 *         description: 팝업을 찾을 수 없음
 */
// Update popup
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = { ...req.body };

    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    const popup = await prisma.popup.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      data: popup,
    });
  } catch (error) {
    console.error('Update popup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update popup',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/popups/{id}:
 *   delete:
 *     summary: 팝업 삭제
 *     tags: [Admin - Popups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 팝업 ID
 *     responses:
 *       200:
 *         description: 팝업 삭제 성공
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
 *                   example: Popup deleted successfully
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 팝업을 찾을 수 없음
 */
// Delete popup
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.popup.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Popup deleted successfully',
    });
  } catch (error) {
    console.error('Delete popup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete popup',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
