import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding gender codes...');

  // Delete existing gender codes
  await prisma.commonCode.deleteMany({
    where: { groupCode: 'GENDER' },
  });

  const genders = [
    {
      groupCode: 'GENDER',
      code: 'MALE',
      name: '남성',
      description: '남성',
      order: 1,
    },
    {
      groupCode: 'GENDER',
      code: 'FEMALE',
      name: '여성',
      description: '여성',
      order: 2,
    },
    {
      groupCode: 'GENDER',
      code: 'OTHER',
      name: '기타',
      description: '기타',
      order: 3,
    },
    {
      groupCode: 'GENDER',
      code: 'PREFER_NOT_TO_SAY',
      name: '선택 안함',
      description: '성별을 선택하지 않음',
      order: 4,
    },
  ];

  for (const gender of genders) {
    await prisma.commonCode.create({
      data: gender,
    });
    console.log(`✅ Created gender: ${gender.code} - ${gender.name}`);
  }

  console.log('\n✨ Gender codes seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding gender codes:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
