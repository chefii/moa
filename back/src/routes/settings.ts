import logger from '../config/logger';
import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { prisma } from '../config/prisma';

const router = Router();

/**
 * @swagger
 * /api/settings/site-settings:
 *   get:
 *     summary: 전체 사이트 설정 조회
 *     tags: [Settings]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 카테고리별 필터링
 *         example: GENERAL
 *     responses:
 *       200:
 *         description: 사이트 설정 조회 성공
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
 *                     properties:
 *                       id:
 *                         type: string
 *                       category:
 *                         type: string
 *                       key:
 *                         type: string
 *                       value:
 *                         type: string
 *                       order:
 *                         type: number
 */
// Get all site settings
router.get('/site-settings', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const where = category ? { category: category as string } : {};

    const settings = await prisma.siteSetting.findMany({
      where,
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    logger.error('Error fetching site settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch site settings',
    });
  }
});

/**
 * @swagger
 * /api/settings/site-settings/category/{category}:
 *   get:
 *     summary: 카테고리별 사이트 설정 조회 (key-value 형식)
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: 설정 카테고리
 *         example: GENERAL
 *     responses:
 *       200:
 *         description: 카테고리별 설정 조회 성공
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
 *                   additionalProperties:
 *                     type: string
 *                   example:
 *                     siteName: "MOA"
 *                     siteDescription: "모임 플랫폼"
 */
// Get settings by category as key-value pairs
router.get('/site-settings/category/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;

    const settings = await prisma.siteSetting.findMany({
      where: { category },
      orderBy: { order: 'asc' },
    });

    // Convert to key-value object
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    res.json({
      success: true,
      data: settingsObject,
    });
  } catch (error) {
    logger.error('Error fetching site settings by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch site settings',
    });
  }
});

/**
 * @swagger
 * /api/settings/footer-links:
 *   get:
 *     summary: 푸터 링크 목록 조회
 *     tags: [Settings]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 링크 카테고리
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: 비활성 링크 포함 여부
 *         example: false
 *     responses:
 *       200:
 *         description: 푸터 링크 조회 성공
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
 *                     properties:
 *                       id:
 *                         type: string
 *                       category:
 *                         type: string
 *                       title:
 *                         type: string
 *                       url:
 *                         type: string
 *                       order:
 *                         type: number
 *                       isActive:
 *                         type: boolean
 */
// Get footer links
router.get('/footer-links', async (req: Request, res: Response) => {
  try {
    const { category, includeInactive } = req.query;

    const where: any = {};
    if (category) {
      where.category = category as string;
    }
    if (includeInactive !== 'true') {
      where.isActive = true;
    }

    const links = await prisma.footerLink.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    res.json({
      success: true,
      data: links,
    });
  } catch (error) {
    logger.error('Error fetching footer links:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch footer links',
    });
  }
});

export default router;
