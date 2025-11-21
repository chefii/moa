import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function applyBoardSoftDelete() {
  console.log('📝 게시글 테이블에 소프트 삭제 컬럼 추가 시작...\n');

  try {
    // 1. BoardPost 테이블에 isDeleted, deletedAt 추가
    console.log('1️⃣  board_posts 테이블에 is_deleted, deleted_at 컬럼 추가 중...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "board_posts"
      ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "board_posts"
      ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
    `);
    console.log('   ✅ board_posts 컬럼 추가 완료\n');

    // 2. BoardComment 테이블에 deletedAt 추가 (isDeleted는 이미 있음)
    console.log('2️⃣  board_comments 테이블에 deleted_at 컬럼 추가 중...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "board_comments"
      ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
    `);
    console.log('   ✅ board_comments 컬럼 추가 완료\n');

    // 3. 컬럼 코멘트 추가
    console.log('3️⃣  컬럼 코멘트 추가 중...');
    await prisma.$executeRawUnsafe(`
      COMMENT ON COLUMN "board_posts"."is_deleted" IS '소프트 삭제 여부';
    `);
    await prisma.$executeRawUnsafe(`
      COMMENT ON COLUMN "board_posts"."deleted_at" IS '삭제 일시';
    `);
    await prisma.$executeRawUnsafe(`
      COMMENT ON COLUMN "board_comments"."is_deleted" IS '소프트 삭제 여부';
    `);
    await prisma.$executeRawUnsafe(`
      COMMENT ON COLUMN "board_comments"."deleted_at" IS '삭제 일시';
    `);
    console.log('   ✅ 코멘트 추가 완료\n');

    // 4. 컬럼 확인
    console.log('4️⃣  추가된 컬럼 확인 중...\n');

    const boardPostColumns = await prisma.$queryRawUnsafe<any[]>(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'board_posts'
        AND column_name IN ('is_deleted', 'deleted_at')
      ORDER BY column_name;
    `);

    console.log('   📋 board_posts 컬럼:');
    console.table(boardPostColumns);

    const boardCommentColumns = await prisma.$queryRawUnsafe<any[]>(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'board_comments'
        AND column_name IN ('is_deleted', 'deleted_at')
      ORDER BY column_name;
    `);

    console.log('   📋 board_comments 컬럼:');
    console.table(boardCommentColumns);

    console.log('\n🎉 게시글 테이블 소프트 삭제 컬럼 추가 완료!\n');
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    throw error;
  }
}

applyBoardSoftDelete()
  .catch((error) => {
    console.error('❌ 마이그레이션 실패:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
