import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../main';
import { authenticate } from '../middlewares/auth';
import { sendVerificationEmail } from '../utils/email';
import {
  sendVerificationSMS,
  generateVerificationCode,
  validatePhoneNumber,
} from '../utils/sms';

const router = Router();

/**
 * @swagger
 * /api/verification/email/send:
 *   post:
 *     summary: 이메일 인증 메일 발송
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 인증 메일 발송 성공
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
 *       400:
 *         description: 이미 인증된 이메일
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 이메일 발송 실패
 */
/**
 * 이메일 인증 메일 발송 (재발송 포함)
 */
router.post('/email/send', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

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
    });
  } catch (error) {
    console.error('Send verification email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/verification/email/verify:
 *   post:
 *     summary: 이메일 인증 확인
 *     tags: [Verification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123def456...
 *                 description: 이메일로 전송된 인증 토큰
 *     responses:
 *       200:
 *         description: 이메일 인증 성공
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
 *                   example: Email verified successfully
 *       400:
 *         description: 유효하지 않거나 만료된 토큰
 */
/**
 * 이메일 인증 확인
 */
router.post('/email/verify', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Token is required',
      });
      return;
    }

    // 토큰 조회
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      res.status(400).json({
        success: false,
        message: '유효하지 않거나 이미 사용된 인증 링크입니다.',
      });
      return;
    }

    // 만료 확인
    if (verificationToken.expiresAt < new Date()) {
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });

      res.status(400).json({
        success: false,
        message: '인증 링크가 만료되었습니다. (유효시간: 1시간)',
      });
      return;
    }

    // 사용자 인증 상태 업데이트
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: {
        isVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    // 토큰 삭제
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    // 신뢰 점수 부여 (이메일 인증)
    const userLevel = await prisma.userLevel.findUnique({
      where: { userId: verificationToken.userId },
    });

    if (userLevel) {
      await prisma.userLevel.update({
        where: { userId: verificationToken.userId },
        data: {
          growthPoints: userLevel.growthPoints + 10, // 이메일 인증 +10 포인트
        },
      });
    }

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/verification/phone/send:
 *   post:
 *     summary: 전화번호 인증 코드 발송
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "01012345678"
 *                 description: 인증할 전화번호 (하이픈 없이)
 *     responses:
 *       200:
 *         description: 인증 코드 발송 성공
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
 *                   example: Verification code sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     expiresIn:
 *                       type: integer
 *                       example: 300
 *                       description: 인증 코드 유효 시간 (초)
 *       400:
 *         description: 필수 필드 누락 또는 이미 인증된 전화번호
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: SMS 발송 실패
 */
/**
 * 전화번호 인증 코드 발송
 */
router.post('/phone/send', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
      return;
    }

    // 전화번호 유효성 검사
    if (!validatePhoneNumber(phoneNumber)) {
      res.status(400).json({
        success: false,
        message: 'Invalid phone number format',
      });
      return;
    }

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        isPhoneVerified: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    if (user.isPhoneVerified) {
      res.status(400).json({
        success: false,
        message: 'Phone number already verified',
      });
      return;
    }

    // 기존 토큰 삭제
    await prisma.verificationToken.deleteMany({
      where: {
        userId: user.id,
        type: 'PHONE',
      },
    });

    // 6자리 인증 코드 생성
    const code = generateVerificationCode();
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5분

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        type: 'PHONE',
        code,
        expiresAt,
      },
    });

    // SMS 발송
    const smsSent = await sendVerificationSMS(phoneNumber, code);

    if (!smsSent.success) {
      res.status(500).json({
        success: false,
        message: 'Failed to send SMS',
        error: smsSent.message,
      });
      return;
    }

    // 전화번호 업데이트
    await prisma.user.update({
      where: { id: userId },
      data: { phone: phoneNumber },
    });

    res.json({
      success: true,
      message: 'Verification code sent successfully',
      data: {
        expiresIn: 300, // 5분 (초 단위)
      },
    });
  } catch (error) {
    console.error('Send verification SMS error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification SMS',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/verification/phone/verify:
 *   post:
 *     summary: 전화번호 인증 코드 확인
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 example: "123456"
 *                 description: SMS로 전송된 6자리 인증 코드
 *     responses:
 *       200:
 *         description: 전화번호 인증 성공
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
 *                   example: Phone number verified successfully
 *       400:
 *         description: 유효하지 않거나 만료된 인증 코드
 *       401:
 *         description: 인증 필요
 */
/**
 * 전화번호 인증 코드 확인
 */
router.post('/phone/verify', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { code } = req.body;

    if (!code) {
      res.status(400).json({
        success: false,
        message: 'Verification code is required',
      });
      return;
    }

    // 토큰 조회
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        userId,
        type: 'PHONE',
        code,
      },
    });

    if (!verificationToken) {
      res.status(400).json({
        success: false,
        message: 'Invalid verification code',
      });
      return;
    }

    // 만료 확인
    if (verificationToken.expiresAt < new Date()) {
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });

      res.status(400).json({
        success: false,
        message: 'Verification code has expired',
      });
      return;
    }

    // 사용자 전화번호 인증 상태 업데이트
    await prisma.user.update({
      where: { id: userId },
      data: {
        isPhoneVerified: true,
        phoneVerifiedAt: new Date(),
      },
    });

    // 토큰 삭제
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    // 신뢰 점수 부여 (전화번호 인증)
    const userLevel = await prisma.userLevel.findUnique({
      where: { userId },
    });

    if (userLevel) {
      await prisma.userLevel.update({
        where: { userId },
        data: {
          growthPoints: userLevel.growthPoints + 15, // 전화번호 인증 +15 포인트
        },
      });
    }

    res.json({
      success: true,
      message: 'Phone number verified successfully',
    });
  } catch (error) {
    console.error('Verify phone error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify phone number',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/verification/status:
 *   get:
 *     summary: 인증 상태 조회
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 인증 상태 조회 성공
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
 *                     email:
 *                       type: object
 *                       properties:
 *                         verified:
 *                           type: boolean
 *                           example: true
 *                         verifiedAt:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                           example: "2025-01-14T10:30:00Z"
 *                     phone:
 *                       type: object
 *                       properties:
 *                         verified:
 *                           type: boolean
 *                           example: false
 *                         verifiedAt:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                           example: null
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
/**
 * 인증 상태 조회
 */
router.get('/status', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isVerified: true,
        isPhoneVerified: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
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
      data: {
        email: {
          verified: user.isVerified,
          verifiedAt: user.emailVerifiedAt,
        },
        phone: {
          verified: user.isPhoneVerified,
          verifiedAt: user.phoneVerifiedAt,
        },
      },
    });
  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get verification status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
