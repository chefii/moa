'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MobileLayout from '@/components/MobileLayout';
import MobileHeader from '@/components/MobileHeader';
import {
  MessageCircle,
  UserX,
  Utensils,
  Star,
  HelpCircle,
  Bell,
  Search,
  PenSquare,
  Eye,
  Heart,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { categoriesApi, Category } from '@/lib/api/categories';
import { boardApi, BoardPost } from '@/lib/api/board';
import { useAuthStore } from '@/store/authStore';

const iconMap: Record<string, any> = {
  MessageCircle,
  UserX,
  Utensils,
  Star,
  HelpCircle,
  Bell,
};

export default function BoardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'views'>('recent');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load board categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesApi.getCategories({ type: 'BOARD' });
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Load posts
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const response = await boardApi.getPosts({
          page,
          limit: 20,
          categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
          search: searchQuery || undefined,
          sort: sortBy,
        });
        setPosts(Array.isArray(response.data) ? response.data : []);
        setTotalPages(response.pagination.totalPages || 1);
      } catch (error) {
        console.error('Failed to load posts:', error);
        setPosts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [selectedCategory, searchQuery, sortBy, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleWrite = () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다');
      router.push('/login');
      return;
    }
    router.push('/board/write');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffHours = diff / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
      });
    }
  };

  return (
    <MobileLayout>
      <MobileHeader />

      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">게시판</h1>
          <p className="text-sm text-gray-600">자유롭게 소통하고 정보를 공유하세요</p>
        </div>

        {/* Category Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              전체
            </button>

            {categories.map((category) => {
              const IconComponent = iconMap[category.icon || 'MessageCircle'];
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setPage(1);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? `bg-gradient-to-r ${category.color || 'from-gray-400 to-gray-600'} text-white shadow-md`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {category.displayName || category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex flex-col gap-3">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="게시글 검색..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as 'recent' | 'popular' | 'views');
                  setPage(1);
                }}
                className="flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">최신순</option>
                <option value="popular">인기순</option>
                <option value="views">조회순</option>
              </select>

              <button
                onClick={handleWrite}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all whitespace-nowrap"
              >
                <PenSquare className="w-4 h-4" />
                글쓰기
              </button>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-sm text-gray-500">로딩 중...</div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-500">
              게시글이 없습니다
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/board/${post.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Category Badge */}
                    <div
                      className={`flex-shrink-0 px-2 py-1 rounded-md text-xs font-medium text-white ${
                        post.category?.color || 'bg-gray-500'
                      }`}
                    >
                      {post.category?.displayName || post.category?.name}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <h3 className="text-sm font-semibold text-gray-900 mb-1.5 line-clamp-2">
                        {post.title}
                        {post.commentCount > 0 && (
                          <span className="ml-1.5 text-blue-500 text-xs">
                            [{post.commentCount}]
                          </span>
                        )}
                      </h3>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span className="font-medium">
                          {post.author?.nickname || post.author?.name}
                        </span>
                        <span>•</span>
                        <span>{formatDate(post.createdAt)}</span>
                        <span>•</span>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-0.5">
                            <Eye className="w-3 h-3" />
                            {post.viewCount}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Heart className="w-3 h-3" />
                            {post.likeCount}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <MessageSquare className="w-3 h-3" />
                            {post.commentCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium ${
                        page === p
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
