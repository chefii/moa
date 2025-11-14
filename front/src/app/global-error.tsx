'use client';

import GlobalErrorPage from '@/components/errors/GlobalErrorPage';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="ko">
      <body>
        <GlobalErrorPage error={error} reset={reset} />
      </body>
    </html>
  );
}
