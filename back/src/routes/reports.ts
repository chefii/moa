import logger from '../config/logger';
import { Router, Request, Response } from 'express';
import { authenticate } from '../middlewares/auth';
import { prisma } from '../config/prisma';

const router = Router();

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: 사용자 신고
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportedUserId
 *               - reasonCode
 *             properties:
 *               reportedUserId:
 *                 type: string
 *                 description: 신고 대상 사용자 ID
 *               reasonCode:
 *                 type: string
 *                 description: 신고 사유 코드
 *               description:
 *                 type: string
 *                 description: 상세 설명
 *               reportType:
 *                 type: string
 *                 description: 신고 타입 (USER, GATHERING 등)
 *     responses:
 *       201:
 *         description: 신고 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { reportedUserId, reasonCode, description, reportType } = req.body;
    const userId = (req as any).user.userId;

    if (!reportedUserId || !reasonCode) {
      return res.status(400).json({
        success: false,
        message: '필수 정보를 입력해주세요',
      });
    }

    // Check if user is trying to report themselves
    if (reportedUserId === userId) {
      return res.status(400).json({
        success: false,
        message: '자기 자신은 신고할 수 없습니다',
      });
    }

    // Check if reported user exists
    const reportedUser = await prisma.user.findUnique({
      where: { id: reportedUserId },
      select: { id: true },
    });

    if (!reportedUser) {
      return res.status(404).json({
        success: false,
        message: '신고 대상 사용자를 찾을 수 없습니다',
      });
    }

    // Check if user already reported this user
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: userId,
        reportedId: reportedUserId,
        postId: null,
        gatheringId: null,
      },
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: '이미 신고한 사용자입니다',
      });
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        reporterId: userId,
        reportedId: reportedUserId,
        reasonCode,
        description: description || null,
        statusCode: 'PENDING',
      },
    });

    res.status(201).json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error('Error reporting user:', error);
    res.status(500).json({
      success: false,
      message: '신고 처리 중 오류가 발생했습니다',
    });
  }
});

export default router;
