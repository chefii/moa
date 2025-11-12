import { Router, Request, Response } from 'express';
import { prisma } from '../main';
import { authenticate } from '../middlewares/auth';

const router = Router();

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
    console.error('Get user level error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user level',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

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
    console.error('Get user badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user badges',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

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
    console.error('Get badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get badges',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

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
    console.error('Get user streak error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user streak',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

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
    console.error('Get user points error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user points',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

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
    console.error('Get point transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get point transactions',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
