'use client';

import { motion } from 'framer-motion';
import { GrowthLevel } from '@/components/trust/GrowthLevel';
import { BadgeGrid } from '@/components/trust/BadgeGrid';
import { StreakCard } from '@/components/trust/StreakCard';
import { PointsCard } from '@/components/trust/PointsCard';
import { MomentsCarousel } from '@/components/trust/MomentsCarousel';
import { InterestForestCard } from '@/components/trust/InterestForestCard';
import { StatsCard } from '@/components/profile/StatsCard';

// Mock data - 실제로는 API에서 가져와야 함
const mockData = {
  user: {
    name: '김모아',
    username: 'kimoa',
    profileImage: null,
    joinedMonths: 3,
  },
  level: {
    level: 5,
    growthPoints: 523,
  },
  badges: [
    {
      id: '1',
      userId: '1',
      badgeId: '1',
      earnedAt: '2025-01-01',
      badge: {
        id: '1',
        code: 'attendance_master',
        name: '출석왕',
        description: '참석률 95% 이상',
        icon: '✅',
        category: 'BASIC' as const,
        conditionType: 'attendance_rate',
        conditionValue: 95,
        isActive: true,
      },
    },
    {
      id: '2',
      userId: '1',
      badgeId: '2',
      earnedAt: '2025-01-05',
      badge: {
        id: '2',
        code: 'time_keeper',
        name: '시간지킴이',
        description: '지각 0회',
        icon: '⏰',
        category: 'BASIC' as const,
        conditionType: 'late_count',
        conditionValue: 0,
        isActive: true,
      },
    },
    {
      id: '3',
      userId: '1',
      badgeId: '3',
      earnedAt: '2025-01-10',
      badge: {
        id: '3',
        code: 'chatterbox',
        name: '수다쟁이',
        description: '채팅 메시지 100개 이상',
        icon: '💬',
        category: 'BASIC' as const,
        conditionType: 'chat_count',
        conditionValue: 100,
        isActive: true,
      },
    },
    {
      id: '4',
      userId: '1',
      badgeId: '4',
      earnedAt: '2025-01-15',
      badge: {
        id: '4',
        code: 'popular',
        name: '인기쟁이',
        description: '평균 리뷰 4.5점 이상',
        icon: '❤️',
        category: 'BASIC' as const,
        conditionType: 'avg_rating',
        conditionValue: 45,
        isActive: true,
      },
    },
    {
      id: '5',
      userId: '1',
      badgeId: '5',
      earnedAt: '2025-01-20',
      badge: {
        id: '5',
        code: 'meeting_maker',
        name: '모임 메이커',
        description: '모임 5개 이상 주최',
        icon: '🎪',
        category: 'HOST' as const,
        conditionType: 'host_count',
        conditionValue: 5,
        isActive: true,
      },
    },
    {
      id: '6',
      userId: '1',
      badgeId: '6',
      earnedAt: '2025-01-01',
      badge: {
        id: '6',
        code: 'early_bird',
        name: '얼리버드',
        description: '초기 100명 가입자',
        icon: '🦄',
        category: 'SPECIAL' as const,
        conditionType: 'user_number',
        conditionValue: 100,
        isActive: true,
      },
    },
    {
      id: '7',
      userId: '1',
      badgeId: '7',
      earnedAt: '2025-01-25',
      badge: {
        id: '7',
        code: 'finisher',
        name: '완주자',
        description: '챌린지 5개 완료',
        icon: '🎯',
        category: 'BASIC' as const,
        conditionType: 'challenge_complete',
        conditionValue: 5,
        isActive: true,
      },
    },
  ],
  streak: {
    id: '1',
    userId: '1',
    currentStreak: 15,
    longestStreak: 23,
    lastActivityDate: '2025-11-10',
  },
  points: {
    current: 420,
    monthlyEarned: 120,
  },
  moments: [
    {
      id: '1',
      userId: '1',
      momentCode: 'tenth_meeting',
      momentName: '10번째 모임',
      momentIcon: '🎉',
      isRare: false,
      earnedAt: '2025-11-09T10:00:00Z',
    },
    {
      id: '2',
      userId: '1',
      momentCode: 'hundredth_meeting',
      momentName: '100번째 모임',
      momentIcon: '💯',
      isRare: true,
      earnedAt: '2025-10-15T14:00:00Z',
    },
    {
      id: '3',
      userId: '1',
      momentCode: 'first_host',
      momentName: '첫 호스팅',
      momentIcon: '🎪',
      isRare: false,
      earnedAt: '2025-09-01T09:00:00Z',
    },
  ],
  forest: [
    {
      id: '1',
      userId: '1',
      categoryId: '1',
      categoryName: '음악',
      categoryIcon: '🎵',
      participationCount: 28,
      treeLevel: 4,
    },
    {
      id: '2',
      userId: '1',
      categoryId: '2',
      categoryName: '요리',
      categoryIcon: '🍳',
      participationCount: 15,
      treeLevel: 3,
    },
    {
      id: '3',
      userId: '1',
      categoryId: '3',
      categoryName: '독서',
      categoryIcon: '📚',
      participationCount: 8,
      treeLevel: 2,
    },
    {
      id: '4',
      userId: '1',
      categoryId: '4',
      categoryName: '운동',
      categoryIcon: '⚽',
      participationCount: 4,
      treeLevel: 1,
    },
    {
      id: '5',
      userId: '1',
      categoryId: '5',
      categoryName: '예술',
      categoryIcon: '🎨',
      participationCount: 1,
      treeLevel: 1,
    },
  ],
  stats: {
    attendanceRate: 95,
    averageRating: 4.8,
    hostedCount: 5,
    totalParticipations: 38,
  },
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-moa-primary to-moa-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6"
          >
            {/* Profile Image */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border-4 border-white/30 shadow-2xl flex items-center justify-center text-5xl"
            >
              👤
            </motion.div>

            {/* User Info */}
            <div>
              <h1 className="text-4xl font-black mb-2">{mockData.user.name}</h1>
              <p className="text-lg opacity-90">
                @{mockData.user.username} • 가입 {mockData.user.joinedMonths}개월
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Growth Level */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GrowthLevel
                level={mockData.level.level}
                growthPoints={mockData.level.growthPoints}
              />
            </motion.div>

            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <BadgeGrid badges={mockData.badges} totalBadges={20} />
            </motion.div>

            {/* Interest Forest */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <InterestForestCard forest={mockData.forest} />
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <StatsCard {...mockData.stats} />
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Streak */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <StreakCard streak={mockData.streak} />
            </motion.div>

            {/* Points */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <PointsCard
                currentPoints={mockData.points.current}
                monthlyEarned={mockData.points.monthlyEarned}
              />
            </motion.div>

            {/* Moments */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <MomentsCarousel moments={mockData.moments} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
