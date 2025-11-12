'use client';

import { motion } from 'framer-motion';
import { InterestForest, getTreeLevel } from '@/types/trust';

interface InterestForestCardProps {
  forest: InterestForest[];
}

export function InterestForestCard({ forest }: InterestForestCardProps) {
  const sortedForest = [...forest].sort((a, b) => b.participationCount - a.participationCount);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50 shadow-2xl p-6">
      {/* Animated background */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">관심사 숲</h3>
            <p className="text-sm text-gray-600">{forest.length}개 카테고리</p>
          </div>
          <span className="text-3xl">🌳</span>
        </div>

        {/* Forest Items */}
        <div className="space-y-4">
          {sortedForest.map((item, index) => {
            const treeInfo = getTreeLevel(item.participationCount);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-emerald-200/30 hover:shadow-lg transition-shadow">
                  {/* Category Icon */}
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-2xl shadow-lg">
                    {item.categoryIcon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900 truncate">
                        {item.categoryName}
                      </p>
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {treeInfo.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {item.participationCount}회 참여
                    </p>
                  </div>

                  {/* Trees */}
                  <motion.div
                    className="flex items-center gap-0.5 text-xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                  >
                    {treeInfo.icon}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Diversity Badge (if applicable) */}
        {forest.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-300/50 rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌈</span>
              <div>
                <p className="font-bold text-gray-900">다양성 보너스 달성!</p>
                <p className="text-sm text-gray-600">
                  {forest.length}개 카테고리 탐험 중
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
