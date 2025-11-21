import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 게시판 카테고리 정의
const BOARD_CATEGORIES = [
  {
    name: '자유게시판',
    displayName: '자유',
    slug: 'board-free',
    icon: '💬',
    color: '#6366f1',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=800&fit=crop',
    description: '자유롭게 이야기를 나누는 공간',
    order: 1,
    isFeatured: true,
  },
  {
    name: '질문/답변',
    displayName: '질문',
    slug: 'board-qna',
    icon: '❓',
    color: '#10b981',
    imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&h=800&fit=crop',
    description: '궁금한 것을 물어보세요',
    order: 2,
    isFeatured: true,
  },
  {
    name: '정보공유',
    displayName: '정보',
    slug: 'board-info',
    icon: '💡',
    color: '#f59e0b',
    imageUrl: 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?w=800&h=800&fit=crop',
    description: '유익한 정보를 공유하세요',
    order: 3,
    isFeatured: true,
  },
  {
    name: '후기/리뷰',
    displayName: '후기',
    slug: 'board-review',
    icon: '⭐',
    color: '#ec4899',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&h=800&fit=crop',
    description: '모임 후기를 나눠보세요',
    order: 4,
    isFeatured: true,
  },
  {
    name: '구인구직',
    displayName: '구인',
    slug: 'board-job',
    icon: '💼',
    color: '#8b5cf6',
    imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=800&fit=crop',
    description: '구인/구직 정보',
    order: 5,
    isFeatured: false,
  },
  {
    name: '장터',
    displayName: '장터',
    slug: 'board-market',
    icon: '🛒',
    color: '#06b6d4',
    imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=800&fit=crop',
    description: '중고 거래 및 장터',
    order: 6,
    isFeatured: false,
  },
];

async function restoreHierarchy() {
  console.log('🔄 카테고리 계층 구조 복구 시작...\n');

  // 1. 기존 모임 카테고리들 확인 (현재 depth=0, parentId=null)
  const existingGatheringCategories = await prisma.category.findMany({
    where: {
      type: { has: 'GATHERING' },
      isDeleted: false,
      depth: 0,
      imageUrl: { not: null },
    },
    orderBy: { order: 'asc' },
  });

  console.log(`📋 기존 모임 카테고리 ${existingGatheringCategories.length}개 발견\n`);

  // 2. "모임" 부모 카테고리 생성 (1뎁스)
  console.log('📝 1뎁스: "모임" 부모 카테고리 생성 중...\n');

  const gatheringParent = await prisma.category.create({
    data: {
      name: '모임',
      displayName: null,
      slug: 'gathering',
      icon: null,
      color: null,
      imageUrl: null,
      description: 'GATHERING 타입의 최상위 카테고리',
      depth: 0,
      parentId: null,
      order: 1,
      type: ['GATHERING'],
      isFeatured: false,
      isActive: true,
      isDeleted: false,
    },
  });

  console.log(`✅ "모임" 부모 카테고리 생성 완료 (ID: ${gatheringParent.id})\n`);

  // 3. 기존 10개 모임 카테고리를 2뎁스로 변경 (depth=1, parentId 연결)
  console.log('🔗 기존 모임 카테고리들을 2뎁스로 변경 중...\n');

  for (const category of existingGatheringCategories) {
    await prisma.category.update({
      where: { id: category.id },
      data: {
        depth: 1,
        parentId: gatheringParent.id,
      },
    });
    console.log(`  ✓ ${category.name} → depth=1, parent="모임"`);
  }

  // 4. "게시판" 부모 카테고리 생성 (1뎁스)
  console.log('\n📝 1뎁스: "게시판" 부모 카테고리 생성 중...\n');

  const boardParent = await prisma.category.create({
    data: {
      name: '게시판',
      displayName: null,
      slug: 'board',
      icon: null,
      color: null,
      imageUrl: null,
      description: 'BOARD 타입의 최상위 카테고리',
      depth: 0,
      parentId: null,
      order: 2,
      type: ['BOARD'],
      isFeatured: false,
      isActive: true,
      isDeleted: false,
    },
  });

  console.log(`✅ "게시판" 부모 카테고리 생성 완료 (ID: ${boardParent.id})\n`);

  // 5. 게시판 하위 카테고리 생성 (2뎁스)
  console.log('📝 2뎁스: 게시판 하위 카테고리 생성 중...\n');

  for (const boardCategory of BOARD_CATEGORIES) {
    const created = await prisma.category.create({
      data: {
        ...boardCategory,
        depth: 1,
        parentId: boardParent.id,
        type: ['BOARD'],
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
      },
    });
    console.log(`  ✓ ${created.name} (${created.displayName}) - Featured: ${created.isFeatured ? '⭐' : '-'}`);
  }

  // 6. 최종 구조 확인
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
    parent.children.forEach((child, index) => {
      const featured = child.isFeatured ? ' ⭐' : '';
      console.log(`  ${index + 1}. ${child.name} (${child.displayName}) - depth=1${featured}`);
    });
    console.log(`   총 ${parent.children.length}개 하위 카테고리`);
  }

  console.log('\n🎉 계층 구조 복구 완료!');
  console.log(`   - 1뎁스 부모: ${allParents.length}개`);
  console.log(`   - 2뎁스 하위: ${allParents.reduce((sum, p) => sum + p.children.length, 0)}개\n`);
}

restoreHierarchy()
  .catch((error) => {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
