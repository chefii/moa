import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 데이터 기반 배지 자동 지급 서비스
 * 배지의 conditionType과 conditionValue를 활용하여
 * 관리자가 배지를 추가하면 자동으로 획득 로직이 적용됩니다.
 */

// ============================================
// 사용자 활동 값 계산 함수들
// ============================================

/**
 * 사용자의 특정 조건에 대한 실제 값을 계산합니다.
 */
async function getUserConditionValue(userId: string, conditionType: string): Promise<number> {
  try {
    switch (conditionType) {
      case 'PARTICIPATION_COUNT': {
        // 모임 참여 횟수
        const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(DISTINCT g.id)::bigint as count
          FROM gatherings g
          INNER JOIN gathering_participants gp ON gp.gathering_id = g.id
          WHERE gp.user_id = ${userId}
          AND gp.status = 'APPROVED'
        `;
        return Number(result[0]?.count || 0);
      }

      case 'HOSTING_COUNT': {
        // 모임 주최 횟수
        const count = await prisma.gathering.count({
          where: { hostId: userId },
        });
        return count;
      }

      case 'ATTENDANCE_RATE': {
        // 참석률 (%) - 최소 10회 이상 참여 필요
        const result = await prisma.$queryRaw<Array<{ total: bigint; attended: bigint }>>`
          SELECT
            COUNT(*)::bigint as total,
            COUNT(CASE WHEN gp.attended = true THEN 1 END)::bigint as attended
          FROM gathering_participants gp
          WHERE gp.user_id = ${userId}
          AND gp.status = 'APPROVED'
        `;
        const total = Number(result[0]?.total || 0);
        const attended = Number(result[0]?.attended || 0);

        if (total < 10) return 0; // 최소 10회 미만이면 0
        return Math.round((attended / total) * 100);
      }

      case 'REVIEW_COUNT': {
        // 리뷰 작성 횟수
        const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*)::bigint as count
          FROM reviews
          WHERE user_id = ${userId}
        `;
        return Number(result[0]?.count || 0);
      }

      case 'STREAK_DAYS': {
        // 연속 출석 일수
        const userStreak = await prisma.userStreak.findUnique({
          where: { userId },
        });
        return userStreak?.currentStreak || 0;
      }

      case 'RATING_SCORE': {
        // 평균 평점 x10 (예: 4.5점 = 45) - 최소 10회 이상 평가 필요
        const result = await prisma.$queryRaw<Array<{ avg_rating: number; count: bigint }>>`
          SELECT
            AVG(rating) as avg_rating,
            COUNT(*)::bigint as count
          FROM reviews
          WHERE reviewed_user_id = ${userId}
        `;
        const avgRating = result[0]?.avg_rating || 0;
        const count = Number(result[0]?.count || 0);

        if (count < 10) return 0; // 최소 10회 미만이면 0
        return Math.round(avgRating * 10);
      }

      case 'EARLY_USER': {
        // 가입 순서 (예: 100 = 100번째 이내)
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { createdAt: true },
        });
        if (!user) return 999999;

        const earlierUsers = await prisma.user.count({
          where: {
            createdAt: { lt: user.createdAt },
          },
        });
        return earlierUsers + 1; // 가입 순서 (1부터 시작)
      }

      case 'NO_LATE': {
        // 지각 횟수 (0 = 지각 없음)
        const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*)::bigint as count
          FROM gathering_participants gp
          WHERE gp.user_id = ${userId}
          AND gp.status = 'APPROVED'
          AND gp.was_late = true
        `;
        return Number(result[0]?.count || 0);
      }

      case 'CHAT_COUNT': {
        // 채팅 메시지 수
        const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*)::bigint as count
          FROM chat_messages
          WHERE user_id = ${userId}
        `;
        return Number(result[0]?.count || 0);
      }

      case 'FRIEND_COUNT': {
        // 친구 수
        const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*)::bigint as count
          FROM friendships
          WHERE (user_id = ${userId} OR friend_id = ${userId})
          AND status = 'ACCEPTED'
        `;
        return Number(result[0]?.count || 0);
      }

      case 'CHALLENGE_COUNT': {
        // 챌린지 완료 수
        const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*)::bigint as count
          FROM user_challenges
          WHERE user_id = ${userId}
          AND status = 'COMPLETED'
        `;
        return Number(result[0]?.count || 0);
      }

      default:
        console.warn(`알 수 없는 조건 타입: ${conditionType}`);
        return 0;
    }
  } catch (error) {
    console.error(`조건 값 계산 실패 (${conditionType}):`, error);
    return 0;
  }
}

