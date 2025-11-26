import express, { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import logger from '../../config/logger';
import { authenticate, authorize } from '../../middlewares/auth';

const router = express.Router();

/**
 * @swagger
 * /api/admin/terms:
 *   get:
 *     tags: [Admin - Terms]
 *     summary: 약관 목록 조회 (관리자)
 *     description: 모든 약관 목록을 조회합니다 (삭제된 항목 포함)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: 약관 타입
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: 활성화 여부
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: 약관 목록 조회 성공
 */
router.get('/', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { type, isActive, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [terms, total] = await Promise.all([
      prisma.terms.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.terms.count({ where }),
    ]);

    res.json({
      success: true,
      message: '약관 목록 조회 성공',
      data: {
        terms,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
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
 * /api/admin/terms:
 *   post:
 *     tags: [Admin - Terms]
 *     summary: 약관 생성
 *     description: 새로운 약관을 생성합니다
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - content
 *               - version
 *             properties:
 *               type:
 *                 type: string
 *                 description: 약관 타입
 *               title:
 *                 type: string
 *                 description: 약관 제목
 *               content:
 *                 type: string
 *                 description: 약관 내용
 *               version:
 *                 type: string
 *                 description: 버전
 *               isRequired:
 *                 type: boolean
 *                 description: 필수 동의 여부
 *                 default: true
 *               isActive:
 *                 type: boolean
 *                 description: 활성화 여부
 *                 default: true
 *     responses:
 *       201:
 *         description: 약관 생성 성공
 */
router.post('/', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { type, title, content, version, isRequired = true, isActive = true } = req.body;

    // 타입 검증
    const termsType = await prisma.commonCode.findFirst({
      where: {
        code: `TERMS_TYPE_${type}`,
        groupCode: 'TERMS_TYPE',
        isActive: true,
      },
    });

    if (!termsType) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 약관 타입입니다',
      });
    }

    // 같은 타입의 기존 약관이 있으면 비활성화
    if (isActive) {
      await prisma.terms.updateMany({
        where: {
          type,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
    }

    const terms = await prisma.terms.create({
      data: {
        type,
        title,
        content,
        version,
        isRequired,
        isActive,
      },
    });

    res.status(201).json({
      success: true,
      message: '약관이 생성되었습니다',
      data: terms,
    });
  } catch (error: any) {
    logger.error('Create terms error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '약관 생성 실패',
    });
  }
});

/**
 * @swagger
 * /api/admin/terms/{id}:
 *   get:
 *     tags: [Admin - Terms]
 *     summary: 약관 상세 조회
 *     security:
 *       - BearerAuth: []
 */
router.get('/:id', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
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
 * /api/admin/terms/{id}:
 *   put:
 *     tags: [Admin - Terms]
 *     summary: 약관 수정
 *     security:
 *       - BearerAuth: []
 */
router.put('/:id', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, version, isRequired, isActive } = req.body;

    const existingTerms = await prisma.terms.findUnique({
      where: { id },
    });

    if (!existingTerms) {
      return res.status(404).json({
        success: false,
        message: '약관을 찾을 수 없습니다',
      });
    }

    // 활성화로 변경 시, 같은 타입의 다른 약관 비활성화
    if (isActive && !existingTerms.isActive) {
      await prisma.terms.updateMany({
        where: {
          type: existingTerms.type,
          isActive: true,
          id: { not: id },
        },
        data: {
          isActive: false,
        },
      });
    }

    const updatedTerms = await prisma.terms.update({
      where: { id },
      data: {
        title,
        content,
        version,
        isRequired,
        isActive,
      },
    });

    res.json({
      success: true,
      message: '약관이 수정되었습니다',
      data: updatedTerms,
    });
  } catch (error: any) {
    logger.error('Update terms error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '약관 수정 실패',
    });
  }
});

/**
 * @swagger
 * /api/admin/terms/{id}:
 *   delete:
 *     tags: [Admin - Terms]
 *     summary: 약관 삭제
 *     security:
 *       - BearerAuth: []
 */
router.delete('/:id', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
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

    await prisma.terms.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: '약관이 삭제되었습니다',
    });
  } catch (error: any) {
    logger.error('Delete terms error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '약관 삭제 실패',
    });
  }
});

export default router;
