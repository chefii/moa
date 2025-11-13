'use client';

import { useRouter } from 'next/navigation';
import { useEffect, ReactNode, useState } from 'react';
import { useAuthStore, UserRole } from '@/store/authStore';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export default function RoleGuard({
  children,
  allowedRoles,
  redirectTo = '/login'
}: RoleGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, hasAnyRole } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for Zustand persist to hydrate from localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Don't redirect until hydrated
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated || !user) {
      router.push(redirectTo);
      return;
    }

    if (!hasAnyRole(allowedRoles)) {
      router.push('/');
      return;
    }
  }, [isHydrated, isAuthenticated, user, allowedRoles, hasAnyRole, router, redirectTo]);

  // Show loading until hydrated
  if (!isHydrated || !isAuthenticated || !user || !hasAnyRole(allowedRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moa-primary mx-auto mb-4"></div>
          <p className="text-gray-600">권한 확인 중...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
