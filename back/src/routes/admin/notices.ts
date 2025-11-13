import { Router, Request, Response } from 'express';
import { prisma } from '../../main';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();

// Get all notices
router.get('/', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { type, isPinned, isActive, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (type) where.type = type;
    if (isPinned !== undefined) where.isPinned = isPinned === 'true';
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: Number(limit),
      }),
      prisma.notice.count({ where }),
    ]);

    res.json({
      success: true,
      data: notices,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notices',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get notice by ID
router.get('/:id', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const notice = await prisma.notice.findUnique({
      where: { id },
    });

    if (!notice) {
      res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
      return;
    }

    // Increment view count
    await prisma.notice.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    res.json({
      success: true,
      data: notice,
    });
  } catch (error) {
    console.error('Get notice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notice',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Create notice
router.post('/', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { type, title, content, isPinned, isActive, startDate, endDate } = req.body;

    if (!title || !content) {
      res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
      return;
    }

    const notice = await prisma.notice.create({
      data: {
        type: type || 'GENERAL',
        title,
        content,
        isPinned: isPinned || false,
        isActive: isActive !== undefined ? isActive : true,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        createdBy: req.user!.userId,
      },
    });

    res.status(201).json({
      success: true,
      data: notice,
    });
  } catch (error) {
    console.error('Create notice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notice',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update notice
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = { ...req.body };

    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    const notice = await prisma.notice.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      data: notice,
    });
  } catch (error) {
    console.error('Update notice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notice',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete notice
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.notice.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Notice deleted successfully',
    });
  } catch (error) {
    console.error('Delete notice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notice',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
