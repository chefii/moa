import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 신고 상태 컬럼 마이그레이션 시작...\n');

  // 1. 먼저 REPORT_STATUS 공통코드가 있는지 확인
  const reportStatusCodes = await prisma.commonCode.findMany({
    where: { groupCode: 'REPORT_STATUS' },
  });

  if (reportStatusCodes.length === 0) {
    console.log('⚠️  REPORT_STATUS 공통코드가 없습니다. 먼저 seed-report-status를 실행해주세요.');
    console.log('   실행 방법: npm run prisma:seed-report-status\n');
    return;
  }

  console.log(`✅ REPORT_STATUS 공통코드 확인: ${reportStatusCodes.length}개\n`);

  // 2. 기존 reports 테이블의 status 컬럼을 status_code로 변경하는 SQL 실행
  console.log('📝 데이터베이스 마이그레이션 실행...');

  try {
    // Step 1: 새로운 status_code 컬럼 추가 (nullable)
    await prisma.$executeRaw`
      ALTER TABLE reports
      ADD COLUMN IF NOT EXISTS status_code VARCHAR(255);
    `;
    console.log('   ✓ status_code 컬럼 추가');

    // Step 2: 기존 status 값을 status_code로 복사
    await prisma.$executeRaw`
      UPDATE reports
      SET status_code = CAST(status AS TEXT)
      WHERE status_code IS NULL;
    `;
    console.log('   ✓ 기존 status 값을 status_code로 복사');

    // Step 3: status_code에 기본값 설정
    await prisma.$executeRaw`
      ALTER TABLE reports
      ALTER COLUMN status_code SET DEFAULT 'PENDING';
    `;
    console.log('   ✓ status_code 기본값 설정');

    // Step 4: status_code를 NOT NULL로 변경
    await prisma.$executeRaw`
      ALTER TABLE reports
      ALTER COLUMN status_code SET NOT NULL;
    `;
    console.log('   ✓ status_code NOT NULL 제약조건 추가');

    // Step 5: 기존 status 컬럼 삭제
    await prisma.$executeRaw`
      ALTER TABLE reports
      DROP COLUMN IF EXISTS status;
    `;
    console.log('   ✓ 기존 status 컬럼 삭제');

    // Step 6: 외래키 제약조건 추가
    await prisma.$executeRaw`
      ALTER TABLE reports
      ADD CONSTRAINT reports_status_code_fkey
      FOREIGN KEY (status_code)
      REFERENCES common_codes(code)
      ON DELETE RESTRICT
      ON UPDATE CASCADE;
    `;
    console.log('   ✓ status_code 외래키 제약조건 추가');

    console.log('\n✨ 마이그레이션 완료!');

    // 마이그레이션 결과 확인
    const reports = await prisma.report.findMany({
      select: {
        id: true,
        statusCode: true,
      },
      take: 5,
    });

    if (reports.length > 0) {
      console.log('\n📊 마이그레이션 결과 확인:');
      reports.forEach((report) => {
        console.log(`   - Report ${report.id.substring(0, 8)}...: statusCode = ${report.statusCode}`);
      });
    }

  } catch (error: any) {
    if (error.message && error.message.includes('already exists')) {
      console.log('\n⚠️  마이그레이션이 이미 완료되었습니다.');
    } else {
      throw error;
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
