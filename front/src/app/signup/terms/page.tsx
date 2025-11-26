'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { termsApi, Terms } from '@/lib/api/terms';

export default function TermsDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const termId = searchParams.get('id');

  const [term, setTerm] = useState<Terms | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTerm = async () => {
      if (!termId) {
        router.back();
        return;
      }

      try {
        setLoading(true);
        const termData = await termsApi.getTermsById(termId);
        setTerm(termData);
      } catch (error) {
        console.error('Failed to load term:', error);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadTerm();
  }, [termId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moa-primary"></div>
      </div>
    );
  }

  if (!term) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                    term.isRequired
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {term.isRequired ? '필수' : '선택'}
                </span>
                <h1 className="text-xl font-bold text-gray-900">{term.title}</h1>
              </div>
              <p className="text-sm text-gray-500 mt-1">버전 {term.version}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="prose max-w-none">
            <div className="text-gray-900 whitespace-pre-wrap leading-relaxed">
              {term.content}
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => router.back()}
            className="w-full py-4 bg-moa-primary text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
