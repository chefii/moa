import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../../main';
import { authenticate, authorize } from '../../middlewares/auth';
import { sendVerificationEmail } from '../../utils/email';

const router = Router();

/**
 * @swagger
 * /api/admin/users-verification/{userId}/verification:
 *   patch:
 *     summary: 사용자 인증 상태 수동 변경
 *     tags: [Admin - Users Verification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isVerified:
 *                 type: boolean
 *                 example: true
 *               isPhoneVerified:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: 인증 상태 변경 성공
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
 *                   example: User verification status updated successfully
 *                 data:
 *                   type: object
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
router.patch(
  '/:userId/verification',
  authenticate,
  authorize('ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { isVerified, isPhoneVerified } = req.body;

      const updateData: any = {};

      if (typeof isVerified === 'boolean') {
        updateData.isVerified = isVerified;
        if (isVerified) {
          updateData.emailVerifiedAt = new Date();
        }
      }

      if (typeof isPhoneVerified === 'boolean') {
        updateData.isPhoneVerified = isPhoneVerified;
        if (isPhoneVerified) {
          updateData.phoneVerifiedAt = new Date();
        }
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          isVerified: true,
          isPhoneVerified: true,
          emailVerifiedAt: true,
          phoneVerifiedAt: true,
        },
      });

      res.json({
        success: true,
        message: 'User verification status updated successfully',
        data: user,
      });
    } catch (error) {
      console.error('Update verification status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update verification status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/users-verification/{userId}/resend-email:
 *   post:
 *     summary: 사용자에게 인증 이메일 재발송
 *     tags: [Admin - Users Verification]
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
 *         description: 인증 이메일 재발송 성공
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
 *                   example: Verification email sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     sentAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: 이미 인증된 이메일
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
router.post(
  '/:userId/resend-email',
  authenticate,
  authorize('ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      // 사용자 정보 조회
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          isVerified: true,
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      if (user.isVerified) {
        res.status(400).json({
          success: false,
          message: 'Email already verified',
        });
        return;
      }

      // 기존 토큰 삭제
      await prisma.verificationToken.deleteMany({
        where: {
          userId: user.id,
          type: 'EMAIL',
        },
      });

      // 새 토큰 생성
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1시간

      await prisma.verificationToken.create({
        data: {
          userId: user.id,
          token,
          type: 'EMAIL',
          expiresAt,
        },
      });

      // 이메일 발송
      const emailSent = await sendVerificationEmail(user.email, user.name, token);

      if (!emailSent) {
        res.status(500).json({
          success: false,
          message: 'Failed to send verification email',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Verification email sent successfully',
        data: {
          email: user.email,
          sentAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Resend verification email error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resend verification email',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/users-verification/stats:
 *   get:
 *     summary: 인증 통계 조회
 *     tags: [Admin - Users Verification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 인증 통계 조회 성공
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
 *                     total:
 *                       type: integer
 *                     emailVerified:
 *                       type: object
 *                     phoneVerified:
 *                       type: object
 *                     bothVerified:
 *                       type: object
 *                     notVerified:
 *                       type: object
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 */
router.get(
  '/stats',
  authenticate,
  authorize('ROLE_SUPER_ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const [
        totalUsers,
        emailVerified,
        phoneVerified,
        bothVerified,
        notVerified,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isVerified: true } }),
        prisma.user.count({ where: { isPhoneVerified: true } }),
        prisma.user.count({
          where: {
            isVerified: true,
            isPhoneVerified: true,
          },
        }),
        prisma.user.count({
          where: {
            isVerified: false,
            isPhoneVerified: false,
          },
        }),
      ]);

      res.json({
        success: true,
        data: {
          total: totalUsers,
          emailVerified: {
            count: emailVerified,
            percentage: totalUsers > 0 ? ((emailVerified / totalUsers) * 100).toFixed(2) : 0,
          },
          phoneVerified: {
            count: phoneVerified,
            percentage: totalUsers > 0 ? ((phoneVerified / totalUsers) * 100).toFixed(2) : 0,
          },
          bothVerified: {
            count: bothVerified,
            percentage: totalUsers > 0 ? ((bothVerified / totalUsers) * 100).toFixed(2) : 0,
          },
          notVerified: {
            count: notVerified,
            percentage: totalUsers > 0 ? ((notVerified / totalUsers) * 100).toFixed(2) : 0,
          },
        },
      });
    } catch (error) {
      console.error('Get verification stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get verification statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/users-verification/unverified:
 *   get:
 *     summary: 미인증 사용자 목록 조회
 *     tags: [Admin - Users Verification]
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
 *           default: 20
 *         description: 페이지당 항목 수
 *     responses:
 *       200:
 *         description: 미인증 사용자 목록 조회 성공
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
router.get(
  '/unverified',
  authenticate,
  authorize('ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: {
            OR: [{ isVerified: false }, { isPhoneVerified: false }],
          },
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            isVerified: true,
            isPhoneVerified: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
        }),
        prisma.user.count({
          where: {
            OR: [{ isVerified: false }, { isPhoneVerified: false }],
          },
        }),
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
      console.error('Get unverified users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get unverified users',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
