'use client';

import { motion } from 'framer-motion';

interface StatsCardProps {
  attendanceRate: number;
  averageRating: number;
  hostedCount: number;
  totalParticipations: number;
}

export function StatsCard({
  attendanceRate,
  averageRating,
  hostedCount,
  totalParticipations,
}: StatsCardProps) {
  const stats = [
    {
      label: '참석률',
      value: `${attendanceRate}%`,
      icon: '✅',
      color: 'from-green-500 to-emerald-600',
    },
    {
      label: '평균 리뷰',
      value: averageRating.toFixed(1),
      icon: '⭐',
      color: 'from-amber-500 to-yellow-600',
      suffix: '/5.0',
    },
    {
      label: '주최 모임',
      value: hostedCount,
      icon: '🎪',
      color: 'from-purple-500 to-pink-600',
      suffix: '개',
    },
    {
      label: '총 참여',
      value: totalParticipations,
      icon: '🎯',
      color: 'from-blue-500 to-cyan-600',
      suffix: '개',
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/20 shadow-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">📊</span>
        <h3 className="text-lg font-bold text-gray-900">활동 통계</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200"
          >
            {/* Icon */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color}`} />
            </div>

            {/* Value */}
            <div className="flex items-baseline gap-1">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                className={`text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
              >
                {stat.value}
              </motion.span>
              {stat.suffix && (
                <span className="text-sm font-medium text-gray-500">
                  {stat.suffix}
                </span>
              )}
            </div>

            {/* Label */}
            <p className="text-xs font-medium text-gray-600 mt-1">{stat.label}</p>

            {/* Decorative gradient */}
            <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color} opacity-50`} />
          </motion.div>
        ))}
      </div>

      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-2xl" />
    </div>
  );
}
