/**
 * DB에 저장된 절대 URL을 상대 경로로 변경하는 마이그레이션 스크립트
 *
 * 실행 방법:
 * npx ts-node src/scripts/migrate-file-urls.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateFileUrls() {
  try {
    console.log('🔄 Starting file URL migration...\n');

    // 모든 파일 조회
    const files = await prisma.file.findMany();
    console.log(`📊 Found ${files.length} files to migrate\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const file of files) {
      const oldUrl = file.url;

      // 이미 상대 경로인 경우 스킵
      if (!oldUrl.startsWith('http://') && !oldUrl.startsWith('https://')) {
        console.log(`⏭️  Skipping (already relative): ${file.id}`);
        skippedCount++;
        continue;
      }

      // 외부 URL(localhost, 172.x.x.x, 192.168.x.x, 10.x.x.x가 아닌 경우)은 스킵
      const isLocalhost = oldUrl.includes('localhost');
      const isLocalIP = /https?:\/\/(172|192\.168|10)\.\d+\.\d+\.\d+/.test(oldUrl);

      if (!isLocalhost && !isLocalIP) {
        console.log(`⏭️  Skipping (external URL): ${file.id} - ${oldUrl}`);
        skippedCount++;
        continue;
      }

      // URL을 상대 경로로 변환
      // 예: http://localhost:4000/uploads/banners/... → /uploads/banners/...
      // 예: http://loaclhost:4000/uploads/banners/... → /uploads/banners/...
      const urlObj = new URL(oldUrl);
      const newUrl = urlObj.pathname; // /uploads/...

      // DB 업데이트
      await prisma.file.update({
        where: { id: file.id },
        data: { url: newUrl },
      });

      console.log(`✅ Updated: ${file.id}`);
      console.log(`   Old: ${oldUrl}`);
      console.log(`   New: ${newUrl}\n`);

      updatedCount++;
    }

    console.log('━'.repeat(50));
    console.log(`\n✨ Migration completed!`);
    console.log(`   Updated: ${updatedCount} files`);
    console.log(`   Skipped: ${skippedCount} files (already relative)\n`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
migrateFileUrls()
  .then(() => {
    console.log('✅ Migration script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
