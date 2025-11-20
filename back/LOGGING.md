# 로깅 시스템 가이드

Winston 기반의 고급 로깅 시스템이 구현되었습니다.

## 주요 기능

### 1. Request ID 추적
- 모든 HTTP 요청에 고유 ID가 자동으로 부여됩니다
- 클라이언트가 `X-Request-ID` 헤더로 ID를 제공할 수도 있습니다
- 로그에서 같은 요청의 모든 로그를 추적할 수 있습니다

### 2. 성능 메트릭 수집
- 모든 요청의 응답 시간 자동 측정
- 느린 요청 자동 감지 (1초 이상)
- 메모리 사용량 모니터링
- 성능 임계값 초과 시 경고

### 3. 로그 파일 저장
로그는 다음 위치에 저장됩니다:
```
logs/
├── error-2025-11-20.log        # 에러 로그만
├── combined-2025-11-20.log     # 모든 로그
├── http-2025-11-20.log         # HTTP 요청/응답 로그
└── performance-2025-11-20.log  # 성능 메트릭
```

### 4. 자동 로그 회전
- 날짜별로 로그 파일 자동 생성
- 파일 크기 20MB 초과 시 자동 분할
- 오래된 로그 자동 압축 (gzip)
- 보관 기간:
  - 에러 로그: 14일
  - 일반 로그: 14일
  - HTTP 로그: 7일
  - 성능 로그: 7일

## 로그 레벨

```typescript
logger.error()   // 에러 (항상 기록)
logger.warn()    // 경고
logger.info()    // 정보
logger.http()    // HTTP 요청/응답
logger.debug()   // 디버그 (개발 환경만)
```

## 환경 변수 설정

`.env` 파일에 다음 설정을 추가할 수 있습니다:

```bash
# 로그 레벨 (error, warn, info, http, debug)
LOG_LEVEL=info

# 로그 저장 디렉토리 (기본값: logs)
LOG_DIR=./logs
```

## 로그 예시

### 콘솔 출력 (개발 환경)
```
2025-11-20 15:30:45 info 🚀 Server started successfully
2025-11-20 15:30:45 http 📥 GET /api/users [12345678]
2025-11-20 15:30:45 http 📤 ✅ GET /api/users - 200 ⏱️ 45ms
2025-11-20 15:30:46 warn 🐌 Slow Request: GET /api/gatherings (1234ms)
```

### 파일 저장
```
2025-11-20 15:30:45 [INFO] [12345678]: 🚀 Server started successfully (port=4000, env=development)
2025-11-20 15:30:45 [HTTP] [87654321]: 📥 GET /api/users
2025-11-20 15:30:45 [HTTP] [87654321]: 📤 ✅ GET /api/users - 200 (45ms)
```

## 성능 메트릭

### 느린 요청 감지
1초 이상 걸린 요청 자동 경고:
```
[WARN] 🐌 Slow Request: GET /api/heavy-operation (1234ms)
```

### DB 쿼리 모니터링
100ms 이상 걸린 쿼리 자동 경고:
```
[WARN] 🐌 Slow Query Detected (145ms): SELECT * FROM users WHERE...
```

### 메모리 모니터링
50MB 이상 메모리 증가 시 경고:
```
[WARN] 💾 High Memory Usage: GET /api/users (heapUsed: +75.32 MB)
```

## 로그 조회

### 최근 에러 조회
```bash
tail -f logs/error-*.log
```

### 특정 Request ID로 검색
```bash
grep "12345678" logs/combined-*.log
```

### 느린 요청 찾기
```bash
grep "Slow Request" logs/combined-*.log
```

### 에러 통계
```bash
grep "ERROR" logs/combined-*.log | wc -l
```

## 프로덕션 배포 시 주의사항

1. **로그 레벨 조정**
   ```bash
   LOG_LEVEL=warn  # 프로덕션에서는 warn 이상만
   ```

2. **로그 수집 도구 연동**
   - ELK Stack (Elasticsearch, Logstash, Kibana)
   - Datadog
   - CloudWatch (AWS)

3. **디스크 공간 모니터링**
   - 로그 파일이 디스크를 가득 채우지 않도록 주의
   - 자동 삭제 스크립트 설정 권장

4. **보안**
   - 로그에 민감한 정보(비밀번호, 토큰 등)가 포함되지 않도록 주의
   - 필요시 로그 암호화 고려

## 커스텀 로깅

코드에서 직접 로깅할 때:

```typescript
import logger, { logPerformance, logError } from '@/config/logger';

// 기본 로깅
logger.info('User registered', { userId, email });
logger.warn('Invalid input', { field, value });
logger.error('Database error', { error: err.message });

// 성능 로깅
logPerformance(
  requestId,
  'data-processing',
  duration,
  { recordsProcessed: 1000 }
);

// 에러 로깅
logError(requestId, error, {
  userId,
  action: 'create-user',
});
```

## 문제 해결

### 로그 파일이 생성되지 않을 때
1. `logs/` 디렉토리가 있는지 확인
2. 쓰기 권한이 있는지 확인
3. `LOG_DIR` 환경 변수 확인

### 디스크 공간 부족
```bash
# 오래된 로그 수동 삭제
find logs/ -name "*.log" -mtime +30 -delete
find logs/ -name "*.gz" -mtime +60 -delete
```

### 로그가 너무 많을 때
```bash
# 로그 레벨 상향 조정
LOG_LEVEL=error  # 에러만 기록
```

## 🔒 보안 및 민감한 정보 처리

### 자동 마스킹

로깅 시스템은 민감한 정보를 **자동으로 마스킹**하여 보안을 강화합니다:

