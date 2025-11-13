'use client';

import RoleGuard from '@/components/auth/RoleGuard';
import { UserRole, useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import {
  Calendar,
  Users,
  DollarSign,
  Building2,
  Star,
  TrendingUp,
  Clock,
  MapPin,
  Plus
} from 'lucide-react';

export default function BusinessDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for business dashboard
  const stats = {
    totalGatherings: 24,
    totalParticipants: 342,
    monthlyRevenue: 12400000,
    avgRating: 4.8,
    upcomingGatherings: 8,
  };

  const myGatherings = [
    {
      id: '1',
      title: '홈메이드 파스타 클래스',
      date: '2025-01-15',
      time: '14:00',
      participants: 12,
      maxParticipants: 15,
      revenue: 480000,
      status: 'upcoming'
    },
    {
      id: '2',
      title: '베이킹 원데이 클래스',
      date: '2025-01-20',
      time: '10:00',
      participants: 8,
      maxParticipants: 10,
      revenue: 320000,
      status: 'upcoming'
    },
    {
      id: '3',
      title: '일식 요리 기초',
      date: '2025-01-08',
      time: '15:00',
      participants: 10,
      maxParticipants: 10,
      revenue: 400000,
      status: 'completed'
    },
  ];

  const recentReviews = [
    { id: '1', userName: '김민지', gathering: '홈메이드 파스타 클래스', rating: 5, comment: '정말 재밌었어요! 선생님이 친절하셔서 좋았습니다.', date: '2025-01-10' },
    { id: '2', userName: '이준호', gathering: '베이킹 원데이 클래스', rating: 4, comment: '유익한 시간이었습니다. 다음에 또 참여하고 싶어요.', date: '2025-01-09' },
    { id: '3', userName: '박서연', gathering: '일식 요리 기초', rating: 5, comment: '최고였어요! 강력 추천합니다.', date: '2025-01-08' },
  ];

  return (
    <RoleGuard allowedRoles={[
      UserRole.BUSINESS_USER,
      UserRole.BUSINESS_MANAGER,
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
    ]}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-orange-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-moa-primary/20 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-moa-primary" />
                <div>
                  <h1 className="text-2xl font-black bg-moa-primary bg-clip-text text-transparent">
                    비즈니스 대시보드
                  </h1>
                  <p className="text-sm text-gray-600">내 클래스 & 공간 관리</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-moa-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <Plus className="w-5 h-5" />
                  새 모임 만들기
                </button>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-moa-primary">{user?.role}</p>
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
                  ? 'bg-moa-primary text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              개요
            </button>
            <button
              onClick={() => setActiveTab('gatherings')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'gatherings'
                  ? 'bg-moa-primary text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              내 모임
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'reviews'
                  ? 'bg-moa-primary text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              리뷰 관리
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-moa-primary/20">
                  <Calendar className="w-8 h-8 text-blue-500 mb-4" />
                  <p className="text-sm text-gray-600 mb-1">총 모임</p>
                  <p className="text-3xl font-black text-gray-900">{stats.totalGatherings}</p>
                </div>

                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-moa-primary/20">
                  <Users className="w-8 h-8 text-moa-primary mb-4" />
                  <p className="text-sm text-gray-600 mb-1">총 참여자</p>
                  <p className="text-3xl font-black text-gray-900">{stats.totalParticipants}</p>
                </div>

                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-moa-primary/20">
                  <DollarSign className="w-8 h-8 text-green-500 mb-4" />
                  <p className="text-sm text-gray-600 mb-1">월 수익</p>
                  <p className="text-2xl font-black text-gray-900">₩{(stats.monthlyRevenue / 10000).toLocaleString()}만</p>
                </div>

                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-moa-primary/20">
                  <Star className="w-8 h-8 text-yellow-500 mb-4" />
                  <p className="text-sm text-gray-600 mb-1">평균 평점</p>
                  <p className="text-3xl font-black text-gray-900">{stats.avgRating}</p>
                </div>

                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-moa-primary/20">
                  <Clock className="w-8 h-8 text-moa-accent mb-4" />
                  <p className="text-sm text-gray-600 mb-1">예정 모임</p>
                  <p className="text-3xl font-black text-gray-900">{stats.upcomingGatherings}</p>
                </div>
              </div>

              {/* Performance Chart */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-moa-primary/20">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-moa-primary" />
                  <h3 className="text-xl font-bold text-gray-900">이번 달 성과</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">신규 예약</p>
                    <p className="text-4xl font-black bg-moa-primary bg-clip-text text-transparent mb-1">
                      +45
                    </p>
                    <p className="text-sm text-green-600 font-semibold">▲ 전월 대비 +28%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">재방문율</p>
                    <p className="text-4xl font-black bg-moa-primary bg-clip-text text-transparent mb-1">
                      68%
                    </p>
                    <p className="text-sm text-green-600 font-semibold">▲ 전월 대비 +5%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">리뷰 점수</p>
                    <p className="text-4xl font-black bg-moa-primary bg-clip-text text-transparent mb-1">
                      4.8
                    </p>
                    <p className="text-sm text-blue-600 font-semibold">← 지난달 동일</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gatherings' && (
            <div className="space-y-4">
              {myGatherings.map((gathering) => (
                <div
                  key={gathering.id}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-moa-primary/20 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900">{gathering.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          gathering.status === 'upcoming'
                            ? 'bg-blue-100 text-blue-700'
                            : gathering.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {gathering.status === 'upcoming' ? '예정' : '완료'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{gathering.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{gathering.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">{gathering.participants}/{gathering.maxParticipants}명</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className="text-lg font-bold text-green-600">₩{gathering.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button className="px-6 py-2 bg-moa-primary text-white font-semibold rounded-xl hover:bg-moa-primary-dark transition-colors">
                        관리
                      </button>
                      {gathering.status === 'upcoming' && (
                        <button className="px-6 py-2 bg-white border-2 border-moa-primary text-moa-primary font-semibold rounded-xl hover:bg-moa-primary/10 transition-colors">
                          수정
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">예약률</span>
                      <span className="font-semibold text-gray-900">
                        {Math.round((gathering.participants / gathering.maxParticipants) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-moa-primary rounded-full transition-all"
                        style={{ width: `${(gathering.participants / gathering.maxParticipants) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-moa-primary/20"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-moa-primary-light to-moa-accent-light rounded-full flex items-center justify-center text-white font-bold">
                        {review.userName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{review.userName}</p>
                        <p className="text-sm text-gray-600">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{review.gathering}</p>
                  <p className="text-gray-900">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
