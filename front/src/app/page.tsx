'use client';

import Link from "next/link";
import { useAuthStore, UserRole } from '@/store/authStore';
import { User, Building2, Shield, LogOut, LogIn } from 'lucide-react';

export default function Home() {
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="text-center max-w-4xl w-full">
        <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          모아
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          관심사로 모이는 사람들
        </p>

        {isAuthenticated && user ? (
          <>
            {/* User Info */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-purple-100 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user.name[0]}
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      user.role === UserRole.SUPER_ADMIN
                        ? 'bg-red-100 text-red-700'
                        : user.role === UserRole.BUSINESS_ADMIN
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role === UserRole.SUPER_ADMIN ? '플랫폼 관리자' :
                       user.role === UserRole.BUSINESS_ADMIN ? '비즈니스 관리자' : '일반 사용자'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  로그아웃
                </button>
              </div>
            </div>

            {/* Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Link href="/profile" className="group">
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-purple-100 hover:shadow-2xl hover:scale-105 transition-all">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">내 프로필</h3>
                  <p className="text-gray-600 text-sm">신뢰도 시스템 & 활동 내역</p>
                </div>
              </Link>

              {/* Business Dashboard (only for BUSINESS_ADMIN and SUPER_ADMIN) */}
              {(user.role === UserRole.BUSINESS_ADMIN || user.role === UserRole.SUPER_ADMIN) && (
                <Link href="/business" className="group">
                  <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-purple-100 hover:shadow-2xl hover:scale-105 transition-all">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">비즈니스</h3>
                    <p className="text-gray-600 text-sm">클래스 & 공간 관리</p>
                  </div>
                </Link>
              )}

              {/* Admin Dashboard (only for SUPER_ADMIN) */}
              {user.role === UserRole.SUPER_ADMIN && (
                <Link href="/admin" className="group">
                  <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-purple-100 hover:shadow-2xl hover:scale-105 transition-all">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">관리자</h3>
                    <p className="text-gray-600 text-sm">플랫폼 전체 관리</p>
                  </div>
                </Link>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Login Button */}
            <Link href="/login" className="group inline-block">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-purple-100 hover:shadow-2xl hover:scale-105 transition-all">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <LogIn className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">로그인</h3>
                <p className="text-gray-600 text-sm">모아를 시작해보세요</p>
              </div>
            </Link>

            {/* Info Box */}
            <div className="mt-12 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-left">
              <h3 className="font-bold text-blue-900 mb-3">📍 테스트 가이드</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• <strong>일반 사용자</strong>: 신뢰도 시스템과 프로필 확인</li>
                <li>• <strong>비즈니스 관리자</strong>: 클래스/공간 운영 대시보드</li>
                <li>• <strong>플랫폼 관리자</strong>: 전체 시스템 관리 기능</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
