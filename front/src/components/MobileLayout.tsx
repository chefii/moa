'use client';

import { ReactNode } from 'react';

interface MobileLayoutProps {
  children: ReactNode;
  showBorder?: boolean;
}

/**
 * 모바일 앱 뷰를 위한 레이아웃 래퍼
 * - 모바일 기기: 전체 화면
 * - 데스크톱: 중앙 정렬, 최대 너비 480px
 */
export default function MobileLayout({ children, showBorder = true }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div
        className={`w-full max-w-[480px] bg-white min-h-screen ${
          showBorder ? 'md:border-x md:border-gray-200 md:shadow-xl' : ''
        }`}
      >
        {children}
      </div>
    </div>
  );
}
