# 모아 (moa)

> 관심사로 모이는 사람들을 위한 AI 기반 모임 플랫폼

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📌 프로젝트 소개

**모아**는 "적게 보여주고, 정확하게 매칭한다"는 철학을 가진 새로운 모임 플랫폼입니다.

### 핵심 차별점
- 🤖 **AI 큐레이션**: 하루 3개의 추천 모임만 (선택 피로 최소화)
- 🌱 **독창적 신뢰도 시스템**: 매너온도 대신 성장 레벨 + 뱃지 + 스트릭 시스템 ⭐
- 👥 **소규모 집중**: 4-8명 깊은 교류 중심
- 💼 **비즈니스 통합**: 일반 모임 + 유료 클래스 통합
- 🎨 **프리미엄 디자인**: 글래스모피즘 + 다층 그라데이션 + Framer Motion

---

## 🏗 프로젝트 구조

```
moa/
├── back/                # Backend (Express + Prisma + TypeScript)
│   ├── src/            # 소스 코드
│   ├── prisma/         # Prisma 스키마
│   └── package.json
├── front/               # Frontend (Next.js 14 + TypeScript)
│   ├── src/            # 소스 코드
│   │   ├── app/        # App Router
│   │   ├── components/ # 컴포넌트 (신뢰도 시스템 포함)
│   │   ├── store/      # Zustand 상태 관리
│   │   └── types/      # TypeScript 타입
│   └── package.json
├── Document/            # 프로젝트 문서
│   ├── PRD.md          # 제품 요구사항 정의서
│   ├── RBAC.md         # 권한 시스템 설계
│   ├── TRUST_SYSTEM.md # 신뢰도 시스템 ⭐
│   ├── DESIGN_SYSTEM.md # 디자인 시스템 ⭐
│   ├── DB_SCHEMA.md    # 데이터베이스 스키마
│   ├── TECH_STACK.md   # 기술 스택
│   ├── ROADMAP.md      # 개발 로드맵
│   └── SPRINT_1_GUIDE.md  # Sprint 1 가이드
├── docker-compose.yml   # Docker 설정 (PostgreSQL, Redis, pgAdmin)
└── README.md
```

---

## 🚀 빠른 시작

### Prerequisites
- Node.js 20+
- Docker Desktop
- npm

### 1. Docker 서비스 실행

#### Docker Desktop 실행
먼저 Docker Desktop을 실행합니다. Docker가 실행되면 자동으로 다음 컨테이너들이 시작됩니다:

```bash
# Docker Desktop이 실행되면 자동으로 시작되는 컨테이너:
# - moa-postgres (PostgreSQL 15) - 포트 5432
# - moa-redis (Redis 7) - 포트 6379
# - moa-pgadmin (pgAdmin 4) - 포트 5050

# 컨테이너 상태 확인
docker ps
```

#### 수동으로 컨테이너 시작하기 (필요한 경우)
```bash
# 프로젝트 루트에서
docker-compose up -d

# 또는 개별 컨테이너 시작
docker start moa-postgres moa-redis moa-pgadmin
```

**실행되는 서비스:**
- **PostgreSQL 15**
  - 포트: 5432
  - 데이터베이스: moa
  - 사용자: moa / moa123

- **Redis 7**
  - 포트: 6379
  - 캐싱 및 세션 관리용

- **pgAdmin 4**
  - 포트: 5050
  - 웹 인터페이스: http://localhost:5050/browser/
  - 로그인: admin@moa.com / admin123

### 2. Backend 설정 및 실행
```bash
cd back

# 패키지 설치
npm install

# 환경 변수 설정
cp .env.example .env

# Prisma Client 생성
npm run prisma:generate

# 데이터베이스 마이그레이션
npm run prisma:migrate

# 개발 서버 실행
npm run dev
```

**Backend 서버**: http://localhost:4000
- Health Check: http://localhost:4000/health
- API 정보: http://localhost:4000/api

