/**
 * 지역 데이터 상수
 * 3단계 depth 구조: 시/도 > 구/군 > 모임 리스트
 */

export interface District {
  code: string;
  name: string;
  keywords: string[]; // 검색용 키워드 (예: "강남구", "강남", "테헤란로")
}

export interface City {
  code: string;
  name: string;
  emoji: string;
  districts: District[];
}

export const REGIONS: City[] = [
  {
    code: 'SEOUL',
    name: '서울',
    emoji: '🏙️',
    districts: [
      {
        code: 'GANGNAM',
        name: '강남',
        keywords: ['강남구', '강남', '테헤란로', '역삼', '삼성', '선릉', '청담'],
      },
      {
        code: 'HONGDAE',
        name: '홍대',
        keywords: ['홍대', '마포구', '홍대입구', '상수', '합정', '연남동'],
      },
      {
        code: 'JONGNO',
        name: '종로',
        keywords: ['종로구', '종로', '광화문', '인사동', '삼청동', '북촌'],
      },
      {
        code: 'GANGBUK',
        name: '강북',
        keywords: ['강북구', '강북', '수유', '미아', '우이동'],
      },
      {
        code: 'SONGPA',
        name: '송파',
        keywords: ['송파구', '송파', '잠실', '석촌', '문정', '가락'],
      },
      {
        code: 'YEONGDEUNGPO',
        name: '영등포',
        keywords: ['영등포구', '영등포', '여의도', '당산', '신길'],
      },
      {
        code: 'GWANGJIN',
        name: '광진',
        keywords: ['광진구', '광진', '건대', '구의', '자양'],
      },
      {
        code: 'SEONGDONG',
        name: '성동',
        keywords: ['성동구', '성동', '성수', '왕십리', '행당'],
      },
      {
        code: 'GANGSEO',
        name: '강서',
        keywords: ['강서구', '강서', '염창', '김포공항', '화곡'],
      },
      {
        code: 'YANGCHEON',
        name: '양천',
        keywords: ['양천구', '양천', '목동', '신정'],
      },
    ],
  },
  {
    code: 'BUSAN',
    name: '부산',
    emoji: '🌊',
    districts: [
      {
        code: 'HAEUNDAE',
        name: '해운대',
        keywords: ['해운대구', '해운대', '해운대해수욕장', '센텀시티', '마린시티'],
      },
      {
        code: 'SEOMYEON',
        name: '서면',
        keywords: ['부산진구', '서면', '전포동', '범천'],
      },
      {
        code: 'NAMPO',
        name: '남포동',
        keywords: ['중구', '남포동', 'BIFF광장', '자갈치', '국제시장'],
      },
      {
        code: 'GWANGALLI',
        name: '광안리',
        keywords: ['수영구', '광안리', '광안리해수욕장', '민락동'],
      },
      {
        code: 'SASANG',
        name: '사상',
        keywords: ['사상구', '사상', '덕포', '모라'],
      },
    ],
  },
  {
    code: 'DAEGU',
    name: '대구',
    emoji: '🏔️',
    districts: [
      {
        code: 'JUNGGU',
        name: '중구',
        keywords: ['중구', '동성로', '반월당', '종로'],
      },
      {
        code: 'SUSEONG',
        name: '수성',
        keywords: ['수성구', '수성', '범어', '만촌', '황금동'],
      },
      {
        code: 'DONGSEONG',
        name: '동성로',
        keywords: ['중구', '동성로', '대구역'],
      },
      {
        code: 'DALSEO',
        name: '달서',
        keywords: ['달서구', '달서', '성서', '이곡동'],
      },
    ],
  },
  {
    code: 'INCHEON',
    name: '인천',
    emoji: '🏢',
    districts: [
      {
        code: 'BUPYEONG',
        name: '부평',
        keywords: ['부평구', '부평', '부평시장', '부평역'],
      },
      {
        code: 'NAMDONG',
        name: '남동',
        keywords: ['남동구', '남동', '구월동', '간석동', '만수동'],
      },
      {
        code: 'YEONSU',
        name: '연수',
        keywords: ['연수구', '연수', '송도', '옥련동'],
      },
      {
        code: 'MICHUHOL',
        name: '미추홀',
        keywords: ['미추홀구', '미추홀', '주안', '숭의동'],
      },
    ],
  },
  {
    code: 'GWANGJU',
    name: '광주',
    emoji: '🌳',
    districts: [
      {
        code: 'DONGGU',
        name: '동구',
        keywords: ['동구', '충장로', '금남로'],
      },
      {
        code: 'SEOGU',
        name: '서구',
        keywords: ['서구', '상무지구', '치평동'],
      },
      {
        code: 'BUK',
        name: '북구',
        keywords: ['북구', '첨단', '운암동', '문흥동'],
      },
    ],
  },
  {
    code: 'DAEJEON',
    name: '대전',
    emoji: '🏛️',
    districts: [
      {
        code: 'YUSEONG',
        name: '유성',
        keywords: ['유성구', '유성', '궁동', '온천동'],
      },
      {
        code: 'SEOGU_DJ',
        name: '서구',
        keywords: ['서구', '둔산동', '탄방동', '정부청사'],
      },
      {
        code: 'JUNGGU_DJ',
        name: '중구',
        keywords: ['중구', '은행동', '대흥동'],
      },
    ],
  },
  {
    code: 'ULSAN',
    name: '울산',
    emoji: '🏭',
    districts: [
      {
        code: 'NAMGU',
        name: '남구',
        keywords: ['남구', '삼산동', '달동'],
      },
      {
        code: 'JUNGGU_US',
        name: '중구',
        keywords: ['중구', '성남동', '태화동'],
      },
      {
        code: 'DONGGU_US',
        name: '동구',
        keywords: ['동구', '일산동', '전하동'],
      },
    ],
  },
  {
    code: 'GYEONGGI',
    name: '경기',
    emoji: '🌆',
    districts: [
      {
        code: 'SUWON',
        name: '수원',
        keywords: ['수원시', '수원', '영통', '인계동', '화성'],
      },
      {
        code: 'SEONGNAM',
        name: '성남',
        keywords: ['성남시', '성남', '분당', '판교', '야탑'],
      },
      {
        code: 'YONGIN',
        name: '용인',
        keywords: ['용인시', '용인', '수지', '기흥', '죽전'],
      },
      {
        code: 'ANYANG',
        name: '안양',
        keywords: ['안양시', '안양', '평촌', '범계'],
      },
      {
        code: 'BUCHEON',
        name: '부천',
        keywords: ['부천시', '부천', '상동', '중동'],
      },
      {
        code: 'GOYANG',
        name: '고양',
        keywords: ['고양시', '고양', '일산', '킨텍스', '정발산'],
      },
    ],
  },
  {
    code: 'JEJU',
    name: '제주',
    emoji: '🏝️',
    districts: [
      {
        code: 'JEJU_CITY',
        name: '제주시',
        keywords: ['제주시', '연동', '노형동', '이도'],
      },
      {
        code: 'SEOGWIPO',
        name: '서귀포',
        keywords: ['서귀포시', '서귀포', '중문', '성산'],
      },
    ],
  },
];

