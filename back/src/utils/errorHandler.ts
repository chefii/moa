import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import logger from '../config/logger';
import { sendError, sendBadRequest, sendNotFound, sendConflict, sendInternalError } from './apiResponse';

/**
 * 커스텀 에러 클래스
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 비즈니스 로직 에러 (400)
 */
export class BadRequestError extends AppError {
  constructor(message: string, code?: string) {
    super(400, message, code || 'BAD_REQUEST');
  }
}

/**
 * 인증 에러 (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', code?: string) {
    super(401, message, code || 'UNAUTHORIZED');
  }
}

/**
 * 권한 에러 (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden - You do not have permission', code?: string) {
    super(403, message, code || 'FORBIDDEN');
  }
}

/**
 * 리소스 없음 에러 (404)
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code?: string) {
    super(404, message, code || 'NOT_FOUND');
  }
}

/**
 * 충돌 에러 (409)
 */
export class ConflictError extends AppError {
  constructor(message: string, code?: string) {
    super(409, message, code || 'CONFLICT');
  }
}

/**
 * Prisma 에러 처리
 */
export function handlePrismaError(error: any): AppError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const target = error.meta?.target as string[] | undefined;
        const field = target ? target[0] : 'field';
        return new ConflictError(`${field} already exists`, 'DUPLICATE_ERROR');

      case 'P2025':
        // Record not found
        return new NotFoundError('Record not found', 'RECORD_NOT_FOUND');

      case 'P2003':
        // Foreign key constraint violation
        return new BadRequestError('Related record not found', 'FOREIGN_KEY_ERROR');

      case 'P2014':
        // Invalid ID
        return new BadRequestError('Invalid ID provided', 'INVALID_ID');

      default:
        logger.error('Unhandled Prisma error:', { code: error.code, meta: error.meta });
        return new AppError(500, 'Database error occurred', 'DATABASE_ERROR');
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new BadRequestError('Invalid data provided', 'VALIDATION_ERROR');
  }

  return new AppError(500, 'Database error occurred', 'DATABASE_ERROR');
}

/**
 * 에러 로깅
 */
function logError(error: Error, req?: Request): void {
  const errorInfo: any = {
    message: error.message,
    stack: error.stack,
  };

  if (error instanceof AppError) {
    errorInfo.statusCode = error.statusCode;
    errorInfo.code = error.code;
    errorInfo.isOperational = error.isOperational;
  }

  if (req) {
    errorInfo.request = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userId: (req as any).user?.id,
    };
  }

  if (error instanceof AppError && error.statusCode < 500) {
    logger.warn('Client error:', errorInfo);
  } else {
    logger.error('Server error:', errorInfo);
  }
}

/**
 * Express 에러 핸들링 미들웨어
 */
export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction): void {
  // 에러 로깅
  logError(err, req);

  // Prisma 에러 처리
  if (err instanceof Prisma.PrismaClientKnownRequestError ||
      err instanceof Prisma.PrismaClientValidationError) {
    const prismaError = handlePrismaError(err);
    sendError(res, prismaError.message, undefined, prismaError.statusCode, prismaError.code);
    return;
  }

  // 커스텀 에러 처리
  if (err instanceof AppError) {
    const errorDetail = process.env.NODE_ENV === 'development' ? err.stack : undefined;
    sendError(res, err.message, errorDetail, err.statusCode, err.code);
    return;
  }

  // 기본 에러 처리
  const message = process.env.NODE_ENV === 'development' ? err.message : 'Internal server error';
  const errorDetail = process.env.NODE_ENV === 'development' ? err.stack : undefined;
  sendInternalError(res, message, errorDetail);
}

/**
 * 비동기 라우트 핸들러 래퍼
 * try-catch 자동 처리
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 Not Found 핸들러
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new NotFoundError(`Route ${req.method} ${req.url} not found`);
  next(error);
}
