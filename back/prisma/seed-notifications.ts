import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding notifications...');

  // Get admin user
  const adminUser = await prisma.user.findFirst({
    where: { email: 'asdf@asdf.com' },
  });

  if (!adminUser) {
    console.log('❌ Admin user not found. Please create admin user first.');
    return;
  }

  // Delete existing notifications
  await prisma.notificationRead.deleteMany({});
  await prisma.notification.deleteMany({});

  // Create global notifications (visible to all users)
  const globalNotifications = [
    {
      type: 'SYSTEM',
      title: '🎉 모아 서비스 정식 오픈!',
      content: '관심사로 모이는 사람들, 모아가 정식 오픈했습니다. 많은 이용 부탁드립니다!',
      priority: 10,
    },
    {
      type: 'ANNOUNCEMENT',
      title: '📢 새로운 기능 업데이트',
      content: '알림 시스템이 추가되었습니다. 이제 중요한 소식을 놓치지 마세요!',
      priority: 5,
    },
    {
      type: 'MAINTENANCE',
      title: '⚙️ 정기 점검 안내',
      content: '매주 화요일 새벽 2시~4시 정기 점검이 진행됩니다.',
      priority: 3,
    },
  ];

  // Create user-specific notifications
  const userNotifications = [
    {
      userId: adminUser.id,
      type: 'GATHERING',
      title: '🎪 새로운 모임 초대',
      content: '서울 맛집 탐방 모임에 초대되었습니다.',
      link: '/gatherings/1',
      priority: 7,
    },
    {
      userId: adminUser.id,
      type: 'REPORT',
      title: '⚠️ 신고 내역 확인 필요',
      content: '처리 대기중인 신고가 5건 있습니다.',
      link: '/admin/reports',
      priority: 8,
    },
    {
      userId: adminUser.id,
      type: 'COMMENT',
      title: '💬 새로운 댓글',
      content: '회원님의 게시글에 새로운 댓글이 달렸습니다.',
      link: '/posts/1',
      priority: 4,
    },
    {
      userId: adminUser.id,
      type: 'LEVEL_UP',
      title: '🎖️ 레벨업 축하합니다!',
      content: 'Level 2로 레벨업했습니다. 새로운 뱃지를 획득하셨습니다.',
      priority: 6,
    },
  ];

  // Insert global notifications
  for (const notification of globalNotifications) {
    await prisma.notification.create({
      data: notification,
    });
    console.log(`✅ Created global notification: ${notification.title}`);
  }

  // Insert user-specific notifications
  for (const notification of userNotifications) {
    await prisma.notification.create({
      data: notification,
    });
    console.log(`✅ Created user notification: ${notification.title}`);
  }

  console.log('\n✨ Notifications seeding completed!');
  console.log(`📊 Total notifications: ${globalNotifications.length + userNotifications.length}`);
  console.log(`   - Global: ${globalNotifications.length}`);
  console.log(`   - User-specific: ${userNotifications.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding notifications:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
