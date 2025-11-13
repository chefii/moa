import { Router, Request, Response } from 'express';
import { prisma } from '../../main';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();

// Get all common codes
router.get('/', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
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

// Get common code by ID
router.get('/:id', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
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

// Create common code
router.post('/', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
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

// Update common code
router.put('/:id', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
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

// Delete common code
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.commonCode.delete({
      where: { id },
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

// Get unique group codes
router.get('/groups/list', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
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