// ============================================
// 배지 지급 관련 함수들
// ============================================

/**
 * 사용자가 특정 배지를 이미 보유하고 있는지 확인
 */
async function hasUserBadge(userId: string, badgeId: string): Promise<boolean> {
  const userBadge = await prisma.userBadge.findFirst({
    where: {
      userId,
      badgeId,
    },
  });
  return !!userBadge;
}

/**
 * 배지 지급 (ID로)
 */
async function awardBadgeById(userId: string, badgeId: string, badgeName: string): Promise<boolean> {
  try {
    // 이미 배지를 가지고 있는지 확인
    if (await hasUserBadge(userId, badgeId)) {
      return false;
    }

    await prisma.userBadge.create({
      data: {
        userId,
        badgeId,
        earnedAt: new Date(),
      },
    });

    console.log(`✅ 배지 지급 완료: ${badgeName} -> 사용자 ${userId}`);
    return true;
  } catch (error) {
    console.error('배지 지급 실패:', error);
    return false;
  }
}

/**
 * 조건을 만족하는지 확인
 */
function checkCondition(userValue: number, conditionValue: number, conditionType: string): boolean {
  // NO_LATE는 반대 로직 (0이어야 함)
  if (conditionType === 'NO_LATE') {
    return userValue === conditionValue;
  }

  // EARLY_USER는 이하 로직 (순서가 작거나 같아야 함)
  if (conditionType === 'EARLY_USER') {
    return userValue <= conditionValue;
  }

  // 나머지는 이상 로직 (값이 크거나 같아야 함)
  return userValue >= conditionValue;
}

// ============================================
// 자동 배지 체크 및 지급 (데이터 기반)
// ============================================

/**
 * 특정 conditionType에 해당하는 모든 배지를 체크하고 지급
 */
export async function checkBadgesByConditionType(userId: string, conditionType: string) {
  try {
    // 해당 조건 타입의 모든 활성 배지 조회
    const badges = await prisma.badge.findMany({
      where: {
        conditionType,
        isActive: true,
      },
      orderBy: { conditionValue: 'asc' }, // 조건 값 오름차순
    });

    if (badges.length === 0) {
      return;
    }

    // 사용자의 실제 값 계산
    const userValue = await getUserConditionValue(userId, conditionType);

    console.log(`📊 [${conditionType}] 사용자 값: ${userValue}`);

    // 각 배지의 조건 체크 및 지급
    for (const badge of badges) {
      const meetsCondition = checkCondition(userValue, badge.conditionValue, conditionType);

      if (meetsCondition) {
        await awardBadgeById(userId, badge.id, badge.name);
      }
    }
  } catch (error) {
    console.error(`배지 체크 실패 (${conditionType}):`, error);
  }
}

/**
 * 모든 배지 조건을 체크하고 지급 (종합)
 */
