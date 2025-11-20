'use client';

import { X, Calendar, MapPin, Users, Heart, Share2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { bookmarksApi } from '@/lib/api/bookmarks';

interface GatheringDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  gathering: {
    id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    category: string;
    date: string;
    time?: string;
    location: string;
    locationDetail?: string;
    currentParticipants: number;
    maxParticipants: number;
    price: number;
    tags?: string[];
    host: {
      name: string;
      avatar?: string;
      bio?: string;
    };
  };
}

export default function GatheringDetailModal({
  isOpen,
  onClose,
  gathering,
}: GatheringDetailModalProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch bookmark status when modal opens
  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      if (isOpen && gathering.id) {
        try {
          const isBookmarked = await bookmarksApi.checkBookmark(gathering.id);
          setIsLiked(isBookmarked);
        } catch (error) {
          console.error('Failed to fetch bookmark status:', error);
        }
      }
    };

    fetchBookmarkStatus();
  }, [isOpen, gathering.id]);

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isLoading) return;

    setIsLoading(true);
    const previousState = isLiked;
    const newState = !isLiked;

    // Optimistic update
    setIsLiked(newState);

    try {
      if (!isLiked) {
        await bookmarksApi.addBookmark(gathering.id);
      } else {
        await bookmarksApi.removeBookmark(gathering.id);
      }

      // Dispatch event to notify other components
      window.dispatchEvent(
        new CustomEvent('bookmarkChanged', {
          detail: { gatheringId: gathering.id, isBookmarked: newState },
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

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    if (price === 0) return '무료';
    return `${price.toLocaleString()}원`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
  };

  const isFull = gathering.currentParticipants >= gathering.maxParticipants;
  const spotsLeft = gathering.maxParticipants - gathering.currentParticipants;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[480px] max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slide-up flex flex-col">
        {/* Header Image */}
        <div className="relative aspect-video bg-gray-100 flex-shrink-0">
          {gathering.thumbnail ? (
            <img
              src={gathering.thumbnail}
              alt={gathering.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-moa-primary/20 to-moa-accent/20">
              <span className="text-gray-400 text-6xl font-bold">MOA</span>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          {/* Category Badge */}
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
            <span className="text-sm font-bold text-moa-primary">{gathering.category}</span>
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={handleBookmarkToggle}
              disabled={isLoading}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md disabled:opacity-50"
            >
              <Heart
                className={`w-5 h-5 ${
                  isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`}
              />
            </button>
            <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Date & Time Bar - Below Image */}
        <div className="flex-shrink-0 bg-gray-50 px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-moa-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-moa-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-500 text-xs font-semibold mb-0.5">일시</p>
              <p className="text-gray-900 text-base font-bold">
                {formatDate(gathering.date)}
                {gathering.time && ` • ${gathering.time}`}
              </p>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-2xl font-black text-gray-900 mb-2">
                {gathering.title}
              </h1>
              {gathering.description && (
                <p className="text-base text-gray-600 leading-relaxed">
                  {gathering.description}
                </p>
              )}
            </div>

            {/* Info Cards */}
            <div className="space-y-3">
              {/* Location */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-moa-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-moa-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 mb-1">장소</p>
                  <p className="text-sm font-bold text-gray-900">{gathering.location}</p>
                  {gathering.locationDetail && (
                    <p className="text-sm text-gray-600 mt-1">
                      {gathering.locationDetail}
                    </p>
                  )}
                </div>
              </div>

              {/* Participants */}
              <div className="p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-moa-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-moa-primary" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">참가 인원</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-moa-primary">
                      {gathering.currentParticipants}
                    </span>
                    <span className="text-lg font-semibold text-gray-500">
                      / {gathering.maxParticipants}명
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isFull
                        ? 'bg-gray-400'
                        : spotsLeft <= 3
                        ? 'bg-red-500'
                        : 'bg-moa-primary'
                    }`}
                    style={{
                      width: `${Math.min(
                        (gathering.currentParticipants / gathering.maxParticipants) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>

                {/* Status Message */}
                {isFull ? (
                  <div className="flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 rounded-lg">
                    <span className="text-sm font-bold text-gray-600">
                      마감되었습니다
                    </span>
                  </div>
                ) : spotsLeft <= 3 ? (
                  <div className="flex items-center justify-center gap-2 py-2 px-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-bold text-red-600">
                      🔥 {spotsLeft}자리만 남았어요!
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-2 px-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-bold text-green-600">
                      ✓ 참가 가능
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {gathering.tags && gathering.tags.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-900 mb-3">태그</p>
                <div className="flex flex-wrap gap-2">
                  {gathering.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-moa-primary/10 text-moa-primary text-sm font-semibold rounded-lg"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Host Info */}
            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm font-bold text-gray-900 mb-3">호스트</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                  {gathering.host.avatar ? (
                    <img
                      src={gathering.host.avatar}
                      alt={gathering.host.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-moa-primary to-moa-accent">
                      <span className="text-white text-lg font-bold">
                        {gathering.host.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-gray-900">
                    {gathering.host.name}
                  </p>
                  {gathering.host.bio && (
                    <p className="text-sm text-gray-600 truncate">
                      {gathering.host.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Notice */}
            <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm text-gray-700">
                <p className="font-semibold text-orange-700 mb-1">참가 전 확인하세요</p>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li>• 모임 시간과 장소를 다시 한번 확인해주세요</li>
                  <li>• 참가 취소 시 호스트에게 알려주세요</li>
                  <li>• 모임 규칙을 준수해주세요</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex-shrink-0 p-5 bg-white border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500">참가비</p>
              <p className="text-2xl font-black text-moa-primary">
                {formatPrice(gathering.price)}
              </p>
            </div>
            <button
              disabled={isFull}
              className={`px-8 py-3.5 rounded-xl font-bold text-base transition-all ${
                isFull
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-moa-primary text-white hover:bg-moa-primary/90 active:scale-95'
              }`}
            >
              {isFull ? '마감됨' : '참가 신청'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
