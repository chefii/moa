'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import MobileLayout from '@/components/MobileLayout';
import MobileHeader from '@/components/MobileHeader';
import { apiClient } from '@/lib/api/client';
import {
  Settings,
  ChevronRight,
  Trophy,
  Flame,
  Star,
  Calendar,
  Award,
  TrendingUp,
  Heart,
  Users,
  MessageSquare,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';

// 배지 데이터 타입
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  isEarned: boolean;
  earnedAt?: string;
  category: 'basic' | 'special' | 'rare';
}

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState({
    participations: 38,
    hostedMeetings: 5,
    attendanceRate: 95,
    averageRating: 4.8,
  });

  const [points, setPoints] = useState({
    current: 420,
    streak: 15,
  });

  const [showAllBadges, setShowAllBadges] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 배지 API 카테고리를 프론트엔드 카테고리로 매핑
  const mapBadgeCategory = (apiCategory: string): 'basic' | 'special' | 'rare' => {
    switch (apiCategory) {
      case 'BASIC':
        return 'basic';
      case 'HOST':
        return 'rare';
      case 'SPECIAL':
        return 'special';
      case 'SEASONAL':
        return 'rare';
      default:
        return 'basic';
    }
  };

  // 배지 데이터 가져오기
  useEffect(() => {
    const fetchBadges = async () => {
      if (!user) return;

      try {
        setBadgesLoading(true);
        const response = await apiClient.get('/api/trust/badges/me/all');

        if (response.data.success) {
          const mappedBadges: Badge[] = response.data.data.map((badge: any) => ({
            id: badge.id,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            isEarned: badge.isEarned,
            earnedAt: badge.earnedAt,
            category: mapBadgeCategory(badge.category),
          }));

          // 희귀도 우선 + 최신 획득일 순으로 정렬
          const sortedBadges = mappedBadges.sort((a, b) => {
            // 획득한 배지만 먼저
            if (a.isEarned && !b.isEarned) return -1;
            if (!a.isEarned && b.isEarned) return 1;

            // 둘 다 획득했거나 둘 다 미획득인 경우
            if (a.isEarned === b.isEarned) {
              // 희귀도 순서 정의 (rare > special > basic)
              const rarityOrder = { rare: 1, special: 2, basic: 3 };
              const rarityDiff = rarityOrder[a.category] - rarityOrder[b.category];

              if (rarityDiff !== 0) {
                return rarityDiff; // 희귀도가 다르면 희귀도 순
              }

              // 희귀도가 같으면 획득일 최신순 (획득한 경우만)
              if (a.isEarned && a.earnedAt && b.earnedAt) {
                return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime();
              }
            }

            return 0;
          });

          setBadges(sortedBadges);
        }
      } catch (error) {
        console.error('배지 데이터 로딩 실패:', error);
      } finally {
        setBadgesLoading(false);
      }
    };

    fetchBadges();
  }, [user]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
    window.location.href = '/';
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  if (!isAuthenticated || !user) {
    return (
      <MobileLayout>
        <MobileHeader />
        <div className="flex-1 flex items-center justify-center px-5 py-20">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              로그인이 필요합니다
            </h2>
            <p className="text-gray-600 mb-6">
              프로필을 확인하려면 로그인해주세요
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-moa-primary text-white font-bold rounded-xl"
            >
              로그인하기
            </Link>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <MobileHeader />

      {/* Profile Header */}
      <div className="bg-gradient-to-br from-moa-primary to-moa-accent px-5 py-8 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative">
          {/* Settings Button */}
          <Link
            href="/settings"
            className="absolute top-0 right-0 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </Link>

          {/* Profile Info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
              <span className="text-3xl font-bold">
                {user.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-black mb-1">{user.name}</h1>
              <p className="text-sm opacity-90">{user.email}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="w-4 h-4" />
                <span className="text-xl font-black">{points.streak}</span>
              </div>
              <p className="text-xs opacity-90">연속 출석</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-4 h-4" />
                <span className="text-xl font-black">{points.current}</span>
              </div>
              <p className="text-xs opacity-90">포인트</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="w-4 h-4" />
                <span className="text-xl font-black">Lv.5</span>
              </div>
              <p className="text-xs opacity-90">레벨</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 px-5 py-6 space-y-6">
        {/* Activity Stats */}
        <section className="bg-white rounded-2xl p-5">
          <h2 className="text-lg font-black text-gray-900 mb-4">활동 통계</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-black text-gray-900 mb-1">
                {stats.participations}
              </p>
              <p className="text-xs text-gray-600">참여한 모임</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <Users className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-black text-gray-900 mb-1">
                {stats.hostedMeetings}
              </p>
              <p className="text-xs text-gray-600">주최한 모임</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-black text-gray-900 mb-1">
                {stats.attendanceRate}%
              </p>
              <p className="text-xs text-gray-600">출석률</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
              <Heart className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-black text-gray-900 mb-1">
                {stats.averageRating.toFixed(1)}
              </p>
              <p className="text-xs text-gray-600">평균 평점</p>
            </div>
          </div>
        </section>

        {/* My Badges */}
        <section className="bg-white rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">내 배지</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {badgesLoading ? '로딩 중...' : `${badges.filter(b => b.isEarned).length}/${badges.length} 획득`}
              </p>
            </div>
            <Link
              href="/profile/badges"
              className="flex items-center gap-1 text-sm font-semibold text-moa-primary"
            >
              전체보기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {badgesLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-moa-primary"></div>
            </div>
          ) : badges.filter(b => b.isEarned).length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Award className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>획득한 배지가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
            {(showAllBadges
              ? badges.filter(b => b.isEarned)
              : badges.filter(b => b.isEarned).slice(0, 5)
            ).map((badge) => {
              const getBadgeStyle = () => {
                if (!badge.isEarned) {
                  return 'bg-gray-50 border-2 border-gray-200';
                }
                switch (badge.category) {
                  case 'rare':
                    return 'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200';
                  case 'special':
                    return 'bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200';
                  default:
                    return 'bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200';
                }
              };

              return (
                <div
                  key={badge.id}
                  className={`${getBadgeStyle()} rounded-xl p-4 transition-all active:scale-98`}
                >
                  <div className="flex items-center gap-3">
                    {/* Badge Icon */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 ${
                      badge.isEarned ? 'bg-white/60' : 'bg-gray-200/60 grayscale opacity-40'
                    }`}>
                      {badge.isEarned ? badge.icon : '🔒'}
                    </div>

                    {/* Badge Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-bold ${badge.isEarned ? 'text-gray-900' : 'text-gray-400'}`}>
                          {badge.name}
                        </h3>
                        {badge.category === 'rare' && badge.isEarned && (
                          <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded-full">
                            희귀
                          </span>
                        )}
                        {badge.category === 'special' && badge.isEarned && (
                          <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
                            특별
                          </span>
                        )}
                      </div>
                      <p className={`text-xs ${badge.isEarned ? 'text-gray-600' : 'text-gray-400'}`}>
                        {badge.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          )}

          {/* Show More / Show Less Button */}
          {!badgesLoading && badges.filter(b => b.isEarned).length > 5 && (
            <button
              onClick={() => setShowAllBadges(!showAllBadges)}
              className="w-full mt-3 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {showAllBadges ? (
                <>
                  <span>접기</span>
                  <ChevronRight className="w-4 h-4 -rotate-90" />
                </>
              ) : (
                <>
                  <span>더보기</span>
                  <span className="text-sm text-gray-500">
                    ({badges.filter(b => b.isEarned).length - 5}개 더 보기)
                  </span>
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </>
              )}
            </button>
          )}
        </section>

        {/* Menu List */}
        <section className="bg-white rounded-2xl overflow-hidden">
          <Link
            href="/profile/edit"
            className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-semibold text-gray-900">프로필 수정</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link
            href="/my-gatherings"
            className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <span className="font-semibold text-gray-900">내 모임 관리</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link
            href="/profile/reviews"
            className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-orange-600" />
              </div>
              <span className="font-semibold text-gray-900">내 리뷰</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link
            href="/profile/achievements"
            className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="font-semibold text-gray-900">업적 & 배지</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <span className="font-semibold text-red-600">로그아웃</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </section>

        {/* App Version */}
        <p className="text-center text-sm text-gray-400 pb-20">
          moa v.20251117.0
        </p>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-5">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">
                로그아웃 하시겠습니까?
              </h3>
              <p className="text-sm text-gray-600">
                다시 로그인하여 모든 기능을 이용하실 수 있습니다.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleLogoutCancel}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 px-4 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation (same as homepage) */}
      <nav className="sticky bottom-0 bg-white border-t border-gray-200 px-5 py-3 flex items-center justify-around">
        <Link href="/" className="flex flex-col items-center gap-1 text-gray-400">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </div>
          <span className="text-xs font-semibold">홈</span>
        </Link>

        <Link href="/gatherings" className="flex flex-col items-center gap-1 text-gray-400">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span className="text-xs font-semibold">둘러보기</span>
        </Link>

        <Link href="/create-gathering" className="flex flex-col items-center gap-1 -mt-6">
          <div className="w-14 h-14 bg-moa-primary rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        </Link>

        <Link href="/my-gatherings" className="flex flex-col items-center gap-1 text-gray-400">
          <Calendar className="w-5 h-5" />
          <span className="text-xs font-semibold">내 모임</span>
        </Link>

        <Link href="/profile" className="flex flex-col items-center gap-1 text-moa-primary">
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          <span className="text-xs font-semibold">MY</span>
        </Link>
      </nav>
    </MobileLayout>
  );
}
