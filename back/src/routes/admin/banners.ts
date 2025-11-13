import { Router, Request, Response } from 'express';
import { prisma } from '../../main';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();

// Get all banners
router.get('/', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { type, isActive, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (type) {
      where.type = type;
    }
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [banners, total] = await Promise.all([
      prisma.banner.findMany({
        where,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: Number(limit),
      }),
      prisma.banner.count({ where }),
    ]);

    res.json({
      success: true,
      data: banners,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get banner by ID
router.get('/:id', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const banner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
      return;
    }

    res.json({
      success: true,
      data: banner,
    });
  } catch (error) {
    console.error('Get banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banner',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Create banner
router.post('/', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { type, title, description, imageUrl, linkUrl, order, startDate, endDate, isActive } = req.body;

    if (!type || !title || !imageUrl || !startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: 'Type, title, imageUrl, startDate, and endDate are required',
      });
      return;
    }

    const banner = await prisma.banner.create({
      data: {
        type,
        title,
        description,
        imageUrl,
        linkUrl,
        order: order || 0,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? isActive : true,
        createdBy: req.user!.userId,
      },
    });

    res.status(201).json({
      success: true,
      data: banner,
    });
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create banner',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update banner
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, title, description, imageUrl, linkUrl, order, startDate, endDate, isActive } = req.body;

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        type,
        title,
        description,
        imageUrl,
        linkUrl,
        order,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive,
      },
    });

    res.json({
      success: true,
      data: banner,
    });
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update banner',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete banner
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.banner.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Banner deleted successfully',
    });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete banner',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Increment view count
router.post('/:id/view', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.banner.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    res.json({
      success: true,
      message: 'View count incremented',
    });
  } catch (error) {
    console.error('Increment view count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to increment view count',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Increment click count
router.post('/:id/click', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.banner.update({
      where: { id },
      data: {
        clickCount: {
          increment: 1,
        },
      },
    });

    res.json({
      success: true,
      message: 'Click count incremented',
    });
  } catch (error) {
    console.error('Increment click count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to increment click count',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
