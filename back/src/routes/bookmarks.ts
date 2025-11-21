import logger from '../config/logger';
import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { authenticate } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /api/bookmarks/{gatheringId}:
 *   post:
 *     summary: 모임 북마크 추가
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gatheringId
 *         required: true
 *         schema:
 *           type: string
 *         description: 모임 ID
 *     responses:
 *       201:
 *         description: 북마크 추가 성공
 *       400:
 *         description: 이미 북마크된 모임
 *       401:
 *         description: 인증 필요
 */
router.post('/:gatheringId', authenticate, async (req: Request, res: Response) => {
  try {
    const { gatheringId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User ID is required',
      });
      return;
    }

    // Check if gathering exists
    const gathering = await prisma.gathering.findUnique({
      where: { id: gatheringId },
    });

    if (!gathering) {
      res.status(404).json({
        success: false,
        message: 'Gathering not found',
      });
      return;
    }

    // Check if already bookmarked
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_gatheringId: {
          userId,
          gatheringId,
        },
      },
    });

    if (existingBookmark) {
      res.status(400).json({
        success: false,
        message: 'Already bookmarked',
      });
      return;
    }

    // Create bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        userId,
        gatheringId,
      },
    });

    res.status(201).json({
      success: true,
      data: bookmark,
    });
  } catch (error) {
    logger.error('Add bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add bookmark',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/bookmarks/{gatheringId}:
 *   delete:
 *     summary: 모임 북마크 삭제
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gatheringId
 *         required: true
 *         schema:
 *           type: string
 *         description: 모임 ID
 *     responses:
 *       200:
 *         description: 북마크 삭제 성공
 *       404:
 *         description: 북마크를 찾을 수 없음
 *       401:
 *         description: 인증 필요
 */
router.delete('/:gatheringId', authenticate, async (req: Request, res: Response) => {
  try {
    const { gatheringId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User ID is required',
      });
      return;
    }

    // Delete bookmark
    const bookmark = await prisma.bookmark.deleteMany({
      where: {
        userId,
        gatheringId,
      },
    });

    if (bookmark.count === 0) {
      res.status(404).json({
        success: false,
        message: 'Bookmark not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Bookmark removed',
    });
  } catch (error) {
    logger.error('Remove bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove bookmark',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/bookmarks/{gatheringId}/check:
 *   get:
 *     summary: 모임 북마크 여부 확인
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gatheringId
 *         required: true
 *         schema:
 *           type: string
 *         description: 모임 ID
 *     responses:
 *       200:
 *         description: 북마크 여부 확인 성공
 *       401:
 *         description: 인증 필요
 */
router.get('/:gatheringId/check', authenticate, async (req: Request, res: Response) => {
  try {
    const { gatheringId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User ID is required',
      });
      return;
    }

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_gatheringId: {
          userId,
          gatheringId,
        },
      },
    });

    res.json({
      success: true,
      data: {
        isBookmarked: !!bookmark,
      },
    });
  } catch (error) {
    logger.error('Check bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check bookmark',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/bookmarks:
 *   get:
 *     summary: 내 북마크 목록 조회
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 페이지당 항목 수
 *     responses:
 *       200:
 *         description: 북마크 목록 조회 성공
 *       401:
 *         description: 인증 필요
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User ID is required',
      });
      return;
    }

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId },
        include: {
          gathering: {
            include: {
              host: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true,
                },
              },
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.bookmark.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: bookmarks,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Get bookmarks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookmarks',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
