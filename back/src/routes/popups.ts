import { Router, Request, Response } from 'express';
import { prisma } from '../main';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Get active popups for public display
// Optional authentication - if authenticated, filter out viewed popups
router.get('/active', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const authHeader = req.headers.authorization;
    let userId: string | null = null;

    // Try to extract userId from token if provided (optional auth)
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        userId = decoded.userId;
      } catch (err) {
        // Invalid token, continue as guest
        userId = null;
      }
    }

    const popups = await prisma.popup.findMany({
      where: {
        isActive: true,
        startDate: {
          lte: now,
        },
        endDate: {
          gte: now,
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        imageUrl: true,
        linkUrl: true,
        buttonText: true,
        showOnce: true,
        priority: true,
      },
    });

    // Filter out popups that user has already viewed (if userId is available)
    let filteredPopups = popups;
    if (userId) {
      const viewedPopupIds = await prisma.popupView.findMany({
        where: {
          userId,
          popupId: {
            in: popups.map(p => p.id),
          },
        },
        select: {
          popupId: true,
        },
      });

      const viewedIds = new Set(viewedPopupIds.map(v => v.popupId));
      filteredPopups = popups.filter(p => !p.showOnce || !viewedIds.has(p.id));
    }

    res.json({
      success: true,
      data: filteredPopups,
    });
  } catch (error) {
    console.error('Get active popups error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active popups',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Record popup view
// Optional authentication - if authenticated, save to database
router.post('/view/:popupId', async (req: Request, res: Response) => {
  try {
    const { popupId } = req.params;
    const authHeader = req.headers.authorization;
    let userId: string | null = null;

    // Try to extract userId from token if provided (optional auth)
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        userId = decoded.userId;
      } catch (err) {
        // Invalid token, continue as guest
        userId = null;
      }
    }

    // Only record view if user is authenticated
    if (userId) {
      await prisma.popupView.upsert({
        where: {
          popupId_userId: {
            popupId,
            userId,
          },
        },
        create: {
          popupId,
          userId,
        },
        update: {
          viewedAt: new Date(),
        },
      });
    }

    // Increment total view count (fire and forget)
    prisma.popup.update({
      where: { id: popupId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    }).catch(err => console.error('Failed to increment view count:', err));

    res.json({
      success: true,
      message: 'Popup view recorded',
    });
  } catch (error) {
    console.error('Record popup view error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record popup view',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
