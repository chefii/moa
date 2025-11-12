# 모아 Backend

Express + TypeScript + Prisma 기반 백엔드 API 서버

## 🚀 빠른 시작 (Docker Compose 사용)

### 1. Docker Compose로 데이터베이스 실행
프로젝트 루트 디렉토리에서:
```bash
cd /Users/philip/project/moa
docker-compose up -d
```

이 명령으로 다음 서비스들이 실행됩니다:
- **PostgreSQL** (포트 5432) - 데이터베이스
- **Redis** (포트 6379) - 캐시
- **pgAdmin** (포트 5050) - 데이터베이스 관리 UI

### 2. 백엔드 디렉토리로 이동
```bash
cd back
```

### 3. 패키지 설치
```bash
npm install
```

### 4. 환경 변수 설정
```bash
cp .env.example .env
```

> **참고**: `.env.example`에 Docker Compose 기본값이 설정되어 있으므로 수정 없이 바로 사용 가능합니다.

### 5. Prisma 설정
```bash
# Prisma Client 생성
npm run prisma:generate

# 데이터베이스 마이그레이션
npm run prisma:migrate
```

### 6. 개발 서버 실행
```bash
npm run dev
```

서버가 http://localhost:4000 에서 실행됩니다.

### 7. 확인
브라우저에서 접속:
- API Health Check: http://localhost:4000/health
- API 정보: http://localhost:4000/api
- pgAdmin: http://localhost:5050
  - 이메일: `admin@moa.com`
  - 비밀번호: `admin123`

## 📦 Docker Compose 관리

### 서비스 시작
```bash
docker-compose up -d
```

### 서비스 중지
```bash
docker-compose down
```

### 서비스 상태 확인
```bash
docker-compose ps
```

### 로그 확인
```bash
# 전체 로그
docker-compose logs

# PostgreSQL 로그만
docker-compose logs postgres

# Redis 로그만
docker-compose logs redis

# 실시간 로그
docker-compose logs -f
```

### 데이터 초기화 (주의!)
```bash
# 볼륨까지 삭제 (모든 데이터 삭제됨)
docker-compose down -v
```

## 🔧 pgAdmin 데이터베이스 연결 설정

1. http://localhost:5050 접속
2. 로그인 (admin@moa.com / admin123)
3. 새 서버 추가:
   - **Name**: Moa Database
   - **Host**: postgres (또는 host.docker.internal)
   - **Port**: 5432
   - **Username**: moa
   - **Password**: moa123
   - **Database**: moa

## 📝 스크립트

### 개발
- `npm run dev` - 개발 서버 실행 (nodemon + ts-node)
- `npm run build` - 프로덕션 빌드
- `npm start` - 프로덕션 서버 실행

### Prisma
- `npm run prisma:generate` - Prisma Client 생성
- `npm run prisma:migrate` - DB 마이그레이션 (개발)
- `npm run prisma:migrate:deploy` - DB 마이그레이션 (프로덕션)
- `npm run prisma:studio` - Prisma Studio 실행
- `npm run prisma:seed` - 시드 데이터 삽입

### 코드 품질
- `npm run lint` - ESLint 실행
- `npm run format` - Prettier 포맷팅

## 📁 폴더 구조

```
src/
├── modules/          # 기능 모듈
│   ├── auth/        # 인증
│   ├── users/       # 사용자
│   ├── gatherings/  # 모임
│   ├── trust/       # 신뢰도 시스템
│   └── ...
├── common/          # 공통 코드
│   ├── middlewares/ # 미들웨어
│   └── utils/       # 유틸리티
├── config/          # 설정
└── main.ts          # 진입점

prisma/
└── schema.prisma    # Prisma 스키마
```

## 🔌 API 엔드포인트

### Health Check
- `GET /health` - 서버 및 서비스 상태 확인

### API Info
- `GET /api` - API 정보 및 엔드포인트 목록

### Users (예시)
- `GET /api/users` - 사용자 목록 조회

### Trust System (예시)
- `GET /api/trust/badges` - 뱃지 목록 조회

> 상세 API 문서는 [Document/API_SPECIFICATION.md](../Document/API_SPECIFICATION.md) 참조

## 🛠️ 기술 스택

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Cache**: Redis
- **Security**: Helmet, CORS, bcrypt, JWT
- **Validation**: Joi
- **Logging**: Winston, Morgan
- **Dev Tools**: nodemon, ts-node

## 🔒 환경 변수

`.env.example` 파일을 참조하여 필요한 환경 변수를 설정하세요:

- `DATABASE_URL` - PostgreSQL 연결 URL
- `REDIS_HOST`, `REDIS_PORT` - Redis 설정
- `JWT_SECRET` - JWT 비밀 키
- `CORS_ORIGIN` - CORS 허용 도메인

## 🚨 주의사항

1. **프로덕션 환경**: `.env` 파일의 비밀번호와 키를 반드시 변경하세요
2. **Git**: `.env` 파일은 `.gitignore`에 포함되어 있습니다
3. **데이터베이스**: Docker Compose를 중지해도 데이터는 유지됩니다 (`down -v` 제외)

## 📚 추가 문서

- [PRD](../Document/PRD.md)
- [Tech Stack](../Document/TECH_STACK.md)
- [RBAC](../Document/RBAC.md)
- [Trust System](../Document/TRUST_SYSTEM.md)

## 라이선스

MIT
