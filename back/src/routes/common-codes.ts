import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get common codes by group
router.get('/group/:groupCode', async (req: Request, res: Response) => {
  try {
    const { groupCode } = req.params;

    const codes = await prisma.commonCode.findMany({
      where: {
        groupCode: groupCode,
        isActive: true,
      },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        value: true,
        order: true,
      },
    });

    res.json({
      success: true,
      data: codes,
    });
  } catch (error) {
    console.error('Error fetching common codes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch common codes',
    });
  }
});

// Get all region groups (for location selection)
router.get('/regions', async (req: Request, res: Response) => {
  try {
    // Get all metro regions
    const metroRegions = await prisma.commonCode.findMany({
      where: {
        groupCode: 'REGION_METRO',
        isActive: true,
      },
      orderBy: { order: 'asc' },
      select: {
        code: true,
        name: true,
        order: true,
      },
    });

    res.json({
      success: true,
      data: metroRegions,
    });
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch regions',
    });
  }
});

// Get districts by region code
router.get('/regions/:regionCode/districts', async (req: Request, res: Response) => {
  try {
    const { regionCode } = req.params;

    // Extract region name from code (e.g., REGION_METRO_SEOUL -> SEOUL)
    const regionName = regionCode.replace('REGION_METRO_', '');
    const districtGroupCode = `REGION_${regionName}`;

    const districts = await prisma.commonCode.findMany({
      where: {
        groupCode: districtGroupCode,
        isActive: true,
      },
      orderBy: { order: 'asc' },
      select: {
        code: true,
        name: true,
        order: true,
      },
    });

    res.json({
      success: true,
      data: districts,
    });
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch districts',
    });
  }
});

export default router;
