'use client';

import { useAuthStore, UserRole } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Shield, Building2, User, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/');
    return null;
  }

  const handleLogin = () => {
    if (!selectedRole || !name || !email) {
      alert('모든 정보를 입력해주세요.');
      return;
    }

    login({
      id: Math.random().toString(36).substring(7),
      email,
      name,
      role: selectedRole,
    });

    // Redirect based on role
    switch (selectedRole) {
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
  };

  const roles = [
    {
      value: UserRole.USER,
      label: '일반 사용자',
      description: '모임 참여 및 프로필 관리',
      icon: User,
      color: 'from-blue-500 to-cyan-500',
      redirect: '/profile',
    },
    {
      value: UserRole.BUSINESS_ADMIN,
      label: '비즈니스 관리자',
      description: '클래스 & 공간 운영',
      icon: Building2,
      color: 'from-purple-500 to-pink-500',
      redirect: '/business',
    },
    {
      value: UserRole.SUPER_ADMIN,
      label: '플랫폼 관리자',
      description: '전체 시스템 관리',
      icon: Shield,
      color: 'from-orange-500 to-red-500',
      redirect: '/admin',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            모아
          </h1>
          <p className="text-xl text-gray-600">
            테스트용 로그인
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-purple-100 p-8 mb-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              역할 선택
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.value;
                return (
                  <button
                    key={role.value}
                    onClick={() => setSelectedRole(role.value)}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg scale-105'
                        : 'border-purple-200 bg-white hover:border-purple-300 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{role.label}</h3>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={!selectedRole || !name || !email}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            로그인
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
          <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            테스트 안내
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>일반 사용자</strong>: 프로필 페이지로 이동하여 신뢰도 시스템 확인</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>비즈니스 관리자</strong>: 클래스/공간 운영 대시보드 접근</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>플랫폼 관리자</strong>: 전체 시스템 관리 대시보드 접근</span>
            </li>
          </ul>
        </div>

        {/* Quick Login Buttons */}
        <div className="mt-6">
          <p className="text-center text-sm text-gray-600 mb-3">빠른 로그인</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setName('테스트 사용자');
                setEmail('user@test.com');
                setSelectedRole(UserRole.USER);
              }}
              className="px-4 py-2 bg-white/80 backdrop-blur-lg rounded-xl text-sm font-semibold text-gray-700 hover:bg-white transition-colors"
            >
              일반 사용자로
            </button>
            <button
              onClick={() => {
                setName('비즈니스 오너');
                setEmail('business@test.com');
                setSelectedRole(UserRole.BUSINESS_ADMIN);
              }}
              className="px-4 py-2 bg-white/80 backdrop-blur-lg rounded-xl text-sm font-semibold text-gray-700 hover:bg-white transition-colors"
            >
              비즈니스로
            </button>
            <button
              onClick={() => {
                setName('관리자');
                setEmail('admin@test.com');
                setSelectedRole(UserRole.SUPER_ADMIN);
              }}
              className="px-4 py-2 bg-white/80 backdrop-blur-lg rounded-xl text-sm font-semibold text-gray-700 hover:bg-white transition-colors"
            >
              관리자로
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
