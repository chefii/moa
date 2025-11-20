'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { Plus, Edit, Trash2, Eye, EyeOff, Award, ChevronDown, Check, X } from 'lucide-react';

type BadgeCategory = 'BASIC' | 'HOST' | 'SPECIAL' | 'SEASONAL';

interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  conditionType: string;
  conditionValue: number;
  isActive: boolean;
  createdAt: string;
  _count?: {
    userBadges: number;
  };
}

interface BadgeFormData {
  code: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  conditionType: string;
  conditionValue: number;
  isActive: boolean;
}

const BADGE_CATEGORIES = [
  { value: 'BASIC', label: '기본', color: 'bg-green-100 text-green-800' },
  { value: 'HOST', label: '호스트', color: 'bg-purple-100 text-purple-800' },
  { value: 'SPECIAL', label: '특별', color: 'bg-blue-100 text-blue-800' },
  { value: 'SEASONAL', label: '시즌', color: 'bg-orange-100 text-orange-800' },
];

const CONDITION_TYPES = [
  { value: 'ATTENDANCE_RATE', label: '참석률 (%)'  },
  { value: 'HOSTING_COUNT', label: '모임 주최 횟수' },
  { value: 'PARTICIPATION_COUNT', label: '모임 참여 횟수' },
  { value: 'REVIEW_COUNT', label: '리뷰 작성 횟수' },
  { value: 'STREAK_DAYS', label: '연속 출석 일수' },
  { value: 'RATING_SCORE', label: '평균 평점 (x10)' },
  { value: 'EARLY_USER', label: '초기 가입자 순위' },
  { value: 'NO_LATE', label: '지각 0회' },
  { value: 'CHAT_COUNT', label: '채팅 횟수' },
  { value: 'FRIEND_COUNT', label: '친구 수' },
  { value: 'CHALLENGE_COUNT', label: '챌린지 완료 수' },
];

