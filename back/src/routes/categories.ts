import logger from '../config/logger';
import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';

const router = Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: 전체 카테고리 목록 조회
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: 카테고리 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                         example: 스포츠
 *                       slug:
 *                         type: string
 *                         example: sports
 *                       icon:
 *                         type: string
 *                       color:
 *                         type: string
 *                       description:
 *                         type: string
 *                       order:
 *                         type: number
 *       500:
 *         description: 서버 오류
 */
// Get all categories (for interests selection)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, featured } = req.query;

    const whereClause: any = {
      isActive: true,
      isDeleted: false,
    };

    // Filter by type if provided
    if (type && typeof type === 'string') {
      // BOARD 타입은 1뎁스 카테고리로 직접 필터링
      if (type === 'BOARD') {
        whereClause.type = {
          has: type,
        };
      } else {
        // 다른 타입은 부모 카테고리의 type으로 필터링하여 2뎁스 카테고리 반환
        whereClause.depth = 1;
        whereClause.parent = {
          type: {
            has: type,
          },
        };
      }
    }

    // Filter by featured if provided
    if (featured === 'true') {
      whereClause.isFeatured = true;
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      orderBy: { order: 'asc' },
      include: {
        parent: {
          select: {
            type: true,
          },
        },
        _count: {
          select: {
            gatherings: true,
          },
        },
      },
    });

    const formattedCategories = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      displayName: cat.displayName,
      slug: cat.slug,
      icon: cat.icon,
      color: cat.color,
      imageUrl: cat.imageUrl,
      description: cat.description,
      order: cat.order,
      type: cat.type,
      isFeatured: cat.isFeatured,
      _count: cat._count,
    }));

    res.json({
      success: true,
      data: formattedCategories,
    });
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
    });
  }
});

/**
 * @swagger
 * /api/categories/{slug}:
 *   get:
 *     summary: 특정 카테고리 조회 (slug 기반)
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: 카테고리 slug
 *         example: sports
 *     responses:
 *       200:
 *         description: 카테고리 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     slug:
 *                       type: string
 *                     icon:
 *                       type: string
 *                     color:
 *                       type: string
 *                     description:
 *                       type: string
 *                     order:
 *                       type: number
 *       404:
 *         description: 카테고리를 찾을 수 없음
 */
// Get category by slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    // Since slug is no longer unique (slug + parentId is unique),
    // we find the first matching category, prioritizing top-level (parentId = null)
    const category = await prisma.category.findFirst({
      where: {
        slug,
        isActive: true,
      },
      orderBy: {
        depth: 'asc', // Prioritize top-level categories (depth = 0)
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        slug: true,
        icon: true,
        color: true,
        imageUrl: true,
        description: true,
        order: true,
        depth: true,
        parentId: true,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    logger.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
    });
  }
});

export default router;
