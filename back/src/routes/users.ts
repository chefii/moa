import logger from '../config/logger';
import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 사용자 목록 조회 (관리자 전용)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *           default: 10
 *         description: 페이지당 항목 수
 *     responses:
 *       200:
 *         description: 사용자 목록 조회 성공
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
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: 사용자 상세 조회 (관리자 전용)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 사용자 정보 조회 성공
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
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     nickname:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     location:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     profileImage:
 *                       type: string
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
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
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/users/stats/overview:
 *   get:
 *     summary: 사용자 통계 조회 (슈퍼 관리자 전용)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 통계 조회 성공
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
 *                     totalUsers:
 *                       type: integer
 *                       example: 1000
 *                     roleStats:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                       example:
 *                         MEMBER: 950
 *                         BUSINESS: 45
 *                         SUPER_ADMIN: 5
 *                     recentUsers:
 *                       type: integer
 *                       example: 50
 *                       description: 최근 7일간 가입한 사용자 수
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음 (슈퍼 관리자만 접근 가능)
 */
// Get user statistics (Admin only)
router.get('/stats/overview', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
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
    logger.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
