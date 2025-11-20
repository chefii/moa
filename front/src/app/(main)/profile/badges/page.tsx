'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import MobileLayout from '@/components/MobileLayout';
import { ArrowLeft, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  isEarned: boolean;
  earnedAt?: string;
  category: 'basic' | 'special' | 'rare';
}

export default function AllBadgesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'earned' | 'unearned'>('all');

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

  useEffect(() => {
    const fetchBadges = async () => {
      if (!user) return;

      try {
        setLoading(true);
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
        setLoading(false);
      }
    };

    fetchBadges();
  }, [user]);

  const filteredBadges = badges.filter((badge) => {
    if (activeTab === 'earned') return badge.isEarned;
    if (activeTab === 'unearned') return !badge.isEarned;
    return true;
  });

  const getBadgeStyle = (badge: Badge) => {
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
    <MobileLayout>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900">전체 배지</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {loading ? '로딩 중...' : `${badges.filter(b => b.isEarned).length}/${badges.length} 획득`}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
              activeTab === 'all'
                ? 'bg-moa-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            전체 ({badges.length})
          </button>
          <button
            onClick={() => setActiveTab('earned')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
              activeTab === 'earned'
                ? 'bg-moa-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            획득 ({badges.filter(b => b.isEarned).length})
          </button>
          <button
            onClick={() => setActiveTab('unearned')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
              activeTab === 'unearned'
                ? 'bg-moa-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            미획득 ({badges.filter(b => !b.isEarned).length})
          </button>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="p-5 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-moa-primary"></div>
          </div>
        ) : filteredBadges.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Award className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold">
              {activeTab === 'earned' && '획득한 배지가 없습니다'}
              {activeTab === 'unearned' && '미획득 배지가 없습니다'}
              {activeTab === 'all' && '배지가 없습니다'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBadges.map((badge) => (
              <div
                key={badge.id}
                className={`${getBadgeStyle(badge)} rounded-xl p-4 transition-all active:scale-98`}
              >
                <div className="flex items-center gap-3">
                  {/* Badge Icon */}
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 ${
                      badge.isEarned ? 'bg-white/60' : 'bg-gray-200/60 grayscale opacity-40'
                    }`}
                  >
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
                    {badge.isEarned && badge.earnedAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(badge.earnedAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}{' '}
                        획득
                      </p>
                    )}
                    {!badge.isEarned && (
                      <p className="text-xs text-gray-400 mt-1">미획득</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
