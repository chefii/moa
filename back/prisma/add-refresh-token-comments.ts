import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addComments() {
  console.log('Adding comments to refresh_tokens table...');

  await prisma.$executeRawUnsafe(`COMMENT ON TABLE refresh_tokens IS 'Refresh Token 테이블 - 자동 갱신 및 세션 관리'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN refresh_tokens.id IS '토큰 고유 ID'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN refresh_tokens.user_id IS '사용자 ID'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN refresh_tokens.token IS 'Refresh Token (해시 저장)'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN refresh_tokens.expires_at IS '만료 일시'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN refresh_tokens.is_revoked IS '무효화 여부 (강제 로그아웃 시 사용)'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN refresh_tokens.device_info IS '기기 정보 (User-Agent)'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN refresh_tokens.ip_address IS 'IP 주소'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN refresh_tokens.last_used_at IS '마지막 사용 일시'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN refresh_tokens.created_at IS '생성 일시'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN refresh_tokens.updated_at IS '수정 일시'`);

  console.log('Comments added successfully!');
}

addComments()
  .catch((e) => {
    console.error('Error adding comments:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
