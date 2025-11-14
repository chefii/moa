import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Role is now managed in CommonCode for flexibility
export enum UserRole {
  // 일반 사용자
  USER = 'USER',
  VERIFIED_USER = 'VERIFIED_USER',
  HOST = 'HOST',
  PREMIUM_USER = 'PREMIUM_USER',

  // 비즈니스
  BUSINESS_PENDING = 'BUSINESS_PENDING',
  BUSINESS_USER = 'BUSINESS_USER',
  BUSINESS_MANAGER = 'BUSINESS_MANAGER',
  BUSINESS_ADMIN = 'BUSINESS_USER', // Legacy alias

  // 관리자
  MODERATOR = 'MODERATOR',
  CONTENT_MANAGER = 'CONTENT_MANAGER',
  SUPPORT_MANAGER = 'SUPPORT_MANAGER',
  SETTLEMENT_MANAGER = 'SETTLEMENT_MANAGER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

// Role type as string for flexibility
export type UserRoleType = string;

// Role levels for comparison
export const ROLE_LEVELS: Record<string, number> = {
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
};

interface User {
  id: string;
  email: string;
  name: string;
  nickname?: string;
  role: UserRoleType; // Changed to string for flexibility
  avatar?: string;
  location?: string;
  token?: string;
  refreshToken?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateTokens: (token: string, refreshToken: string) => void;
  hasRole: (role: UserRole | string) => boolean;
  hasAnyRole: (roles: (UserRole | string)[]) => boolean;
  hasMinimumRole: (minimumRole: UserRole | string) => boolean;
  isAdmin: () => boolean;
  isBusinessUser: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateTokens: (token: string, refreshToken: string) => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              token,
              refreshToken,
            },
          });
        }
      },

      // 정확히 특정 권한인지 체크
      hasRole: (role: UserRole | string) => {
        const { user } = get();
        return user?.role === role;
      },

      // 여러 권한 중 하나를 가지고 있는지 체크
      hasAnyRole: (roles: (UserRole | string)[]) => {
        const { user } = get();
        return user ? roles.includes(user.role) : false;
      },

      // 최소 권한 레벨 이상인지 체크 (레벨 비교)
      hasMinimumRole: (minimumRole: UserRole | string) => {
        const { user } = get();
        if (!user) return false;

        const userLevel = ROLE_LEVELS[user.role] || 0;
        const requiredLevel = ROLE_LEVELS[minimumRole] || 0;

        return userLevel >= requiredLevel;
      },

      // 관리자인지 체크
      isAdmin: () => {
        const { user } = get();
        if (!user) return false;
        const userLevel = ROLE_LEVELS[user.role] || 0;
        return userLevel >= 100; // MODERATOR 이상
      },

      // 비즈니스 사용자인지 체크
      isBusinessUser: () => {
        const { user } = get();
        if (!user) return false;
        return ['BUSINESS_PENDING', 'BUSINESS_USER', 'BUSINESS_MANAGER'].includes(user.role);
      },
    }),
    {
      name: 'moa-auth-storage',
    }
  )
);
