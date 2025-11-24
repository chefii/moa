import logger from '../../config/logger';
import { Router, Request, Response } from 'express';
import { BoardPostStatus } from '@prisma/client';
import { authenticate, authorize, optionalAuthenticate } from '../../middlewares/auth';
import { prisma } from '../../config/prisma';

const router = Router();

/**
 * @swagger
 * /api/board/posts:
 *   get:
 *     summary: 게시글 목록 조회
 *     tags: [Board]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 게시글 목록 조회 성공
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const categoryId = req.query.categoryId as string;
    const search = req.query.search as string;
    const sort = req.query.sort as string || 'recent'; // recent, popular, views
    const skip = (page - 1) * limit;

    const where: any = {
      status: BoardPostStatus.PUBLISHED,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Determine sorting order
    let orderBy: any[] = [{ isPinned: 'desc' }];

    switch (sort) {
      case 'popular':
        orderBy.push({ likeCount: 'desc' });
        orderBy.push({ createdAt: 'desc' }); // Secondary sort
        break;
      case 'views':
        orderBy.push({ viewCount: 'desc' });
        orderBy.push({ createdAt: 'desc' }); // Secondary sort
        break;
      case 'recent':
      default:
        orderBy.push({ createdAt: 'desc' });
        break;
    }

    const [posts, total] = await Promise.all([
      prisma.boardPost.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
              profileImageId: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              displayName: true,
              slug: true,
              color: true,
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      }),
      prisma.boardPost.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching board posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch board posts',
    });
  }
});

/**
 * @swagger
 * /api/board/posts/{id}:
 *   get:
 *     summary: 게시글 상세 조회
 *     tags: [Board]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 게시글 상세 조회 성공
 *       404:
 *         description: 게시글을 찾을 수 없음
 */
router.get('/:id', optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId; // Optional: may be undefined if not authenticated
    logger.info(`[GET /posts/${id}] Full user object:`, (req as any).user);
    logger.info(`[GET /posts/${id}] userId from token: ${userId}`);
    logger.info(`[GET /posts/${id}] Authorization header:`, req.headers.authorization?.substring(0, 30) + '...');

    const post = await prisma.boardPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            profileImageId: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            displayName: true,
            slug: true,
            color: true,
          },
        },
        comments: {
          where: {
            isDeleted: false,
            parentId: null,
          },
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                nickname: true,
                profileImageId: true,
              },
            },
            replies: {
              where: { isDeleted: false },
              orderBy: { createdAt: 'asc' },
              include: {
                author: {
                  select: {
                    id: true,
                    nickname: true,
                    profileImageId: true,
                  },
                },
                replies: {
                  where: { isDeleted: false },
                  orderBy: { createdAt: 'asc' },
                  include: {
                    author: {
                      select: {
                        id: true,
                        nickname: true,
                        profileImageId: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Increment view count and return updated data
    const updatedPost = await prisma.boardPost.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true },
    });

    // Merge updated view count with post data
    post.viewCount = updatedPost.viewCount;

    // Check if current user liked this post
    let isLiked = false;
    if (userId) {
      logger.info(`[GET /posts/${id}] Checking like status for userId: ${userId}, postId: ${id}`);
      const userLike = await prisma.boardPostLike.findUnique({
        where: {
          postId_userId: {
            postId: id,
            userId,
          },
        },
      });
      isLiked = !!userLike;
      logger.info(`[GET /posts/${id}] userLike record:`, userLike);
      logger.info(`[GET /posts/${id}] User ${userId} isLiked for post ${id}: ${isLiked}`);
    } else {
      logger.info(`[GET /posts/${id}] No userId - skipping like check`);
    }

    // Check if current user liked any comments (including nested replies)
    let commentsWithLikeStatus = post.comments;
    if (userId && post.comments && post.comments.length > 0) {
      // Get all comment IDs (including nested replies)
      const getAllCommentIds = (comments: any[]): string[] => {
        const ids: string[] = [];
        for (const comment of comments) {
          ids.push(comment.id);
          if (comment.replies && comment.replies.length > 0) {
            ids.push(...getAllCommentIds(comment.replies));
          }
        }
        return ids;
      };

      const allCommentIds = getAllCommentIds(post.comments);

      // Fetch all comment likes for this user in one query
      const userCommentLikes = await prisma.boardCommentLike.findMany({
        where: {
          userId,
          commentId: { in: allCommentIds },
        },
        select: {
          commentId: true,
        },
      });

      // Create a Set for O(1) lookup
      const likedCommentIds = new Set(userCommentLikes.map(like => like.commentId));

      // Recursively add isLiked to all comments and replies
      const addIsLikedToComments = (comments: any[]): any[] => {
        return comments.map(comment => ({
          ...comment,
          isLiked: likedCommentIds.has(comment.id),
          replies: comment.replies ? addIsLikedToComments(comment.replies) : undefined,
        }));
      };

      commentsWithLikeStatus = addIsLikedToComments(post.comments);
    }

    res.json({
      success: true,
      data: {
        ...post,
        isLiked,
        comments: commentsWithLikeStatus,
      },
    });
  } catch (error) {
    logger.error('Error fetching board post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch board post',
    });
  }
});

