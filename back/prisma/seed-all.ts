import { PrismaClient, BadgeCategory, GatheringStatus, ParticipantStatus, BannerType, PopupType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시작: 전체 더미 데이터 생성...\n');

  // ============================================
  // 1. 사용자 생성 (권한별)
  // ============================================
  console.log('👤 사용자 생성 중...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 슈퍼 관리자
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@moa.com' },
    update: {},
    create: {
      email: 'superadmin@moa.com',
      password: hashedPassword,
      name: '슈퍼관리자',
      nickname: '슈퍼관리자',
      phone: '010-1111-1111',
      age: 35,
      gender: 'GENDER_MALE',
      isVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleCode: {
        userId: superAdmin.id,
        roleCode: 'ROLE_SUPER_ADMIN',
      },
    },
    update: {},
    create: {
      userId: superAdmin.id,
      roleCode: 'ROLE_SUPER_ADMIN',
      isPrimary: true,
    },
  });

  // 일반 관리자
  const admin = await prisma.user.upsert({
    where: { email: 'admin@moa.com' },
    update: {},
    create: {
      email: 'admin@moa.com',
      password: hashedPassword,
      name: '관리자',
      nickname: '관리자',
      phone: '010-2222-2222',
      age: 34,
      gender: 'GENDER_FEMALE',
      isVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleCode: {
        userId: admin.id,
        roleCode: 'ROLE_ADMIN',
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleCode: 'ROLE_ADMIN',
      isPrimary: true,
    },
  });

  // 모더레이터
  const moderator = await prisma.user.upsert({
    where: { email: 'moderator@moa.com' },
    update: {},
    create: {
      email: 'moderator@moa.com',
      password: hashedPassword,
      name: '모더레이터',
      nickname: '모더레이터',
      phone: '010-3333-3333',
      age: 32,
      gender: 'GENDER_MALE',
      isVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleCode: {
        userId: moderator.id,
        roleCode: 'ROLE_MODERATOR',
      },
    },
    update: {},
    create: {
      userId: moderator.id,
      roleCode: 'ROLE_MODERATOR',
      isPrimary: true,
    },
  });

  // 일반 사용자 20명 생성
  const regularUsers = [];
  const names = [
    '김민준', '이서연', '박지호', '최유진', '정도윤',
    '강서준', '조은우', '윤하은', '임시우', '한지아',
    '오예준', '신수아', '권예은', '장시현', '곽지훈',
    '송채원', '배서윤', '홍민서', '안지우', '양하윤',
  ];

  const nicknames = [
    '모험가', '탐험가', '여행자', '독서광', '운동광',
    '카페러버', '맛집헌터', '사진작가', '음악광', '영화광',
    '게이머', '요리사', '등산러', '러너', '댄서',
    '화가', '작가', '디자이너', '개발자', '기획자',
  ];

  for (let i = 0; i < 20; i++) {
    const user = await prisma.user.upsert({
      where: { email: `user${i + 1}@example.com` },
      update: {},
      create: {
        email: `user${i + 1}@example.com`,
        password: hashedPassword,
        name: names[i],
        nickname: `${nicknames[i]}${i + 1}`,
        phone: `010-${String(i + 1).padStart(4, '0')}-${String(i + 1).padStart(4, '0')}`,
        age: 25 + (i % 10),
        gender: i % 2 === 0 ? 'GENDER_MALE' : 'GENDER_FEMALE',
        bio: `안녕하세요! ${nicknames[i]}${i + 1}입니다. 새로운 사람들과 즐거운 모임을 만들어가고 싶어요 😊`,
        location: i % 3 === 0 ? '서울' : i % 3 === 1 ? '경기' : '인천',
        isVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleCode: {
          userId: user.id,
          roleCode: 'ROLE_USER',
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleCode: 'ROLE_USER',
        isPrimary: true,
      },
    });

    regularUsers.push(user);
  }

  console.log(`✅ 사용자 ${regularUsers.length + 3}명 생성 완료`);

  // ============================================
  // 2. 카테고리 생성
  // ============================================
  console.log('\n📁 카테고리 생성 중...');

  const categoryData = [
    { name: '운동/스포츠', slug: 'sports', icon: '⚽', color: '#FF6B6B', order: 1 },
    { name: '문화/예술', slug: 'culture', icon: '🎨', color: '#4ECDC4', order: 2 },
    { name: '음식/요리', slug: 'food', icon: '🍳', color: '#FFE66D', order: 3 },
    { name: '여행/나들이', slug: 'travel', icon: '✈️', color: '#95E1D3', order: 4 },
    { name: '스터디', slug: 'study', icon: '📚', color: '#A8DADC', order: 5 },
    { name: '취미/게임', slug: 'hobby', icon: '🎮', color: '#F38181', order: 6 },
    { name: '공연/전시', slug: 'exhibition', icon: '🎭', color: '#AA96DA', order: 7 },
    { name: '봉사활동', slug: 'volunteer', icon: '🤝', color: '#FCBAD3', order: 8 },
  ];

  const categories = [];
  for (const cat of categoryData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories.push(category);
  }

  console.log(`✅ 카테고리 ${categories.length}개 생성 완료`);

  // ============================================
  // 3. 모임 생성 (30개)
  // ============================================
  console.log('\n👥 모임 생성 중...');

  const gatheringTitles = [
    '주말 등산 모임', '맛집 탐방 투어', '북한산 트레킹', '한강 야경 러닝',
    '영화 감상 모임', '보드게임 나이트', '독서 토론회', '사진 촬영 모임',
    '요리 클래스', '카페 투어', '전시회 관람', '뮤지컬 관람',
    '풋살 경기', '배드민턴 동호회', '자전거 라이딩', '요가 클래스',
    'IT 스터디', '영어 회화', '일본어 공부', '코딩 부트캠프',
    '플리마켓 탐방', '봉사활동', '반려동물 산책', '캠핑 모임',
    '와인 시음회', '커피 로스팅', '베이킹 클래스', '악기 연주',
    '댄스 스튜디오', '명상 수업',
  ];

  const gatheringDescriptions = [
    '함께 건강한 주말을 보내요!',
    '서울의 숨은 맛집을 함께 찾아가요',
    '북한산 정상 정복에 도전해요',
    '한강에서 야경을 보며 달려요',
    '최신 영화를 함께 보고 이야기 나눠요',
    '다양한 보드게임을 즐겨요',
    '책을 읽고 생각을 나눠요',
    '서울의 아름다운 곳을 사진에 담아요',
    '초보자도 환영! 함께 요리해요',
    '서울의 특색있는 카페를 탐방해요',
    '이번 주 핫한 전시회를 함께 봐요',
    '뮤지컬을 보고 감상을 공유해요',
    '즐겁게 땀흘리며 풋살해요',
    '배드민턴으로 운동해요',
    '한강을 따라 자전거 타요',
    '요가로 몸과 마음을 정화해요',
    'IT 기술을 함께 공부해요',
    '원어민과 영어로 대화해요',
    '일본어 초급 스터디',
    '코딩 실력을 함께 키워요',
    '플리마켓에서 보물찾기',
    '의미있는 봉사활동을 해요',
    '반려동물과 함께 산책해요',
    '자연 속에서 캠핑을 즐겨요',
    '다양한 와인을 맛보아요',
    '직접 커피를 로스팅해요',
    '맛있는 빵과 디저트를 만들어요',
    '악기 연주를 배워요',
    '리듬에 맞춰 춤춰요',
    '마음의 평화를 찾아요',
  ];

  const gatherings = [];
  for (let i = 0; i < 30; i++) {
    const category = categories[i % categories.length];
    const host = regularUsers[i % regularUsers.length];

    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + (i % 30));
    scheduledAt.setHours(i % 2 === 0 ? 14 : 19, 0, 0, 0);

    const statuses: GatheringStatus[] = [
      GatheringStatus.RECRUITING,
      GatheringStatus.RECRUITING,
      GatheringStatus.RECRUITING,
      GatheringStatus.RECRUITING,
      GatheringStatus.FULL,
      GatheringStatus.COMPLETED,
      GatheringStatus.CANCELLED,
    ];

    const gathering = await prisma.gathering.create({
      data: {
        title: gatheringTitles[i],
        description: gatheringDescriptions[i],
        categoryId: category.id,
        hostId: host.id,
        locationAddress: '서울시 강남구 테헤란로',
        locationDetail: `상세주소 ${i + 1}`,
        maxParticipants: 5 + (i % 10),
        currentParticipants: 0,
        price: i % 3 === 0 ? 0 : (i % 5 + 1) * 10000,
        depositAmount: i % 2 === 0 ? 5000 : 10000,
        scheduledAt,
        durationMinutes: 120,
        status: statuses[i % statuses.length],
        image: `https://picsum.photos/seed/gathering${i}/800/600`,
        tags: ['모임', '친목', '취미'],
      },
    });

    gatherings.push(gathering);

    // 호스트 자동 참가
    await prisma.gatheringParticipant.create({
      data: {
        gatheringId: gathering.id,
        userId: host.id,
        status: ParticipantStatus.CONFIRMED,
      },
    });

    // 현재 참가자 수 업데이트
    await prisma.gathering.update({
      where: { id: gathering.id },
      data: { currentParticipants: 1 },
    });
  }

  console.log(`✅ 모임 ${gatherings.length}개 생성 완료`);

  // ============================================
  // 4. 모임 참가자 생성
  // ============================================
  console.log('\n🙋 모임 참가자 생성 중...');

  let participantCount = 0;
  for (let i = 0; i < gatherings.length; i++) {
    const gathering = gatherings[i];
    const participantsToAdd = Math.min(
      Math.floor(Math.random() * 5) + 1,
      gathering.maxParticipants - gathering.currentParticipants
    );

    for (let j = 0; j < participantsToAdd; j++) {
      const participant = regularUsers[(i + j + 1) % regularUsers.length];

      // 이미 참가한 사용자는 제외
      const existing = await prisma.gatheringParticipant.findFirst({
        where: {
          gatheringId: gathering.id,
          userId: participant.id,
        },
      });

      if (!existing) {
        const participantStatuses: ParticipantStatus[] = [
          ParticipantStatus.PENDING,
          ParticipantStatus.CONFIRMED,
          ParticipantStatus.CONFIRMED,
          ParticipantStatus.CONFIRMED,
        ];

        const status = participantStatuses[j % participantStatuses.length];

        await prisma.gatheringParticipant.create({
          data: {
            gatheringId: gathering.id,
            userId: participant.id,
            status,
            attendedAt: gathering.status === GatheringStatus.COMPLETED && Math.random() > 0.1 ? new Date() : undefined,
          },
        });

        await prisma.gathering.update({
          where: { id: gathering.id },
          data: { currentParticipants: { increment: 1 } },
        });

        participantCount++;
      }
    }
  }

  console.log(`✅ 모임 참가자 ${participantCount}명 생성 완료`);

  // ============================================
  // 5. 배지 생성
  // ============================================
  console.log('\n🏅 배지 생성 중...');

  const badgeData = [
    { code: 'FIRST_GATHERING', name: '첫 모임', icon: '🎉', category: BadgeCategory.BASIC, conditionType: 'PARTICIPATION_COUNT', conditionValue: 1 },
    { code: 'REGULAR_PARTICIPANT', name: '단골 참여자', icon: '⭐', category: BadgeCategory.BASIC, conditionType: 'PARTICIPATION_COUNT', conditionValue: 5 },
    { code: 'VETERAN_PARTICIPANT', name: '베테랑', icon: '💎', category: BadgeCategory.BASIC, conditionType: 'PARTICIPATION_COUNT', conditionValue: 10 },
    { code: 'MASTER_PARTICIPANT', name: '마스터', icon: '👑', category: BadgeCategory.SPECIAL, conditionType: 'PARTICIPATION_COUNT', conditionValue: 50 },
    { code: 'FIRST_HOST', name: '첫 주최', icon: '🌟', category: BadgeCategory.HOST, conditionType: 'HOSTING_COUNT', conditionValue: 1 },
    { code: 'HOST_PRO', name: '주최 프로', icon: '🎯', category: BadgeCategory.HOST, conditionType: 'HOSTING_COUNT', conditionValue: 5 },
    { code: 'PERFECT_ATTENDANCE', name: '개근상', icon: '📅', category: BadgeCategory.SPECIAL, conditionType: 'ATTENDANCE_RATE', conditionValue: 100 },
    { code: 'GOOD_ATTENDANCE', name: '성실한 참여자', icon: '✅', category: BadgeCategory.BASIC, conditionType: 'ATTENDANCE_RATE', conditionValue: 90 },
    { code: 'REVIEWER', name: '리뷰어', icon: '✍️', category: BadgeCategory.BASIC, conditionType: 'REVIEW_COUNT', conditionValue: 5 },
    { code: 'EARLY_BIRD', name: '얼리버드', icon: '🐦', category: BadgeCategory.SEASONAL, conditionType: 'EARLY_USER', conditionValue: 100 },
  ];

  const badges = [];
  for (const badge of badgeData) {
    const created = await prisma.badge.upsert({
      where: { code: badge.code },
      update: {},
      create: {
        ...badge,
        description: `${badge.name} 배지`,
        isActive: true,
      },
    });
    badges.push(created);
  }

  console.log(`✅ 배지 ${badges.length}개 생성 완료`);

  // ============================================
  // 6. 사용자 배지 지급
  // ============================================
  console.log('\n🎖️ 사용자 배지 지급 중...');

  let badgeCount = 0;
  for (let i = 0; i < regularUsers.length; i++) {
    const user = regularUsers[i];
    const badgesToGive = Math.floor(Math.random() * 3) + 1;

    for (let j = 0; j < badgesToGive; j++) {
      const badge = badges[j % badges.length];

      const existing = await prisma.userBadge.findFirst({
        where: {
          userId: user.id,
          badgeId: badge.id,
        },
      });

      if (!existing) {
        await prisma.userBadge.create({
          data: {
            userId: user.id,
            badgeId: badge.id,
            earnedAt: new Date(),
          },
        });
        badgeCount++;
      }
    }
  }

  console.log(`✅ 사용자 배지 ${badgeCount}개 지급 완료`);

  // ============================================
  // 7. 리뷰 생성
  // ============================================
  console.log('\n⭐ 리뷰 생성 중...');

  const reviewComments = [
    '정말 좋은 모임이었어요!',
    '다음에 또 참여하고 싶습니다',
    '호스트님이 친절하셨어요',
    '재미있는 시간이었습니다',
    '기대 이상이었어요',
  ];

  let reviewCount = 0;
  const completedGatherings = gatherings.filter(g => g.status === GatheringStatus.COMPLETED);

  for (let i = 0; i < Math.min(30, completedGatherings.length * 3); i++) {
    const gathering = completedGatherings[i % completedGatherings.length];
    const reviewer = regularUsers[i % regularUsers.length];
    const reviewee = regularUsers[(i + 5) % regularUsers.length];

    if (reviewer.id !== reviewee.id) {
      const existing = await prisma.review.findFirst({
        where: {
          gatheringId: gathering.id,
          reviewerId: reviewer.id,
          revieweeId: reviewee.id,
        },
      });

      if (!existing) {
        await prisma.review.create({
          data: {
            gatheringId: gathering.id,
            reviewerId: reviewer.id,
            revieweeId: reviewee.id,
            rating: Math.floor(Math.random() * 2) + 4, // 4-5점
            comment: reviewComments[i % reviewComments.length],
          },
        });
        reviewCount++;
      }
    }
  }

  console.log(`✅ 리뷰 ${reviewCount}개 생성 완료`);

  // ============================================
  // 8. 북마크 생성
  // ============================================
  console.log('\n🔖 북마크 생성 중...');

  let bookmarkCount = 0;
  for (let i = 0; i < 40; i++) {
    const user = regularUsers[i % regularUsers.length];
    const gathering = gatherings[(i + 3) % gatherings.length];

    const existing = await prisma.bookmark.findFirst({
      where: {
        userId: user.id,
        gatheringId: gathering.id,
      },
    });

    if (!existing) {
      await prisma.bookmark.create({
        data: {
          userId: user.id,
          gatheringId: gathering.id,
        },
      });
      bookmarkCount++;
    }
  }

  console.log(`✅ 북마크 ${bookmarkCount}개 생성 완료`);

  // ============================================
  // 9. 공지사항 생성
  // ============================================
  console.log('\n📢 공지사항 생성 중...');

  const noticeData = [
    { title: '모아 서비스 오픈!', content: '모아 서비스가 정식 오픈했습니다. 많은 이용 부탁드립니다.', isPinned: true },
    { title: '이용 약관 업데이트', content: '이용 약관이 업데이트되었습니다.', isPinned: false },
    { title: '신규 기능 안내', content: '배지 시스템이 추가되었습니다.', isPinned: false },
  ];

  for (const notice of noticeData) {
    await prisma.notice.create({
      data: {
        ...notice,
        createdBy: superAdmin.id,
        viewCount: Math.floor(Math.random() * 100),
      },
    });
  }

  console.log(`✅ 공지사항 ${noticeData.length}개 생성 완료`);

  // ============================================
  // 10. 배너 생성
  // ============================================
  console.log('\n🎨 배너 생성 중...');

  const now = new Date();
  const bannerData = [
    {
      type: BannerType.MAIN_TOP,
      title: '봄맞이 모임 이벤트',
      description: '새로운 사람들과 함께하는 봄나들이',
      imageUrl: 'https://picsum.photos/seed/banner1/1200/400',
      linkUrl: '/gatherings',
      startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      order: 1,
      createdBy: superAdmin.id,
    },
    {
      type: BannerType.MAIN_MIDDLE,
      title: '신규 회원 환영 이벤트',
      description: '첫 모임 참여 시 포인트 적립',
      imageUrl: 'https://picsum.photos/seed/banner2/1200/400',
      linkUrl: '/events',
      startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      order: 2,
      createdBy: superAdmin.id,
    },
  ];

  for (const banner of bannerData) {
    await prisma.banner.create({
      data: banner,
    });
  }

  console.log(`✅ 배너 ${bannerData.length}개 생성 완료`);

  // ============================================
  // 11. 팝업 생성
  // ============================================
  console.log('\n💬 팝업 생성 중...');

  await prisma.popup.create({
    data: {
      type: PopupType.MODAL,
      title: '모아 서비스 이용 안내',
      content: '모아를 이용해주셔서 감사합니다. 즐거운 모임 되세요!',
      imageUrl: 'https://picsum.photos/seed/popup1/600/400',
      linkUrl: '/guide',
      startDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdBy: superAdmin.id,
    },
  });

  console.log('✅ 팝업 1개 생성 완료');

  // ============================================
  // 완료
  // ============================================
  console.log('\n✨ 전체 더미 데이터 생성 완료!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 생성된 데이터 요약:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`👥 사용자: ${regularUsers.length + 3}명`);
  console.log(`   - 슈퍼관리자: 1명 (superadmin@moa.com)`);
  console.log(`   - 관리자: 1명 (admin@moa.com)`);
  console.log(`   - 모더레이터: 1명 (moderator@moa.com)`);
  console.log(`   - 일반 사용자: ${regularUsers.length}명`);
  console.log(`📁 카테고리: ${categories.length}개`);
  console.log(`👥 모임: ${gatherings.length}개`);
  console.log(`🙋 모임 참가: ${participantCount}건`);
  console.log(`🏅 배지: ${badges.length}개`);
  console.log(`🎖️ 사용자 배지: ${badgeCount}개`);
  console.log(`⭐ 리뷰: ${reviewCount}개`);
  console.log(`🔖 북마크: ${bookmarkCount}개`);
  console.log(`📢 공지사항: ${noticeData.length}개`);
  console.log(`🎨 배너: ${bannerData.length}개`);
  console.log(`💬 팝업: 1개`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n🔑 테스트 계정:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('슈퍼관리자: superadmin@moa.com / password123');
  console.log('관리자: admin@moa.com / password123');
  console.log('모더레이터: moderator@moa.com / password123');
  console.log('일반 사용자: user1@example.com ~ user20@example.com / password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
