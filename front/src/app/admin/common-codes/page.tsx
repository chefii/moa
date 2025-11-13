'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileCode,
} from 'lucide-react';
import {
  commonCodesApi,
  CommonCode,
  CreateCommonCodeDto,
  UpdateCommonCodeDto,
} from '@/lib/api/admin/common-codes';

interface GroupedCodes {
  [key: string]: CommonCode[];
}

interface SuperGroup {
  name: string;
  subGroups: string[];
}

export default function CommonCodesPage() {
  const [codes, setCodes] = useState<CommonCode[]>([]);
  const [groupedCodes, setGroupedCodes] = useState<GroupedCodes>({});
  const [superGroups, setSuperGroups] = useState<{ [key: string]: SuperGroup }>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Selected states
  const [expandedSuperGroups, setExpandedSuperGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCode, setSelectedCode] = useState<CommonCode | null>(null);
  const [formData, setFormData] = useState<CreateCommonCodeDto>({
    groupCode: '',
    code: '',
    name: '',
    description: '',
    value: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const response = await commonCodesApi.getCommonCodes(1, 1000);
      setCodes(response.data);

      // Group codes by groupCode
      const grouped: GroupedCodes = {};
      response.data.forEach((code) => {
        if (!grouped[code.groupCode]) {
          grouped[code.groupCode] = [];
        }
        grouped[code.groupCode].push(code);
      });

      // Sort codes within each group by order
      Object.keys(grouped).forEach((key) => {
        grouped[key].sort((a, b) => a.order - b.order);
      });

      setGroupedCodes(grouped);

      // Create super groups structure
      const supers: { [key: string]: SuperGroup } = {};
      Object.keys(grouped).forEach((groupCode) => {
        // Parse super group (first part before underscore)
        const parts = groupCode.split('_');
        const superGroupName = parts[0];

        if (!supers[superGroupName]) {
          supers[superGroupName] = {
            name: superGroupName,
            subGroups: [],
          };
        }
        supers[superGroupName].subGroups.push(groupCode);
      });

      // Sort subGroups
      Object.values(supers).forEach((superGroup) => {
        superGroup.subGroups.sort();
      });

      setSuperGroups(supers);

      // Auto expand first super group
      if (Object.keys(supers).length > 0) {
        setExpandedSuperGroups([Object.keys(supers)[0]]);
      }
    } catch (error) {
      console.error('Failed to fetch common codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSuperGroup = (superGroupName: string) => {
    setExpandedSuperGroups((prev) =>
      prev.includes(superGroupName)
        ? prev.filter((name) => name !== superGroupName)
        : [...prev, superGroupName]
    );
  };

  const handleCreate = (groupCode?: string) => {
    setModalMode('create');
    setFormData({
      groupCode: groupCode || '',
      code: '',
      name: '',
      description: '',
      value: '',
      order: 0,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (code: CommonCode) => {
    setModalMode('edit');
    setSelectedCode(code);
    setFormData({
      groupCode: code.groupCode,
      code: code.code,
      name: code.name,
      description: code.description || '',
      value: code.value || '',
      order: code.order,
      isActive: code.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await commonCodesApi.deleteCommonCode(id);
      fetchCodes();
    } catch (error) {
      console.error('Failed to delete common code:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (modalMode === 'create') {
        await commonCodesApi.createCommonCode(formData);
      } else if (selectedCode) {
        await commonCodesApi.updateCommonCode(selectedCode.id, formData);
      }
      setShowModal(false);
      fetchCodes();
    } catch (error) {
      console.error('Failed to save common code:', error);
      alert('저장에 실패했습니다.');
    }
  };

  // Get group display name
  const getGroupDisplayName = (groupCode: string) => {
    const parts = groupCode.split('_');
    return parts.slice(1).join(' ') || groupCode;
  };

  // Get statistics
  const getGroupStats = (groupCode: string) => {
    const codes = groupedCodes[groupCode] || [];
    const activeCount = codes.filter((c) => c.isActive).length;
    return { total: codes.length, active: activeCount };
  };

  const getSuperGroupStats = (superGroupName: string) => {
    const subGroups = superGroups[superGroupName]?.subGroups || [];
    let total = 0;
    let active = 0;
    subGroups.forEach((groupCode) => {
      const codes = groupedCodes[groupCode] || [];
      total += codes.length;
      active += codes.filter((c) => c.isActive).length;
    });
    return { total, active, groups: subGroups.length };
  };

  // Filter
  const filteredSuperGroups = Object.keys(superGroups).filter((superGroup) => {
    if (!searchTerm) return true;
    const subGroups = superGroups[superGroup].subGroups;
    return (
      superGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subGroups.some((groupCode) => {
        const codes = groupedCodes[groupCode] || [];
        return (
          groupCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          codes.some(
            (code) =>
              code.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              code.code.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      })
    );
  });

  const selectedGroupCodes = selectedGroup ? groupedCodes[selectedGroup] || [] : [];

  return (
    <div className="h-[calc(180vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4">
        <h1 className="text-3xl font-black text-gray-900 mb-2">공통 코드 관리</h1>
        <p className="text-gray-600">시스템에서 사용하는 공통 코드를 계층별로 관리합니다</p>
      </div>

      {/* Search Bar */}
      <div className="px-6 pb-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="그룹명 또는 코드명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={() => handleCreate()}
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            코드 추가
          </button>
        </div>
      </div>

      {/* Master-Detail Layout */}
      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <div className="h-full bg-white rounded-xl border border-gray-200 flex overflow-hidden">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <>
              {/* Left Sidebar - Group Tree */}
              <div className="w-80 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <Folder className="w-5 h-5 text-purple-600" />
                    코드 그룹
                  </h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filteredSuperGroups.map((superGroupName) => {
                    const isExpanded = expandedSuperGroups.includes(superGroupName);
                    const stats = getSuperGroupStats(superGroupName);
                    const subGroups = superGroups[superGroupName].subGroups;

                    return (
                      <div key={superGroupName} className="border-b border-gray-100">
                        {/* Super Group Header */}
                        <div
                          onClick={() => toggleSuperGroup(superGroupName)}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-2 group"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                          <FolderOpen className="w-5 h-5 text-amber-500" />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-900">{superGroupName}</div>
                            <div className="text-xs text-gray-500">
                              {stats.groups}개 그룹 · {stats.total}개 코드
                            </div>
                          </div>
                        </div>

                        {/* Sub Groups */}
                        {isExpanded && (
                          <div className="bg-gray-50">
                            {subGroups.map((groupCode) => {
                              const isSelected = selectedGroup === groupCode;
                              const groupStats = getGroupStats(groupCode);

                              return (
                                <div
                                  key={groupCode}
                                  onClick={() => setSelectedGroup(groupCode)}
                                  className={`pl-11 pr-4 py-2.5 cursor-pointer flex items-center gap-2 transition-colors ${
                                    isSelected
                                      ? 'bg-purple-50 border-l-4 border-purple-600'
                                      : 'hover:bg-gray-100 border-l-4 border-transparent'
                                  }`}
                                >
                                  <FileCode
                                    className={`w-4 h-4 ${
                                      isSelected ? 'text-purple-600' : 'text-gray-400'
                                    }`}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div
                                      className={`text-sm font-semibold truncate ${
                                        isSelected ? 'text-purple-900' : 'text-gray-700'
                                      }`}
                                    >
                                      {getGroupDisplayName(groupCode)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {groupStats.total}개 ({groupStats.active}개 활성)
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Content - Detail View */}
              <div className="flex-1 flex flex-col">
                {selectedGroup ? (
                  <>
                    {/* Detail Header */}
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-purple-600 font-semibold mb-1">
                            {selectedGroup.split('_')[0]}
                          </div>
                          <h2 className="text-2xl font-black text-gray-900">
                            {getGroupDisplayName(selectedGroup)}
                          </h2>
                          <p className="text-sm text-gray-600 mt-1">
                            {selectedGroupCodes.length}개의 코드가 등록되어 있습니다
                          </p>
                        </div>
                        <button
                          onClick={() => handleCreate(selectedGroup)}
                          className="px-4 py-2 bg-white border-2 border-purple-600 text-purple-600 font-semibold rounded-lg hover:bg-purple-600 hover:text-white transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          코드 추가
                        </button>
                      </div>
                    </div>

                    {/* Detail Content */}
                    <div className="flex-1 overflow-y-auto">
                      {selectedGroupCodes.length === 0 ? (
                        <div className="text-center py-12">
                          <FileCode className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 mb-4">등록된 코드가 없습니다</p>
                          <button
                            onClick={() => handleCreate(selectedGroup)}
                            className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700"
                          >
                            첫 번째 코드 추가
                          </button>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {selectedGroupCodes.map((code, index) => (
                            <div
                              key={code.id}
                              className={`px-6 py-4 hover:bg-gray-50 transition-colors flex items-center gap-6 ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                              }`}
                            >
                              {/* Order */}
                              <div className="w-10 flex-shrink-0 text-center">
                                <span className="text-sm font-bold text-gray-400">{code.order}</span>
                              </div>

                              {/* Code */}
                              <div className="w-48 flex-shrink-0">
                                <span className="font-mono text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg inline-block max-w-full truncate">
                                  {code.code}
                                </span>
                              </div>

                              {/* Name & Description */}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 mb-0.5 truncate">{code.name}</h3>
                                {code.description && (
                                  <p className="text-sm text-gray-500 truncate">{code.description}</p>
                                )}
                              </div>

                              {/* Value */}
                              <div className="w-28 flex-shrink-0">
                                {code.value ? (
                                  <>
                                    <div className="text-xs text-gray-400 mb-0.5">값</div>
                                    <div className="text-sm font-medium text-gray-700 truncate">{code.value}</div>
                                  </>
                                ) : (
                                  <div className="text-sm text-gray-300">-</div>
                                )}
                              </div>

                              {/* Status */}
                              <div className="w-20 flex-shrink-0">
                                {code.isActive ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                    <Check className="w-3 h-3" />
                                    활성
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                                    <X className="w-3 h-3" />
                                    비활성
                                  </span>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex gap-1 flex-shrink-0">
                                <button
                                  onClick={() => handleEdit(code)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="수정"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(code.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="삭제"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Folder className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-semibold text-gray-500">
                        왼쪽에서 그룹을 선택해주세요
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        코드 그룹을 클릭하면 상세 정보를 볼 수 있습니다
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'create' ? '공통 코드 추가' : '공통 코드 수정'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    그룹 코드 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.groupCode}
                    onChange={(e) =>
                      setFormData({ ...formData, groupCode: e.target.value.toUpperCase() })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="예: REGION_SEOUL"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    형식: 상위그룹_하위그룹 (예: REGION_SEOUL, BANK_CODE)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    코드 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="예: GANGNAM"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  코드명 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="예: 강남구"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="코드에 대한 상세 설명"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">값</label>
                  <input
                    type="text"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="추가 값"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">순서 *</label>
                  <input
                    type="number"
                    required
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-900">활성화</span>
                    <p className="text-xs text-gray-500">
                      비활성화된 코드는 시스템에서 사용되지 않습니다
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-shadow"
                >
                  {modalMode === 'create' ? '추가' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
