import { Request, Response, NextFunction } from 'express';
import { hasRole, hasAnyRole, hasPermission, isAdmin } from '../utils/roleUtils';

/**
 * 특정 권한을 요구하는 미들웨어
 */
export const requireRole = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '로그인이 필요합니다.',
      });
    }

    if (!hasRole(user.role, requiredRole)) {
      return res.status(403).json({
        success: false,
        message: '권한이 부족합니다.',
        required: requiredRole,
        current: user.role,
      });
    }

    next();
  };
};

/**
 * 여러 권한 중 하나를 요구하는 미들웨어
 */
export const requireAnyRole = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '로그인이 필요합니다.',
      });
    }

    if (!hasAnyRole(user.role, requiredRoles)) {
      return res.status(403).json({
        success: false,
        message: '권한이 부족합니다.',
        required: requiredRoles,
        current: user.role,
      });
    }

    next();
  };
};

/**
 * 관리자 권한을 요구하는 미들웨어
 */
export const requireAdmin = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '로그인이 필요합니다.',
      });
    }

    if (!isAdmin(user.role)) {
      return res.status(403).json({
        success: false,
        message: '관리자 권한이 필요합니다.',
        current: user.role,
      });
    }

    next();
  };
};

/**
 * 특정 퍼미션을 요구하는 미들웨어
 */
export const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '로그인이 필요합니다.',
      });
    }

    const hasAccess = await hasPermission(user.role, permission);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: '권한이 부족합니다.',
        required: permission,
        current: user.role,
      });
    }

    next();
  };
};

/**
 * 여러 퍼미션 중 하나를 요구하는 미들웨어
 */
export const requireAnyPermission = (permissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '로그인이 필요합니다.',
      });
    }

    for (const permission of permissions) {
      const hasAccess = await hasPermission(user.role, permission);
      if (hasAccess) {
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      message: '권한이 부족합니다.',
      required: permissions,
      current: user.role,
    });
  };
};
