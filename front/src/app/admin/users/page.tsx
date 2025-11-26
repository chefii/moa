'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Filter,
  Download,
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
  Plus,
  MapPin,
  Users as UsersIcon,
  Lock,
  Edit2,
  FileText,
  Clock,
  Info,
} from 'lucide-react';
import { usersApi as adminUsersApi, AdminUser, AdminUserDetail, GetUsersParams, TermsAgreement, TermsAgreementStatistics } from '@/lib/api/admin/users';
import { usersVerificationApi } from '@/lib/api/admin/users-verification';
import { useToast } from '@/contexts/ToastContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { authApi } from '@/lib/api/auth';
import { commonCodesApi, CommonCode, Region } from '@/lib/api/common-codes';
import CustomSelect from '@/components/ui/CustomSelect';

export default function UsersManagementPage() {
  const { showSuccess, showError } = useToast();
  const { confirm } = useConfirm();
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Role editing state
  const [isEditingRoles, setIsEditingRoles] = useState(false);
  const [editingRoles, setEditingRoles] = useState<string[]>([]);
  const [editingPrimaryRole, setEditingPrimaryRole] = useState<string>('');
  const [roleChangeReason, setRoleChangeReason] = useState('');
  const [savingRoles, setSavingRoles] = useState(false);

  // Add User Modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [roles, setRoles] = useState<CommonCode[]>([]); // 필터링되지 않은 역할 목록 (편집용)
  const [filteredRoles, setFilteredRoles] = useState<CommonCode[]>([]); // 필터링된 역할 목록 (추가용)
  const [genders, setGenders] = useState<CommonCode[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);

  // Add User Form
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    nickname: '',
    phone: '',
    gender: '',
    age: '',
    role: 'USER',
    city: '',
    cityCode: '',
    district: '',
  });

  // Terms Agreements
  const [termsAgreements, setTermsAgreements] = useState<TermsAgreement[]>([]);
  const [termsStatistics, setTermsStatistics] = useState<TermsAgreementStatistics | null>(null);
  const [loadingTerms, setLoadingTerms] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, roleFilter]);

  // Handle search on Enter key or button click
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page
    fetchUsers(1);
  };

  // Load CommonCodes for add user form
  useEffect(() => {
    const loadCommonCodes = async () => {
      try {
        const [rolesData, gendersData, regionsData] = await Promise.all([
          commonCodesApi.getCommonCodes('ROLE'),
          commonCodesApi.getCommonCodes('GENDER'),
          commonCodesApi.getRegions(),
        ]);

        // 모든 역할 저장 (편집 시 사용)
        setRoles(rolesData);

        // 사용자 추가 폼에도 모든 역할 표시 (관리자 역할 포함)
        setFilteredRoles(rolesData);

        setGenders(gendersData);
        setRegions(regionsData);
      } catch (error) {
        console.error('Failed to load common codes:', error);
      }
    };

    loadCommonCodes();
  }, []);

  // Load districts when city changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (!formData.cityCode) {
        setDistricts([]);
        return;
      }

      try {
        const districtsData = await commonCodesApi.getDistricts(formData.cityCode);
        setDistricts(districtsData);
      } catch (error) {
        console.error('Failed to load districts:', error);
      }
    };

    loadDistricts();
  }, [formData.cityCode]);

  const fetchUsers = async (page: number) => {
    setLoading(true);
    try {
      const params: GetUsersParams = {
        page,
        limit: 10,
        search: searchQuery || undefined,
        role: roleFilter && roleFilter !== 'ALL' ? roleFilter : undefined,
      };
      const response = await adminUsersApi.getUsers(params);
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
    setIsEditingRoles(false); // Reset editing state
    try {
      const [userResponse, termsResponse] = await Promise.all([
        adminUsersApi.getUserById(userId),
        adminUsersApi.getUserTermsAgreements(userId).catch(err => {
          console.error('Failed to fetch terms agreements:', err);
          return null;
        }),
      ]);

      setSelectedUser(userResponse.data);

      if (termsResponse) {
        setTermsAgreements(termsResponse.data.terms);
        setTermsStatistics(termsResponse.data.statistics);
      }
    } catch (error) {
      console.error('Failed to fetch user detail:', error);
      setShowUserModal(false);
    } finally {
      setLoadingUserDetail(false);
    }
  };

  const handleStartEditRoles = () => {
    if (!selectedUser) return;
    const roleCodes = selectedUser.userRoles.map(ur => ur.roleCode);
    const primaryRole = selectedUser.userRoles.find(ur => ur.isPrimary)?.roleCode || roleCodes[0];
    setEditingRoles(roleCodes);
    setEditingPrimaryRole(primaryRole);
    setRoleChangeReason('');
    setIsEditingRoles(true);
  };

  const handleCancelEditRoles = () => {
    setIsEditingRoles(false);
    setEditingRoles([]);
    setEditingPrimaryRole('');
    setRoleChangeReason('');
  };

  const handleToggleRole = (roleCode: string) => {
    setEditingRoles(prev => {
      if (prev.includes(roleCode)) {
        const newRoles = prev.filter(r => r !== roleCode);
        // If removing primary role, set new primary
        if (roleCode === editingPrimaryRole && newRoles.length > 0) {
          setEditingPrimaryRole(newRoles[0]);
        }
        return newRoles;
      } else {
        return [...prev, roleCode];
      }
    });
  };

  const handleSaveRoles = async () => {
    if (!selectedUser || editingRoles.length === 0) {
      showError('최소 하나의 역할을 선택해야 합니다.');
      return;
    }

    setSavingRoles(true);
    try {
      await adminUsersApi.updateUserRoles(selectedUser.id, {
        roles: editingRoles,
        primaryRole: editingPrimaryRole,
        reason: roleChangeReason || undefined,
      });

      showSuccess('사용자 역할이 변경되었습니다.');
      setIsEditingRoles(false);

      // Refresh user detail
      await handleViewUserDetail(selectedUser.id);

      // Refresh user list
      fetchUsers(currentPage);
    } catch (error: any) {
      showError(error.response?.data?.message || '역할 변경에 실패했습니다.');
    } finally {
      setSavingRoles(false);
    }
  };

  const handleCloseModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  // 사용자 목록에서 특정 사용자 업데이트
  const updateUserInList = (userId: string, updates: Partial<AdminUser>) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, ...updates } : user
      )
    );
  };

  // Handle add user
  const handleAddUser = async () => {
    // Validation
    if (!formData.email || !formData.password || !formData.name) {
      showError('이메일, 비밀번호, 이름은 필수 입력 항목입니다.');
      return;
    }

    setAddUserLoading(true);
    try {
      await authApi.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        nickname: formData.nickname || undefined,
        phone: formData.phone || undefined,
        gender: formData.gender || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        location: formData.city && formData.district ? `${formData.city} ${formData.district}` : undefined,
        role: formData.role as any,
      });

      showSuccess('사용자가 성공적으로 추가되었습니다.');
      setShowAddUserModal(false);

      // Reset form
      setFormData({
        email: '',
        password: '',
        name: '',
        nickname: '',
        phone: '',
        gender: '',
        age: '',
        role: 'USER',
        city: '',
        cityCode: '',
        district: '',
      });

      // Refresh user list
      fetchUsers(currentPage);
    } catch (error: any) {
      showError(error.response?.data?.message || '사용자 추가에 실패했습니다.');
    } finally {
      setAddUserLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">사용자 관리</h1>
          <p className="text-gray-600">총 {pagination.total}명의 사용자</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-4 py-2 bg-moa-primary text-white font-semibold rounded-xl hover:shadow-lg transition-shadow flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            사용자 추가
          </button>
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            내보내기
          </button>
        </div>
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
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-primary"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-moa-primary text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            검색
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-moa-primary" />
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
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">이메일 인증</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">전화번호 인증</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">가입일</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((userData) => {
                    // Generate consistent color based on user ID
                    const colors = [
                      'from-blue-500 to-blue-600',
                      'from-purple-500 to-purple-600',
                      'from-pink-500 to-pink-600',
                      'from-green-500 to-green-600',
                      'from-orange-500 to-orange-600',
                      'from-teal-500 to-teal-600',
                      'from-indigo-500 to-indigo-600',
                      'from-red-500 to-red-600',
                    ];
                    const colorIndex = parseInt(userData.id.slice(-2), 16) % colors.length;
                    const gradientClass = colors[colorIndex];

                    return (
                    <tr key={userData.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {userData.profileImage ? (
                            <img
                              src={userData.profileImage}
                              alt={userData.name}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                            />
                          ) : (
                            <div className={`w-10 h-10 bg-gradient-to-br ${gradientClass} rounded-full flex items-center justify-center shadow-md`}>
                              <span className="text-white font-bold text-sm">
                                {userData.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{userData.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{userData.nickname || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{userData.email}</td>
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
                          'isPhoneVerified' in userData && userData.isPhoneVerified
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {'isPhoneVerified' in userData && userData.isPhoneVerified ? <CheckCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {'isPhoneVerified' in userData && userData.isPhoneVerified ? '인증됨' : '미인증'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(userData.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewUserDetail(userData.id)}
                          className="text-moa-primary hover:text-moa-primary-dark text-sm font-semibold transition-colors"
                        >
                          상세보기
                        </button>
                      </td>
                    </tr>
                    );
                  })}
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

      {/* User Detail Modal - Rendered via Portal */}
      {mounted && showUserModal && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 1000 }}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-moa-primary text-white p-6 rounded-t-3xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserIcon className="w-6 h-6" />
                <h2 className="text-2xl font-black">사용자 상세 정보</h2>
              </div>
              <div className="flex items-center gap-2">
                {selectedUser && (
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      const confirmed = await confirm({
                        title: '비밀번호 재설정',
                        message: `${selectedUser.name}님의 비밀번호를 1234 로 재설정하시겠습니까?`,
                        confirmText: '확인',
                        cancelText: '취소',
                        type: 'warning',
                      });

                      if (confirmed) {
                        try {
                          const response = await adminUsersApi.resetPassword(selectedUser.id);
                          showSuccess(response.message || '비밀번호가 "1234"로 재설정되었습니다.');
                        } catch (error: any) {
                          showError(error.response?.data?.message || '비밀번호 재설정에 실패했습니다.');
                        }
                      }
                    }}
                    className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                    <Lock className="w-4 h-4" />
                    비밀번호 재설정
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            {loadingUserDetail ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-moa-primary" />
                <span className="ml-3 text-gray-600">사용자 정보를 불러오는 중...</span>
              </div>
            ) : selectedUser ? (
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="bg-gradient-to-br from-moa-primary/10 to-moa-accent/10 rounded-2xl p-6 border border-moa-primary/20">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-moa-primary" />
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
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">역할</p>
                        {!isEditingRoles && (
                          <button
                            onClick={handleStartEditRoles}
                            className="text-xs text-moa-primary hover:text-moa-primary-dark font-semibold flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            역할 변경
                          </button>
                        )}
                      </div>

                      {!isEditingRoles ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.userRoles.map((userRole, index) => {
                            const roleName = roles.find(r => r.code === userRole.roleCode)?.name || userRole.roleCode;
                            return (
                              <span
                                key={index}
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                                  userRole.roleCode.includes('ADMIN')
                                    ? 'bg-red-100 text-red-700'
                                    : userRole.roleCode.includes('BUSINESS')
                                    ? 'bg-moa-primary/10 text-moa-primary'
                                    : userRole.roleCode.includes('HOST')
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {roleName}
                                {userRole.isPrimary && (
                                  <Star className="w-3 h-3 fill-current" />
                                )}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl max-h-64 overflow-y-auto">
                            {roles.map((role) => (
                              <label
                                key={role.code}
                                className="flex items-start gap-2 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={editingRoles.includes(role.code)}
                                  onChange={() => handleToggleRole(role.code)}
                                  className="mt-0.5 w-4 h-4 text-moa-primary border-gray-300 rounded focus:ring-moa-primary"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-900">{role.name}</span>
                                    {editingRoles.includes(role.code) && editingPrimaryRole === role.code && (
                                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    )}
                                  </div>
                                  {role.description && (
                                    <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>
                                  )}
                                </div>
                                {editingRoles.includes(role.code) && editingRoles.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setEditingPrimaryRole(role.code);
                                    }}
                                    className={`text-xs px-2 py-1 rounded ${
                                      editingPrimaryRole === role.code
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                  >
                                    주역할
                                  </button>
                                )}
                              </label>
                            ))}
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              변경 사유 (선택)
                            </label>
                            <textarea
                              value={roleChangeReason}
                              onChange={(e) => setRoleChangeReason(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-primary"
                              rows={2}
                              placeholder="역할 변경 사유를 입력하세요..."
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={handleCancelEditRoles}
                              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                              취소
                            </button>
                            <button
                              onClick={handleSaveRoles}
                              disabled={savingRoles || editingRoles.length === 0}
                              className="flex-1 px-4 py-2 bg-moa-primary text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {savingRoles ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  저장 중...
                                </>
                              ) : (
                                '저장'
                              )}
                            </button>
                          </div>
                        </div>
                      )}
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
                                showSuccess('인증 이메일을 재발송했습니다.');
                              } catch (error) {
                                showError('인증 이메일 재발송에 실패했습니다.');
                              }
                            }}
                            className="text-xs text-moa-primary hover:underline"
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
                          <p className="text-xl font-bold text-moa-primary">
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
                      <Star className="w-5 h-5 text-moa-primary" />
                      관심사
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.interests.map((interest, index) => (
                        <div
                          key={index}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${
                            interest.category.color || 'from-moa-primary to-moa-accent'
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

                {/* Terms Agreements */}
                {termsAgreements.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-moa-primary" />
                      약관 동의 현황
                    </h3>

                    {/* Terms List - Clean Table Style */}
                    <div className="overflow-hidden border border-gray-200 rounded-xl">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">약관명</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 w-24">구분</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 w-32">동의일시</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 w-24">상태</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {termsAgreements.map((term) => (
                            <tr key={term.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900">{term.title}</span>
                                  <span className="text-xs text-gray-400">v{term.version}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                                  term.isRequired
                                    ? 'bg-red-50 text-red-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {term.isRequired ? '필수' : '선택'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {term.agreed && term.agreedAt ? (
                                  <span className="text-xs text-gray-600">
                                    {new Date(term.agreedAt).toLocaleDateString('ko-KR', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                    })}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {term.agreed ? (
                                  <div className="flex items-center justify-center gap-1">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="text-xs font-semibold text-green-700">동의</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-1">
                                    <X className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs font-semibold text-gray-500">미동의</span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Warning for missing required terms */}
                    {termsStatistics && termsStatistics.requiredCompletionRate < 100 && (
                      <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                        <p className="text-xs text-orange-700">일부 필수 약관에 동의하지 않았습니다.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {!selectedUser.isVerified && (
                      <button
                        onClick={async () => {
                          const confirmed = await confirm({
                            message: '이메일 인증을 승인하시겠습니까?',
                            type: 'info'
                          });
                          if (confirmed) {
                            try {
                              await usersVerificationApi.updateVerificationStatus(selectedUser.id, {
                                isVerified: true,
                              });
                              showSuccess('이메일 인증이 승인되었습니다.');

                              // 사용자 목록 업데이트
                              updateUserInList(selectedUser.id, {
                                isVerified: true,
                                emailVerifiedAt: new Date().toISOString(),
                              });

                              // 상세 정보 새로고침
                              handleViewUserDetail(selectedUser.id);
                            } catch (error) {
                              showError('인증 승인에 실패했습니다.');
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
                          const confirmed = await confirm({
                            message: '전화번호 인증을 승인하시겠습니까?',
                            type: 'info'
                          });
                          if (confirmed) {
                            try {
                              await usersVerificationApi.updateVerificationStatus(selectedUser.id, {
                                isPhoneVerified: true,
                              });
                              showSuccess('전화번호 인증이 승인되었습니다.');

                              // 사용자 목록 업데이트
                              updateUserInList(selectedUser.id, {
                                isPhoneVerified: true,
                                phoneVerifiedAt: new Date().toISOString(),
                              });

                              // 상세 정보 새로고침
                              handleViewUserDetail(selectedUser.id);
                            } catch (error) {
                              showError('인증 승인에 실패했습니다.');
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
        </div>,
        document.body
      )}

      {/* Add User Modal */}
      {mounted && showAddUserModal && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 1000 }}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-moa-primary text-white p-6 rounded-t-3xl flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <UsersIcon className="w-6 h-6" />
                <h2 className="text-2xl font-black">사용자 추가</h2>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Required Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  필수 정보
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      이메일 *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-primary"
                      placeholder="user@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Lock className="w-4 h-4 inline mr-1" />
                      비밀번호 *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-primary"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <UserIcon className="w-4 h-4 inline mr-1" />
                      이름 *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-primary"
                      placeholder="홍길동"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Shield className="w-4 h-4 inline mr-1" />
                      역할 *
                    </label>
                    <CustomSelect
                      value={formData.role}
                      onChange={(value) => setFormData({ ...formData, role: value })}
                      options={filteredRoles.map((role) => ({ value: role.code, label: role.name }))}
                      placeholder="역할 선택"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Fields */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">추가 정보 (선택)</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">닉네임</label>
                    <input
                      type="text"
                      value={formData.nickname}
                      onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-primary"
                      placeholder="귀여운펭귄"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      전화번호
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-primary"
                      placeholder="010-1234-5678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">성별</label>
                    <CustomSelect
                      value={formData.gender}
                      onChange={(value) => setFormData({ ...formData, gender: value })}
                      options={[
                        { value: '', label: '선택 안함' },
                        ...genders.map((gender) => ({ value: gender.code, label: gender.name })),
                      ]}
                      placeholder="성별 선택"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      나이
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-primary"
                      placeholder="25"
                      min="14"
                      max="120"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      시/도
                    </label>
                    <CustomSelect
                      value={formData.cityCode}
                      onChange={(value) => {
                        const selectedRegion = regions.find((r) => r.code === value);
                        setFormData({
                          ...formData,
                          cityCode: value,
                          city: selectedRegion?.name || '',
                          district: '',
                        });
                      }}
                      options={[
                        { value: '', label: '선택 안함' },
                        ...regions.map((region) => ({ value: region.code, label: region.name })),
                      ]}
                      placeholder="시/도 선택"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">구/군</label>
                    <CustomSelect
                      value={formData.district}
                      onChange={(value) => setFormData({ ...formData, district: value })}
                      options={[
                        { value: '', label: '선택 안함' },
                        ...districts.map((district) => ({ value: district.name, label: district.name })),
                      ]}
                      placeholder="구/군 선택"
                      disabled={!formData.cityCode}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleAddUser}
                  disabled={addUserLoading}
                  className="flex-1 px-6 py-3 bg-moa-primary text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addUserLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      추가 중...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      사용자 추가
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
