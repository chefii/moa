import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 신고 타입 및 사유 코드 생성 시작...\n');

  // 1. 신고 타입 (REPORT_TYPE)
  console.log('📋 신고 타입 코드 생성 중...');
  const reportTypes = [
    {
      groupCode: 'REPORT_TYPE',
      code: 'REPORT_TYPE_USER',
      name: '사용자 신고',
      description: '부적절한 행동을 하는 사용자 신고',
      value: 'USER',
      order: 1,
      isActive: true,
    },
    {
      groupCode: 'REPORT_TYPE',
      code: 'REPORT_TYPE_BOARD',
      name: '게시글 신고',
      description: '부적절한 게시글 신고',
      value: 'BOARD',
      order: 2,
      isActive: true,
    },
    {
      groupCode: 'REPORT_TYPE',
      code: 'REPORT_TYPE_COMMENT',
      name: '댓글 신고',
      description: '부적절한 댓글 신고',
      value: 'COMMENT',
      order: 3,
      isActive: true,
    },
    {
      groupCode: 'REPORT_TYPE',
      code: 'REPORT_TYPE_GATHERING',
      name: '모임 신고',
      description: '부적절한 모임 신고',
      value: 'GATHERING',
      order: 4,
      isActive: true,
    },
    {
      groupCode: 'REPORT_TYPE',
      code: 'REPORT_TYPE_REVIEW',
      name: '후기 신고',
      description: '부적절한 후기 신고',
      value: 'REVIEW',
      order: 5,
      isActive: false, // 향후 활성화
    },
    {
      groupCode: 'REPORT_TYPE',
      code: 'REPORT_TYPE_CHAT',
      name: '채팅 신고',
      description: '부적절한 채팅 메시지 신고',
      value: 'CHAT',
      order: 6,
      isActive: false, // 향후 활성화
    },
  ];

  for (const type of reportTypes) {
    await prisma.commonCode.upsert({
      where: { code: type.code },
      update: type,
      create: type,
    });
  }
  console.log(`✅ ${reportTypes.length}개의 신고 타입 코드 생성 완료\n`);

  // 2. 사용자 신고 사유 (REPORT_REASON_USER)
  console.log('📋 사용자 신고 사유 코드 생성 중...');
  const userReasons = [
    {
      groupCode: 'REPORT_REASON_USER',
      code: 'REPORT_REASON_USER_HARASSMENT',
      name: '괴롭힘',
      description: '지속적인 괴롭힘 또는 스토킹',
      value: 'HARASSMENT',
      order: 1,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_USER',
      code: 'REPORT_REASON_USER_ABUSE',
      name: '욕설/비방',
      description: '욕설 또는 타인 비방',
      value: 'ABUSE',
      order: 2,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_USER',
      code: 'REPORT_REASON_USER_INAPPROPRIATE',
      name: '부적절한 행동',
      description: '성희롱, 폭력적 행동 등',
      value: 'INAPPROPRIATE',
      order: 3,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_USER',
      code: 'REPORT_REASON_USER_FRAUD',
      name: '사기/허위정보',
      description: '사기 행위 또는 허위 정보 유포',
      value: 'FRAUD',
      order: 4,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_USER',
      code: 'REPORT_REASON_USER_SPAM',
      name: '스팸/광고',
      description: '무분별한 스팸 또는 광고 행위',
      value: 'SPAM',
      order: 5,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_USER',
      code: 'REPORT_REASON_USER_IMPERSONATION',
      name: '사칭',
      description: '다른 사람 또는 기관 사칭',
      value: 'IMPERSONATION',
      order: 6,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_USER',
      code: 'REPORT_REASON_USER_OTHER',
      name: '기타',
      description: '기타 사유',
      value: 'OTHER',
      order: 7,
      isActive: true,
    },
  ];

  for (const reason of userReasons) {
    await prisma.commonCode.upsert({
      where: { code: reason.code },
      update: reason,
      create: reason,
    });
  }
  console.log(`✅ ${userReasons.length}개의 사용자 신고 사유 코드 생성 완료\n`);

  // 3. 게시글 신고 사유 (REPORT_REASON_BOARD)
  console.log('📋 게시글 신고 사유 코드 생성 중...');
  const boardReasons = [
    {
      groupCode: 'REPORT_REASON_BOARD',
      code: 'REPORT_REASON_BOARD_SPAM',
      name: '스팸/광고',
      description: '스팸성 게시물 또는 광고',
      value: 'SPAM',
      order: 1,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_BOARD',
      code: 'REPORT_REASON_BOARD_ABUSE',
      name: '욕설/비방',
      description: '욕설 또는 타인 비방 내용',
      value: 'ABUSE',
      order: 2,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_BOARD',
      code: 'REPORT_REASON_BOARD_INAPPROPRIATE',
      name: '부적절한 컨텐츠',
      description: '성인/폭력적 컨텐츠',
      value: 'INAPPROPRIATE',
      order: 3,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_BOARD',
      code: 'REPORT_REASON_BOARD_FRAUD',
      name: '사기/허위정보',
      description: '사기 또는 허위 정보 유포',
      value: 'FRAUD',
      order: 4,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_BOARD',
      code: 'REPORT_REASON_BOARD_COPYRIGHT',
      name: '저작권 침해',
      description: '저작권 침해 컨텐츠',
      value: 'COPYRIGHT',
      order: 5,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_BOARD',
      code: 'REPORT_REASON_BOARD_PERSONAL_INFO',
      name: '개인정보 노출',
      description: '타인의 개인정보 무단 공개',
      value: 'PERSONAL_INFO',
      order: 6,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_BOARD',
      code: 'REPORT_REASON_BOARD_OFF_TOPIC',
      name: '주제와 무관',
      description: '게시판 주제와 무관한 내용',
      value: 'OFF_TOPIC',
      order: 7,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_BOARD',
      code: 'REPORT_REASON_BOARD_DUPLICATE',
      name: '중복 게시글',
      description: '동일한 내용의 게시글 반복',
      value: 'DUPLICATE',
      order: 8,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_BOARD',
      code: 'REPORT_REASON_BOARD_OTHER',
      name: '기타',
      description: '기타 사유',
      value: 'OTHER',
      order: 9,
      isActive: true,
    },
  ];

  for (const reason of boardReasons) {
    await prisma.commonCode.upsert({
      where: { code: reason.code },
      update: reason,
      create: reason,
    });
  }
  console.log(`✅ ${boardReasons.length}개의 게시글 신고 사유 코드 생성 완료\n`);

  // 4. 댓글 신고 사유 (REPORT_REASON_COMMENT)
  console.log('📋 댓글 신고 사유 코드 생성 중...');
  const commentReasons = [
    {
      groupCode: 'REPORT_REASON_COMMENT',
      code: 'REPORT_REASON_COMMENT_SPAM',
      name: '스팸/광고',
      description: '스팸성 댓글 또는 광고',
      value: 'SPAM',
      order: 1,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_COMMENT',
      code: 'REPORT_REASON_COMMENT_ABUSE',
      name: '욕설/비방',
      description: '욕설 또는 타인 비방',
      value: 'ABUSE',
      order: 2,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_COMMENT',
      code: 'REPORT_REASON_COMMENT_INAPPROPRIATE',
      name: '부적절한 내용',
      description: '성인/폭력적 내용',
      value: 'INAPPROPRIATE',
      order: 3,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_COMMENT',
      code: 'REPORT_REASON_COMMENT_HARASSMENT',
      name: '괴롭힘',
      description: '특정인을 괴롭히는 댓글',
      value: 'HARASSMENT',
      order: 4,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_COMMENT',
      code: 'REPORT_REASON_COMMENT_PERSONAL_INFO',
      name: '개인정보 노출',
      description: '타인의 개인정보 무단 공개',
      value: 'PERSONAL_INFO',
      order: 5,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_COMMENT',
      code: 'REPORT_REASON_COMMENT_OFF_TOPIC',
      name: '주제와 무관',
      description: '게시글과 무관한 댓글',
      value: 'OFF_TOPIC',
      order: 6,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_COMMENT',
      code: 'REPORT_REASON_COMMENT_OTHER',
      name: '기타',
      description: '기타 사유',
      value: 'OTHER',
      order: 7,
      isActive: true,
    },
  ];

  for (const reason of commentReasons) {
    await prisma.commonCode.upsert({
      where: { code: reason.code },
      update: reason,
      create: reason,
    });
  }
  console.log(`✅ ${commentReasons.length}개의 댓글 신고 사유 코드 생성 완료\n`);

  // 5. 모임 신고 사유 (REPORT_REASON_GATHERING)
  console.log('📋 모임 신고 사유 코드 생성 중...');
  const gatheringReasons = [
    {
      groupCode: 'REPORT_REASON_GATHERING',
      code: 'REPORT_REASON_GATHERING_FRAUD',
      name: '사기/허위정보',
      description: '허위 정보로 모임 생성',
      value: 'FRAUD',
      order: 1,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_GATHERING',
      code: 'REPORT_REASON_GATHERING_INAPPROPRIATE',
      name: '부적절한 모임',
      description: '불법적이거나 부적절한 목적의 모임',
      value: 'INAPPROPRIATE',
      order: 2,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_GATHERING',
      code: 'REPORT_REASON_GATHERING_SPAM',
      name: '스팸/광고',
      description: '상업적 광고 목적의 모임',
      value: 'SPAM',
      order: 3,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_GATHERING',
      code: 'REPORT_REASON_GATHERING_HARASSMENT',
      name: '괴롭힘',
      description: '특정인을 괴롭힐 목적의 모임',
      value: 'HARASSMENT',
      order: 4,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_GATHERING',
      code: 'REPORT_REASON_GATHERING_DANGEROUS',
      name: '위험한 활동',
      description: '참여자 안전을 위협하는 활동',
      value: 'DANGEROUS',
      order: 5,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_GATHERING',
      code: 'REPORT_REASON_GATHERING_PRICE_FRAUD',
      name: '금전 사기',
      description: '참가비 등 금전 관련 사기',
      value: 'PRICE_FRAUD',
      order: 6,
      isActive: true,
    },
    {
      groupCode: 'REPORT_REASON_GATHERING',
      code: 'REPORT_REASON_GATHERING_OTHER',
      name: '기타',
      description: '기타 사유',
      value: 'OTHER',
      order: 7,
      isActive: true,
    },
  ];

  for (const reason of gatheringReasons) {
    await prisma.commonCode.upsert({
      where: { code: reason.code },
      update: reason,
      create: reason,
    });
  }
  console.log(`✅ ${gatheringReasons.length}개의 모임 신고 사유 코드 생성 완료\n`);

  // 통계 출력
  const stats = await Promise.all([
    prisma.commonCode.count({ where: { groupCode: 'REPORT_TYPE' } }),
    prisma.commonCode.count({ where: { groupCode: 'REPORT_REASON_USER' } }),
    prisma.commonCode.count({ where: { groupCode: 'REPORT_REASON_BOARD' } }),
    prisma.commonCode.count({ where: { groupCode: 'REPORT_REASON_COMMENT' } }),
    prisma.commonCode.count({ where: { groupCode: 'REPORT_REASON_GATHERING' } }),
  ]);

  console.log('📊 생성 완료 통계:');
  console.log(`   - 신고 타입: ${stats[0]}개`);
  console.log(`   - 사용자 신고 사유: ${stats[1]}개`);
  console.log(`   - 게시글 신고 사유: ${stats[2]}개`);
  console.log(`   - 댓글 신고 사유: ${stats[3]}개`);
  console.log(`   - 모임 신고 사유: ${stats[4]}개`);
  console.log(`   총 ${stats.reduce((a, b) => a + b, 0)}개\n`);

  console.log('✨ 신고 타입 및 사유 코드 생성 완료!\n');
}

main()
  .catch((e) => {
    console.error('❌ 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
