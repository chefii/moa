import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding categories (interests)...');

  const categories = [
    {
      name: '운동/스포츠',
      slug: 'sports',
      icon: '⚽',
      color: 'from-blue-400 to-blue-600',
      description: '축구, 농구, 야구, 테니스, 러닝, 요가 등 다양한 스포츠 활동',
      order: 1,
    },
    {
      name: '요리/베이킹',
      slug: 'cooking',
      icon: '🍳',
      color: 'from-orange-400 to-orange-600',
      description: '요리, 베이킹, 카페 투어, 맛집 탐방 등',
      order: 2,
    },
    {
      name: '독서/글쓰기',
      slug: 'reading',
      icon: '📚',
      color: 'from-green-400 to-green-600',
      description: '독서 모임, 글쓰기, 북클럽, 시 낭독 등',
      order: 3,
    },
    {
      name: '여행/탐험',
      slug: 'travel',
      icon: '✈️',
      color: 'from-purple-400 to-purple-600',
      description: '국내외 여행, 등산, 캠핑, 트레킹 등',
      order: 4,
    },
    {
      name: '음악/공연',
      slug: 'music',
      icon: '🎵',
      color: 'from-pink-400 to-pink-600',
      description: '콘서트, 페스티벌, 악기 연주, 노래방 등',
      order: 5,
    },
    {
      name: '영화/드라마',
      slug: 'movie',
      icon: '🎬',
      color: 'from-red-400 to-red-600',
      description: '영화 관람, 드라마 토론, OTT 시청 모임 등',
      order: 6,
    },
    {
      name: '게임/e스포츠',
      slug: 'game',
      icon: '🎮',
      color: 'from-indigo-400 to-indigo-600',
      description: 'PC방, 보드게임, 콘솔게임, e스포츠 관람 등',
      order: 7,
    },
    {
      name: '예술/공예',
      slug: 'art',
      icon: '🎨',
      color: 'from-yellow-400 to-yellow-600',
      description: '그림 그리기, 공예, 전시회 관람, 미술 등',
      order: 8,
    },
    {
      name: '댄스/무용',
      slug: 'dance',
      icon: '💃',
      color: 'from-cyan-400 to-cyan-600',
      description: 'K-pop 댄스, 방송댄스, 발레, 현대무용 등',
      order: 9,
    },
    {
      name: '사진/영상',
      slug: 'photo',
      icon: '📷',
      color: 'from-teal-400 to-teal-600',
      description: '사진 촬영, 영상 편집, 출사, 포토워크 등',
      order: 10,
    },
    {
      name: '자기계발',
      slug: 'self-development',
      icon: '📈',
      color: 'from-violet-400 to-violet-600',
      description: '스터디, 외국어, 자격증, 재테크, 커리어 등',
      order: 11,
    },
    {
      name: '반려동물',
      slug: 'pet',
      icon: '🐶',
      color: 'from-amber-400 to-amber-600',
      description: '강아지 산책, 반려동물 카페, 펫 용품 쇼핑 등',
      order: 12,
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        icon: category.icon,
        color: category.color,
        description: category.description,
        order: category.order,
      },
      create: category,
    });
    console.log(`✅ ${category.name} seeded`);
  }

  console.log('✅ All categories seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
