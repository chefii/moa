import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupOldBoards() {
  console.log('🧹 이전 게시판 카테고리 정리 시작...\n');

  // 잘못 생성된 depth=0 게시판 카테고리들 찾기 (부모가 아닌 것들)
  const oldBoardCategories = await prisma.category.findMany({
    where: {
      type: { has: 'BOARD' },
      depth: 0,
      isDeleted: false,
      name: {
        in: ['자유게시판', '익명게시판', '맛집추천', '모임후기', '질문/답변', '공지사항'],
      },
    },
  });

  console.log(`📋 삭제할 이전 게시판 카테고리: ${oldBoardCategories.length}개\n`);

  for (const category of oldBoardCategories) {
    // "게시판" 부모 카테고리인지 확인 (이건 유지)
    const hasChildren = await prisma.category.count({
      where: { parentId: category.id, isDeleted: false },
    });

    if (hasChildren > 0 && category.name === '게시판') {
      console.log(`  ⚠️  "${category.name}" - 부모 카테고리이므로 유지`);
      continue;
    }

    // 이전 잘못된 카테고리 삭제
    await prisma.category.update({
      where: { id: category.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
    console.log(`  ✓ "${category.name}" 삭제 완료`);
  }

  // 최종 결과 확인
  console.log('\n📊 최종 카테고리 계층 구조:\n');

  const allParents = await prisma.category.findMany({
    where: {
      depth: 0,
      isDeleted: false,
    },
    include: {
      children: {
        where: { isDeleted: false },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  });

  for (const parent of allParents) {
    console.log(`\n🔹 ${parent.name} (depth=0, type=${parent.type.join(',')})`);

    if (parent.children.length > 0) {
      parent.children.forEach((child, index) => {
        const featured = child.isFeatured ? ' ⭐' : '';
        console.log(`  ${index + 1}. ${child.name} (${child.displayName || '-'}) - depth=1${featured}`);
      });
      console.log(`   → 총 ${parent.children.length}개 하위 카테고리`);
    } else {
      console.log(`   → 하위 카테고리 없음`);
    }
  }

  const totalChildren = allParents.reduce((sum, p) => sum + p.children.length, 0);

  console.log('\n🎉 정리 완료!');
  console.log(`   - 1뎁스 부모: ${allParents.length}개`);
  console.log(`   - 2뎁스 하위: ${totalChildren}개\n`);
}

cleanupOldBoards()
  .catch((error) => {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
