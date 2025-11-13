'use client';

import { motion } from 'framer-motion';
import { UserBadge } from '@/types/trust';

interface BadgeGridProps {
  badges: UserBadge[];
  totalBadges?: number;
}

const BADGE_CATEGORY_COLORS = {
  BASIC: 'from-blue-500 to-cyan-500',
  HOST: 'from-moa-primary to-moa-accent',
  SPECIAL: 'from-orange-500 to-amber-500',
  SEASONAL: 'from-rose-500 to-moa-accent',
};

export function BadgeGrid({ badges, totalBadges = 20 }: BadgeGridProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/20 shadow-2xl p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">획득 뱃지</h3>
          <p className="text-sm text-gray-600 mt-1">
            {badges.length} / {totalBadges} 개 수집
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white px-5 py-2 rounded-xl shadow-lg">
          <span className="text-sm font-medium">수집률 </span>
          <span className="text-lg font-bold">{((badges.length / totalBadges) * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-200/50 rounded-full overflow-hidden mb-8">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(badges.length / totalBadges) * 100}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
        />
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
        {badges.map((userBadge, index) => (
          <motion.div
            key={userBadge.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: index * 0.05,
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="group relative"
          >
            {/* Badge Container */}
            <div className={`
              relative aspect-square rounded-2xl p-4 cursor-pointer
              bg-gradient-to-br ${BADGE_CATEGORY_COLORS[userBadge.badge.category]}
              shadow-lg hover:shadow-2xl transition-shadow duration-300
            `}>
              {/* Badge Icon */}
              <div className="flex items-center justify-center h-full">
                <span className="text-4xl drop-shadow-lg">{userBadge.badge.icon}</span>
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Tooltip */}
            <div className="
              absolute bottom-full left-1/2 -translate-x-1/2 mb-2
              opacity-0 group-hover:opacity-100 pointer-events-none
              transition-opacity duration-200 z-10
            ">
              <div className="bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
                {userBadge.badge.name}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                  <div className="border-4 border-transparent border-t-gray-900" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Empty badge slots */}
        {Array.from({ length: totalBadges - badges.length }).map((_, index) => (
          <motion.div
            key={`empty-${index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: (badges.length + index) * 0.05 }}
            className="relative aspect-square rounded-2xl p-4 bg-gray-100 border-2 border-dashed border-gray-300"
          >
            <div className="flex items-center justify-center h-full">
              <span className="text-3xl opacity-20">🔒</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-400/10 to-transparent rounded-full blur-3xl" />
    </div>
  );
}
