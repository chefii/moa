# 모아 Backend

Express + TypeScript + Prisma 기반 백엔드 API 서버

## 🚀 빠른 시작

```bash
# 패키지 설치
npm install

# 환경 변수 설정
cp .env.example .env

# Prisma 설정
npm run prisma:generate
npm run prisma:migrate

# 개발 서버 실행
npm run dev
```

서버: http://localhost:4000

## 📝 주요 스크립트

### 개발
- `npm run dev` - 개발 서버 (nodemon + ts-node)
- `npm run build` - 프로덕션 빌드
- `npm start` - 프로덕션 서버

### Prisma
- `npm run prisma:generate` - Prisma Client 생성
- `npm run prisma:migrate` - DB 마이그레이션
- `npm run prisma:studio` - Prisma Studio
- `npm run prisma:seed-all` - 전체 시드 데이터 삽입

### 개별 시드
- `npm run prisma:seed-menu` - 메뉴 시드
- `npm run prisma:seed-common-codes` - 공통 코드
- `npm run prisma:seed-categories` - 카테고리
- `npm run prisma:seed-roles` - 역할
- `npm run prisma:seed-badges` - 뱃지
- `npm run prisma:seed-report-codes` - 신고 사유

## 📁 폴더 구조

```
src/
├── routes/          # API 라우트
├── services/        # 비즈니스 로직
├── middlewares/     # 미들웨어
├── utils/           # 유틸리티
└── main.ts          # 진입점

prisma/
├── schema.prisma    # DB 스키마
├── migrations/      # 마이그레이션
└── seed-*.ts        # 시드 스크립트
```

## 🔌 주요 API

### Auth
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/verify-email` - 이메일 인증
- `POST /api/auth/refresh` - 토큰 갱신

### Users
- `GET /api/users/profile` - 프로필 조회
- `PUT /api/users/profile` - 프로필 수정
- `POST /api/users/profile/image` - 프로필 이미지 업로드

### Board
- `POST /api/board/posts` - 게시글 작성
- `GET /api/board/posts` - 게시글 목록
- `GET /api/board/posts/:id` - 게시글 상세
- `POST /api/board/posts/:id/report` - 게시글 신고

### Admin
- `GET /api/admin/users` - 사용자 목록
- `PUT /api/admin/users/:id/roles` - 역할 변경
- `GET /api/admin/reports` - 신고 목록

## 🛠️ 기술 스택

- Node.js + Express + TypeScript
- PostgreSQL 15 + Prisma ORM
- Redis (캐싱)
- JWT 인증
- Multer + Sharp (이미지 처리)
- Winston (로깅)

## 🔒 환경 변수

```bash
DATABASE_URL=postgresql://moa:moa123@localhost:5432/moa
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CORS_ORIGIN=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## 📚 추가 문서

상세 가이드는 [프로젝트 루트 README](../README.md) 참조
