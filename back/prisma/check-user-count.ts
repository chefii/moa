import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking user counts...\n');

  const totalUsers = await prisma.user.count();
  console.log(`📊 Total Users: ${totalUsers}`);

  const userRoles = await prisma.userRole.groupBy({
    by: ['roleCode'],
    _count: true,
  });

  console.log('\n👥 Users by Role:');
  userRoles.forEach(role => {
    console.log(`   - ${role.roleCode}: ${role._count} users`);
  });

  console.log('\n✅ Check complete!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