/**
 * 주소 문자열에서 지역 정보를 추출하는 함수
 */
export function extractRegionFromAddress(address: string): {
  cityCode?: string;
  districtCode?: string;
} {
  if (!address) return {};

  // 정규화: 소문자 변환, 공백 제거
  const normalizedAddress = address.toLowerCase().replace(/\s+/g, '');

  for (const city of REGIONS) {
    // 시/도 매칭
    if (normalizedAddress.includes(city.name.toLowerCase())) {
      // 구/군 매칭
      for (const district of city.districts) {
        if (
          district.keywords.some((keyword) =>
            normalizedAddress.includes(keyword.toLowerCase().replace(/\s+/g, ''))
          )
        ) {
          return {
            cityCode: city.code,
            districtCode: district.code,
          };
        }
      }

      // 구/군을 찾지 못했지만 시/도는 매칭됨
      return { cityCode: city.code };
    }
  }

  return {};
}

/**
 * cityCode로 City 정보 찾기
 */
export function getCityByCode(cityCode: string): City | undefined {
  return REGIONS.find((city) => city.code === cityCode);
}

/**
 * cityCode와 districtCode로 District 정보 찾기
 */
export function getDistrictByCode(
  cityCode: string,
  districtCode: string
): District | undefined {
  const city = getCityByCode(cityCode);
  if (!city) return undefined;
  return city.districts.find((district) => district.code === districtCode);
}
