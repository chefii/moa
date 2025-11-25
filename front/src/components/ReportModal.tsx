'use client';

import { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import apiClient from '@/lib/api/client';

interface CommonCode {
  code: string;
  name: string;
  description?: string;
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reasonCode: string, description: string) => Promise<void>;
  reportType: 'BOARD' | 'COMMENT' | 'USER' | 'GATHERING';
}

export default function ReportModal({ isOpen, onClose, onSubmit, reportType }: ReportModalProps) {
  const [reasonCodes, setReasonCodes] = useState<CommonCode[]>([]);
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load report reason codes based on report type
      const loadReasonCodes = async () => {
        try {
          const groupCode = `REPORT_REASON_${reportType}`;
          const response = await apiClient.get(`/api/common-codes/group/${groupCode}`);
          if (response.data.success) {
            setReasonCodes(response.data.data);
          }
        } catch (error) {
          console.error('Failed to load reason codes:', error);
        }
      };

      loadReasonCodes();
    } else {
      // Reset form when modal closes
      setSelectedReason('');
      setDescription('');
      setIsDropdownOpen(false);
    }
  }, [isOpen, reportType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReason) {
      alert('신고 사유를 선택해주세요');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(selectedReason, description);
      setSelectedReason('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Report submission failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getTitle = () => {
    switch (reportType) {
      case 'BOARD':
        return '게시글 신고';
      case 'COMMENT':
        return '댓글 신고';
      case 'USER':
        return '사용자 신고';
      case 'GATHERING':
        return '모임 신고';
      default:
        return '신고하기';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Reason Selection - Custom Dropdown */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              신고 사유 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className={selectedReason ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedReason
                    ? reasonCodes.find((c) => c.code === selectedReason)?.name
                    : '사유를 선택해주세요'}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {reasonCodes.map((code) => (
                      <button
                        key={code.code}
                        type="button"
                        onClick={() => {
                          setSelectedReason(code.code);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                          selectedReason === code.code
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-700'
                        }`}
                      >
                        <p className="font-medium">{code.name}</p>
                        {code.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{code.description}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            {selectedReason && (
              <p className="mt-2 text-sm text-gray-500">
                {reasonCodes.find((c) => c.code === selectedReason)?.description}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상세 설명 (선택)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="신고 내용을 상세히 입력해주세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || !selectedReason}
              className="flex-1 px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '처리 중...' : '신고하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
