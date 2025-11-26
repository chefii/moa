'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { termsAdminApi, CreateTermsDto, UpdateTermsDto } from '@/lib/api/admin/terms';
import { termsApi, Terms, TermsType } from '@/lib/api/terms';

export default function TermsManagementPage() {
  const [termsTypes, setTermsTypes] = useState<TermsType[]>([]);
  const [termsByType, setTermsByType] = useState<Record<string, Terms>>({});
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('');
  const [currentTerms, setCurrentTerms] = useState<Terms | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<CreateTermsDto>({
    type: '',
    title: '',
    content: '',
    version: '1.0',
    isRequired: true,
    isActive: true,
  });

  useEffect(() => {
    fetchTermsTypes();
  }, []);

  useEffect(() => {
    if (termsTypes.length > 0) {
      fetchAllTerms();
    }
  }, [termsTypes]);

  useEffect(() => {
    if (selectedType && termsByType[selectedType]) {
      setCurrentTerms(termsByType[selectedType]);
    } else {
      setCurrentTerms(null);
    }
  }, [selectedType, termsByType]);

  const fetchTermsTypes = async () => {
    try {
      const types = await termsApi.getTermsTypes();
      setTermsTypes(types);
      if (types.length > 0) {
        setSelectedType(types[0].code.replace('TERMS_TYPE_', ''));
      }
    } catch (error) {
      console.error('Failed to fetch terms types:', error);
    }
  };

  const fetchAllTerms = async () => {
    try {
      setLoading(true);
      const termsMap: Record<string, Terms> = {};

      // 각 타입별로 활성화된 약관 조회
      for (const type of termsTypes) {
        const typeCode = type.code.replace('TERMS_TYPE_', '');
        try {
          const terms = await termsApi.getTermsByType(typeCode);
          termsMap[typeCode] = terms;
        } catch (error) {
          // 해당 타입의 약관이 없으면 스킵
          console.log(`No terms found for type: ${typeCode}`);
        }
      }

      setTermsByType(termsMap);
    } catch (error) {
      console.error('Failed to fetch terms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (type?: string) => {
    setModalMode('create');
    setFormData({
      type: type || selectedType,
      title: '',
      content: '',
      version: '1.0',
      isRequired: true,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (termsItem: Terms) => {
    setModalMode('edit');
    setFormData({
      type: termsItem.type,
      title: termsItem.title,
      content: termsItem.content,
      version: termsItem.version,
      isRequired: termsItem.isRequired,
      isActive: termsItem.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (modalMode === 'create') {
        await termsAdminApi.createTerms(formData);
      } else if (currentTerms) {
        await termsAdminApi.updateTerms(currentTerms.id, formData);
      }
      setShowModal(false);
      fetchAllTerms();
    } catch (error) {
      console.error('Failed to save terms:', error);
      alert('저장에 실패했습니다.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">약관 관리</h1>
          <p className="text-gray-600">서비스 이용약관, 개인정보 처리방침 등을 관리합니다</p>
        </div>
        <button
          onClick={() => handleCreate()}
          className="px-4 py-2.5 bg-moa-primary text-white font-semibold rounded-xl hover:shadow-lg transition-shadow flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          약관 추가
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto scrollbar-hide">
            {termsTypes.map((type) => {
              const typeCode = type.code.replace('TERMS_TYPE_', '');
              const isActive = selectedType === typeCode;
              const hasTerms = !!termsByType[typeCode];

              return (
                <button
                  key={type.code}
                  onClick={() => setSelectedType(typeCode)}
                  className={`
                    relative px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors
                    ${
                      isActive
                        ? 'text-moa-primary bg-moa-primary/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span>{type.name}</span>
                    {hasTerms ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-moa-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center text-gray-500">로딩 중...</div>
          ) : currentTerms ? (
            <div className="space-y-6">
              {/* Header with Edit Button */}
              <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {currentTerms.title}
                    </h2>
                    <span className="inline-block px-2.5 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                      v{currentTerms.version}
                    </span>
                    {currentTerms.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        활성
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
                        <XCircle className="w-3.5 h-3.5" />
                        비활성
                      </span>
                    )}
                    {currentTerms.isRequired && (
                      <span className="inline-block px-2.5 py-1 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full">
                        필수 동의
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    최종 수정: {new Date(currentTerms.updatedAt).toLocaleString('ko-KR')}
                  </p>
                </div>
                <button
                  onClick={() => handleEdit(currentTerms)}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  수정
                </button>
              </div>

              {/* Terms Content */}
              <div className="prose max-w-none">
                <div
                  className="text-gray-900 whitespace-pre-wrap leading-relaxed text-sm"
                  dangerouslySetInnerHTML={{
                    __html: currentTerms.content.replace(/\n/g, '<br/>'),
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">
                {termsTypes.find((t) => t.code === `TERMS_TYPE_${selectedType}`)?.name}{' '}
                약관이 등록되지 않았습니다
              </p>
              <button
                onClick={() => handleCreate(selectedType)}
                className="px-4 py-2 bg-moa-primary text-white font-semibold rounded-xl hover:shadow-lg transition-shadow"
              >
                약관 등록하기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'create' ? '약관 추가' : '약관 수정'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    약관 타입 *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                    disabled={modalMode === 'edit'}
                  >
                    {termsTypes.map((type) => (
                      <option
                        key={type.code}
                        value={type.code.replace('TERMS_TYPE_', '')}
                      >
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    버전 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.version}
                    onChange={(e) =>
                      setFormData({ ...formData, version: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                    placeholder="예: 1.0, 1.1, 2.0"
                  />
                </div>
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
                  placeholder="약관 제목"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  내용 * (일반 텍스트 입력)
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary text-sm leading-relaxed resize-none"
                  style={{
                    minHeight: '500px',
                    fontFamily: 'inherit',
                    lineHeight: '1.8',
                  }}
                  placeholder="약관 내용을 입력하세요...

예시:
제1조 (목적)
이 약관은 회사가 제공하는 서비스의 이용과 관련하여...

제2조 (정의)
1. 서비스란 ...
2. 회원이란 ..."
                />
                <p className="mt-2 text-xs text-gray-500">
                  💡 일반 텍스트로 입력하세요. 개행은 자동으로 처리됩니다.
                </p>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isRequired}
                    onChange={(e) =>
                      setFormData({ ...formData, isRequired: e.target.checked })
                    }
                    className="w-4 h-4 text-moa-primary border-gray-300 rounded focus:ring-moa-primary"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    필수 동의 약관
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
                  <span className="text-sm font-semibold text-gray-700">
                    활성화 (사용자에게 노출)
                  </span>
                </label>
              </div>

              {modalMode === 'create' && formData.isActive && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>주의:</strong> 이 약관을 활성화하면 같은 타입의 기존 활성 약관은 자동으로 비활성화됩니다.
                  </p>
                </div>
              )}

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
    </div>
  );
}
