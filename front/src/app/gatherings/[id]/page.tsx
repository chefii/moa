'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Heart,
  Share2,
  User,
  DollarSign,
  Tag as TagIcon,
  ArrowLeft,
  MessageCircle,
  Send,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Star,
} from 'lucide-react';
import { gatheringsApi, Gathering, GatheringStatus } from '@/lib/api/gatherings';
import Image from 'next/image';
import MobileLayout from '@/components/MobileLayout';
import { getImageUrl } from '@/lib/utils/imageUrl';

const STATUS_CONFIG: Record<GatheringStatus, { label: string; color: string; bgColor: string }> = {
  RECRUITING: { label: '모집중', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' },
  FULL: { label: '마감', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' },
  COMPLETED: { label: '완료', color: 'text-gray-600', bgColor: 'bg-gray-50 border-gray-200' },
  CANCELLED: { label: '취소', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' },
};

interface Comment {
  id: string;
  content: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
}

export default function GatheringDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [gathering, setGathering] = useState<Gathering | null>(null);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  // 기본 이미지 URL (이미지가 없을 때 사용)
  const DEFAULT_GATHERING_IMAGE = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop&q=80';

  // 갤러리 이미지 (이미지가 없으면 기본 이미지 사용)
  const galleryImages = gathering?.image?.url ? [
    getImageUrl(gathering.image.url),
    // 추가 이미지들을 여기에 넣을 수 있음
  ] : [DEFAULT_GATHERING_IMAGE];

  useEffect(() => {
    if (params.id) {
      fetchGathering(params.id as string);
    }
  }, [params.id]);

  const fetchGathering = async (id: string) => {
    try {
      setLoading(true);
      const data = await gatheringsApi.getGatheringById(id);
      setGathering(data);
    } catch (error) {
      console.error('Failed to fetch gathering:', error);
      alert('모임 정보를 불러올 수 없습니다.');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!gathering) return;

    if (confirm('이 모임에 참여하시겠습니까?')) {
      try {
        setIsJoining(true);
        // Join API 호출 (백엔드 API 구현 필요)
        // await gatheringsApi.joinGathering(gathering.id);
        alert('모임 참여 신청이 완료되었습니다!');
        fetchGathering(gathering.id);
      } catch (error) {
        console.error('Failed to join gathering:', error);
        alert('참여 신청에 실패했습니다.');
      } finally {
        setIsJoining(false);
      }
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: API 호출
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      userName: '나',
      createdAt: new Date().toISOString(),
    };

    setComments([comment, ...comments]);
    setNewComment('');
    // TODO: API 호출로 댓글 저장
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moa-primary mx-auto mb-4"></div>
          <div className="text-gray-600 font-semibold">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!gathering) {
    return null;
  }

  const statusConfig = STATUS_CONFIG[gathering.status];
  const scheduledDate = new Date(gathering.scheduledAt);
  const isFull = gathering.currentParticipants >= gathering.maxParticipants;
  const participationRate = (gathering.currentParticipants / gathering.maxParticipants) * 100;

  return (
    <MobileLayout>
      {/* Header with Background */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 active:text-gray-900 active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </div>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 active:scale-95 transition-transform"
            >
              <Heart
                className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
              />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 active:scale-95 transition-transform">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      {galleryImages.length > 0 && (
        <div className="relative w-full aspect-[16/9] bg-gray-900">
          <Image
            src={galleryImages[currentImageIndex]}
            alt={gathering.title}
            fill
            className="object-cover"
            priority
          />

          {/* Gallery Navigation */}
          {galleryImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              >
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </button>

              {/* Image Indicators */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                {galleryImages.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'w-6 bg-white'
                        : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="pb-24 bg-gray-50">
        {/* Title & Status Section */}
        <div className="bg-white px-4 py-5 border-b border-gray-100">
          <div className="flex items-start gap-2 mb-3">
            {gathering.category && (
              <div className="px-2.5 py-1 rounded-lg bg-moa-primary/10 border border-moa-primary/20">
                <span className="text-xs font-bold text-moa-primary">
                  {gathering.category.icon} {gathering.category.name}
                </span>
              </div>
            )}
            <div className={`px-2.5 py-1 rounded-lg border ${statusConfig.bgColor}`}>
              <span className={`text-xs font-bold ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-3 leading-tight">
            {gathering.title}
          </h1>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="font-bold text-gray-900">
                {gathering.currentParticipants}/{gathering.maxParticipants}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-gray-500" />
              <span className="font-bold text-gray-700">
                {gathering._count?.bookmarks || 0}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-gray-500" />
              <span className="font-bold text-gray-700">{comments.length}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isFull
                    ? 'bg-gray-400'
                    : participationRate >= 80
                    ? 'bg-orange-500'
                    : 'bg-moa-primary'
                }`}
                style={{ width: `${Math.min(participationRate, 100)}%` }}
              />
            </div>
            {!isFull && participationRate >= 80 && (
              <p className="text-xs font-bold text-orange-600 mt-2">
                🔥 마감 임박! {gathering.maxParticipants - gathering.currentParticipants}자리 남음
              </p>
            )}
          </div>
        </div>

        {/* Key Info Cards */}
        <div className="px-4 py-4 space-y-3">
          {/* Date & Time Card */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-500 mb-1">일시</div>
                <div className="text-base font-bold text-gray-900">
                  {scheduledDate.toLocaleDateString('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short',
                  })}
                </div>
                <div className="text-sm text-gray-600 mt-0.5">
                  {scheduledDate.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {gathering.durationMinutes && ` · ${gathering.durationMinutes}분`}
                </div>
              </div>
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-500 mb-1">장소</div>
                <div className="text-base font-bold text-gray-900">
                  {gathering.locationAddress}
                </div>
                {gathering.locationDetail && (
                  <div className="text-sm text-gray-600 mt-0.5">
                    {gathering.locationDetail}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Price Card */}
          {gathering.price > 0 && (
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-gray-500 mb-1">참가비</div>
                  <div className="text-xl font-bold text-gray-900">
                    {gathering.price.toLocaleString()}원
                  </div>
                  {gathering.depositAmount > 0 && (
                    <div className="text-sm text-gray-600 mt-0.5">
                      보증금 {gathering.depositAmount.toLocaleString()}원
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-white px-4 py-5 mt-2">
          <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-1 h-5 bg-moa-primary rounded-full"></div>
            모임 소개
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {gathering.description}
          </p>

          {/* Tags */}
          {gathering.tags && gathering.tags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {gathering.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Host Info */}
        {gathering.host && (
          <div className="bg-white px-4 py-5 mt-2">
            <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-moa-primary rounded-full"></div>
              호스트
            </h2>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-14 h-14 bg-moa-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {gathering.host.profileImage ? (
                  <Image
                    src={getImageUrl(gathering.host.profileImage)}
                    alt={gathering.host.name}
                    width={56}
                    height={56}
                    className="rounded-full"
                  />
                ) : (
                  <User className="w-7 h-7" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900 text-base">
                  {gathering.host.name}
                </div>
                {gathering.host.bio && (
                  <div className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                    {gathering.host.bio}
                  </div>
                )}
                <div className="flex items-center gap-1 mt-1.5">
                  <div className="px-2 py-0.5 bg-yellow-50 rounded text-xs font-bold text-yellow-700 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    호스트
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Participants */}
        {gathering.participants && gathering.participants.length > 0 && (
          <div className="bg-white px-4 py-5 mt-2">
            <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-moa-primary rounded-full"></div>
              참여자 ({gathering.currentParticipants}명)
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {gathering.participants.slice(0, 6).map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div className="w-10 h-10 bg-moa-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {participant.user.profileImage ? (
                      <Image
                        src={getImageUrl(participant.user.profileImage)}
                        alt={participant.user.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      participant.user.name[0]
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-800 truncate">
                    {participant.user.name}
                  </span>
                </div>
              ))}
            </div>
            {gathering.currentParticipants > 6 && (
              <div className="mt-3 text-center py-2 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-sm font-bold text-gray-600">
                  +{gathering.currentParticipants - 6}명 더 참여 중
                </span>
              </div>
            )}
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-white px-4 py-5 mt-2">
          <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-moa-primary rounded-full"></div>
            댓글 ({comments.length})
          </h2>

          {/* Comment Input */}
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="댓글을 입력하세요..."
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-moa-primary/20 focus:border-moa-primary"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-4 py-3 bg-moa-primary text-white rounded-xl font-bold active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">첫 댓글을 남겨보세요!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {comment.userAvatar ? (
                      <Image
                        src={getImageUrl(comment.userAvatar)}
                        alt={comment.userName}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      comment.userName[0]
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 text-sm">
                        {comment.userName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notice */}
        <div className="px-4 py-5 mt-2">
          <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-bold text-orange-800 mb-2">참가 전 확인사항</p>
              <ul className="space-y-1 text-xs text-gray-700">
                <li className="flex items-start gap-1">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>모임 시간과 장소를 다시 한번 확인해주세요</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>참가 취소 시 반드시 호스트에게 알려주세요</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>모임 규칙을 준수하고 즐거운 시간 보내세요!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Fixed Join Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-pb z-20">
        <div className="max-w-[480px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="text-xs text-gray-600 mb-1">참가비</div>
              <div className="text-xl font-black text-moa-primary">
                {gathering.price === 0
                  ? '무료'
                  : `${gathering.price.toLocaleString()}원`}
              </div>
            </div>
            <button
              onClick={handleJoin}
              disabled={
                gathering.status !== 'RECRUITING' ||
                gathering.currentParticipants >= gathering.maxParticipants ||
                isJoining
              }
              className="flex-1 px-6 py-4 bg-moa-primary text-white font-bold text-base rounded-xl active:scale-95 transition-transform disabled:bg-gray-300 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isJoining
                ? '처리중...'
                : gathering.status !== 'RECRUITING'
                ? '모집 마감'
                : gathering.currentParticipants >= gathering.maxParticipants
                ? '정원 마감'
                : '참여 신청하기'}
            </button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
