import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

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

// Load environment variables
dotenv.config();

// Initialize Prisma Client
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'stdout',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ]
    : ['error'],
});

// Log queries with parameters in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query' as never, (e: any) => {
    console.log('Query: ' + e.query);
    console.log('Params: ' + e.params);
    console.log('Duration: ' + e.duration + 'ms');
    console.log('---');
  });
}

// Initialize Redis Client
export const redis = new Redis({
  host: process.env.REDIS_HOST || 'loaclhost',
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
app.use(morgan('dev')); // Logging

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

// Static file serving for uploaded files
const uploadDir = process.env.UPLOAD_DIR || '/Users/philip/project/moa_file';
app.use('/uploads', cors({
  origin: process.env.CORS_ORIGIN || 'http://loaclhost:3000',
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

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server gracefully...');
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server gracefully...');
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});

// Start Server
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║                                               ║
  ║          🎉 모아 API Server Running 🎉        ║
  ║                                               ║
  ║   Port: ${PORT}                              ${PORT.toString().length === 4 ? ' ' : ''}   ║
  ║   Environment: ${process.env.NODE_ENV || 'development'} ${(process.env.NODE_ENV || 'development').length === 10 ? '' : ' '}                  ║
  ║                                               ║
  ║  Health Check: http://loaclhost:${PORT}/health   ║
  ║  API Docs: http://loaclhost:${PORT}/api          ║
  ║  Swagger UI: http://loaclhost:${PORT}/api-docs   ║
  ║                                               ║
  ╚═══════════════════════════════════════════════╝
  `);
});

export default app;
