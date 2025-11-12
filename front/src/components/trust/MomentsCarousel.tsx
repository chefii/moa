'use client';

import { motion } from 'framer-motion';
import { MomentCollection } from '@/types/trust';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface MomentsCarouselProps {
  moments: MomentCollection[];
}

export function MomentsCarousel({ moments }: MomentsCarouselProps) {
  const recentMoment = moments[0];
  const rareMoments = moments.filter((m) => m.isRare);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/50 shadow-2xl p-6">
      {/* Decorative background */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">모인 순간들</h3>
            <p className="text-sm text-gray-600">{moments.length}개 수집</p>
          </div>
          <span className="text-3xl">📸</span>
        </div>

        {/* Recent Moment */}
        {recentMoment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-purple-200/30"
          >
            <p className="text-xs font-medium text-gray-500 mb-2">최근 순간</p>
            <div className="flex items-center gap-3">
              <motion.span
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="text-4xl"
              >
                {recentMoment.momentIcon}
              </motion.span>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{recentMoment.momentName}</p>
                <p className="text-xs text-gray-600">
                  {formatDistanceToNow(new Date(recentMoment.earnedAt), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Rare Moments */}
        {rareMoments.length > 0 && (
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-4 border border-amber-300/30">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">⭐</span>
              <p className="text-sm font-bold text-amber-900">희귀 순간</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {rareMoments.slice(0, 3).map((moment, index) => (
                <motion.div
                  key={moment.id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.1, type: 'spring' }}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg flex items-center gap-2 border border-amber-200"
                >
                  <span className="text-2xl">{moment.momentIcon}</span>
                  <span className="text-xs font-medium text-gray-700">
                    {moment.momentName}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* View All Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
        >
          모든 순간 보기
        </motion.button>
      </div>
    </div>
  );
}