### 3. Frontend 설정 및 실행
```bash
cd front

# 패키지 설치
npm install

# 환경 변수 설정
cp .env.local.example .env.local

# 개발 서버 실행
npm run dev
```

**Frontend 서버**: http://localhost:3000

### 4. 로그인 및 테스트
1. http://localhost:3000 접속
2. "로그인" 클릭
3. 역할 선택 (일반 사용자 / 비즈니스 관리자 / 플랫폼 관리자)
4. 역할에 맞는 대시보드 확인

### 5. pgAdmin으로 데이터베이스 확인
1. http://localhost:5050/browser/ 접속
2. 로그인: `admin@moa.com` / `admin123`
3. 좌측 메뉴에서 "Servers" > "moa" 클릭하여 연결
   - 비밀번호 입력: `moa123`
4. 데이터베이스 구조 확인

**pgAdmin 서버 정보 (새 서버 추가 시):**
- Name: moa
- Host name/address: `postgres` (Docker 네트워크 내) 또는 `localhost` (로컬)
- Port: `5432`
- Maintenance database: `moa`
- Username: `moa`
- Password: `moa123`

---

## 🔧 개발 환경 설정

### 네트워크 IP 설정 (선택사항)

로컬 네트워크에서 다른 디바이스(스마트폰 등)로 접속하려면 IP 주소를 업데이트해야 합니다.

#### 1. 현재 IP 주소 확인
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# 예: inet 172.30.1.85
```

#### 2. 프론트엔드 환경 변수 업데이트
`front/.env.local` 파일 수정:
```bash
NEXT_PUBLIC_API_URL=http://YOUR_IP:4000
# 예: NEXT_PUBLIC_API_URL=http://172.30.1.85:4000
```

#### 3. 프론트엔드 Next.js 설정 업데이트
`front/next.config.js` 파일에서 IP 주소 수정:
```javascript
{
  protocol: 'http',
  hostname: 'YOUR_IP',  // 예: '172.30.1.85'
  port: '4000',
  pathname: '/uploads/**',
}
```

#### 4. 백엔드 CORS 설정 업데이트
`back/.env.development` 파일 수정:
```bash
CORS_ORIGIN=http://localhost:3000,http://YOUR_IP:3000
# 예: CORS_ORIGIN=http://localhost:3000,http://172.30.1.85:3000
```

#### 5. 서버 재시작
```bash
# 백엔드와 프론트엔드 모두 재시작
# Ctrl+C로 종료 후 다시 npm run dev
```

---

## 🐛 문제 해결

### Docker 컨테이너가 실행되지 않을 때
```bash
# Docker Desktop이 실행 중인지 확인
# 컨테이너 상태 확인
docker ps -a

# 중지된 컨테이너 시작
docker start moa-postgres moa-redis moa-pgadmin

# 또는 전체 재시작
docker-compose down
docker-compose up -d
```

### "Network Error" 또는 "ERR_CONNECTION_REFUSED" 발생 시
1. 백엔드 서버가 실행 중인지 확인
2. IP 주소가 변경되었는지 확인 (위의 "네트워크 IP 설정" 참조)
3. 포트가 충돌하지 않는지 확인:
```bash
# 포트 사용 확인
lsof -i :4000  # 백엔드
lsof -i :3000  # 프론트엔드
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
```

### Redis 연결 오류 발생 시
```bash
# Docker Redis가 실행 중인지 확인
docker ps | grep moa-redis

# Redis 연결 테스트
docker exec moa-redis redis-cli ping
# 응답: PONG
```

### PostgreSQL 연결 오류 발생 시
```bash
# Docker PostgreSQL이 실행 중인지 확인
docker ps | grep moa-postgres

