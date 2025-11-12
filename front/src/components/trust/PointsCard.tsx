'use client';

import { motion } from 'framer-motion';

interface PointsCardProps {
  currentPoints: number;
  monthlyEarned: number;
}

export function PointsCard({ currentPoints, monthlyEarned }: PointsCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200/50 shadow-2xl p-6">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-amber-400 to-yellow-400 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">모아 포인트</h3>
          <span className="text-3xl">✨</span>
        </div>

        {/* Current Points */}
        <div className="mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex items-baseline gap-2"
          >
            <span className="text-5xl font-black bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
              {currentPoints.toLocaleString()}
            </span>
            <span className="text-xl font-bold text-amber-600">P</span>
          </motion.div>
          <p className="text-sm text-gray-600 mt-2">사용 가능한 포인트</p>
        </div>

        {/* Monthly Earned */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-amber-200/30"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">이번 달 획득</span>
            <div className="flex items-center gap-1">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-xl"
              >
                📈
              </motion.span>
              <span className="text-lg font-bold text-amber-600">
                +{monthlyEarned.toLocaleString()}P
              </span>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <span className="text-lg mb-1 block">🎁</span>
            <span className="text-xs">사용하기</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/80 backdrop-blur-sm text-gray-700 font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-amber-200"
          >
            <span className="text-lg mb-1 block">📋</span>
            <span className="text-xs">내역</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
