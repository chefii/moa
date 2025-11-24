import logger from '../../config/logger';
import { Router, Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     summary: 카테고리 목록 조회
 *     tags: [Admin - Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: 활성화 상태 필터
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
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 */
// Get all categories with hierarchy
router.get('/', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { isActive, includeChildren } = req.query;

    const where: any = {
      isDeleted: false, // 삭제된 카테고리 제외
    };
    if (isActive !== undefined) where.isActive = isActive === 'true';

    // 계층 구조로 조회하려면 최상위 카테고리만 가져오기
    if (includeChildren === 'true') {
      where.parentId = null;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { order: 'asc' },
      include: includeChildren === 'true' ? {
        children: {
          where: { isDeleted: false }, // 하위 카테고리도 삭제된 것 제외
          orderBy: { order: 'asc' },
        },
      } : undefined,
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    logger.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/categories:
 *   post:
 *     summary: 카테고리 생성
 *     tags: [Admin - Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 example: 스포츠
 *               slug:
 *                 type: string
 *                 example: sports
 *               icon:
 *                 type: string
 *                 example: sports_icon
 *               description:
 *                 type: string
 *                 example: 스포츠 관련 카테고리
 *               order:
 *                 type: integer
 *                 example: 1
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: 카테고리 생성 성공
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
 *       400:
 *         description: 필수 필드 누락
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 */
// Create category
router.post('/', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { name, displayName, slug, icon, color, description, order, isActive, parentId, type } = req.body;

    if (!name || !slug) {
      res.status(400).json({
        success: false,
        message: 'Name and slug are required',
      });
      return;
    }

    // parentId가 있으면 depth=1, 없으면 depth=0
    const depth = parentId ? 1 : 0;

    // 부모 카테고리의 type을 상속받기
    let categoryType = type || [];
    if (parentId && (!type || type.length === 0)) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
        select: { type: true, slug: true },
      });

      // 특별 케이스: 게시판의 하위 카테고리는 BOARD 타입을 가져야 함
      if (parent && parent.slug === 'board') {
        categoryType = ['BOARD'];
      } else if (parent && parent.type) {
        categoryType = parent.type;
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        displayName,
        slug,
        icon,
        color,
        description,
        parentId,
        depth,
        order: order || 0,
        type: categoryType,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    logger.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   put:
 *     summary: 카테고리 수정
 *     tags: [Admin - Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 카테고리 ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               icon:
 *                 type: string
 *               description:
 *                 type: string
 *               order:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 카테고리 수정 성공
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
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 카테고리를 찾을 수 없음
 */
// Update category
router.put('/:id', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, displayName, slug, icon, color, description, order, isActive, parentId, type } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (slug !== undefined) updateData.slug = slug;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (type !== undefined) updateData.type = type;

    // parentId가 변경되면 depth도 업데이트
    if (parentId !== undefined) {
      updateData.parentId = parentId;
      updateData.depth = parentId ? 1 : 0;
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        parent: true,
        children: true,
      },
    });

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    logger.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   delete:
 *     summary: 카테고리 삭제
 *     tags: [Admin - Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 카테고리 ID
 *     responses:
 *       200:
 *         description: 카테고리 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Category deleted successfully
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 카테고리를 찾을 수 없음
 */
// Delete category
router.delete('/:id', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.category.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    logger.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
