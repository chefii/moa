import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function flattenCategories() {
  console.log('🔧 카테고리 구조 단순화 시작...\n');

  // 1. 현재 구조 확인
  const allCategories = await prisma.category.findMany({
    where: {
      type: { has: 'GATHERING' },
      isDeleted: false,
    },
    orderBy: { order: 'asc' },
  });

  console.log('📊 현재 카테고리 현황:');
  console.table(
    allCategories.map((cat) => ({
      name: cat.name,
      depth: cat.depth,
      parentId: cat.parentId ? 'O' : 'X',
      imageUrl: cat.imageUrl ? 'O' : 'X',
      order: cat.order,
    }))
  );

  // 2. depth=1 카테고리들을 depth=0으로 변경 (이미지 있는 실제 카테고리들)
  const childCategories = allCategories.filter((cat) => cat.depth === 1 && cat.imageUrl);

  console.log(`\n✅ ${childCategories.length}개의 하위 카테고리를 최상위로 변경합니다...\n`);

  for (const category of childCategories) {
    await prisma.category.update({
      where: { id: category.id },
      data: {
        depth: 0,
        parentId: null,
      },
    });
    console.log(`  ✓ ${category.name} → depth=0, parentId=null`);
  }

  // 3. 부모 카테고리 (메인 카테고리 등) 삭제
  const parentCategories = allCategories.filter((cat) => cat.depth === 0 && !cat.imageUrl);

  if (parentCategories.length > 0) {
    console.log(`\n🗑️  ${parentCategories.length}개의 부모 카테고리를 삭제합니다...\n`);

    for (const parent of parentCategories) {
      await prisma.category.update({
        where: { id: parent.id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
      console.log(`  ✓ "${parent.name}" 삭제 완료`);
    }
  }

  // 4. 10개 카테고리를 isFeatured=true로 설정
  console.log(`\n⭐ ${childCategories.length}개 카테고리를 Featured로 설정합니다...\n`);

  for (const category of childCategories) {
    await prisma.category.update({
      where: { id: category.id },
      data: {
        isFeatured: true,
      },
    });
    console.log(`  ✓ ${category.name} → isFeatured=true`);
  }

  // 5. 최종 결과 확인
  console.log('\n📋 최종 카테고리 구조:\n');

  const finalCategories = await prisma.category.findMany({
    where: {
      type: { has: 'GATHERING' },
      isDeleted: false,
    },
    orderBy: { order: 'asc' },
  });

  console.table(
    finalCategories.map((cat) => ({
      name: cat.name,
      displayName: cat.displayName,
      depth: cat.depth,
      parentId: cat.parentId ? 'O' : 'X',
      imageUrl: cat.imageUrl ? 'O' : 'X',
      isFeatured: cat.isFeatured ? '⭐' : '-',
      order: cat.order,
    }))
  );

  console.log(`\n🎉 완료! 총 ${finalCategories.length}개의 최상위 카테고리가 준비되었습니다.`);
  console.log(`   - Featured: ${finalCategories.filter((c) => c.isFeatured).length}개`);
  console.log(`   - 일반: ${finalCategories.filter((c) => !c.isFeatured).length}개\n`);
}

flattenCategories()
  .catch((error) => {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