// Custom Dropdown Component
function CustomDropdown({
  value,
  onChange,
  options,
  placeholder,
  required = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  required?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 transition-colors"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
            {!required && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between transition-colors"
              >
                <span className="text-gray-500">{placeholder}</span>
                {!value && <Check className="w-4 h-4 text-blue-600" />}
              </button>
            )}
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between transition-colors"
              >
                <span>{option.label}</span>
                {value === option.value && <Check className="w-4 h-4 text-blue-600" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterActive, setFilterActive] = useState<string>('');
  const [showRankingDropdown, setShowRankingDropdown] = useState(false);

  const [formData, setFormData] = useState<BadgeFormData>({
    code: '',
    name: '',
    description: '',
    icon: '',
    category: 'BASIC',
    conditionType: 'ATTENDANCE_RATE',
    conditionValue: 0,
    isActive: true,
  });

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory) params.append('category', filterCategory);
      if (filterActive) params.append('isActive', filterActive);

      const response = await apiClient.get(`/api/admin/badges?${params.toString()}`);
      if (response.data.success) {
        setBadges(response.data.data);
      }
    } catch (error) {
      console.error('배지 목록 조회 실패:', error);
      alert('배지 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, [filterCategory, filterActive]);

  // 모달 열릴 때 배경 스크롤 방지
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // cleanup
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingBadge) {
        await apiClient.put(`/api/admin/badges/${editingBadge.id}`, formData);
        alert('배지가 수정되었습니다.');
      } else {
        await apiClient.post('/api/admin/badges', formData);
        alert('배지가 추가되었습니다.');
      }

      setShowModal(false);
      setEditingBadge(null);
      resetForm();
      fetchBadges();
    } catch (error: any) {
      const message = error.response?.data?.message || '작업에 실패했습니다.';
      alert(message);
    }
  };

  const handleEdit = (badge: Badge) => {
    setEditingBadge(badge);
    setFormData({
      code: badge.code,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
      conditionType: badge.conditionType,
      conditionValue: badge.conditionValue,
      isActive: badge.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 배지를 삭제하시겠습니까?')) return;

    try {
      await apiClient.delete(`/api/admin/badges/${id}`);
      alert('배지가 삭제되었습니다.');
      fetchBadges();
    } catch (error: any) {
      const message = error.response?.data?.message || '삭제에 실패했습니다.';
      alert(message);
    }
  };

  const handleToggleActive = async (badge: Badge) => {
    try {
      await apiClient.patch(`/api/admin/badges/${badge.id}/toggle`);
      fetchBadges();
    } catch (error) {
      alert('상태 변경에 실패했습니다.');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      icon: '',
      category: 'BASIC',
      conditionType: 'ATTENDANCE_RATE',
      conditionValue: 0,
      isActive: true,
    });
  };

  const getCategoryInfo = (category: BadgeCategory) => {
    return BADGE_CATEGORIES.find((c) => c.value === category) || BADGE_CATEGORIES[0];
  };

  const getConditionTypeLabel = (type: string) => {
    return CONDITION_TYPES.find((c) => c.value === type)?.label || type;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">배지 관리</h1>
        <p className="text-gray-600">사용자가 획득할 수 있는 배지를 관리합니다.</p>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="w-48">
          <CustomDropdown
            value={filterCategory}
            onChange={setFilterCategory}
            options={BADGE_CATEGORIES}
            placeholder="전체 카테고리"
          />
        </div>

        <div className="w-40">
          <CustomDropdown
            value={filterActive}
            onChange={setFilterActive}
            options={[
              { value: 'true', label: '활성' },
              { value: 'false', label: '비활성' },
            ]}
            placeholder="전체 상태"
          />
        </div>

        <div className="flex-1" />

        <button
          onClick={() => {
            setEditingBadge(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          <Plus className="w-5 h-5" />
          배지 추가
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">전체 배지</p>
          <p className="text-2xl font-bold text-gray-900">{badges.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 mb-1">활성 배지</p>
          <p className="text-2xl font-bold text-green-900">{badges.filter((b) => b.isActive).length}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">비활성 배지</p>
          <p className="text-2xl font-bold text-gray-900">{badges.filter((b) => !b.isActive).length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 relative">
          <p className="text-sm text-purple-700 mb-1">🏆 인기 배지</p>
          {(() => {
            const sortedBadges = badges
              .sort((a, b) => (b._count?.userBadges || 0) - (a._count?.userBadges || 0));

            if (sortedBadges.length === 0) {
              return <p className="text-2xl font-bold text-purple-900">-</p>;
            }

            const topBadge = sortedBadges[0];
            return (
              <>
                <button
                  onClick={() => setShowRankingDropdown(!showRankingDropdown)}
                  className="w-full text-left hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{topBadge.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-bold text-purple-900 truncate">{topBadge.name}</p>
                      <p className="text-sm text-purple-700">{topBadge._count?.userBadges || 0}명 획득</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-purple-700 transition-transform ${showRankingDropdown ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {showRankingDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowRankingDropdown(false)} />
                    <div className="absolute z-20 left-0 right-0 top-full mt-2 bg-white border border-purple-200 rounded-lg shadow-xl max-h-80 overflow-auto">
                      <div className="p-3">
                        <p className="text-xs font-semibold text-purple-700 mb-2 px-2">전체 배지 순위</p>
                        <div className="space-y-1">
                          {sortedBadges.map((badge, index) => (
                            <div
                              key={badge.id}
                              className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
                                index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' :
                                index === 1 ? 'bg-gray-50' :
                                index === 2 ? 'bg-orange-50/30' :
                                'hover:bg-gray-50'
                              }`}
                            >
                              <span className="text-xs font-bold text-gray-500 w-8">{index + 1}위</span>
                              <span className="text-2xl">{badge.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{badge.name}</p>
                                <p className="text-xs text-gray-500 truncate">{badge.description}</p>
                              </div>
                              <span className="text-sm font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                                {badge._count?.userBadges || 0}명
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* Badges Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      ) : badges.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Award className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">배지가 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    배지
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    획득 조건
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    획득자
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {badges.map((badge) => {
                  const categoryInfo = getCategoryInfo(badge.category);
                  return (
                    <tr key={badge.id} className={`hover:bg-gray-50 ${!badge.isActive ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{badge.icon}</div>
                          <div>
                            <p className="font-semibold text-gray-900">{badge.name}</p>
                            <p className="text-sm text-gray-500">{badge.description}</p>
                            <p className="text-xs text-gray-400 mt-0.5">코드: {badge.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${categoryInfo.color}`}>
                          {categoryInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900">{getConditionTypeLabel(badge.conditionType)}</p>
                        <p className="text-sm text-gray-500">{badge.conditionValue}</p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                          {badge._count?.userBadges || 0}명
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleToggleActive(badge)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                            badge.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {badge.isActive ? (
                            <>
                              <Eye className="w-3 h-3" />
                              활성
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              비활성
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(badge)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="수정"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(badge.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setShowModal(false);
            setEditingBadge(null);
            resetForm();
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBadge ? '배지 수정' : '배지 추가'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingBadge(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  배지 코드 *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  disabled={!!editingBadge}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="ATTENDANCE_KING"
                  required
                />
                {editingBadge && (
                  <p className="mt-1 text-xs text-gray-500">코드는 수정할 수 없습니다.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  배지 이름 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="출석왕"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명 *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="참석률 95% 이상"
                  rows={2}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  아이콘 (이모지) *
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="✅"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리 *
                  </label>
                  <CustomDropdown
                    value={formData.category}
                    onChange={(value) => setFormData({ ...formData, category: value as BadgeCategory })}
                    options={BADGE_CATEGORIES}
                    placeholder="카테고리 선택"
                    required={true}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    획득 조건 유형 *
                  </label>
                  <CustomDropdown
                    value={formData.conditionType}
                    onChange={(value) => setFormData({ ...formData, conditionType: value })}
                    options={CONDITION_TYPES}
                    placeholder="조건 유형 선택"
                    required={true}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  획득 조건 값 *
                </label>
                <input
                  type="number"
                  value={formData.conditionValue}
                  onChange={(e) => setFormData({ ...formData, conditionValue: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="95"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  활성화
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBadge(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  {editingBadge ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
