'use client';

import { motion } from 'framer-motion';
import { getLevelInfo, getNextLevelInfo, LEVEL_CONFIG } from '@/types/trust';

interface GrowthLevelProps {
  level: number;
  growthPoints: number;
}

export function GrowthLevel({ level, growthPoints }: GrowthLevelProps) {
  const currentLevelInfo = getLevelInfo(growthPoints);
  const nextLevelInfo = getNextLevelInfo(level);

  const progress = nextLevelInfo
    ? ((growthPoints - currentLevelInfo.minPoints) /
       (nextLevelInfo.minPoints - currentLevelInfo.minPoints)) * 100
    : 100;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/20 shadow-2xl p-8">
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `linear-gradient(135deg, ${currentLevelInfo.color}20 0%, ${currentLevelInfo.color}05 100%)`
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Level Icon & Name */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              className="text-7xl"
            >
              {currentLevelInfo.icon}
            </motion.div>
            <div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-medium text-gray-500"
              >
                레벨 {level}
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
              >
                {currentLevelInfo.name}
              </motion.h2>
            </div>
          </div>

          {/* Points Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-2xl shadow-lg"
          >
            <p className="text-xs font-medium opacity-90">성장 포인트</p>
            <p className="text-2xl font-bold">{growthPoints.toLocaleString()}</p>
          </motion.div>
        </div>

        {/* Progress Bar */}
        {nextLevelInfo && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-600">
                다음 레벨까지
              </span>
              <span className="font-bold text-gray-900">
                {nextLevelInfo.minPoints - growthPoints} P
              </span>
            </div>

            {/* Animated Progress Bar */}
            <div className="relative h-3 bg-gray-200/50 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${currentLevelInfo.color}, ${nextLevelInfo.color})`
                }}
              >
                {/* Animated shimmer effect */}
                <motion.div
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: 'linear',
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              </motion.div>
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>{currentLevelInfo.minPoints} P</span>
              <span className="font-semibold">{progress.toFixed(1)}%</span>
              <span>{nextLevelInfo.minPoints} P</span>
            </div>
          </div>
        )}

        {/* Next Level Preview */}
        {nextLevelInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200"
          >
            <p className="text-xs font-medium text-gray-500 mb-2">다음 레벨</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{nextLevelInfo.icon}</span>
              <div>
                <p className="font-bold text-gray-900">{nextLevelInfo.name}</p>
                <p className="text-xs text-gray-600">레벨 {level + 1}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-400/10 to-transparent rounded-full blur-3xl" />
    </div>
  );
}
