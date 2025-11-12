import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

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
      api: {
        auth: '/api/auth',
        users: '/api/users',
        gatherings: '/api/gatherings',
        trust: '/api/trust',
      },
    },
  });
});

// Example route - Users
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      take: 10,
    });

    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Example route - Trust System
app.get('/api/trust/badges', async (req: Request, res: Response) => {
  try {
    const badges = await prisma.badge.findMany({
      orderBy: { category: 'asc' },
    });

    res.json({
      success: true,
      data: badges,
      count: badges.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch badges',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

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
  ╔═══════════════════════════════════════╗
  ║                                       ║
  ║   🎉 모아 API Server Running 🎉      ║
  ║                                       ║
  ║   Port: ${PORT}                       ${PORT.toString().length === 4 ? ' ' : ''}║
  ║   Environment: ${process.env.NODE_ENV || 'development'}           ${(process.env.NODE_ENV || 'development').length === 10 ? '' : ' '}║
  ║                                       ║
  ║   Health Check: http://localhost:${PORT}/health
  ║   API Docs: http://localhost:${PORT}/api    ║
  ║                                       ║
  ╚═══════════════════════════════════════╝
  `);
});

export default app;
