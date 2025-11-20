import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/admin/menu-items:
 *   get:
 *     summary: 메뉴 항목 목록 조회
 *     tags: [Admin - Menu Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: 메뉴 카테고리 ID 필터
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         description: 비활성 항목 포함 여부
 *     responses:
 *       200:
 *         description: 메뉴 항목 목록 조회 성공
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
// Get all menu items
router.get(
  '/',
  authenticate,
  authorize('ROLE_SUPER_ADMIN', 'ROLE_BUSINESS_ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const { categoryId, includeInactive } = req.query;

      const where: any = {};
      if (categoryId) {
        where.categoryId = categoryId as string;
      }
      if (includeInactive !== 'true') {
        where.isActive = true;
      }

      const menuItems = await prisma.menuItem.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { order: 'asc' },
      });

      res.json({
        success: true,
        data: menuItems,
      });
    } catch (error) {
      console.error('Error fetching menu items:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch menu items',
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/menu-items/{id}:
 *   get:
 *     summary: 메뉴 항목 상세 조회
 *     tags: [Admin - Menu Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 메뉴 항목 ID
 *     responses:
 *       200:
 *         description: 메뉴 항목 상세 조회 성공
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
 *         description: 메뉴 항목을 찾을 수 없음
 */
// Get single menu item
router.get(
  '/:id',
  authenticate,
  authorize('ROLE_SUPER_ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const menuItem = await prisma.menuItem.findUnique({
        where: { id },
        include: {
          category: true,
        },
      });

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found',
        });
      }

      res.json({
        success: true,
        data: menuItem,
      });
    } catch (error) {
      console.error('Error fetching menu item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch menu item',
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/menu-items:
 *   post:
 *     summary: 메뉴 항목 생성
 *     tags: [Admin - Menu Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *                 example: category-id
 *               name:
 *                 type: string
 *                 example: 대시보드
 *               nameEn:
 *                 type: string
 *                 example: Dashboard
 *               path:
 *                 type: string
 *                 example: /admin/dashboard
 *               icon:
 *                 type: string
 *                 example: dashboard_icon
 *               order:
 *                 type: integer
 *                 example: 1
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               badge:
 *                 type: string
 *                 example: NEW
 *               description:
 *                 type: string
 *                 example: 관리자 대시보드
 *               requiredRoles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["SUPER_ADMIN"]
 *     responses:
 *       201:
 *         description: 메뉴 항목 생성 성공
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
// Create menu item
router.post(
  '/',
  authenticate,
  authorize('ROLE_SUPER_ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const {
        categoryId,
        name,
        nameEn,
        path,
        icon,
        order,
        isActive,
        badge,
        description,
        requiredRoles,
      } = req.body;

      const menuItem = await prisma.menuItem.create({
        data: {
          categoryId,
          name,
          nameEn,
          path,
          icon,
          order: order || 0,
          isActive: isActive !== undefined ? isActive : true,
          badge,
          description,
          requiredRoles: requiredRoles || [],
        },
        include: {
          category: true,
        },
      });

      res.status(201).json({
        success: true,
        data: menuItem,
      });
    } catch (error) {
      console.error('Error creating menu item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create menu item',
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/menu-items/{id}:
 *   put:
 *     summary: 메뉴 항목 수정
 *     tags: [Admin - Menu Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 메뉴 항목 ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *               name:
 *                 type: string
 *               nameEn:
 *                 type: string
 *               path:
 *                 type: string
 *               icon:
 *                 type: string
 *               order:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *               badge:
 *                 type: string
 *               description:
 *                 type: string
 *               requiredRoles:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 메뉴 항목 수정 성공
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
 *         description: 메뉴 항목을 찾을 수 없음
 */
// Update menu item
router.put(
  '/:id',
  authenticate,
  authorize('ROLE_SUPER_ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        categoryId,
        name,
        nameEn,
        path,
        icon,
        order,
        isActive,
        badge,
        description,
        requiredRoles,
      } = req.body;

      const menuItem = await prisma.menuItem.update({
        where: { id },
        data: {
          categoryId,
          name,
          nameEn,
          path,
          icon,
          order,
          isActive,
          badge,
          description,
          requiredRoles,
        },
        include: {
          category: true,
        },
      });

      res.json({
        success: true,
        data: menuItem,
      });
    } catch (error) {
      console.error('Error updating menu item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update menu item',
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/menu-items/{id}:
 *   delete:
 *     summary: 메뉴 항목 삭제
 *     tags: [Admin - Menu Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 메뉴 항목 ID
 *     responses:
 *       200:
 *         description: 메뉴 항목 삭제 성공
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
 *                   example: Menu item deleted successfully
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 메뉴 항목을 찾을 수 없음
 */
// Delete menu item
router.delete(
  '/:id',
  authenticate,
  authorize('ROLE_SUPER_ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await prisma.menuItem.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Menu item deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting menu item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete menu item',
      });
    }
  }
);

export default router;
