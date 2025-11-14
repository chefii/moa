import { Router, Request, Response } from 'express';
import { prisma } from '../main';
import { authenticate } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: 알림 목록 조회
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 페이지당 항목 수
 *     responses:
 *       200:
 *         description: 알림 목록 조회 성공
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
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: 인증 필요
 */
// Get notifications for current user
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Get all notifications (user-specific + global)
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: {
          OR: [
            { userId: user.userId }, // User-specific notifications
            { userId: null },        // Global notifications
          ],
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: Number(limit),
      }),
      prisma.notification.count({
        where: {
          OR: [
            { userId: user.userId },
            { userId: null },
          ],
        },
      }),
    ]);

    // Get read status for each notification
    const notificationsWithReadStatus = await Promise.all(
      notifications.map(async (notification) => {
        const read = await prisma.notificationRead.findUnique({
          where: {
            notificationId_userId: {
              notificationId: notification.id,
              userId: user.userId,
            },
          },
        });

        return {
          ...notification,
          isRead: !!read,
          readAt: read?.readAt || null,
        };
      })
    );

    res.json({
      success: true,
      data: notificationsWithReadStatus,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: '알림 목록 조회에 실패했습니다.',
    });
  }
});

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: 미읽음 알림 개수 조회
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 미읽음 알림 개수
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
 *                   properties:
 *                     unreadCount:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: 인증 필요
 */
// Get unread count
router.get('/unread-count', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // Get all notification IDs
    const allNotifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: user.userId },
          { userId: null },
        ],
      },
      select: { id: true },
    });

    const notificationIds = allNotifications.map((n) => n.id);

    // Get read notification IDs
    const readNotifications = await prisma.notificationRead.findMany({
      where: {
        userId: user.userId,
        notificationId: { in: notificationIds },
      },
      select: { notificationId: true },
    });

    const readIds = new Set(readNotifications.map((r) => r.notificationId));
    const unreadCount = notificationIds.length - readIds.size;

    res.json({
      success: true,
      data: {
        unreadCount,
      },
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: '미읽음 알림 개수 조회에 실패했습니다.',
    });
  }
});

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   post:
 *     summary: 알림 읽음 처리
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 알림 ID
 *     responses:
 *       200:
 *         description: 알림 읽음 처리 성공
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
 *                   example: 알림을 읽음 처리했습니다.
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 알림을 찾을 수 없음
 */
// Mark notification as read
router.post('/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    // Check if notification exists
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        message: '알림을 찾을 수 없습니다.',
      });
      return;
    }

    // Create read record (upsert to avoid duplicates)
    await prisma.notificationRead.upsert({
      where: {
        notificationId_userId: {
          notificationId: id,
          userId: user.userId,
        },
      },
      create: {
        notificationId: id,
        userId: user.userId,
      },
      update: {
        readAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: '알림을 읽음 처리했습니다.',
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: '알림 읽음 처리에 실패했습니다.',
    });
  }
});

/**
 * @swagger
 * /api/notifications/read-all:
 *   post:
 *     summary: 모든 알림 읽음 처리
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 모든 알림 읽음 처리 성공
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
 *                   example: 모든 알림을 읽음 처리했습니다.
 *       401:
 *         description: 인증 필요
 */
// Mark all notifications as read
router.post('/read-all', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // Get all notification IDs
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: user.userId },
          { userId: null },
        ],
      },
      select: { id: true },
    });

    // Create read records for all notifications
    const readRecords = notifications.map((n) => ({
      notificationId: n.id,
      userId: user.userId,
    }));

    // Batch create (skip duplicates)
    for (const record of readRecords) {
      await prisma.notificationRead.upsert({
        where: {
          notificationId_userId: {
            notificationId: record.notificationId,
            userId: record.userId,
          },
        },
        create: record,
        update: {
          readAt: new Date(),
        },
      });
    }

    res.json({
      success: true,
      message: '모든 알림을 읽음 처리했습니다.',
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: '알림 일괄 읽음 처리에 실패했습니다.',
    });
  }
});

export default router;
