import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 최종적으로 유지할 10개의 메인 카테고리 정의
const MAIN_CATEGORIES = [
  {
    name: '스포츠/운동',
    displayName: '운동',
    slug: 'gathering-sports',
    icon: '⚽',
    color: '#ef4444',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=800&fit=crop',
    description: '축구, 농구, 런닝 등 스포츠 관련 모임',
    order: 1,
  },
  {
    name: '문화/예술',
    displayName: '문화',
    slug: 'gathering-culture',
    icon: '🎨',
    color: '#8b5cf6',
    imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=800&fit=crop',
    description: '전시회, 공연, 미술 등 문화생활 모임',
    order: 2,
  },
  {
    name: '음식/요리',
    displayName: '맛집',
    slug: 'gathering-food',
    icon: '🍽️',
    color: '#f59e0b',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=800&fit=crop',
    description: '맛집 탐방, 요리, 카페 등 음식 관련 모임',
    order: 3,
  },
  {
    name: '여행/아웃도어',
    displayName: '여행',
    slug: 'gathering-travel',
    icon: '✈️',
    color: '#10b981',
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=800&fit=crop',
    description: '여행, 등산, 캠핑 등 아웃도어 활동 모임',
    order: 4,
  },
  {
    name: '스터디/교육',
    displayName: '스터디',
    slug: 'gathering-study',
    icon: '📚',
    color: '#3b82f6',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=800&fit=crop',
    description: '공부, 독서, 스터디 모임',
    order: 5,
  },
  {
    name: '게임/오락',
    displayName: '게임',
    slug: 'gathering-game',
    icon: '🎮',
    color: '#ec4899',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=800&fit=crop',
    description: '보드게임, 비디오게임, e스포츠 모임',
    order: 6,
  },
  {
    name: '음악/공연',
    displayName: '음악',
    slug: 'gathering-music',
    icon: '🎵',
    color: '#06b6d4',
    imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=800&fit=crop',
    description: '음악, 공연, 밴드 등 음악 관련 모임',
    order: 7,
  },
  {
    name: '반려동물',
    displayName: '반려동물',
    slug: 'gathering-pet',
    icon: '🐕',
    color: '#f97316',
    imageUrl: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&h=800&fit=crop',
    description: '반려동물과 함께하는 산책, 모임',
    order: 8,
  },
  {
    name: '사진/영상',
    displayName: '사진',
    slug: 'gathering-photo',
    icon: '📷',
    color: '#84cc16',
    imageUrl: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=800&h=800&fit=crop',
    description: '사진 촬영, 영상 제작 모임',
    order: 9,
  },
  {
    name: '봉사활동',
    displayName: '봉사',
    slug: 'gathering-volunteer',
    icon: '❤️',
    color: '#ef4444',
    imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=800&fit=crop',
    description: '봉사활동, 나눔 모임',
    order: 10,
  },
];

async function cleanupCategories() {
  console.log('🧹 GATHERING 카테고리 정리 시작...\n');

  // 1. 기존 GATHERING 카테고리 모두 삭제 처리
  const existingGathering = await prisma.category.updateMany({
    where: {
      type: {
        has: 'GATHERING',
      },
    },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  console.log(`✓ 기존 GATHERING 카테고리 ${existingGathering.count}개 삭제 처리 완료\n`);

  // 2. 새로운 10개의 메인 카테고리 생성
  console.log('📝 새로운 메인 카테고리 생성 중...\n');

  for (const category of MAIN_CATEGORIES) {
    const created = await prisma.category.create({
      data: {
        ...category,
        depth: 0,
        parentId: null,
        type: ['GATHERING'],
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
      },
    });
    console.log(`  ✓ ${created.name} (${created.displayName}) 생성 완료`);
  }

  // 3. 최종 결과 확인
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
      order: cat.order,
      name: cat.name,
      displayName: cat.displayName,
      imageUrl: cat.imageUrl ? '✓' : '✗',
    }))
  );

  console.log(`\n🎉 정리 완료! 총 ${finalCategories.length}개의 깔끔한 메인 카테고리가 준비되었습니다.\n`);
}

cleanupCategories()
  .catch((error) => {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
