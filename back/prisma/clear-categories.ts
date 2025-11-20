import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('기존 카테고리 데이터 삭제 중...');
  
  const result = await prisma.category.deleteMany({});
  
  console.log(`✓ ${result.count}개 카테고리 삭제 완료`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
