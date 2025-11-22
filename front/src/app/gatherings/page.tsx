'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import MobileLayout from '@/components/MobileLayout';
import GatheringCard from '@/components/GatheringCard';
import GatheringDetailModal from '@/components/GatheringDetailModal';
import { gatheringsApi, Gathering } from '@/lib/api/gatherings';
import { categoriesApi, Category } from '@/lib/api/categories';
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  Loader2,
  Grid3x3,
  List,
  TrendingUp,
  Clock,
  Calendar as CalendarIcon,
  RefreshCw,
} from 'lucide-react';

export default function GatheringsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [gatherings, setGatherings] = useState<Gathering[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('categoryId') || null
  );
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'upcoming'>(
    (searchParams.get('sort') as any) || 'recent'
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGathering, setSelectedGathering] = useState<Gathering | null>(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesApi.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch gatherings
  useEffect(() => {
    const fetchGatherings = async () => {
      setLoading(true);
      try {
        const response = await gatheringsApi.getGatherings({
          page,
          limit: 20,
          categoryId: selectedCategory || undefined,
          sort: sortBy,
        });
        setGatherings(response.data);
        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        console.error('Failed to fetch gatherings:', error);
        setGatherings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGatherings();
  }, [page, selectedCategory, sortBy]);

  const handleGatheringClick = (gathering: Gathering) => {
    setSelectedGathering(gathering);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGathering(null);
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setPage(1);
    setShowFilters(false);
  };

  const handleSortChange = (sort: 'recent' | 'popular' | 'upcoming') => {
    setSortBy(sort);
    setPage(1);
  };

  const handleRefresh = () => {
    setPage(1);
    setSelectedCategory(null);
    setSortBy('recent');
    setSearchQuery('');
  };

  // Filter by search query (client-side)
  const filteredGatherings = searchQuery
    ? gatherings.filter((g) =>
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : gatherings;

  return (
    <MobileLayout>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="모임 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-moa-primary focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${
              showFilters
                ? 'bg-moa-primary text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>

          <button
            onClick={handleRefresh}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 active:scale-95 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Sort Tabs */}
        <div className="flex items-center gap-2 px-4 pb-3">
          <button
            onClick={() => handleSortChange('recent')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              sortBy === 'recent'
                ? 'bg-moa-primary text-white'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            최신순
          </button>
          <button
            onClick={() => handleSortChange('popular')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              sortBy === 'popular'
                ? 'bg-moa-primary text-white'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            인기순
          </button>
          <button
            onClick={() => handleSortChange('upcoming')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              sortBy === 'upcoming'
                ? 'bg-moa-primary text-white'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            다가오는
          </button>
        </div>

        {/* Category Filters */}
        {showFilters && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-4 animate-slide-down">
            <p className="text-xs font-bold text-gray-500 mb-3">카테고리</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange(null)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  !selectedCategory
                    ? 'bg-moa-primary text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                전체
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    selectedCategory === category.id
                      ? 'bg-moa-primary text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {/* Results Info */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                로딩중...
              </span>
            ) : (
              <>
                총 <span className="font-bold text-moa-primary">{filteredGatherings.length}</span>개의 모임
              </>
            )}
          </p>
          {selectedCategory && (
            <button
              onClick={() => handleCategoryChange(null)}
              className="flex items-center gap-1 text-sm text-moa-primary font-semibold"
            >
              필터 초기화
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Gatherings List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-moa-primary animate-spin" />
          </div>
        ) : filteredGatherings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              모임을 찾을 수 없습니다
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              다른 카테고리나 검색어를 시도해보세요
            </p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2.5 bg-moa-primary text-white font-semibold rounded-lg active:scale-95 transition-all"
            >
              전체 모임 보기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGatherings.map((gathering) => (
              <GatheringCard
                key={gathering.id}
                id={gathering.id}
                title={gathering.title}
                thumbnail={gathering.image?.url}
                category={gathering.category?.name || '기타'}
                date={gathering.scheduledAt}
                location={gathering.locationAddress}
                locationDetail={gathering.locationDetail}
                description={gathering.description}
                tags={gathering.tags}
                currentParticipants={gathering.currentParticipants}
                maxParticipants={gathering.maxParticipants}
                price={gathering.price}
                host={{
                  name: gathering.host?.name || '익명',
                  avatar: gathering.host?.profileImage?.url,
                  bio: gathering.host?.bio,
                }}
                onClick={() => handleGatheringClick(gathering)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredGatherings.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 mb-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 active:scale-95 transition-all"
            >
              이전
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <button
                    key={i}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                      page === pageNum
                        ? 'bg-moa-primary text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
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
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 active:scale-95 transition-all"
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* Gathering Detail Modal */}
      {selectedGathering && (
        <GatheringDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          gathering={{
            id: selectedGathering.id,
            title: selectedGathering.title,
            description: selectedGathering.description,
            thumbnail: selectedGathering.image?.url,
            category: selectedGathering.category?.name || '기타',
            date: selectedGathering.scheduledAt,
            location: selectedGathering.locationAddress,
            locationDetail: selectedGathering.locationDetail,
            currentParticipants: selectedGathering.currentParticipants,
            maxParticipants: selectedGathering.maxParticipants,
            price: selectedGathering.price,
            tags: selectedGathering.tags,
            host: {
              name: selectedGathering.host?.name || '익명',
              avatar: selectedGathering.host?.profileImage?.url,
              bio: selectedGathering.host?.bio,
            },
          }}
        />
      )}
    </MobileLayout>
  );
}
