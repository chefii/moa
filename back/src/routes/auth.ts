import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../main';
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
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
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

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        nickname,
        phone,
        location,
        gender,
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
    console.error('Register error:', error);
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
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
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
        message: 'Invalid email or password',
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
        message: 'Invalid email or password',
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

    const roles = user.userRoles.map(ur => ur.roleCode);
    const primaryRole = user.userRoles.find(ur => ur.isPrimary)?.roleCode || roles[0];

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
    console.error('Login error:', error);
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
        profileImage: true,
        bio: true,
        phone: true,
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
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Extract roles
    const roles = user.userRoles.map(ur => ur.roleCode);
    const primaryRole = user.userRoles.find(ur => ur.isPrimary)?.roleCode || roles[0];

    res.json({
      success: true,
      data: {
        ...user,
        role: primaryRole, // primary role for backward compatibility
        roles, // 다중 역할 배열
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
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
    const roles = user.userRoles.map(ur => ur.roleCode);
    const primaryRole = user.userRoles.find(ur => ur.isPrimary)?.roleCode || roles[0];

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
    console.error('Logout error:', error);
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
    console.error('Nickname check error:', error);
    res.status(500).json({
      success: false,
      message: '닉네임 확인 중 오류가 발생했습니다.',
    });
  }
});

export default router;
