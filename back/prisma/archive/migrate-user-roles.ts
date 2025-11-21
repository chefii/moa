import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateUserRoles() {
  console.log('🚀 Starting user roles migration...');

  try {
    // 1. 모든 사용자 조회
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        userRoles: true,
      },
    });

    console.log(`📊 Found ${users.length} users to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      // 이미 userRoles가 있는 경우 스킵
      if (user.userRoles.length > 0) {
        console.log(`⏭️  Skipping ${user.email} - already has userRoles`);
        skippedCount++;
        continue;
      }

      // user.role을 user_roles 테이블로 마이그레이션
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleCode: user.role,
          isPrimary: true, // 기존 role은 primary로 설정
        },
      });

      migratedCount++;
      console.log(`✅ Migrated ${user.email} - role: ${user.role}`);
    }

    console.log('\n✨ Migration completed!');
    console.log(`✅ Migrated: ${migratedCount} users`);
    console.log(`⏭️  Skipped: ${skippedCount} users (already migrated)`);
    console.log(`📊 Total: ${users.length} users`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute migration
migrateUserRoles()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
