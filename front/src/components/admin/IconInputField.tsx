'use client';

import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search } from 'lucide-react';
import IconPicker from './IconPicker';

interface IconInputFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export default function IconInputField({
  label = '아이콘',
  value,
  onChange,
  placeholder = '아이콘 선택',
  required = false,
  error,
}: IconInputFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  // 동적으로 아이콘 컴포넌트 가져오기
  const getIconComponent = (iconName: string) => {
    if (!iconName) return null;
    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<any>;
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Icon Display & Click Area */}
      <button
        type="button"
        onClick={() => setShowPicker(true)}
        className={`
          w-full px-4 py-3 rounded-xl border-2 transition-all text-left
          ${
            error
              ? 'border-red-300 bg-red-50'
              : value
              ? 'border-moa-primary/30 bg-moa-primary/5 hover:border-moa-primary'
              : 'border-gray-300 bg-white hover:border-moa-primary/50'
          }
        `}
      >
        <div className="flex items-center gap-3">
          {/* Icon Preview */}
          <div className={`
            flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
            ${value ? 'bg-moa-primary/10 text-moa-primary' : 'bg-gray-100 text-gray-400'}
          `}>
            {value ? getIconComponent(value) : <Search className="w-5 h-5" />}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            {value ? (
              <div>
                <div className="text-sm text-gray-500">선택된 아이콘</div>
                <div className="font-mono font-semibold text-gray-900 truncate">{value}</div>
              </div>
            ) : (
              <div className="text-gray-400">{placeholder}</div>
            )}
          </div>

          {/* Button Indicator */}
          <div className="flex-shrink-0 text-moa-primary">
            <Search className="w-5 h-5" />
          </div>
        </div>
      </button>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* Icon Picker Modal */}
      {showPicker && (
        <IconPicker
          value={value}
          onChange={onChange}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
