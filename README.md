# 모아 (moa)

> 관심사로 모이는 사람들을 위한 AI 기반 모임 플랫폼

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📌 프로젝트 소개

**모아**는 "적게 보여주고, 정확하게 매칭한다"는 철학을 가진 새로운 모임 플랫폼입니다.

### 핵심 차별점
- 🤖 **AI 큐레이션**: 하루 3개의 추천 모임만 (선택 피로 최소화)
- 🌱 **신뢰도 시스템**: 성장 레벨 + 뱃지 + 스트릭 시스템
- 👥 **소규모 집중**: 4-8명 깊은 교류 중심
- 💼 **비즈니스 통합**: 일반 모임 + 유료 클래스 통합
- 🎨 **프리미엄 디자인**: 글래스모피즘 + 다층 그라데이션 + Framer Motion

---

## 🚀 빠른 시작

### Prerequisites
- Node.js 20+
- Docker Desktop
- npm

### 1. Docker 서비스 실행

```bash
# 프로젝트 루트에서
docker-compose up -d

# 컨테이너 상태 확인
docker ps
```

**실행되는 서비스:**
- PostgreSQL 15 (포트 5432)
- Redis 7 (포트 6379)
- pgAdmin 4 (포트 5050 - http://localhost:5050)
  - 로그인: admin@moa.com / admin123

### 2. Backend 설정

```bash
cd back
npm install
cp .env.example .env

# Prisma 설정
npm run prisma:generate
npm run prisma:migrate

# 개발 서버 실행
npm run dev
```

**Backend**: http://localhost:4000
- Health Check: http://localhost:4000/health
- API 정보: http://localhost:4000/api

### 3. Frontend 설정

```bash
cd front
npm install
cp .env.local.example .env.local

# 개발 서버 실행
npm run dev
```

**Frontend**: http://localhost:3000

### 4. 로그인 테스트
1. http://localhost:3000 접속
2. 역할 선택 (일반 사용자 / 비즈니스 관리자 / 플랫폼 관리자)
3. 대시보드 확인

---

## 🏗 프로젝트 구조

```
moa/
├── back/                # Backend (Express + Prisma + TypeScript)
│   ├── src/            # 소스 코드
│   │   ├── routes/     # API 라우트
│   │   ├── services/   # 비즈니스 로직
│   │   ├── middlewares/ # 미들웨어
│   │   └── main.ts     # 진입점
│   ├── prisma/         # Prisma 스키마 & 마이그레이션
│   └── uploads/        # 업로드 파일
├── front/              # Frontend (Next.js 14 + TypeScript)
│   ├── src/
│   │   ├── app/        # App Router (페이지)
│   │   ├── components/ # 재사용 컴포넌트
│   │   ├── lib/        # API 클라이언트, 유틸리티
│   │   └── store/      # Zustand 상태 관리
│   └── public/         # 정적 파일
├── Document/           # 프로젝트 문서
└── docker-compose.yml  # Docker 설정
```

---

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand, React Query
- **Animation**: Framer Motion

### Backend
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **Database**: PostgreSQL 15 + Prisma ORM
- **Cache**: Redis
- **Auth**: JWT + bcrypt
- **Upload**: Multer + Sharp

### 인프라
- **개발**: Docker Compose
- **배포**: Vercel (Frontend), AWS/Railway (Backend)

---

## 📝 주요 스크립트

### Backend (back/)
```bash
npm run dev                  # 개발 서버
npm run build                # 프로덕션 빌드
npm start                    # 프로덕션 서버
npm run prisma:generate      # Prisma Client 생성
npm run prisma:migrate       # DB 마이그레이션
npm run prisma:studio        # Prisma Studio
npm run prisma:seed-all      # 시드 데이터 삽입
```

### Frontend (front/)
```bash
npm run dev                  # 개발 서버
npm run build                # 프로덕션 빌드
npm start                    # 프로덕션 서버
npm run lint                 # ESLint 검사
```

### Docker
```bash
docker-compose up -d         # 서비스 시작
docker-compose down          # 서비스 중지
docker-compose ps            # 서비스 상태
docker-compose logs -f       # 실시간 로그
```

---

## 🎯 주요 기능

### ✅ 구현 완료
- 프로젝트 초기 셋업 (Frontend, Backend, Docker)
- 인증 시스템 (JWT, 이메일 인증, 카카오 로그인)
- RBAC 권한 시스템 (3가지 역할)
- 사용자 관리 (회원가입, 프로필, 비밀번호 재설정)
- 신뢰도 시스템 (7단계 레벨, 20+ 뱃지, 스트릭, 포인트)
- 관리자 대시보드 (사용자 관리, 통계)
- 비즈니스 대시보드 (클래스/공간 관리)
- 카테고리 관리 (아이콘, 컬러)
- 파일 업로드 (이미지 리사이징)
- 게시판 시스템 (작성, 조회, 댓글, 좋아요, 신고)

### 🚧 진행 중
- 모임 생성/조회/참여
- AI 기반 모임 추천
- 실시간 채팅
- 리뷰 및 평가

---

## 👥 사용자 역할 (RBAC)

1. **SUPER_ADMIN** (슈퍼 관리자)
   - 전체 시스템 관리
   - 사용자/모임 관리
   - 클래스 운영자 승인

2. **BUSINESS_USER** (클래스 운영자)
   - 유료 클래스 생성/관리
   - 예약 관리
   - 정산 내역 조회

3. **USER** (일반 사용자)
   - 무료 모임 생성
   - 모임 참여
   - 리뷰 작성

---

## 🐛 문제 해결

### Docker 컨테이너가 실행되지 않을 때
```bash
docker ps -a
docker start moa-postgres moa-redis moa-pgadmin
```

### 포트 충돌 시
```bash
lsof -i :3000  # Frontend
lsof -i :4000  # Backend
lsof -i :5432  # PostgreSQL
```

### 데이터베이스 연결 오류
```bash
docker exec moa-postgres psql -U moa -d moa -c "SELECT version();"
```

### 완전 초기화
```bash
docker-compose down -v
docker-compose up -d
cd back && npm run prisma:generate && npm run prisma:migrate
```

---

## 📚 문서

- [PRD (제품 요구사항 정의서)](./Document/PRD.md)
- [RBAC (권한 시스템)](./Document/RBAC.md)
- [신뢰도 시스템](./Document/TRUST_SYSTEM.md)
- [디자인 시스템](./Document/DESIGN_SYSTEM.md)
- [DB 스키마](./Document/DB_SCHEMA.md)
- [기술 스택](./Document/TECH_STACK.md)
- [개발 로드맵](./Document/ROADMAP.md)

---

## 🔐 환경 변수

### Backend (.env)
```bash
DATABASE_URL=postgresql://moa:moa123@localhost:5432/moa
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_KAKAO_APP_KEY=your_kakao_key
```

---

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해주세요.

---

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

---

**Made with ❤️ by Moa Team**
