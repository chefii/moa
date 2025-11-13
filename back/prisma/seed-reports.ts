import { PrismaClient, ReportStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding reports...');

  // Get users
  const users = await prisma.user.findMany({
    take: 5,
  });

  if (users.length < 2) {
    console.log('❌ Need at least 2 users. Please create users first.');
    return;
  }

  // Delete existing reports
  await prisma.report.deleteMany({});

  const reportReasons = [
    '스팸/광고',
    '욕설/혐오 발언',
    '부적절한 콘텐츠',
    '사기/허위 정보',
    '개인정보 노출',
  ];

  const reportDescriptions = [
    '게시글에 광고성 링크가 포함되어 있습니다.',
    '댓글에서 욕설을 사용하고 있습니다.',
    '부적절한 이미지를 게시했습니다.',
    '사기성 모임을 개설했습니다.',
    '타인의 개인정보를 무단으로 공개했습니다.',
  ];

  const reports = [];

  // Create PENDING reports
  for (let i = 0; i < 3; i++) {
    reports.push({
      reporterId: users[0].id,
      reportedId: users[1].id,
      reason: reportReasons[i % reportReasons.length],
      description: reportDescriptions[i % reportDescriptions.length],
      status: ReportStatus.PENDING,
    });
  }

  // Create REVIEWING reports
  for (let i = 0; i < 2; i++) {
    reports.push({
      reporterId: users[0].id,
      reportedId: users[1].id,
      reason: reportReasons[(i + 3) % reportReasons.length],
      description: reportDescriptions[(i + 3) % reportDescriptions.length],
      status: ReportStatus.REVIEWING,
    });
  }

  // Create RESOLVED reports
  for (let i = 0; i < 2; i++) {
    reports.push({
      reporterId: users[0].id,
      reportedId: users[1].id,
      reason: reportReasons[(i + 1) % reportReasons.length],
      description: reportDescriptions[(i + 1) % reportDescriptions.length],
      status: ReportStatus.RESOLVED,
      adminNote: '확인 완료하였으며, 경고 조치했습니다.',
      resolvedAt: new Date(),
    });
  }

  // Create REJECTED reports
  reports.push({
    reporterId: users[0].id,
    reportedId: users[1].id,
    reason: '기타',
    description: '신고 사유가 명확하지 않습니다.',
    status: ReportStatus.REJECTED,
    adminNote: '신고 내용이 불충분하여 반려합니다.',
    resolvedAt: new Date(),
  });

  // Insert reports
  for (const report of reports) {
    await prisma.report.create({
      data: report,
    });
    console.log(`✅ Created ${report.status} report: ${report.reason}`);
  }

  console.log('\n✨ Reports seeding completed!');
  console.log(`📊 Total reports: ${reports.length}`);
  console.log(`   - PENDING: 3`);
  console.log(`   - REVIEWING: 2`);
  console.log(`   - RESOLVED: 2`);
  console.log(`   - REJECTED: 1`);
  console.log('\n🔔 Badge count should show: 5 (PENDING + REVIEWING)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding reports:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
