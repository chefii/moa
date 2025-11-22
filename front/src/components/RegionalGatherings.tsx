'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { regionsApi, City, RegionStats } from '@/lib/api/regions';
import { gatheringsApi, Gathering } from '@/lib/api/gatherings';
import { MapPin, ChevronRight, Users, Calendar } from 'lucide-react';
import { getImageUrl } from '@/lib/utils/imageUrl';
import Image from 'next/image';

export default function RegionalGatherings() {
  const router = useRouter();

  // State
  const [regions, setRegions] = useState<City[]>([]);
  const [regionStats, setRegionStats] = useState<RegionStats[]>([]);
  const [selectedCityCode, setSelectedCityCode] = useState<string>('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>('');
  const [gatherings, setGatherings] = useState<Gathering[]>([]);
  const [loading, setLoading] = useState(true);
  const [gatheringsLoading, setGatheringsLoading] = useState(false);

  // Fetch regions and stats on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [regionsData, statsData] = await Promise.all([
          regionsApi.getRegions(),
          regionsApi.getStats(),
        ]);

        setRegions(regionsData);
        setRegionStats(statsData);

        // 기본값: 첫 번째 지역 선택 (모임이 있는 지역)
        if (statsData.length > 0) {
          setSelectedCityCode(statsData[0].cityCode);
          // 첫 번째 구/군 선택
          if (statsData[0].districts.length > 0) {
            setSelectedDistrictCode(statsData[0].districts[0].districtCode);
          }
        }
      } catch (error) {
        console.error('Failed to fetch regions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch gatherings when city or district changes
  useEffect(() => {
    if (!selectedCityCode) return;

    const fetchGatherings = async () => {
      try {
        setGatheringsLoading(true);
        const data = await gatheringsApi.getGatherings({
          cityCode: selectedCityCode,
          districtCode: selectedDistrictCode || undefined,
          status: 'RECRUITING',
          limit: 10,
          sort: 'popular',
        });
        setGatherings(data.data);
      } catch (error) {
        console.error('Failed to fetch gatherings:', error);
        setGatherings([]);
      } finally {
        setGatheringsLoading(false);
      }
    };

    fetchGatherings();
  }, [selectedCityCode, selectedDistrictCode]);

  // Get current city and districts
  const selectedCity = regionStats.find((r) => r.cityCode === selectedCityCode);
  const selectedCityInfo = regions.find((r) => r.code === selectedCityCode);

  if (loading) {
    return (
      <div className="px-5 py-6 bg-white">
        <div className="text-center py-8 text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (regionStats.length === 0) {
    return null; // 지역 데이터가 없으면 섹션 숨김
  }

  return (
    <section className="px-5 py-6 bg-white border-t border-gray-100">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-moa-primary" />
          <h2 className="text-lg font-black text-gray-900">지역별 모임</h2>
        </div>
        <button
          onClick={() => router.push('/gatherings')}
          className="flex items-center gap-1 text-sm font-semibold text-moa-primary"
        >
          전체
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 1 Depth: 시/도 선택 (가로 스크롤) */}
      <div className="mb-4 -mx-5 px-5">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {regionStats.map((region) => (
            <button
              key={region.cityCode}
              onClick={() => {
                setSelectedCityCode(region.cityCode);
                // 첫 번째 구/군 자동 선택
                if (region.districts.length > 0) {
                  setSelectedDistrictCode(region.districts[0].districtCode);
                } else {
                  setSelectedDistrictCode('');
                }
              }}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full font-semibold text-sm transition-all
                ${
                  selectedCityCode === region.cityCode
                    ? 'bg-moa-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <span className="mr-1">{region.emoji}</span>
              {region.cityName}
              <span className="ml-1.5 text-xs opacity-80">
                {region.totalCount}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2 Depth: 구/군 선택 (탭) */}
      {selectedCity && selectedCity.districts.length > 0 && (
        <div className="mb-4 -mx-5 px-5">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar border-b border-gray-200">
            {/* 전체 버튼 */}
            <button
              onClick={() => setSelectedDistrictCode('')}
              className={`
                flex-shrink-0 px-4 py-2 font-semibold text-sm transition-all relative
                ${
                  selectedDistrictCode === ''
                    ? 'text-moa-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              전체
              {selectedDistrictCode === '' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-moa-primary" />
              )}
            </button>

            {selectedCity.districts
              .filter((d) => d.count > 0) // 모임이 있는 구/군만 표시
              .map((district) => (
                <button
                  key={district.districtCode}
                  onClick={() => setSelectedDistrictCode(district.districtCode)}
                  className={`
                    flex-shrink-0 px-4 py-2 font-semibold text-sm transition-all relative
                    ${
                      selectedDistrictCode === district.districtCode
                        ? 'text-moa-primary'
                        : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  {district.districtName}
                  <span className="ml-1.5 text-xs opacity-70">
                    {district.count}
                  </span>
                  {selectedDistrictCode === district.districtCode && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-moa-primary" />
                  )}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* 3 Depth: 모임 리스트 (가로 스크롤) */}
      <div className="-mx-5 px-5">
        {gatheringsLoading ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            모임을 불러오는 중...
          </div>
        ) : gatherings.length > 0 ? (
          <>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
              {gatherings.map((gathering) => (
                <div
                  key={gathering.id}
                  onClick={() => router.push(`/gatherings/${gathering.id}`)}
                  className="flex-shrink-0 w-64 bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                >
                  {/* 썸네일 */}
                  <div className="relative h-40 bg-gray-200">
                    {gathering.image?.url ? (
                      <Image
                        src={getImageUrl(gathering.image.url)}
                        alt={gathering.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-moa-primary/10 to-moa-accent/10">
                        <Users className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    {/* 카테고리 뱃지 */}
                    {gathering.category && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-800">
                        {gathering.category.name}
                      </div>
                    )}
                  </div>

                  {/* 정보 */}
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-1">
                      {gathering.title}
                    </h3>

                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                      <Calendar className="w-3 h-3" />
                      <span className="line-clamp-1">
                        {new Date(gathering.scheduledAt).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">
                        {gathering.locationAddress}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Users className="w-3 h-3" />
                        <span>
                          {gathering.currentParticipants}/{gathering.maxParticipants}
                        </span>
                      </div>
                      {gathering.price > 0 && (
                        <div className="text-xs font-semibold text-moa-primary">
                          {gathering.price.toLocaleString()}원
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 더보기 버튼 */}
            <div className="mt-4 text-center">
              <button
                onClick={() =>
                  router.push(
                    `/gatherings?cityCode=${selectedCityCode}${
                      selectedDistrictCode ? `&districtCode=${selectedDistrictCode}` : ''
                    }`
                  )
                }
                className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold text-moa-primary hover:bg-moa-primary/5 rounded-lg transition-colors"
              >
                더보기
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            {selectedCity?.cityName}{' '}
            {selectedDistrictCode &&
              selectedCity?.districts.find((d) => d.districtCode === selectedDistrictCode)
                ?.districtName}
            에 모집 중인 모임이 없습니다
          </div>
        )}
      </div>

      {/* Scrollbar hiding CSS */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
