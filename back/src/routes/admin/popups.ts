import { Router, Request, Response } from 'express';
import { prisma } from '../../main';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();

// Get all popups
router.get('/', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { type, isActive, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [popups, total] = await Promise.all([
      prisma.popup.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: Number(limit),
      }),
      prisma.popup.count({ where }),
    ]);

    res.json({
      success: true,
      data: popups,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get popups error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popups',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Create popup
router.post('/', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { type, title, content, imageUrl, linkUrl, buttonText, startDate, endDate, isActive, showOnce, priority } = req.body;

    if (!type || !title || !content || !startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: 'Type, title, content, startDate, and endDate are required',
      });
      return;
    }

    const popup = await prisma.popup.create({
      data: {
        type,
        title,
        content,
        imageUrl,
        linkUrl,
        buttonText,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? isActive : true,
        showOnce: showOnce || false,
        priority: priority || 0,
        createdBy: req.user!.userId,
      },
    });

    res.status(201).json({
      success: true,
      data: popup,
    });
  } catch (error) {
    console.error('Create popup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create popup',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update popup
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = { ...req.body };

    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    const popup = await prisma.popup.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      data: popup,
    });
  } catch (error) {
    console.error('Update popup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update popup',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete popup
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.popup.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Popup deleted successfully',
    });
  } catch (error) {
    console.error('Delete popup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete popup',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
