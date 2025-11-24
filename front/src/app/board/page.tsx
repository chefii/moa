'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MobileLayout from '@/components/MobileLayout';
import MobileHeader from '@/components/MobileHeader';
import CustomSelect from '@/components/CustomSelect';
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
  ArrowUp,
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
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'all'
  );
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'views'>(
    (searchParams.get('sort') as 'recent' | 'popular' | 'views') || 'recent'
  );
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showTopButton, setShowTopButton] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const prevCategoryRef = useRef<string>(selectedCategory);

  // Sync state with URL params when navigating back
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') || 'all';
    const sortFromUrl = (searchParams.get('sort') as 'recent' | 'popular' | 'views') || 'recent';

    setSelectedCategory(categoryFromUrl);
    setSortBy(sortFromUrl);
    prevCategoryRef.current = categoryFromUrl;
  }, [searchParams]);

  // Update URL when category or sort changes
  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }

    if (sortBy !== 'recent') {
      params.set('sort', sortBy);
    }

    const newUrl = params.toString() ? `/board?${params.toString()}` : '/board';
    router.replace(newUrl, { scroll: false });
  }, [selectedCategory, sortBy, router]);

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

  // Reset posts when category or sort changes
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }, [selectedCategory, sortBy]);

  // Load posts with infinite scroll
  useEffect(() => {
    let cancelled = false;

    const loadPosts = async () => {
      // Don't load if no more posts (but allow first page)
      if (!hasMore && page > 1) return;

      setLoading(true);
      try {
        const response = await boardApi.getPosts({
          page,
          limit: 20,
          categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
          sort: sortBy,
        });

        if (cancelled) return;

        const newPosts = Array.isArray(response.data) ? response.data : [];

        setPosts(prev => {
          // If page 1, replace all posts
          if (page === 1) {
            return newPosts;
          }
          // Otherwise, append new posts and avoid duplicates
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueNewPosts];
        });

        // Check if there are more posts
        const hasMorePosts = newPosts.length === 20 && page < (response.pagination.totalPages || 1);
        setHasMore(hasMorePosts);
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load posts:', error);
          setHasMore(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPosts();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sortBy, page]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (loading || !hasMore) {
      // Clean up observer if conditions not met
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observerRef.current = observer;

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore]);

  // Show/hide top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowTopButton(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

      <div className="pb-6">
        {/* Category Tabs */}
        <div className="sticky top-14 z-40 bg-white border-b border-gray-200 px-4 py-3 mb-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => {
                if (selectedCategory !== 'all') {
                  setSortBy('recent'); // Reset sort when changing category
                }
                setSelectedCategory('all');
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              전체
            </button>

            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => {
                    if (selectedCategory !== category.id) {
                      setSortBy('recent'); // Reset sort when changing category
                    }
                    setSelectedCategory(category.id);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category.displayName || category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 mb-4 flex items-center justify-between">
          <CustomSelect
            value={sortBy}
            onChange={(value) => {
              setSortBy(value as 'recent' | 'popular' | 'views');
              setPage(1);
            }}
            options={[
              { value: 'recent', label: '최신순' },
              { value: 'popular', label: '인기순' },
              { value: 'views', label: '조회순' },
            ]}
          />

          <button
            onClick={handleWrite}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PenSquare className="w-4 h-4" />
            글쓰기
          </button>
        </div>

        {/* Posts List */}
        <div className="px-4">
          {loading && posts.length === 0 ? (
            <div className="py-20 text-center text-sm text-gray-500">로딩 중...</div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">게시글이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/board/${post.id}?from=${selectedCategory}&sort=${sortBy}`}
                  className="block bg-white rounded-xl p-4 hover:shadow-md transition-shadow border border-gray-100"
                >
                  <div className="space-y-2">
                    {/* Title with Category */}
                    <div className="flex items-start gap-2">
                      {selectedCategory === 'all' && post.category && (
                        <span
                          className="inline-flex px-2 py-0.5 rounded text-xs font-semibold text-white flex-shrink-0"
                          style={{ backgroundColor: post.category.color || '#6b7280' }}
                        >
                          {post.category.displayName || post.category.name}
                        </span>
                      )}
                      <h3 className="text-base font-semibold text-gray-900 line-clamp-2 flex-1">
                        {post.title}
                        {post.commentCount > 0 && (
                          <span className="ml-1.5 text-blue-600 text-sm font-bold">
                            [{post.commentCount}]
                          </span>
                        )}
                      </h3>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="font-medium text-gray-700">
                        {post.isAnonymous ? '익명' : (post.author?.nickname || post.author?.name)}
                      </span>
                      <span>•</span>
                      <span>{formatDate(post.createdAt)}</span>
                      <div className="flex items-center gap-3 ml-auto">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {post.viewCount}
                        </span>
                        <span className="flex items-center gap-1 text-red-500">
                          <Heart className="w-3.5 h-3.5" />
                          {post.likeCount}
                        </span>
                        <span className="flex items-center gap-1 text-blue-600">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {post.commentCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Infinite Scroll Loader */}
          {posts.length > 0 && hasMore && (
            <div ref={loadMoreRef} className="py-8 text-center">
              {loading ? (
                <>
                  <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-2 text-sm text-gray-500">더 많은 게시글 불러오는 중...</p>
                </>
              ) : (
                <div className="h-4"></div>
              )}
            </div>
          )}

          {/* No More Posts */}
          {posts.length > 0 && !hasMore && (
            <div className="py-8 text-center text-sm text-gray-500">
              더 이상 게시글이 없습니다
            </div>
          )}
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showTopButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110"
          aria-label="맨 위로"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </MobileLayout>
  );
}
