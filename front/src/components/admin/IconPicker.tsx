'use client';

import { useState, useMemo, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { icons } from 'lucide-react';
import { Search, X } from 'lucide-react';

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  onClose?: () => void;
}

// Lucide React에서 사용 가능한 아이콘 목록 추출
const getAllIcons = (): string[] => {
  console.log('[getAllIcons] icons 객체 타입:', typeof icons);
  console.log('[getAllIcons] icons 키 개수:', Object.keys(icons).length);

  const iconNames = Object.keys(icons).sort();
  console.log('[getAllIcons] 추출된 아이콘:', iconNames.length, '개');
  console.log('[getAllIcons] 샘플:', iconNames.slice(0, 10));

  return iconNames;
};

export default function IconPicker({ value, onChange, onClose }: IconPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [availableIcons, setAvailableIcons] = useState<string[]>([]);

  // 클라이언트 사이드에서만 아이콘 목록 로드
  useEffect(() => {
    console.log('[IconPicker] useEffect - 아이콘 목록 로드 시작');
    const icons = getAllIcons();
    console.log('[IconPicker] 로드된 아이콘 개수:', icons.length);
    console.log('[IconPicker] Home 아이콘 포함:', icons.includes('Home'));
    setAvailableIcons(icons);
  }, []);

  // 검색 필터링
  const filteredIcons = useMemo(() => {
    const term = searchTerm.trim();
    if (!term) {
      console.log('[IconPicker] 검색어 없음, 전체 아이콘 표시:', availableIcons.length);
      return availableIcons;
    }

    const lowerTerm = term.toLowerCase();
    const filtered = availableIcons.filter((iconName) =>
      iconName.toLowerCase().includes(lowerTerm)
    );
    console.log(`[IconPicker] 검색어 "${term}" 결과:`, filtered.length, '개');
    console.log('[IconPicker] 검색 결과 샘플:', filtered.slice(0, 5));
    return filtered;
  }, [searchTerm, availableIcons]);

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    if (onClose) {
      onClose();
    }
  };

  // 동적으로 아이콘 컴포넌트 가져오기
  const getIconComponent = (iconName: string) => {
    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<any>;
    return IconComponent ? <IconComponent className="w-6 h-6" /> : null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">아이콘 선택</h2>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm
                ? `${filteredIcons.length}개의 검색 결과 (전체 ${availableIcons.length}개)`
                : `${availableIcons.length}개의 아이콘 사용 가능`}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="닫기"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="아이콘 검색... (예: User, Home, Settings)"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moa-primary focus:border-moa-primary outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* Icon Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
            {filteredIcons.map((iconName) => (
              <button
                key={iconName}
                onClick={() => handleSelect(iconName)}
                className={`
                  relative group flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                  ${
                    value === iconName
                      ? 'border-moa-primary bg-moa-primary/10 shadow-md'
                      : 'border-gray-200 hover:border-moa-primary hover:bg-moa-primary/5'
                  }
                `}
                title={iconName}
              >
                {/* Icon */}
                <div className="text-gray-700 group-hover:text-moa-primary transition-colors">
                  {getIconComponent(iconName)}
                </div>

                {/* Icon name tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {iconName}
                </div>

                {/* Selected indicator */}
                {value === iconName && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-moa-primary rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* No results */}
          {filteredIcons.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 font-medium">검색 결과가 없습니다</p>
              <p className="text-sm text-gray-400 mt-1">
                다른 검색어를 시도해보세요
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0 bg-gray-50">
          <div className="text-sm text-gray-600">
            {value && (
              <span className="flex items-center gap-2">
                <span className="text-gray-500">선택된 아이콘:</span>
                <span className="font-mono font-semibold text-moa-primary">{value}</span>
                {getIconComponent(value)}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              onChange('');
              if (onClose) onClose();
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            선택 해제
          </button>
        </div>
      </div>
    </div>
  );
}
