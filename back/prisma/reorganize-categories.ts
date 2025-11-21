import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reorganizeCategories() {
  console.log('📊 현재 카테고리 구조 확인...\n');

  // 1. 현재 GATHERING 카테고리 확인
  const gatheringCategories = await prisma.category.findMany({
    where: {
      type: {
        has: 'GATHERING',
      },
      isDeleted: false,
    },
    orderBy: { order: 'asc' },
  });

  console.log('=== GATHERING 카테고리 현황 ===');
  console.table(
    gatheringCategories.map((cat) => ({
      name: cat.name,
      depth: cat.depth,
      parentId: cat.parentId ? 'O' : 'X',
      hasImage: cat.imageUrl ? 'O' : 'X',
      order: cat.order,
    }))
  );

  // 2. 변경 작업 시작
  console.log('\n🔄 카테고리 재구성 시작...\n');

  // depth=1인 GATHERING 카테고리를 depth=0으로 변경
  const childGatheringCategories = gatheringCategories.filter(
    (cat) => cat.depth === 1 && cat.imageUrl
  );

  console.log(`✅ ${childGatheringCategories.length}개의 카테고리를 메인 카테고리로 변경합니다.\n`);

  for (const category of childGatheringCategories) {
    await prisma.category.update({
      where: { id: category.id },
      data: {
        depth: 0,
        parentId: null,
      },
    });
    console.log(`  ✓ ${category.name} → depth=0 (메인 카테고리)`);
  }

  // 3. 불필요한 부모 카테고리 삭제
  console.log('\n🗑️  불필요한 부모 카테고리 삭제...\n');

  const unnecessaryParents = await prisma.category.findMany({
    where: {
      depth: 0,
      OR: [
        { name: '메인카테고리' },
        { name: '메인 카테고리' },
        { name: '게시판 카테고리' },
      ],
    },
  });

  for (const parent of unnecessaryParents) {
    await prisma.category.update({
      where: { id: parent.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
    console.log(`  ✓ "${parent.name}" 삭제 완료`);
  }

  // 4. 최종 결과 확인
  console.log('\n📋 최종 GATHERING 카테고리 목록:\n');

  const finalCategories = await prisma.category.findMany({
    where: {
      type: {
        has: 'GATHERING',
      },
      isDeleted: false,
    },
    orderBy: { order: 'asc' },
  });

  console.table(
    finalCategories.map((cat) => ({
      name: cat.name,
      displayName: cat.displayName,
      depth: cat.depth,
      imageUrl: cat.imageUrl ? '✓' : '✗',
      order: cat.order,
    }))
  );

  console.log(`\n🎉 재구성 완료! 총 ${finalCategories.length}개의 메인 카테고리가 있습니다.\n`);
}

reorganizeCategories()
  .catch((error) => {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
