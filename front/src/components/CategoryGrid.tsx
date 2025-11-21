'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  displayName?: string;
  slug: string;
  imageUrl?: string;
  icon?: string;
  color?: string;
  description?: string;
  _count?: {
    gatherings: number;
  };
}

interface CategoryGridProps {
  categories: Category[];
  className?: string;
}

export default function CategoryGrid({ categories, className = '' }: CategoryGridProps) {
  // imageUrl이 있는 카테고리만 필터링 (게시판 카테고리 등 제외)
  const displayCategories = categories.filter(cat => cat.imageUrl);

  return (
    <div className={`overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x ${className}`}>
      <div className="flex gap-4 pl-3 pr-5 pb-2">
        {displayCategories.map((category) => (
          <Link
            key={category.id}
            href={`/gatherings?category=${category.slug}`}
            className="group block flex-shrink-0 snap-start"
          >
            <div className="flex flex-col items-center gap-2">
              {/* 동그란 이미지 */}
              <div className="relative w-[68px] h-[68px] rounded-full overflow-hidden shadow-md ring-2 ring-gray-100 group-active:scale-95 transition-all duration-300">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="68px"
                  />
                ) : (
                  // 이미지가 없을 경우 그라데이션 배경
                  <div
                    className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                    style={{
                      background: category.color
                        ? `linear-gradient(135deg, ${category.color} 0%, ${adjustBrightness(category.color, -30)} 100%)`
                        : undefined
                    }}
                  >
                    {category.icon && (
                      <span className="text-2xl">{category.icon}</span>
                    )}
                  </div>
                )}
              </div>

              {/* 텍스트 영역 - 이미지 하단 */}
              <div className="text-center w-[75px]">
                <h3 className="text-gray-900 font-bold text-sm leading-tight">
                  {category.displayName || category.name}
                </h3>
                {category._count && category._count.gatherings > 0 && (
                  <p className="text-gray-500 text-xs mt-0.5">
                    {category._count.gatherings}+
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// 색상 밝기 조정 유틸리티 함수
function adjustBrightness(color: string, amount: number): string {
  // #RRGGBB 형식이 아니면 그대로 반환
  if (!color.startsWith('#')) return color;

  const num = parseInt(color.slice(1), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));

  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}
