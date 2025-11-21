import logger from '../config/logger';
import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { authenticate } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /api/popups/active:
 *   get:
 *     summary: 활성 팝업 목록 조회
 *     tags: [Popups]
 *     description: 현재 활성화된 팝업 목록을 조회합니다. 인증된 사용자의 경우 이미 본 팝업은 제외됩니다.
 *     responses:
 *       200:
 *         description: 활성 팝업 조회 성공
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
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [MODAL, BANNER, TOAST]
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *                       imageUrl:
 *                         type: string
 *                         nullable: true
 *                       linkUrl:
 *                         type: string
 *                         nullable: true
 *                       buttonText:
 *                         type: string
 *                         nullable: true
 *                       showOnce:
 *                         type: boolean
 *                       priority:
 *                         type: integer
 *       500:
 *         description: 팝업 조회 실패
 */
// Get active popups for public display
// Optional authentication - if authenticated, filter out viewed popups
router.get('/active', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const authHeader = req.headers.authorization;
    let userId: string | null = null;

    // Try to extract userId from token if provided (optional auth)
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        userId = decoded.userId;
      } catch (err) {
        // Invalid token, continue as guest
        userId = null;
      }
    }

    const popups = await prisma.popup.findMany({
      where: {
        isActive: true,
        startDate: {
          lte: now,
        },
        endDate: {
          gte: now,
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        image: {
          select: {
            id: true,
            url: true,
          },
        },
        linkUrl: true,
        buttonText: true,
        showOnce: true,
        priority: true,
      },
    });

    // Filter out popups that user has already viewed (if userId is available)
    let filteredPopups = popups;
    if (userId) {
      const viewedPopupIds = await prisma.popupView.findMany({
        where: {
          userId,
          popupId: {
            in: popups.map(p => p.id),
          },
        },
        select: {
          popupId: true,
        },
      });

      const viewedIds = new Set(viewedPopupIds.map(v => v.popupId));
      filteredPopups = popups.filter(p => !p.showOnce || !viewedIds.has(p.id));
    }

    res.json({
      success: true,
      data: filteredPopups,
    });
  } catch (error) {
    logger.error('Get active popups error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active popups',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/popups/view/{popupId}:
 *   post:
 *     summary: 팝업 조회 기록
 *     tags: [Popups]
 *     description: 팝업 조회를 기록합니다. 인증된 사용자의 경우 DB에 저장되며, 비인증 사용자도 조회수는 증가합니다.
 *     parameters:
 *       - in: path
 *         name: popupId
 *         required: true
 *         schema:
 *           type: string
 *         description: 팝업 ID
 *     responses:
 *       200:
 *         description: 팝업 조회 기록 성공
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
 *                   example: Popup view recorded
 *       500:
 *         description: 팝업 조회 기록 실패
 */
// Record popup view
// Optional authentication - if authenticated, save to database
router.post('/view/:popupId', async (req: Request, res: Response) => {
  try {
    const { popupId } = req.params;
    const authHeader = req.headers.authorization;
    let userId: string | null = null;

    // Try to extract userId from token if provided (optional auth)
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        userId = decoded.userId;
      } catch (err) {
        // Invalid token, continue as guest
        userId = null;
      }
    }

    // Only record view if user is authenticated
    if (userId) {
      await prisma.popupView.upsert({
        where: {
          popupId_userId: {
            popupId,
            userId,
          },
        },
        create: {
          popupId,
          userId,
        },
        update: {
          viewedAt: new Date(),
        },
      });
    }

    // Increment total view count (fire and forget)
    prisma.popup.update({
      where: { id: popupId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    }).catch(err => logger.error('Failed to increment view count:', err));

    res.json({
      success: true,
      message: 'Popup view recorded',
    });
  } catch (error) {
    logger.error('Record popup view error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record popup view',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
