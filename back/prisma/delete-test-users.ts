import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  테스트 사용자 삭제 중...');

  // Delete users with test emails
  const result = await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { contains: '@moa.com' } },
        { email: { contains: '@example.com' } },
      ],
    },
  });

  console.log(`✅ ${result.count}명의 테스트 사용자 삭제 완료`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
