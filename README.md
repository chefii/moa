# 모아 (moa)

> 관심사로 모이는 사람들을 위한 AI 기반 모임 플랫폼

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📌 프로젝트 소개

**모아**는 "적게 보여주고, 정확하게 매칭한다"는 철학을 가진 새로운 모임 플랫폼입니다.

### 핵심 차별점
- 🤖 **AI 큐레이션**: 하루 3개의 추천 모임만 (선택 피로 최소화)
- 🌡️ **신뢰도 우선**: 매너온도 기반 신뢰 시스템
- 👥 **소규모 집중**: 4-8명 깊은 교류 중심
- 💼 **비즈니스 통합**: 일반 모임 + 유료 클래스 통합

---

## 🏗 프로젝트 구조

```
moa/
├── BE/                  # Backend (Express + Prisma)
├── FE/                  # Frontend (Next.js 14)
├── Document/            # 프로젝트 문서
│   ├── PRD.md          # 제품 요구사항 정의서
│   ├── RBAC.md         # 권한 시스템 설계
│   ├── DB_SCHEMA.md    # 데이터베이스 스키마
│   ├── TECH_STACK.md   # 기술 스택
│   ├── ROADMAP.md      # 개발 로드맵
│   └── SPRINT_1_GUIDE.md  # Sprint 1 가이드
├── docker-compose.yml   # Docker 설정 (PostgreSQL, Redis)
└── README.md
```

---

## 🚀 빠른 시작

### Prerequisites
- Node.js 20+
- Docker & Docker Compose (권장)
- pnpm (권장) 또는 npm

### 1. 레포지토리 클론
```bash
git clone <repository-url>
cd socialN
```

### 2. 데이터베이스 실행 (Docker)
```bash
# PostgreSQL & Redis 실행
docker-compose up -d

# 확인
docker ps
```

### 3. Backend 설정
```bash
cd BE

# 패키지 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 DATABASE_URL 등 수정

# Prisma 마이그레이션 (아직 실행하지 마세요 - 패키지 설치 후)
# npm run prisma:migrate

# 개발 서버 실행
npm run dev
```

Backend 서버: http://localhost:4000

### 4. Frontend 설정
```bash
cd FE

# Next.js 프로젝트 초기화 (최초 1회)
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"

# 패키지 설치 (초기화 시 자동으로 설치됨)
# 추가 패키지는 FE/README.md 참조

# 환경 변수 설정
# .env.local 파일 생성 및 설정

# 개발 서버 실행
npm run dev
```

Frontend 서버: http://localhost:3000

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
- 프로젝트 구조 생성
- 기획 문서 작성 (PRD, RBAC, DB Schema 등)
- 기술 스택 선정
- 개발 로드맵 수립

### 🚧 진행 중
- Backend 초기 셋업
- Frontend 초기 셋업

### 📅 다음 단계
- Week 1: 프로젝트 초기화 완료
- Week 2: 회원가입/로그인 구현
- Week 3: 사용자 프로필 구현

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
