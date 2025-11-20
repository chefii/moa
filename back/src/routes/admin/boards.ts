import { Router, Request, Response } from 'express';
import { prisma } from '../../main';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /api/admin/boards:
 *   get:
 *     summary: 게시글 목록 조회 (관리자)
 *     tags: [Admin - Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: 카테고리 ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 검색어
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, DELETED, HIDDEN]
 *         description: 게시글 상태
 */
router.get('/', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_CONTENT_MANAGER'), async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      categoryId,
      search,
      status,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (categoryId && typeof categoryId === 'string') {
      where.categoryId = categoryId;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && typeof status === 'string') {
      where.status = status;
    }

    const [posts, total] = await Promise.all([
      prisma.boardPost.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              nickname: true,
              email: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              displayName: true,
              color: true,
            },
          },
        },
      }),
      prisma.boardPost.count({ where }),
    ]);

    res.json({
      success: true,
      data: posts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get board posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch board posts',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/boards/{id}:
 *   get:
 *     summary: 게시글 상세 조회 (관리자)
 *     tags: [Admin - Boards]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_CONTENT_MANAGER'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await prisma.boardPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            nickname: true,
            email: true,
            profileImage: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            displayName: true,
            color: true,
          },
        },
      },
    });

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Post not found',
      });
      return;
    }

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Get board post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch board post',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/boards/{id}/status:
 *   patch:
 *     summary: 게시글 상태 변경
 *     tags: [Admin - Boards]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/status', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_CONTENT_MANAGER'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['PUBLISHED', 'DELETED', 'HIDDEN'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
      return;
    }

    const post = await prisma.boardPost.update({
      where: { id },
      data: { status },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            nickname: true,
          },
        },
        category: true,
      },
    });

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Update post status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/boards/{id}:
 *   delete:
 *     summary: 게시글 삭제
 *     tags: [Admin - Boards]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_CONTENT_MANAGER'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Soft delete - change status to DELETED
    await prisma.boardPost.update({
      where: { id },
      data: { status: 'DELETED' },
    });

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/boards/stats:
 *   get:
 *     summary: 게시판 통계 조회
 *     tags: [Admin - Boards]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats/overview', authenticate, authorize('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_CONTENT_MANAGER'), async (req: Request, res: Response) => {
  try {
    const [totalPosts, activePosts, deletedPosts, hiddenPosts, totalComments, totalLikes] = await Promise.all([
      prisma.boardPost.count(),
      prisma.boardPost.count({ where: { status: 'PUBLISHED' } }),
      prisma.boardPost.count({ where: { status: 'DELETED' } }),
      prisma.boardPost.count({ where: { status: 'HIDDEN' } }),
      prisma.boardComment.count(),
      prisma.boardPostLike.count(),
    ]);

    res.json({
      success: true,
      data: {
        totalPosts,
        activePosts,
        deletedPosts,
        hiddenPosts,
        totalComments,
        totalLikes,
      },
    });
  } catch (error) {
    console.error('Get board stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch board stats',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
