import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function safeCleanupCategories() {
  console.log('🗑️  안전하게 카테고리 정리 시작...\n');

  // 1. 삭제된 카테고리 확인
  const deletedCategories = await prisma.category.findMany({
    where: {
      isDeleted: true,
    },
    include: {
      _count: {
        select: {
          gatherings: true,
          interests: true,
          interestForest: true,
          boardPosts: true,
        },
      },
    },
    orderBy: { deletedAt: 'desc' },
  });

  console.log(`📋 삭제된 카테고리: ${deletedCategories.length}개\n`);

  if (deletedCategories.length === 0) {
    console.log('✅ 삭제할 카테고리가 없습니다.\n');
    return;
  }

  // 2. 참조되지 않는 카테고리와 참조되는 카테고리 분리
  const safeToDelete: string[] = [];
  const cannotDelete: string[] = [];

  for (const cat of deletedCategories) {
    const totalRefs =
      cat._count.gatherings +
      cat._count.interests +
      cat._count.interestForest +
      cat._count.boardPosts;

    if (totalRefs === 0) {
      safeToDelete.push(cat.id);
    } else {
      cannotDelete.push(cat.id);
      console.log(
        `⚠️  "${cat.name}" - 참조 있음 (모임:${cat._count.gatherings}, 관심사:${cat._count.interests}, 게시글:${cat._count.boardPosts}) - 건너뜀`
      );
    }
  }

  console.log(`\n✅ 안전하게 삭제 가능: ${safeToDelete.length}개`);
  console.log(`⚠️  참조되어 삭제 불가: ${cannotDelete.length}개\n`);

  if (safeToDelete.length === 0) {
    console.log('🎉 삭제할 카테고리가 없습니다.\n');
    return;
  }

  // 3. 안전한 카테고리만 영구 삭제
  console.log('🔥 영구 삭제 중...\n');

  const result = await prisma.category.deleteMany({
    where: {
      id: {
        in: safeToDelete,
      },
    },
  });

  console.log(`✅ ${result.count}개 카테고리 영구 삭제 완료\n`);

  // 4. 참조되는 카테고리 처리 안내
  if (cannotDelete.length > 0) {
    console.log('⚠️  다음 카테고리는 데이터가 참조되어 삭제되지 않았습니다:');
    console.log('   이 카테고리들을 삭제하려면 먼저 참조하는 데이터를 정리해야 합니다.\n');

    const stillDeleted = await prisma.category.findMany({
      where: {
        id: { in: cannotDelete },
      },
      include: {
        _count: {
          select: {
            gatherings: true,
            interests: true,
            boardPosts: true,
          },
        },
      },
    });

    console.table(
      stillDeleted.map((cat) => ({
        name: cat.name,
        gatherings: cat._count.gatherings,
        interests: cat._count.interests,
        boardPosts: cat._count.boardPosts,
      }))
    );
  }

  // 5. 최종 카테고리 확인
  console.log('\n📊 남은 카테고리 현황:\n');

  const remainingCategories = await prisma.category.findMany({
    where: {
      isDeleted: false,
    },
  });

  const depth0Count = remainingCategories.filter((c) => c.depth === 0).length;
  const depth1Count = remainingCategories.filter((c) => c.depth === 1).length;

  console.log(`   - 1뎁스 (부모): ${depth0Count}개`);
  console.log(`   - 2뎁스 (하위): ${depth1Count}개`);
  console.log(`   - 총: ${remainingCategories.length}개\n`);

  console.log('🎉 정리 완료!\n');
}

safeCleanupCategories()
  .catch((error) => {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
