import express, { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import logger from '../config/logger';

const router = express.Router();

/**
 * @swagger
 * /api/terms:
 *   get:
 *     tags: [Terms]
 *     summary: 약관 목록 조회
 *     description: 활성화된 약관 목록을 조회합니다
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: 약관 타입 (SERVICE, PRIVACY, LOCATION 등)
 *     responses:
 *       200:
 *         description: 약관 목록 조회 성공
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    const where: any = {
      isActive: true,
    };

    if (type) {
      where.type = type;
    }

    const terms = await prisma.terms.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      message: '약관 목록 조회 성공',
      data: terms,
    });
  } catch (error: any) {
    logger.error('Get terms error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '약관 목록 조회 실패',
    });
  }
});

/**
 * @swagger
 * /api/terms/types:
 *   get:
 *     tags: [Terms]
 *     summary: 약관 타입 목록 조회
 *     description: 공통코드에서 약관 타입 목록을 조회합니다
 *     responses:
 *       200:
 *         description: 약관 타입 목록 조회 성공
 */
router.get('/types', async (req: Request, res: Response) => {
  try {
    const types = await prisma.commonCode.findMany({
      where: {
        groupCode: 'TERMS_TYPE',
        isActive: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    res.json({
      success: true,
      message: '약관 타입 목록 조회 성공',
      data: types,
    });
  } catch (error: any) {
    logger.error('Get terms types error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '약관 타입 목록 조회 실패',
    });
  }
});

/**
 * @swagger
 * /api/terms/{id}:
 *   get:
 *     tags: [Terms]
 *     summary: 약관 상세 조회
 *     description: 특정 약관의 상세 정보를 조회합니다
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 약관 ID
 *     responses:
 *       200:
 *         description: 약관 조회 성공
 *       404:
 *         description: 약관을 찾을 수 없음
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const terms = await prisma.terms.findUnique({
      where: { id },
    });

    if (!terms) {
      return res.status(404).json({
        success: false,
        message: '약관을 찾을 수 없습니다',
      });
    }

    res.json({
      success: true,
      message: '약관 조회 성공',
      data: terms,
    });
  } catch (error: any) {
    logger.error('Get term error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '약관 조회 실패',
    });
  }
});

/**
 * @swagger
 * /api/terms/type/{type}:
 *   get:
 *     tags: [Terms]
 *     summary: 타입별 최신 약관 조회
 *     description: 특정 타입의 활성화된 최신 약관을 조회합니다
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: 약관 타입 (SERVICE, PRIVACY, LOCATION 등)
 *     responses:
 *       200:
 *         description: 약관 조회 성공
 *       404:
 *         description: 약관을 찾을 수 없음
 */
router.get('/type/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;

    const terms = await prisma.terms.findFirst({
      where: {
        type,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!terms) {
      return res.status(404).json({
        success: false,
        message: '약관을 찾을 수 없습니다',
      });
    }

    res.json({
      success: true,
      message: '약관 조회 성공',
      data: terms,
    });
  } catch (error: any) {
    logger.error('Get term by type error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '약관 조회 실패',
    });
  }
});

export default router;
