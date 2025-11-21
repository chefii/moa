import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 이전 카테고리 -> 새 카테고리 매핑
const CATEGORY_MAPPING: Record<string, string> = {
  '운동/스포츠': '스포츠/운동',
  '음식/요리': '음식/요리', // 같은 이름
  '문화/예술': '문화/예술', // 같은 이름
  '여행/탐험': '여행/아웃도어',
  스터디: '스터디/교육',
  '취미/게임': '게임/오락',
  봉사활동: '봉사활동', // 같은 이름
  '공연/전시': '음악/공연',
};

async function migrateGatheringCategories() {
  console.log('🔄 모임 카테고리 마이그레이션 시작...\n');

  // 1. 삭제되었지만 참조되는 카테고리 찾기
  const oldCategories = await prisma.category.findMany({
    where: {
      isDeleted: true,
      name: {
        in: Object.keys(CATEGORY_MAPPING),
      },
    },
    include: {
      gatherings: true,
    },
  });

  console.log(`📋 마이그레이션 대상 카테고리: ${oldCategories.length}개\n`);

  // 2. 각 카테고리별로 모임 이동
  let totalMigrated = 0;

  for (const oldCat of oldCategories) {
    const targetName = CATEGORY_MAPPING[oldCat.name];

    // 새 카테고리 찾기
    const newCat = await prisma.category.findFirst({
      where: {
        name: targetName,
        isDeleted: false,
        depth: 1,
        parent: {
          type: {
            has: 'GATHERING',
          },
        },
      },
    });

    if (!newCat) {
      console.log(`❌ "${oldCat.name}" → "${targetName}" 새 카테고리를 찾을 수 없습니다.`);
      continue;
    }

    // 모임 데이터 이동
    const result = await prisma.gathering.updateMany({
      where: {
        categoryId: oldCat.id,
      },
      data: {
        categoryId: newCat.id,
      },
    });

    console.log(
      `✅ "${oldCat.name}" (${oldCat.gatherings.length}개) → "${targetName}" 마이그레이션 완료`
    );
    totalMigrated += result.count;
  }

  console.log(`\n📊 총 ${totalMigrated}개 모임 마이그레이션 완료\n`);

  // 3. 이제 참조 없는 카테고리 삭제
  console.log('🗑️  참조 없는 카테고리 삭제 중...\n');

  const nowSafeToDelete = await prisma.category.findMany({
    where: {
      isDeleted: true,
    },
    include: {
      _count: {
        select: {
          gatherings: true,
        },
      },
    },
  });

  const deleteIds: string[] = [];

  for (const cat of nowSafeToDelete) {
    if (cat._count.gatherings === 0) {
      deleteIds.push(cat.id);
    }
  }

  if (deleteIds.length > 0) {
    const deleteResult = await prisma.category.deleteMany({
      where: {
        id: {
          in: deleteIds,
        },
      },
    });

    console.log(`✅ ${deleteResult.count}개 카테고리 영구 삭제 완료\n`);
  } else {
    console.log('✅ 삭제할 카테고리가 없습니다.\n');
  }

  // 4. 최종 확인
  console.log('📊 최종 카테고리 현황:\n');

  const allParents = await prisma.category.findMany({
    where: {
      depth: 0,
      isDeleted: false,
    },
    include: {
      children: {
        where: { isDeleted: false },
        orderBy: { order: 'asc' },
        include: {
          _count: {
            select: {
              gatherings: true,
            },
          },
        },
      },
    },
    orderBy: { order: 'asc' },
  });

  for (const parent of allParents) {
    console.log(`\n🔹 ${parent.name} (depth=0, type=${parent.type.join(',')})`);
    parent.children.forEach((child, index) => {
      const featured = child.isFeatured ? ' ⭐' : '';
      console.log(
        `  ${index + 1}. ${child.name} (${child.displayName}) - ${child._count.gatherings}개 모임${featured}`
      );
    });
    console.log(`   → 총 ${parent.children.length}개 하위 카테고리`);
  }

  console.log('\n🎉 마이그레이션 완료!\n');
}

migrateGatheringCategories()
  .catch((error) => {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
