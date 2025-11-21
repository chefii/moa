'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// 하드코딩된 카테고리 데이터
const categories = [
  {
    id: '1',
    name: '스포츠/운동',
    displayName: '운동',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=800&fit=crop',
    color: '#ef4444',
    count: 124,
  },
  {
    id: '2',
    name: '문화/예술',
    displayName: '문화',
    imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=800&fit=crop',
    color: '#8b5cf6',
    count: 89,
  },
  {
    id: '3',
    name: '음식/요리',
    displayName: '맛집',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=800&fit=crop',
    color: '#f59e0b',
    count: 156,
  },
  {
    id: '4',
    name: '여행/아웃도어',
    displayName: '여행',
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=800&fit=crop',
    color: '#10b981',
    count: 98,
  },
  {
    id: '5',
    name: '스터디/교육',
    displayName: '스터디',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=800&fit=crop',
    color: '#3b82f6',
    count: 203,
  },
  {
    id: '6',
    name: '게임/오락',
    displayName: '게임',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=800&fit=crop',
    color: '#ec4899',
    count: 167,
  },
];

export default function CategoryStylesPage() {
  const [activeCard, setActiveCard] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 py-4">
          <h1 className="text-2xl font-black text-gray-900">카테고리 UI 스타일 미리보기</h1>
          <p className="text-sm text-gray-600 mt-1">마음에 드는 스타일을 선택하세요</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-8 space-y-16">

        {/* Style 1: Bento Grid */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">1. Bento Grid (벤토 박스)</h2>
            <p className="text-sm text-gray-600">모자이크 스타일, 크기가 다양한 그리드</p>
          </div>
          <div className="grid grid-cols-6 gap-3 h-[500px]">
            {/* 큰 카드 */}
            <div className="col-span-3 row-span-2 relative group cursor-pointer overflow-hidden rounded-2xl">
              <Image
                src={categories[0].imageUrl}
                alt={categories[0].name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-white font-bold text-2xl mb-2">{categories[0].displayName}</h3>
                <p className="text-white/90 text-sm">{categories[0].count}+ 모임</p>
              </div>
            </div>

            {/* 중간 카드들 */}
            <div className="col-span-3 row-span-1 relative group cursor-pointer overflow-hidden rounded-2xl">
              <Image
                src={categories[1].imageUrl}
                alt={categories[1].name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-lg">{categories[1].displayName}</h3>
                <p className="text-white/90 text-xs">{categories[1].count}+ 모임</p>
              </div>
            </div>

            <div className="col-span-2 row-span-1 relative group cursor-pointer overflow-hidden rounded-2xl">
              <Image
                src={categories[2].imageUrl}
                alt={categories[2].name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-lg">{categories[2].displayName}</h3>
                <p className="text-white/90 text-xs">{categories[2].count}+ 모임</p>
              </div>
            </div>

            <div className="col-span-2 row-span-2 relative group cursor-pointer overflow-hidden rounded-2xl">
              <Image
                src={categories[3].imageUrl}
                alt={categories[3].name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-white font-bold text-xl mb-2">{categories[3].displayName}</h3>
                <p className="text-white/90 text-sm">{categories[3].count}+ 모임</p>
              </div>
            </div>

            <div className="col-span-2 row-span-1 relative group cursor-pointer overflow-hidden rounded-2xl">
              <Image
                src={categories[4].imageUrl}
                alt={categories[4].name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-lg">{categories[4].displayName}</h3>
                <p className="text-white/90 text-xs">{categories[4].count}+ 모임</p>
              </div>
            </div>
          </div>
        </section>

        {/* Style 2: 3D Stack Cards */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">2. 3D Stack Cards (스택 카드)</h2>
            <p className="text-sm text-gray-600">Tinder 스타일, 스와이프 인터랙션</p>
          </div>
          <div className="relative h-[400px] flex items-center justify-center">
            {categories.slice(0, 4).map((cat, idx) => {
              const offset = (idx - activeCard) * 20;
              const scale = idx === activeCard ? 1 : 0.9 - (Math.abs(idx - activeCard) * 0.05);
              const zIndex = categories.length - Math.abs(idx - activeCard);
              const opacity = idx === activeCard ? 1 : 0.4;

              return (
                <div
                  key={cat.id}
                  className="absolute w-[320px] h-[400px] transition-all duration-500 cursor-pointer"
                  style={{
                    transform: `translateX(${offset}px) scale(${scale})`,
                    zIndex,
                    opacity,
                  }}
                  onClick={() => setActiveCard(idx)}
                >
                  <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <h3 className="text-white font-bold text-3xl mb-2">{cat.displayName}</h3>
                      <p className="text-white/90 text-lg mb-3">{cat.name}</p>
                      <p className="text-white/80 text-sm">{cat.count}+ 모임</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-2 mt-6">
            {categories.slice(0, 4).map((cat, idx) => (
              <button
                key={cat.id}
                onClick={() => setActiveCard(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === activeCard ? 'bg-moa-primary w-6' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </section>

        {/* Style 3: Overlap Slide Cards */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">3. Overlap Slide Cards (오버랩 슬라이드)</h2>
            <p className="text-sm text-gray-600">겹쳐진 카드들, 깊이감 있는 스크롤</p>
          </div>
          <div className="overflow-x-auto scrollbar-hide -mx-5">
            <div className="flex gap-0 px-5 pb-2">
              {categories.map((cat, idx) => (
                <div
                  key={cat.id}
                  className="relative flex-shrink-0 group cursor-pointer"
                  style={{
                    width: '280px',
                    marginLeft: idx === 0 ? '0' : '-80px',
                    zIndex: categories.length - idx,
                  }}
                >
                  <div className="relative h-[350px] rounded-2xl overflow-hidden shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:z-50">
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white font-bold text-xl mb-1">{cat.displayName}</h3>
                      <p className="text-white/80 text-sm">{cat.count}+ 모임</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Style 4: Floating Islands */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">4. Floating Islands (떠다니는 섬)</h2>
            <p className="text-sm text-gray-600">자유로운 배치, 미묘한 애니메이션</p>
          </div>
          <div className="relative h-[500px] bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-3xl p-8 overflow-hidden">
            {/* 큰 원 */}
            <div className="absolute top-[10%] left-[5%] w-[200px] h-[200px] rounded-full overflow-hidden shadow-lg cursor-pointer hover:scale-110 transition-transform duration-300 animate-float">
              <Image
                src={categories[0].imageUrl}
                alt={categories[0].name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                <h3 className="text-white font-bold text-lg">{categories[0].displayName}</h3>
              </div>
            </div>

            {/* 중간 원 */}
            <div className="absolute top-[15%] right-[10%] w-[150px] h-[150px] rounded-full overflow-hidden shadow-lg cursor-pointer hover:scale-110 transition-transform duration-300" style={{ animationDelay: '0.5s' }}>
              <Image
                src={categories[1].imageUrl}
                alt={categories[1].name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                <h3 className="text-white font-bold text-sm">{categories[1].displayName}</h3>
              </div>
            </div>

            {/* 작은 원들 */}
            <div className="absolute bottom-[25%] left-[25%] w-[130px] h-[130px] rounded-full overflow-hidden shadow-lg cursor-pointer hover:scale-110 transition-transform duration-300" style={{ animationDelay: '1s' }}>
              <Image
                src={categories[2].imageUrl}
                alt={categories[2].name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                <h3 className="text-white font-bold text-sm">{categories[2].displayName}</h3>
              </div>
            </div>

            <div className="absolute bottom-[10%] right-[20%] w-[170px] h-[170px] rounded-full overflow-hidden shadow-lg cursor-pointer hover:scale-110 transition-transform duration-300" style={{ animationDelay: '1.5s' }}>
              <Image
                src={categories[3].imageUrl}
                alt={categories[3].name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                <h3 className="text-white font-bold">{categories[3].displayName}</h3>
              </div>
            </div>

            <div className="absolute top-[50%] left-[50%] w-[120px] h-[120px] rounded-full overflow-hidden shadow-lg cursor-pointer hover:scale-110 transition-transform duration-300" style={{ animationDelay: '2s' }}>
              <Image
                src={categories[4].imageUrl}
                alt={categories[4].name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
                <h3 className="text-white font-bold text-xs">{categories[4].displayName}</h3>
              </div>
            </div>
          </div>
        </section>

        {/* Style 5: Glassomorphism */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">5. Glassomorphism (글래스모피즘)</h2>
            <p className="text-sm text-gray-600">반투명 유리 효과, 현대적인 느낌</p>
          </div>
          <div className="relative h-[400px] bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-3xl overflow-hidden p-6">
            {/* 배경 애니메이션 원들 */}
            <div className="absolute top-[10%] left-[10%] w-[150px] h-[150px] bg-white/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[10%] right-[10%] w-[200px] h-[200px] bg-purple-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="relative grid grid-cols-3 gap-4 h-full">
              {categories.slice(0, 6).map((cat) => (
                <div
                  key={cat.id}
                  className="group cursor-pointer"
                >
                  <div className="relative h-full rounded-2xl overflow-hidden backdrop-blur-md bg-white/10 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    <div className="absolute inset-0 opacity-30">
                      <Image
                        src={cat.imageUrl}
                        alt={cat.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="relative h-full flex flex-col items-center justify-center p-4 text-center">
                      <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-white/50 shadow-lg">
                        <Image
                          src={cat.imageUrl}
                          alt={cat.name}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      </div>
                      <h3 className="text-white font-bold text-lg drop-shadow-lg">{cat.displayName}</h3>
                      <p className="text-white/90 text-sm drop-shadow">{cat.count}+ 모임</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Style 6: Masonry Layout */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">6. Masonry Layout (폭포수)</h2>
            <p className="text-sm text-gray-600">Pinterest 스타일, 높이가 다양한 카드</p>
          </div>
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {[...categories, ...categories.slice(0, 3)].map((cat, idx) => {
              const heights = ['h-[200px]', 'h-[250px]', 'h-[280px]', 'h-[220px]', 'h-[260px]'];
              const heightClass = heights[idx % heights.length];

              return (
                <div
                  key={`${cat.id}-${idx}`}
                  className="break-inside-avoid mb-4"
                >
                  <div className={`relative ${heightClass} rounded-2xl overflow-hidden shadow-lg group cursor-pointer`}>
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-bold text-lg mb-1">{cat.displayName}</h3>
                      <p className="text-white/80 text-sm mb-2">{cat.name}</p>
                      <div className="flex items-center gap-2 text-white/70 text-xs">
                        <span>{cat.count}+ 모임</span>
                        <span>•</span>
                        <span>인기</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Style 7: Horizontal Cards with Gradient */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">7. Gradient Cards (그라데이션 카드)</h2>
            <p className="text-sm text-gray-600">컬러풀한 그라데이션 오버레이</p>
          </div>
          <div className="overflow-x-auto scrollbar-hide -mx-5">
            <div className="flex gap-4 px-5 pb-2">
              {categories.map((cat, idx) => {
                const gradients = [
                  'from-red-500/80 to-orange-500/80',
                  'from-purple-500/80 to-pink-500/80',
                  'from-yellow-500/80 to-red-500/80',
                  'from-green-500/80 to-teal-500/80',
                  'from-blue-500/80 to-purple-500/80',
                  'from-pink-500/80 to-rose-500/80',
                ];
                const gradient = gradients[idx % gradients.length];

                return (
                  <div
                    key={cat.id}
                    className="flex-shrink-0 w-[200px] group cursor-pointer"
                  >
                    <div className="relative h-[280px] rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                      <Image
                        src={cat.imageUrl}
                        alt={cat.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} mix-blend-multiply`} />
                      <div className="absolute inset-0 flex flex-col justify-end p-5">
                        <h3 className="text-white font-bold text-xl mb-1 drop-shadow-lg">{cat.displayName}</h3>
                        <p className="text-white/90 text-sm drop-shadow">{cat.count}+ 모임</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Style 8: Minimal Cards */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">8. Minimal Cards (미니멀 카드)</h2>
            <p className="text-sm text-gray-600">심플하고 깔끔한 디자인</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="group cursor-pointer"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3 shadow-sm hover:shadow-xl transition-all duration-300">
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <div className="px-1">
                  <h3 className="font-bold text-gray-900 text-lg">{cat.displayName}</h3>
                  <p className="text-gray-500 text-sm">{cat.count}+ 모임</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* 애니메이션 CSS */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
