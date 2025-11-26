'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Check,
  X,
} from 'lucide-react';
import { termsAdminApi, CreateTermsDto, UpdateTermsDto } from '@/lib/api/admin/terms';
import { termsApi, Terms, TermsType } from '@/lib/api/terms';

export default function AdminTermsPage() {
  const [terms, setTerms] = useState<Terms[]>([]);
  const [termsTypes, setTermsTypes] = useState<TermsType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedTerms, setSelectedTerms] = useState<Terms | null>(null);

  const [formData, setFormData] = useState<CreateTermsDto>({
    type: '',
    title: '',
    content: '',
    version: '1.0',
    isRequired: true,
    isActive: true,
  });

  useEffect(() => {
    loadTerms();
    loadTermsTypes();
  }, [selectedType]);

  const loadTerms = async () => {
    try {
      setLoading(true);
      const data = await termsAdminApi.getTerms({
        type: selectedType || undefined,
      });
      setTerms(data.terms);
    } catch (error) {
      console.error('Failed to load terms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTermsTypes = async () => {
    try {
      const types = await termsApi.getTermsTypes();
      setTermsTypes(types);
    } catch (error) {
      console.error('Failed to load terms types:', error);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedTerms(null);
    setFormData({
      type: '',
      title: '',
      content: '',
      version: '1.0',
      isRequired: true,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (term: Terms) => {
    setModalMode('edit');
    setSelectedTerms(term);
    setFormData({
      type: term.type,
      title: term.title,
      content: term.content,
      version: term.version,
      isRequired: term.isRequired,
      isActive: term.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await termsAdminApi.deleteTerms(id);
      alert('약관이 삭제되었습니다');
      loadTerms();
    } catch (error: any) {
      alert(error.response?.data?.message || '삭제 실패');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (modalMode === 'create') {
        await termsAdminApi.createTerms(formData);
        alert('약관이 생성되었습니다');
      } else if (selectedTerms) {
        await termsAdminApi.updateTerms(selectedTerms.id, formData);
        alert('약관이 수정되었습니다');
      }
      setShowModal(false);
      loadTerms();
    } catch (error: any) {
      alert(error.response?.data?.message || '저장 실패');
    }
  };

  const filteredTerms = terms.filter((term) =>
    term.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">약관 관리</h1>
        <p className="text-gray-600">서비스 약관 및 정책을 관리합니다</p>
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="약관 제목으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
          >
            <option value="">모든 타입</option>
            {termsTypes.map((type) => (
              <option key={type.code} value={type.code.replace('TERMS_TYPE_', '')}>
                {type.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-2.5 bg-moa-primary text-white rounded-xl font-medium hover:bg-moa-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            새 약관 생성
          </button>
        </div>
      </div>

      {/* Terms List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">제목</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">타입</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">버전</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">필수</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">활성</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">수정일</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    로딩 중...
                  </td>
                </tr>
              ) : filteredTerms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    약관이 없습니다
                  </td>
                </tr>
              ) : (
                filteredTerms.map((term) => (
                  <tr key={term.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{term.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {termsTypes.find((t) => t.code === `TERMS_TYPE_${term.type}`)?.name ||
                          term.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{term.version}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {term.isRequired ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {term.isActive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          활성
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          비활성
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {new Date(term.updatedAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(term)}
                          className="p-2 text-gray-600 hover:text-moa-primary hover:bg-moa-primary/10 rounded-lg transition-colors"
                          title="수정"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(term.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'create' ? '새 약관 생성' : '약관 수정'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 약관 타입 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    약관 타입 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                    disabled={modalMode === 'edit'}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary disabled:bg-gray-100"
                  >
                    <option value="">타입 선택</option>
                    {termsTypes.map((type) => (
                      <option key={type.code} value={type.code.replace('TERMS_TYPE_', '')}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 버전 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    버전 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    required
                    placeholder="1.0"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                  />
                </div>
              </div>

              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="약관 제목을 입력하세요"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
                />
              </div>

              {/* 내용 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={15}
                  placeholder="약관 내용을 입력하세요"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary resize-none font-mono text-sm"
                />
              </div>

              {/* 옵션 */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isRequired}
                    onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                    className="w-5 h-5 text-moa-primary border-gray-300 rounded focus:ring-moa-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">필수 동의</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-moa-primary border-gray-300 rounded focus:ring-moa-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">활성화</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-moa-primary text-white font-medium rounded-xl hover:bg-moa-primary/90 transition-colors"
                >
                  {modalMode === 'create' ? '생성' : '수정'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