#### 1. JWT 토큰 마스킹
```
원본:   Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwNjZjYmQ2Yi0xNWNjLTQyZjItYWU3OC1mYmMyNzExN2EyMDQiLCJlbWFpbCI6ImFzZGZAYXNkZi5jb20iLCJyb2xlIjoiUk9MRV9TVVBFUl9BRE1JTiIsInJvbGVzIjpbIlJPTEVfU1VQRVJfQURNSU4iXSwiaWF0IjoxNzYzNjA0MTczLCJleHAiOjE3NjM2MDUwNzN9.CxNYYWWBR-qC3fuqCaXW26_lII6OZXTHj0jDTjGoZJw
마스킹: Bearer ***...ZJw
```

#### 2. 사용자 ID 마스킹
```
원본:   066cbd6b-15cc-42f2-ae78-fbc27117a204
마스킹: 066cbd6b-****-****-****-********a204
```

#### 3. 이메일 마스킹
```
원본:   user@example.com
마스킹: u***@example.com
```

#### 4. IP 주소 마스킹 (GDPR 준수)
```
원본:   192.168.1.100
마스킹: 192.168.***.***
```

### 민감한 필드 자동 감지

다음 필드명이 포함된 데이터는 자동으로 마스킹됩니다:
- `password`, `token`, `accessToken`, `refreshToken`
- `secret`, `apiKey`, `privateKey`
- `creditCard`, `ssn`, `socialSecurityNumber`
- `email` (부분 마스킹)
- `userId`, `id` (UUID 패턴 감지 시)

### 로깅된 민감한 정보 예시

**변경 전 (위험):**
```
[Auth] Headers: {
  "authorization": "Bearer eyJhbGc...", // JWT 토큰 전체 노출
  "cookie": "session=abc123..."         // 쿠키 노출
}
[Auth] SUCCESS: User authenticated: 066cbd6b-15cc-42f2-ae78-fbc27117a204
```

**변경 후 (안전):**
```
🔐 Auth Request {
  "authHeaderPresent": "present",
  "headers": {
    "authorization": "Bearer ***...ZJw",  // 토큰 마스킹
    "cookie": "***...123"                  // 쿠키 마스킹
  }
}
🔐 Auth Success: User authenticated {
  "userId": "066cbd6b-****-****-****-********a204",  // UUID 마스킹
  "role": "ROLE_SUPER_ADMIN"
}
```

### 환경별 보안 설정

`.env` 파일에서 설정:

```bash
# 개발 환경 (기본값 - 안전)
ALLOW_SENSITIVE_LOGGING=false
LOG_LEVEL=debug

# 프로덕션 환경 (필수!)
ALLOW_SENSITIVE_LOGGING=false
LOG_LEVEL=warn
```

⚠️ **중요**: `ALLOW_SENSITIVE_LOGGING=true`는 **절대 프로덕션에서 사용 금지**
- 디버깅을 위해 개발 환경에서만 일시적으로 사용
- 민감한 정보가 마스킹 없이 로그에 저장됨

### 보안 로깅 함수 사용

코드에서 민감한 데이터를 로깅할 때:

```typescript
import { maskToken, maskEmail, maskUUID, createSafeUserLog } from '@/utils/securityMasking';

// 토큰 마스킹
logger.info('Processing request', {
  authorization: maskToken(authHeader),
});

// 사용자 정보 안전하게 로깅
logger.info('User action', createSafeUserLog(userId, email, role));
// 결과: { userId: "066cbd6b-****-****-****-********a204", email: "u***@example.com", role: "USER" }

// 전체 객체 마스킹
import { maskSensitiveData } from '@/utils/securityMasking';
logger.info('Request data', maskSensitiveData(requestBody));
```

### 규정 준수

이 마스킹 시스템은 다음 규정을 준수합니다:

1. **GDPR (유럽 개인정보보호법)**
   - IP 주소 마스킹
   - 개인 식별 정보 (PII) 보호

2. **개인정보보호법 (한국)**
   - 이메일, 전화번호 등 개인정보 마스킹
   - 로그 보관 기간 설정 (14일)

3. **PCI DSS (카드 정보 보안)**
   - 신용카드 정보 자동 마스킹
   - 인증 토큰 보호

### 로그 파일 접근 제어

프로덕션 환경에서:

```bash
# 로그 디렉토리 권한 설정
chmod 700 logs/
chown app:app logs/

# 로그 파일 권한
chmod 600 logs/*.log
```

### 보안 감사 (Audit)

로그에서 보안 이벤트 추적:

```bash
# 인증 실패 감지
grep "Auth Failed" logs/combined-*.log

# 의심스러운 접근 시도
grep "403\|401" logs/http-*.log

# 느린 쿼리 (SQL Injection 시도 가능성)
grep "Slow Query" logs/combined-*.log
```

### 로그 암호화 (선택 사항)

매우 민감한 환경에서는 로그 파일 암호화 고려:

```bash
# GPG를 사용한 로그 암호화
gpg --encrypt --recipient admin@company.com logs/combined-*.log

# 로그 전송 전 암호화
tar -czf - logs/ | gpg --encrypt --recipient admin@company.com > logs.tar.gz.gpg
```

## 보안 체크리스트

프로덕션 배포 전 확인사항:

- [ ] `ALLOW_SENSITIVE_LOGGING=false` 설정 확인
- [ ] `LOG_LEVEL=warn` 이상으로 설정
- [ ] 로그 디렉토리 접근 권한 제한
- [ ] 로그 보관 기간 정책 수립 (GDPR: 최대 30일 권장)
- [ ] 로그 파일 백업 시 암호화 적용
- [ ] 개발 환경과 프로덕션 환경 .env 파일 분리
- [ ] 로그 모니터링 및 알림 설정
- [ ] 정기적인 보안 감사 수행
