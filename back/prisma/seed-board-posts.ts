import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding board posts...');

  // Get users for authors
  const users = await prisma.user.findMany({
    take: 10,
  });

  if (users.length === 0) {
    console.log('❌ No users found. Please seed users first.');
    return;
  }

  // Get board categories
  const categories = await prisma.category.findMany({
    where: {
      type: { has: 'BOARD' },
    },
  });

  if (categories.length === 0) {
    console.log('❌ No board categories found. Please run seed-board-categories first.');
    return;
  }

  const posts = [
    // 자유게시판
    {
      title: '오늘 날씨 정말 좋네요! 🌞',
      content: '산책하기 딱 좋은 날씨인데 혹시 같이 한강 산책하실 분 계신가요? 저는 여의도 쪽에 있습니다!',
      categorySlug: 'board-free',
      viewCount: 142,
      likeCount: 23,
    },
    {
      title: '요즘 재밌게 본 넷플릭스 추천해주세요',
      content: '주말에 집에서 쉬면서 볼만한 드라마나 영화 추천 부탁드립니다! 장르 불문하고 재밌으면 됩니다 😊',
      categorySlug: 'board-free',
      viewCount: 203,
      likeCount: 45,
    },
    {
      title: '서울 근교 당일치기 여행 추천',
      content: '이번 주말에 당일치기로 다녀올만한 곳 추천해주세요. 대중교통으로 갈 수 있으면 좋겠어요!',
      categorySlug: 'board-free',
      viewCount: 178,
      likeCount: 31,
    },
    {
      title: '추운 날씨에 뭐 먹을까요?',
      content: '갑자기 추워진 날씨에 생각나는 음식 있나요? 저는 뜨끈한 국물 요리가 땡기네요!',
      categorySlug: 'board-free',
      viewCount: 95,
      likeCount: 18,
    },

    // 질문/답변
    {
      title: '모임 첫 참여인데 준비물이 있나요?',
      content: '이번주에 처음으로 독서 모임 참여하는데 책 말고 따로 준비할 게 있을까요?',
      categorySlug: 'board-qna',
      viewCount: 156,
      likeCount: 12,
    },
    {
      title: '신뢰도 점수는 어떻게 올리나요?',
      content: '모임 플랫폼 처음 사용하는데 신뢰도 점수가 중요한가요? 어떻게 올릴 수 있는지 궁금합니다!',
      categorySlug: 'board-qna',
      viewCount: 389,
      likeCount: 28,
    },
    {
      title: '모임 취소하면 패널티가 있나요?',
      content: '급한 일이 생겨서 참여 신청한 모임을 취소해야 할 것 같은데, 패널티가 있을까요?',
      categorySlug: 'board-qna',
      viewCount: 234,
      likeCount: 15,
    },

    // 정보공유
    {
      title: '강남 맛집 대박이네요! 🍜',
      content: '어제 강남역 근처 라멘집 갔는데 진짜 맛있더라구요! 이름은 "타로멘"이에요. 츠케멘 강추합니다!',
      categorySlug: 'board-info',
      viewCount: 324,
      likeCount: 89,
    },
    {
      title: '홍대 브런치 카페 추천',
      content: '홍대에서 브런치 맛집 찾고 있는데 추천해주실 곳 있나요? 인스타 감성 있으면 더 좋아요!',
      categorySlug: 'board-info',
      viewCount: 256,
      likeCount: 43,
    },
    {
      title: '이태원 이탈리안 레스토랑 후기',
      content: '친구 생일에 다녀왔는데 분위기도 좋고 파스타가 정말 맛있었어요. 가격은 좀 있지만 특별한 날 가기 좋습니다!',
      categorySlug: 'board-info',
      viewCount: 198,
      likeCount: 56,
    },

    // 후기/리뷰
    {
      title: '지난주 등산 모임 후기 🏔️',
      content: '날씨도 좋고 멤버분들도 너무 좋으셔서 정말 즐거운 시간이었습니다! 다음에도 또 함께하고 싶어요!',
      categorySlug: 'board-review',
      viewCount: 167,
      likeCount: 78,
    },
    {
      title: '요리 모임 참여 후기 👨‍🍳',
      content: '처음 참여했는데 다들 친절하시고 요리도 맛있게 잘 만들었어요. 초보자도 부담없이 참여할 수 있습니다!',
      categorySlug: 'board-review',
      viewCount: 234,
      likeCount: 92,
    },
    {
      title: '독서 모임 정말 알차네요! 📚',
      content: '매주 참여하고 있는데 책도 많이 읽게 되고 다양한 생각도 나눌 수 있어서 좋습니다!',
      categorySlug: 'board-review',
      viewCount: 145,
      likeCount: 67,
    },

    // 구인구직
    {
      title: '[구인] 스타트업 프론트엔드 개발자 구합니다',
      content: 'React/Next.js 경험이 있으신 분을 찾습니다. 관심 있으신 분은 연락주세요!',
      categorySlug: 'board-job',
      viewCount: 523,
      likeCount: 34,
    },
    {
      title: '[구직] 디자이너 일자리 찾습니다',
      content: 'UI/UX 디자인 경력 3년차입니다. 좋은 기회 있으면 알려주세요!',
      categorySlug: 'board-job',
      viewCount: 412,
      likeCount: 28,
    },

    // 장터
    {
      title: '아이패드 프로 11인치 판매합니다',
      content: '2021년형 아이패드 프로 11인치 256GB 판매합니다. 거의 새것이고 케이스, 애플펜슬 포함입니다.',
      categorySlug: 'board-market',
      viewCount: 678,
      likeCount: 45,
    },
    {
      title: '캠핑 장비 일괄 판매',
      content: '텐트, 침낭, 버너 등 캠핑 장비 일괄 판매합니다. 관심 있으신 분 연락주세요!',
      categorySlug: 'board-market',
      viewCount: 389,
      likeCount: 23,
    },

    // 익명게시판
    {
      title: '회사 그만두고 싶은데 용기가 안 나요',
      content: '5년차 직장인인데 요즘 너무 힘들어서 퇴사를 고민하고 있습니다. 하지만 막상 나가려니 걱정되는 것도 많고... 혹시 비슷한 경험 있으신 분 계신가요?',
      categorySlug: 'board-anonymous',
      isAnonymous: true,
      viewCount: 892,
      likeCount: 156,
    },
    {
      title: '면접에서 거짓말 한 것 같아서 불안해요',
      content: '어제 면접 봤는데 너무 긴장해서 경력을 좀 부풀려 말한 것 같습니다. 합격하면 어떻게 하죠? 양심의 가책이 드네요...',
      categorySlug: 'board-anonymous',
      isAnonymous: true,
      viewCount: 1243,
      likeCount: 89,
    },
    {
      title: '연애 경험이 없는데 이상한가요?',
      content: '30대인데 연애를 한 번도 안 해봤습니다. 주변에서 이상하게 보는 것 같아서 스트레스 받네요. 저만 이런가요?',
      categorySlug: 'board-anonymous',
      isAnonymous: true,
      viewCount: 756,
      likeCount: 234,
    },
    {
      title: '상사한테 욕 들었는데 너무 억울해요',
      content: '오늘 회의에서 상사한테 인신공격성 발언을 들었습니다. 정말 억울한데 어떻게 대응해야 할지 모르겠어요...',
      categorySlug: 'board-anonymous',
      isAnonymous: true,
      viewCount: 623,
      likeCount: 178,
    },
    {
      title: '친구가 돈을 안 갚는데 어떻게 해야 할까요',
      content: '친한 친구한테 500만원을 빌려줬는데 갚을 생각을 안 하네요. 계속 말하면 관계가 틀어질 것 같고... 어떻게 해야 할까요?',
      categorySlug: 'board-anonymous',
      isAnonymous: true,
      viewCount: 1089,
      likeCount: 267,
    },
    {
      title: '가족이랑 연락 끊고 살고 싶어요',
      content: '가족 관계가 너무 힘듭니다. 차라리 연락 끊고 살면 편할 것 같은데, 그래도 되는 걸까요? 같은 고민 있으신 분 계신가요?',
      categorySlug: 'board-anonymous',
      isAnonymous: true,
      viewCount: 567,
      likeCount: 123,
    },
  ];

  let createdCount = 0;

  for (let i = 0; i < posts.length; i++) {
    const postData = posts[i];
    const category = categories.find((c) => c.slug === postData.categorySlug);

    if (!category) {
      console.log(`⚠️  Category ${postData.categorySlug} not found, skipping...`);
      continue;
    }

    // Randomly select an author (공지사항은 첫 번째 유저가 작성)
    const author = postData.categorySlug === 'notice-board' ? users[0] : users[Math.floor(Math.random() * users.length)];

    // Check if post already exists
    const existing = await prisma.boardPost.findFirst({
      where: {
        title: postData.title,
      },
    });

    if (existing) {
      console.log(`⏭️  Post "${postData.title}" already exists, skipping...`);
      continue;
    }

    await prisma.boardPost.create({
      data: {
        title: postData.title,
        content: postData.content,
        authorId: author.id,
        categoryId: category.id,
        status: 'PUBLISHED',
        viewCount: postData.viewCount || 0,
        likeCount: postData.likeCount || 0,
        commentCount: 0,
        isAnonymous: postData.isAnonymous || false,
      },
    });

    createdCount++;
    console.log(`✅ Created post: "${postData.title}"`);
  }

  console.log(`\n✅ Created ${createdCount} board posts successfully!`);
}

main()
  .catch((e) => {
    console.error('Error seeding board posts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
