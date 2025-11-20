import { Router, Request, Response } from 'express';
import { prisma } from '../../main';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /api/admin/common-codes:
 *   get:
 *     summary: 공통 코드 목록 조회
 *     tags: [Admin - Common Codes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: groupCode
 *         schema:
 *           type: string
 *         description: 그룹 코드 필터
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
 *         description: 공통 코드 목록 조회 성공
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
 *       403:
 *         description: 권한 없음 (슈퍼 관리자만 접근 가능)
 */
// Get all common codes
router.get('/', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { groupCode, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (groupCode) {
      where.groupCode = groupCode;
    }

    const [codes, total] = await Promise.all([
      prisma.commonCode.findMany({
        where,
        orderBy: [{ groupCode: 'asc' }, { order: 'asc' }],
        skip,
        take: Number(limit),
      }),
      prisma.commonCode.count({ where }),
    ]);

    res.json({
      success: true,
      data: codes,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get common codes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch common codes',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/common-codes/{id}:
 *   get:
 *     summary: 공통 코드 상세 조회
 *     tags: [Admin - Common Codes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 공통 코드 ID
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
 *                   type: object
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 공통 코드를 찾을 수 없음
 */
// Get common code by ID
router.get('/:id', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const code = await prisma.commonCode.findUnique({
      where: { id },
    });

    if (!code) {
      res.status(404).json({
        success: false,
        message: 'Common code not found',
      });
      return;
    }

    res.json({
      success: true,
      data: code,
    });
  } catch (error) {
    console.error('Get common code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch common code',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/common-codes:
 *   post:
 *     summary: 공통 코드 생성
 *     tags: [Admin - Common Codes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupCode
 *               - code
 *               - name
 *             properties:
 *               groupCode:
 *                 type: string
 *                 example: ROLE
 *                 description: 그룹 코드
 *               code:
 *                 type: string
 *                 example: ADMIN
 *                 description: 코드
 *               name:
 *                 type: string
 *                 example: 관리자
 *                 description: 이름
 *               description:
 *                 type: string
 *                 example: 시스템 관리자
 *                 description: 설명
 *               value:
 *                 type: string
 *                 example: "100"
 *                 description: 값
 *               order:
 *                 type: integer
 *                 example: 1
 *                 description: 정렬 순서
 *               isActive:
 *                 type: boolean
 *                 example: true
 *                 description: 활성화 여부
 *     responses:
 *       201:
 *         description: 공통 코드 생성 성공
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
 *       400:
 *         description: 필수 필드 누락
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 */
// Create common code
router.post('/', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { groupCode, code, name, description, value, order, isActive } = req.body;

    if (!groupCode || !code || !name) {
      res.status(400).json({
        success: false,
        message: 'Group code, code, and name are required',
      });
      return;
    }

    const commonCode = await prisma.commonCode.create({
      data: {
        groupCode,
        code,
        name,
        description,
        value,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json({
      success: true,
      data: commonCode,
    });
  } catch (error) {
    console.error('Create common code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create common code',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/common-codes/{id}:
 *   put:
 *     summary: 공통 코드 업데이트
 *     tags: [Admin - Common Codes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 공통 코드 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupCode:
 *                 type: string
 *                 example: ROLE
 *               code:
 *                 type: string
 *                 example: ADMIN
 *               name:
 *                 type: string
 *                 example: 관리자
 *               description:
 *                 type: string
 *                 example: 시스템 관리자
 *               value:
 *                 type: string
 *                 example: "100"
 *               order:
 *                 type: integer
 *                 example: 1
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: 공통 코드 업데이트 성공
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
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 공통 코드를 찾을 수 없음
 */
// Update common code
router.put('/:id', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { groupCode, code, name, description, value, order, isActive } = req.body;

    const commonCode = await prisma.commonCode.update({
      where: { id },
      data: {
        groupCode,
        code,
        name,
        description,
        value,
        order,
        isActive,
      },
    });

    res.json({
      success: true,
      data: commonCode,
    });
  } catch (error) {
    console.error('Update common code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update common code',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/common-codes/{id}:
 *   delete:
 *     summary: 공통 코드 삭제
 *     tags: [Admin - Common Codes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 공통 코드 ID
 *     responses:
 *       200:
 *         description: 공통 코드 삭제 성공
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
 *                   example: Common code deleted successfully
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 공통 코드를 찾을 수 없음
 */
// Delete common code
router.delete('/:id', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.commonCode.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Common code deleted successfully',
    });
  } catch (error) {
    console.error('Delete common code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete common code',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/admin/common-codes/groups/list:
 *   get:
 *     summary: 공통 코드 그룹 목록 조회
 *     tags: [Admin - Common Codes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 공통 코드 그룹 목록 조회 성공
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
 *                     type: string
 *                   example: ["ROLE", "GENDER", "AGE_GROUP", "CATEGORY"]
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 */
// Get unique group codes
router.get('/groups/list', authenticate, authorize('ROLE_SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const groups = await prisma.commonCode.findMany({
      select: {
        groupCode: true,
      },
      distinct: ['groupCode'],
      orderBy: {
        groupCode: 'asc',
      },
    });

    const groupCodes = groups.map((g) => g.groupCode);

    res.json({
      success: true,
      data: groupCodes,
    });
  } catch (error) {
    console.error('Get group codes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch group codes',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
