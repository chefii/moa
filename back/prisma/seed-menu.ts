import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMenu() {
  console.log('🌱 Seeding menu data...');

  try {
    // Delete existing menu data
    await prisma.menuItem.deleteMany();
    await prisma.menuCategory.deleteMany();

    // 1. 회원 관리
    const userManagementCategory = await prisma.menuCategory.create({
      data: {
        name: '회원 관리',
        nameEn: 'User Management',
        icon: 'UserCircle2',
        order: 0,
        isActive: true,
        description: '사용자, 사업자, 신고 관리',
        requiredRoles: ['ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'],
      },
    });

    await prisma.menuItem.createMany({
      data: [
        {
          categoryId: userManagementCategory.id,
          name: '사용자 관리',
          nameEn: 'Users',
          path: '/admin/users',
          icon: 'Users',
          order: 0,
          isActive: true,
          requiredRoles: ['ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'],
        },
        {
          categoryId: userManagementCategory.id,
          name: '사업자 관리',
          nameEn: 'Business',
          path: '/admin/business',
          icon: 'Briefcase',
          order: 1,
          isActive: true,
          requiredRoles: ['ROLE_SUPER_ADMIN'],
        },
        {
          categoryId: userManagementCategory.id,
          name: '신고 관리',
          nameEn: 'Reports',
          path: '/admin/reports',
          icon: 'AlertCircle',
          order: 2,
          isActive: true,
          badge: 5,
          requiredRoles: ['ROLE_SUPER_ADMIN'],
        },
      ],
    });

    console.log('✅ Created: 회원 관리 category with 3 items');

    // 2. 모임 관리
    const gatheringManagementCategory = await prisma.menuCategory.create({
      data: {
        name: '모임 관리',
        nameEn: 'Gathering Management',
        icon: 'Calendar',
        order: 1,
        isActive: true,
        description: '모임 목록, 카테고리, 참가자, 리뷰 관리',
        requiredRoles: ['ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'],
      },
    });

    await prisma.menuItem.createMany({
      data: [
        {
          categoryId: gatheringManagementCategory.id,
          name: '모임 목록/관리',
          nameEn: 'Gatherings',
          path: '/admin/gatherings',
          icon: 'CalendarDays',
          order: 0,
          isActive: true,
          requiredRoles: ['ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'],
        },
        {
          categoryId: gatheringManagementCategory.id,
          name: '모임 카테고리',
          nameEn: 'Categories',
          path: '/admin/categories',
          icon: 'Tag',
          order: 1,
          isActive: true,
          requiredRoles: ['ROLE_SUPER_ADMIN'],
        },
        {
          categoryId: gatheringManagementCategory.id,
          name: '참가자 관리',
          nameEn: 'Participants',
          path: '/admin/participants',
          icon: 'UserCheck',
          order: 2,
          isActive: true,
          requiredRoles: ['ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'],
        },
        {
          categoryId: gatheringManagementCategory.id,
          name: '리뷰 관리',
          nameEn: 'Reviews',
          path: '/admin/reviews',
          icon: 'Star',
          order: 3,
          isActive: true,
          requiredRoles: ['ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'],
        },
      ],
    });

    console.log('✅ Created: 모임 관리 category with 4 items');

    // 3. 정산 관리
    const settlementCategory = await prisma.menuCategory.create({
      data: {
        name: '정산 관리',
        nameEn: 'Settlement Management',
        icon: 'DollarSign',
        order: 2,
        isActive: true,
        description: '정산 내역, 승인, 수수료, 매출 관리',
        requiredRoles: ['ROLE_SUPER_ADMIN'],
      },
    });

    await prisma.menuItem.createMany({
      data: [
        {
          categoryId: settlementCategory.id,
          name: '정산 내역',
          nameEn: 'Settlement List',
          path: '/admin/settlements',
          icon: 'Receipt',
          order: 0,
          isActive: true,
          requiredRoles: ['ROLE_SUPER_ADMIN'],
        },
        {
          categoryId: settlementCategory.id,
          name: '정산 승인',
          nameEn: 'Settlement Approval',
          path: '/admin/settlements/approval',
          icon: 'CheckCircle',
          order: 1,
          isActive: true,
          requiredRoles: ['ROLE_SUPER_ADMIN'],
        },
        {
          categoryId: settlementCategory.id,
          name: '수수료 관리',
          nameEn: 'Fee Management',
          path: '/admin/settlements/fees',
          icon: 'Percent',
          order: 2,
          isActive: true,
          requiredRoles: ['ROLE_SUPER_ADMIN'],
        },
        {
          categoryId: settlementCategory.id,
          name: '매출 통계',
          nameEn: 'Revenue Stats',
          path: '/admin/settlements/stats',
          icon: 'TrendingUp',
          order: 3,
          isActive: true,
          requiredRoles: ['ROLE_SUPER_ADMIN'],
        },
      ],
    });

    console.log('✅ Created: 정산 관리 category with 4 items');

    // 4. 신뢰 시스템
    const trustSystemCategory = await prisma.menuCategory.create({
      data: {
        name: '신뢰 시스템',
        nameEn: 'Trust System',
        icon: 'Award',
        order: 3,
        isActive: true,
        description: '뱃지, 포인트, 레벨, 모멘트 관리',
        requiredRoles: ['ROLE_SUPER_ADMIN'],
      },
    });

    await prisma.menuItem.createMany({
      data: [
        {
          categoryId: trustSystemCategory.id,
          name: '뱃지 관리',
          nameEn: 'Badges',
          path: '/admin/badges',
          icon: 'Medal',
          order: 0,
          isActive: true,
          requiredRoles: ['ROLE_SUPER_ADMIN'],
        },
        {
          categoryId: trustSystemCategory.id,
          name: '포인트 정책',
          nameEn: 'Point Policy',
          path: '/admin/points',
          icon: 'Coins',
          order: 1,
          isActive: true,
          requiredRoles: ['ROLE_SUPER_ADMIN'],
        },
        {
          categoryId: trustSystemCategory.id,
          name: '레벨 시스템',
          nameEn: 'Level System',
          path: '/admin/levels',
          icon: 'TrendingUp',
          order: 2,
          isActive: true,
          requiredRoles: ['ROLE_SUPER_ADMIN'],
        },
        {
          categoryId: trustSystemCategory.id,
          name: '모멘트 컬렉션',
          nameEn: 'Moments',
          path: '/admin/moments',
          icon: 'Sparkles',
          order: 3,
          isActive: true,
          requiredRoles: ['ROLE_SUPER_ADMIN'],
        },
      ],
    });

    console.log('✅ Created: 신뢰 시스템 category with 4 items');

    // 5. 콘텐츠 관리
    const contentManagementCategory = await prisma.menuCategory.create({
      data: {
        name: '콘텐츠 관리',
        nameEn: 'Content Management',
        icon: 'FileText',
        order: 4,
        isActive: true,
        description: '배너, 팝업, 이벤트, 공지사항 관리',
        requiredRoles: ['ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'],
      },
    });

    await prisma.menuItem.createMany({
      data: [
        {
          categoryId: contentManagementCategory.id,
          name: '배너 관리',
          nameEn: 'Banners',
          path: '/admin/banners',
          icon: 'Image',
          order: 0,
          isActive: true,
          requiredRoles: ['ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'],
        },
        {
          categoryId: contentManagementCategory.id,
          name: '팝업 관리',
          nameEn: 'Popups',
          path: '/admin/popups',
          icon: 'MessageSquare',
          order: 1,
          isActive: true,
          requiredRoles: ['ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'],
        },
        {
          categoryId: contentManagementCategory.id,
          name: '이벤트',
          nameEn: 'Events',
          path: '/admin/events',
          icon: 'Calendar',
          order: 2,
          isActive: true,
          requiredRoles: ['ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'],
        },
        {
          categoryId: contentManagementCategory.id,
          name: '공지사항',
          nameEn: 'Notices',
          path: '/admin/notices',
          icon: 'Bell',
          order: 3,
          isActive: true,
          requiredRoles: ['ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'],
        },
      ],
    });

    console.log('✅ Created: 콘텐츠 관리 category with 4 items');

    // 6. 고객 지원
    const customerSupportCategory = await prisma.menuCategory.create({
      data: {
        name: '고객 지원',
        nameEn: 'Customer Support',
        icon: 'Headphones',
        order: 5,
        isActive: true,
        description: 'FAQ, 1:1 문의, 이용약관 관리',
        requiredRoles: ['ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'],
      },
    });

    await prisma.menuItem.createMany({
      data: [
        {
          categoryId: customerSupportCategory.id,
          name: 'FAQ 관리',
          nameEn: 'FAQ',
          path: '/admin/faq',
          icon: 'HelpCircle',
          order: 0,
          isActive: true,
          requiredRoles: ['ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'],
        },
        {
          categoryId: customerSupportCategory.id,
          name: '1:1 문의',
          nameEn: 'Inquiries',
          path: '/admin/inquiries',
          icon: 'MessageCircle',
          order: 1,
          isActive: true,
          requiredRoles: ['ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'],
        },
        {
          categoryId: customerSupportCategory.id,
          name: '이용약관',
          nameEn: 'Terms',
          path: '/admin/terms',
          icon: 'FileCheck',
          order: 2,
          isActive: true,
          requiredRoles: ['ROLE_SUPER_ADMIN'],
        },
      ],
    });

    console.log('✅ Created: 고객 지원 category with 3 items');

    // 7. 시스템 관리
    const systemManagementCategory = await prisma.menuCategory.create({
      data: {
        name: '시스템 관리',
        nameEn: 'System Management',
        icon: 'Settings2',
        order: 6,
        isActive: true,
        description: '공통 코드, 메뉴, 관리자 권한 관리',
        requiredRoles: ['ROLE_SUPER_ADMIN'],
      },
    });

    await prisma.menuItem.createMany({
      data: [
        {
          categoryId: systemManagementCategory.id,
          name: '공통 코드',
          nameEn: 'Common Codes',
          path: '/admin/common-codes',
          icon: 'Code',
          order: 0,
          isActive: true,
          requiredRoles: ['ROLE_SUPER_ADMIN'],
        },
        {
          categoryId: systemManagementCategory.id,
          name: '메뉴 관리',
          nameEn: 'Menu Management',
          path: '/admin/menu-management',
          icon: 'Settings',
          order: 1,
          isActive: true,
          requiredRoles: ['ROLE_SUPER_ADMIN'],
        },
        {
          categoryId: systemManagementCategory.id,
          name: '약관 관리',
          nameEn: 'Terms Management',
          path: '/admin/terms-management',
          icon: 'FileText',
          order: 2,
          isActive: true,
          requiredRoles: ['ROLE_SUPER_ADMIN'],
        },
        {
          categoryId: systemManagementCategory.id,
          name: '관리자 권한',
          nameEn: 'Admin Roles',
          path: '/admin/roles',
          icon: 'Shield',
          order: 3,
          isActive: true,
          requiredRoles: ['ROLE_SUPER_ADMIN'],
        },
      ],
    });

    console.log('✅ Created: 시스템 관리 category with 4 items');

    // Verify data
    const categoriesCount = await prisma.menuCategory.count();
    const itemsCount = await prisma.menuItem.count();

    console.log('\n📊 Summary:');
    console.log(`   - Categories: ${categoriesCount}`);
    console.log(`   - Menu Items: ${itemsCount}`);
    console.log('\n📋 Menu Structure:');
    console.log('   1. 회원 관리 (3 items)');
    console.log('   2. 모임 관리 (4 items)');
    console.log('   3. 정산 관리 (4 items)');
    console.log('   4. 신뢰 시스템 (4 items)');
    console.log('   5. 콘텐츠 관리 (4 items)');
    console.log('   6. 고객 지원 (3 items)');
    console.log('   7. 시스템 관리 (4 items)');
    console.log('\n✨ Menu seeding completed successfully!\n');
  } catch (error) {
    console.error('❌ Error seeding menu data:', error);
    throw error;
  }
}

seedMenu()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
