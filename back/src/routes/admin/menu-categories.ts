import logger from '../../config/logger';
import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../../middlewares/auth';
import { prisma } from '../../config/prisma';

const router = Router();

/**
 * @swagger
 * /api/admin/menu-categories:
 *   get:
 *     summary: 메뉴 카테고리 목록 조회 (하위 메뉴 포함)
 *     tags: [Admin - Menu Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         description: 비활성 카테고리 포함 여부
 *     responses:
 *       200:
 *         description: 메뉴 카테고리 목록 조회 성공
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
// Get all menu categories with menu items
router.get(
  '/',
  authenticate,
  authorize('ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const { includeInactive } = req.query;

      const where = includeInactive === 'true' ? {} : { isActive: true };

      const categories = await prisma.menuCategory.findMany({
        where,
        include: {
          menuItems: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      });

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      logger.error('Error fetching menu categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch menu categories',
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/menu-categories/{id}:
 *   get:
 *     summary: 메뉴 카테고리 상세 조회
 *     tags: [Admin - Menu Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 메뉴 카테고리 ID
 *     responses:
 *       200:
 *         description: 메뉴 카테고리 상세 조회 성공
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
 *         description: 메뉴 카테고리를 찾을 수 없음
 */
// Get single menu category
router.get(
  '/:id',
  authenticate,
  authorize('ROLE_SUPER_ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const category = await prisma.menuCategory.findUnique({
        where: { id },
        include: {
          menuItems: {
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Menu category not found',
        });
      }

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      logger.error('Error fetching menu category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch menu category',
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/menu-categories:
 *   post:
 *     summary: 메뉴 카테고리 생성
 *     tags: [Admin - Menu Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: 시스템 관리
 *               nameEn:
 *                 type: string
 *                 example: System
 *               icon:
 *                 type: string
 *                 example: settings_icon
 *               order:
 *                 type: integer
 *                 example: 1
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               description:
 *                 type: string
 *                 example: 시스템 관리 메뉴
 *               requiredRoles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["SUPER_ADMIN"]
 *     responses:
 *       201:
 *         description: 메뉴 카테고리 생성 성공
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
 */
// Create menu category
router.post(
  '/',
  authenticate,
  authorize('ROLE_SUPER_ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const { name, nameEn, icon, order, isActive, description, requiredRoles } = req.body;

      const category = await prisma.menuCategory.create({
        data: {
          name,
          nameEn,
          icon,
          order: order || 0,
          isActive: isActive !== undefined ? isActive : true,
          description,
          requiredRoles: requiredRoles || [],
        },
      });

      res.status(201).json({
        success: true,
        data: category,
      });
    } catch (error) {
      logger.error('Error creating menu category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create menu category',
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/menu-categories/{id}:
 *   put:
 *     summary: 메뉴 카테고리 수정
 *     tags: [Admin - Menu Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 메뉴 카테고리 ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               nameEn:
 *                 type: string
 *               icon:
 *                 type: string
 *               order:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *               description:
 *                 type: string
 *               requiredRoles:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 메뉴 카테고리 수정 성공
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
 *         description: 메뉴 카테고리를 찾을 수 없음
 */
// Update menu category
router.put(
  '/:id',
  authenticate,
  authorize('ROLE_SUPER_ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, nameEn, icon, order, isActive, description, requiredRoles } = req.body;

      const category = await prisma.menuCategory.update({
        where: { id },
        data: {
          name,
          nameEn,
          icon,
          order,
          isActive,
          description,
          requiredRoles,
        },
      });

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      logger.error('Error updating menu category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update menu category',
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/menu-categories/{id}:
 *   delete:
 *     summary: 메뉴 카테고리 삭제
 *     tags: [Admin - Menu Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 메뉴 카테고리 ID
 *     responses:
 *       200:
 *         description: 메뉴 카테고리 삭제 성공
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
 *                   example: Menu category deleted successfully
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 메뉴 카테고리를 찾을 수 없음
 */
// Delete menu category
router.delete(
  '/:id',
  authenticate,
  authorize('ROLE_SUPER_ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await prisma.menuCategory.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      res.json({
        success: true,
        message: 'Menu category deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting menu category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete menu category',
      });
    }
  }
);

export default router;
