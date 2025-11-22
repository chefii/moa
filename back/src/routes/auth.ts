import logger from '../config/logger';
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { authenticate } from '../middlewares/auth';
import { saveRefreshToken, verifyRefreshTokenInDb, revokeRefreshToken } from '../utils/refresh-token';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 회원가입
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: asdf@asdf.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 1234
 *               name:
 *                 type: string
 *                 example: 홍길동
 *               nickname:
 *                 type: string
 *                 example: 귀여운펭귄
 *               phone:
 *                 type: string
 *                 example: 010-1234-5678
 *               gender:
 *                 type: string
 *                 example: MALE
 *               age:
 *                 type: number
 *                 example: 25
 *               location:
 *                 type: string
 *                 example: 서울 강남구
 *               role:
 *                 type: string
 *                 example: USER
 *     responses:
 *       201:
 *         description: 회원가입 성공
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
 *                   example: User registered successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: 필수 필드 누락
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: 이메일 또는 닉네임 중복
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone, role, nickname, location, interests, gender, age } = req.body;

    // Validation
    if (!email || !password || !name) {
      res.status(400).json({
        success: false,
        message: 'Email, password, and name are required',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    // Check if nickname already exists
    if (nickname) {
      const existingNickname = await prisma.user.findUnique({
        where: { nickname },
      });   

      if (existingNickname) {
        res.status(409).json({
          success: false,
          message: 'Nickname already taken',
        });
        return;
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 전화번호 포맷 정리 (하이픈 제거)
    const formattedPhone = phone?.replace(/[^0-9]/g, '');

    // 성별 포맷 정리 (GENDER_MALE → MALE, GENDER_FEMALE → FEMALE)
    let formattedGender = gender;
    if (gender) {
      if (gender === 'GENDER_MALE' || gender === 'male') {
        formattedGender = 'MALE';
      } else if (gender === 'GENDER_FEMALE' || gender === 'female') {
        formattedGender = 'FEMALE';
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        nickname,
        phone: formattedPhone,
        location,
        gender: formattedGender,
        age: age ? parseInt(age) : null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        profileImage: true,
        location: true,
        gender: true,
        age: true,
      },
    });

    // Create initial user level
    await prisma.userLevel.create({
      data: {
        userId: user.id,
        level: 1,
        growthPoints: 0,
      },
    });

    // Create initial user streak
    await prisma.userStreak.create({
      data: {
        userId: user.id,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: new Date(),
      },
    });

    // Determine initial role
    const initialRole = role || 'USER';

    // Create initial user role (다중 역할 지원)
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleCode: initialRole,
        isPrimary: true, // 첫 번째 역할은 주요 역할로 설정
      },
    });

    // TODO: Handle interests when Category data is seeded
    // if (interests && Array.isArray(interests) && interests.length > 0) {
    //   await prisma.userInterest.createMany({
    //     data: interests.map((categoryId: string) => ({
    //       userId: user.id,
    //       categoryId,
    //     })),
    //   });
    // }

    // Generate tokens with roles array
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: initialRole, // primary role for backward compatibility
      roles: [initialRole], // 다중 역할 배열
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: initialRole,
      roles: [initialRole],
    });

    // Save refresh token to DB
    await saveRefreshToken(
      user.id,
      refreshToken,
      req.headers['user-agent'],
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          nickname: user.nickname,
          role: initialRole, // primary role
          roles: [initialRole], // 다중 역할 배열
          avatar: user.profileImage,
          location: user.location,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Helper function to parse user agent
const parseUserAgent = (userAgent: string) => {
  const ua = userAgent || '';

  // Detect device
  let device = 'desktop';
  if (/mobile/i.test(ua)) device = 'mobile';
  else if (/tablet/i.test(ua)) device = 'tablet';
  
  // Detect browser
  let browser = 'Unknown';
  if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Edge/i.test(ua)) browser = 'Edge';
  else if (/MSIE|Trident/i.test(ua)) browser = 'Internet Explorer';

  // Detect OS
  let os = 'Unknown';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iOS|iPhone|iPad/i.test(ua)) os = 'iOS';

  return { device, browser, os };
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 로그인
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: asdf@asdf.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 1234
 *     responses:
 *       200:
 *         description: 로그인 성공
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
 *                     user:
 *                       type: object
 *                     token:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: 필수 필드 누락
 *       401:
 *         description: 이메일 또는 비밀번호 오류
 */
// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    let { email, password } = req.body;

    // Extract request metadata
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
                      req.socket.remoteAddress ||
                      'unknown';
    const userAgent = req.headers['user-agent'] || '';
    const { device, browser, os } = parseUserAgent(userAgent);

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
      return;
    }

    // 관리자 단축 로그인: "asdf" 입력 시에만 "asdf@asdf.com"으로 변환
    if (email === 'asdf') {
      email = 'asdf@asdf.com';
    }

    // Find user with roles
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        nickname: true,
        profileImage: true,
        location: true,
        userRoles: {
          select: {
            roleCode: true,
            isPrimary: true,
          },
          orderBy: {
            isPrimary: 'desc', // Primary role first
          },
        },
      },
    });

    if (!user) {
      // Record failed login attempt - user not found
      await prisma.loginHistory.create({
        data: {
          email,
          ipAddress,
          userAgent,
          device,
          browser,
          os,
          status: 'FAILURE',
          failureReason: 'User not found',
        },
      });

      res.status(401).json({
        success: false,
        message: '이메일 혹은 비밀번호를 확인해주세요.',
      });
      return;
    }

    // Check if user has a password (social-only accounts don't have passwords)
    if (!user.password) {
      // Record failed login attempt - social-only account
      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          email,
          ipAddress,
          userAgent,
          device,
          browser,
          os,
          status: 'FAILURE',
          failureReason: 'Social login only account',
        },
      });

      res.status(401).json({
        success: false,
        message: '소셜 로그인 전용 계정입니다. 카카오 로그인을 이용해주세요.',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Record failed login attempt - invalid password
      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          email,
          ipAddress,
          userAgent,
          device,
          browser,
          os,
          status: 'FAILURE',
          failureReason: 'Invalid password',
        },
      });

      res.status(401).json({
        success: false,
        message: '이메일 혹은 비밀번호를 확인해주세요.',
      });
      return;
    }

    // Record successful login
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        email,
        ipAddress,
        userAgent,
        device,
        browser,
        os,
        status: 'SUCCESS',
      },
    });

    // Extract roles from userRoles (필수)
    if (user.userRoles.length === 0) {
      res.status(500).json({
        success: false,
        message: 'User has no roles assigned',
      });
      return;
    }

    const roles = user.userRoles.map((ur: any) => ur.roleCode);
    const primaryRole = user.userRoles.find((ur: any) => ur.isPrimary)?.roleCode || roles[0];

    // Generate tokens with roles array
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: primaryRole, // primary role for backward compatibility
      roles: roles, // 다중 역할 배열
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: primaryRole,
      roles: roles,
    });

    // Save refresh token to DB
    await saveRefreshToken(
      user.id,
      refreshToken,
      userAgent,
      ipAddress
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          nickname: user.nickname,
          role: primaryRole, // primary role
          roles: roles, // 다중 역할 배열
          avatar: user.profileImage,
          location: user.location,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: 현재 로그인한 사용자 정보 조회
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
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
 *                     role:
 *                       type: string
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
// Get current user
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        profileImage: {
          select: {
            id: true,
            url: true,
          },
        },
        bio: true,
        phone: true,
        location: true,
        gender: true,
        age: true,
        password: true, // To check if user has password
        createdAt: true,
        isVerified: true,
        isPhoneVerified: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
        userRoles: {
          select: {
            roleCode: true,
            isPrimary: true,
          },
          orderBy: {
            isPrimary: 'desc',
          },
        },
        userSso: {
          select: {
            provider: true,
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

    // Extract roles
    const roles = user.userRoles.map((ur: any) => ur.roleCode);
    const primaryRole = user.userRoles.find((ur: any) => ur.isPrimary)?.roleCode || roles[0];

    // Check if user has password (for identifying signup method)
    const hasPassword = !!user.password;

    // Remove password from response for security
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        ...userWithoutPassword,
        avatar: userWithoutPassword.profileImage,
        profileImage: undefined,
        role: primaryRole, // primary role for backward compatibility
        roles, // 다중 역할 배열
        hasPassword, // true if user signed up with email/password
      },
    });
  } catch (error) {
    logger.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: 프로필 업데이트
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: 홍길동
 *               nickname:
 *                 type: string
 *                 example: 귀여운펭귄
 *               phone:
 *                 type: string
 *                 example: 010-1234-5678
 *               location:
 *                 type: string
 *                 example: 서울 강남구
 *               bio:
 *                 type: string
 *                 example: 안녕하세요
 *               gender:
 *                 type: string
 *                 example: MALE
 *               age:
 *                 type: number
 *                 example: 25
 *     responses:
 *       200:
 *         description: 프로필 업데이트 성공
 *       401:
 *         description: 인증 필요
 */
router.put('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, nickname, phone, location, bio, gender, age } = req.body;

    // Check if nickname is being changed and if it's already taken
    if (nickname) {
      const existingUser = await prisma.user.findFirst({
        where: {
          nickname,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'Nickname already taken',
        });
        return;
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(nickname && { nickname }),
        ...(phone !== undefined && { phone }),
        ...(location !== undefined && { location }),
        ...(bio !== undefined && { bio }),
        ...(gender !== undefined && { gender }),
        ...(age !== undefined && { age }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        phone: true,
        location: true,
        bio: true,
        gender: true,
        age: true,
        profileImage: {
          select: {
            id: true,
            url: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        isVerified: true,
        isPhoneVerified: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
      },
    });

    logger.info(`✅ Profile updated for user: ${userId}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        ...updatedUser,
        avatar: updatedUser.profileImage,
        profileImage: undefined,
      },
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: 액세스 토큰 갱신
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: 토큰 갱신 성공
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
 *                     token:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Refresh token 누락
 *       401:
 *         description: 유효하지 않거나 만료된 refresh token
 */
// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
      return;
    }

    // Verify refresh token (JWT validation)
    const decoded = verifyRefreshToken(refreshToken);

    // Verify refresh token in DB (check expiration, revocation, etc.)
    const dbVerification = await verifyRefreshTokenInDb(refreshToken);

    if (!dbVerification) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
      return;
    }

    // Fetch current user roles (roles might have changed since token was issued)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
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

    if (!user || user.userRoles.length === 0) {
      res.status(401).json({
        success: false,
        message: 'User not found or has no roles',
      });
      return;
    }

    // Extract current roles
    const roles = user.userRoles.map((ur: any) => ur.roleCode);
    const primaryRole = user.userRoles.find((ur: any) => ur.isPrimary)?.roleCode || roles[0];

    // Generate new tokens with current roles
    const newToken = generateToken({
      userId: decoded.userId,
      email: decoded.email,
      role: primaryRole,
      roles: roles,
    });

    const newRefreshToken = generateRefreshToken({
      userId: decoded.userId,
      email: decoded.email,
      role: primaryRole,
      roles: roles,
    });

    // Save new refresh token to DB
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
                      req.socket.remoteAddress ||
                      'unknown';
    const userAgent = req.headers['user-agent'] || '';

    await saveRefreshToken(
      decoded.userId,
      newRefreshToken,
      userAgent,
      ipAddress
    );

    // Revoke old refresh token
    await revokeRefreshToken(refreshToken);

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 로그아웃
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: 무효화할 refresh token
 *     responses:
 *       200:
 *         description: 로그아웃 성공
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
 *                   example: Logged out successfully
 *       401:
 *         description: 인증 필요
 */
// Logout (optional - mainly client-side)
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    // Revoke refresh token if provided
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/auth/check-nickname:
 *   post:
 *     summary: 닉네임 중복 확인
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nickname
 *             properties:
 *               nickname:
 *                 type: string
 *                 example: 귀여운펭귄
 *     responses:
 *       200:
 *         description: 닉네임 확인 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 available:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 사용 가능한 닉네임입니다.
 *       400:
 *         description: 닉네임 누락
 */
// Check nickname availability
router.post('/check-nickname', async (req: Request, res: Response) => {
  try {
    const { nickname } = req.body;

    if (!nickname) {
      res.status(400).json({
        success: false,
        message: '닉네임을 입력해주세요.',
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { nickname },
    });

    if (existingUser) {
      res.json({
        success: false,
        available: false,
        message: '이미 사용중인 닉네임입니다.',
      });
    } else {
      res.json({
        success: true,
        available: true,
        message: '사용 가능한 닉네임입니다.',
      });
    }
  } catch (error) {
    logger.error('Nickname check error:', error);
    res.status(500).json({
      success: false,
      message: '닉네임 확인 중 오류가 발생했습니다.',
    });
  }
});

/**
 * @swagger
 * /api/auth/kakao/callback:
 *   post:
 *     summary: 카카오 로그인 콜백
 *     tags: [Authentication]
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
 *                 description: 카카오 인가 코드
 *     responses:
 *       200:
 *         description: 로그인 성공
 *       400:
 *         description: 인가 코드 누락
 *       500:
 *         description: 서버 오류
 */
router.post('/kakao/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      res.status(400).json({
        success: false,
        message: 'Authorization code is required',
      });
      return;
    }
    console.log(" ============= ");
    // 1. 카카오 액세스 토큰 요청
    const tokenParams = {
      grant_type: 'authorization_code',
      client_id: process.env.KAKAO_CLIENT_ID || '',
      client_secret: process.env.KAKAO_CLIENT_SECRET || '',
      redirect_uri: process.env.KAKAO_REDIRECT_URI || '',
      code,
    };

    logger.info('Kakao token request params: ' + JSON.stringify({
      client_id: tokenParams.client_id,
      redirect_uri: tokenParams.redirect_uri,
      code: code.substring(0, 20) + '...', // 보안을 위해 일부만 로깅
    }, null, 2));

    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(tokenParams),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({ error: 'Unable to parse error response' }));
      logger.error('Kakao token error - Status: ' + tokenResponse.status);
      logger.error('Kakao token error - Response: ' + JSON.stringify(errorData, null, 2));
      res.status(400).json({
        success: false,
        message: 'Failed to get Kakao access token',
        error: errorData,
      });
      return;
    }

    const tokenData: any = await tokenResponse.json();
    const { access_token } = tokenData;

    // 2. 카카오 사용자 정보 요청
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      logger.error('Kakao user info error: ' + JSON.stringify(errorData, null, 2));
      res.status(400).json({
        success: false,
        message: 'Failed to get Kakao user info',
        error: errorData,
      });
      return;
    }

    const kakaoUser: any = await userResponse.json();

    // 카카오에서 받은 전체 데이터 로깅
    logger.info('📋 Kakao User Data: ' + JSON.stringify(kakaoUser, null, 2));

    const { id: kakaoId, kakao_account, properties } = kakaoUser;
    const email = kakao_account?.email;
    const name = kakao_account?.name;
    const nickname = kakao_account?.profile?.nickname || properties?.nickname;
    const profileImage = kakao_account?.profile?.profile_image_url || properties?.profile_image;
    const thumbnailImage = kakao_account?.profile?.thumbnail_image_url || properties?.thumbnail_image;
    const phoneNumber = kakao_account?.phone_number;
    const ageRange = kakao_account?.age_range;
    const birthyear = kakao_account?.birthyear;
    const birthday = kakao_account?.birthday;
    const gender = kakao_account?.gender;

    // 전화번호 포맷 정리 (카카오는 +82 10-xxxx-xxxx 또는 821012345678 형식)
    let formattedPhone = phoneNumber?.replace(/[^0-9]/g, ''); // 숫자만 추출
    if (formattedPhone?.startsWith('82')) {
      formattedPhone = '0' + formattedPhone.substring(2); // 82 → 0
    }

    // 나이 계산 (birthyear가 있으면)
    let calculatedAge = null;
    if (birthyear) {
      const currentYear = new Date().getFullYear();
      calculatedAge = currentYear - parseInt(birthyear);
    }

    logger.info(`📧 Extracted - Email: ${email}, Nickname: ${nickname}, Kakao ID: ${kakaoId}, Phone: ${formattedPhone}, Age: ${calculatedAge}`);

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required from Kakao account',
      });
      return;
    }

    // 3. 카카오 ID로 기존 소셜 계정 확인
    let socialAccount = await prisma.userSso.findUnique({
      where: {
        provider_providerId: {
          provider: 'KAKAO',
          providerId: String(kakaoId),
        },
      },
      include: {
        user: {
          include: {
            userRoles: true,
          },
        },
      },
    });

    let user;
    let isNewUser = false;

    if (socialAccount) {
      // 기존 카카오 계정 - User 사용
      logger.info(`✅ 기존 카카오 계정 로그인: ${email}`);
      user = socialAccount.user;

      // UserSso 정보 업데이트 (프로필 변경 반영)
      await prisma.userSso.update({
        where: { id: socialAccount.id },
        data: {
          email,
          name,
          nickname,
          profileImage,
          thumbnailImage,
          phoneNumber: formattedPhone, // 포맷된 전화번호
          ageRange,
          birthyear,
          birthday,
          gender,
          accessToken: access_token, // 새 토큰 저장
          lastLoginAt: new Date(),
        },
      });
    } else {
      // 신규 카카오 로그인 - 이메일로 기존 User 확인
      user = await prisma.user.findUnique({
        where: { email },
        include: {
          userRoles: true,
        },
      });

      if (user) {
        // 기존 User에 카카오 계정 연동
        logger.info(`🔗 기존 회원에 카카오 계정 연동: ${email}`);
        await prisma.userSso.create({
          data: {
            userId: user.id,
            provider: 'KAKAO',
            providerId: String(kakaoId),
            email,
            name,
            nickname,
            profileImage,
            thumbnailImage,
            phoneNumber: formattedPhone, // 포맷된 전화번호
            ageRange,
            birthyear,
            birthday,
            gender,
            accessToken: access_token,
            lastLoginAt: new Date(),
          },
        });
      } else {
        // 완전 신규 회원 - User + SocialAccount 생성
        isNewUser = true;
        logger.info(`✨ 신규 회원 가입 진행: ${email}`);

        user = await prisma.user.create({
          data: {
            email,
            password: null, // 소셜 로그인 전용 계정
            name: name || nickname || 'Kakao User',
            nickname: nickname,
            phone: formattedPhone, // 포맷된 전화번호 (821012345678 → 01012345678)
            gender: gender?.toUpperCase(), // male → MALE
            age: calculatedAge, // birthyear로 계산된 나이
            birthyear,
            birthday,
            ageRange,
            isVerified: true, // 카카오 인증을 통해 이메일 검증됨
            emailVerifiedAt: new Date(),
            userRoles: {
              create: {
                roleCode: 'USER',
                isPrimary: true,
              },
            },
            userSso: {
              create: {
                provider: 'KAKAO',
                providerId: String(kakaoId),
                email,
                name,
                nickname,
                profileImage,
                thumbnailImage,
                phoneNumber: formattedPhone, // 포맷된 전화번호
                ageRange,
                birthyear,
                birthday,
                gender,
                accessToken: access_token,
                lastLoginAt: new Date(),
              },
            },
          },
          include: {
            userRoles: true,
          },
        });

        // 사용자 레벨 초기화
        await prisma.userLevel.create({
          data: {
            userId: user.id,
            level: 1,
            growthPoints: 0,
          },
        });

        // 사용자 스트릭 초기화
        await prisma.userStreak.create({
          data: {
            userId: user.id,
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: new Date(),
          },
        });

        logger.info(`✅ 신규 회원 가입 완료: ${user.id}`);
      }
    }

    // 4. JWT 토큰 생성
    const primaryRole = user.userRoles.find((ur) => ur.isPrimary)?.roleCode || 'USER';
    const roles = user.userRoles.map((ur) => ur.roleCode);

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: primaryRole,
      roles: roles,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: primaryRole,
      roles: roles,
    });

    // 5. Refresh Token을 DB에 저장
    await saveRefreshToken(
      user.id,
      refreshToken,
      req.headers['user-agent'],
      req.ip
    );

    res.json({
      success: true,
      message: 'Kakao login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          nickname: user.nickname,
          role: primaryRole,
          roles: roles,
          isVerified: user.isVerified,
        },
        token,
        isNewUser,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Kakao login error:', error);
    res.status(500).json({
      success: false,
      message: 'Kakao login failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
