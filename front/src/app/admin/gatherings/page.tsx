'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Edit2,
  Trash2,
  Calendar,
  Users,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  Tag,
  X,
} from 'lucide-react';
import {
  gatheringsApi,
  Gathering,
  GatheringStatus,
  UpdateGatheringDto,
} from '@/lib/api/admin/gatherings';
import { getImageUrl } from '@/lib/utils/imageUrl';

const GATHERING_STATUSES: {
  value: GatheringStatus;
  label: string;
  color: string;
}[] = [
  { value: 'RECRUITING', label: '모집중', color: 'bg-blue-100 text-blue-700' },
  { value: 'FULL', label: '마감', color: 'bg-green-100 text-green-700' },
  { value: 'COMPLETED', label: '완료', color: 'bg-gray-100 text-gray-700' },
  { value: 'CANCELLED', label: '취소', color: 'bg-red-100 text-red-700' },
];

export default function GatheringsPage() {
  const [gatherings, setGatherings] = useState<Gathering[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<GatheringStatus | ''>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedGathering, setSelectedGathering] = useState<Gathering | null>(null);
  const [formData, setFormData] = useState<UpdateGatheringDto>({
    status: 'RECRUITING',
  });

  useEffect(() => {
    fetchGatherings();
  }, [pagination.page, selectedStatus]);

  const fetchGatherings = async () => {
    try {
      setLoading(true);
      const response = await gatheringsApi.getGatherings(
        pagination.page,
        pagination.limit,
        selectedStatus || undefined
      );
      setGatherings(response.data);
      setPagination((prev) => ({ ...prev, ...response.pagination }));
    } catch (error) {
      console.error('Failed to fetch gatherings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (gathering: Gathering) => {
    setSelectedGathering(gathering);
    setFormData({
      status: gathering.status,
      title: gathering.title,
      description: gathering.description,
      maxParticipants: gathering.maxParticipants,
      price: gathering.price,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await gatheringsApi.deleteGathering(id);
      fetchGatherings();
    } catch (error) {
      console.error('Failed to delete gathering:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGathering) return;

    try {
      await gatheringsApi.updateGathering(selectedGathering.id, formData);
      setShowModal(false);
      fetchGatherings();
    } catch (error) {
      console.error('Failed to save gathering:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const filteredGatherings = gatherings.filter((gathering) =>
    gathering.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">모임 관리</h1>
        <p className="text-gray-600">등록된 모임을 관리합니다</p>
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="모임 제목으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as GatheringStatus | '');
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
            >
              <option value="">전체 상태</option>
              {GATHERING_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
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
                  모임
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  호스트
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  일정/장소
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  참여자
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
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    로딩 중...
                  </td>
                </tr>
              ) : filteredGatherings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    등록된 모임이 없습니다
                  </td>
                </tr>
              ) : (
                filteredGatherings.map((gathering) => {
                  const statusInfo = GATHERING_STATUSES.find(
                    (s) => s.value === gathering.status
                  );
                  return (
                    <tr key={gathering.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {gathering.image?.url ? (
                              <img
                                src={getImageUrl(gathering.image.url)}
                                alt={gathering.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {gathering.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {gathering.category.name}
                            </p>
                            {gathering.price > 0 && (
                              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                {gathering.price.toLocaleString()}원
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {gathering.host.nickname || gathering.host.email}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {gathering.host.email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm space-y-1">
                          <p className="flex items-center gap-1 text-gray-900">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(gathering.scheduledAt).toLocaleString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          <p className="flex items-start gap-1 text-gray-500 text-xs">
                            <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">
                              {gathering.locationAddress}
                            </span>
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {gathering.currentParticipants} / {gathering.maxParticipants}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          리뷰 {gathering._count.reviews}개
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${statusInfo?.color}`}
                        >
                          {statusInfo?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(gathering)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(gathering.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      {/* Edit Modal */}
      {showModal && selectedGathering && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">모임 수정</h2>
              <p className="text-sm text-gray-500 mt-1">
                {selectedGathering.title}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  상태 *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as GatheringStatus,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                >
                  {GATHERING_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  제목
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                  placeholder="모임 제목"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                  rows={4}
                  placeholder="모임 설명"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                        maxParticipants: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                    placeholder="최대 인원"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    참가비 (원)
                  </label>
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Current Info (Read-only) */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  현재 정보
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">호스트:</span>{' '}
                    <span className="font-medium">
                      {selectedGathering.host.nickname || selectedGathering.host.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">카테고리:</span>{' '}
                    <span className="font-medium">
                      {selectedGathering.category.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">현재 참여자:</span>{' '}
                    <span className="font-medium">
                      {selectedGathering.currentParticipants}명
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">일정:</span>{' '}
                    <span className="font-medium">
                      {new Date(selectedGathering.scheduledAt).toLocaleDateString()}
                    </span>
                  </div>
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
                  className="flex-1 px-4 py-2.5 bg-moa-primary text-white font-semibold rounded-xl hover:shadow-lg transition-shadow"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
