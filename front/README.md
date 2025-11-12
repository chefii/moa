# 모아 Frontend

Next.js 14 + TypeScript + Tailwind CSS 기반 프론트엔드

## 🚀 시작하기

### 1. Next.js 프로젝트 초기화

```bash
# FE 디렉토리에서 실행
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"

# 프롬프트 응답:
# ✔ Would you like to use TypeScript? Yes
# ✔ Would you like to use ESLint? Yes
# ✔ Would you like to use Tailwind CSS? Yes
# ✔ Would you like to use `src/` directory? Yes
# ✔ Would you like to use App Router? Yes
# ✔ Would you like to customize the default import alias? Yes (@/*)
```

### 2. 추가 패키지 설치

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
│   ├── ui/             # shadcn/ui 컴포넌트
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

## 🔗 관련 문서

- [PRD](../Document/PRD.md)
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
