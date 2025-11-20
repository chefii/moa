'use client';

import { Calendar, MapPin, Users, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { bookmarksApi } from '@/lib/api/bookmarks';
import { getImageUrl } from '@/lib/utils/imageUrl';

interface GatheringCardProps {
  id: string;
  title: string;
  thumbnail?: string;
  category: string;
  date: string;
  time?: string;
  location: string;
  locationDetail?: string;
  description?: string;
  tags?: string[];
  currentParticipants: number;
  maxParticipants: number;
  price: number;
  host: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  onClick?: () => void;
}

export default function GatheringCard({
  id,
  title,
  thumbnail,
  category,
  date,
  time,
  location,
  currentParticipants,
  maxParticipants,
  price,
  host,
  onClick,
}: GatheringCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch bookmark status on mount
  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      try {
        const isBookmarked = await bookmarksApi.checkBookmark(id);
        setIsLiked(isBookmarked);
      } catch (error) {
        // Silently fail - user might not be logged in
        console.debug('Failed to fetch bookmark status:', error);
      }
    };

    fetchBookmarkStatus();

    // Listen for bookmark changes from other components
    const handleBookmarkChange = (event: CustomEvent) => {
      if (event.detail.gatheringId === id) {
        setIsLiked(event.detail.isBookmarked);
      }
    };

    window.addEventListener('bookmarkChanged' as any, handleBookmarkChange as any);

    return () => {
      window.removeEventListener('bookmarkChanged' as any, handleBookmarkChange as any);
    };
  }, [id]);

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    setIsLoading(true);
    const previousState = isLiked;
    const newState = !isLiked;

    // Optimistic update
    setIsLiked(newState);

    try {
      if (!isLiked) {
        await bookmarksApi.addBookmark(id);
      } else {
        await bookmarksApi.removeBookmark(id);
      }

      // Dispatch event to notify other components
      window.dispatchEvent(
        new CustomEvent('bookmarkChanged', {
          detail: { gatheringId: id, isBookmarked: newState },
        })
      );
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      // Revert on error
      setIsLiked(previousState);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return '무료';
    return `${price.toLocaleString()}원`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';

    // ISO 8601 형식으로 변환하여 파싱 (모바일 브라우저 호환성)
    const date = new Date(dateStr);

    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateStr);
      return dateStr; // 원본 문자열 반환
    }

    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${month}/${day} (${dayOfWeek})`;
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-100 overflow-hidden">
          {thumbnail ? (
            <img
              src={getImageUrl(thumbnail)}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-moa-primary/20 to-moa-accent/20">
              <span className="text-gray-400 text-4xl font-bold">MOA</span>
            </div>
          )}

          {/* Like Button */}
          <button
            onClick={handleBookmarkToggle}
            disabled={isLoading}
            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md disabled:opacity-50"
          >
            <Heart
              className={`w-5 h-5 ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>

          {/* Category Badge */}
          <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full">
            <span className="text-xs font-semibold text-moa-primary">{category}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-moa-primary transition-colors">
            {title}
          </h3>

          {/* Info */}
          <div className="space-y-2 mb-3">
            {/* Date & Time */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>
                {formatDate(date)}
                {time && ` ${time}`}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>

            {/* Participants */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>
                {currentParticipants}/{maxParticipants}명
              </span>
              {maxParticipants - currentParticipants <= 3 && maxParticipants - currentParticipants > 0 && (
                <span className="text-xs text-red-500 font-semibold">
                  {maxParticipants - currentParticipants}자리 남음!
                </span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            {/* Host */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded-full overflow-hidden">
                {host.avatar ? (
                  <img src={getImageUrl(host.avatar)} alt={host.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-moa-primary to-moa-accent">
                    <span className="text-white text-xs font-bold">
                      {host.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-600">{host.name}</span>
            </div>

            {/* Price */}
            <span className="text-lg font-bold text-moa-primary">
              {formatPrice(price)}
            </span>
          </div>
        </div>
    </div>
  );
}
