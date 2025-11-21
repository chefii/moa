import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createHierarchy() {
  console.log('🏗️  계층 구조 생성 시작...\n');

  // 1. 메인 카테고리 (부모) 생성
  console.log('📝 메인 카테고리 생성 중...\n');

  const mainCategory = await prisma.category.create({
    data: {
      name: '메인 카테고리',
      displayName: null,
      slug: 'gathering-main',
      icon: null,
      color: null,
      imageUrl: null,
      description: 'GATHERING 타입의 최상위 카테고리',
      depth: 0,
      parentId: null,
      order: 0,
      type: ['GATHERING'],
      isActive: true,
      isDeleted: false,
    },
  });

  console.log(`✅ 메인 카테고리 생성 완료: ${mainCategory.name} (ID: ${mainCategory.id})\n`);

  // 2. 기존 10개 카테고리를 하위 카테고리로 변경
  console.log('🔄 기존 카테고리를 하위 카테고리로 변경 중...\n');

  const existingCategories = await prisma.category.findMany({
    where: {
      type: {
        has: 'GATHERING',
      },
      isDeleted: false,
      depth: 0,
      name: {
        not: '메인 카테고리',
      },
    },
    orderBy: { order: 'asc' },
  });

  console.log(`📋 ${existingCategories.length}개의 카테고리를 변경합니다.\n`);

  for (const category of existingCategories) {
    await prisma.category.update({
      where: { id: category.id },
      data: {
        depth: 1,
        parentId: mainCategory.id,
      },
    });
    console.log(`  ✓ ${category.name} → depth=1 (하위 카테고리)`);
  }

  // 3. 최종 구조 확인
  console.log('\n📊 최종 계층 구조:\n');

  const parent = await prisma.category.findUnique({
    where: { id: mainCategory.id },
    include: {
      children: {
        where: { isDeleted: false },
        orderBy: { order: 'asc' },
      },
    },
  });

  console.log(`🔹 ${parent?.name} (depth=0)`);
  parent?.children.forEach((child, index) => {
    console.log(`  ${index + 1}. ${child.name} (${child.displayName}) - depth=1`);
  });

  console.log(`\n🎉 계층 구조 생성 완료!`);
  console.log(`   - 상위: ${parent?.name}`);
  console.log(`   - 하위: ${parent?.children.length}개 카테고리\n`);
}

createHierarchy()
  .catch((error) => {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
