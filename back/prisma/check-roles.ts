import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📋 권한 시스템 데이터 확인\n');

  const roles = await prisma.commonCode.findMany({
    where: { groupCode: 'ROLE' },
    orderBy: { order: 'asc' },
    take: 5,
  });

  roles.forEach((role) => {
    console.log(`\n[${role.code}] ${role.name}`);
    console.log(`📝 설명: ${role.description}`);

    if (role.value) {
      const parsed = JSON.parse(role.value);
      console.log(`⚡ 레벨: ${parsed.level}`);
      console.log(`🔑 권한: ${parsed.permissions.slice(0, 5).join(', ')}${parsed.permissions.length > 5 ? '...' : ''}`);

      if (parsed.requiredTrustScore) {
        console.log(`⭐ 필요 신뢰점수: ${parsed.requiredTrustScore}`);
      }
      if (parsed.requiredVerification) {
        console.log(`✅ 필요 인증: ${parsed.requiredVerification.join(', ')}`);
      }
    }
    console.log('─'.repeat(60));
  });

  console.log('\n\n💡 이 데이터로 할 수 있는 것:');
  console.log('1. 권한별로 허용된 작업(permission) 세밀하게 제어');
  console.log('2. 권한 레벨로 위계 비교 (HOST는 USER보다 높음)');
  console.log('3. 권한 부여 조건 설정 (신뢰점수, 인증 여부)');
  console.log('4. DB에서 바로 수정 가능 (코드 수정 없이!)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
