'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Bell,
  Pin,
  Eye,
  X,
} from 'lucide-react';
import {
  noticesApi,
  Notice,
  NoticeType,
  CreateNoticeDto,
  UpdateNoticeDto,
} from '@/lib/api/admin/notices';

const NOTICE_TYPES: { value: NoticeType; label: string; color: string }[] = [
  { value: 'GENERAL', label: '일반', color: 'bg-gray-100 text-gray-700' },
  { value: 'IMPORTANT', label: '중요', color: 'bg-red-100 text-red-700' },
  { value: 'MAINTENANCE', label: '점검', color: 'bg-orange-100 text-orange-700' },
  { value: 'EVENT', label: '이벤트', color: 'bg-purple-100 text-purple-700' },
];

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<NoticeType | ''>('');
  const [filterPinned, setFilterPinned] = useState<boolean | ''>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [formData, setFormData] = useState<CreateNoticeDto>({
    type: 'GENERAL',
    title: '',
    content: '',
    isPinned: false,
  });

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailNotice, setDetailNotice] = useState<Notice | null>(null);

  useEffect(() => {
    fetchNotices();
  }, [pagination.page, selectedType, filterPinned]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await noticesApi.getNotices(
        pagination.page,
        pagination.limit,
        selectedType || undefined,
        filterPinned === '' ? undefined : filterPinned
      );
      setNotices(response.data);
      setPagination((prev) => ({ ...prev, ...response.pagination }));
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      type: 'GENERAL',
      title: '',
      content: '',
      isPinned: false,
    });
    setShowModal(true);
  };

  const handleEdit = (notice: Notice) => {
    setModalMode('edit');
    setSelectedNotice(notice);
    setFormData({
      type: notice.type,
      title: notice.title,
      content: notice.content,
      isPinned: notice.isPinned,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await noticesApi.deleteNotice(id);
      fetchNotices();
    } catch (error) {
      console.error('Failed to delete notice:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (modalMode === 'create') {
        await noticesApi.createNotice(formData);
      } else if (selectedNotice) {
        await noticesApi.updateNotice(selectedNotice.id, formData);
      }
      setShowModal(false);
      fetchNotices();
    } catch (error) {
      console.error('Failed to save notice:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const handleViewDetail = (notice: Notice) => {
    setDetailNotice(notice);
    setShowDetailModal(true);
  };

  const filteredNotices = notices.filter((notice) =>
    notice.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">공지사항 관리</h1>
        <p className="text-gray-600">사용자에게 전달할 공지사항을 관리합니다</p>
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="공지사항 제목으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as NoticeType | '');
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">전체 타입</option>
              {NOTICE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <select
              value={filterPinned === '' ? '' : filterPinned ? 'true' : 'false'}
              onChange={(e) => {
                setFilterPinned(e.target.value === '' ? '' : e.target.value === 'true');
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">전체</option>
              <option value="true">고정됨</option>
              <option value="false">일반</option>
            </select>

            <button
              onClick={handleCreate}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-shadow flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              공지사항 추가
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-200">
            로딩 중...
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-200">
            등록된 공지사항이 없습니다
          </div>
        ) : (
          filteredNotices.map((notice) => {
            const typeInfo = NOTICE_TYPES.find((t) => t.value === notice.type);
            return (
              <div
                key={notice.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bell className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-900">
                          {notice.title}
                        </h3>
                        {notice.isPinned && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                            <Pin className="w-3 h-3" />
                            고정
                          </span>
                        )}
                        <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${typeInfo?.color}`}>
                          {typeInfo?.label}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {notice.content}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{notice.viewCount}</span>
                        </div>
                        <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetail(notice)}
                          className="px-3 py-1.5 text-sm text-gray-700 font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          상세보기
                        </button>
                        <button
                          onClick={() => handleEdit(notice)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(notice.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 flex items-center justify-between">
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'create' ? '공지사항 추가' : '공지사항 수정'}
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
                    setFormData({ ...formData, type: e.target.value as NoticeType })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {NOTICE_TYPES.map((type) => (
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="공지사항 제목"
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={10}
                  placeholder="공지사항 내용"
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) =>
                      setFormData({ ...formData, isPinned: e.target.checked })
                    }
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    상단 고정 (중요 공지사항)
                  </span>
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

      {/* Detail Modal */}
      {showDetailModal && detailNotice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  {detailNotice.title}
                </h2>
                {detailNotice.isPinned && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                    <Pin className="w-3 h-3" />
                    고정
                  </span>
                )}
                <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
                  NOTICE_TYPES.find((t) => t.value === detailNotice.type)?.color
                }`}>
                  {NOTICE_TYPES.find((t) => t.value === detailNotice.type)?.label}
                </span>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 text-sm text-gray-500 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>조회수 {detailNotice.viewCount}</span>
                </div>
                <span>{new Date(detailNotice.createdAt).toLocaleString()}</span>
              </div>

              <div className="prose max-w-none">
                <div className="text-gray-900 whitespace-pre-wrap">
                  {detailNotice.content}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
