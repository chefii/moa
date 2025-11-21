import logger from '../config/logger';
import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';

const router = Router();

/**
 * @swagger
 * /api/common-codes/group/{groupCode}:
 *   get:
 *     summary: 그룹별 공통 코드 조회
 *     tags: [CommonCodes]
 *     parameters:
 *       - in: path
 *         name: groupCode
 *         required: true
 *         schema:
 *           type: string
 *         description: 코드 그룹
 *         example: REGION_METRO
 *     responses:
 *       200:
 *         description: 공통 코드 조회 성공
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
 *                       code:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       value:
 *                         type: string
 *                       order:
 *                         type: number
 */
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
    logger.error('Error fetching common codes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch common codes',
    });
  }
});

/**
 * @swagger
 * /api/common-codes/regions:
 *   get:
 *     summary: 전체 지역 목록 조회 (광역시/도)
 *     tags: [CommonCodes]
 *     responses:
 *       200:
 *         description: 지역 목록 조회 성공
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
 *                       code:
 *                         type: string
 *                         example: REGION_METRO_SEOUL
 *                       name:
 *                         type: string
 *                         example: 서울특별시
 *                       order:
 *                         type: number
 */
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
    logger.error('Error fetching regions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch regions',
    });
  }
});

/**
 * @swagger
 * /api/common-codes/regions/{regionCode}/districts:
 *   get:
 *     summary: 지역별 구/군 목록 조회
 *     tags: [CommonCodes]
 *     parameters:
 *       - in: path
 *         name: regionCode
 *         required: true
 *         schema:
 *           type: string
 *         description: 지역 코드
 *         example: REGION_METRO_SEOUL
 *     responses:
 *       200:
 *         description: 구/군 목록 조회 성공
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
 *                       code:
 *                         type: string
 *                         example: REGION_SEOUL_GANGNAM
 *                       name:
 *                         type: string
 *                         example: 강남구
 *                       order:
 *                         type: number
 */
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
    logger.error('Error fetching districts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch districts',
    });
  }
});

export default router;