export async function checkAllBadges(userId: string) {
  try {
    console.log(`\n🏅 배지 자동 지급 시작 - 사용자: ${userId}`);

    // 모든 조건 타입 목록
    const conditionTypes = [
      'PARTICIPATION_COUNT',
      'HOSTING_COUNT',
      'ATTENDANCE_RATE',
      'REVIEW_COUNT',
      'STREAK_DAYS',
      'RATING_SCORE',
      'EARLY_USER',
      'NO_LATE',
      'CHAT_COUNT',
      'FRIEND_COUNT',
      'CHALLENGE_COUNT',
    ];

    // 모든 조건 타입에 대해 배지 체크
    for (const conditionType of conditionTypes) {
      await checkBadgesByConditionType(userId, conditionType);
    }

    console.log(`✨ 배지 자동 지급 완료\n`);
  } catch (error) {
    console.error('전체 배지 체크 실패:', error);
  }
}

/**
 * 특정 액션 발생 시 관련 배지만 체크 (성능 최적화)
 */
export async function checkBadgesForAction(userId: string, action: string) {
  const actionToConditionType: Record<string, string[]> = {
    'PARTICIPATE_GATHERING': ['PARTICIPATION_COUNT', 'ATTENDANCE_RATE'],
    'HOST_GATHERING': ['HOSTING_COUNT'],
    'WRITE_REVIEW': ['REVIEW_COUNT'],
    'DAILY_LOGIN': ['STREAK_DAYS'],
    'ADD_FRIEND': ['FRIEND_COUNT'],
    'SEND_CHAT': ['CHAT_COUNT'],
    'COMPLETE_CHALLENGE': ['CHALLENGE_COUNT'],
  };

  const conditionTypes = actionToConditionType[action] || [];

  for (const conditionType of conditionTypes) {
    await checkBadgesByConditionType(userId, conditionType);
  }
}

// ============================================
// 하위 호환성을 위한 기존 함수들 (Deprecated)
// ============================================

/**
 * @deprecated checkBadgesByConditionType('PARTICIPATION_COUNT')를 사용하세요
 */
export async function checkParticipationBadges(userId: string) {
  return checkBadgesByConditionType(userId, 'PARTICIPATION_COUNT');
}

/**
 * @deprecated checkBadgesByConditionType('HOSTING_COUNT')를 사용하세요
 */
export async function checkHostingBadges(userId: string) {
  return checkBadgesByConditionType(userId, 'HOSTING_COUNT');
}

/**
 * @deprecated checkBadgesByConditionType('ATTENDANCE_RATE')를 사용하세요
 */
export async function checkAttendanceBadges(userId: string) {
  return checkBadgesByConditionType(userId, 'ATTENDANCE_RATE');
}

/**
 * @deprecated checkBadgesByConditionType('REVIEW_COUNT')를 사용하세요
 */
export async function checkReviewBadges(userId: string) {
  return checkBadgesByConditionType(userId, 'REVIEW_COUNT');
}

/**
 * @deprecated checkBadgesByConditionType('STREAK_DAYS')를 사용하세요
 */
export async function checkStreakBadges(userId: string) {
  return checkBadgesByConditionType(userId, 'STREAK_DAYS');
}

/**
 * @deprecated checkBadgesByConditionType('FRIEND_COUNT')를 사용하세요
 */
export async function checkFriendBadges(userId: string) {
  return checkBadgesByConditionType(userId, 'FRIEND_COUNT');
}

/**
 * @deprecated checkBadgesByConditionType('RATING_SCORE')를 사용하세요
 */
export async function checkRatingBadges(userId: string) {
  return checkBadgesByConditionType(userId, 'RATING_SCORE');
}

/**
 * @deprecated checkBadgesByConditionType('EARLY_USER')를 사용하세요
 */
export async function checkEarlyUserBadge(userId: string) {
  return checkBadgesByConditionType(userId, 'EARLY_USER');
}

export default {
  checkAllBadges,
  checkBadgesForAction,
  checkBadgesByConditionType,
  // Deprecated functions
  checkParticipationBadges,
  checkHostingBadges,
  checkAttendanceBadges,
  checkReviewBadges,
  checkStreakBadges,
  checkFriendBadges,
  checkRatingBadges,
  checkEarlyUserBadge,
};
