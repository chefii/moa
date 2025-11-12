'use client';

import { useAuthStore, UserRole } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Shield, Building2, User, LogIn } from 'lucide-react';
import { authApi } from '@/lib/api/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.USER);
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
      if (mode === 'register') {
        // Register
        if (!name || !email || !password) {
          setError('모든 필드를 입력해주세요.');
          setLoading(false);
          return;
        }

        const response = await authApi.register({
          email,
          password,
          name,
          role: selectedRole,
        });

        login({
          ...response.user,
          token: response.token,
        });
      } else {
        // Login
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
        });
      }

      // Redirect based on role
      const redirectRole = selectedRole || UserRole.USER;
      switch (redirectRole) {
        case UserRole.SUPER_ADMIN:
          router.push('/admin');
          break;
        case UserRole.BUSINESS_ADMIN:
          router.push('/business');
          break;
        default:
          router.push('/profile');
          break;
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.response?.data?.message || '인증에 실패했습니다.');
      setLoading(false);
    }
  };

  const roles = [
    {
      value: UserRole.USER,
      label: '일반 사용자',
      description: '모임 참여 및 프로필 관리',
      icon: User,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      value: UserRole.BUSINESS_ADMIN,
      label: '비즈니스 관리자',
      description: '클래스 & 공간 운영',
      icon: Building2,
      color: 'from-purple-500 to-pink-500',
    },
    {
      value: UserRole.SUPER_ADMIN,
      label: '플랫폼 관리자',
      description: '전체 시스템 관리',
      icon: Shield,
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            모아
          </h1>
          <p className="text-xl text-gray-600">
            {mode === 'register' ? '회원가입' : '로그인'}
          </p>
        </div>

        {/* Login/Register Form */}
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-purple-100 p-8 mb-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6 bg-gray-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-600'
              }`}
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-600'
              }`}
            >
              회원가입
            </button>
          </div>

          {/* Name (register only) */}
          {mode === 'register' && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                이름
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition-colors"
                required={mode === 'register'}
              />
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition-colors"
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
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Role Selection (register only) */}
          {mode === 'register' && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                역할 선택
              </label>
              <div className="grid grid-cols-1 gap-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.value;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setSelectedRole(role.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg'
                          : 'border-purple-200 bg-white hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{role.label}</h3>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                {mode === 'register' ? '회원가입' : '로그인'}
              </>
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
          <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {mode === 'register' ? '회원가입 안내' : '테스트 계정'}
          </h3>
          {mode === 'register' ? (
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>역할에 따라 다른 기능에 접근할 수 있습니다</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>비밀번호는 안전하게 암호화되어 저장됩니다</span>
              </li>
            </ul>
          ) : (
            <p className="text-sm text-blue-800">
              계정이 없으신가요? 회원가입 탭에서 새 계정을 만드세요!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
