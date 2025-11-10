# 기술 스택 (Tech Stack)

## 📌 개요

모아 프로젝트는 **모노레포(Monorepo)** 구조로 프론트엔드와 백엔드를 함께 관리합니다.

---

## 🎨 Frontend

### Core
- **React 18** - UI 라이브러리
- **Next.js 14** (App Router) - React 프레임워크
- **TypeScript 5+** - 타입 안전성

### 스타일링
- **Tailwind CSS 3+** - 유틸리티 CSS 프레임워크
- **shadcn/ui** - 복사 가능한 컴포넌트 라이브러리
- **Radix UI** - Headless 컴포넌트
- **Lucide Icons** - 아이콘 라이브러리

### 상태 관리
- **TanStack Query v5** (React Query) - 서버 상태 관리
- **Zustand** - 클라이언트 상태 관리 (전역 상태)

### 폼 & 검증
- **React Hook Form** - 폼 관리
- **Zod** - 스키마 검증

### 지도 & 위치
- **Kakao Maps API** - 지도 표시 및 장소 검색
- **Geolocation API** - 사용자 위치 추적

### 실시간 통신
- **Socket.io Client** - 실시간 채팅

### 날짜 & 시간
- **date-fns** - 날짜 처리 (경량)

### 유틸리티
- **clsx** / **cn** - 클래스 이름 조합
- **react-hot-toast** - 토스트 알림
- **next-themes** - 다크모드 (선택)

---

## ⚙️ Backend

### Core
- **Node.js 20 LTS** - 런타임
- **Express.js** 또는 **Nest.js** - 웹 프레임워크
  - **Express**: 빠른 개발, 간단한 구조
  - **Nest.js**: 확장성, 구조화된 아키텍처
- **TypeScript 5+** - 타입 안전성

### 데이터베이스
- **PostgreSQL 15** - 관계형 데이터베이스
- **Prisma ORM** - 타입 안전한 ORM
- **Redis** - 캐싱, 세션 저장소

### 인증 & 인가
- **JWT** - 토큰 기반 인증
- **bcrypt** - 비밀번호 해싱
- **Passport.js** - 소셜 로그인 (선택)

### 실시간 통신
- **Socket.io** - WebSocket 기반 채팅

### 파일 업로드
- **Multer** - 파일 업로드 미들웨어
- **Sharp** - 이미지 최적화

### 결제
- **토스페이먼츠 SDK** - 결제 연동

### 유효성 검증
- **Zod** - 런타임 타입 검증 (프론트엔드와 공유)

### 유틸리티
- **date-fns** - 날짜 처리
- **nanoid** - 짧은 고유 ID 생성

---

## ☁️ 인프라 & DevOps

### 호스팅
- **Vercel** - 프론트엔드 배포 (무료 티어 가능)
- **Railway** 또는 **AWS EC2** - 백엔드 배포
- **AWS RDS** - PostgreSQL 호스팅 (프로덕션)
- **Upstash Redis** - Redis 호스팅 (무료 티어 가능)

### 스토리지
- **AWS S3** - 이미지/파일 저장
- **CloudFront** - CDN (선택)

### CI/CD
- **GitHub Actions** - 자동화된 테스트 & 배포

### 모니터링 & 로깅
- **Sentry** - 에러 트래킹
- **Vercel Analytics** - 프론트엔드 분석
- **Winston** 또는 **Pino** - 백엔드 로깅

---

## 🧪 테스트

### Frontend
- **Vitest** - 유닛 테스트 (Vite 기반)
- **React Testing Library** - 컴포넌트 테스트
- **Playwright** - E2E 테스트

### Backend
- **Jest** - 유닛 테스트
- **Supertest** - API 테스트

---

## 📱 하이브리드 앱 (Phase 3)

### 옵션 1: React Native
- **React Native + Expo** - 네이티브 앱 개발
- **Expo Router** - 라우팅
- **React Navigation** - 네비게이션

### 옵션 2: Capacitor
- **Capacitor** - 웹 기반 하이브리드 앱
- 기존 Next.js 코드 재사용률 높음

**선택 기준**:
- **빠른 개발 속도 우선** → Capacitor
- **네이티브 성능 우선** → React Native

---

## 🛠 개발 도구

### 코드 품질
- **ESLint** - 린트
- **Prettier** - 코드 포맷팅
- **Husky** - Git hooks
- **lint-staged** - 커밋 전 린트

### 패키지 관리
- **pnpm** - 빠른 패키지 매니저 (권장)
- 또는 **npm** / **yarn**

### 버전 관리
- **Git** - 형상 관리
- **GitHub** - 레포지토리 호스팅

---

## 📦 프로젝트 구조

```
moa/
├── FE/                          # Frontend
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   ├── components/         # React 컴포넌트
│   │   ├── lib/                # 유틸리티, API 클라이언트
│   │   ├── store/              # Zustand stores
│   │   └── types/              # TypeScript 타입
│   ├── public/                 # 정적 파일
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── next.config.js
│
├── BE/                          # Backend
│   ├── src/
│   │   ├── modules/            # 기능 모듈
│   │   ├── common/             # 공통 코드
│   │   ├── config/             # 설정
│   │   ├── prisma/             # Prisma 스키마
│   │   └── main.ts             # 진입점
│   ├── package.json
│   └── tsconfig.json
│
├── Document/                    # 문서
│   ├── PRD.md
│   ├── RBAC.md
│   ├── DB_SCHEMA.md
│   ├── API_SPECIFICATION.md
│   ├── TECH_STACK.md
│   ├── ROADMAP.md
│   └── SPRINT_1_GUIDE.md
│
└── README.md
```

---

## 🔧 환경 변수

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_key
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/moa
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=moa-uploads

# OAuth (선택)
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Payment
TOSS_CLIENT_KEY=your_toss_client_key
TOSS_SECRET_KEY=your_toss_secret_key

# Monitoring
SENTRY_DSN=your_sentry_dsn

# Port
PORT=4000
```

---

## 📊 성능 목표

### Frontend
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Lighthouse Score**: > 90

### Backend
- **API 응답 속도**: < 200ms (평균)
- **DB 쿼리**: < 100ms (평균)
- **동시 접속자**: 1,000명 처리 가능

---

## 🔄 기술 선택 이유

### Next.js 14
- ✅ SSR/SSG로 SEO 최적화
- ✅ App Router로 최신 React 패턴 활용
- ✅ 이미지 최적화 자동화
- ✅ Vercel 무료 배포

### Prisma
- ✅ 타입 안전한 쿼리
- ✅ 마이그레이션 관리 용이
- ✅ VS Code 자동완성 지원

### Tailwind CSS
- ✅ 빠른 스타일링
- ✅ 일관된 디자인 시스템
- ✅ 번들 사이즈 최적화

### PostgreSQL
- ✅ 복잡한 쿼리 지원
- ✅ ACID 트랜잭션
- ✅ JSON 타입 지원
- ✅ 무료 호스팅 옵션 많음

---

## 📝 관련 문서

- [PRD](./PRD.md)
- [DB 스키마](./DB_SCHEMA.md)
- [개발 로드맵](./ROADMAP.md)

---

**문서 버전**: 1.0
**최종 수정일**: 2025-11-10
**작성자**: Tech Team
