'use client';

import { useEffect, useState } from 'react';
import { X, Mail, Phone, MapPin, Calendar, Shield, Star, Flame, Heart } from 'lucide-react';
import { usersApi, AdminUserDetail } from '@/lib/api/admin/users';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function UserDetailModal({ isOpen, onClose, userId }: UserDetailModalProps) {
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadUserDetail();
    }
  }, [isOpen, userId]);

  const loadUserDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await usersApi.getUserById(userId);
      if (response.success) {
        setUser(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load user detail:', err);
      setError(err.response?.data?.message || '사용자 정보를 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">회원 상세 정보</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={loadUserDetail}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                다시 시도
              </button>
            </div>
          ) : user ? (
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                  {user.nickname && (
                    <p className="text-gray-600">@{user.nickname}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {user.userRoles.map((role, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          role.isPrimary
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {role.roleCode}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  기본 정보
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">이메일</p>
                      <p className="font-medium text-gray-900">{user.email}</p>
                    </div>
                    {user.isVerified && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                        인증됨
                      </span>
                    )}
                  </div>

                  {user.phone && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">전화번호</p>
                        <p className="font-medium text-gray-900">{user.phone}</p>
                      </div>
                      {user.isPhoneVerified && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          인증됨
                        </span>
                      )}
                    </div>
                  )}

                  {user.location && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">지역</p>
                        <p className="font-medium text-gray-900">{user.location}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">가입일</p>
                      <p className="font-medium text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Stats */}
              {(user.userLevel || user.userStreak) && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    활동 통계
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {user.userLevel && (
                      <div className="p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">레벨</p>
                        <p className="text-2xl font-bold text-orange-600">
                          Lv.{user.userLevel.level}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {user.userLevel.growthPoints} GP
                        </p>
                      </div>
                    )}

                    {user.userStreak && (
                      <div className="p-3 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                          <Flame className="w-4 h-4" />
                          연속 출석
                        </p>
                        <p className="text-2xl font-bold text-red-600">
                          {user.userStreak.currentStreak}일
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          최장 {user.userStreak.longestStreak}일
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Interests */}
              {user.interests && user.interests.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    관심 카테고리
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
                      >
                        {interest.category.icon} {interest.category.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Business Profile */}
              {user.businessProfile && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">비즈니스 프로필</h4>
                  <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">
                        {user.businessProfile.businessName}
                      </p>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.businessProfile.isApproved
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {user.businessProfile.isApproved ? '승인됨' : '승인 대기'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      사업자번호: {user.businessProfile.businessNumber}
                    </p>
                    {user.businessProfile.businessPhone && (
                      <p className="text-sm text-gray-600">
                        대표번호: {user.businessProfile.businessPhone}
                      </p>
                    )}
                    {user.businessProfile.businessAddress && (
                      <p className="text-sm text-gray-600">
                        주소: {user.businessProfile.businessAddress}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Bio */}
              {user.bio && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">소개</h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{user.bio}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">사용자 정보를 찾을 수 없습니다</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
