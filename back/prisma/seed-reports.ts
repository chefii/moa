import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 신고 더미데이터 생성 시작...\n');

  // 1. 기존 사용자 확인
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
    },
    take: 20,
  });

  if (users.length < 2) {
    console.error('❌ 최소 2명 이상의 사용자가 필요합니다.');
    return;
  }

  console.log(`✅ ${users.length}명의 사용자 확인`);
  users.forEach((user, idx) => {
    console.log(`   ${idx + 1}. ${user.email} (${user.name})`);
  });

  // 2. 신고 사유 공통코드 확인
  let reportReasonCodes = await prisma.commonCode.findMany({
    where: { groupCode: 'REPORT_REASON' },
  });

  if (reportReasonCodes.length === 0) {
    console.log('\n⚠️  신고 사유 공통코드가 없습니다. 생성합니다...');

    const reasons = [
      {
        groupCode: 'REPORT_REASON',
        code: 'SPAM',
        name: '스팸/광고',
        description: '스팸성 게시물 또는 광고',
        value: 'SPAM',
        order: 1,
        isActive: true,
      },
      {
        groupCode: 'REPORT_REASON',
        code: 'ABUSE',
        name: '욕설/비방',
        description: '욕설 또는 타인 비방',
        value: 'ABUSE',
        order: 2,
        isActive: true,
      },
      {
        groupCode: 'REPORT_REASON',
        code: 'INAPPROPRIATE',
        name: '부적절한 컨텐츠',
        description: '성인/폭력적 컨텐츠',
        value: 'INAPPROPRIATE',
        order: 3,
        isActive: true,
      },
      {
        groupCode: 'REPORT_REASON',
        code: 'HARASSMENT',
        name: '괴롭힘',
        description: '지속적인 괴롭힘 또는 스토킹',
        value: 'HARASSMENT',
        order: 4,
        isActive: true,
      },
      {
        groupCode: 'REPORT_REASON',
        code: 'FRAUD',
        name: '사기/허위정보',
        description: '사기 또는 허위 정보 유포',
        value: 'FRAUD',
        order: 5,
        isActive: true,
      },
      {
        groupCode: 'REPORT_REASON',
        code: 'COPYRIGHT',
        name: '저작권 침해',
        description: '저작권 침해 컨텐츠',
        value: 'COPYRIGHT',
        order: 6,
        isActive: true,
      },
      {
        groupCode: 'REPORT_REASON',
        code: 'PERSONAL_INFO',
        name: '개인정보 노출',
        description: '타인의 개인정보 무단 공개',
        value: 'PERSONAL_INFO',
        order: 7,
        isActive: true,
      },
      {
        groupCode: 'REPORT_REASON',
        code: 'OTHER',
        name: '기타',
        description: '기타 사유',
        value: 'OTHER',
        order: 8,
        isActive: true,
      },
    ];

    for (const reason of reasons) {
      await prisma.commonCode.create({ data: reason });
    }

    reportReasonCodes = await prisma.commonCode.findMany({
      where: { groupCode: 'REPORT_REASON' },
    });

    console.log(`✅ ${reportReasonCodes.length}개의 신고 사유 코드 생성 완료`);
  } else {
    console.log(`\n✅ ${reportReasonCodes.length}개의 신고 사유 코드 확인`);
  }

  // 3. 신고 상태 코드 확인
  const reportStatusCodes = await prisma.commonCode.findMany({
    where: { groupCode: 'REPORT_STATUS' },
  });

  if (reportStatusCodes.length === 0) {
    console.error('❌ 신고 상태 공통코드가 없습니다. npm run prisma:seed-report-status를 먼저 실행해주세요.');
    return;
  }

  console.log(`✅ ${reportStatusCodes.length}개의 신고 상태 코드 확인\n`);

  // 4. 기존 신고 데이터 삭제
  await prisma.report.deleteMany();
  console.log('✅ 기존 신고 데이터 삭제 완료\n');

  // 5. 더미 신고 데이터 생성
  const statusCodes = ['PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED'];
  const reportDescriptions = [
    '모임 중 지속적으로 욕설을 하고 다른 참여자들에게 불편함을 주었습니다.',
    '개인적인 금전 거래를 요구하며 모임의 목적과 무관한 행동을 했습니다.',
    '약속 시간에 늦게 오고, 사전 연락 없이 무단 결석했습니다.',
    '다른 참여자의 개인 정보를 동의 없이 공유했습니다.',
    '허위 정보로 모임을 생성하여 참여자들을 속였습니다.',
    '모임 채팅방에서 상업적 광고를 지속적으로 게시했습니다.',
    '다른 참여자를 지속적으로 괴롭히고 불쾌한 메시지를 보냈습니다.',
    '모임과 관련 없는 정치적, 종교적 주장을 강요했습니다.',
    '부적절한 사진과 링크를 공유하여 다른 참여자들에게 불쾌감을 주었습니다.',
    '모임 참가비를 받고 잠적했습니다.',
    '채팅방에서 타인을 지속적으로 비방하는 메시지를 보냈습니다.',
    '사칭하여 다른 사람을 속이는 행위를 했습니다.',
    '모임 규칙을 반복적으로 위반하고 경고를 무시했습니다.',
    '모임 장소에서 소란을 피우고 다른 참여자들을 방해했습니다.',
    '연락 두절로 인해 모임 진행에 차질이 생겼습니다.',
  ];

  const adminNotes = [
    '확인 결과 사실로 판명되어 해당 사용자에게 경고 조치했습니다.',
    '증거 자료 부족으로 반려 처리합니다.',
    '해당 사용자 계정 정지 7일 처리 완료했습니다.',
    '양측 조정 완료하여 처리 완료했습니다.',
    '신고 내용이 사실과 다르며, 오해에서 비롯된 것으로 확인되어 반려합니다.',
    '해당 사용자에게 최종 경고를 보냈으며, 재발 시 영구 정지 처리될 예정입니다.',
    '모임 내 분쟁으로 확인되어 쌍방 주의 조치했습니다.',
    '신고 내용 확인 후 해당 게시물 삭제 처리했습니다.',
  ];

  const reports = [];
  const reportCount = Math.min(25, users.length * (users.length - 1)); // 최대 25개

  for (let i = 0; i < reportCount; i++) {
    const reporterIndex = i % users.length;
    let reportedIndex = (i + 1) % users.length;

    // 같은 사람끼리는 신고 못하게
    if (reporterIndex === reportedIndex) {
      reportedIndex = (reportedIndex + 1) % users.length;
    }

    const reporter = users[reporterIndex];
    const reported = users[reportedIndex];
    const reasonCode = reportReasonCodes[i % reportReasonCodes.length].code;
    const statusCode = statusCodes[i % statusCodes.length];

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30)); // 최근 30일 내

    const reportData: any = {
      reporterId: reporter.id,
      reportedId: reported.id,
      reasonCode,
      statusCode,
      description: reportDescriptions[i % reportDescriptions.length],
      createdAt,
    };

    // RESOLVED나 REJECTED 상태면 관리자 노트와 처리 시간 추가
    if (statusCode === 'RESOLVED' || statusCode === 'REJECTED') {
      reportData.adminNote = adminNotes[i % adminNotes.length];
      const resolvedAt = new Date(createdAt);
      resolvedAt.setHours(resolvedAt.getHours() + Math.floor(Math.random() * 48)); // 0~48시간 후 처리
      reportData.resolvedAt = resolvedAt;

      // 첫 번째 사용자(관리자)가 처리한 것으로
      if (users[0]) {
        reportData.resolvedBy = users[0].id;
      }
    }

    reports.push(reportData);
  }

  // 신고 데이터 생성
  for (const report of reports) {
    await prisma.report.create({ data: report });
  }

  console.log(`✅ ${reports.length}개의 신고 더미데이터 생성 완료\n`);

  // 6. 생성된 신고 통계 출력
  const [pending, reviewing, resolved, rejected] = await Promise.all([
    prisma.report.count({ where: { statusCode: 'PENDING' } }),
    prisma.report.count({ where: { statusCode: 'REVIEWING' } }),
    prisma.report.count({ where: { statusCode: 'RESOLVED' } }),
    prisma.report.count({ where: { statusCode: 'REJECTED' } }),
  ]);

  console.log('📊 신고 상태별 통계:');
  console.log(`   - 대기중 (PENDING): ${pending}건`);
  console.log(`   - 검토중 (REVIEWING): ${reviewing}건`);
  console.log(`   - 처리완료 (RESOLVED): ${resolved}건`);
  console.log(`   - 반려됨 (REJECTED): ${rejected}건`);

  console.log('\n📋 최근 신고 목록 (5건):');
  const recentReports = await prisma.report.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      reporter: {
        select: { email: true, name: true },
      },
      reported: {
        select: { email: true, name: true },
      },
      reasonCommonCode: {
        select: { name: true },
      },
      statusCommonCode: {
        select: { name: true },
      },
    },
  });

  recentReports.forEach((report, idx) => {
    console.log(`\n   ${idx + 1}. [${report.statusCommonCode.name}] ${report.reasonCommonCode.name}`);
    console.log(`      신고자: ${report.reporter.email}`);
    console.log(`      피신고자: ${report.reported.email}`);
    console.log(`      내용: ${report.description?.substring(0, 50)}...`);
  });

  console.log('\n✨ 신고 더미데이터 생성 완료!\n');
}

main()
  .catch((e) => {
    console.error('❌ 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
