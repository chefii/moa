// Trust System Types

export interface UserLevel {
  id: string;
  userId: string;
  level: number;
  growthPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: 'BASIC' | 'HOST' | 'SPECIAL' | 'SEASONAL';
  conditionType: string;
  conditionValue: number;
  isActive: boolean;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
  badge: Badge;
}

export interface UserPoint {
  id: string;
  userId: string;
  points: number;
  balance: number;
  type: 'EARN' | 'SPEND';
  source: string;
  description?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface UserStreak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}

export interface MomentCollection {
  id: string;
  userId: string;
  momentCode: string;
  momentName: string;
  momentIcon: string;
  isRare: boolean;
  earnedAt: string;
}

export interface InterestForest {
  id: string;
  userId: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  participationCount: number;
  treeLevel: number;
}

export const LEVEL_CONFIG = [
  { level: 1, name: '씨앗', icon: '🌰', minPoints: 0, maxPoints: 49, color: '#8B7355' },
  { level: 2, name: '새싹', icon: '🌱', minPoints: 50, maxPoints: 149, color: '#90EE90' },
  { level: 3, name: '화분', icon: '🪴', minPoints: 150, maxPoints: 299, color: '#32CD32' },
  { level: 4, name: '작은 나무', icon: '🌿', minPoints: 300, maxPoints: 499, color: '#228B22' },
  { level: 5, name: '나무', icon: '🌳', minPoints: 500, maxPoints: 699, color: '#006400' },
  { level: 6, name: '큰 나무', icon: '🌲', minPoints: 700, maxPoints: 999, color: '#2F4F4F' },
  { level: 7, name: '열매나무', icon: '🌳🍎', minPoints: 1000, maxPoints: 999999, color: '#FFD700' },
];

export const TREE_LEVELS = [
  { level: 1, name: '새싹', icon: '🌱', minCount: 1, maxCount: 2 },
  { level: 2, name: '묘목', icon: '🌳', minCount: 3, maxCount: 7 },
  { level: 3, name: '작은 나무', icon: '🌳🌳', minCount: 8, maxCount: 14 },
  { level: 4, name: '나무', icon: '🌳🌳🌳', minCount: 15, maxCount: 29 },
  { level: 5, name: '큰 나무', icon: '🌳🌳🌳🌳', minCount: 30, maxCount: 49 },
  { level: 6, name: '거목', icon: '🌳🌳🌳🌳🌳', minCount: 50, maxCount: 999999 },
];

export function getLevelInfo(points: number) {
  return LEVEL_CONFIG.find(
    (config) => points >= config.minPoints && points <= config.maxPoints
  ) || LEVEL_CONFIG[0];
}

export function getNextLevelInfo(currentLevel: number) {
  return LEVEL_CONFIG[currentLevel] || null;
}

export function getTreeLevel(count: number) {
  return TREE_LEVELS.find(
    (level) => count >= level.minCount && count <= level.maxCount
  ) || TREE_LEVELS[0];
}
