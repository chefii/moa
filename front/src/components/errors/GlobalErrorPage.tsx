'use client';

import { useEffect } from 'react';

interface GlobalErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      background: 'linear-gradient(to bottom right, #fee2e2, #ffffff, #ffedd5)',
    }}>
      <div style={{
        maxWidth: '42rem',
        width: '100%',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '900',
          color: '#1f2937',
          marginBottom: '1rem',
        }}>
          심각한 오류가 발생했습니다
        </h1>

        <p style={{
          fontSize: '1.25rem',
          color: '#6b7280',
          marginBottom: '2rem',
        }}>
          애플리케이션에서 예상치 못한 오류가 발생했습니다.
        </p>

        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid #fca5a5',
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            marginBottom: '0.5rem',
          }}>
            {error.message || '알 수 없는 오류가 발생했습니다.'}
          </p>
          {error.digest && (
            <p style={{
              fontSize: '0.75rem',
              color: '#9ca3af',
              fontFamily: 'monospace',
              background: '#f9fafb',
              padding: '0.5rem',
              borderRadius: '0.25rem',
            }}>
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={reset}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(to right, #7C3AED, #EC4899)',
              color: 'white',
              fontWeight: '700',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            다시 시도
          </button>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'white',
              color: '#374151',
              fontWeight: '600',
              borderRadius: '0.75rem',
              border: '2px solid #d1d5db',
              cursor: 'pointer',
            }}
          >
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  );
}
