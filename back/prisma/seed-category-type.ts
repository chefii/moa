import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('카테고리 타입 공통코드 추가 시작...');

  const categoryTypes = [
    {
      groupCode: 'CATEGORY_TYPE',
      code: 'GATHERING',
      name: '모임 카테고리',
      value: 'GATHERING',
      description: '모임 생성 시 사용되는 카테고리',
      order: 1,
      isActive: true,
    },
    {
      groupCode: 'CATEGORY_TYPE',
      code: 'BOARD',
      name: '게시판 카테고리',
      value: 'BOARD',
      description: '게시판 분류에 사용되는 카테고리',
      order: 2,
      isActive: true,
    },
    {
      groupCode: 'CATEGORY_TYPE',
      code: 'INTEREST',
      name: '관심사 카테고리',
      value: 'INTEREST',
      description: '사용자 프로필 관심사에 사용되는 카테고리',
      order: 3,
      isActive: true,
    },
  ];

  for (const type of categoryTypes) {
    const existing = await prisma.commonCode.findFirst({
      where: {
        groupCode: type.groupCode,
        code: type.code,
      },
    });

    if (existing) {
      console.log(`기존 카테고리 타입 발견: ${type.code}, 업데이트 중...`);
      await prisma.commonCode.update({
        where: { id: existing.id },
        data: type,
      });
    } else {
      console.log(`새 카테고리 타입 생성: ${type.code}`);
      await prisma.commonCode.create({
        data: type,
      });
    }
  }

  console.log('카테고리 타입 공통코드 추가 완료!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
