'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  MessageSquare,
  Check,
  X,
  Star,
  Eye,
  ExternalLink,
} from 'lucide-react';
import {
  popupsApi,
  Popup,
  PopupType,
  CreatePopupDto,
  UpdatePopupDto,
} from '@/lib/api/admin/popups';

const POPUP_TYPES: { value: PopupType; label: string }[] = [
  { value: 'MODAL', label: '모달' },
  { value: 'BOTTOM_SHEET', label: '바텀시트' },
  { value: 'TOAST', label: '토스트' },
];

export default function PopupsPage() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<PopupType | ''>('');
  const [filterActive, setFilterActive] = useState<boolean | ''>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPopup, setSelectedPopup] = useState<Popup | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPopup, setPreviewPopup] = useState<Popup | null>(null);
  const [formData, setFormData] = useState<CreatePopupDto>({
    type: 'MODAL',
    title: '',
    content: '',
    imageUrl: '',
    linkUrl: '',
    buttonText: '확인',
    priority: 0,
    showOnce: false,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true,
  });

  useEffect(() => {
    fetchPopups();
  }, [pagination.page, selectedType, filterActive]);

  const fetchPopups = async () => {
    try {
      setLoading(true);
      const response = await popupsApi.getPopups(
        pagination.page,
        pagination.limit,
        selectedType || undefined,
        filterActive === '' ? undefined : filterActive
      );
      setPopups(response.data);
      setPagination((prev) => ({ ...prev, ...response.pagination }));
    } catch (error) {
      console.error('Failed to fetch popups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      type: 'MODAL',
      title: '',
      content: '',
      imageUrl: '',
      linkUrl: '',
      buttonText: '확인',
      priority: 0,
      showOnce: false,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (popup: Popup) => {
    setModalMode('edit');
    setSelectedPopup(popup);
    setFormData({
      type: popup.type,
      title: popup.title,
      content: popup.content,
      imageUrl: popup.imageUrl || '',
      linkUrl: popup.linkUrl || '',
      buttonText: popup.buttonText || '확인',
      priority: popup.priority,
      showOnce: popup.showOnce,
      startDate: popup.startDate.split('T')[0],
      endDate: popup.endDate.split('T')[0],
      isActive: popup.isActive,
    });
    setShowModal(true);
  };

  const handlePreview = (popup: Popup) => {
    setPreviewPopup(popup);
    setShowPreview(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await popupsApi.deletePopup(id);
      fetchPopups();
    } catch (error) {
      console.error('Failed to delete popup:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (modalMode === 'create') {
        await popupsApi.createPopup(formData);
      } else if (selectedPopup) {
        await popupsApi.updatePopup(selectedPopup.id, formData);
      }
      setShowModal(false);
      fetchPopups();
    } catch (error) {
      console.error('Failed to save popup:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const filteredPopups = popups.filter((popup) =>
    popup.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">팝업 관리</h1>
        <p className="text-gray-600">앱 내 팝업을 관리합니다</p>
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="팝업 제목으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as PopupType | '');
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
            >
              <option value="">전체 타입</option>
              {POPUP_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <select
              value={filterActive === '' ? '' : filterActive ? 'true' : 'false'}
              onChange={(e) => {
                setFilterActive(e.target.value === '' ? '' : e.target.value === 'true');
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
            >
              <option value="">전체 상태</option>
              <option value="true">활성</option>
              <option value="false">비활성</option>
            </select>

            <button
              onClick={handleCreate}
              className="px-4 py-2.5 bg-moa-primary text-white font-semibold rounded-xl hover:shadow-lg transition-shadow flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              팝업 추가
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  팝업
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  타입
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  기간
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  우선순위
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  옵션
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  상태
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    로딩 중...
                  </td>
                </tr>
              ) : filteredPopups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    등록된 팝업이 없습니다
                  </td>
                </tr>
              ) : (
                filteredPopups.map((popup) => (
                  <tr key={popup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-moa-primary to-moa-accent rounded-lg flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{popup.title}</p>
                          <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                            {popup.content}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 bg-moa-primary/10 text-moa-primary text-xs font-semibold rounded-full">
                        {POPUP_TYPES.find((t) => t.value === popup.type)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">
                          {new Date(popup.startDate).toLocaleDateString()}
                        </p>
                        <p className="text-gray-500">
                          ~ {new Date(popup.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          {popup.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {popup.showOnce && (
                        <span className="inline-block px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                          1회만 표시
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {popup.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          <Check className="w-3 h-3" />
                          활성
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                          <X className="w-3 h-3" />
                          비활성
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePreview(popup)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="미리보기"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(popup)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="수정"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(popup.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              총 {pagination.total}개 중 {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)}개 표시
            </p>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                이전
              </button>
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'create' ? '팝업 추가' : '팝업 수정'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  타입 *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as PopupType })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                >
                  {POPUP_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                  placeholder="팝업 제목"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  내용 *
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                  rows={4}
                  placeholder="팝업 내용"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  이미지 URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                  placeholder="https://example.com/image.jpg (선택)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    링크 URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, linkUrl: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                    placeholder="선택"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    버튼 텍스트
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) =>
                      setFormData({ ...formData, buttonText: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                    placeholder="확인"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    시작일 *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    종료일 *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  우선순위
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                  placeholder="숫자가 높을수록 우선 표시"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showOnce}
                    onChange={(e) =>
                      setFormData({ ...formData, showOnce: e.target.checked })
                    }
                    className="w-4 h-4 text-moa-primary border-gray-300 rounded focus:ring-moa-primary"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    1회만 표시 (사용자당 한 번만 보여주기)
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-moa-primary border-gray-300 rounded focus:ring-moa-primary"
                  />
                  <span className="text-sm font-semibold text-gray-700">활성화</span>
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
                  className="flex-1 px-4 py-2.5 bg-moa-primary text-white font-semibold rounded-xl hover:shadow-lg transition-shadow"
                >
                  {modalMode === 'create' ? '추가' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal - Hybrid App Style */}
      {showPreview && previewPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          {/* Phone Frame */}
          <div className="relative">
            {/* Close Button */}
            <button
              onClick={() => setShowPreview(false)}
              className="absolute -top-12 right-0 px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              닫기
            </button>

            {/* Mobile Phone Frame */}
            <div className="w-[375px] h-[667px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl border-8 border-gray-900">
              <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                {/* Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-black/5 to-transparent z-10 flex items-center justify-between px-6">
                  <div className="text-xs font-semibold text-gray-700">9:41</div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-3 border border-gray-700 rounded-sm"></div>
                    <div className="w-3 h-3 border-t-2 border-r-2 border-gray-700 rounded-tr"></div>
                  </div>
                </div>

                {/* App Content - Simulated */}
                <div className="h-full bg-gradient-to-br from-pink-50 via-white to-purple-50 pt-10">
                  {/* Dummy App Header */}
                  <div className="px-6 py-4 bg-white border-b border-gray-100">
                    <h1 className="text-2xl font-black text-gray-900">모아</h1>
                    <p className="text-sm text-gray-600">관심사로 모이는 사람들</p>
                  </div>

                  {/* Popup Overlay */}
                  {previewPopup.type === 'MODAL' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-6 pt-10">
                      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl transform transition-all overflow-hidden">
                        {previewPopup.imageUrl && (
                          <img
                            src={previewPopup.imageUrl}
                            alt={previewPopup.title}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="p-6 space-y-4">
                          <h3 className="text-xl font-black text-gray-900">{previewPopup.title}</h3>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{previewPopup.content}</p>
                          <div className="flex gap-3 pt-2">
                            {previewPopup.linkUrl && (
                              <button className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                <ExternalLink className="w-4 h-4" />
                                링크 이동
                              </button>
                            )}
                            <button className="flex-1 px-4 py-3 bg-gradient-to-r from-moa-primary to-moa-accent text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
                              {previewPopup.buttonText || '확인'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {previewPopup.type === 'BOTTOM_SHEET' && (
                    <div className="absolute inset-0 bg-black/30 flex items-end pt-10">
                      <div className="bg-white rounded-t-3xl w-full shadow-2xl transform transition-all animate-slide-up">
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-2"></div>
                        {previewPopup.imageUrl && (
                          <img
                            src={previewPopup.imageUrl}
                            alt={previewPopup.title}
                            className="w-full h-40 object-cover"
                          />
                        )}
                        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                          <h3 className="text-xl font-black text-gray-900">{previewPopup.title}</h3>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{previewPopup.content}</p>
                          <div className="flex gap-3 pt-2">
                            {previewPopup.linkUrl && (
                              <button className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                <ExternalLink className="w-4 h-4" />
                                링크 이동
                              </button>
                            )}
                            <button className="flex-1 px-4 py-3 bg-gradient-to-r from-moa-primary to-moa-accent text-white font-bold rounded-xl shadow-lg">
                              {previewPopup.buttonText || '확인'}
                            </button>
                          </div>
                        </div>
                        <div className="h-8 bg-white"></div>
                      </div>
                    </div>
                  )}

                  {previewPopup.type === 'TOAST' && (
                    <div className="absolute top-20 left-4 right-4">
                      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl transform transition-all animate-bounce-in p-4 flex items-start gap-3">
                        {previewPopup.imageUrl && (
                          <img
                            src={previewPopup.imageUrl}
                            alt={previewPopup.title}
                            className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm mb-1">{previewPopup.title}</h4>
                          <p className="text-sm text-gray-300 line-clamp-2">{previewPopup.content}</p>
                        </div>
                        <button className="flex-shrink-0 text-white/70 hover:text-white">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Type Label */}
            <div className="absolute -bottom-10 left-0 right-0 text-center">
              <span className="inline-block px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg shadow-lg">
                {POPUP_TYPES.find((t) => t.value === previewPopup.type)?.label} 미리보기
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
