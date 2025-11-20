import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('배지 획득 조건 타입 공통코드 생성 시작...');

  // BADGE_CONDITION 그룹의 기존 데이터 삭제
  await prisma.commonCode.deleteMany({
    where: { groupCode: 'BADGE_CONDITION' },
  });
  console.log('✅ 기존 배지 획득 조건 타입 삭제 완료');

  // 배지 획득 조건 타입 생성
  const conditionTypes = await prisma.commonCode.createMany({
    data: [
      {
        groupCode: 'BADGE_CONDITION',
        code: 'ATTENDANCE_RATE',
        name: '참석률',
        value: '참석률 (%) - 최소 10회 이상 참여 필요',
        order: 1,
        isActive: true,
      },
      {
        groupCode: 'BADGE_CONDITION',
        code: 'HOSTING_COUNT',
        name: '모임 주최 횟수',
        value: '주최한 모임 수',
        order: 2,
        isActive: true,
      },
      {
        groupCode: 'BADGE_CONDITION',
        code: 'PARTICIPATION_COUNT',
        name: '모임 참여 횟수',
        value: '참여한 모임 수',
        order: 3,
        isActive: true,
      },
      {
        groupCode: 'BADGE_CONDITION',
        code: 'REVIEW_COUNT',
        name: '리뷰 작성 횟수',
        value: '작성한 리뷰 수',
        order: 4,
        isActive: true,
      },
      {
        groupCode: 'BADGE_CONDITION',
        code: 'STREAK_DAYS',
        name: '연속 출석 일수',
        value: '연속으로 출석한 날짜 수',
        order: 5,
        isActive: true,
      },
      {
        groupCode: 'BADGE_CONDITION',
        code: 'RATING_SCORE',
        name: '평균 평점',
        value: '평균 평점 x10 (예: 4.5점 = 45) - 최소 10회 이상 평가 필요',
        order: 6,
        isActive: true,
      },
      {
        groupCode: 'BADGE_CONDITION',
        code: 'EARLY_USER',
        name: '초기 가입자 순위',
        value: '가입 순서 (예: 100 = 100번째 이내)',
        order: 7,
        isActive: true,
      },
      {
        groupCode: 'BADGE_CONDITION',
        code: 'NO_LATE',
        name: '지각 횟수',
        value: '지각 횟수 (0 = 지각 없음)',
        order: 8,
        isActive: true,
      },
      {
        groupCode: 'BADGE_CONDITION',
        code: 'CHAT_COUNT',
        name: '채팅 횟수',
        value: '전송한 채팅 메시지 수',
        order: 9,
        isActive: true,
      },
      {
        groupCode: 'BADGE_CONDITION',
        code: 'FRIEND_COUNT',
        name: '친구 수',
        value: '추가한 친구 수',
        order: 10,
        isActive: true,
      },
      {
        groupCode: 'BADGE_CONDITION',
        code: 'CHALLENGE_COUNT',
        name: '챌린지 완료 수',
        value: '완료한 챌린지 수',
        order: 11,
        isActive: true,
      },
    ],
  });

  console.log(`✅ ${conditionTypes.count}개의 배지 획득 조건 타입 생성 완료`);

  // 생성된 공통코드 확인
  const createdCodes = await prisma.commonCode.findMany({
    where: { groupCode: 'BADGE_CONDITION' },
    orderBy: { order: 'asc' },
  });

  console.log('\n📊 생성된 배지 획득 조건 타입:');
  createdCodes.forEach((code) => {
    console.log(`   - ${code.code}: ${code.name} (${code.value})`);
  });

  console.log('\n✨ 배지 획득 조건 타입 공통코드 생성 완료!\n');
}

main()
  .catch((e) => {
    console.error('오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
