import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding board categories...');

  // First, update existing categories to have type array
  const existingCategories = await prisma.category.findMany({
    where: { parentId: null },
  });

  for (const cat of existingCategories) {
    await prisma.category.update({
      where: { id: cat.id },
      data: { type: ['GATHERING', 'INTEREST'] },
    });
  }
  console.log('✅ Updated existing categories with types');

  const boardCategories = [
    {
      name: '자유게시판',
      displayName: '자유',
      slug: 'free-board',
      icon: 'MessageCircle',
      color: 'from-blue-400 to-blue-600',
      description: '자유로운 주제로 이야기를 나눠보세요',
      order: 1,
      type: ['BOARD'],
    },
    {
      name: '익명게시판',
      displayName: '익명',
      slug: 'anonymous-board',
      icon: 'UserX',
      color: 'from-gray-400 to-gray-600',
      description: '익명으로 편하게 이야기해요',
      order: 2,
      type: ['BOARD'],
    },
    {
      name: '맛집추천',
      displayName: '맛집',
      slug: 'restaurant-board',
      icon: 'Utensils',
      color: 'from-orange-400 to-orange-600',
      description: '맛집 정보를 공유해주세요',
      order: 3,
      type: ['BOARD'],
    },
    {
      name: '모임후기',
      displayName: '후기',
      slug: 'review-board',
      icon: 'Star',
      color: 'from-yellow-400 to-yellow-600',
      description: '참여했던 모임 후기를 남겨주세요',
      order: 4,
      type: ['BOARD'],
    },
    {
      name: '질문/답변',
      displayName: 'Q&A',
      slug: 'qna-board',
      icon: 'HelpCircle',
      color: 'from-green-400 to-green-600',
      description: '궁금한 것을 물어보세요',
      order: 5,
      type: ['BOARD'],
    },
    {
      name: '공지사항',
      displayName: '공지',
      slug: 'notice-board',
      icon: 'Bell',
      color: 'from-red-400 to-red-600',
      description: 'MOA 운영진의 공지사항',
      order: 6,
      type: ['BOARD'],
    },
  ];

  for (const category of boardCategories) {
    // Find existing category by slug
    const existing = await prisma.category.findFirst({
      where: {
        slug: category.slug,
        parentId: null,
      },
    });

    if (existing) {
      // Update existing category
      await prisma.category.update({
        where: { id: existing.id },
        data: {
          name: category.name,
          displayName: category.displayName,
          icon: category.icon,
          color: category.color,
          description: category.description,
          order: category.order,
          type: category.type,
        },
      });
      console.log(`✅ Updated ${category.name}`);
    } else {
      // Create new category
      await prisma.category.create({
        data: category,
      });
      console.log(`✅ Created ${category.name}`);
    }
  }

  console.log('✅ All board categories seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding board categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
