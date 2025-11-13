import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all menu items
router.get(
  '/',
  authenticate,
  authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'),
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

// Get single menu item
router.get(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
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

// Create menu item
router.post(
  '/',
  authenticate,
  authorize('SUPER_ADMIN'),
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

// Update menu item
router.put(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
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

// Delete menu item
router.delete(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
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
