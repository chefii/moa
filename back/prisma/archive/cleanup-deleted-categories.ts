import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDeletedCategories() {
  console.log('🗑️  삭제된 카테고리 정리 시작...\n');

  // 1. 삭제된 카테고리 확인
  const deletedCategories = await prisma.category.findMany({
    where: {
      isDeleted: true,
    },
    orderBy: { deletedAt: 'desc' },
  });

  console.log(`📋 삭제된 카테고리: ${deletedCategories.length}개\n`);

  if (deletedCategories.length === 0) {
    console.log('✅ 삭제할 카테고리가 없습니다.\n');
    return;
  }

  console.table(
    deletedCategories.map((cat) => ({
      name: cat.name,
      depth: cat.depth,
      type: cat.type.join(','),
      deletedAt: cat.deletedAt?.toLocaleDateString('ko-KR'),
    }))
  );

  // 2. 영구 삭제 실행
  console.log('\n🔥 영구 삭제 중...\n');

  const result = await prisma.category.deleteMany({
    where: {
      isDeleted: true,
    },
  });

  console.log(`✅ ${result.count}개 카테고리 영구 삭제 완료\n`);

  // 3. 최종 카테고리 확인
  console.log('📊 남은 카테고리 현황:\n');

  const remainingCategories = await prisma.category.findMany({
    where: {
      isDeleted: false,
    },
    orderBy: [{ depth: 'asc' }, { order: 'asc' }],
  });

  const depth0Count = remainingCategories.filter((c) => c.depth === 0).length;
  const depth1Count = remainingCategories.filter((c) => c.depth === 1).length;

  console.log(`   - 1뎁스 (부모): ${depth0Count}개`);
  console.log(`   - 2뎁스 (하위): ${depth1Count}개`);
  console.log(`   - 총: ${remainingCategories.length}개\n`);

  console.log('🎉 정리 완료!\n');
}

cleanupDeletedCategories()
  .catch((error) => {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
