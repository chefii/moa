'use client';

import RoleGuard from '@/components/auth/RoleGuard';
import { UserRole, useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  Shield,
  BarChart3,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Activity,
  Loader2,
  X,
  Mail,
  Phone,
  Calendar,
  Award,
  Flame,
  Star
} from 'lucide-react';
import { usersApi, User, UserDetail } from '@/lib/api/users';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeGatherings: 0,
    businessAccounts: 0,
    monthlyRevenue: 0,
    reportedIssues: 0,
    resolvedIssues: 0,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // Fetch user statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userStats = await usersApi.getUserStats();
        setStats(prev => ({
          ...prev,
          totalUsers: userStats.totalUsers,
          businessAccounts: userStats.roleStats.BUSINESS_ADMIN || 0,
        }));
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  // Fetch users when switching to users tab or when page changes
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers(currentPage);
    }
  }, [activeTab, currentPage]);

  const fetchUsers = async (page: number) => {
    setLoading(true);
    try {
      const response = await usersApi.getUsers(page, 10);
      console.log('Users API Response:', response);
      console.log('Users data:', response.data);
      console.log('Pagination:', response.pagination);
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
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

  const recentGatherings = [
    { id: '1', title: '요리 클래스', host: '쿠킹스튜디오', status: 'active', participants: 12 },
    { id: '2', title: '북클럽 모임', host: '김독서', status: 'active', participants: 8 },
    { id: '3', title: '등산 동호회', host: '산악회', status: 'pending', participants: 15 },
    { id: '4', title: '와인 클래스', host: '뱅뱅', status: 'active', participants: 10 },
  ];

  return (
    <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN]}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-purple-100 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-purple-600" />
                <div>
                  <h1 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    관리자 대시보드
                  </h1>
                  <p className="text-sm text-gray-600">플랫폼 전체 관리</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-purple-600">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-white/80 backdrop-blur-lg rounded-2xl p-2 shadow-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              개요
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              사용자 관리
            </button>
            <button
              onClick={() => setActiveTab('gatherings')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'gatherings'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              모임 관리
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-purple-100">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-blue-500" />
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">총 사용자</p>
                  <p className="text-3xl font-black text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                </div>

                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-purple-100">
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="w-8 h-8 text-purple-500" />
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">진행중인 모임</p>
                  <p className="text-3xl font-black text-gray-900">{stats.activeGatherings.toLocaleString()}</p>
                </div>

                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-purple-100">
                  <div className="flex items-center justify-between mb-4">
                    <Building2 className="w-8 h-8 text-pink-500" />
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">비즈니스 계정</p>
                  <p className="text-3xl font-black text-gray-900">{stats.businessAccounts.toLocaleString()}</p>
                </div>
              </div>

              {/* Revenue & Issues */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-purple-100">
                  <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-900">월 수익</h3>
                  </div>
                  <p className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    ₩{(stats.monthlyRevenue / 10000).toLocaleString()}만
                  </p>
                  <p className="text-sm text-green-600 font-semibold">▲ 전월 대비 +12.5%</p>
                </div>

                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-purple-100">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                    <h3 className="text-lg font-bold text-gray-900">신고 처리</h3>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">대기중</p>
                      <p className="text-3xl font-black text-orange-600">{stats.reportedIssues}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">해결완료</p>
                      <p className="text-3xl font-black text-green-600">{stats.resolvedIssues}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
              <div className="p-6 border-b border-purple-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">전체 사용자 ({pagination.total}명)</h3>
                {loading && (
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                )}
              </div>
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
                      <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">이름</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">이메일</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">역할</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">인증 상태</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">가입일</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">액션</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-100">
                        {users.map((userData) => (
                          <tr key={userData.id} className="hover:bg-purple-50/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{userData.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{userData.email}</td>
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
                                {userData.isVerified ? 'Verified' : 'Pending'}
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
                    <div className="px-6 py-4 border-t border-purple-100 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {currentPage} / {pagination.totalPages} 페이지
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => prev - 1)}
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-white border border-purple-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          이전
                        </button>
                        <button
                          onClick={() => setCurrentPage(prev => prev + 1)}
                          disabled={currentPage === pagination.totalPages}
                          className="px-4 py-2 bg-white border border-purple-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          다음
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'gatherings' && (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
              <div className="p-6 border-b border-purple-100">
                <h3 className="text-xl font-bold text-gray-900">모임 관리</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">제목</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">호스트</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">참여자</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">상태</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-100">
                    {recentGatherings.map((gathering) => (
                      <tr key={gathering.id} className="hover:bg-purple-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{gathering.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{gathering.host}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{gathering.participants}명</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            gathering.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {gathering.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {gathering.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-purple-600 hover:text-purple-700 text-sm font-semibold">
                            관리
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* User Detail Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-3xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6" />
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
                        <p className="text-sm text-gray-600 mb-1">인증 상태</p>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                          selectedUser.isVerified
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {selectedUser.isVerified ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          {selectedUser.isVerified ? 'Verified' : 'Pending'}
                        </span>
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
                      <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
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
                      <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
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

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleCloseModal}
                      className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
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
      </div>
    </RoleGuard>
  );
}
