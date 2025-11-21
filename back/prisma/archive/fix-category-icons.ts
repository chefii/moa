import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing category icons...');

  // 이모지를 Lucide 아이콘으로 매핑
  const iconMapping: Record<string, string> = {
    '🎨': 'Palette',
    '🍳': 'Utensils',
    '📚': 'Book',
    '🎮': 'Users',
    '🎭': 'Users',
    '🤝': 'Heart',
  };

  // Get all categories
  const categories = await prisma.category.findMany();

  for (const category of categories) {
    // 이모지 아이콘을 Lucide 아이콘으로 변환
    if (category.icon && iconMapping[category.icon]) {
      await prisma.category.update({
        where: { id: category.id },
        data: { icon: iconMapping[category.icon] },
      });
      console.log(`✅ Updated ${category.name}: ${category.icon} → ${iconMapping[category.icon]}`);
    }
  }

  console.log('✅ All category icons fixed!');
}

main()
  .catch((e) => {
    console.error('Error fixing category icons:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
