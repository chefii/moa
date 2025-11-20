import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 신고 상태 공통코드 생성 시작...\n');

  // REPORT_STATUS 그룹의 공통코드 생성
  const reportStatuses = [
    {
      groupCode: 'REPORT_STATUS',
      code: 'PENDING',
      name: '대기중',
      description: '신고 접수 대기중',
      value: 'PENDING',
      order: 1,
      isActive: true,
    },
    {
      groupCode: 'REPORT_STATUS',
      code: 'REVIEWING',
      name: '검토중',
      description: '관리자가 신고 내용 검토중',
      value: 'REVIEWING',
      order: 2,
      isActive: true,
    },
    {
      groupCode: 'REPORT_STATUS',
      code: 'RESOLVED',
      name: '처리완료',
      description: '신고 처리 완료',
      value: 'RESOLVED',
      order: 3,
      isActive: true,
    },
    {
      groupCode: 'REPORT_STATUS',
      code: 'REJECTED',
      name: '반려됨',
      description: '신고 반려됨',
      value: 'REJECTED',
      order: 4,
      isActive: true,
    },
  ];

  // 기존 REPORT_STATUS 코드 삭제
  await prisma.commonCode.deleteMany({
    where: { groupCode: 'REPORT_STATUS' },
  });
  console.log('✅ 기존 신고 상태 공통코드 삭제 완료');

  // 새로운 신고 상태 공통코드 생성
  for (const status of reportStatuses) {
    await prisma.commonCode.create({
      data: status,
    });
    console.log(`   ✓ ${status.name} (${status.code}) 생성`);
  }

  console.log('\n✨ 신고 상태 공통코드 생성 완료!');
  console.log(`   - 생성된 코드 수: ${reportStatuses.length}개\n`);

  // 생성된 공통코드 확인
  const createdCodes = await prisma.commonCode.findMany({
    where: { groupCode: 'REPORT_STATUS' },
    orderBy: { order: 'asc' },
  });

  console.log('📊 생성된 신고 상태 공통코드:');
  createdCodes.forEach((code) => {
    console.log(`   - [${code.code}] ${code.name}: ${code.description}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
