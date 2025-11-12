'use client';

import { motion } from 'framer-motion';
import { UserStreak } from '@/types/trust';

interface StreakCardProps {
  streak: UserStreak;
}

const STREAK_MILESTONES = [
  { days: 3, label: '활발한 시작!', icon: '🔥', reward: 0 },
  { days: 7, label: '일주일 완주!', icon: '🔥🔥', reward: 10 },
  { days: 30, label: '이번 달 완벽!', icon: '🔥🔥🔥', reward: 50 },
  { days: 90, label: '모아 마스터!', icon: '🔥🔥🔥🔥', reward: 150 },
  { days: 365, label: '1년 연속 레전드!', icon: '🔥🔥🔥🔥🔥', reward: 500 },
];

export function StreakCard({ streak }: StreakCardProps) {
  const nextMilestone = STREAK_MILESTONES.find(
    (m) => m.days > streak.currentStreak
  );
  const daysUntilNext = nextMilestone ? nextMilestone.days - streak.currentStreak : 0;

  const currentMilestone = STREAK_MILESTONES.filter(
    (m) => m.days <= streak.currentStreak
  ).pop() || STREAK_MILESTONES[0];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200/50 shadow-2xl p-6">
      {/* Animated flame background */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl"
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">스트릭</h3>
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            className="text-4xl"
          >
            🔥
          </motion.div>
        </div>

        {/* Current Streak */}
        <div className="mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex items-baseline gap-2"
          >
            <span className="text-6xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {streak.currentStreak}
            </span>
            <span className="text-2xl font-bold text-gray-600">일</span>
          </motion.div>
          <p className="text-sm text-gray-600 mt-2">연속 참여 중</p>
        </div>

        {/* Milestone Icons */}
        <div className="flex items-center gap-2 mb-4">
          {STREAK_MILESTONES.map((milestone, index) => (
            <div
              key={milestone.days}
              className={`
                text-2xl transition-all duration-300
                ${streak.currentStreak >= milestone.days ? 'opacity-100 scale-110' : 'opacity-30 grayscale'}
              `}
            >
              {milestone.icon.split('').slice(0, index + 1).join('')}
            </div>
          ))}
        </div>

        {/* Next Milestone Progress */}
        {nextMilestone && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-600">
                {nextMilestone.label}
              </span>
              <span className="font-bold text-orange-600">
                {daysUntilNext}일 남음
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-white/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${((streak.currentStreak - (currentMilestone.days || 0)) / (nextMilestone.days - (currentMilestone.days || 0))) * 100}%`,
                }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
              >
                {/* Animated shimmer */}
                <motion.div
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: 'linear',
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />
              </motion.div>
            </div>

            {/* Reward Badge */}
            {nextMilestone.reward > 0 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
              >
                <span>보상</span>
                <span>+{nextMilestone.reward}P</span>
              </motion.div>
            )}
          </div>
        )}

        {/* Longest Streak */}
        <div className="mt-4 pt-4 border-t border-orange-200/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">최장 기록</span>
            <span className="font-bold text-gray-900 flex items-center gap-1">
              <span className="text-lg">🏆</span>
              {streak.longestStreak}일
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
