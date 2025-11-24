'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Eye,
  EyeOff,
  Trash2,
  MessageSquare,
  Heart,
  Calendar,
  User,
  MoreVertical,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import CustomSelect from '@/components/CustomSelect';
import { adminBoardsApi, AdminBoardPost, BoardStats } from '@/lib/api/admin/boards';
import { categoriesApi, Category } from '@/lib/api/categories';

export default function AdminBoardsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<AdminBoardPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<BoardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
    loadStats();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [page, searchQuery, selectedCategory, selectedStatus]);

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getCategories({ type: 'BOARD' });
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await adminBoardsApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadPosts = async () => {
    try {
      // 초기 로딩이 아닌 경우 로딩 상태를 보여주지 않음
      if (posts.length === 0) {
        setLoading(true);
      }

      const response = await adminBoardsApi.getPosts({
        page,
        limit: 20,
        categoryId: selectedCategory || undefined,
        search: searchQuery || undefined,
        status: (selectedStatus as any) || undefined,
      });
      setPosts(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadPosts();
  };

  const handleStatusChange = async (postId: string, status: 'PUBLISHED' | 'DELETED' | 'HIDDEN') => {
    try {
      await adminBoardsApi.updatePostStatus(postId, status);
      alert('상태가 변경되었습니다');
      loadPosts();
      loadStats();
      setShowDropdown(null);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('상태 변경에 실패했습니다');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) return;

    try {
      await adminBoardsApi.deletePost(postId);
      alert('게시글이 삭제되었습니다');
      loadPosts();
      loadStats();
      setShowDropdown(null);
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('삭제에 실패했습니다');
    }
  };

  const handleViewPost = (postId: string) => {
    window.open(`/board/${postId}`, '_blank');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PUBLISHED: 'bg-green-100 text-green-800',
      DELETED: 'bg-red-100 text-red-800',
      HIDDEN: 'bg-yellow-100 text-yellow-800',
    };
    const labels = {
      PUBLISHED: '공개',
      DELETED: '삭제',
      HIDDEN: '숨김',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">게시판 관리</h1>
        <p className="text-gray-600">게시글을 관리하고 통계를 확인하세요</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">전체 게시글</span>
              <BarChart3 className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalPosts.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">공개</span>
              <Eye className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.activePosts.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">숨김</span>
              <EyeOff className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.hiddenPosts.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">삭제</span>
              <Trash2 className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.deletedPosts.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">총 댓글</span>
              <MessageSquare className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalComments.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">총 좋아요</span>
              <Heart className="w-4 h-4 text-pink-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalLikes.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200 relative">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 relative z-10">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="게시글 검색 (제목, 내용)"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moa-primary focus:border-transparent"
            />
          </div>

          <CustomSelect
            value={selectedCategory}
            onChange={(value) => {
              if (value !== selectedCategory) {
                setSelectedCategory(value);
                setPage(1);
              }
            }}
            options={[
              { value: '', label: '전체 카테고리' },
              ...categories.map((category) => ({
                value: category.id,
                label: category.displayName || category.name,
              })),
            ]}
          />

          <CustomSelect
            value={selectedStatus}
            onChange={(value) => {
              if (value !== selectedStatus) {
                setSelectedStatus(value);
                setPage(1);
              }
            }}
            options={[
              { value: '', label: '전체 상태' },
              { value: 'PUBLISHED', label: '공개' },
              { value: 'HIDDEN', label: '숨김' },
              { value: 'DELETED', label: '삭제' },
            ]}
          />

          <button
            type="button"
            onClick={loadPosts}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            새로고침
          </button>
        </form>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  제목
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  작성자
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  카테고리
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  통계
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  작성일
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    로딩 중...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    게시글이 없습니다
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {post.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-1">{post.content.substring(0, 50)}...</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-moa-primary to-moa-accent rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {post.author.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {post.author.nickname || post.author.name}
                          </p>
                          <p className="text-xs text-gray-500">{post.author.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {post.category ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                          {post.category.displayName || post.category.name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                          미분류
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.viewCount}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {post.likeCount}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {post.commentCount}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(post.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative">
                        <button
                          onClick={() => setShowDropdown(showDropdown === post.id ? null : post.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>

                        {showDropdown === post.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setShowDropdown(null)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                              <button
                                onClick={() => handleViewPost(post.id)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                게시글 보기
                              </button>

                              {post.status !== 'PUBLISHED' && (
                                <button
                                  onClick={() => handleStatusChange(post.id, 'PUBLISHED')}
                                  className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  공개로 변경
                                </button>
                              )}

                              {post.status !== 'HIDDEN' && (
                                <button
                                  onClick={() => handleStatusChange(post.id, 'HIDDEN')}
                                  className="w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <EyeOff className="w-4 h-4" />
                                  숨김으로 변경
                                </button>
                              )}

                              {post.status !== 'DELETED' && (
                                <button
                                  onClick={() => handleDelete(post.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  삭제
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-6 border-t border-gray-200">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium ${
                      page === pageNum
                        ? 'bg-moa-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
