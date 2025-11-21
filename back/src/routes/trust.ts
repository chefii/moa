import logger from '../config/logger';
import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { authenticate } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /api/trust/level/{userId}:
 *   get:
 *     summary: 사용자 레벨 정보 조회
 *     tags: [Trust]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         description: 사용자 ID (me 또는 생략 시 본인 정보)
 *         example: me
 *     responses:
 *       200:
 *         description: 레벨 정보 조회 성공
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
 *                     level:
 *                       type: number
 *                       example: 5
 *                     growthPoints:
 *                       type: number
 *                       example: 120
 *                     nextLevelPoints:
 *                       type: number
 *                       example: 250
 *       404:
 *         description: 사용자 레벨 정보를 찾을 수 없음
 *       401:
 *         description: 인증 필요
 */
// Get user level (me or by userId)
router.get('/level/:userId?', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId === 'me' || !req.params.userId
      ? req.user!.userId
      : req.params.userId;

    const userLevel = await prisma.userLevel.findUnique({
      where: { userId },
    });

    if (!userLevel) {
      res.status(404).json({
        success: false,
        message: 'User level not found',
      });
      return;
    }

    // Calculate next level points
    const nextLevelPoints = userLevel.level * 50; // Simple formula

    res.json({
      success: true,
      data: {
        level: userLevel.level,
        growthPoints: userLevel.growthPoints,
        nextLevelPoints,
      },
    });
  } catch (error) {
    logger.error('Get user level error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user level',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/trust/badges/{userId}:
 *   get:
 *     summary: 사용자 뱃지 목록 조회
 *     tags: [Trust]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         description: 사용자 ID (me 또는 생략 시 본인 정보)
 *         example: me
 *     responses:
 *       200:
 *         description: 뱃지 목록 조회 성공
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
 *                       code:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       category:
 *                         type: string
 *                       icon:
 *                         type: string
 *                       earnedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: 인증 필요
 */
// Get user badges (me or by userId)
router.get('/badges/:userId?', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId === 'me' || !req.params.userId
      ? req.user!.userId
      : req.params.userId;

    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: {
        earnedAt: 'desc',
      },
    });

    const badges = userBadges.map((ub) => ({
      id: ub.badge.id,
      code: ub.badge.code,
      name: ub.badge.name,
      description: ub.badge.description,
      category: ub.badge.category,
      icon: ub.badge.icon,
      earnedAt: ub.earnedAt.toISOString(),
    }));

    res.json({
      success: true,
      data: badges,
    });
  } catch (error) {
    logger.error('Get user badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user badges',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/trust/badges/{userId}/all:
 *   get:
 *     summary: 사용자 배지 전체 목록 조회 (획득/미획득 포함)
 *     tags: [Trust]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         description: 사용자 ID (me 또는 생략 시 본인 정보)
 *         example: me
 *     responses:
 *       200:
 *         description: 배지 전체 목록 조회 성공
 */
router.get('/badges/:userId/all', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId === 'me'
      ? req.user!.userId
      : req.params.userId;

    // 전체 활성 배지 조회
    const allBadges = await prisma.badge.findMany({
      where: { isActive: true },
      orderBy: { category: 'asc' },
    });

    // 사용자가 획득한 배지 조회
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
    });

    // 획득 배지 맵 생성
    const earnedBadgeMap = new Map(
      userBadges.map((ub) => [ub.badgeId, ub.earnedAt])
    );

    // 전체 배지에 획득 여부 추가
    const badges = allBadges.map((badge) => ({
      id: badge.id,
      code: badge.code,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
      isEarned: earnedBadgeMap.has(badge.id),
      earnedAt: earnedBadgeMap.get(badge.id)?.toISOString() || null,
    }));

    res.json({
      success: true,
      data: badges,
    });
  } catch (error) {
    logger.error('Get user badges all error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user badges',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/trust/badges:
 *   get:
 *     summary: 전체 뱃지 목록 조회
 *     tags: [Trust]
 *     responses:
 *       200:
 *         description: 전체 뱃지 목록 조회 성공
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
 *                 count:
 *                   type: number
 *                   example: 15
 */
// Get all available badges
router.get('/badges', async (req: Request, res: Response) => {
  try {
    const badges = await prisma.badge.findMany({
      orderBy: { category: 'asc' },
    });

    res.json({
      success: true,
      data: badges,
      count: badges.length,
    });
  } catch (error) {
    logger.error('Get badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get badges',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/trust/streak/{userId}:
 *   get:
 *     summary: 사용자 연속 활동 일수 조회
 *     tags: [Trust]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         description: 사용자 ID (me 또는 생략 시 본인 정보)
 *         example: me
 *     responses:
 *       200:
 *         description: 연속 활동 일수 조회 성공
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
 *                     currentStreak:
 *                       type: number
 *                       example: 7
 *                     longestStreak:
 *                       type: number
 *                       example: 30
 *                     lastActivityDate:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: 사용자 연속 활동 정보를 찾을 수 없음
 *       401:
 *         description: 인증 필요
 */
// Get user streak (me or by userId)
router.get('/streak/:userId?', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId === 'me' || !req.params.userId
      ? req.user!.userId
      : req.params.userId;

    const userStreak = await prisma.userStreak.findUnique({
      where: { userId },
    });

    if (!userStreak) {
      res.status(404).json({
        success: false,
        message: 'User streak not found',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        currentStreak: userStreak.currentStreak,
        longestStreak: userStreak.longestStreak,
        lastActivityDate: userStreak.lastActivityDate?.toISOString() || null,
      },
    });
  } catch (error) {
    logger.error('Get user streak error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user streak',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/trust/points/{userId}:
 *   get:
 *     summary: 사용자 포인트 정보 조회
 *     tags: [Trust]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         description: 사용자 ID (me 또는 생략 시 본인 정보)
 *         example: me
 *     responses:
 *       200:
 *         description: 포인트 정보 조회 성공
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
 *                     current:
 *                       type: number
 *                       example: 1500
 *                     monthlyEarned:
 *                       type: number
 *                       example: 500
 *                     totalEarned:
 *                       type: number
 *                       example: 5000
 *       401:
 *         description: 인증 필요
 */
// Get user points (me or by userId)
router.get('/points/:userId?', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId === 'me' || !req.params.userId
      ? req.user!.userId
      : req.params.userId;

    // Get current points balance
    const earnedPoints = await prisma.userPoint.aggregate({
      where: {
        userId,
        type: 'EARN',
      },
      _sum: {
        points: true,
      },
    });

    const spentPoints = await prisma.userPoint.aggregate({
      where: {
        userId,
        type: 'SPEND',
      },
      _sum: {
        points: true,
      },
    });

    const currentPoints = (earnedPoints._sum?.points || 0) - (spentPoints._sum?.points || 0);
    const totalEarned = earnedPoints._sum?.points || 0;

    // Get monthly earned points
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const monthlyEarned = await prisma.userPoint.aggregate({
      where: {
        userId,
        type: 'EARN',
        createdAt: {
          gte: oneMonthAgo,
        },
      },
      _sum: {
        points: true,
      },
    });

    res.json({
      success: true,
      data: {
        current: currentPoints,
        monthlyEarned: monthlyEarned._sum?.points || 0,
        totalEarned,
      },
    });
  } catch (error) {
    logger.error('Get user points error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user points',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/trust/points/transactions:
 *   get:
 *     summary: 포인트 거래 내역 조회
 *     tags: [Trust]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *         description: 조회할 거래 개수
 *         example: 20
 *     responses:
 *       200:
 *         description: 포인트 거래 내역 조회 성공
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
 *                       userId:
 *                         type: string
 *                       points:
 *                         type: number
 *                       type:
 *                         type: string
 *                         enum: [EARN, SPEND]
 *                       description:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: 인증 필요
 */
// Get point transactions
router.get('/points/transactions', authenticate, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const userId = req.user!.userId;

    const transactions = await prisma.userPoint.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    logger.error('Get point transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get point transactions',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
