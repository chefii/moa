import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// 로그 디렉토리 설정
const logDir = process.env.LOG_DIR || '/Users/philip/project/moa_file/logs';

// 로그 포맷 정의
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, requestId, duration, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]`;

    if (requestId) {
      log += ` [${requestId}]`;
    }

    log += `: ${message}`;

    if (duration !== undefined) {
      log += ` (${duration}ms)`;
    }

    // 추가 메타데이터가 있으면 출력
    const metaKeys = Object.keys(meta);
    if (metaKeys.length > 0 && !metaKeys.every(key => key === 'level' || key === 'timestamp')) {
      log += ` ${JSON.stringify(meta)}`;
    }

    return log;
  })
);

// 콘솔 로그 포맷 (개발 환경용 - 색상 포함)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, requestId, duration, ...meta }: any) => {
    let log = `${timestamp} ${level}`;

    if (requestId && typeof requestId === 'string') {
      log += ` 🔖[${requestId.substring(0, 8)}]`;
    }

    log += `: ${message}`;

    if (duration !== undefined) {
      log += ` ⏱️ ${duration}ms`;
    }

    return log;
  })
);

// Winston 로거 생성
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'http', // 기본값: http (모든 HTTP 요청 포함)
  format: logFormat,
  transports: [
    // 에러 로그 파일 (에러만 기록)
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d', // 14일간 보관
      zippedArchive: true,
    }),

    // 결합 로그 파일 (모든 레벨)
    new DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
    }),

    // HTTP 요청 로그 파일
    new DailyRotateFile({
      filename: path.join(logDir, 'http-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      maxSize: '20m',
      maxFiles: '7d', // 7일간 보관
      zippedArchive: true,
    }),

    // 성능 메트릭 로그 파일
    new DailyRotateFile({
      filename: path.join(logDir, 'performance-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      maxSize: '20m',
      maxFiles: '7d',
      zippedArchive: true,
      // 성능 로그만 필터링
      format: winston.format.combine(
        winston.format((info) => {
          return info.metric ? info : false;
        })(),
        logFormat
      ),
    }),
  ],
});

// 개발 환경에서는 콘솔 출력 추가
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}


// 로그 헬퍼 함수들
export const logRequest = (requestId: string, method: string, url: string, ip: string) => {
  logger.http(`📥 ${method} ${url}`, {
    requestId,
    method,
    url,
    ip,
  });
};

export const logResponse = (
  requestId: string,
  method: string,
  url: string,
  statusCode: number,
  duration: number
) => {
  const emoji = statusCode >= 500 ? '❌' : statusCode >= 400 ? '⚠️' : '✅';
  logger.http(`📤 ${emoji} ${method} ${url} - ${statusCode}`, {
    requestId,
    method,
    url,
    statusCode,
    duration,
  });
};

export const logError = (requestId: string, error: Error, context?: any) => {
  logger.error(`Error: ${error.message}`, {
    requestId,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    context,
  });
};

export const logPerformance = (
  requestId: string,
  operation: string,
  duration: number,
  metadata?: any
) => {
  logger.info(`⚡ Performance: ${operation}`, {
    requestId,
    metric: true,
    operation,
    duration,
    ...metadata,
  });
};

export const logSlowQuery = (requestId: string, query: string, duration: number, params?: any) => {
  logger.warn(`🐌 Slow Query (${duration}ms): ${query}`, {
    requestId,
    query,
    duration,
    params,
  });
};

export default logger;
