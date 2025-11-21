import { prisma } from '../config/prisma';

// 권한 레벨 (숫자가 클수록 높은 권한)
export const ROLE_LEVELS = {
  USER: 1,
  VERIFIED_USER: 2,
  HOST: 3,
  PREMIUM_USER: 4,
  BUSINESS_PENDING: 5,
  BUSINESS_USER: 6,
  BUSINESS_MANAGER: 7,
  MODERATOR: 100,
  CONTENT_MANAGER: 100,
  SUPPORT_MANAGER: 100,
  SETTLEMENT_MANAGER: 100,
  ADMIN: 200,
  SUPER_ADMIN: 999,
} as const;

// 권한 그룹
export const ROLE_GROUPS = {
  USERS: ['USER', 'VERIFIED_USER', 'HOST', 'PREMIUM_USER'],
  BUSINESS: ['BUSINESS_PENDING', 'BUSINESS_USER', 'BUSINESS_MANAGER'],
  MANAGERS: ['MODERATOR', 'CONTENT_MANAGER', 'SUPPORT_MANAGER', 'SETTLEMENT_MANAGER'],
  ADMINS: ['ADMIN', 'SUPER_ADMIN'],
  ALL_ADMINS: ['MODERATOR', 'CONTENT_MANAGER', 'SUPPORT_MANAGER', 'SETTLEMENT_MANAGER', 'ADMIN', 'SUPER_ADMIN'],
} as const;

/**
 * 권한 정보를 공통코드에서 조회
 */
export async function getRoleInfo(roleCode: string) {
  const role = await prisma.commonCode.findUnique({
    where: {
      code: roleCode,
    },
  });

  if (!role) {
    return null;
  }

  return {
    ...role,
    permissions: role.value ? JSON.parse(role.value).permissions : [],
    level: role.value ? JSON.parse(role.value).level : 1,
  };
}

/**
 * 사용자가 특정 권한을 가지고 있는지 확인
 */
export function hasRole(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_LEVELS[userRole as keyof typeof ROLE_LEVELS] || 0;
  const requiredLevel = ROLE_LEVELS[requiredRole as keyof typeof ROLE_LEVELS] || 0;

  return userLevel >= requiredLevel;
}

/**
 * 사용자가 여러 권한 중 하나를 가지고 있는지 확인
 */
export function hasAnyRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.some(role => hasRole(userRole, role));
}

/**
 * 사용자가 관리자 권한을 가지고 있는지 확인
 */
export function isAdmin(userRole: string): boolean {
  return ROLE_GROUPS.ALL_ADMINS.includes(userRole as any);
}

/**
 * 사용자가 비즈니스 권한을 가지고 있는지 확인
 */
export function isBusinessUser(userRole: string): boolean {
  return ROLE_GROUPS.BUSINESS.includes(userRole as any);
}

/**
 * 사용자가 특정 권한(permission)을 가지고 있는지 확인
 */
export async function hasPermission(userRole: string, permission: string): Promise<boolean> {
  // SUPER_ADMIN은 모든 권한 보유
  if (userRole === 'SUPER_ADMIN') {
    return true;
  }

  const roleInfo = await getRoleInfo(userRole);
  if (!roleInfo) {
    return false;
  }

  const permissions = roleInfo.permissions as string[];

  // 와일드카드 권한 체크
  if (permissions.includes('*')) {
    return true;
  }

  // 정확히 일치하는 권한 체크
  if (permissions.includes(permission)) {
    return true;
  }

  // 와일드카드 패턴 체크 (예: "gathering.*")
  const permissionParts = permission.split('.');
  for (let i = permissionParts.length; i > 0; i--) {
    const pattern = permissionParts.slice(0, i).join('.') + '.*';
    if (permissions.includes(pattern)) {
      return true;
    }
  }

  return false;
}

/**
 * 사용자가 여러 권한 중 하나를 가지고 있는지 확인
 */
export async function hasAnyPermission(userRole: string, permissions: string[]): Promise<boolean> {
  for (const permission of permissions) {
    if (await hasPermission(userRole, permission)) {
      return true;
    }
  }
  return false;
}

/**
 * 사용자가 모든 권한을 가지고 있는지 확인
 */
export async function hasAllPermissions(userRole: string, permissions: string[]): Promise<boolean> {
  for (const permission of permissions) {
    if (!(await hasPermission(userRole, permission))) {
      return false;
    }
  }
  return true;
}

/**
 * 모든 권한 목록 조회
 */
export async function getAllRoles() {
  return await prisma.commonCode.findMany({
    where: {
      groupCode: 'ROLE',
      isActive: true,
    },
    orderBy: {
      order: 'asc',
    },
  });
}

/**
 * 권한별 사용자 수 조회
 */
export async function getRoleStatistics() {
  // UserRole 테이블에서 역할별 통계를 가져옵니다
  const userRoles = await prisma.userRole.findMany({
    select: {
      roleCode: true,
    },
  });

  // 역할별 카운트 계산
  const roleCounts = userRoles.reduce((acc, ur) => {
    acc[ur.roleCode] = (acc[ur.roleCode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(roleCounts).map(([role, count]) => ({
    role,
    count,
  }));
}
