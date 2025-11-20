import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating role codes to include ROLE_ prefix...\n');

  const roleCodes = [
    'USER',
    'VERIFIED_USER',
    'HOST',
    'PREMIUM_USER',
    'BUSINESS_PENDING',
    'BUSINESS_USER',
    'BUSINESS_MANAGER',
    'MODERATOR',
    'CONTENT_MANAGER',
    'SUPPORT_MANAGER',
    'SETTLEMENT_MANAGER',
    'ADMIN',
    'SUPER_ADMIN',
  ];

  for (const oldCode of roleCodes) {
    const newCode = `ROLE_${oldCode}`;

    try {
      // Update the common code
      const updated = await prisma.commonCode.updateMany({
        where: {
          groupCode: 'ROLE',
          code: oldCode,
        },
        data: {
          code: newCode,
        },
      });

      if (updated.count > 0) {
        console.log(`✅ Updated: ${oldCode} → ${newCode}`);
      } else {
        console.log(`⚠️  Not found: ${oldCode}`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${oldCode}:`, error);
    }
  }

  console.log('\n📊 Verifying updated role codes...');
  const updatedRoles = await prisma.commonCode.findMany({
    where: { groupCode: 'ROLE' },
    select: { code: true, name: true },
    orderBy: { order: 'asc' },
  });

  console.log('\nUpdated role codes:');
  updatedRoles.forEach(role => {
    console.log(`   - ${role.code}: ${role.name}`);
  });

  console.log('\n✨ Role code update completed!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
