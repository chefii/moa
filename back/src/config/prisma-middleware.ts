import { Prisma } from '@prisma/client';

/**
 * 소프트 삭제 필터 미들웨어
 * 모든 조회 쿼리에 자동으로 isDeleted: false 조건을 추가합니다.
 */
export function softDeleteMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    // 소프트 삭제가 적용된 모델 목록 (Prisma 모델 이름은 대문자로 시작)
    const softDeleteModels = [
      'File',
      'User',
      'Category',
      'Gathering',
      'CommonCode',
      'Banner',
      'Popup',
      'Event',
      'Notice',
      'Badge',
      'MenuCategory',
      'MenuItem',
    ];

    // 현재 모델이 소프트 삭제 대상인지 확인
    if (softDeleteModels.includes(params.model || '')) {
      // 조회 작업에만 필터 적용
      if (params.action === 'findUnique' || params.action === 'findFirst') {
        // findUnique, findFirst는 where 조건에 isDeleted 추가
        params.args.where = {
          ...params.args.where,
          isDeleted: false,
        };
      } else if (
        params.action === 'findMany' ||
        params.action === 'count' ||
        params.action === 'aggregate' ||
        params.action === 'groupBy'
      ) {
        // findMany, count, aggregate, groupBy는 where 조건에 isDeleted 추가
        if (!params.args.where) {
          params.args.where = {};
        }
        params.args.where = {
          ...params.args.where,
          isDeleted: false,
        };
      }
    }

    return next(params);
  };
}
