import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger, { logRequest, logResponse, logPerformance, logError } from '../config/logger';
import { maskIP, maskSensitiveData } from '../utils/securityMasking';

// Request 타입 확장
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
    }
  }
}

/**
 * Request ID 생성 및 추적 미들웨어
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 요청에 고유 ID 부여 (클라이언트가 제공한 ID가 있으면 사용, 없으면 생성)
  req.requestId = (req.headers['x-request-id'] as string) || uuidv4();

  // 응답 헤더에도 Request ID 추가
  res.setHeader('X-Request-ID', req.requestId);

  next();
};

/**
 * HTTP 요청/응답 로깅 미들웨어
 */
export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.requestId || 'unknown';
  const startTime = Date.now();
  req.startTime = startTime;

  // 요청 로깅 (IP 마스킹 적용)
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const maskedIP = maskIP(ip);
  logRequest(requestId, req.method, req.url, maskedIP);

  // 응답 완료 시 로깅
  const originalSend = res.send;
  res.send = function (data: any): Response {
    const duration = Date.now() - startTime;

    // 응답 로깅
    logResponse(requestId, req.method, req.url, res.statusCode, duration);

    // 성능 메트릭 로깅 (느린 요청 감지)
    if (duration > 1000) {
      // 1초 이상 걸린 요청
      logger.warn(`🐌 Slow Request: ${req.method} ${req.url}`, {
        requestId,
        duration,
        method: req.method,
        url: req.url,
      });
    }

    return originalSend.call(this, data);
  };

  // 에러 처리
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // 성능 메트릭 저장 (모든 요청) - IP 마스킹 적용
    logPerformance(requestId, `${req.method} ${req.url}`, duration, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      ip: maskedIP,
    });
  });

  next();
};

/**
 * 에러 로깅 미들웨어
 */
export const errorLoggingMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.requestId || 'unknown';

  // 에러 로깅 (민감한 데이터 마스킹 적용)
  logError(requestId, err, {
    method: req.method,
    url: req.url,
    body: maskSensitiveData(req.body),
    query: maskSensitiveData(req.query),
    params: maskSensitiveData(req.params),
  });

  next(err);
};

/**
 * 성능 메트릭 수집 미들웨어
 */
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.requestId || 'unknown';
  const startTime = Date.now();

  // 메모리 사용량 측정
  const startMemory = process.memoryUsage();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const endMemory = process.memoryUsage();

    // 메모리 증가량 계산
    const memoryDelta = {
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      external: endMemory.external - startMemory.external,
    };

    // 성능 임계값 체크
    const slowRequestThreshold = 1000; // 1초
    const highMemoryThreshold = 50 * 1024 * 1024; // 50MB

    if (duration > slowRequestThreshold) {
      logger.warn(`⏱️  Slow Request Alert`, {
        requestId,
        method: req.method,
        url: req.url,
        duration,
        threshold: slowRequestThreshold,
      });
    }

    if (Math.abs(memoryDelta.heapUsed) > highMemoryThreshold) {
      logger.warn(`💾 High Memory Usage`, {
        requestId,
        method: req.method,
        url: req.url,
        memoryDelta: {
          heapUsed: `${(memoryDelta.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        },
      });
    }

    // 상세 성능 메트릭 로깅 (디버그 레벨)
    logger.debug(`📊 Performance Metrics`, {
      requestId,
      method: req.method,
      url: req.url,
      duration,
      statusCode: res.statusCode,
      memory: {
        heapUsed: `${(endMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(endMemory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        external: `${(endMemory.external / 1024 / 1024).toFixed(2)} MB`,
      },
      memoryDelta: {
        heapUsed: `${(memoryDelta.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      },
    });
  });

  next();
};
