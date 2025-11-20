import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 asdf@moa.com 계정 정보 확인 중...\n');

  // 사용자 정보 조회
  const user = await prisma.user.findUnique({
    where: { email: 'asdf@moa.com' },
    include: {
      userRoles: {
        select: {
          roleCode: true,
          isPrimary: true,
        },
      },
    },
  });

  if (!user) {
    console.log('❌ asdf@moa.com 계정을 찾을 수 없습니다.');

    // 비밀번호 해시 생성
    const hashedPassword = await bcrypt.hash('1234', 10);

    console.log('\n계정을 생성하시겠습니까? 다음 명령어를 실행하세요:');
    console.log('npm run prisma:studio');
    return;
  }

  console.log('📧 이메일:', user.email);
  console.log('👤 이름:', user.name);
  console.log('🔑 권한:');

  if (user.userRoles.length === 0) {
    console.log('   ❌ 권한이 없습니다!');
    console.log('\n   권한을 추가하려면 다음 스크립트를 실행하세요.');
  } else {
    user.userRoles.forEach(role => {
      console.log(`   - ${role.roleCode}${role.isPrimary ? ' (Primary)' : ''}`);
    });
  }

  // 비밀번호 확인
  const isPasswordValid = await bcrypt.compare('1234', user.password);
  console.log('\n🔐 비밀번호 (1234):', isPasswordValid ? '✅ 일치' : '❌ 불일치');

  // 관리자 권한이 있는지 확인
  const hasAdminRole = user.userRoles.some(role =>
    ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MODERATOR'].includes(role.roleCode)
  );

  console.log('\n🛡️  관리자 권한:', hasAdminRole ? '✅ 있음' : '❌ 없음');

  if (!hasAdminRole) {
    console.log('\n💡 관리자 권한을 추가하려면 다음을 실행하세요:');
    console.log(`   npx ts-node -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.userRole.create({
  data: {
    userId: '${user.id}',
    roleCode: 'ROLE_ADMIN',
    isPrimary: true,
  }
}).then(() => {
  console.log('✅ ROLE_ADMIN 권한 추가 완료');
  prisma.\$disconnect();
});
"`);
  }

  // 비밀번호가 1234가 아니면 업데이트
  if (!isPasswordValid) {
    console.log('\n🔄 비밀번호를 1234로 변경 중...');
    const hashedPassword = await bcrypt.hash('1234', 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    console.log('✅ 비밀번호 변경 완료');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
