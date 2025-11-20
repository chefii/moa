'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Tag,
  Check,
  X,
  FolderOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  categoriesApi,
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@/lib/api/admin/categories';
import { commonCodesApi, CommonCode } from '@/lib/api/common-codes';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTypes, setCategoryTypes] = useState<CommonCode[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | ''>('');

  // Parent Category Modal
  const [showParentModal, setShowParentModal] = useState(false);
  const [parentModalMode, setParentModalMode] = useState<'create' | 'edit'>('create');
  const [editingParent, setEditingParent] = useState<Category | null>(null);
  const [parentFormData, setParentFormData] = useState<CreateCategoryDto>({
    name: '',
    displayName: '',
    slug: '',
    description: '',
    icon: '',
    color: '',
    parentId: null,
    order: 0,
    type: [],
    isActive: true,
  });

  // Child Category Modal
  const [showChildModal, setShowChildModal] = useState(false);
  const [childModalMode, setChildModalMode] = useState<'create' | 'edit'>('create');
  const [selectedChild, setSelectedChild] = useState<Category | null>(null);
  const [selectedParentForChild, setSelectedParentForChild] = useState<string | null>(null);
  const [childFormData, setChildFormData] = useState<CreateCategoryDto>({
    name: '',
    displayName: '',
    slug: '',
    description: '',
    icon: '',
    color: '#6366f1',
    parentId: null,
    order: 0,
    type: [],
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
    fetchCategoryTypes();
  }, [filterActive]);

  useEffect(() => {
    // 첫 번째 상위 카테고리를 자동 선택
    if (categories.length > 0 && !selectedParentId) {
      setSelectedParentId(categories[0].id);
    }
  }, [categories]);

  const fetchCategoryTypes = async () => {
    try {
      const types = await commonCodesApi.getCategoryTypes();
      setCategoryTypes(types);
    } catch (error) {
      console.error('Failed to load category types:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesApi.getCategories(
        1,
        100,
        filterActive === '' ? undefined : filterActive,
        true // includeChildren
      );
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedParent = categories.find((c) => c.id === selectedParentId);
  const childCategories = selectedParent?.children || [];

  const filteredParents = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Parent Category Handlers
  const handleCreateParent = () => {
    setParentModalMode('create');
    setParentFormData({
      name: '',
      displayName: '',
      slug: '',
      description: '',
      icon: '',
      color: '',
      parentId: null,
      order: categories.length,
      type: [],
      isActive: true,
    });
    setShowParentModal(true);
  };

  const handleEditParent = (category: Category) => {
    setParentModalMode('edit');
    setEditingParent(category);
    setParentFormData({
      name: category.name,
      displayName: category.displayName || '',
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '',
      parentId: null,
      order: category.order,
      type: category.type || [],
      isActive: category.isActive,
    });
    setShowParentModal(true);
  };

  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!parentFormData.slug && parentFormData.name) {
      parentFormData.slug = parentFormData.name.toLowerCase().replace(/\s+/g, '-');
    }

    try {
      if (parentModalMode === 'create') {
        await categoriesApi.createCategory(parentFormData);
      } else if (editingParent) {
        await categoriesApi.updateCategory(editingParent.id, parentFormData);
      }
      setShowParentModal(false);
      fetchCategories();
    } catch (error) {
      console.error('Failed to save parent category:', error);
      alert('저장에 실패했습니다.');
    }
  };

  // Child Category Handlers
  const handleCreateChild = (parentId: string) => {
    setChildModalMode('create');
    setSelectedParentForChild(parentId);
    const parent = categories.find((c) => c.id === parentId);
    const childCount = parent?.children?.length || 0;
    setChildFormData({
      name: '',
      displayName: '',
      slug: '',
      description: '',
      icon: '',
      color: '#6366f1',
      parentId,
      order: childCount,
      type: [],
      isActive: true,
    });
    setShowChildModal(true);
  };

  const handleEditChild = (child: Category) => {
    setChildModalMode('edit');
    setSelectedChild(child);
    setSelectedParentForChild(child.parentId || null);
    setChildFormData({
      name: child.name,
      displayName: child.displayName || '',
      slug: child.slug,
      description: child.description || '',
      icon: child.icon || '',
      color: child.color || '#6366f1',
      parentId: child.parentId,
      order: child.order,
      type: child.type || [],
      isActive: child.isActive,
    });
    setShowChildModal(true);
  };

  const handleChildSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!childFormData.slug && childFormData.name) {
      childFormData.slug = childFormData.name.toLowerCase().replace(/\s+/g, '-');
    }

    try {
      if (childModalMode === 'create') {
        await categoriesApi.createCategory(childFormData);
      } else if (selectedChild) {
        await categoriesApi.updateCategory(selectedChild.id, childFormData);
      }
      setShowChildModal(false);
      fetchCategories();
    } catch (error) {
      console.error('Failed to save child category:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const handleDeleteParent = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까? 하위 카테고리도 함께 삭제됩니다.')) return;

    try {
      await categoriesApi.deleteCategory(id);
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete parent category:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleDeleteChild = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await categoriesApi.deleteCategory(id);
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete child category:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">카테고리 관리</h1>
        <p className="text-gray-600">
          왼쪽에서 상위 카테고리를 선택하고 오른쪽에서 하위 카테고리를 관리합니다
        </p>
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="상위 카테고리 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterActive === '' ? '' : filterActive ? 'true' : 'false'}
              onChange={(e) => {
                setFilterActive(
                  e.target.value === '' ? '' : e.target.value === 'true'
                );
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
            >
              <option value="">전체 상태</option>
              <option value="true">활성</option>
              <option value="false">비활성</option>
            </select>

            <button
              onClick={handleCreateParent}
              className="px-4 py-2.5 bg-moa-primary text-white font-semibold rounded-xl hover:shadow-lg transition-shadow flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              상위 카테고리 추가
            </button>
          </div>
        </div>
      </div>

      {/* 2-Depth Layout: Left-Right */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Parent Categories List */}
        <div className="col-span-4">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">상위 카테고리</h2>
              <p className="text-xs text-gray-600 mt-1">{filteredParents.length}개</p>
            </div>

            <div className="divide-y divide-gray-100 max-h-[calc(100vh-400px)] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-sm text-gray-500">로딩 중...</div>
              ) : filteredParents.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">
                  등록된 카테고리가 없습니다
                </div>
              ) : (
                filteredParents.map((parent) => {
                  const isSelected = selectedParentId === parent.id;
                  const hasChildren = parent.children && parent.children.length > 0;

                  return (
                    <div
                      key={parent.id}
                      onClick={() => setSelectedParentId(parent.id)}
                      className={`p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-moa-primary'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: parent.color || '#6366f1',
                            }}
                          >
                            <FolderOpen className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{parent.name}</h3>
                            <p className="text-xs text-gray-500">
                              {hasChildren ? `${parent.children!.length}개 하위` : '하위 없음'}
                            </p>
                          </div>
                        </div>
                        {parent.isActive ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {parent.type && parent.type.length > 0 && (
                          <div className="flex gap-1">
                            {parent.type.map((t) => (
                              <span
                                key={t}
                                className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium"
                              >
                                {t === 'GATHERING' ? '모임' : t === 'BOARD' ? '게시판' : '관심사'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Child Categories of Selected Parent */}
        <div className="col-span-8">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {selectedParent?.name || '카테고리를 선택하세요'}
                  </h2>
                  <p className="text-xs text-gray-600 mt-1">
                    {selectedParent
                      ? `${childCategories.length}개의 하위 카테고리`
                      : '왼쪽에서 상위 카테고리를 선택하세요'}
                  </p>
                </div>
                {selectedParent && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCreateChild(selectedParent.id)}
                      className="px-4 py-2 bg-moa-primary text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      하위 추가
                    </button>
                    <button
                      onClick={() => handleEditParent(selectedParent)}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      상위 수정
                    </button>
                    <button
                      onClick={() => handleDeleteParent(selectedParent.id)}
                      className="px-4 py-2 bg-white border border-red-300 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      상위 삭제
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
              {!selectedParent ? (
                <div className="p-12 text-center text-sm text-gray-500">
                  왼쪽에서 상위 카테고리를 선택하세요
                </div>
              ) : childCategories.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-sm text-gray-500 mb-4">하위 카테고리가 없습니다</p>
                  <button
                    onClick={() => handleCreateChild(selectedParent.id)}
                    className="px-4 py-2 bg-moa-primary text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-shadow inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    첫 번째 하위 카테고리 추가
                  </button>
                </div>
              ) : (
                <div className="p-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          아이콘
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          카테고리명
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          표시명
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          순서
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          상태
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                          작업
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {childCategories
                        .sort((a, b) => a.order - b.order)
                        .map((child) => (
                          <tr
                            key={child.id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{
                                  backgroundColor: child.color || '#6366f1',
                                }}
                              >
                                {child.icon ? (
                                  <span className="text-xl">{child.icon}</span>
                                ) : (
                                  <Tag className="w-5 h-5 text-white" />
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-gray-900">{child.name}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-600">
                                {child.displayName || '-'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-600">{child.order}</span>
                            </td>
                            <td className="py-3 px-4">
                              {child.isActive ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                  <Check className="w-3 h-3" />
                                  활성
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                                  <X className="w-3 h-3" />
                                  비활성
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEditChild(child)}
                                  className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                  title="수정"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteChild(child.id)}
                                  className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                  title="삭제"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Parent Category Modal */}
      {showParentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {parentModalMode === 'create' ? '상위 카테고리 추가' : '상위 카테고리 수정'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                모임, 게시판 등의 큰 분류를 관리합니다
              </p>
            </div>

            <form onSubmit={handleParentSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    카테고리명 *
                  </label>
                  <input
                    type="text"
                    required
                    value={parentFormData.name}
                    onChange={(e) =>
                      setParentFormData({ ...parentFormData, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                    placeholder="예: 스포츠/운동"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    표시명
                  </label>
                  <input
                    type="text"
                    value={parentFormData.displayName}
                    onChange={(e) =>
                      setParentFormData({ ...parentFormData, displayName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                    placeholder="짧은 표시명"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">슬러그</label>
                <input
                  type="text"
                  value={parentFormData.slug}
                  onChange={(e) =>
                    setParentFormData({ ...parentFormData, slug: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                  placeholder="자동 생성됨 (예: sports)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">설명</label>
                <textarea
                  value={parentFormData.description}
                  onChange={(e) =>
                    setParentFormData({ ...parentFormData, description: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                  rows={3}
                  placeholder="카테고리 설명"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  카테고리 타입 *
                </label>
                <div className="space-y-2">
                  {categoryTypes.map((type) => (
                    <label key={type.code} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={parentFormData.type?.includes(type.value) || false}
                        onChange={(e) => {
                          const currentTypes = parentFormData.type || [];
                          if (e.target.checked) {
                            setParentFormData({
                              ...parentFormData,
                              type: [...currentTypes, type.value],
                            });
                          } else {
                            setParentFormData({
                              ...parentFormData,
                              type: currentTypes.filter((t) => t !== type.value),
                            });
                          }
                        }}
                        className="w-4 h-4 text-moa-primary border-gray-300 rounded focus:ring-moa-primary"
                      />
                      <div>
                        <span className="text-sm font-semibold text-gray-900">
                          {type.name}
                        </span>
                        <p className="text-xs text-gray-500">
                          {type.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">순서</label>
                <input
                  type="number"
                  value={parentFormData.order}
                  onChange={(e) =>
                    setParentFormData({
                      ...parentFormData,
                      order: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={parentFormData.isActive}
                    onChange={(e) =>
                      setParentFormData({ ...parentFormData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-moa-primary border-gray-300 rounded focus:ring-moa-primary"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-900">활성화</span>
                    <p className="text-xs text-gray-500">
                      비활성화하면 사용자에게 표시되지 않습니다
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowParentModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-moa-primary text-white font-semibold rounded-xl hover:shadow-lg transition-shadow"
                >
                  {parentModalMode === 'create' ? '추가' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Child Category Modal */}
      {showChildModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {childModalMode === 'create' ? '하위 카테고리 추가' : '하위 카테고리 수정'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                세부 카테고리를 관리합니다 (아이콘, 색상 설정 가능)
              </p>
            </div>

            <form onSubmit={handleChildSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    카테고리명 *
                  </label>
                  <input
                    type="text"
                    required
                    value={childFormData.name}
                    onChange={(e) =>
                      setChildFormData({ ...childFormData, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                    placeholder="예: 축구"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    표시명
                  </label>
                  <input
                    type="text"
                    value={childFormData.displayName}
                    onChange={(e) =>
                      setChildFormData({ ...childFormData, displayName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                    placeholder="짧은 표시명"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">슬러그</label>
                <input
                  type="text"
                  value={childFormData.slug}
                  onChange={(e) =>
                    setChildFormData({ ...childFormData, slug: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                  placeholder="자동 생성됨"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">설명</label>
                <textarea
                  value={childFormData.description}
                  onChange={(e) =>
                    setChildFormData({ ...childFormData, description: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                  rows={2}
                  placeholder="카테고리 설명"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    아이콘 (이모지)
                  </label>
                  <input
                    type="text"
                    value={childFormData.icon}
                    onChange={(e) =>
                      setChildFormData({ ...childFormData, icon: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary text-center text-3xl"
                    placeholder="⚽"
                    maxLength={2}
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    이모지 1개를 입력하세요
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">색상</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={childFormData.color || '#6366f1'}
                      onChange={(e) =>
                        setChildFormData({ ...childFormData, color: e.target.value })
                      }
                      className="w-20 h-[42px] border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary cursor-pointer"
                    />
                    <input
                      type="text"
                      value={childFormData.color || '#6366f1'}
                      onChange={(e) =>
                        setChildFormData({ ...childFormData, color: e.target.value })
                      }
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary font-mono text-sm"
                      placeholder="#6366f1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">순서</label>
                <input
                  type="number"
                  value={childFormData.order}
                  onChange={(e) =>
                    setChildFormData({
                      ...childFormData,
                      order: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={childFormData.isActive}
                    onChange={(e) =>
                      setChildFormData({ ...childFormData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-moa-primary border-gray-300 rounded focus:ring-moa-primary"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-900">활성화</span>
                    <p className="text-xs text-gray-500">
                      비활성화하면 사용자에게 표시되지 않습니다
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowChildModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-moa-primary text-white font-semibold rounded-xl hover:shadow-lg transition-shadow"
                >
                  {childModalMode === 'create' ? '추가' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
