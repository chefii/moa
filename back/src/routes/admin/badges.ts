import logger from '../../config/logger';
import { Router, Request, Response } from 'express';
import { BadgeCategory } from '@prisma/client';
import { authenticate, authorize } from '../../middlewares/auth';
import { prisma } from '../../config/prisma';

const router = Router();

/**
 * @swagger
 * /api/admin/badges/stats/overview:
 *   get:
 *     summary: 배지 통계 조회
 *     tags: [Admin - Badges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 배지 통계 조회 성공
 */
router.get('/stats/overview', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const totalBadges = await prisma.badge.count();
    const activeBadges = await prisma.badge.count({ where: { isActive: true } });
    const totalUserBadges = await prisma.userBadge.count();

    const categoryStats = await prisma.badge.groupBy({
      by: ['category'],
      _count: true,
    });

    res.json({
      success: true,
      data: {
        totalBadges,
        activeBadges,
        inactiveBadges: totalBadges - activeBadges,
        totalUserBadges,
        categoryStats,
      },
    });
  } catch (error) {
    logger.error('배지 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '배지 통계 조회에 실패했습니다.',
    });
  }
});

/**
 * @swagger
 * /api/admin/badges:
 *   get:
 *     summary: 배지 목록 조회
 *     tags: [Admin - Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [BASIC, HOST, SPECIAL, SEASONAL]
 *         description: 배지 카테고리 필터
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: 활성화 여부 필터
 *     responses:
 *       200:
 *         description: 배지 목록 조회 성공
 */
router.get('/', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { category, isActive } = req.query;

    const where: any = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const badges = await prisma.badge.findMany({
      where,
      include: {
        _count: {
          select: { userBadges: true },
        },
      },
      orderBy: [{ category: 'asc' }, { createdAt: 'desc' }],
    });

    res.json({
      success: true,
      data: badges,
    });
  } catch (error) {
    logger.error('배지 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '배지 목록 조회에 실패했습니다.',
    });
  }
});

/**
 * @swagger
 * /api/admin/badges/{id}:
 *   get:
 *     summary: 배지 상세 조회
 *     tags: [Admin - Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 배지 ID
 *     responses:
 *       200:
 *         description: 배지 조회 성공
 */
router.get('/:id', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const badge = await prisma.badge.findUnique({
      where: { id },
      include: {
        _count: {
          select: { userBadges: true },
        },
      },
    });

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: '배지를 찾을 수 없습니다.',
      });
    }

    res.json({
      success: true,
      data: badge,
    });
  } catch (error) {
    logger.error('배지 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '배지 조회에 실패했습니다.',
    });
  }
});

/**
 * @swagger
 * /api/admin/badges:
 *   post:
 *     summary: 배지 생성
 *     tags: [Admin - Badges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - description
 *               - icon
 *               - category
 *               - conditionType
 *               - conditionValue
 *             properties:
 *               code:
 *                 type: string
 *                 description: 배지 고유 코드
 *               name:
 *                 type: string
 *                 description: 배지 이름
 *               description:
 *                 type: string
 *                 description: 배지 설명
 *               icon:
 *                 type: string
 *                 description: 배지 아이콘 (이모지)
 *               category:
 *                 type: string
 *                 enum: [BASIC, HOST, SPECIAL, SEASONAL]
 *                 description: 배지 카테고리
 *               conditionType:
 *                 type: string
 *                 description: "획득 조건 유형 (예: ATTENDANCE_RATE, HOSTING_COUNT)"
 *               conditionValue:
 *                 type: integer
 *                 description: 획득 조건 값
 *               isActive:
 *                 type: boolean
 *                 description: 활성화 여부
 *     responses:
 *       201:
 *         description: 배지 생성 성공
 */
