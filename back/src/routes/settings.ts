import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

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
    console.error('Error fetching site settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch site settings',
    });
  }
});

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
    console.error('Error fetching site settings by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch site settings',
    });
  }
});

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
    console.error('Error fetching footer links:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch footer links',
    });
  }
});

export default router;
