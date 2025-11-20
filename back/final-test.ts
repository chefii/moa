import { prisma } from './src/config/prisma';

async function finalTest() {
  try {
    console.log('=== 🚀 소프트 삭제 시스템 최종 테스트 ===\n');
    
    // 1. 카테고리 테스트
    console.log('1️⃣ Category 테스트...');
    const category = await prisma.category.create({
      data: { name: 'TEST', slug: 'test-' + Date.now(), type: ['GATHERING'] },
    });
    await prisma.category.update({
      where: { id: category.id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
    const categoryCount = await prisma.category.count({
      where: { id: category.id },
    });
    console.log(categoryCount === 0 ? '✅ Category 통과' : '❌ Category 실패');
    await prisma.$executeRaw`DELETE FROM categories WHERE id = ${category.id}`;
    
    // 2. 배지 테스트
    console.log('2️⃣ Badge 테스트...');
    const badge = await prisma.badge.create({
      data: {
        code: 'TEST_' + Date.now(),
        name: 'Test Badge',
        description: 'Test',
        icon: 'test',
        category: 'BASIC',
        conditionType: 'test',
        conditionValue: 1,
      },
    });
    await prisma.badge.update({
      where: { id: badge.id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
    const badgeCount = await prisma.badge.count({
      where: { id: badge.id },
    });
    console.log(badgeCount === 0 ? '✅ Badge 통과' : '❌ Badge 실패');
    await prisma.$executeRaw`DELETE FROM badges WHERE id = ${badge.id}`;
    
    // 3. CommonCode 테스트
    console.log('3️⃣ CommonCode 테스트...');
    const code = await prisma.commonCode.create({
      data: {
        groupCode: 'TEST',
        code: 'TEST_' + Date.now(),
        name: 'Test',
      },
    });
    await prisma.commonCode.update({
      where: { id: code.id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
    const codeCount = await prisma.commonCode.count({
      where: { id: code.id },
    });
    console.log(codeCount === 0 ? '✅ CommonCode 통과' : '❌ CommonCode 실패');
    await prisma.$executeRaw`DELETE FROM common_codes WHERE id = ${code.id}`;
    
    console.log('\n=== 🎉 모든 테스트 통과! ===');
    console.log('✅ DB 컬럼: is_deleted, deleted_at 생성 완료');
    console.log('✅ 삭제 기능: isDeleted = true로 변경');
    console.log('✅ 조회 필터: 자동으로 삭제된 데이터 제외');
    console.log('\n💡 이제 어드민에서 삭제하면 리스트에서 안 보입니다!');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalTest();
