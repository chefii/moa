'use client';

import { useState, useEffect } from 'react';
import { termsApi, Terms, TermsType } from '@/lib/api/terms';
import { FileText, Loader2 } from 'lucide-react';
import MobileLayout from '@/components/MobileLayout';

export default function TermsPage() {
  const [termsTypes, setTermsTypes] = useState<TermsType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [currentTerms, setCurrentTerms] = useState<Terms | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);

  // 약관 타입 목록 로드
  useEffect(() => {
    const loadTermsTypes = async () => {
      try {
        const types = await termsApi.getTermsTypes();
        setTermsTypes(types);
        if (types.length > 0) {
          // 첫 번째 타입을 기본 선택
          const firstType = types[0].code.replace('TERMS_TYPE_', '');
          setSelectedType(firstType);
        }
      } catch (error) {
        console.error('Failed to load terms types:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTermsTypes();
  }, []);

  // 선택된 타입의 약관 로드
  useEffect(() => {
    if (!selectedType) return;

    const loadTerms = async () => {
      setContentLoading(true);
      try {
        const terms = await termsApi.getTermsByType(selectedType);
        setCurrentTerms(terms);
      } catch (error) {
        console.error('Failed to load terms:', error);
        setCurrentTerms(null);
      } finally {
        setContentLoading(false);
      }
    };

    loadTerms();
  }, [selectedType]);

  if (loading) {
    return (
      <MobileLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-moa-primary animate-spin mx-auto mb-3" />
            <p className="text-gray-600">약관 정보를 불러오는 중...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 py-4 md:py-8">
        <div className="px-4">
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1 md:mb-2">법적 고지</h1>
          <p className="text-sm md:text-base text-gray-600">MOA 서비스 이용을 위한 약관 및 정책을 확인하세요</p>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max">
              {termsTypes.map((type) => {
                const typeCode = type.code.replace('TERMS_TYPE_', '');
                const isActive = selectedType === typeCode;

                return (
                  <button
                    key={type.code}
                    onClick={() => setSelectedType(typeCode)}
                    className={`
                      px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium whitespace-nowrap transition-colors relative
                      ${
                        isActive
                          ? 'text-moa-primary border-b-2 border-moa-primary'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    {type.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 md:p-8">
            {contentLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-6 h-6 text-moa-primary animate-spin mx-auto mb-2" />
                <p className="text-gray-600 text-sm">약관을 불러오는 중...</p>
              </div>
            ) : currentTerms ? (
              <div>
                {/* Terms Header */}
                <div className="mb-4 md:mb-6 pb-4 md:pb-6 border-b border-gray-200">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className="text-lg md:text-2xl font-bold text-gray-900 break-keep">{currentTerms.title}</h2>
                    <span className="text-xs md:text-sm text-gray-500 bg-gray-100 px-2 md:px-3 py-1 rounded-full whitespace-nowrap">
                      v{currentTerms.version}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-500">
                    최종 수정일: {new Date(currentTerms.updatedAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>

                {/* Terms Content */}
                <div
                  className="prose prose-sm md:prose-base max-w-none
                    prose-headings:font-bold prose-headings:text-gray-900
                    prose-h1:text-xl md:prose-h1:text-2xl prose-h1:mb-3 md:prose-h1:mb-4
                    prose-h2:text-lg md:prose-h2:text-xl prose-h2:mb-2 md:prose-h2:mb-3 prose-h2:mt-4 md:prose-h2:mt-6
                    prose-h3:text-base md:prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-3 md:prose-h3:mt-4
                    prose-p:text-sm md:prose-p:text-base prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-3 md:prose-p:mb-4
                    prose-ul:list-disc prose-ul:pl-5 md:prose-ul:pl-6 prose-ul:mb-3 md:prose-ul:mb-4
                    prose-ol:list-decimal prose-ol:pl-5 md:prose-ol:pl-6 prose-ol:mb-3 md:prose-ol:mb-4
                    prose-li:text-sm md:prose-li:text-base prose-li:text-gray-700 prose-li:mb-1 md:prose-li:mb-2
                    prose-strong:text-gray-900 prose-strong:font-semibold
                    prose-a:text-moa-primary prose-a:no-underline hover:prose-a:underline
                  "
                  dangerouslySetInnerHTML={{
                    __html: currentTerms.content.replace(/\n/g, '<br/>')
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">해당 약관을 찾을 수 없습니다</p>
              </div>
            )}
          </div>
        </div>

        {/* Company Info Footer */}
        <div className="mt-4 md:mt-8 p-4 md:p-6 bg-white rounded-xl md:rounded-2xl shadow-sm">
          <h3 className="font-bold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">회사 정보</h3>
          <div className="space-y-1 text-xs md:text-sm text-gray-600">
            <p>상호: 주식회사 모아랩</p>
            <p>대표: ○○○</p>
            <p>사업자등록번호: 000-00-00000</p>
            <p>통신판매업 신고번호: 제0000-서울강남-00000호</p>
            <p className="break-all">주소: 서울특별시 ○○구 ○○로 00, 0층</p>
            <p className="break-all">이메일: support@moa.com | 전화: 0000-0000</p>
            <p className="text-gray-500 text-[10px] md:text-xs mt-3 md:mt-4">
              Copyright © 2025 Moalab Inc. All rights reserved.
            </p>
          </div>
        </div>
        </div>
      </div>
    </MobileLayout>
  );
}
