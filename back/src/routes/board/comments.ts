import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../middlewares/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/board/comments:
 *   post:
 *     summary: 댓글 작성
 *     tags: [Board]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *               - content
 *             properties:
 *               postId:
 *                 type: string
 *               content:
 *                 type: string
 *               parentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: 댓글 작성 성공
 *       401:
 *         description: 인증 필요
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { postId, content, parentId } = req.body;
    const userId = (req as any).user.userId;

    if (!postId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Post ID and content are required',
      });
    }

    const comment = await prisma.boardComment.create({
      data: {
        postId,
        authorId: userId,
        content,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            profileImageId: true,
          },
        },
      },
    });

    // Update post comment count
    await prisma.boardPost.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    });

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create comment',
    });
  }
});

/**
 * @swagger
 * /api/board/comments/{id}:
 *   put:
 *     summary: 댓글 수정
 *     tags: [Board]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: 댓글 수정 성공
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 댓글을 찾을 수 없음
 */
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = (req as any).user.userId;

    const comment = await prisma.boardComment.findUnique({
      where: { id },
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    if (comment.authorId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own comments',
      });
    }

    const updatedComment = await prisma.boardComment.update({
      where: { id },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            profileImageId: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedComment,
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update comment',
    });
  }
});

/**
 * @swagger
 * /api/board/comments/{id}:
 *   delete:
 *     summary: 댓글 삭제
 *     tags: [Board]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 댓글 삭제 성공
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 댓글을 찾을 수 없음
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const comment = await prisma.boardComment.findUnique({
      where: { id },
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    if (comment.authorId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments',
      });
    }

    // Soft delete
    await prisma.boardComment.update({
      where: { id },
      data: { isDeleted: true },
    });

    // Update post comment count
    await prisma.boardPost.update({
      where: { id: comment.postId },
      data: { commentCount: { decrement: 1 } },
    });

    res.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
    });
  }
});

/**
 * @swagger
 * /api/board/comments/{id}/like:
 *   post:
 *     summary: 댓글 좋아요
 *     tags: [Board]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 좋아요 성공
 *       401:
 *         description: 인증 필요
 */
router.post('/:id/like', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    // Check if already liked
    const existingLike = await prisma.boardCommentLike.findUnique({
      where: {
        commentId_userId: {
          commentId: id,
          userId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.$transaction([
        prisma.boardCommentLike.delete({
          where: { id: existingLike.id },
        }),
        prisma.boardComment.update({
          where: { id },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);

      return res.json({
        success: true,
        data: { liked: false },
      });
    } else {
      // Like
      await prisma.$transaction([
        prisma.boardCommentLike.create({
          data: {
            commentId: id,
            userId,
          },
        }),
        prisma.boardComment.update({
          where: { id },
          data: { likeCount: { increment: 1 } },
        }),
      ]);

      return res.json({
        success: true,
        data: { liked: true },
      });
    }
  } catch (error) {
    console.error('Error toggling comment like:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle comment like',
    });
  }
});

export default router;
