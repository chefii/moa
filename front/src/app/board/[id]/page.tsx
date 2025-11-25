'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MobileLayout from '@/components/MobileLayout';
import MobileHeader from '@/components/MobileHeader';
import {
  ArrowLeft,
  Eye,
  Heart,
  MessageSquare,
  Edit,
  Trash2,
  Send,
  MoreVertical,
  Flag,
  MessageCircle,
} from 'lucide-react';
import { boardApi, BoardPost, BoardComment } from '@/lib/api/board';
import { useAuthStore } from '@/store/authStore';
import ReportModal from '@/components/ReportModal';
import Toast, { ToastType } from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';

export default function BoardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();

  const fromCategory = searchParams.get('from') || 'all';
  const fromSort = searchParams.get('sort') || 'recent';

  const [post, setPost] = useState<BoardPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const hasLoadedRef = useRef<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [showDeletePostConfirm, setShowDeletePostConfirm] = useState(false);
  const [showDeleteCommentConfirm, setShowDeleteCommentConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [reportType, setReportType] = useState<'BOARD' | 'USER'>('BOARD');

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    const loadPost = async () => {
      const postId = params.id as string;

      // Prevent double execution for the same post
      if (hasLoadedRef.current === postId) return;
      hasLoadedRef.current = postId;

      try {
        const data = await boardApi.getPostById(postId);
        setPost(data);
      } catch (error) {
        console.error('Failed to load post:', error);
        alert('게시글을 불러올 수 없습니다');
        router.push('/board');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadPost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다');
      return;
    }

    try {
      const result = await boardApi.togglePostLike(params.id as string);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              likeCount: result.likeCount,
              isLiked: result.liked,
            }
          : null
      );
    } catch (error) {
      console.error('Failed to toggle like:', error);
      alert('좋아요 처리 중 오류가 발생했습니다');
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다');
      return;
    }

    try {
      const result = await boardApi.toggleCommentLike(commentId);
      setPost((prev) => {
        if (!prev) return null;

        // Recursively update comment or reply at any nesting level
        const updateCommentInTree = (comment: BoardComment): BoardComment => {
          // If this is the comment we're looking for
          if (comment.id === commentId) {
            return { ...comment, likeCount: result.likeCount, isLiked: result.liked };
          }

          // If this comment has replies, recursively search them
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: comment.replies.map(updateCommentInTree),
            };
          }

          return comment;
        };

        return {
          ...prev,
          comments: prev.comments?.map(updateCommentInTree),
        };
      });
    } catch (error) {
      console.error('Failed to toggle comment like:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다');
      return;
    }

    if (!commentContent.trim()) {
      alert('댓글 내용을 입력해주세요');
      return;
    }

    setSubmitting(true);
    try {
      await boardApi.createComment({
        postId: params.id as string,
        content: commentContent,
        parentId: replyTo || undefined,
        isAnonymous,
      });

      // Reload post to get updated comments
      const updatedPost = await boardApi.getPostById(params.id as string);
      setPost(updatedPost);
      setCommentContent('');
      setReplyTo(null);
      setIsAnonymous(false);
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert('댓글 작성 중 오류가 발생했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    try {
      await boardApi.deletePost(params.id as string);
      setToast({ message: '게시글이 삭제되었습니다', type: 'success' });
      setTimeout(() => {
        router.push('/board');
      }, 1000);
    } catch (error) {
      console.error('Failed to delete post:', error);
      setToast({ message: '삭제 중 오류가 발생했습니다', type: 'error' });
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      await boardApi.deleteComment(commentToDelete);
      const updatedPost = await boardApi.getPostById(params.id as string);
      setPost(updatedPost);
      setToast({ message: '댓글이 삭제되었습니다', type: 'success' });
    } catch (error) {
      console.error('Failed to delete comment:', error);
      setToast({ message: '삭제 중 오류가 발생했습니다', type: 'error' });
    } finally {
      setCommentToDelete(null);
    }
  };

  const handleReportPost = () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다');
      router.push('/login');
      return;
    }
    setShowPostMenu(false);
    setReportType('BOARD');
    setSelectedUserId(null);
    setShowReportModal(true);
  };

  const handleSubmitReport = async (reasonCode: string, description: string) => {
    try {
      if (reportType === 'USER' && selectedUserId) {
        // User report
        await boardApi.reportUser(selectedUserId, reasonCode, description);
        setToast({ message: '사용자 신고가 접수되었습니다', type: 'success' });
      } else {
        // Post report
        await boardApi.reportPost(params.id as string, reasonCode, description);
        setToast({ message: '게시글 신고가 접수되었습니다', type: 'success' });
      }
    } catch (error: any) {
      console.error('Failed to report:', error);
      const message = error.response?.data?.message || '신고 처리 중 오류가 발생했습니다';
      setToast({ message, type: 'error' });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <MobileLayout>
        <MobileHeader />
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </MobileLayout>
    );
  }

  if (!post) {
    return (
      <MobileLayout>
        <MobileHeader />
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">게시글을 찾을 수 없습니다</div>
        </div>
      </MobileLayout>
    );
  }

  const isAuthor = user?.id === post.authorId;

  return (
    <MobileLayout>
      <MobileHeader />
      <div className="px-4 pb-6">
        {/* Back Button */}
        <Link
          href={(() => {
            const params = new URLSearchParams();
            if (fromCategory !== 'all') params.set('category', fromCategory);
            if (fromSort !== 'recent') params.set('sort', fromSort);
            return params.toString() ? `/board?${params.toString()}` : '/board';
          })()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 mt-4"
        >
          <ArrowLeft className="w-5 h-5" />
          목록으로
        </Link>

        {/* Post */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start justify-between mb-4">
              {post.category && (
                <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold text-white bg-blue-600 flex-shrink-0">
                  {post.category.displayName || post.category.name}
                </span>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowPostMenu(!showPostMenu)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {showPostMenu && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowPostMenu(false)}
                    />

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      {isAuthor ? (
                        <>
                          <button
                            onClick={() => {
                              setShowPostMenu(false);
                              const params = new URLSearchParams();
                              params.set('id', post.id);
                              if (fromCategory !== 'all') params.set('from', fromCategory);
                              if (fromSort !== 'recent') params.set('sort', fromSort);
                              router.push(`/board/write?${params.toString()}`);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            수정
                          </button>
                          <button
                            onClick={() => {
                              setShowPostMenu(false);
                              setShowDeletePostConfirm(true);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            삭제
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleReportPost}
                          className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                        >
                          <Flag className="w-4 h-4" />
                          신고
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span className="font-medium">
                  {post.isAnonymous ? '익명' : post.author?.nickname || post.author?.name}
                </span>
                <span>{formatDate(post.createdAt)}</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post.viewCount}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {post.likeCount}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {post.commentCount}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {post.image && (
              <img
                src={post.image.url}
                alt="Post image"
                className="w-full max-h-96 object-cover rounded-lg mb-6"
              />
            )}
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-gray-700">{post.content}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-100">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                post.isLiked
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Heart className="w-5 h-5" fill={post.isLiked ? 'currentColor' : 'none'} />
              좋아요 {post.likeCount}
            </button>
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            댓글 {post.comments?.length || 0}
          </h2>

          {/* Comment Form */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder={
                replyTo ? '답글을 입력하세요...' : '댓글을 입력하세요...'
              }
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              disabled={!isAuthenticated}
            />

            <div className="flex justify-between items-center mt-3">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded"
                  disabled={!isAuthenticated}
                />
                익명으로 작성
              </label>

              <div className="flex gap-2">
                {replyTo && (
                  <button
                    onClick={() => {
                      setReplyTo(null);
                      setCommentContent('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    취소
                  </button>
                )}
                <button
                  onClick={handleSubmitComment}
                  disabled={!isAuthenticated || submitting}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? '작성 중...' : '등록'}
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {post.comments?.map((comment) => (
              <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {!comment.isAnonymous && comment.authorId && user?.id !== comment.authorId ? (
                      <div className="relative">
                        <button
                          onClick={() => setShowUserMenu(showUserMenu === comment.id ? null : comment.id)}
                          className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {comment.author?.nickname || comment.author?.name}
                        </button>

                        {showUserMenu === comment.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setShowUserMenu(null)}
                            />
                            <div className="absolute left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                              <button
                                onClick={() => {
                                  setSelectedUserId(comment.authorId);
                                  setReportType('USER');
                                  setShowReportModal(true);
                                  setShowUserMenu(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                              >
                                <Flag className="w-4 h-4" />
                                신고하기
                              </button>
                              <button
                                onClick={() => {
                                  setToast({ message: '쪽지 기능은 준비중입니다', type: 'info' });
                                  setShowUserMenu(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                              >
                                <MessageCircle className="w-4 h-4" />
                                쪽지 보내기
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="font-medium text-gray-900">
                        {comment.isAnonymous
                          ? '익명'
                          : comment.author?.nickname || comment.author?.name}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>

                  {user?.id === comment.authorId && (
                    <button
                      onClick={() => {
                        setCommentToDelete(comment.id);
                        setShowDeleteCommentConfirm(true);
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-gray-700 mb-2">{comment.content}</p>

                <div className="flex items-center gap-3 text-sm">
                  <button
                    onClick={() => handleCommentLike(comment.id)}
                    className={`flex items-center gap-1 ${
                      comment.isLiked ? 'text-red-500' : 'text-gray-500'
                    } hover:text-red-600`}
                  >
                    <Heart
                      className="w-4 h-4"
                      fill={comment.isLiked ? 'currentColor' : 'none'}
                    />
                    {comment.likeCount}
                  </button>

                  <button
                    onClick={() => {
                      setReplyTo(comment.id);
                      setCommentContent('');
                    }}
                    className="text-gray-500 hover:text-blue-600"
                  >
                    답글
                  </button>

                  {/* Toggle Replies Button (if replies >= 3) */}
                  {comment.replies && comment.replies.length >= 3 && (
                    <button
                      onClick={() => toggleReplies(comment.id)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {expandedReplies.has(comment.id)
                        ? `답글 접기 (${comment.replies.length})`
                        : `답글 보기 (${comment.replies.length})`
                      }
                    </button>
                  )}
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 ml-6 space-y-3 border-l-2 border-blue-200 pl-4">
                    {(comment.replies.length < 3 || expandedReplies.has(comment.id)
                      ? comment.replies
                      : []
                    ).map((reply) => (
                      <div key={reply.id}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {!reply.isAnonymous && reply.authorId && user?.id !== reply.authorId ? (
                              <div className="relative">
                                <button
                                  onClick={() => setShowUserMenu(showUserMenu === reply.id ? null : reply.id)}
                                  className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                                >
                                  {reply.author?.nickname || reply.author?.name}
                                </button>

                                {showUserMenu === reply.id && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-10"
                                      onClick={() => setShowUserMenu(null)}
                                    />
                                    <div className="absolute left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                                      <button
                                        onClick={() => {
                                          setSelectedUserId(reply.authorId);
                                          setReportType('USER');
                                          setShowReportModal(true);
                                          setShowUserMenu(null);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                                      >
                                        <Flag className="w-4 h-4" />
                                        신고하기
                                      </button>
                                      <button
                                        onClick={() => {
                                          setToast({ message: '쪽지 기능은 준비중입니다', type: 'info' });
                                          setShowUserMenu(null);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                                      >
                                        <MessageCircle className="w-4 h-4" />
                                        쪽지 보내기
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="font-medium text-gray-900">
                                {reply.isAnonymous
                                  ? '익명'
                                  : reply.author?.nickname || reply.author?.name}
                              </span>
                            )}
                            <span className="text-sm text-gray-500">
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>

                          {user?.id === reply.authorId && (
                            <button
                              onClick={() => {
                                setCommentToDelete(reply.id);
                                setShowDeleteCommentConfirm(true);
                              }}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <p className="text-gray-700 mb-2">{reply.content}</p>

                        <div className="flex items-center gap-3 text-sm">
                          <button
                            onClick={() => handleCommentLike(reply.id)}
                            className={`flex items-center gap-1 ${
                              reply.isLiked ? 'text-red-500' : 'text-gray-500'
                            } hover:text-red-600`}
                          >
                            <Heart
                              className="w-4 h-4"
                              fill={reply.isLiked ? 'currentColor' : 'none'}
                            />
                            {reply.likeCount}
                          </button>

                          <button
                            onClick={() => {
                              setReplyTo(reply.id);
                              setCommentContent('');
                            }}
                            className="text-gray-500 hover:text-blue-600"
                          >
                            답글
                          </button>
                        </div>

                        {/* Nested Replies (3rd level) */}
                        {reply.replies && reply.replies.length > 0 && (
                          <div className="mt-3 ml-4 space-y-2 border-l-2 border-gray-200 pl-3">
                            {reply.replies.map((nestedReply: any) => (
                              <div key={nestedReply.id}>
                                <div className="flex items-start justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    {!nestedReply.isAnonymous && nestedReply.authorId && user?.id !== nestedReply.authorId ? (
                                      <div className="relative">
                                        <button
                                          onClick={() => setShowUserMenu(showUserMenu === nestedReply.id ? null : nestedReply.id)}
                                          className="font-medium text-gray-900 text-sm hover:text-blue-600 transition-colors"
                                        >
                                          {nestedReply.author?.nickname || nestedReply.author?.name}
                                        </button>

                                        {showUserMenu === nestedReply.id && (
                                          <>
                                            <div
                                              className="fixed inset-0 z-10"
                                              onClick={() => setShowUserMenu(null)}
                                            />
                                            <div className="absolute left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                                              <button
                                                onClick={() => {
                                                  setSelectedUserId(nestedReply.authorId);
                                                  setReportType('USER');
                                                  setShowReportModal(true);
                                                  setShowUserMenu(null);
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                                              >
                                                <Flag className="w-4 h-4" />
                                                신고하기
                                              </button>
                                              <button
                                                onClick={() => {
                                                  setToast({ message: '쪽지 기능은 준비중입니다', type: 'info' });
                                                  setShowUserMenu(null);
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                                              >
                                                <MessageCircle className="w-4 h-4" />
                                                쪽지 보내기
                                              </button>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="font-medium text-gray-900 text-sm">
                                        {nestedReply.isAnonymous
                                          ? '익명'
                                          : nestedReply.author?.nickname || nestedReply.author?.name}
                                      </span>
                                    )}
                                    <span className="text-xs text-gray-500">
                                      {formatDate(nestedReply.createdAt)}
                                    </span>
                                  </div>

                                  {user?.id === nestedReply.authorId && (
                                    <button
                                      onClick={() => {
                                        setCommentToDelete(nestedReply.id);
                                        setShowDeleteCommentConfirm(true);
                                      }}
                                      className="text-gray-400 hover:text-red-600"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>

                                <p className="text-gray-700 text-sm mb-1">{nestedReply.content}</p>

                                <div className="flex items-center gap-2 text-xs">
                                  <button
                                    onClick={() => handleCommentLike(nestedReply.id)}
                                    className={`flex items-center gap-1 ${
                                      nestedReply.isLiked ? 'text-red-500' : 'text-gray-500'
                                    } hover:text-red-600`}
                                  >
                                    <Heart
                                      className="w-3 h-3"
                                      fill={nestedReply.isLiked ? 'currentColor' : 'none'}
                                    />
                                    {nestedReply.likeCount}
                                  </button>

                                  <button
                                    onClick={() => {
                                      setReplyTo(nestedReply.id);
                                      setCommentContent('');
                                    }}
                                    className="text-gray-500 hover:text-blue-600"
                                  >
                                    답글
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleSubmitReport}
        reportType={reportType}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Delete Post Confirm Modal */}
      <ConfirmModal
        isOpen={showDeletePostConfirm}
        onClose={() => setShowDeletePostConfirm(false)}
        onConfirm={handleDeletePost}
        title="게시글 삭제"
        message="정말 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        confirmColor="red"
      />

      {/* Delete Comment Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteCommentConfirm}
        onClose={() => {
          setShowDeleteCommentConfirm(false);
          setCommentToDelete(null);
        }}
        onConfirm={handleDeleteComment}
        title="댓글 삭제"
        message="정말 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        confirmColor="red"
      />
    </MobileLayout>
  );
}
