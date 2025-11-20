import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../../main';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: 사용자 목록 조회 (역할 필터링)
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: 역할 필터 (예 USER, ADMIN, BUSINESS_USER 등)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 검색어 (이름, 이메일, 닉네임)
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
// Get all users with role filtering
router.get('/', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    // Role filter - now using userRoles relation
    if (role && role !== 'ALL') {
      where.userRoles = {
        some: {
          roleCode: role,
        },
      };
    }

    // Search filter (name, email, nickname)
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { nickname: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          nickname: true,
          profileImage: true,
          isVerified: true,
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
          businessProfile: {
            select: {
              businessName: true,
              isApproved: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
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

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: 사용자 상세 조회
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
// Get user by ID
router.get('/:id', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        profileImage: true,
        bio: true,
        phone: true,
        location: true,
        gender: true,
        age: true,
        isVerified: true,
        isPhoneVerified: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          select: {
            id: true,
            roleCode: true,
            isPrimary: true,
            grantedAt: true,
            expiresAt: true,
          },
          orderBy: {
            isPrimary: 'desc',
          },
        },
        businessProfile: {
          select: {
            businessName: true,
            businessNumber: true,
            businessAddress: true,
            businessPhone: true,
            businessDescription: true,
            isApproved: true,
            approvedAt: true,
            rejectionReason: true,
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

/**
 * @swagger
 * /api/admin/users/{id}/roles:
 *   put:
 *     summary: 사용자 역할 업데이트 (다중 역할 지원)
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roles
 *             properties:
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["VERIFIED_USER", "HOST"]
 *                 description: 부여할 역할 코드 배열
 *               primaryRole:
 *                 type: string
 *                 example: "HOST"
 *                 description: 주 역할 (roles 배열 중 하나여야 함)
 *               reason:
 *                 type: string
 *                 example: "호스트 권한 부여"
 *                 description: 역할 변경 사유
 *     responses:
 *       200:
 *         description: 사용자 역할 업데이트 성공
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
 *                 message:
 *                   type: string
 *                   example: User roles updated successfully
 *       400:
 *         description: 유효하지 않은 역할 또는 필수 필드 누락
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
// Update user roles (다중 역할 지원)
router.put('/:id/roles', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { roles, primaryRole, reason } = req.body;

    // roles should be an array of role codes
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Roles array is required and must not be empty',
      });
      return;
    }

    // Valid roles from CommonCode
    const validRoles = [
      'USER',
      'VERIFIED_USER',
      'HOST',
      'PREMIUM_USER',
      'BUSINESS_PENDING',
      'BUSINESS_USER',
      'BUSINESS_MANAGER',
      'ROLE_MODERATOR',
      'CONTENT_MANAGER',
      'SUPPORT_MANAGER',
      'SETTLEMENT_MANAGER',
      'ROLE_ADMIN',
      'ROLE_SUPER_ADMIN',
    ];

    // Validate all roles
    const invalidRoles = roles.filter((role: string) => !validRoles.includes(role));
    if (invalidRoles.length > 0) {
      res.status(400).json({
        success: false,
        message: `Invalid roles: ${invalidRoles.join(', ')}`,
      });
      return;
    }

    // Validate primaryRole is in roles array
    if (primaryRole && !roles.includes(primaryRole)) {
      res.status(400).json({
        success: false,
        message: 'Primary role must be one of the selected roles',
      });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        userRoles: {
          select: {
            roleCode: true,
            isPrimary: true,
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

    // Extract IP address
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
                      req.socket.remoteAddress ||
                      'unknown';

    // Use transaction to update roles atomically
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing user roles
      await tx.userRole.deleteMany({
        where: { userId: id },
      });

      // Create new user roles
      await Promise.all(
        roles.map((roleCode: string) =>
          tx.userRole.create({
            data: {
              userId: id,
              roleCode,
              isPrimary: roleCode === (primaryRole || roles[0]),
              grantedBy: req.user!.userId,
            },
          })
        )
      );

      // Get updated user with new roles
      const updatedUser = await tx.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          nickname: true,
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
      });

      // Record role change history
      const oldRoles = user.userRoles.map(ur => ur.roleCode).join(', ') || 'none';
      const newRoles = roles.join(', ');

      await tx.roleChangeHistory.create({
        data: {
          userId: id,
          changedBy: req.user!.userId,
          oldRole: oldRoles,
          newRole: newRoles,
          reason,
          ipAddress,
        },
      });

      return updatedUser;
    });

    res.json({
      success: true,
      data: result,
      message: 'User roles updated successfully',
    });
  } catch (error) {
    console.error('Update user roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user roles',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/users/stats/roles:
 *   get:
 *     summary: 역할별 통계 조회
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 역할별 통계 조회 성공
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
 *                     roles:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                       example:
 *                         USER: 800
 *                         VERIFIED_USER: 500
 *                         HOST: 150
 *                         BUSINESS_USER: 50
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 */
// Get role statistics (다중 역할 지원)
router.get('/stats/roles', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_ADMIN'), async (req: Request, res: Response) => {
  try {
    // Get total users count
    const totalUsers = await prisma.user.count();

    // Get count for each role from userRoles table
    // Note: Users with multiple roles will be counted in each role
    const roleCodes = [
      'USER',
      'VERIFIED_USER',
      'HOST',
      'PREMIUM_USER',
      'BUSINESS_PENDING',
      'BUSINESS_USER',
      'BUSINESS_MANAGER',
      'ROLE_MODERATOR',
      'CONTENT_MANAGER',
      'SUPPORT_MANAGER',
      'SETTLEMENT_MANAGER',
      'ROLE_ADMIN',
      'ROLE_SUPER_ADMIN',
    ];

    const roleCounts = await Promise.all(
      roleCodes.map(async (roleCode) => {
        const count = await prisma.userRole.count({
          where: { roleCode },
        });
        return { roleCode, count };
      })
    );

    // Convert to object format
    const roles: Record<string, number> = {};
    roleCounts.forEach(({ roleCode, count }) => {
      roles[roleCode] = count;
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        roles,
      },
    });
  } catch (error) {
    console.error('Get role statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch role statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}/reset-password:
 *   post:
 *     summary: 사용자 비밀번호 초기화 (1234로 재설정)
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 비밀번호 초기화 성공
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
 *                   example: 사용자의 비밀번호를 임시비밀번호로 변경 했습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
// Reset user password to 1234
router.post('/:id/reset-password', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    //임시비밀번호 (1234)
    const newPassword = '1234';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    res.json({
      success: true,
      message: `사용자의 비밀번호를 임시비밀번호로 변경 했습니다.`,
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
