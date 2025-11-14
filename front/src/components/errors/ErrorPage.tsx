'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Home, RefreshCw, AlertTriangle, Bug } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-40 h-40 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <AlertTriangle className="w-20 h-20 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <Bug className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-6xl font-black text-gray-900 mb-4">
          문제가 발생했습니다
        </h1>

        {/* Description */}
        <p className="text-xl text-gray-600 mb-8">
          예상치 못한 오류가 발생했습니다.
          <br />
          잠시 후 다시 시도해 주세요.
        </p>

        {/* Error Details */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-200 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-lg">!</span>
              </div>
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                오류 상세 정보
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {error.message || '알 수 없는 오류가 발생했습니다.'}
              </p>
              {error.digest && (
                <p className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-gradient-to-r from-moa-primary to-moa-accent text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            다시 시도
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            홈으로 이동
          </Link>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-gray-500">
          문제가 계속되면{' '}
          <Link href="/support" className="text-moa-primary hover:underline font-semibold">
            고객센터
          </Link>
          로 문의해 주세요.
        </p>
      </div>
    </div>
  );
}
