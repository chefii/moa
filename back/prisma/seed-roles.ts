import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding roles to common codes...');

  // Delete existing roles
  await prisma.commonCode.deleteMany({
    where: { groupCode: 'ROLE' },
  });

  // Role definitions
  const roles = [
    // ============================================
    // 일반 사용자 권한
    // ============================================
    {
      groupCode: 'ROLE',
      code: 'USER',
      name: '일반 회원',
      description: '기본 회원 권한. 모임 참여 및 기본 기능 이용 가능',
      value: JSON.stringify({
        level: 1,
        permissions: ['gathering.view', 'gathering.join', 'profile.edit', 'review.write'],
      }),
      order: 10,
    },
    {
      groupCode: 'ROLE',
      code: 'VERIFIED_USER',
      name: '인증 회원',
      description: '이메일/전화번호 인증 완료 회원. 신뢰도 향상 및 추가 기능 이용',
      value: JSON.stringify({
        level: 2,
        permissions: ['gathering.view', 'gathering.join', 'profile.edit', 'review.write', 'chat.access'],
        requiredVerification: ['email', 'phone'],
      }),
      order: 20,
    },
    {
      groupCode: 'ROLE',
      code: 'HOST',
      name: '모임 주최자',
      description: '모임 개설 가능 회원. 신뢰점수 일정 수준 이상 필요',
      value: JSON.stringify({
        level: 3,
        permissions: [
          'gathering.view',
          'gathering.join',
          'gathering.create',
          'gathering.edit',
          'gathering.cancel',
          'profile.edit',
          'review.write',
          'chat.access',
          'participant.manage',
        ],
        requiredTrustScore: 50,
      }),
      order: 30,
    },
    {
      groupCode: 'ROLE',
      code: 'PREMIUM_USER',
      name: '프리미엄 회원',
      description: '프리미엄 구독 회원. 추가 혜택 및 우선권 제공',
      value: JSON.stringify({
        level: 4,
        permissions: [
          'gathering.view',
          'gathering.join',
          'gathering.create',
          'gathering.priority',
          'profile.edit',
          'review.write',
          'chat.access',
          'analytics.view',
        ],
        features: ['ad-free', 'priority-support', 'exclusive-gatherings'],
      }),
      order: 40,
    },

    // ============================================
    // 비즈니스 권한
    // ============================================
    {
      groupCode: 'ROLE',
      code: 'BUSINESS_PENDING',
      name: '비즈니스 신청자',
      description: '비즈니스 계정 승인 대기중. 기본 회원 권한과 동일',
      value: JSON.stringify({
        level: 5,
        permissions: ['gathering.view', 'gathering.join', 'profile.edit', 'business.pending'],
        requiresApproval: true,
      }),
      order: 50,
    },
    {
      groupCode: 'ROLE',
      code: 'BUSINESS_USER',
      name: '비즈니스 회원',
      description: '승인된 비즈니스 계정. 유료 모임 개설 및 정산 가능',
      value: JSON.stringify({
        level: 6,
        permissions: [
          'gathering.view',
          'gathering.join',
          'gathering.create',
          'gathering.paid',
          'gathering.edit',
          'gathering.cancel',
          'profile.edit',
          'review.write',
          'chat.access',
          'participant.manage',
          'settlement.view',
          'analytics.business',
        ],
      }),
      order: 60,
    },
    {
      groupCode: 'ROLE',
      code: 'BUSINESS_MANAGER',
      name: '비즈니스 매니저',
      description: '여러 모임 통합 관리 가능한 비즈니스 계정',
      value: JSON.stringify({
        level: 7,
        permissions: [
          'gathering.view',
          'gathering.join',
          'gathering.create',
          'gathering.paid',
          'gathering.edit',
          'gathering.cancel',
          'gathering.bulk',
          'profile.edit',
          'review.write',
          'chat.access',
          'participant.manage',
          'settlement.view',
          'settlement.request',
          'analytics.business',
          'team.manage',
        ],
      }),
      order: 70,
    },

    // ============================================
    // 관리자 권한
    // ============================================
    {
      groupCode: 'ROLE',
      code: 'MODERATOR',
      name: '커뮤니티 관리자',
      description: '신고 검토 및 사용자 제재 권한. 콘텐츠 모더레이션',
      value: JSON.stringify({
        level: 100,
        adminLevel: 1,
        permissions: [
          'report.view',
          'report.review',
          'report.resolve',
          'user.view',
          'user.suspend',
          'user.warn',
          'gathering.view',
          'gathering.moderate',
          'review.moderate',
          'chat.monitor',
        ],
      }),
      order: 100,
    },
    {
      groupCode: 'ROLE',
      code: 'CONTENT_MANAGER',
      name: '콘텐츠 관리자',
      description: '배너, 공지사항, 이벤트, 팝업 등 콘텐츠 관리',
      value: JSON.stringify({
        level: 100,
        adminLevel: 2,
        permissions: [
          'banner.view',
          'banner.create',
          'banner.edit',
          'banner.delete',
          'notice.view',
          'notice.create',
          'notice.edit',
          'notice.delete',
          'event.view',
          'event.create',
          'event.edit',
          'event.delete',
          'popup.view',
          'popup.create',
          'popup.edit',
          'popup.delete',
          'faq.manage',
        ],
      }),
      order: 110,
    },
    {
      groupCode: 'ROLE',
      code: 'SUPPORT_MANAGER',
      name: '고객지원 관리자',
      description: '고객 문의, FAQ, 회원 지원 담당',
      value: JSON.stringify({
        level: 100,
        adminLevel: 2,
        permissions: [
          'user.view',
          'user.search',
          'user.edit',
          'inquiry.view',
          'inquiry.respond',
          'faq.view',
          'faq.edit',
          'notice.view',
          'review.view',
        ],
      }),
      order: 120,
    },
    {
      groupCode: 'ROLE',
      code: 'SETTLEMENT_MANAGER',
      name: '정산 관리자',
      description: '비즈니스 정산 처리 및 재무 관리',
      value: JSON.stringify({
        level: 100,
        adminLevel: 3,
        permissions: [
          'settlement.view',
          'settlement.process',
          'settlement.approve',
          'settlement.reject',
          'business.view',
          'business.finance',
          'analytics.finance',
          'report.finance',
        ],
      }),
      order: 130,
    },
    {
      groupCode: 'ROLE',
      code: 'ADMIN',
      name: '일반 관리자',
      description: '대부분의 관리 기능 사용 가능. 시스템 설정 외 전반적 관리',
      value: JSON.stringify({
        level: 200,
        adminLevel: 4,
        permissions: [
          'user.view',
          'user.edit',
          'user.suspend',
          'user.delete',
          'gathering.view',
          'gathering.edit',
          'gathering.cancel',
          'gathering.moderate',
          'report.view',
          'report.resolve',
          'banner.manage',
          'notice.manage',
          'event.manage',
          'popup.manage',
          'settlement.view',
          'settlement.process',
          'category.manage',
          'badge.manage',
          'analytics.full',
        ],
      }),
      order: 200,
    },
    {
      groupCode: 'ROLE',
      code: 'SUPER_ADMIN',
      name: '최고 관리자',
      description: '모든 권한 보유. 시스템 설정 및 관리자 관리 가능',
      value: JSON.stringify({
        level: 999,
        adminLevel: 999,
        permissions: ['*'], // All permissions
        features: [
          'system.settings',
          'admin.manage',
          'role.manage',
          'permission.manage',
          'database.backup',
          'system.logs',
        ],
      }),
      order: 999,
    },
  ];

  // Create roles
  for (const role of roles) {
    await prisma.commonCode.create({
      data: role,
    });
    console.log(`✅ Created role: ${role.code} - ${role.name}`);
  }

  console.log('');
  console.log('✨ Roles seeding completed!');
  console.log(`📊 Total roles created: ${roles.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding roles:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
