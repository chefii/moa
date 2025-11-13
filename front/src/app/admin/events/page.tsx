'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Users,
  Check,
  X,
} from 'lucide-react';
import {
  eventsApi,
  Event,
  EventStatus,
  CreateEventDto,
  UpdateEventDto,
} from '@/lib/api/admin/events';

const EVENT_STATUSES: { value: EventStatus; label: string; color: string }[] = [
  { value: 'SCHEDULED', label: '예정', color: 'bg-blue-100 text-blue-700' },
  { value: 'ACTIVE', label: '진행중', color: 'bg-green-100 text-green-700' },
  { value: 'ENDED', label: '종료', color: 'bg-gray-100 text-gray-700' },
  { value: 'CANCELLED', label: '취소', color: 'bg-red-100 text-red-700' },
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | ''>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<CreateEventDto>({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'SCHEDULED',
    maxParticipants: undefined,
  });

  useEffect(() => {
    fetchEvents();
  }, [pagination.page, selectedStatus]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsApi.getEvents(
        pagination.page,
        pagination.limit,
        selectedStatus || undefined
      );
      setEvents(response.data);
      setPagination((prev) => ({ ...prev, ...response.pagination }));
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'SCHEDULED',
      maxParticipants: undefined,
    });
    setShowModal(true);
  };

  const handleEdit = (event: Event) => {
    setModalMode('edit');
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      imageUrl: event.imageUrl || '',
      linkUrl: event.linkUrl || '',
      startDate: event.startDate.split('T')[0],
      endDate: event.endDate.split('T')[0],
      status: event.status,
      maxParticipants: event.maxParticipants || undefined,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await eventsApi.deleteEvent(id);
      fetchEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (modalMode === 'create') {
        await eventsApi.createEvent(formData);
      } else if (selectedEvent) {
        await eventsApi.updateEvent(selectedEvent.id, formData);
      }
      setShowModal(false);
      fetchEvents();
    } catch (error) {
      console.error('Failed to save event:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">이벤트 관리</h1>
        <p className="text-gray-600">진행중인 이벤트를 관리합니다</p>
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="이벤트 제목으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as EventStatus | '');
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">전체 상태</option>
              {EVENT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleCreate}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-shadow flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              이벤트 추가
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-gray-500">
            로딩 중...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-gray-500">
            등록된 이벤트가 없습니다
          </div>
        ) : (
          filteredEvents.map((event) => {
            const statusInfo = EVENT_STATUSES.find((s) => s.value === event.status);
            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                {event.imageUrl && (
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${statusInfo?.color}`}
                    >
                      {statusInfo?.label}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-semibold">기간</span>
                      </div>
                      <p className="text-sm text-gray-900">
                        {new Date(event.startDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        ~ {new Date(event.endDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-semibold">참여자</span>
                      </div>
                      <p className="text-sm text-gray-900">
                        {event.participantCount}명
                        {event.maxParticipants && ` / ${event.maxParticipants}명`}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleEdit(event)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="px-4 py-2 border border-red-300 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      삭제
                    </button>
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
                {modalMode === 'create' ? '이벤트 추가' : '이벤트 수정'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  placeholder="이벤트 제목"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  설명 *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  placeholder="이벤트 설명"
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="상세 페이지 URL (선택)"
                />
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    상태 *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as EventStatus })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {EVENT_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    최대 참여자
                  </label>
                  <input
                    type="number"
                    value={formData.maxParticipants || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxParticipants: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="제한 없음"
                  />
                </div>
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
