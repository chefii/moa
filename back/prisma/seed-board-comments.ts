import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding board comments...');

  // Get users for comment authors
  const users = await prisma.user.findMany({
    take: 10,
  });

  if (users.length === 0) {
    console.log('❌ No users found. Please seed users first.');
    return;
  }

  // Get existing posts
  const posts = await prisma.boardPost.findMany({
    take: 10,
  });

  if (posts.length === 0) {
    console.log('❌ No posts found. Please run seed-board-posts first.');
    return;
  }

  // Sample comments and replies
  const commentsData = [
    {
      content: '정말 좋은 글이네요! 공감됩니다 👍',
      likeCount: 5,
    },
    {
      content: '저도 비슷한 경험이 있어서 정말 공감되네요',
      likeCount: 3,
    },
    {
      content: '유익한 정보 감사합니다!',
      likeCount: 8,
    },
    {
      content: '이런 관점도 있군요. 생각해볼 문제네요',
      likeCount: 2,
    },
    {
      content: '저도 궁금했던 내용인데 도움이 되었습니다',
      likeCount: 4,
    },
  ];

  const repliesData = [
    {
      content: '맞아요! 저도 그렇게 생각해요',
      likeCount: 2,
    },
    {
      content: '좋은 의견 감사합니다',
      likeCount: 1,
    },
    {
      content: '정보 공유 감사드립니다',
      likeCount: 3,
    },
    {
      content: '다음에도 좋은 글 부탁드려요!',
      likeCount: 1,
    },
    {
      content: '저는 조금 다르게 생각하는데요, 이런 경우는 어떨까요?',
      likeCount: 2,
    },
  ];

  let createdComments = 0;
  let createdReplies = 0;

  // Add comments to each post
  for (const post of posts) {
    // Add 2-4 comments per post
    const commentCount = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < commentCount; i++) {
      const commentData = commentsData[Math.floor(Math.random() * commentsData.length)];
      const author = users[Math.floor(Math.random() * users.length)];

      const comment = await prisma.boardComment.create({
        data: {
          postId: post.id,
          authorId: author.id,
          content: commentData.content,
          likeCount: commentData.likeCount,
          isAnonymous: Math.random() > 0.7, // 30% chance of being anonymous
        },
      });

      createdComments++;
      console.log(`✅ Created comment on post "${post.title.substring(0, 30)}..."`);

      // Add 1-3 replies to some comments (50% chance)
      if (Math.random() > 0.5) {
        const replyCount = Math.floor(Math.random() * 3) + 1;

        for (let j = 0; j < replyCount; j++) {
          const replyData = repliesData[Math.floor(Math.random() * repliesData.length)];
          const replyAuthor = users[Math.floor(Math.random() * users.length)];

          await prisma.boardComment.create({
            data: {
              postId: post.id,
              authorId: replyAuthor.id,
              parentId: comment.id,
              content: replyData.content,
              likeCount: replyData.likeCount,
              isAnonymous: Math.random() > 0.8, // 20% chance of being anonymous
            },
          });

          createdReplies++;
          console.log(`  ↳ Added reply to comment`);
        }
      }
    }

    // Update post's comment count
    const totalComments = await prisma.boardComment.count({
      where: {
        postId: post.id,
        isDeleted: false,
      },
    });

    await prisma.boardPost.update({
      where: { id: post.id },
      data: { commentCount: totalComments },
    });
  }

  console.log(`\n✅ Created ${createdComments} comments and ${createdReplies} replies successfully!`);
}

main()
  .catch((e) => {
    console.error('Error seeding board comments:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
