import express, { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { REGIONS, extractRegionFromAddress } from '../constants/regions';
import logger from '../config/logger';

const router = express.Router();

/**
 * @swagger
 * /api/regions:
 *   get:
 *     summary: 전체 지역 목록 조회
 *     tags: [Regions]
 *     description: 시/도 및 구/군 정보를 포함한 전체 지역 목록 반환
 *     responses:
 *       200:
 *         description: 지역 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       code:
 *                         type: string
 *                         example: SEOUL
 *                       name:
 *                         type: string
 *                         example: 서울
 *                       emoji:
 *                         type: string
 *                         example: 🏙️
 *                       districts:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             code:
 *                               type: string
 *                               example: GANGNAM
 *                             name:
 *                               type: string
 *                               example: 강남
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    logger.info('지역 목록 조회 요청');

    // keywords는 내부 검색용이므로 제외하고 반환
    const regions = REGIONS.map((city) => ({
      code: city.code,
      name: city.name,
      emoji: city.emoji,
      districts: city.districts.map((district) => ({
        code: district.code,
        name: district.name,
      })),
    }));

    res.json({
      success: true,
      data: regions,
    });
  } catch (error) {
    logger.error('지역 목록 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '지역 목록 조회에 실패했습니다',
    });
  }
});

/**
 * @swagger
 * /api/regions/{cityCode}/districts:
 *   get:
 *     summary: 특정 시/도의 구/군 목록 조회
 *     tags: [Regions]
 *     parameters:
 *       - in: path
 *         name: cityCode
 *         required: true
 *         schema:
 *           type: string
 *         description: 시/도 코드 (예 SEOUL, BUSAN)
 *     responses:
 *       200:
 *         description: 구/군 목록 조회 성공
 *       404:
 *         description: 해당 시/도를 찾을 수 없음
 */
router.get('/:cityCode/districts', async (req: Request, res: Response) => {
  try {
    const { cityCode } = req.params;

    logger.info('구/군 목록 조회 요청', { cityCode });

    const city = REGIONS.find((c) => c.code === cityCode);

    if (!city) {
      return res.status(404).json({
        success: false,
        message: '해당 시/도를 찾을 수 없습니다',
      });
    }

    const districts = city.districts.map((district) => ({
      code: district.code,
      name: district.name,
    }));

    res.json({
      success: true,
      data: {
        city: {
          code: city.code,
          name: city.name,
          emoji: city.emoji,
        },
        districts,
      },
    });
  } catch (error) {
    logger.error('구/군 목록 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '구/군 목록 조회에 실패했습니다',
    });
  }
});

/**
 * @swagger
 * /api/regions/stats:
 *   get:
 *     summary: 지역별 모임 통계
 *     tags: [Regions]
 *     description: 각 시/도 및 구/군별 모임 개수 통계
 *     responses:
 *       200:
 *         description: 통계 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       cityCode:
 *                         type: string
 *                       cityName:
 *                         type: string
 *                       emoji:
 *                         type: string
 *                       totalCount:
 *                         type: number
 *                       districts:
 *                         type: array
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    logger.info('지역별 모임 통계 조회 요청');

    // 모든 모집 중인 모임 조회
    const gatherings = await prisma.gathering.findMany({
      where: {
        isDeleted: false,
        status: 'RECRUITING',
      },
      select: {
        id: true,
        locationAddress: true,
      },
    });

    logger.info(`총 ${gatherings.length}개 모임 조회됨`);

    // 지역별 통계 집계
    const stats = REGIONS.map((city) => {
      const cityStats = {
        cityCode: city.code,
        cityName: city.name,
        emoji: city.emoji,
        totalCount: 0,
        districts: city.districts.map((district) => ({
          districtCode: district.code,
          districtName: district.name,
          count: 0,
        })),
      };

      // 각 모임의 주소를 분석하여 해당 지역에 카운트
      gatherings.forEach((gathering) => {
        const region = extractRegionFromAddress(gathering.locationAddress);

        if (region.cityCode === city.code) {
          cityStats.totalCount++;

          if (region.districtCode) {
            const districtStat = cityStats.districts.find(
              (d) => d.districtCode === region.districtCode
            );
            if (districtStat) {
              districtStat.count++;
            }
          }
        }
      });

      return cityStats;
    });

    // 모임이 있는 지역만 필터링 (선택사항)
    const filteredStats = stats.filter((stat) => stat.totalCount > 0);

    logger.info('지역별 통계 집계 완료', {
      totalRegions: stats.length,
      regionsWithGatherings: filteredStats.length,
    });

    res.json({
      success: true,
      data: filteredStats,
    });
  } catch (error) {
    logger.error('지역별 모임 통계 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '지역별 모임 통계 조회에 실패했습니다',
    });
  }
});

export default router;
