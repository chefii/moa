import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding terms types...');

  // 약관 타입 코드
  const termsTypes = [
    { code: 'SERVICE', name: '서비스 이용약관', description: 'MOA 서비스 이용약관', order: 1 },
    { code: 'PRIVACY', name: '개인정보처리방침', description: '개인정보 수집 및 이용에 관한 방침', order: 2 },
    { code: 'LOCATION', name: '위치기반서비스 이용약관', description: '위치정보 수집 및 이용에 관한 약관', order: 3 },
    { code: 'MARKETING', name: '마케팅 정보 수신 동의', description: '마케팅 및 광고성 정보 수신 동의', order: 4 },
    { code: 'COMMUNITY', name: '모임/커뮤니티 운영 정책', description: '모임 개설 및 참여 관련 정책', order: 5 },
    { code: 'REPORT', name: '신고/제재 정책', description: '신고 처리 및 제재에 관한 정책', order: 6 },
    { code: 'PAYMENT', name: '결제/취소/환불 규정', description: '결제, 취소, 환불에 관한 규정', order: 7 },
    { code: 'SETTLEMENT', name: '호스트/비즈니스 정산 정책', description: '호스트 및 비즈니스 회원 정산 관련 정책', order: 8 },
    { code: 'YOUTH_PROTECTION', name: '청소년 보호정책', description: '청소년 보호에 관한 정책', order: 9 },
  ];

  for (const termsType of termsTypes) {
    await prisma.commonCode.upsert({
      where: { code: `TERMS_TYPE_${termsType.code}` },
      update: {
        name: termsType.name,
        description: termsType.description,
        order: termsType.order,
      },
      create: {
        groupCode: 'TERMS_TYPE',
        code: `TERMS_TYPE_${termsType.code}`,
        name: termsType.name,
        description: termsType.description,
        order: termsType.order,
      },
    });
  }
  console.log('✅ Terms types seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
