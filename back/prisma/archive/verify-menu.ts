import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying menu role codes...\n');

  const categories = await prisma.menuCategory.findMany({
    take: 3,
    orderBy: { order: 'asc' },
    select: {
      name: true,
      requiredRoles: true,
    },
  });

  console.log('📋 Menu Categories (first 3):');
  categories.forEach(cat => {
    console.log(`   ${cat.name}: ${JSON.stringify(cat.requiredRoles)}`);
  });

  const items = await prisma.menuItem.findMany({
    take: 3,
    orderBy: { order: 'asc' },
    select: {
      name: true,
      requiredRoles: true,
    },
  });

  console.log('\n📋 Menu Items (first 3):');
  items.forEach(item => {
    console.log(`   ${item.name}: ${JSON.stringify(item.requiredRoles)}`);
  });

  console.log('\n✅ Verification complete!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
