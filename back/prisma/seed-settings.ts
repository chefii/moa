import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSettings() {
  console.log('🌱 Seeding settings and footer data...');

  try {
    // Delete existing data
    await prisma.footerLink.deleteMany();
    await prisma.siteSetting.deleteMany();

    // 1. 회사 정보 설정
    await prisma.siteSetting.createMany({
      data: [
        {
          key: 'company_name',
          value: '(주)모아',
          category: 'company',
          label: '회사명',
          order: 0,
        },
        {
          key: 'company_ceo',
          value: '홍길동',
          category: 'company',
          label: '대표자명',
          order: 1,
        },
        {
          key: 'company_business_number',
          value: '123-45-67890',
          category: 'company',
          label: '사업자등록번호',
          order: 2,
        },
        {
          key: 'company_ecommerce_number',
          value: '2024-서울강남-12345',
          category: 'company',
          label: '통신판매업신고번호',
          order: 3,
        },
        {
          key: 'company_address',
          value: '서울특별시 강남구 테헤란로 123 모아빌딩 5층',
          category: 'company',
          label: '주소',
          order: 4,
        },
      ],
    });

    console.log('✅ Created: Company info settings (5 items)');

    // 2. 고객센터 정보
    await prisma.siteSetting.createMany({
      data: [
        {
          key: 'contact_email',
          value: 'support@moa.co.kr',
          category: 'contact',
          label: '고객센터 이메일',
          order: 0,
        },
        {
          key: 'contact_phone',
          value: '02-1234-5678',
          category: 'contact',
          label: '고객센터 전화번호',
          order: 1,
        },
        {
          key: 'contact_working_hours',
          value: '평일 10:00 - 18:00 (주말 및 공휴일 휴무)',
          category: 'contact',
          label: '운영시간',
          order: 2,
        },
      ],
    });

    console.log('✅ Created: Contact info settings (3 items)');

    // 3. 소셜 미디어 링크
    await prisma.siteSetting.createMany({
      data: [
        {
          key: 'social_facebook',
          value: 'https://facebook.com/moa',
          category: 'social',
          label: 'Facebook URL',
          order: 0,
        },
        {
          key: 'social_instagram',
          value: 'https://instagram.com/moa.official',
          category: 'social',
          label: 'Instagram URL',
          order: 1,
        },
        {
          key: 'social_twitter',
          value: 'https://twitter.com/moa_official',
          category: 'social',
          label: 'Twitter URL',
          order: 2,
        },
        {
          key: 'social_youtube',
          value: 'https://youtube.com/@moa',
          category: 'social',
          label: 'Youtube URL',
          order: 3,
        },
      ],
    });

    console.log('✅ Created: Social media settings (4 items)');

    // 4. 푸터 링크 (약관)
    await prisma.footerLink.createMany({
      data: [
        {
          title: '이용약관',
          url: '/terms/service',
          order: 0,
          isExternal: false,
          isActive: true,
          category: 'terms',
        },
        {
          title: '개인정보처리방침',
          url: '/terms/privacy',
          order: 1,
          isExternal: false,
          isActive: true,
          category: 'terms',
        },
        {
          title: '위치기반서비스 이용약관',
          url: '/terms/location',
          order: 2,
          isExternal: false,
          isActive: true,
          category: 'terms',
        },
        {
          title: '청소년보호정책',
          url: '/terms/youth',
          order: 3,
          isExternal: false,
          isActive: true,
          category: 'terms',
        },
      ],
    });

    console.log('✅ Created: Footer links (4 items)');

    // Verify data
    const settingsCount = await prisma.siteSetting.count();
    const footerLinksCount = await prisma.footerLink.count();

    console.log('\n📊 Summary:');
    console.log(`   - Site Settings: ${settingsCount}`);
    console.log(`   - Footer Links: ${footerLinksCount}`);
    console.log('\n✨ Settings seeding completed successfully!\n');
  } catch (error) {
    console.error('❌ Error seeding settings data:', error);
    throw error;
  }
}

seedSettings()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
