import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Migrating user roles to new system...');

  // Update BUSINESS_ADMIN -> BUSINESS_USER
  const businessAdminCount = await prisma.user.updateMany({
    where: { role: 'BUSINESS_ADMIN' },
    data: { role: 'BUSINESS_USER' },
  });

  console.log(`✅ Updated ${businessAdminCount.count} BUSINESS_ADMIN users to BUSINESS_USER`);

  // Check current role distribution
  const users = await prisma.user.groupBy({
    by: ['role'],
    _count: {
      role: true,
    },
  });

  console.log('\n📊 Current role distribution:');
  users.forEach((item) => {
    console.log(`  ${item.role}: ${item._count.role} users`);
  });

  console.log('\n✨ Role migration completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error migrating roles:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
