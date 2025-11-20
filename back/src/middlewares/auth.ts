import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';

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

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth] Request URL:', req.url);
      console.log('[Auth] Authorization header:', authHeader ? 'present' : 'missing');
      console.log('[Auth] Headers:', JSON.stringify(req.headers, null, 2));
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth] FAILED: No token provided');
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth] SUCCESS: User authenticated:', decoded.userId);
      }
      next();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth] FAILED: Token verification error:', error);
      }
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
      return;
    }
  } catch (error) {
    console.error('[Auth] ERROR:', error);
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
