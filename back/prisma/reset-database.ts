import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  데이터베이스 초기화 중...\n');

  // Delete in order to respect foreign key constraints
  console.log('📌 신고 삭제 중...');
  await prisma.report.deleteMany({});

  console.log('📌 북마크 삭제 중...');
  await prisma.bookmark.deleteMany({});

  console.log('📌 리뷰 삭제 중...');
  await prisma.review.deleteMany({});

  console.log('📌 사용자 배지 삭제 중...');
  await prisma.userBadge.deleteMany({});

  console.log('📌 배지 삭제 중...');
  await prisma.badge.deleteMany({});

  console.log('📌 모임 참가자 삭제 중...');
  await prisma.gatheringParticipant.deleteMany({});

  console.log('📌 모임 삭제 중...');
  await prisma.gathering.deleteMany({});

  console.log('📌 카테고리 삭제 중...');
  await prisma.category.deleteMany({});

  console.log('📌 공지사항 삭제 중...');
  await prisma.notice.deleteMany({});

  console.log('📌 배너 삭제 중...');
  await prisma.banner.deleteMany({});

  console.log('📌 팝업 삭제 중...');
  await prisma.popup.deleteMany({});

  console.log('📌 사용자 역할 삭제 중...');
  await prisma.userRole.deleteMany({});

  console.log('📌 사용자 삭제 중...');
  const userResult = await prisma.user.deleteMany({});

  console.log(`\n✅ 데이터베이스 초기화 완료! (${userResult.count}명의 사용자 삭제)`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
