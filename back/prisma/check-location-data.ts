import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLocationData() {
  try {
    // 현재 저장된 위치 주소 샘플 조회
    const gatherings = await prisma.gathering.findMany({
      take: 20,
      select: {
        id: true,
        title: true,
        locationAddress: true,
        latitude: true,
        longitude: true,
      },
      where: {
        isDeleted: false,
      },
    });

    console.log('=== 현재 저장된 위치 주소 샘플 ===\n');

    if (gatherings.length === 0) {
      console.log('저장된 모임이 없습니다.');
      return;
    }

    gatherings.forEach((g, idx) => {
      console.log(`${idx + 1}. ${g.title}`);
      console.log(`   주소: ${g.locationAddress}`);
      console.log(`   좌표: ${g.latitude}, ${g.longitude}\n`);
    });

    // 주소 패턴 분석
    console.log('\n=== 주소 패턴 분석 ===\n');
    const addressPatterns = gatherings.map(g => {
      const addr = g.locationAddress;
      const parts = addr.split(' ');
      return {
        full: addr,
        parts: parts,
        city: parts[0] || '',
        district: parts[1] || '',
      };
    });

    // 시/도 목록
    const cities = [...new Set(addressPatterns.map(p => p.city))];
    console.log('발견된 시/도:', cities);

    // 각 시/도별 구/군 목록
    cities.forEach(city => {
      const districts = [
        ...new Set(
          addressPatterns
            .filter(p => p.city === city)
            .map(p => p.district)
        ),
      ];
      console.log(`${city}의 구/군:`, districts);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLocationData();
