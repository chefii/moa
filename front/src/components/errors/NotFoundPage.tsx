'use client';

import Link from 'next/link';
import { Home, ArrowLeft, SearchX } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-moa-primary/10 via-white to-moa-accent/10 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-40 h-40 bg-gradient-to-br from-moa-primary to-moa-accent rounded-full flex items-center justify-center shadow-2xl">
              <SearchX className="w-20 h-20 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <span className="text-2xl font-black">404</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-6xl font-black text-gray-900 mb-4">
          페이지를 찾을 수 없습니다
        </h1>

        {/* Description */}
        <p className="text-xl text-gray-600 mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
          <br />
          주소를 다시 확인해 주세요.
        </p>

        {/* Error Details */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-lg">!</span>
              </div>
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                404 Not Found
              </h3>
              <p className="text-sm text-gray-600">
                이 오류는 일반적으로 잘못된 URL을 입력했거나, 삭제된 페이지에 접근하려고 할 때 발생합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            이전 페이지로
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-moa-primary to-moa-accent text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
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
