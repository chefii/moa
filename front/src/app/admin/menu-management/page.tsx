'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Settings,
  Menu as MenuIcon,
  FolderOpen,
  Check,
  X,
} from 'lucide-react';
import {
  menuCategoriesApi,
  menuItemsApi,
  MenuCategory,
  MenuItem,
  CreateMenuCategoryDto,
  UpdateMenuCategoryDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
} from '@/lib/api/admin/menu';
import { useMenuStore } from '@/store/menuStore';

export default function MenuManagementPage() {
  const { refreshMenu } = useMenuStore();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Category Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<CreateMenuCategoryDto>({
    name: '',
    nameEn: '',
    icon: '',
    order: 0,
    isActive: true,
    description: '',
    requiredRoles: [],
  });

  // Menu Item Modal
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemModalMode, setItemModalMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemFormData, setItemFormData] = useState<CreateMenuItemDto>({
    categoryId: '',
    name: '',
    nameEn: '',
    path: '',
    icon: '',
    order: 0,
    isActive: true,
    badge: undefined,
    description: '',
    requiredRoles: [],
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await menuCategoriesApi.getMenuCategories(true);
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch menu categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Category handlers
  const handleCreateCategory = () => {
    setCategoryModalMode('create');
    setCategoryFormData({
      name: '',
      nameEn: '',
      icon: '',
      order: categories.length,
      isActive: true,
      description: '',
      requiredRoles: [],
    });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: MenuCategory) => {
    console.log('Editing category:', category);
    setCategoryModalMode('edit');
    setSelectedCategory(category);
    setCategoryFormData({
      name: category.name,
      nameEn: category.nameEn || '',
      icon: category.icon || '',
      order: category.order || 0,
      isActive: category.isActive,
      description: category.description || '',
      requiredRoles: category.requiredRoles || [],
    });
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('이 카테고리와 모든 하위 메뉴를 삭제하시겠습니까?')) return;

    try {
      await menuCategoriesApi.deleteMenuCategory(id);
      fetchCategories();
      refreshMenu(); // 메뉴 새로고침
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (categoryModalMode === 'create') {
        await menuCategoriesApi.createMenuCategory(categoryFormData);
      } else if (selectedCategory) {
        await menuCategoriesApi.updateMenuCategory(selectedCategory.id, categoryFormData);
      }
      setShowCategoryModal(false);
      fetchCategories();
      refreshMenu(); // 메뉴 새로고침
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('저장에 실패했습니다.');
    }
  };

  // Menu Item handlers
  const handleCreateItem = (categoryId: string) => {
    setItemModalMode('create');
    const category = categories.find((c) => c.id === categoryId);
    const itemCount = category?.menuItems?.length || 0;

    setItemFormData({
      categoryId,
      name: '',
      nameEn: '',
      path: '',
      icon: '',
      order: itemCount,
      isActive: true,
      badge: undefined,
      description: '',
      requiredRoles: [],
    });
    setShowItemModal(true);
  };

  const handleEditItem = (item: MenuItem) => {
    console.log('Editing item:', item);
    setItemModalMode('edit');
    setSelectedItem(item);
    setItemFormData({
      categoryId: item.categoryId,
      name: item.name,
      nameEn: item.nameEn || '',
      path: item.path,
      icon: item.icon || '',
      order: item.order || 0,
      isActive: item.isActive,
      badge: item.badge || undefined,
      description: item.description || '',
      requiredRoles: item.requiredRoles || [],
    });
    setShowItemModal(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('이 메뉴 아이템을 삭제하시겠습니까?')) return;

    try {
      await menuItemsApi.deleteMenuItem(id);
      fetchCategories();
      refreshMenu(); // 메뉴 새로고침
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (itemModalMode === 'create') {
        await menuItemsApi.createMenuItem(itemFormData);
      } else if (selectedItem) {
        await menuItemsApi.updateMenuItem(selectedItem.id, itemFormData);
      }
      setShowItemModal(false);
      fetchCategories();
      refreshMenu(); // 메뉴 새로고침
    } catch (error) {
      console.error('Failed to save menu item:', error);
      alert('저장에 실패했습니다.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">메뉴 관리</h1>
          <p className="text-gray-600">관리자 페이지의 메뉴 카테고리와 항목을 관리합니다</p>
        </div>
        <button
          onClick={handleCreateCategory}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-shadow flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          카테고리 추가
        </button>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-200">
            로딩 중...
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-200">
            등록된 메뉴 카테고리가 없습니다
          </div>
        ) : (
          categories.map((category) => {
            const isExpanded = expandedCategories.includes(category.id);

            return (
              <div
                key={category.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
              >
                {/* Category Header */}
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>

                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <FolderOpen className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                        {category.nameEn && (
                          <span className="text-sm text-gray-500">({category.nameEn})</span>
                        )}
                        {category.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            <Check className="w-3 h-3" />
                            활성
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                            <X className="w-3 h-3" />
                            비활성
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {category.description || '설명 없음'} • 순서: {category.order} • 메뉴 항목:{' '}
                        {category.menuItems?.length || 0}개
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCreateItem(category.id)}
                      className="px-3 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      항목 추가
                    </button>
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Menu Items */}
                {isExpanded && category.menuItems && category.menuItems.length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-6 space-y-2">
                      {category.menuItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <MenuIcon className="w-5 h-5 text-gray-400" />
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-gray-900">{item.name}</p>
                                {item.nameEn && (
                                  <span className="text-xs text-gray-500">({item.nameEn})</span>
                                )}
                                {item.badge && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                    {item.badge}
                                  </span>
                                )}
                                {item.isActive ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                    <Check className="w-3 h-3" />
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                                    <X className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                경로: {item.path} • 순서: {item.order}
                                {item.requiredRoles.length > 0 &&
                                  ` • 권한: ${item.requiredRoles.join(', ')}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {categoryModalMode === 'create' ? '카테고리 추가' : '카테고리 수정'}
              </h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    카테고리명 *
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryFormData.name}
                    onChange={(e) =>
                      setCategoryFormData({ ...categoryFormData, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="예: 회원 관리"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    영문명
                  </label>
                  <input
                    type="text"
                    value={categoryFormData.nameEn}
                    onChange={(e) =>
                      setCategoryFormData({ ...categoryFormData, nameEn: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="예: User Management"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={categoryFormData.description}
                  onChange={(e) =>
                    setCategoryFormData({ ...categoryFormData, description: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="카테고리 설명"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    아이콘 (Lucide React)
                  </label>
                  <input
                    type="text"
                    value={categoryFormData.icon}
                    onChange={(e) =>
                      setCategoryFormData({ ...categoryFormData, icon: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="예: UserCircle2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    순서
                  </label>
                  <input
                    type="number"
                    value={categoryFormData.order}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                      setCategoryFormData({
                        ...categoryFormData,
                        order: isNaN(value) ? 0 : value,
                      });
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  필요 권한
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={categoryFormData.requiredRoles?.includes('SUPER_ADMIN') || false}
                      onChange={(e) => {
                        const roles = categoryFormData.requiredRoles || [];
                        if (e.target.checked) {
                          setCategoryFormData({
                            ...categoryFormData,
                            requiredRoles: [...roles, 'SUPER_ADMIN'],
                          });
                        } else {
                          setCategoryFormData({
                            ...categoryFormData,
                            requiredRoles: roles.filter((r) => r !== 'SUPER_ADMIN'),
                          });
                        }
                      }}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">SUPER_ADMIN</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={categoryFormData.requiredRoles?.includes('BUSINESS_ADMIN') || false}
                      onChange={(e) => {
                        const roles = categoryFormData.requiredRoles || [];
                        if (e.target.checked) {
                          setCategoryFormData({
                            ...categoryFormData,
                            requiredRoles: [...roles, 'BUSINESS_ADMIN'],
                          });
                        } else {
                          setCategoryFormData({
                            ...categoryFormData,
                            requiredRoles: roles.filter((r) => r !== 'BUSINESS_ADMIN'),
                          });
                        }
                      }}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">BUSINESS_ADMIN</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={categoryFormData.requiredRoles?.includes('USER') || false}
                      onChange={(e) => {
                        const roles = categoryFormData.requiredRoles || [];
                        if (e.target.checked) {
                          setCategoryFormData({
                            ...categoryFormData,
                            requiredRoles: [...roles, 'USER'],
                          });
                        } else {
                          setCategoryFormData({
                            ...categoryFormData,
                            requiredRoles: roles.filter((r) => r !== 'USER'),
                          });
                        }
                      }}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">USER</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={categoryFormData.isActive}
                    onChange={(e) =>
                      setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">활성화</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-shadow"
                >
                  {categoryModalMode === 'create' ? '추가' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {itemModalMode === 'create' ? '메뉴 항목 추가' : '메뉴 항목 수정'}
              </h2>
              <button
                onClick={() => setShowItemModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleItemSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  카테고리 *
                </label>
                <select
                  required
                  value={itemFormData.categoryId}
                  onChange={(e) =>
                    setItemFormData({ ...itemFormData, categoryId: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">선택하세요</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    메뉴명 *
                  </label>
                  <input
                    type="text"
                    required
                    value={itemFormData.name}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="예: 사용자 관리"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    영문명
                  </label>
                  <input
                    type="text"
                    value={itemFormData.nameEn}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, nameEn: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="예: Users"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  경로 *
                </label>
                <input
                  type="text"
                  required
                  value={itemFormData.path}
                  onChange={(e) =>
                    setItemFormData({ ...itemFormData, path: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="예: /admin/users"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={itemFormData.description}
                  onChange={(e) =>
                    setItemFormData({ ...itemFormData, description: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={2}
                  placeholder="메뉴 설명"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    아이콘
                  </label>
                  <input
                    type="text"
                    value={itemFormData.icon}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, icon: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Users"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    순서
                  </label>
                  <input
                    type="number"
                    value={itemFormData.order}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                      setItemFormData({ ...itemFormData, order: isNaN(value) ? 0 : value });
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    뱃지
                  </label>
                  <input
                    type="number"
                    value={itemFormData.badge ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setItemFormData({
                        ...itemFormData,
                        badge: value === '' ? undefined : parseInt(value),
                      });
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="숫자"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  필요 권한
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={itemFormData.requiredRoles.includes('SUPER_ADMIN')}
                      onChange={(e) => {
                        const roles = itemFormData.requiredRoles || [];
                        if (e.target.checked) {
                          setItemFormData({
                            ...itemFormData,
                            requiredRoles: [...roles, 'SUPER_ADMIN'],
                          });
                        } else {
                          setItemFormData({
                            ...itemFormData,
                            requiredRoles: roles.filter((r) => r !== 'SUPER_ADMIN'),
                          });
                        }
                      }}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">SUPER_ADMIN</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={itemFormData.requiredRoles.includes('BUSINESS_ADMIN')}
                      onChange={(e) => {
                        const roles = itemFormData.requiredRoles || [];
                        if (e.target.checked) {
                          setItemFormData({
                            ...itemFormData,
                            requiredRoles: [...roles, 'BUSINESS_ADMIN'],
                          });
                        } else {
                          setItemFormData({
                            ...itemFormData,
                            requiredRoles: roles.filter((r) => r !== 'BUSINESS_ADMIN'),
                          });
                        }
                      }}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">BUSINESS_ADMIN</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={itemFormData.requiredRoles.includes('USER')}
                      onChange={(e) => {
                        const roles = itemFormData.requiredRoles || [];
                        if (e.target.checked) {
                          setItemFormData({
                            ...itemFormData,
                            requiredRoles: [...roles, 'USER'],
                          });
                        } else {
                          setItemFormData({
                            ...itemFormData,
                            requiredRoles: roles.filter((r) => r !== 'USER'),
                          });
                        }
                      }}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">USER</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={itemFormData.isActive}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">활성화</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-shadow"
                >
                  {itemModalMode === 'create' ? '추가' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