/**
 * @swagger
 * /api/board/posts:
 *   post:
 *     summary: 게시글 작성
 *     tags: [Board]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: 게시글 작성 성공
 *       401:
 *         description: 인증 필요
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { title, content, categoryId, images } = req.body;
    const userId = (req as any).user.userId;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
    }

    const post = await prisma.boardPost.create({
      data: {
        title,
        content,
        authorId: userId,
        categoryId: categoryId || null,
        images: images || [],
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            profileImageId: true,
          },
        },
        category: true,
      },
    });

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    logger.error('Error creating board post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create board post',
    });
  }
});

/**
 * @swagger
 * /api/board/posts/{id}:
 *   put:
 *     summary: 게시글 수정
 *     tags: [Board]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 게시글 수정 성공
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 게시글을 찾을 수 없음
 */
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, categoryId, images } = req.body;
    const userId = (req as any).user.userId;

    const post = await prisma.boardPost.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own posts',
      });
    }

    const updatedPost = await prisma.boardPost.update({
      where: { id },
      data: {
        title,
        content,
        categoryId: categoryId || null,
        images: images || post.images,
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            profileImageId: true,
          },
        },
        category: true,
      },
    });

    res.json({
      success: true,
      data: updatedPost,
    });
  } catch (error) {
    logger.error('Error updating board post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update board post',
    });
  }
});

/**
 * @swagger
 * /api/board/posts/{id}:
 *   delete:
 *     summary: 게시글 삭제
 *     tags: [Board]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 게시글 삭제 성공
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 게시글을 찾을 수 없음
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const post = await prisma.boardPost.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts',
      });
    }

    await prisma.boardPost.update({
      where: { id },
      data: { status: BoardPostStatus.DELETED },
    });

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting board post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete board post',
    });
  }
});

/**
 * @swagger
 * /api/board/posts/{id}/like:
 *   post:
 *     summary: 게시글 좋아요
 *     tags: [Board]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 좋아요 성공
 *       401:
 *         description: 인증 필요
 */
router.post('/:id/like', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    // Check if already liked
    const existingLike = await prisma.boardPostLike.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      const [, updatedPost] = await prisma.$transaction([
        prisma.boardPostLike.delete({
          where: { id: existingLike.id },
        }),
        prisma.boardPost.update({
          where: { id },
          data: { likeCount: { decrement: 1 } },
          select: { likeCount: true },
        }),
      ]);

      return res.json({
        success: true,
        data: {
          liked: false,
          likeCount: updatedPost.likeCount,
        },
      });
    } else {
      // Like
      const [, updatedPost] = await prisma.$transaction([
        prisma.boardPostLike.create({
          data: {
            postId: id,
            userId,
          },
        }),
        prisma.boardPost.update({
          where: { id },
          data: { likeCount: { increment: 1 } },
          select: { likeCount: true },
        }),
      ]);

      return res.json({
        success: true,
        data: {
          liked: true,
          likeCount: updatedPost.likeCount,
        },
      });
    }
  } catch (error) {
    logger.error('Error toggling post like:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle post like',
    });
  }
});

export default router;
