# 모아 Frontend

Next.js 14 + TypeScript + Tailwind CSS 기반 프론트엔드

## 🚀 시작하기

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.local.example .env.local
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 🎨 신뢰도 시스템 (Trust System)

모아만의 독창적인 신뢰도 시스템이 구현되어 있습니다:

- **🌱 성장 레벨**: 씨앗 → 새싹 → 화분 → 작은 나무 → 나무 → 큰 나무 → 열매나무 (7단계)
- **🏅 뱃지 시스템**: 기본/호스트/특별/계절 뱃지 (20+ 종류)
- **🔥 스트릭**: 연속 참여 추적 (3일/7일/30일/90일/365일 마일스톤)
- **✨ 포인트**: 활동 보상 및 리워드 교환
- **📸 순간 컬렉션**: 특별한 순간 자동 저장
- **🌳 관심사 숲**: 카테고리별 참여 시각화

자세한 내용은 [TRUST_SYSTEM.md](../Document/TRUST_SYSTEM.md) 참조

## 🎭 디자인 특징

20년 경력 신세대 디자이너가 만든 모던 UI:

- **글래스모피즘**: 반투명 배경 + 백드롭 블러
- **다층 그라데이션**: 레벨/뱃지별 동적 컬러
- **Framer Motion**: 풍부한 마이크로 인터랙션
- **반응형 디자인**: 모바일/태블릿/데스크톱 완벽 지원

자세한 내용은 [DESIGN_SYSTEM.md](../Document/DESIGN_SYSTEM.md) 참조

## 📝 추가 패키지 (선택)

상세 가이드는 [../Document/SPRINT_1_GUIDE.md](../Document/SPRINT_1_GUIDE.md)의 Day 2를 참조하세요.

```bash
# UI 라이브러리
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react

# 상태 관리
npm install zustand @tanstack/react-query

# 폼 & 검증
npm install react-hook-form zod @hookform/resolvers

# 날짜 & 유틸리티
npm install date-fns axios react-hot-toast
```

### 3. shadcn/ui 설정

```bash
# shadcn/ui 초기화
npx shadcn@latest init

# 기본 컴포넌트 추가
npx shadcn@latest add button input card label select textarea dialog dropdown-menu avatar badge
```

### 4. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_key
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### 5. 개발 서버 실행

```bash
npm run dev
```

서버가 http://localhost:3000 에서 실행됩니다.

## 📁 폴더 구조

```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # 인증 관련 페이지
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/         # 메인 페이지
│   │   ├── page.tsx           # 홈
│   │   ├── explore/           # 탐색
│   │   ├── gatherings/        # 모임
│   │   ├── create/            # 모임 만들기
│   │   └── my/                # 마이페이지
│   ├── business/       # 비즈니스 대시보드
│   ├── admin/          # 관리자 대시보드
│   ├── layout.tsx
│   └── providers.tsx
├── components/
│   ├── trust/          # 신뢰도 시스템 컴포넌트 ⭐
│   │   ├── GrowthLevel.tsx      # 성장 레벨
│   │   ├── BadgeGrid.tsx        # 뱃지 그리드
│   │   ├── StreakCard.tsx       # 스트릭
│   │   ├── PointsCard.tsx       # 포인트
│   │   ├── MomentsCarousel.tsx  # 순간 컬렉션
│   │   └── InterestForestCard.tsx # 관심사 숲
│   ├── profile/        # 프로필 컴포넌트
│   ├── ui/             # shadcn/ui 컴포넌트 (선택)
│   ├── layout/         # 레이아웃 컴포넌트
│   ├── gathering/      # 모임 관련 컴포넌트
│   └── user/           # 유저 관련 컴포넌트
├── lib/
│   ├── api/            # API 클라이언트
│   ├── utils/          # 유틸리티 함수
│   ├── hooks/          # Custom Hooks
│   └── validations/    # Zod 스키마
├── store/              # Zustand stores
└── types/              # TypeScript 타입
```

## 🎨 주요 기능

- **App Router**: Next.js 14의 최신 라우팅 시스템
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 유틸리티 CSS
- **shadcn/ui**: 커스터마이징 가능한 UI 컴포넌트
- **React Query**: 서버 상태 관리
- **Zustand**: 클라이언트 상태 관리

## 📝 스크립트

- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm start` - 프로덕션 서버 실행
- `npm run lint` - ESLint 실행

## 🔗 페이지

- `/` - 홈 페이지
- `/profile` - 프로필 페이지 (신뢰도 시스템 전체 구현) ⭐

## 📚 관련 문서

- [PRD](../Document/PRD.md)
- [신뢰도 시스템](../Document/TRUST_SYSTEM.md) ⭐
- [디자인 시스템](../Document/DESIGN_SYSTEM.md) ⭐
- [Tech Stack](../Document/TECH_STACK.md)
- [Sprint 1 Guide](../Document/SPRINT_1_GUIDE.md)

## 📚 학습 자료

- [Next.js 문서](https://nextjs.org/docs)
- [shadcn/ui 문서](https://ui.shadcn.com)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [React Query 문서](https://tanstack.com/query/latest)

## ⚠️ 주의사항

1. **환경 변수**: `.env.local` 파일을 `.gitignore`에 추가하여 커밋하지 않도록 주의
2. **API URL**: 개발 환경과 프로덕션 환경의 API URL을 구분하여 설정
3. **이미지 최적화**: Next.js의 Image 컴포넌트 사용 권장

## 라이선스

MIT
