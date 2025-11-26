import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding user terms agreements...');

  // 모든 사용자 조회
  const users = await prisma.user.findMany({
    select: { id: true, email: true },
  });

  console.log(`Found ${users.length} users`);

  // 모든 활성 약관 조회
  const terms = await prisma.terms.findMany({
    where: { isActive: true },
    select: { id: true, type: true, isRequired: true },
  });

  console.log(`Found ${terms.length} active terms`);

  if (users.length === 0) {
    console.log('No users found. Please create users first.');
    return;
  }

  if (terms.length === 0) {
    console.log('No terms found. Please run seed-terms-full.ts first.');
    return;
  }

  // 더미 IP 주소 목록
  const ipAddresses = [
    '211.234.123.45',
    '121.165.234.67',
    '175.223.12.89',
    '218.38.145.234',
    '61.78.234.123',
  ];

  // 더미 User Agent 목록
  const userAgents = [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  ];

  let createdCount = 0;

  for (const user of users) {
    // 기존 약관 동의 삭제 (재실행 시)
    await prisma.userTermsAgreement.deleteMany({
      where: { userId: user.id },
    });

    // 각 사용자에 대해 약관 동의 생성
    for (const term of terms) {
      // 필수 약관은 100% 동의, 선택 약관은 60% 확률로 동의
      const shouldAgree = term.isRequired || Math.random() > 0.4;

      if (shouldAgree) {
        await prisma.userTermsAgreement.create({
          data: {
            userId: user.id,
            termsId: term.id,
            agreed: true,
            agreedAt: new Date(
              Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000) // 최근 30일 내 랜덤
            ),
            ipAddress: ipAddresses[Math.floor(Math.random() * ipAddresses.length)],
            userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
          },
        });
        createdCount++;
      }
    }

    console.log(`✅ Created terms agreements for user: ${user.email}`);
  }

  console.log(`✅ Created ${createdCount} user terms agreements`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
