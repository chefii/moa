import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../main';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { authenticate } from '../middlewares/auth';

const router = Router();

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
        role: role || 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        role: true,
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

    // TODO: Handle interests when Category data is seeded
    // if (interests && Array.isArray(interests) && interests.length > 0) {
    //   await prisma.userInterest.createMany({
    //     data: interests.map((categoryId: string) => ({
    //       userId: user.id,
    //       categoryId,
    //     })),
    //   });
    // }

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          nickname: user.nickname,
          role: user.role,
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

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    let { email, password } = req.body;

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

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        nickname: true,
        role: true,
        profileImage: true,
        location: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          nickname: user.nickname,
          role: user.role,
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

// Get current user
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profileImage: true,
        bio: true,
        phone: true,
        createdAt: true,
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
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

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

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Generate new tokens
    const newToken = generateToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });

    const newRefreshToken = generateRefreshToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });

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

// Logout (optional - mainly client-side)
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

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