# PostgreSQL 연결 테스트
docker exec moa-postgres psql -U moa -d moa -c "SELECT version();"
```

### 포트가 이미 사용 중일 때
```bash
# 해당 포트를 사용하는 프로세스 종료
lsof -ti:4000 | xargs kill -9
```

---

## 📚 문서

### 기획 문서
- [📋 PRD (제품 요구사항 정의서)](./Document/PRD.md) - 프로젝트 개요, 타겟, 핵심 기능
- [🔐 RBAC (권한 시스템)](./Document/RBAC.md) - 사용자 역할 및 권한 설계
- [🗄️ DB Schema (데이터베이스 스키마)](./Document/DB_SCHEMA.md) - ERD 및 테이블 구조

### 기술 문서
- [⚙️ Tech Stack (기술 스택)](./Document/TECH_STACK.md) - 사용 기술 및 이유
- [🗓️ Roadmap (개발 로드맵)](./Document/ROADMAP.md) - 12주 MVP 계획
- [🏃 Sprint 1 Guide](./Document/SPRINT_1_GUIDE.md) - 첫 번째 Sprint 실행 가이드

---

## 🎯 주요 기능

### Phase 1 (MVP - 12주)
- [x] 회원가입/로그인 (소셜 로그인)
- [ ] 모임 생성/조회/참여
- [ ] AI 기반 모임 추천
- [ ] 실시간 채팅
- [ ] 매너온도 시스템
- [ ] 리뷰 및 평가

### Phase 2 (고도화)
- [ ] 비즈니스 프로필 (클래스 운영자)
- [ ] 결제 시스템 (유료 클래스)
- [ ] 정산 시스템
- [ ] 관리자 대시보드

### Phase 3 (하이브리드 앱)
- [ ] React Native / Capacitor 앱
- [ ] 앱스토어 배포

---

## 🛠 기술 스택

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- React Query + Zustand

### Backend
- Node.js + Express/Nest.js
- TypeScript
- Prisma ORM
- PostgreSQL 15
- Redis

### 인프라
- Vercel (Frontend)
- AWS / Railway (Backend)
- Docker (로컬 개발)

---

## 👥 사용자 역할 (RBAC)

1. **SUPER_ADMIN** (슈퍼 관리자)
   - 전체 시스템 관리
   - 사용자/모임 관리
   - 클래스 운영자 승인

2. **BUSINESS_ADMIN** (클래스 운영자)
   - 유료 클래스 생성/관리
   - 예약 관리
   - 정산 내역 조회

3. **USER** (일반 사용자)
   - 무료 모임 생성 (매너온도 37.5℃ 이상)
   - 모임 참여
   - 리뷰 작성

---

## 📊 개발 현황

### ✅ 완료
- ✓ 프로젝트 구조 생성
- ✓ 기획 문서 작성 (PRD, RBAC, DB Schema, Trust System, Design System)
- ✓ 기술 스택 선정
- ✓ 개발 로드맵 수립
- ✓ Docker Compose 환경 구축 (PostgreSQL, Redis, pgAdmin)
- ✓ Backend 초기 셋업 (Express + Prisma + TypeScript)
- ✓ Frontend 초기 셋업 (Next.js 14 + TypeScript)
- ✓ **신뢰도 시스템 완전 구현** (7단계 성장 레벨, 20+ 뱃지, 스트릭, 포인트 등)
- ✓ **RBAC 시스템 구현** (3가지 역할 + 역할 기반 대시보드)
- ✓ 프로필 페이지 (신뢰도 시스템 전체 시각화)
- ✓ 관리자 대시보드 (플랫폼 관리)
- ✓ 비즈니스 대시보드 (클래스/공간 관리)

### 🚧 진행 중
- 인증 시스템 (JWT + 소셜 로그인)
- 모임 생성/조회 API
- 실시간 채팅 기능

### 📅 다음 단계
- Week 2: 회원가입/로그인 완전 구현
- Week 3: 모임 CRUD + 참여 기능
- Week 4: AI 기반 모임 추천 시스템

---

## 🤝 기여 가이드

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

---

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해주세요.

---

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들의 도움을 받았습니다:
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Made with ❤️ by Moa Team**
