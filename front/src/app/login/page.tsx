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
      console.log(" ===================================================== ");
      console.error('Login error:', err);

      setError(err.response?.data?.message || '로그인에 실패했습니다.');
      setLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    const KAKAO_CLIENT_ID = 'fafcda2f92e74628b5e3f38ce5fe238c';
    // 현재 접속한 호스트에 맞게 동적으로 redirect_uri 생성
    const REDIRECT_URI = `${window.location.origin}/auth/kakao/callback`;
    console.log("REDIRECT_URI : "+REDIRECT_URI);
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;

    window.location.href = kakaoAuthUrl;
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

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-semibold">
                또는
              </span>
            </div>
          </div>

          {/* Kakao Login Button */}
          <button
            type="button"
            onClick={handleKakaoLogin}
            className="w-full py-4 bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.477 3 2 6.477 2 10.75c0 2.568 1.594 4.844 4 6.281V21l3.219-2.125c.896.15 1.84.225 2.781.225 5.523 0 10-3.477 10-7.75S17.523 3 12 3z"/>
            </svg>
            카카오로 시작하기
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
