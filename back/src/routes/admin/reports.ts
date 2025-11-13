import { Router, Request, Response } from 'express';
import { prisma } from '../../main';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();

// Get pending reports count (for badge) - MUST be before /:id route
router.get('/badge', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'MODERATOR'), async (req: Request, res: Response) => {
  try {
    const pendingCount = await prisma.report.count({
      where: {
        OR: [
          { status: 'PENDING' },
          { status: 'REVIEWING' },
        ],
      },
    });

    res.json({
      success: true,
      data: {
        count: pendingCount,
      },
    });
  } catch (error) {
    console.error('Get report badge count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report badge count',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get report statistics - MUST be before /:id route
router.get('/stats/overview', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const [totalReports, pendingReports, reviewingReports, resolvedReports, rejectedReports] = await Promise.all([
      prisma.report.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.report.count({ where: { status: 'REVIEWING' } }),
      prisma.report.count({ where: { status: 'RESOLVED' } }),
      prisma.report.count({ where: { status: 'REJECTED' } }),
    ]);

    res.json({
      success: true,
      data: {
        totalReports,
        pendingReports,
        reviewingReports,
        resolvedReports,
        rejectedReports,
      },
    });
  } catch (error) {
    console.error('Get report statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get all reports
router.get('/', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          reported: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.report.count({ where }),
    ]);

    res.json({
      success: true,
      data: reports,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get report by ID
router.get('/:id', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reported: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found',
      });
      return;
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update report status
router.put('/:id/status', authenticate, authorize('SUPER_ADMIN', 'BUSINESS_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!status) {
      res.status(400).json({
        success: false,
        message: 'Status is required',
      });
      return;
    }

    const report = await prisma.report.update({
      where: { id },
      data: {
        status,
        adminNote,
        resolvedAt: status === 'RESOLVED' ? new Date() : undefined,
      },
    });

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
