'use client';

import RoleGuard from '@/components/auth/RoleGuard';
import { UserRole, useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import {
  Users,
  Building2,
  Shield,
  BarChart3,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for admin dashboard
  const stats = {
    totalUsers: 12847,
    activeGatherings: 342,
    businessAccounts: 89,
    monthlyRevenue: 45600000,
    reportedIssues: 23,
    resolvedIssues: 156,
  };

  const recentUsers = [
    { id: '1', name: '김철수', email: 'kim@example.com', role: 'USER', status: 'active', joinedAt: '2025-01-10' },
    { id: '2', name: '이영희', email: 'lee@example.com', role: 'BUSINESS_ADMIN', status: 'active', joinedAt: '2025-01-09' },
    { id: '3', name: '박민수', email: 'park@example.com', role: 'USER', status: 'pending', joinedAt: '2025-01-08' },
  ];

  const recentGatherings = [
    { id: '1', title: '요리 클래스', host: '쿠킹스튜디오', status: 'active', participants: 12 },
    { id: '2', title: '북클럽 모임', host: '김독서', status: 'active', participants: 8 },
    { id: '3', title: '등산 동호회', host: '산악회', status: 'pending', participants: 15 },
  ];

  return (
    <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN]}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-purple-100 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-purple-600" />
                <div>
                  <h1 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    관리자 대시보드
                  </h1>
                  <p className="text-sm text-gray-600">플랫폼 전체 관리</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-purple-600">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-white/80 backdrop-blur-lg rounded-2xl p-2 shadow-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              개요
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              사용자 관리
            </button>
            <button
              onClick={() => setActiveTab('gatherings')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'gatherings'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              모임 관리
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-purple-100">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-blue-500" />
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">총 사용자</p>
                  <p className="text-3xl font-black text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                </div>

                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-purple-100">
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="w-8 h-8 text-purple-500" />
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">진행중인 모임</p>
                  <p className="text-3xl font-black text-gray-900">{stats.activeGatherings.toLocaleString()}</p>
                </div>

                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-purple-100">
                  <div className="flex items-center justify-between mb-4">
                    <Building2 className="w-8 h-8 text-pink-500" />
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">비즈니스 계정</p>
                  <p className="text-3xl font-black text-gray-900">{stats.businessAccounts.toLocaleString()}</p>
                </div>
              </div>

              {/* Revenue & Issues */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-purple-100">
                  <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-900">월 수익</h3>
                  </div>
                  <p className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    ₩{(stats.monthlyRevenue / 10000).toLocaleString()}만
                  </p>
                  <p className="text-sm text-green-600 font-semibold">▲ 전월 대비 +12.5%</p>
                </div>

                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-purple-100">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                    <h3 className="text-lg font-bold text-gray-900">신고 처리</h3>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">대기중</p>
                      <p className="text-3xl font-black text-orange-600">{stats.reportedIssues}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">해결완료</p>
                      <p className="text-3xl font-black text-green-600">{stats.resolvedIssues}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
              <div className="p-6 border-b border-purple-100">
                <h3 className="text-xl font-bold text-gray-900">최근 가입 사용자</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">이름</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">이메일</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">역할</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">상태</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">가입일</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-100">
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-purple-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{user.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'BUSINESS_ADMIN'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {user.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.joinedAt}</td>
                        <td className="px-6 py-4">
                          <button className="text-purple-600 hover:text-purple-700 text-sm font-semibold">
                            상세보기
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'gatherings' && (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
              <div className="p-6 border-b border-purple-100">
                <h3 className="text-xl font-bold text-gray-900">모임 관리</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">제목</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">호스트</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">참여자</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">상태</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-100">
                    {recentGatherings.map((gathering) => (
                      <tr key={gathering.id} className="hover:bg-purple-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{gathering.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{gathering.host}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{gathering.participants}명</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            gathering.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {gathering.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {gathering.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-purple-600 hover:text-purple-700 text-sm font-semibold">
                            관리
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
