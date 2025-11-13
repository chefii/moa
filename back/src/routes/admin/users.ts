import { Router, Request, Response } from 'express';
import { prisma } from '../../main';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();

// Get all users with role filtering
router.get('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req: Request, res: Response) => {
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

// Get user by ID
router.get('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req: Request, res: Response) => {
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

// Update user roles (다중 역할 지원)
router.put('/:id/roles', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req: Request, res: Response) => {
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
      'MODERATOR',
      'CONTENT_MANAGER',
      'SUPPORT_MANAGER',
      'SETTLEMENT_MANAGER',
      'ADMIN',
      'SUPER_ADMIN',
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

// Get role statistics (다중 역할 지원)
router.get('/stats/roles', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req: Request, res: Response) => {
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
      'MODERATOR',
      'CONTENT_MANAGER',
      'SUPPORT_MANAGER',
      'SETTLEMENT_MANAGER',
      'ADMIN',
      'SUPER_ADMIN',
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

export default router;
