import { Router, Request, Response } from 'express';
import { prisma } from '../main';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Get all users (Admin only)
router.get('/', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          nickname: true,
          phone: true,
          location: true,
          isVerified: true,
          isPhoneVerified: true,
          emailVerifiedAt: true,
          phoneVerifiedAt: true,
          createdAt: true,
          userRoles: {
            select: {
              roleCode: true,
              isPrimary: true,
            },
            orderBy: {
              isPrimary: 'desc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get user by ID (Admin only)
router.get('/:userId', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        phone: true,
        location: true,
        bio: true,
        profileImage: true,
        isVerified: true,
        isPhoneVerified: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          select: {
            roleCode: true,
            isPrimary: true,
          },
          orderBy: {
            isPrimary: 'desc',
          },
        },
        userLevel: {
          select: {
            level: true,
            growthPoints: true,
          },
        },
        userStreak: {
          select: {
            currentStreak: true,
            longestStreak: true,
          },
        },
        interests: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
                color: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get user statistics (Admin only)
router.get('/stats/overview', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const [totalUsers, usersByRole, recentUsers] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Users by role - now using userRoles table
      prisma.userRole.groupBy({
        by: ['roleCode'],
        _count: true,
      }),

      // Recent users (last 7 days)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const roleStats = usersByRole.reduce((acc, item) => {
      acc[item.roleCode] = item._count;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        totalUsers,
        roleStats,
        recentUsers,
      },
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
