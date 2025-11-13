import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

// Import routes
import authRoutes from './routes/auth';
import trustRoutes from './routes/trust';
import usersRoutes from './routes/users';
import settingsRoutes from './routes/settings';
import categoriesRoutes from './routes/categories';
import commonCodesRoutes from './routes/common-codes';
import verificationRoutes from './routes/verification';
import uploadRoutes from './routes/upload';

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

// Load environment variables
dotenv.config();

// Initialize Prisma Client
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

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
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Logging

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
app.use('/api/upload', uploadRoutes);

// Static file serving for uploaded files
const uploadDir = process.env.UPLOAD_DIR || '/Users/philip/project/moa_file';
app.use('/uploads', express.static(uploadDir));

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
  ║   Health Check: http://localhost:${PORT}/health  ║
  ║   API Docs: http://localhost:${PORT}/api         ║
  ║                                               ║
  ╚═══════════════════════════════════════════════╝
  `);
});

export default app;
