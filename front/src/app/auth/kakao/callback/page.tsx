'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api/client';

export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleKakaoCallback = async () => {
      // Get authorization code from URL
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('카카오 로그인이 취소되었습니다.');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      if (!code) {
        setError('인가 코드를 받지 못했습니다.');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      try {
        // Send code to backend
        const response = await apiClient.post('/api/auth/kakao/callback', {
          code,
        });

        if (response.data.success) {
          // Login with received tokens
          login({
            ...response.data.user,
            token: response.data.token,
            refreshToken: response.data.refreshToken,
          });

          // Redirect based on role
          const userRole = response.data.user.roles?.[0] || 'USER';

          // Admin roles
          if (['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'CONTENT_MANAGER', 'SUPPORT_MANAGER', 'SETTLEMENT_MANAGER'].includes(userRole)) {
            router.push('/admin');
          }
          // Business roles
          else if (['BUSINESS_USER', 'BUSINESS_MANAGER', 'BUSINESS_PENDING'].includes(userRole)) {
            router.push('/business');
          }
          // Regular users
          else {
            router.push('/profile');
          }
        } else {
          setError(response.data.message || '로그인에 실패했습니다.');
          setTimeout(() => router.push('/login'), 2000);
        }
      } catch (err: any) {
        console.error('Kakao login error:', err);
        setError(err.response?.data?.message || '카카오 로그인 중 오류가 발생했습니다.');
        setTimeout(() => router.push('/login'), 2000);
      }
    };

    handleKakaoCallback();
  }, [searchParams, router, login]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-moa-primary/20 p-8 text-center">
        {error ? (
          <>
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">로그인 실패</h2>
              <p className="text-gray-600">{error}</p>
            </div>
            <p className="text-sm text-gray-500">잠시 후 로그인 페이지로 이동합니다...</p>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-8 h-8 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.477 3 2 6.477 2 10.75c0 2.568 1.594 4.844 4 6.281V21l3.219-2.125c.896.15 1.84.225 2.781.225 5.523 0 10-3.477 10-7.75S17.523 3 12 3z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">카카오 로그인 중...</h2>
              <p className="text-gray-600">잠시만 기다려주세요</p>
            </div>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-moa-primary"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
