'use client';

import { useState, useEffect } from 'react';
import { Search, Shield, Users, Crown, Briefcase, Star, Loader2 } from 'lucide-react';
import { usersApi, AdminUser } from '@/lib/api/admin/users';
import { UserRole } from '@/store/authStore';
import CustomSelect from '@/components/ui/CustomSelect';
import { useToast } from '@/contexts/ToastContext';
import { commonCodesApi, CommonCode } from '@/lib/api/common-codes';

interface RoleStats {
  totalUsers: number;
  roles: Record<string, number>;
}

interface RoleInfo {
  value: string;
  label: string;
  icon: any;
  description: string;
  color: string;
}

export default function RolesPage() {
  const { showSuccess, showError } = useToast();
  const [stats, setStats] = useState<RoleStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('USER');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [roleDefinitions, setRoleDefinitions] = useState<RoleInfo[]>([]);

  // Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState<string>('');

  // Get icon for role
  const getRoleIcon = (code: string) => {
    switch (code) {
      case 'USER': return Users;
      case 'VERIFIED_USER': return Shield;
      case 'HOST': return Star;
      case 'PREMIUM_USER': return Crown;
      case 'BUSINESS_PENDING':
      case 'BUSINESS_USER':
      case 'BUSINESS_MANAGER':
        return Briefcase;
      case 'MODERATOR':
      case 'CONTENT_MANAGER':
      case 'SUPPORT_MANAGER':
      case 'SETTLEMENT_MANAGER':
      case 'ADMIN':
        return Shield;
      case 'SUPER_ADMIN': return Crown;
      default: return Users;
    }
  };

  // Load roles from common codes
  const fetchRoles = async () => {
    try {
      const rolesData = await commonCodesApi.getCommonCodes('ROLE');
      const definitions: RoleInfo[] = rolesData.map((role) => ({
        value: role.code,
        label: role.name,
        icon: getRoleIcon(role.code),
        description: role.description || '',
        color: 'bg-gray-100 text-gray-800 border-gray-300', // 기본 색상
      }));
      setRoleDefinitions(definitions);

      // 첫 번째 역할을 기본 선택
      if (definitions.length > 0) {
        setSelectedRole(definitions[0].value);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      showError('권한 목록을 불러오는데 실패했습니다.');
    }
  };

  // Fetch role statistics
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getRoleStatistics();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch role statistics:', error);
      showError('권한 통계를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users by role
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await usersApi.getUsers({
        role: selectedRole,
        search,
        page,
        limit: 20,
      });

      setUsers(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalUsers(response.pagination.total);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showError('사용자 목록을 불러오는데 실패했습니다.');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchStats();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      setPage(1);
      fetchUsers();
    }
  }, [selectedRole]);

  useEffect(() => {
    if (selectedRole) {
      fetchUsers();
    }
  }, [page]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  // Handle edit role
  const handleEditRole = (user: AdminUser) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowEditModal(true);
  };

  // Handle update role
  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      await usersApi.updateUserRole(selectedUser.id, { role: newRole });
      showSuccess('역할이 성공적으로 변경되었습니다.');
      setShowEditModal(false);
      fetchUsers();
      fetchStats(); // Refresh statistics
    } catch (error) {
      console.error('Failed to update user role:', error);
      showError('역할 변경에 실패했습니다.');
    }
  };

  // Get role info
  const getRoleInfo = (roleValue: string) => {
    return roleDefinitions.find((r) => r.value === roleValue);
  };

  return (
    <div className="p-6 h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-900">관리자 권한 관리</h1>
        <p className="mt-2 text-gray-600">
          사용자별 역할을 관리하고 권한을 부여합니다.
        </p>
      </div>

      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Left Sidebar - Role List */}
        <div className="w-80 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 bg-gradient-to-r from-moa-primary to-moa-accent">
            <h2 className="text-lg font-bold text-white">권한 목록</h2>
            <p className="text-sm text-white/80 mt-1">
              총 {stats?.totalUsers.toLocaleString() || 0}명
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-moa-primary" />
              </div>
            ) : (
              <div className="space-y-1">
                {roleDefinitions.map((role) => {
                  const Icon = role.icon;
                  const count = stats?.roles[role.value] || 0;
                  const isSelected = selectedRole === role.value;

                  return (
                    <button
                      key={role.value}
                      onClick={() => setSelectedRole(role.value)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                        isSelected
                          ? 'bg-gradient-to-r from-moa-primary to-moa-accent text-white shadow-lg scale-105'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-moa-primary'}`} />
                          <span className="font-bold text-sm">{role.label}</span>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                          isSelected ? 'bg-white/20' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {count.toLocaleString()}명
                        </div>
                      </div>
                      <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                        {role.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Content - User List */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
          {/* Selected Role Header */}
          {selectedRole && (
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {(() => {
                    const roleInfo = getRoleInfo(selectedRole);
                    const Icon = roleInfo?.icon;
                    return (
                      <>
                        {Icon && <Icon className="w-6 h-6 text-moa-primary" />}
                        <div>
                          <h2 className="text-2xl font-black text-gray-900">
                            {roleInfo?.label}
                          </h2>
                          <p className="text-sm text-gray-600 mt-1">
                            {roleInfo?.description}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-moa-primary">
                    {totalUsers.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">명의 사용자</div>
                </div>
              </div>

              {/* Search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="이름, 이메일, 닉네임으로 검색"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moa-primary focus:border-transparent"
                  />
                </div>
              </form>
            </div>
          )}

          {/* Users Table */}
          <div className="flex-1 overflow-y-auto">
            {usersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-moa-primary" />
                <span className="ml-3 text-gray-600">사용자 목록을 불러오는 중...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Users className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-lg font-semibold">사용자가 없습니다</p>
                <p className="text-sm">이 권한을 가진 사용자가 아직 없습니다.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      사용자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      이메일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      인증
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      가입일
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-moa-primary to-moa-accent flex items-center justify-center overflow-hidden">
                            {user.profileImage ? (
                              <img
                                src={user.profileImage}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-bold">
                                {user.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="font-semibold text-gray-900">{user.name}</div>
                            {user.nickname && (
                              <div className="text-sm text-gray-500">@{user.nickname}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                            <Shield className="w-3 h-3" />
                            인증됨
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">미인증</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleEditRole(user)}
                          className="text-moa-primary hover:text-moa-primary-dark font-semibold text-sm transition-colors"
                        >
                          역할 변경
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {page} / {totalPages} 페이지
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    다음
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Role Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">역할 변경</h3>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-moa-primary to-moa-accent flex items-center justify-center overflow-hidden">
                  {selectedUser.profileImage ? (
                    <img
                      src={selectedUser.profileImage}
                      alt={selectedUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {selectedUser.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">{selectedUser.name}</div>
                  <div className="text-sm text-gray-500">{selectedUser.email}</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">
                  현재 역할: <span className="font-semibold text-gray-900">{getRoleInfo(selectedUser.role)?.label}</span>
                </div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  새로운 역할
                </label>
                <CustomSelect
                  value={newRole}
                  onChange={(value) => setNewRole(value)}
                  options={roleDefinitions.map((opt) => ({ value: opt.value, label: opt.label }))}
                  placeholder="새로운 역할 선택"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleUpdateRole}
                className="flex-1 px-4 py-3 text-white bg-gradient-to-r from-moa-primary to-moa-accent rounded-xl hover:shadow-lg font-semibold transition-all"
              >
                변경
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
