# 모아 Admin 레이아웃 작업 기록

## 작업 일자
2025-11-12

## 주요 작업 내용

### 1. DB 기반 메뉴 시스템 구축
- Prisma Schema에 `MenuCategory`, `MenuItem` 모델 추가
- 역할 기반 메뉴 접근 제어 (`requiredRoles` 필드)
- 메뉴 카테고리 및 항목 API 구현 (`/api/admin/menu-categories`, `/api/admin/menu-items`)
- 시드 스크립트 생성: `back/prisma/seed-menu.ts`
  - 7개 카테고리: 회원관리, 모임관리, 정산관리, 신뢰시스템, 콘텐츠관리, 고객지원, 시스템관리
  - 25개 메뉴 항목

### 2. 실시간 메뉴 업데이트
- Zustand 스토어 생성: `front/src/store/menuStore.ts`
- `refreshTrigger`를 통해 메뉴 추가/수정 시 페이지 새로고침 없이 메뉴 업데이트
- AdminLayout에서 `refreshTrigger` 의존성 추가

### 3. 텍스트 가시성 문제 수정
- `front/src/app/globals.css`에서 다크모드 미디어 쿼리 제거
- 명시적인 색상 값 설정으로 텍스트가 투명하게 보이는 문제 해결

### 4. 푸터 시스템 구축
- DB 기반 푸터 데이터 관리
- Prisma Schema에 `SiteSetting`, `FooterLink` 모델 추가
- 시드 스크립트: `back/prisma/seed-settings.ts`
  - 회사 정보 (company_name, company_ceo, business_number 등)
  - 연락처 정보 (email, phone, working_hours)
  - 소셜 미디어 링크 (Facebook, Instagram, Twitter, Youtube)
  - 푸터 링크 (이용약관, 개인정보처리방침 등)
- API 엔드포인트: `/api/settings/site-settings`, `/api/settings/footer-links`
- AdminFooter 컴포넌트 생성: `front/src/components/admin/AdminFooter.tsx`

### 5. 레이아웃 재구성
**파일**: `front/src/components/admin/AdminLayout.tsx`

#### 구조 변경
- 기존: Sidebar와 Content가 좌우로 배치
- 변경: Header(상단) - Content Area(중간: Sidebar + Main) - Footer(하단) 수직 구조

#### 주요 수정 사항
1. **메인 컨테이너**: `flex flex-col`로 수직 스택 구조
2. **헤더** (전체 너비):
   - 왼쪽: 로고 ("모아 Admin")
   - 오른쪽: 검색, 알림, 사용자 프로필 드롭다운
   - 사용자 정보를 사이드바 하단에서 헤더 우측으로 이동
3. **사이드바**:
   - 로고 섹션 제거 (헤더로 이동)
   - 대시보드가 최상단에 바로 표시
   - 높이: `h-screen lg:h-full`
4. **컨텐츠 영역**: 최소 높이 설정 `min-h-[calc(100vh-4rem)]`
   - 헤더 높이(4rem) 제외한 뷰포트 전체 높이를 최소값으로 설정
   - 컨텐츠가 적어도 푸터가 화면 하단에 위치하도록 보장
5. **푸터** (전체 너비):
   - 사이드바 옆이 아닌 페이지 하단 전체에 배치
   - 회사 정보, 고객센터, 이용안내, 소셜 미디어 섹션 포함

## 핵심 파일 목록

### Backend
- `/Users/philip/project/moa/back/prisma/schema.prisma`
- `/Users/philip/project/moa/back/prisma/seed-menu.ts`
- `/Users/philip/project/moa/back/prisma/seed-settings.ts`
- `/Users/philip/project/moa/back/src/routes/settings.ts`
- `/Users/philip/project/moa/back/src/routes/admin/menu-categories.ts`
- `/Users/philip/project/moa/back/src/routes/admin/menu-items.ts`

### Frontend
- `/Users/philip/project/moa/front/src/components/admin/AdminLayout.tsx`
- `/Users/philip/project/moa/front/src/components/admin/AdminFooter.tsx`
- `/Users/philip/project/moa/front/src/store/menuStore.ts`
- `/Users/philip/project/moa/front/src/lib/api/admin/menu.ts`
- `/Users/philip/project/moa/front/src/lib/api/settings.ts`
- `/Users/philip/project/moa/front/src/app/globals.css`

## 실행 명령어

### 시드 데이터 생성
```bash
cd back
npm run prisma:seed-menu
npm run prisma:seed-settings
```

### 마이그레이션
```bash
npx prisma migrate dev
```

## 현재 레이아웃 구조

```
┌─────────────────────────────────────────────┐
│  Header (Full Width)                        │
│  - Logo: "모아 Admin"                       │
│  - Search, Notifications, User Profile      │
├──────────┬──────────────────────────────────┤
│          │                                  │
│ Sidebar  │   Main Content                   │
│          │                                  │
│ - 대시보드 │   (min-height: 화면 높이 - 헤더)  │
│ - 메뉴들  │                                  │
│          │                                  │
├──────────┴──────────────────────────────────┤
│  Footer (Full Width)                        │
│  - 회사정보, 고객센터, 이용안내, 소셜미디어     │
└─────────────────────────────────────────────┘
```

## 역할 기반 메뉴 접근
- SUPER_ADMIN: 모든 메뉴 접근 가능
- BUSINESS_ADMIN: 비즈니스 관련 메뉴 접근
- USER: 제한된 메뉴만 접근

## 다음 작업 예정
- 추가 기능 구현 필요 시 이 파일에 계속 기록
