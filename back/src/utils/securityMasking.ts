/**
 * 보안을 위한 민감한 데이터 마스킹 유틸리티
 * 로그에 민감한 정보가 노출되지 않도록 처리
 */

// 마스킹해야 할 민감한 헤더 목록
const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'x-api-key',
  'x-access-token',
  'x-refresh-token',
  'x-csrf-token',
  'proxy-authorization',
];

// 마스킹해야 할 쿼리 파라미터/바디 필드
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'apiKey',
  'privateKey',
  'creditCard',
  'ssn',
  'socialSecurityNumber',
];

/**
 * JWT 토큰 마스킹
 * Bearer eyJhbGc... → Bearer ***...Zjgw (마지막 4자리만 표시)
 */
export function maskToken(token: string): string {
  if (!token || typeof token !== 'string') {
    return token;
  }

  // Bearer 토큰 처리
  if (token.startsWith('Bearer ')) {
    const actualToken = token.substring(7);
    if (actualToken.length <= 4) {
      return 'Bearer ***';
    }
    return `Bearer ***...${actualToken.slice(-4)}`;
  }

  // 일반 토큰 처리
  if (token.length <= 4) {
    return '***';
  }
  return `***...${token.slice(-4)}`;
}

/**
 * 이메일 마스킹
 * user@example.com → u***@example.com
 */
export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return email;
  }

  const [localPart, domain] = email.split('@');
  if (localPart.length <= 1) {
    return `*@${domain}`;
  }
  return `${localPart[0]}***@${domain}`;
}

/**
 * UUID 마스킹
 * 066cbd6b-15cc-42f2-ae78-fbc27117a204 → 066cbd6b-****-****-****-********a204
 */
export function maskUUID(uuid: string): string {
  if (!uuid || typeof uuid !== 'string') {
    return uuid;
  }

  const parts = uuid.split('-');
  if (parts.length !== 5) {
    return uuid;
  }

  return `${parts[0]}-****-****-****-********${parts[4].slice(-4)}`;
}

/**
 * HTTP 헤더 마스킹
 * 민감한 헤더는 마스킹 처리
 */
export function maskHeaders(headers: Record<string, any>): Record<string, any> {
  if (!headers || typeof headers !== 'object') {
    return headers;
  }

  const masked: Record<string, any> = {};

  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();

    if (SENSITIVE_HEADERS.includes(lowerKey)) {
      masked[key] = maskToken(value);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}

/**
 * 객체 내 민감한 필드 마스킹
 * 중첩된 객체와 배열도 재귀적으로 처리
 */
export function maskSensitiveData(data: any, depth: number = 0): any {
  // 최대 깊이 제한 (무한 재귀 방지)
  if (depth > 10) {
    return '[깊이 초과]';
  }

  if (data === null || data === undefined) {
    return data;
  }

  // 배열 처리
  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item, depth + 1));
  }

  // 객체 처리
  if (typeof data === 'object') {
    const masked: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();

      // 민감한 필드 마스킹
      if (SENSITIVE_FIELDS.some((field) => lowerKey.includes(field.toLowerCase()))) {
        masked[key] = typeof value === 'string' ? maskToken(value) : '***';
      }
      // 이메일 필드 마스킹
      else if (lowerKey.includes('email')) {
        masked[key] = typeof value === 'string' ? maskEmail(value) : value;
      }
      // UUID 필드 마스킹 (userId, id 등)
      else if ((lowerKey.includes('userid') || lowerKey === 'id') && typeof value === 'string' && value.includes('-')) {
        masked[key] = maskUUID(value);
      }
      // 재귀적으로 중첩된 객체 처리
      else if (typeof value === 'object') {
        masked[key] = maskSensitiveData(value, depth + 1);
      }
      // 일반 값은 그대로
      else {
        masked[key] = value;
      }
    }

    return masked;
  }

  // 기본 타입은 그대로 반환
  return data;
}

/**
 * 로그용 안전한 사용자 정보 객체 생성
 */
export function createSafeUserLog(userId: string, email?: string, role?: string): object {
  const log: Record<string, string> = {
    userId: maskUUID(userId),
  };

  if (email) {
    log.email = maskEmail(email);
  }

  if (role) {
    log.role = role; // 역할은 민감하지 않으므로 그대로
  }

  return log;
}

/**
 * 개발 환경에서만 민감한 정보 노출
 * 프로덕션에서는 항상 마스킹
 */
export function maskForEnvironment(data: any, forceShow: boolean = false): any {
  const isDevelopment = process.env.NODE_ENV;
  const allowSensitiveLogging = process.env.ALLOW_SENSITIVE_LOGGING;

  // 개발 환경이고 명시적으로 허용된 경우에만 원본 데이터 반환
  if ((isDevelopment && allowSensitiveLogging) || forceShow) {
    return data;
  }

  // 그 외에는 항상 마스킹
  return maskSensitiveData(data);
}

/**
 * IP 주소 마스킹 (GDPR 준수)
 * 192.168.1.100 → 192.168.***.***
 */
export function maskIP(ip: string): string {
  if (!ip || typeof ip !== 'string') {
    return ip;
  }

  // IPv6 처리
  if (ip.includes('::')) {
    const parts = ip.split('::');
    return parts.length > 0 ? `${parts[0]}::***` : ip;
  }

  // IPv4 처리
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`;
  }

  return ip;
}
