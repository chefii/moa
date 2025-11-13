import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all menu categories with menu items
router.get(
  '/',
  authenticate,
  authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'),
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
      console.error('Error fetching menu categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch menu categories',
      });
    }
  }
);

// Get single menu category
router.get(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
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
      console.error('Error fetching menu category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch menu category',
      });
    }
  }
);

// Create menu category
router.post(
  '/',
  authenticate,
  authorize('SUPER_ADMIN'),
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
      console.error('Error creating menu category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create menu category',
      });
    }
  }
);

// Update menu category
router.put(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
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
      console.error('Error updating menu category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update menu category',
      });
    }
  }
);

// Delete menu category
router.delete(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await prisma.menuCategory.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Menu category deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting menu category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete menu category',
      });
    }
  }
);

export default router;
