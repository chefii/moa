# 모아 Frontend

Next.js 14 + TypeScript + Tailwind CSS 기반 프론트엔드

## 🚀 빠른 시작

```bash
# 패키지 설치
npm install

# 환경 변수 설정
cp .env.local.example .env.local

# 개발 서버 실행
npm run dev
```

브라우저: http://localhost:3000

## 📝 주요 스크립트

- `npm run dev` - 개발 서버
- `npm run build` - 프로덕션 빌드
- `npm start` - 프로덕션 서버
- `npm run lint` - ESLint 검사

## 📁 폴더 구조

```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # 인증 페이지
│   ├── profile/        # 프로필
│   ├── board/          # 게시판
│   ├── business/       # 비즈니스 대시보드
│   └── admin/          # 관리자 대시보드
├── components/         # 재사용 컴포넌트
│   ├── trust/          # 신뢰도 시스템
│   └── ui/             # UI 컴포넌트
├── lib/
│   ├── api/            # API 클라이언트
│   └── utils/          # 유틸리티
└── store/              # Zustand 상태 관리
```

## 🎨 주요 기능

### 신뢰도 시스템
- 7단계 성장 레벨
- 20+ 뱃지 시스템
- 스트릭 (연속 참여)
- 포인트 시스템
- 순간 컬렉션
- 관심사 숲

### 게시판
- 게시글 작성/조회/수정/삭제
- 무한 스크롤
- 정렬 (최신순/인기순/조회순)
- 댓글 (대댓글 지원)
- 좋아요/북마크
- 신고 기능

### 관리자
- 사용자 관리
- 신고 관리
- 통계 대시보드

## 🛠️ 기술 스택

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (상태 관리)
- Axios (API 통신)
- Framer Motion (애니메이션)

## 🔒 환경 변수

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_KAKAO_APP_KEY=your_kakao_key
```

## 📚 추가 문서

상세 가이드는 [프로젝트 루트 README](../README.md) 참조
