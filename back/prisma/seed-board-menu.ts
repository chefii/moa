import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('게시판 관리 메뉴 추가 시작...');

  // 콘텐츠 관리 카테고리 찾기
  const contentCategory = await prisma.menuCategory.findFirst({
    where: { name: '콘텐츠 관리' },
  });

  if (!contentCategory) {
    console.error('콘텐츠 관리 카테고리를 찾을 수 없습니다');
    return;
  }

  console.log(`콘텐츠 관리 카테고리 ID: ${contentCategory.id}`);

  // 게시판 관리 메뉴 아이템이 이미 존재하는지 확인
  const existing = await prisma.menuItem.findFirst({
    where: {
      categoryId: contentCategory.id,
      path: '/admin/boards',
    },
  });

  let boardMenuItem;
  if (existing) {
    console.log('기존 게시판 관리 메뉴 아이템 발견, 업데이트 중...');
    boardMenuItem = await prisma.menuItem.update({
      where: { id: existing.id },
      data: {
        name: '게시판 관리',
        icon: 'MessageSquare',
        requiredRoles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_CONTENT_MANAGER'],
        badge: 0,
        order: 4,
        isActive: true,
      },
    });
  } else {
    console.log('새 게시판 관리 메뉴 아이템 생성 중...');
    boardMenuItem = await prisma.menuItem.create({
      data: {
        categoryId: contentCategory.id,
        name: '게시판 관리',
        path: '/admin/boards',
        icon: 'MessageSquare',
        requiredRoles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_CONTENT_MANAGER'],
        badge: 0,
        order: 4,
        isActive: true,
      },
    });
  }

  console.log('게시판 관리 메뉴 생성 완료:', boardMenuItem);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
