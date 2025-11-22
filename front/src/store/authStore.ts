import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Role is now managed in CommonCode for flexibility
export enum UserRole {
  // 일반 사용자
  USER = 'ROLE_USER',
  VERIFIED_USER = 'ROLE_VERIFIED_USER',
  HOST = 'ROLE_HOST',
  PREMIUM_USER = 'ROLE_PREMIUM_USER',

  // 비즈니스
  BUSINESS_PENDING = 'ROLE_BUSINESS_PENDING',
  BUSINESS_USER = 'ROLE_BUSINESS_USER',
  BUSINESS_MANAGER = 'ROLE_BUSINESS_MANAGER',
  BUSINESS_ADMIN = 'ROLE_BUSINESS_USER', // Legacy alias

  // 관리자
  MODERATOR = 'ROLE_MODERATOR',
  CONTENT_MANAGER = 'ROLE_CONTENT_MANAGER',
  SUPPORT_MANAGER = 'ROLE_SUPPORT_MANAGER',
  SETTLEMENT_MANAGER = 'ROLE_SETTLEMENT_MANAGER',
  ADMIN = 'ROLE_ADMIN',
  SUPER_ADMIN = 'ROLE_SUPER_ADMIN',
}

// Role type as string for flexibility
export type UserRoleType = string;

// Role levels for comparison
export const ROLE_LEVELS: Record<string, number> = {
  ROLE_USER: 1,
  ROLE_VERIFIED_USER: 2,
  ROLE_HOST: 3,
  ROLE_PREMIUM_USER: 4,
  ROLE_BUSINESS_PENDING: 5,
  ROLE_BUSINESS_USER: 6,
  ROLE_BUSINESS_MANAGER: 7,
  ROLE_MODERATOR: 100,
  ROLE_CONTENT_MANAGER: 100,
  ROLE_SUPPORT_MANAGER: 100,
  ROLE_SETTLEMENT_MANAGER: 100,
  ROLE_ADMIN: 200,
  ROLE_SUPER_ADMIN: 999,
};

interface User {
  id: string;
  email: string;
  name: string;
  nickname?: string;
  role: UserRoleType; // Changed to string for flexibility
  avatar?: {
    id: string;
    url: string;
  };
  location?: string;
  bio?: string;
  gender?: string;
  age?: number;
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
        return ['ROLE_BUSINESS_PENDING', 'ROLE_BUSINESS_USER', 'ROLE_BUSINESS_MANAGER'].includes(user.role);
      },
    }),
    {
      name: 'moa-auth-storage',
    }
  )
);