router.post('/', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { code, name, description, icon, category, conditionType, conditionValue, isActive } = req.body;

    // 필수 필드 검증
    if (!code || !name || !description || !icon || !category || !conditionType || conditionValue === undefined) {
      return res.status(400).json({
        success: false,
        message: '필수 필드를 모두 입력해주세요.',
      });
    }

    // 중복 코드 확인
    const existingBadge = await prisma.badge.findUnique({
      where: { code },
    });

    if (existingBadge) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 배지 코드입니다.',
      });
    }

    // 배지 생성
    const badge = await prisma.badge.create({
      data: {
        code,
        name,
        description,
        icon,
        category: category as BadgeCategory,
        conditionType,
        conditionValue: parseInt(conditionValue),
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json({
      success: true,
      data: badge,
    });
  } catch (error) {
    logger.error('배지 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '배지 생성에 실패했습니다.',
    });
  }
});

/**
 * @swagger
 * /api/admin/badges/{id}:
 *   put:
 *     summary: 배지 수정
 *     tags: [Admin - Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 배지 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [BASIC, HOST, SPECIAL, SEASONAL]
 *               conditionType:
 *                 type: string
 *               conditionValue:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 배지 수정 성공
 */
router.put('/:id', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, icon, category, conditionType, conditionValue, isActive } = req.body;

    // 배지 존재 확인
    const existingBadge = await prisma.badge.findUnique({
      where: { id },
    });

    if (!existingBadge) {
      return res.status(404).json({
        success: false,
        message: '배지를 찾을 수 없습니다.',
      });
    }

    // 배지 수정
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (icon) updateData.icon = icon;
    if (category) updateData.category = category as BadgeCategory;
    if (conditionType) updateData.conditionType = conditionType;
    if (conditionValue !== undefined) updateData.conditionValue = parseInt(conditionValue);
    if (isActive !== undefined) updateData.isActive = isActive;

    const badge = await prisma.badge.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      data: badge,
    });
  } catch (error) {
    logger.error('배지 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '배지 수정에 실패했습니다.',
    });
  }
});

/**
 * @swagger
 * /api/admin/badges/{id}:
 *   delete:
 *     summary: 배지 삭제
 *     tags: [Admin - Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 배지 ID
 *     responses:
 *       200:
 *         description: 배지 삭제 성공
 */
router.delete('/:id', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 배지 존재 확인
    const existingBadge = await prisma.badge.findUnique({
      where: { id },
      include: {
        _count: {
          select: { userBadges: true },
        },
      },
    });

    if (!existingBadge) {
      return res.status(404).json({
        success: false,
        message: '배지를 찾을 수 없습니다.',
      });
    }

    // 사용자가 획득한 배지인 경우 경고
    if (existingBadge._count.userBadges > 0) {
      return res.status(400).json({
        success: false,
        message: `${existingBadge._count.userBadges}명의 사용자가 획득한 배지는 삭제할 수 없습니다. 비활성화를 권장합니다.`,
      });
    }

    // 배지 소프트 삭제
    await prisma.badge.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: '배지가 삭제되었습니다.',
    });
  } catch (error) {
    logger.error('배지 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '배지 삭제에 실패했습니다.',
    });
  }
});

/**
 * @swagger
 * /api/admin/badges/{id}/toggle:
 *   patch:
 *     summary: 배지 활성화/비활성화 토글
 *     tags: [Admin - Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 배지 ID
 *     responses:
 *       200:
 *         description: 배지 상태 변경 성공
 */
router.patch('/:id/toggle', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const badge = await prisma.badge.findUnique({
      where: { id },
    });

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: '배지를 찾을 수 없습니다.',
      });
    }

    const updatedBadge = await prisma.badge.update({
      where: { id },
      data: { isActive: !badge.isActive },
    });

    res.json({
      success: true,
      data: updatedBadge,
    });
  } catch (error) {
    logger.error('배지 상태 변경 오류:', error);
    res.status(500).json({
      success: false,
      message: '배지 상태 변경에 실패했습니다.',
    });
  }
});

export default router;
