import { Router, Request, Response } from 'express';
import { prisma } from '../../main';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();

// Get all categories
router.get('/', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { isActive } = req.query;

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const categories = await prisma.category.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Create category
router.post('/', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { name, slug, icon, description, order, isActive } = req.body;

    if (!name || !slug) {
      res.status(400).json({
        success: false,
        message: 'Name and slug are required',
      });
      return;
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        icon,
        description,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update category
router.put('/:id', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, icon, description, order, isActive } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        icon,
        description,
        order,
        isActive,
      },
    });

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete category
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
