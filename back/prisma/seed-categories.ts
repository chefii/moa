import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('카테고리 데이터 추가 시작...');

  // 1. 상위 카테고리: 메인 카테고리 (모임용)
  let gatheringCategory = await prisma.category.findFirst({
    where: {
      slug: 'gathering-main',
      parentId: null,
    },
  });

  if (!gatheringCategory) {
    gatheringCategory = await prisma.category.create({
      data: {
        name: '메인 카테고리',
        displayName: '모임',
        slug: 'gathering-main',
        description: '다양한 모임을 위한 메인 카테고리입니다',
        type: ['GATHERING'],
        order: 1,
        isActive: true,
        depth: 0,
      },
    });
  }
  console.log('✓ 메인 카테고리 생성 완료');

  // 메인 카테고리의 하위 카테고리들
  const gatheringSubCategories = [
    {
      name: '스포츠/운동',
      displayName: '운동',
      slug: 'gathering-sports',
      description: '축구, 농구, 런닝 등 스포츠 관련 모임',
      icon: '⚽',
      color: '#ef4444',
      order: 1,
    },
    {
      name: '문화/예술',
      displayName: '문화',
      slug: 'gathering-culture',
      description: '전시회, 공연, 미술 등 문화생활 모임',
      icon: '🎨',
      color: '#8b5cf6',
      order: 2,
    },
    {
      name: '음식/요리',
      displayName: '맛집',
      slug: 'gathering-food',
      description: '맛집 탐방, 요리, 카페 등 음식 관련 모임',
      icon: '🍽️',
      color: '#f59e0b',
      order: 3,
    },
    {
      name: '여행/아웃도어',
      displayName: '여행',
      slug: 'gathering-travel',
      description: '국내외 여행, 등산, 캠핑 등',
      icon: '✈️',
      color: '#06b6d4',
      order: 4,
    },
    {
      name: '스터디/교육',
      displayName: '스터디',
      slug: 'gathering-study',
      description: '외국어, 자격증, 독서 등 학습 모임',
      icon: '📚',
      color: '#3b82f6',
      order: 5,
    },
    {
      name: '게임/오락',
      displayName: '게임',
      slug: 'gathering-game',
      description: '보드게임, 온라인게임, e-스포츠 등',
      icon: '🎮',
      color: '#ec4899',
      order: 6,
    },
    {
      name: '음악/공연',
      displayName: '음악',
      slug: 'gathering-music',
      description: '악기 연주, 노래, 공연 관람 등',
      icon: '🎵',
      color: '#a855f7',
      order: 7,
    },
    {
      name: '반려동물',
      displayName: '반려동물',
      slug: 'gathering-pet',
      description: '반려동물 산책, 정보 공유 등',
      icon: '🐕',
      color: '#84cc16',
      order: 8,
    },
    {
      name: '사진/영상',
      displayName: '사진',
      slug: 'gathering-photo',
      description: '사진 촬영, 영상 제작 등',
      icon: '📷',
      color: '#6366f1',
      order: 9,
    },
    {
      name: '봉사활동',
      displayName: '봉사',
      slug: 'gathering-volunteer',
      description: '자원봉사, 나눔 활동 등',
      icon: '❤️',
      color: '#f43f5e',
      order: 10,
    },
  ];

  for (const subCat of gatheringSubCategories) {
    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          {
            slug: subCat.slug,
            parentId: gatheringCategory.id,
          },
          {
            name: subCat.name,
            parentId: gatheringCategory.id,
          },
        ],
      },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          ...subCat,
          type: ['GATHERING'],
          parentId: gatheringCategory.id,
          depth: 1,
          isActive: true,
        },
      });
      console.log(`  ✓ ${subCat.name} 생성 완료`);
    } else {
      console.log(`  - ${subCat.name} 이미 존재함`);
    }
  }

  // 2. 상위 카테고리: 게시판 카테고리
  let boardCategory = await prisma.category.findFirst({
    where: {
      slug: 'board-main',
      parentId: null,
    },
  });

  if (!boardCategory) {
    boardCategory = await prisma.category.create({
      data: {
        name: '게시판 카테고리',
        displayName: '게시판',
        slug: 'board-main',
        description: '다양한 주제의 게시판 카테고리입니다',
        type: ['BOARD'],
        order: 2,
        isActive: true,
        depth: 0,
      },
    });
  }
  console.log('✓ 게시판 카테고리 생성 완료');

  // 게시판 카테고리의 하위 카테고리들
  const boardSubCategories = [
    {
      name: '자유게시판',
      displayName: '자유',
      slug: 'board-free',
      description: '자유로운 주제로 이야기를 나눠요',
      icon: '💬',
      color: '#6366f1',
      order: 1,
    },
    {
      name: '질문/답변',
      displayName: 'Q&A',
      slug: 'board-qna',
      description: '궁금한 점을 물어보고 답변해요',
      icon: '❓',
      color: '#3b82f6',
      order: 2,
    },
    {
      name: '후기',
      displayName: '후기',
      slug: 'board-review',
      description: '모임 참여 후기를 공유해요',
      icon: '⭐',
      color: '#f59e0b',
      order: 3,
    },
    {
      name: '홍보',
      displayName: '홍보',
      slug: 'board-promotion',
      description: '모임이나 행사를 홍보해요',
      icon: '📢',
      color: '#ec4899',
      order: 4,
    },
    {
      name: '공지사항',
      displayName: '공지',
      slug: 'board-notice',
      description: '중요한 공지사항을 확인해요',
      icon: '📌',
      color: '#ef4444',
      order: 5,
    },
    {
      name: '정보공유',
      displayName: '정보',
      slug: 'board-info',
      description: '유용한 정보를 공유해요',
      icon: '💡',
      color: '#84cc16',
      order: 6,
    },
  ];

  for (const subCat of boardSubCategories) {
    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          {
            slug: subCat.slug,
            parentId: boardCategory.id,
          },
          {
            name: subCat.name,
            parentId: boardCategory.id,
          },
        ],
      },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          ...subCat,
          type: ['BOARD'],
          parentId: boardCategory.id,
          depth: 1,
          isActive: true,
        },
      });
      console.log(`  ✓ ${subCat.name} 생성 완료`);
    } else {
      console.log(`  - ${subCat.name} 이미 존재함`);
    }
  }

  console.log('\n카테고리 데이터 추가 완료!');
  console.log(`총 ${gatheringSubCategories.length + boardSubCategories.length + 2}개 카테고리 생성됨`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
