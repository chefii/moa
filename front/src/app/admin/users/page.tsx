'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  User as UserIcon,
  X,
  Mail,
  Phone,
  Calendar,
  Award,
  Flame,
  Star,
  Shield,
  Loader2,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { usersApi, User, UserDetail } from '@/lib/api/users';
import { usersVerificationApi } from '@/lib/api/admin/users-verification';

// Toast 알림 타입
interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page: number) => {
    setLoading(true);
    try {
      const response = await usersApi.getUsers(page, 10);
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toast 알림 표시 함수
  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);

    // 3초 후 자동 제거
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const handleViewUserDetail = async (userId: string) => {
    setLoadingUserDetail(true);
    setShowUserModal(true);
    try {
      const userDetail = await usersApi.getUserById(userId);
      setSelectedUser(userDetail);
    } catch (error) {
      console.error('Failed to fetch user detail:', error);
      setShowUserModal(false);
    } finally {
      setLoadingUserDetail(false);
    }
  };

  const handleCloseModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">사용자 관리</h1>
          <p className="text-gray-600">총 {pagination.total}명의 사용자</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-shadow flex items-center gap-2">
          <Download className="w-4 h-4" />
          내보내기
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="이름, 이메일로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            필터
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-3 text-gray-600">사용자 목록을 불러오는 중...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            등록된 사용자가 없습니다.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">사용자</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">닉네임</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">이메일</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">위치</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">역할</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">이메일 인증</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">전화번호 인증</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">가입일</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((userData) => (
                    <tr key={userData.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {userData.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{userData.name}</p>
                            <p className="text-sm text-gray-500">{userData.phone || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{userData.nickname || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{userData.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{userData.location || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          userData.role === 'SUPER_ADMIN'
                            ? 'bg-red-100 text-red-700'
                            : userData.role === 'BUSINESS_ADMIN'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {userData.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          userData.isVerified
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {userData.isVerified ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {userData.isVerified ? '인증됨' : '미인증'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          userData.isPhoneVerified
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {userData.isPhoneVerified ? <CheckCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {userData.isPhoneVerified ? '인증됨' : '미인증'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(userData.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewUserDetail(userData.id)}
                          className="text-purple-600 hover:text-purple-700 text-sm font-semibold transition-colors"
                        >
                          상세보기
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {currentPage} / {pagination.totalPages} 페이지
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Detail Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-3xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserIcon className="w-6 h-6" />
                <h2 className="text-2xl font-black">사용자 상세 정보</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            {loadingUserDetail ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <span className="ml-3 text-gray-600">사용자 정보를 불러오는 중...</span>
              </div>
            ) : selectedUser ? (
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    기본 정보
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">이름</p>
                      <p className="text-lg font-bold text-gray-900">{selectedUser.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">닉네임</p>
                      <p className="text-lg font-bold text-gray-900">{selectedUser.nickname || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">역할</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedUser.role === 'SUPER_ADMIN'
                          ? 'bg-red-100 text-red-700'
                          : selectedUser.role === 'BUSINESS_ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {selectedUser.role}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        이메일
                      </p>
                      <p className="text-sm font-semibold text-gray-900">{selectedUser.email}</p>
                    </div>
                    {selectedUser.phone && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          전화번호
                        </p>
                        <p className="text-sm font-semibold text-gray-900">{selectedUser.phone}</p>
                      </div>
                    )}
                    {selectedUser.location && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">위치</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedUser.location}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        가입일
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(selectedUser.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">이메일 인증</p>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                          selectedUser.isVerified
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {selectedUser.isVerified ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          {selectedUser.isVerified ? '인증됨' : '미인증'}
                        </span>
                        {!selectedUser.isVerified && (
                          <button
                            onClick={async () => {
                              try {
                                await usersVerificationApi.resendVerificationEmail(selectedUser.id);
                                showToast('success', '인증 이메일을 재발송했습니다.');
                              } catch (error) {
                                showToast('error', '인증 이메일 재발송에 실패했습니다.');
                              }
                            }}
                            className="text-xs text-purple-600 hover:underline"
                          >
                            재발송
                          </button>
                        )}
                      </div>
                      {selectedUser.emailVerifiedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(selectedUser.emailVerifiedAt).toLocaleDateString('ko-KR')}에 인증
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">전화번호 인증</p>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedUser.isPhoneVerified
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {selectedUser.isPhoneVerified ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        {selectedUser.isPhoneVerified ? '인증됨' : '미인증'}
                      </span>
                      {selectedUser.phoneVerifiedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(selectedUser.phoneVerifiedAt).toLocaleDateString('ko-KR')}에 인증
                        </p>
                      )}
                    </div>
                  </div>
                  {selectedUser.bio && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-1">소개</p>
                      <p className="text-sm text-gray-900">{selectedUser.bio}</p>
                    </div>
                  )}
                </div>

                {/* Trust System Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* User Level */}
                  {selectedUser.userLevel && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-600" />
                        레벨
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">현재 레벨</p>
                          <div className="flex items-center gap-2">
                            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                            <p className="text-3xl font-black text-gray-900">
                              {selectedUser.userLevel.level}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">성장 포인트</p>
                          <p className="text-xl font-bold text-purple-600">
                            {selectedUser.userLevel.growthPoints.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* User Streak */}
                  {selectedUser.userStreak && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-600" />
                        활동 스트릭
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">현재 연속 기록</p>
                          <div className="flex items-center gap-2">
                            <Flame className="w-6 h-6 text-orange-500" />
                            <p className="text-3xl font-black text-gray-900">
                              {selectedUser.userStreak.currentStreak}
                            </p>
                            <span className="text-sm text-gray-600">일</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">최장 연속 기록</p>
                          <p className="text-xl font-bold text-orange-600">
                            {selectedUser.userStreak.longestStreak}일
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Interests */}
                {selectedUser.interests && selectedUser.interests.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-purple-600" />
                      관심사
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.interests.map((interest, index) => (
                        <div
                          key={index}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${
                            interest.category.color || 'from-purple-500 to-pink-500'
                          } text-white`}
                        >
                          {interest.category.icon && (
                            <span className="text-base">{interest.category.icon}</span>
                          )}
                          <span>{interest.category.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {!selectedUser.isVerified && (
                      <button
                        onClick={async () => {
                          if (confirm('이메일 인증을 승인하시겠습니까?')) {
                            try {
                              await usersVerificationApi.updateVerificationStatus(selectedUser.id, {
                                isVerified: true,
                              });
                              showToast('success', '이메일 인증이 승인되었습니다.');
                              handleViewUserDetail(selectedUser.id);
                            } catch (error) {
                              showToast('error', '인증 승인에 실패했습니다.');
                            }
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-sm"
                      >
                        이메일 인증 승인
                      </button>
                    )}
                    {!selectedUser.isPhoneVerified && (
                      <button
                        onClick={async () => {
                          if (confirm('전화번호 인증을 승인하시겠습니까?')) {
                            try {
                              await usersVerificationApi.updateVerificationStatus(selectedUser.id, {
                                isPhoneVerified: true,
                              });
                              showToast('success', '전화번호 인증이 승인되었습니다.');
                              handleViewUserDetail(selectedUser.id);
                            } catch (error) {
                              showToast('error', '인증 승인에 실패했습니다.');
                            }
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm"
                      >
                        전화번호 인증 승인
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                사용자 정보를 불러올 수 없습니다.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[60] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-lg animate-in slide-in-from-right duration-300 ${
              toast.type === 'success'
                ? 'bg-green-50/95 border-green-200 text-green-800'
                : 'bg-red-50/95 border-red-200 text-red-800'
            }`}
            style={{
              animation: 'slideInRight 0.3s ease-out',
            }}
          >
            {toast.type === 'success' ? (
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            ) : (
              <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
            )}
            <p className="font-semibold text-sm">{toast.message}</p>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className={`ml-4 p-1 rounded-full transition-colors ${
                toast.type === 'success'
                  ? 'hover:bg-green-200'
                  : 'hover:bg-red-200'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Keyframes for animation */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
