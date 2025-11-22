import { apiClient } from './client';

// Region types
export interface District {
  code: string;
  name: string;
}

export interface City {
  code: string;
  name: string;
  emoji: string;
  districts: District[];
}

export interface RegionStatsDistrict {
  districtCode: string;
  districtName: string;
  count: number;
}

export interface RegionStats {
  cityCode: string;
  cityName: string;
  emoji: string;
  totalCount: number;
  districts: RegionStatsDistrict[];
}

// API client
export const regionsApi = {
  /**
   * 전체 지역 목록 조회
   */
  async getRegions(): Promise<City[]> {
    const response = await apiClient.get<{ success: boolean; data: City[] }>('/regions');
    return response.data;
  },

  /**
   * 특정 시/도의 구/군 목록 조회
   */
  async getDistricts(cityCode: string): Promise<{ city: City; districts: District[] }> {
    const response = await apiClient.get<{
      success: boolean;
      data: { city: City; districts: District[] };
    }>(`/regions/${cityCode}/districts`);
    return response.data;
  },

  /**
   * 지역별 모임 통계 조회
   */
  async getStats(): Promise<RegionStats[]> {
    const response = await apiClient.get<{ success: boolean; data: RegionStats[] }>(
      '/regions/stats'
    );
    return response.data;
  },
};
