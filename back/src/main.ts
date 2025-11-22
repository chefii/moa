import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import Redis from 'ioredis';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import logger from './config/logger';
import {
  requestIdMiddleware,
  requestLoggingMiddleware,
  performanceMiddleware,
  errorLoggingMiddleware,
} from './middleware/requestLogger';
import { prisma } from './config/prisma';
import { errorMiddleware, notFoundHandler } from './utils/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import trustRoutes from './routes/trust';
import usersRoutes from './routes/users';
import settingsRoutes from './routes/settings';
import categoriesRoutes from './routes/categories';
import commonCodesRoutes from './routes/common-codes';
import verificationRoutes from './routes/verification';
import notificationsRoutes from './routes/notifications';
import popupsRoutes from './routes/popups';
import gatheringsRoutes from './routes/gatherings';
import bookmarksRoutes from './routes/bookmarks';
import bannersRoutes from './routes/banners';
import filesRoutes from './routes/files';
import boardRoutes from './routes/board';
import regionsRoutes from './routes/regions';

// Admin routes
import adminCommonCodesRoutes from './routes/admin/common-codes';
import adminBannersRoutes from './routes/admin/banners';
import adminPopupsRoutes from './routes/admin/popups';
import adminEventsRoutes from './routes/admin/events';
import adminNoticesRoutes from './routes/admin/notices';
import adminCategoriesRoutes from './routes/admin/categories';
import adminReportsRoutes from './routes/admin/reports';
import adminMenuCategoriesRoutes from './routes/admin/menu-categories';
import adminMenuItemsRoutes from './routes/admin/menu-items';
import adminUsersVerificationRoutes from './routes/admin/users-verification';
import adminUsersRoutes from './routes/admin/users';
import adminBadgesRoutes from './routes/admin/badges';
import adminGatheringsRoutes from './routes/admin/gatherings';
import adminBoardsRoutes from './routes/admin/boards';

// ===========================================
// 환경별 설정 파일 자동 로드
// ===========================================
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = `.env.${nodeEnv}`;
const envPath = path.resolve(process.cwd(), envFile);

// 환경별 .env 파일 로드
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`✅ Loaded environment config: ${envFile}`);
} else {
  // 환경별 파일이 없으면 기본 .env 파일 로드
  dotenv.config();
  console.log(`⚠️  ${envFile} not found, using default .env`);
}

// 필수 환경 변수 검증
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'REFRESH_TOKEN_SECRET'];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Prisma Client는 config/prisma.ts에서 import (미들웨어 적용됨)

// Initialize Redis Client
export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Initialize Express App
const app: Express = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
})); // Security headers

// CORS 설정 - 여러 origin 허용
const allowedOrigins = [
  'http://localhost:3000',
  'http://172.30.1.22:3000',
  'http://192.168.0.0:3000', // 다른 로컬 IP 대역도 필요시 추가
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // origin이 없는 경우 허용 (모바일 앱, Postman 등)
    if (!origin) {
      return callback(null, true);
    }

    // 로컬 개발 환경에서는 모든 localhost와 로컬 IP 허용
    if (process.env.NODE_ENV === 'development') {
      const isLocalhost = origin.includes('localhost');
      const isLocalIP = /https?:\/\/(172|192\.168|10)\.\d+\.\d+\.\d+/.test(origin);

      if (isLocalhost || isLocalIP) {
        return callback(null, true);
      }
    }

    // 허용된 origin 목록 확인
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Winston-based logging middleware
app.use(requestIdMiddleware); // Request ID 생성
app.use(requestLoggingMiddleware); // HTTP 요청/응답 로깅
app.use(performanceMiddleware); // 성능 메트릭 수집

// Morgan for basic HTTP logging (optional, 기본 HTTP 로그용)
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined')); // Production logging
}

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'MOA API Documentation',
  swaggerOptions: {
    persistAuthorization: true, // 브라우저에 토큰 저장
    filter: true, // 검색 필터 활성화
    displayRequestDuration: true, // 요청 시간 표시
  },
}));

// Swagger JSON
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health Check
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Check Redis connection
    await redis.ping();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        cache: 'connected',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Service unavailable',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// API Routes
app.get('/api', (req: Request, res: Response) => {
  res.json({
    name: '모아 API',
    version: '1.0.0',
    description: '관심사로 모이는 사람들',
    endpoints: {
      health: '/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout',
      },
      trust: {
        level: 'GET /api/trust/level/:userId?',
        badges: 'GET /api/trust/badges/:userId?',
        allBadges: 'GET /api/trust/badges',
        streak: 'GET /api/trust/streak/:userId?',
        points: 'GET /api/trust/points/:userId?',
        transactions: 'GET /api/trust/points/transactions',
      },
      users: 'GET /api/users',
    },
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/trust', trustRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/common-codes', commonCodesRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/popups', popupsRoutes);
app.use('/api/gatherings', gatheringsRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api/banners', bannersRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/board', boardRoutes);
app.use('/api/regions', regionsRoutes);

// Static file serving for uploaded files
const uploadDir = process.env.UPLOAD_DIR || '/Users/philip/project/moa_file';
app.use('/uploads', cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}), express.static(uploadDir));

// Admin routes
app.use('/api/admin/common-codes', adminCommonCodesRoutes);
app.use('/api/admin/banners', adminBannersRoutes);
app.use('/api/admin/popups', adminPopupsRoutes);
app.use('/api/admin/events', adminEventsRoutes);
app.use('/api/admin/notices', adminNoticesRoutes);
app.use('/api/admin/categories', adminCategoriesRoutes);
app.use('/api/admin/reports', adminReportsRoutes);
app.use('/api/admin/menu-categories', adminMenuCategoriesRoutes);
app.use('/api/admin/menu-items', adminMenuItemsRoutes);
app.use('/api/admin/users-verification', adminUsersVerificationRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/badges', adminBadgesRoutes);
app.use('/api/admin/gatherings', adminGatheringsRoutes);
app.use('/api/admin/boards', adminBoardsRoutes);

// 404 Not Found Handler
app.use(notFoundHandler);

// Error Logging Middleware
app.use(errorLoggingMiddleware);

// Error Handler Middleware
app.use(errorMiddleware);

// Graceful Shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing server gracefully...');
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing server gracefully...');
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});

// Start Server
app.listen(PORT, () => {
  const serverInfo = `
  ╔═══════════════════════════════════════════════╗
  ║                                               ║
  ║          🎉 모아 API Server Running 🎉        ║
  ║                                               ║
  ║   Port: ${PORT}                              ${PORT.toString().length === 4 ? ' ' : ''}   ║
  ║   Environment: ${process.env.NODE_ENV || 'development'} ${(process.env.NODE_ENV || 'development').length === 10 ? '' : ' '}                  ║
  ║                                               ║
  ║  Health Check: http://localhost:${PORT}/health   ║
  ║  API Docs: http://localhost:${PORT}/api          ║
  ║  Swagger UI: http://localhost:${PORT}/api-docs   ║
  ║                                               ║
  ╚═══════════════════════════════════════════════╝
  `;

  logger.info(serverInfo);

  logger.info('=== Server start ===', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    pid: process.pid,
  });

  logger.info('📊 Logging system initialized', {
    logDir: process.env.LOG_DIR || '/Users/philip/project/moa_file/logs',
    logLevel: process.env.LOG_LEVEL,
  });
});

export default app;
