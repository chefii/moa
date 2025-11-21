import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Unsplash에서 제공하는 무료 고퀄리티 이미지 URL
const categoryImages = {
  // GATHERING 카테고리 (실제 DB 이름에 맞춤)
  '스포츠/운동': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=800&fit=crop',
  '문화/예술': 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=800&fit=crop',
  '음식/요리': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=800&fit=crop',
  '여행/아웃도어': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=800&fit=crop',
  '스터디/교육': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=800&fit=crop',
  '게임/오락': 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=800&fit=crop',
  '음악/공연': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=800&fit=crop',
  '반려동물': 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&h=800&fit=crop',
  '사진/영상': 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=800&h=800&fit=crop',
  '봉사활동': 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=800&fit=crop',
  '자기계발': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=800&fit=crop',
  '창작활동': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=800&fit=crop',

  // BOARD 카테고리
  '자유게시판': 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=800&fit=crop',
  '익명게시판': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop',
  '모임후기': 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=800&fit=crop',
  '질문/답변': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=800&fit=crop',
  '공지사항': 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=800&fit=crop',
};

async function updateCategoryImages() {
  console.log('🎨 카테고리 이미지 URL 업데이트 시작...\n');

  const categories = await prisma.category.findMany({
    where: {
      depth: 1, // 하위 카테고리 (실제로 표시되는 카테고리)
      isDeleted: false,
    },
    orderBy: { order: 'asc' },
  });

  console.log(`📋 총 ${categories.length}개의 카테고리를 찾았습니다.\n`);

  for (const category of categories) {
    const imageUrl = categoryImages[category.name as keyof typeof categoryImages];

    if (imageUrl) {
      await prisma.category.update({
        where: { id: category.id },
        data: { imageUrl },
      });
      console.log(`✅ ${category.name}: 이미지 URL 업데이트 완료`);
    } else {
      console.log(`⚠️  ${category.name}: 이미지 URL 매핑 없음 (기본 이미지 사용)`);
    }
  }

  console.log('\n🎉 카테고리 이미지 URL 업데이트 완료!\n');

  // 결과 확인
  const updatedCategories = await prisma.category.findMany({
    where: {
      depth: 0,
      isDeleted: false,
    },
    select: {
      name: true,
      imageUrl: true,
    },
    orderBy: { order: 'asc' },
  });

  console.log('📸 업데이트된 카테고리 목록:');
  console.table(updatedCategories);
}

updateCategoryImages()
  .catch((error) => {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
