import { Router, Request, Response } from 'express';
import { prisma } from '../../main';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /api/admin/reports/badge:
 *   get:
 *     summary: 대기중인 신고 개수 조회 (뱃지용)
 *     tags: [Admin - Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 대기중인 신고 개수 조회 성공
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
 *                     count:
 *                       type: integer
 *                       example: 15
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 */
// Get pending reports count (for badge) - MUST be before /:id route
router.get('/badge', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MODERATOR'), async (req: Request, res: Response) => {
  try {
    const pendingCount = await prisma.report.count({
      where: {
        OR: [
          { statusCode: 'PENDING' },
          { statusCode: 'REVIEWING' },
        ],
      },
    });

    res.json({
      success: true,
      data: {
        count: pendingCount,
      },
    });
  } catch (error) {
    console.error('Get report badge count error:', error);
    // Return 0 instead of 500 error to prevent UI from breaking
    res.json({
      success: true,
      data: {
        count: 0,
      },
    });
  }
});

/**
 * @swagger
 * /api/admin/reports/stats/overview:
 *   get:
 *     summary: 신고 통계 조회
 *     tags: [Admin - Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 신고 통계 조회 성공
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
 *                     totalReports:
 *                       type: integer
 *                       example: 150
 *                     pendingReports:
 *                       type: integer
 *                       example: 10
 *                     reviewingReports:
 *                       type: integer
 *                       example: 5
 *                     resolvedReports:
 *                       type: integer
 *                       example: 120
 *                     rejectedReports:
 *                       type: integer
 *                       example: 15
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 */
// Get report statistics - MUST be before /:id route
router.get('/stats/overview', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MODERATOR'), async (req: Request, res: Response) => {
  try {
    const [totalReports, pendingReports, reviewingReports, resolvedReports, rejectedReports] = await Promise.all([
      prisma.report.count(),
      prisma.report.count({ where: { statusCode: 'PENDING' } }),
      prisma.report.count({ where: { statusCode: 'REVIEWING' } }),
      prisma.report.count({ where: { statusCode: 'RESOLVED' } }),
      prisma.report.count({ where: { statusCode: 'REJECTED' } }),
    ]);

    res.json({
      success: true,
      data: {
        totalReports,
        pendingReports,
        reviewingReports,
        resolvedReports,
        rejectedReports,
      },
    });
  } catch (error) {
    console.error('Get report statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     summary: 신고 목록 조회
 *     tags: [Admin - Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, REVIEWING, RESOLVED, REJECTED]
 *         description: 신고 상태 필터
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
 *         description: 신고 목록 조회 성공
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
// Get all reports
router.get('/', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.statusCode = status;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          reported: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          reasonCommonCode: {
            select: {
              code: true,
              name: true,
              description: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.report.count({ where }),
    ]);

    res.json({
      success: true,
      data: reports,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/reports/{id}:
 *   get:
 *     summary: 신고 상세 조회
 *     tags: [Admin - Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 신고 ID
 *     responses:
 *       200:
 *         description: 신고 상세 조회 성공
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
 *                     reporter:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     reported:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 신고를 찾을 수 없음
 */
// Get report by ID
router.get('/:id', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reported: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reasonCommonCode: {
          select: {
            code: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found',
      });
      return;
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/reports/{id}/status:
 *   put:
 *     summary: 신고 상태 업데이트
 *     tags: [Admin - Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 신고 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, REVIEWING, RESOLVED, REJECTED]
 *                 example: RESOLVED
 *               adminNote:
 *                 type: string
 *                 example: 해당 게시물 삭제 처리 완료
 *     responses:
 *       200:
 *         description: 신고 상태 업데이트 성공
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
// Update report status
router.put('/:id/status', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!status) {
      res.status(400).json({
        success: false,
        message: 'Status is required',
      });
      return;
    }

    const report = await prisma.report.update({
      where: { id },
      data: {
        statusCode: status,
        adminNote,
        resolvedAt: status === 'RESOLVED' ? new Date() : undefined,
      },
    });

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
