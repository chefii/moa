import { Router, Request, Response } from 'express';
import { prisma } from '../../main';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();

// Get all events
router.get('/', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { status, isActive, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.event.count({ where }),
    ]);

    res.json({
      success: true,
      data: events,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Create event
router.post('/', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { title, description, imageUrl, thumbnailUrl, status, startDate, endDate, maxParticipants, isActive } = req.body;

    if (!title || !description || !imageUrl || !startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: 'Title, description, imageUrl, startDate, and endDate are required',
      });
      return;
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        imageUrl,
        thumbnailUrl,
        status: status || 'SCHEDULED',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        maxParticipants,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: req.user!.userId,
      },
    });

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update event
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = { ...req.body };

    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete event
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.event.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
