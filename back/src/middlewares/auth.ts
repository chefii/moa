import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import logger from '../config/logger';
import { maskHeaders, maskUUID, createSafeUserLog } from '../utils/securityMasking';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    // Debug logging in development (with sensitive data masking)
    if (process.env.NODE_ENV === 'development') {
      logger.debug('🔐 Auth Request', {
        requestId: req.requestId,
        url: req.url,
        authHeaderPresent: authHeader ? 'present' : 'missing',
        headers: maskHeaders(req.headers),
      });
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('🔐 Auth Failed: No token provided', {
        requestId: req.requestId,
        url: req.url,
      });
      res.status(401).json({
        success: false,
        message: 'No token provided',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = verifyToken(token);
      req.user = decoded;

      // Log successful authentication with masked user data
      logger.info('🔐 Auth Success: User authenticated', {
        requestId: req.requestId,
        userId: maskUUID(decoded.userId),
        role: decoded.role,
        url: req.url,
      });

      next();
    } catch (error) {
      logger.warn('🔐 Auth Failed: Token verification error', {
        requestId: req.requestId,
        url: req.url,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
      return;
    }
  } catch (error) {
    logger.error('🔐 Auth Error: Unexpected authentication error', {
      requestId: req.requestId,
      url: req.url,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // 다중 역할 지원: 사용자의 역할 중 하나라도 허용된 역할에 포함되면 통과
    const userRoles = req.user.roles || [req.user.role]; // 하위 호환성
    const hasPermission = userRoles.some(userRole => roles.includes(userRole));

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient permissions',
      });
      return;
    }

    next();
  };
};
