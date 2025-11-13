'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  AlertCircle,
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';
import {
  reportsApi,
  Report,
  ReportStatus,
  ReportType,
  UpdateReportStatusDto,
} from '@/lib/api/admin/reports';
import { useBadgeStore } from '@/store/badgeStore';

const REPORT_STATUSES: { value: ReportStatus; label: string; color: string }[] = [
  { value: 'PENDING', label: '대기', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'REVIEWING', label: '검토중', color: 'bg-blue-100 text-blue-700' },
  { value: 'RESOLVED', label: '해결', color: 'bg-green-100 text-green-700' },
  { value: 'REJECTED', label: '거부', color: 'bg-red-100 text-red-700' },
];

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: 'USER', label: '사용자 신고' },
  { value: 'GATHERING', label: '모임 신고' },
  { value: 'COMMENT', label: '댓글 신고' },
  { value: 'OTHER', label: '기타' },
];

export default function ReportsPage() {
  const { refreshReportBadge } = useBadgeStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | ''>('');
  const [selectedType, setSelectedType] = useState<ReportType | ''>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    fetchReports();
  }, [pagination.page, selectedStatus, selectedType]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.getReports(
        pagination.page,
        pagination.limit,
        selectedStatus || undefined,
        selectedType || undefined
      );
      setReports(response.data);
      setPagination((prev) => ({ ...prev, ...response.pagination }));
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (report: Report) => {
    setSelectedReport(report);
    setResolution(report.resolution || '');
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (status: ReportStatus) => {
    if (!selectedReport) return;

    try {
      const data: UpdateReportStatusDto = {
        status,
        resolution: resolution || undefined,
      };
      await reportsApi.updateReportStatus(selectedReport.id, data);
      setShowDetailModal(false);
      fetchReports();
      // Refresh badge count in sidebar
      refreshReportBadge();
    } catch (error) {
      console.error('Failed to update report status:', error);
      alert('상태 업데이트에 실패했습니다.');
    }
  };

  const filteredReports = reports.filter((report) =>
    report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reporter?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reportedUser?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">신고 관리</h1>
        <p className="text-gray-600">사용자 신고를 검토하고 처리합니다</p>
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="신고 사유, 신고자, 대상자로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as ReportType | '');
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
            >
              <option value="">전체 타입</option>
              {REPORT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as ReportStatus | '');
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
            >
              <option value="">전체 상태</option>
              {REPORT_STATUSES.map((status) => (
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
                  타입
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  신고자
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  대상자
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  신고 사유
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  상태
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  신고일
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
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    신고가 없습니다
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  const statusInfo = REPORT_STATUSES.find((s) => s.value === report.status);
                  const typeInfo = REPORT_TYPES.find((t) => t.value === report.type);

                  return (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 bg-moa-primary/10 text-moa-primary text-xs font-semibold rounded-full">
                          {typeInfo?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {report.reporter?.name || '알 수 없음'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {report.reporter?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {report.reportedUser ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {report.reportedUser.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {report.reportedUser.email}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {report.reason}
                          </p>
                          {report.description && (
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                              {report.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${statusInfo?.color}`}>
                          {statusInfo?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(report.createdAt).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetail(report)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">신고 상세</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Report Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">신고자</h3>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedReport.reporter?.name || '알 수 없음'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedReport.reporter?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">신고 대상</h3>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    {selectedReport.reportedUser ? (
                      <>
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedReport.reportedUser.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {selectedReport.reportedUser.email}
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500">대상 정보 없음</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Report Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">신고 사유</h3>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">
                  {selectedReport.reason}
                </p>
              </div>

              {selectedReport.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">상세 설명</h3>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-xl whitespace-pre-wrap">
                    {selectedReport.description}
                  </p>
                </div>
              )}

              {/* Current Status */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">현재 상태</h3>
                <div className="flex items-center gap-3">
                  <span className={`inline-block px-3 py-1.5 text-sm font-semibold rounded-full ${
                    REPORT_STATUSES.find((s) => s.value === selectedReport.status)?.color
                  }`}>
                    {REPORT_STATUSES.find((s) => s.value === selectedReport.status)?.label}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(selectedReport.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Resolution */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">처리 내용</h3>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                  rows={4}
                  placeholder="처리 내용을 입력하세요..."
                />
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleUpdateStatus('REVIEWING')}
                  disabled={selectedReport.status === 'REVIEWING'}
                  className="px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  검토중으로 변경
                </button>
                <button
                  onClick={() => handleUpdateStatus('RESOLVED')}
                  disabled={selectedReport.status === 'RESOLVED'}
                  className="px-4 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  해결로 변경
                </button>
                <button
                  onClick={() => handleUpdateStatus('REJECTED')}
                  disabled={selectedReport.status === 'REJECTED'}
                  className="px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  거부로 변경
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
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
