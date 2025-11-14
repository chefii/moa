'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Shield, LogIn } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('이메일과 비밀번호를 입력해주세요.');
        setLoading(false);
        return;
      }

      const response = await authApi.login({
        email,
        password,
      });

      login({
        ...response.user,
        token: response.token,
        refreshToken: response.refreshToken,
      });

      // Redirect based on role
      const userRole = response.user.role;

      // Admin roles (level >= 100)
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
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black mb-3 text-moa-primary">
            모아
          </h1>
          <p className="text-xl text-gray-600">로그인</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-moa-primary/20 p-8 mb-6">
          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              이메일 <span className="text-xs text-gray-500">{ /*(관리자는 아이디만 입력)*/}</span>
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-moa-primary/30 focus:border-moa-primary focus:outline-none transition-colors bg-white text-gray-900 placeholder:text-gray-400"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border-2 border-moa-primary/30 focus:border-moa-primary focus:outline-none transition-colors bg-white text-gray-900 placeholder:text-gray-400"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-moa-primary hover:bg-moa-primary-dark text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                로그인
              </>
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-gray-600">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="text-moa-primary font-bold hover:text-moa-accent transition-colors">
              회원가입하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
