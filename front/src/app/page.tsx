'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import MobileLayout from '@/components/MobileLayout';
import MobileHeader from '@/components/MobileHeader';
import GatheringCard from '@/components/GatheringCard';
import CategoryGrid from '@/components/CategoryGrid';
import { bannersApi, Banner } from '@/lib/api/banners';
import { gatheringsApi, Gathering } from '@/lib/api/gatherings';
import { categoriesApi, Category } from '@/lib/api/categories';
import { getImageUrl } from '@/lib/utils/imageUrl';
import {
  Dumbbell,
  Utensils,
  Book,
  Camera,
  Music,
  Palette,
  Heart,
  Users,
  TrendingUp,
  Sparkles,
  Plus,
  ChevronRight,
  Search,
  Calendar,
  User,
  MessageSquare,
  LucideIcon,
} from 'lucide-react';

// 아이콘이 emoji인지 확인하는 함수
const isEmoji = (str?: string): boolean => {
  if (!str) return false;
  // emoji 범위 체크 (대부분의 emoji는 이 범위에 포함됨)
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(str);
};

export default function Home() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mainBanners, setMainBanners] = useState<Banner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [popularGatherings, setPopularGatherings] = useState<Gathering[]>([]);
  const [newGatherings, setNewGatherings] = useState<Gathering[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Drag/Swipe states
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Auto-slide banner every 5 seconds
  useEffect(() => {
    if (mainBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % mainBanners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [mainBanners.length]);

  // Fetch main banner and gatherings on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch main banners
        const banners = await bannersApi.getActiveBanners('MAIN_BANNER');
        setMainBanners(banners);

        // Increment view count for first banner
        if (banners.length > 0) {
          await bannersApi.incrementView(banners[0].id);
        }

        // Fetch popular gatherings
        const popularData = await gatheringsApi.getGatherings({
          sort: 'popular',
          limit: 3,
          status: 'RECRUITING',
        });
        setPopularGatherings(popularData.data);

        // Fetch new gatherings
        const newData = await gatheringsApi.getGatherings({
          sort: 'recent',
          limit: 3,
          status: 'RECRUITING',
        });
        setNewGatherings(newData.data);

        // Fetch categories (only GATHERING type and featured for main page) 
        const categoriesData = await categoriesApi.getCategories({ type: 'GATHERING', featured: true }); //GATHERING 모임 카테고리에서 featured=true 만 조회
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGatheringClick = (gathering: Gathering) => {
    // Navigate to gathering detail page
    router.push(`/gatherings/${gathering.id}`);
  };

  const handleBannerClick = async (banner: Banner) => {
    // Don't trigger click if user was dragging
    if (isDragging || (touchStart && touchEnd && Math.abs(touchStart - touchEnd) > 10)) {
      return;
    }

    if (banner && banner.linkUrl) {
      // Increment click count
      try {
        await bannersApi.incrementClick(banner.id);
        // Navigate to link URL
        window.open(banner.linkUrl, '_blank');
      } catch (error) {
        console.error('Failed to increment click count:', error);
      }
    }
  };

  const goToBanner = (index: number) => {
    setCurrentBannerIndex(index);
  };

  // Minimum swipe distance (in pixels) to trigger slide change
  const minSwipeDistance = 50;

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  // Handle touch end
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // 왼쪽 스와이프 - 다음 배너로 (마지막이면 처음으로)
      setCurrentBannerIndex((prev) => (prev + 1) % mainBanners.length);
    }

    if (isRightSwipe) {
      // 오른쪽 스와이프 - 이전 배너로 (첫번째면 마지막으로)
      setCurrentBannerIndex((prev) => (prev - 1 + mainBanners.length) % mainBanners.length);
    }

    setIsDragging(false);
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Handle mouse events for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchEnd(null);
    setTouchStart(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTouchEnd(e.clientX);
  };

  const handleMouseUp = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // 왼쪽 스와이프 - 다음 배너로 (마지막이면 처음으로)
      setCurrentBannerIndex((prev) => (prev + 1) % mainBanners.length);
    }

    if (isRightSwipe) {
      // 오른쪽 스와이프 - 이전 배너로 (첫번째면 마지막으로)
      setCurrentBannerIndex((prev) => (prev - 1 + mainBanners.length) % mainBanners.length);
    }

    setIsDragging(false);
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setTouchStart(null);
      setTouchEnd(null);
    }
  };

  return (
    <MobileLayout>
      {/* Header */}
      <MobileHeader />

      {/* Hero Banner Slider */}
      <section className="relative overflow-hidden">
        {/* Banner Slides */}
        <div className="relative">
          {mainBanners.length > 0 ? (
            <>
              {/* Slider Container */}
              <div
                className="flex transition-transform duration-500 ease-in-out cursor-grab active:cursor-grabbing select-none"
                style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
              >
                {mainBanners.map((banner, index) => (
                  <div key={banner.id} className="min-w-full relative">
                    {/* Background Image */}
                    {banner.image?.url && (
                      <>
                        <div className="absolute inset-0 w-full h-full">
                          <Image
                            src={getImageUrl(banner.image.url)}
                            alt={banner.title}
                            fill
                            className="object-cover"
                            priority={index === 0}
                          />
                        </div>
                        {/* Dark overlay for text readability */}
                        <div className="absolute inset-0 bg-black/40" />
                      </>
                    )}

                    {/* Content */}
                    <div
                      className={`relative px-5 py-20 ${
                        !banner.image?.url ? 'bg-gradient-to-br from-moa-primary/10 via-moa-accent/10 to-orange-50' : ''
                      }`}
                      onClick={() => handleBannerClick(banner)}
                    >
                      <div className="text-center">
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${
                            banner.image?.url ? 'bg-white/20 backdrop-blur-md' : 'bg-white/90 backdrop-blur-sm'
                          } rounded-full shadow-sm mb-4`}
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${banner.image?.url ? 'text-white' : 'text-moa-primary'}`} />
                          <span className={`text-xs font-semibold ${banner.image?.url ? 'text-white' : 'text-gray-700'}`}>
                            1,234개 모임 진행 중
                          </span>
                        </div>

                        <h1 className={`text-2xl font-black mb-2 ${banner.image?.url ? 'text-white' : 'text-gray-900'}`}>
                          {banner.title}
                        </h1>
                        {banner.description && (
                          <p className={`text-sm mb-6 ${banner.image?.url ? 'text-white/90' : 'text-gray-600'}`}>
                            {banner.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Indicators */}
              {mainBanners.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                  {mainBanners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToBanner(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentBannerIndex
                          ? 'bg-white w-6'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Go to banner ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Default banner when no banners */
            <div className="relative px-5 py-8 bg-gradient-to-br from-moa-primary/10 via-moa-accent/10 to-orange-50">
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-moa-primary" />
                  <span className="text-xs font-semibold text-gray-700">
                    1,234개 모임 진행 중
                  </span>
                </div>

                <h1 className="text-2xl font-black mb-2 text-gray-900">
                  관심사로 모이는 사람들
                </h1>
                <p className="text-sm mb-6 text-gray-600">
                  지금 바로 새로운 사람들과<br />
                  특별한 경험을 만들어보세요
                </p>

                <Link
                  href="/create-gathering"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-moa-primary text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
                >
                  <Plus className="w-5 h-5" />
                  모임 만들기
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="pb-6 bg-white">
        <div className="mb-4 px-5">
          {/* <h2 className="text-lg font-black text-gray-900">카테고리</h2> */}
        </div>
        <CategoryGrid categories={categories} />
      </section>

      {/* Popular Gatherings */}
      <section className="px-5 py-6 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-moa-primary" />
            <h2 className="text-lg font-black text-gray-900">인기 모임</h2>
          </div>
          <Link
            href="/gatherings?sort=popular"
            className="flex items-center gap-1 text-sm font-semibold text-moa-primary"
          >
            전체
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">로딩 중...</div>
          ) : popularGatherings.length > 0 ? (
            popularGatherings.map((gathering) => (
              <GatheringCard
                key={gathering.id}
                id={gathering.id}
                title={gathering.title}
                description={gathering.description}
                thumbnail={gathering.image?.url}
                category={gathering.category?.name || '기타'}
                date={new Date(gathering.scheduledAt).toLocaleDateString()}
                time={new Date(gathering.scheduledAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                location={gathering.locationAddress}
                locationDetail={gathering.locationDetail}
                currentParticipants={gathering.currentParticipants}
                maxParticipants={gathering.maxParticipants}
                price={gathering.price}
                tags={gathering.tags}
                host={{
                  name: gathering.host?.name || '호스트',
                  avatar: gathering.host?.profileImage,
                  bio: gathering.host?.bio,
                }}
                onClick={() => handleGatheringClick(gathering)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              모집 중인 인기 모임이 없습니다
            </div>
          )}
        </div>
      </section>

      {/* New Gatherings */}
      <section className="px-5 py-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-moa-primary" />
            <h2 className="text-lg font-black text-gray-900">새로운 모임</h2>
          </div>
          <Link
            href="/gatherings?sort=recent"
            className="flex items-center gap-1 text-sm font-semibold text-moa-primary"
          >
            전체
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">로딩 중...</div>
          ) : newGatherings.length > 0 ? (
            newGatherings.map((gathering) => (
              <GatheringCard
                key={gathering.id}
                id={gathering.id}
                title={gathering.title}
                description={gathering.description}
                thumbnail={gathering.image?.url}
                category={gathering.category?.name || '기타'}
                date={new Date(gathering.scheduledAt).toLocaleDateString()}
                time={new Date(gathering.scheduledAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                location={gathering.locationAddress}
                locationDetail={gathering.locationDetail}
                currentParticipants={gathering.currentParticipants}
                maxParticipants={gathering.maxParticipants}
                price={gathering.price}
                tags={gathering.tags}
                host={{
                  name: gathering.host?.name || '호스트',
                  avatar: gathering.host?.profileImage,
                  bio: gathering.host?.bio,
                }}
                onClick={() => handleGatheringClick(gathering)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              새로 생성된 모임이 없습니다
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-5 py-8 bg-gradient-to-br from-moa-primary to-moa-accent text-center">
        <h2 className="text-xl font-black text-white mb-2">
          나만의 모임을 만들어보세요
        </h2>
        <p className="text-sm text-white/90 mb-4">
          호스트가 되어 관심사를 공유하고<br />
          새로운 친구들을 만나보세요
        </p>
        <Link
          href="/create-gathering"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-moa-primary font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5" />
          모임 만들기
        </Link>
      </section>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 bg-white border-t border-gray-200 px-5 py-3 flex items-center justify-around">
        <Link href="/" className="flex flex-col items-center gap-1 text-moa-primary">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </div>
          <span className="text-xs font-semibold">홈</span>
        </Link>

        <Link href="/gatherings" className="flex flex-col items-center gap-1 text-gray-400">
          <Search className="w-5 h-5" />
          <span className="text-xs font-semibold">둘러보기</span>
        </Link>

        <Link
          href="/board"
          className="flex flex-col items-center gap-1 -mt-6"
        >
          <div className="w-14 h-14 bg-moa-primary rounded-full flex items-center justify-center shadow-lg">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          <span className="text-xs font-semibold text-gray-400 mt-1">MOA</span>
        </Link>

        <Link href="/my-gatherings" className="flex flex-col items-center gap-1 text-gray-400">
          <Calendar className="w-5 h-5" />
          <span className="text-xs font-semibold">내 모임</span>
        </Link>

        <Link href="/profile" className="flex flex-col items-center gap-1 text-gray-400">
          <User className="w-5 h-5" />
          <span className="text-xs font-semibold">MY</span>
        </Link>
      </nav>
    </MobileLayout>
  );
}
