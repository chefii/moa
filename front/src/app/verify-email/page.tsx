'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('유효하지 않은 인증 링크입니다.');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/verification/email/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage('이메일 인증이 완료되었습니다!');
      } else {
        setStatus('error');
        setMessage(data.message || '인증에 실패했습니다.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('인증 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-purple-100 overflow-hidden">
          {/* Header */}
          <div className={`px-8 py-10 text-center ${
            status === 'loading'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500'
              : status === 'success'
              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
              : 'bg-gradient-to-r from-red-500 to-orange-500'
          }`}>
            <div className="mb-4">
              {status === 'loading' && (
                <Loader2 className="w-20 h-20 mx-auto text-white animate-spin" />
              )}
              {status === 'success' && (
                <div className="relative">
                  <div className="absolute inset-0 bg-white/30 rounded-full blur-xl animate-pulse"></div>
                  <CheckCircle className="w-20 h-20 mx-auto text-white relative" />
                </div>
              )}
              {status === 'error' && (
                <XCircle className="w-20 h-20 mx-auto text-white" />
              )}
            </div>
            <h1 className="text-3xl font-black text-white mb-2">
              {status === 'loading' && '인증 처리 중...'}
              {status === 'success' && '인증 완료!'}
              {status === 'error' && '인증 실패'}
            </h1>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Message */}
            <div className="text-center mb-6">
              <Mail className={`w-16 h-16 mx-auto mb-4 ${
                status === 'success' ? 'text-green-500' : 'text-gray-400'
              }`} />
              <p className="text-lg text-gray-700 font-semibold mb-2">
                {message}
              </p>
              {status === 'success' && (
                <p className="text-sm text-gray-500">
                  신뢰 점수 +10 포인트를 받았습니다!
                </p>
              )}
            </div>

            {/* Success Actions */}
            {status === 'success' && (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-green-800 text-center">
                    ✓ 모든 서비스를 이용하실 수 있습니다
                  </p>
                </div>

                <Link
                  href="/login"
                  className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-center"
                >
                  <span className="flex items-center justify-center gap-2">
                    로그인 페이지로 이동
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </Link>

                <Link
                  href="/"
                  className="block w-full py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-center"
                >
                  메인으로 이동
                </Link>
              </div>
            )}

            {/* Error Actions */}
            {status === 'error' && (
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-red-800">
                    <strong>인증에 실패했습니다</strong>
                  </p>
                  <ul className="text-xs text-red-700 mt-2 space-y-1 list-disc list-inside">
                    <li>인증 링크가 만료되었거나 (유효시간: 1시간)</li>
                    <li>이미 사용된 링크이거나</li>
                    <li>올바르지 않은 링크입니다</li>
                  </ul>
                </div>

                <Link
                  href="/login"
                  className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-center"
                >
                  로그인 페이지로 이동
                </Link>

                <Link
                  href="/"
                  className="block w-full py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-center"
                >
                  메인으로 이동
                </Link>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    로그인 후 프로필에서<br/>
                    인증 메일을 다시 받을 수 있습니다.
                  </p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {status === 'loading' && (
              <div className="text-center py-8">
                <div className="flex justify-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <p className="text-sm text-gray-500">
                  이메일 인증을 처리하고 있습니다...
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              모아 (MOA) - 관심사로 모이는 사람들
            </p>
          </div>
        </div>

        {/* Help Text */}
        {status === 'error' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              문제가 계속되나요?{' '}
              <a href="mailto:support@moa.com" className="text-purple-600 font-semibold hover:underline">
                고객센터 문의
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
