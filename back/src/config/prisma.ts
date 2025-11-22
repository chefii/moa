import { PrismaClient } from '@prisma/client';
import { softDeleteMiddleware } from './prisma-middleware';
import logger from './logger';

// 전역 Prisma Client 인스턴스 (싱글톤)
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
        {
          emit: 'stdout',
          level: 'info',
        },
      ]
    : ['error'],
});

// 소프트 삭제 미들웨어 적용
prisma.$use(softDeleteMiddleware());

// 쿼리 로깅 (개발 환경)
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query' as never, (e: any) => {
    const duration = e.duration;
    const slowQueryThreshold = 100; // 100ms 이상이면 느린 쿼리로 간주

    if (duration > slowQueryThreshold) {
      // 느린 쿼리 경고
      logger.warn(`🐌 Slow Query (${duration}ms): ${e.query}`, {
        params: e.params,
        duration,
      });
    } else {
      // 일반 쿼리 INFO 로그 (파라미터 포함)
      logger.info(`💾 Query (${duration}ms): ${e.query} | Params: ${e.params}`);
    }
  });
}
