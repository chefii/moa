# 개발 로드맵 (Development Roadmap)

## 📌 전체 타임라인

```
Phase 1: MVP 개발 (12주)
  ├─ Week 1-3: 기반 구축
  ├─ Week 4-8: 핵심 기능
  └─ Week 9-12: 완성도 & 베타 런칭

Phase 2: 고도화 (3개월)
  ├─ 결제 시스템
  ├─ AI 추천 고도화
  └─ 비즈니스 기능 강화

Phase 3: 하이브리드 앱 (2개월)
  ├─ React Native / Capacitor
  └─ 앱스토어 배포
```

---

## 🗓️ Phase 1: MVP 개발 (12주)

### Week 1: 프로젝트 초기화

#### 🎯 목표
프로젝트 기반 구축 완료

#### ✅ 체크리스트
**환경 설정**
- [ ] Git 레포지토리 생성
- [ ] 프로젝트 디렉토리 구조 생성 (BE, FE, Document)
- [ ] Next.js 14 프로젝트 초기화
- [ ] Backend (Express/Nest.js) 프로젝트 초기화
- [ ] PostgreSQL 로컬 설치 또는 Docker Compose 설정
- [ ] Redis 로컬 설치 또는 Docker Compose 설정

**Frontend 설정**
- [ ] Tailwind CSS 설치 및 설정
- [ ] shadcn/ui 초기 설정
- [ ] 기본 컴포넌트 생성 (Button, Input, Card 등)
- [ ] Zustand 설치 및 기본 store 생성
- [ ] React Query 설정
- [ ] 폴더 구조 구축

**Backend 설정**
- [ ] Prisma 설치 및 schema.prisma 작성
- [ ] 기본 미들웨어 설정 (CORS, Body Parser 등)
- [ ] 환경 변수 설정 (.env)
- [ ] 에러 핸들링 미들웨어
- [ ] 로깅 설정 (Winston/Pino)

**DevOps**
- [ ] ESLint, Prettier 설정
- [ ] Husky, lint-staged 설정
- [ ] GitHub Actions 기본 CI 설정
- [ ] README.md 작성

**성과물**
- 로컬 환경에서 Frontend/Backend 실행 가능
- DB 연결 확인

---

### Week 2: 인증 시스템

#### 🎯 목표
회원가입/로그인 기능 완성

#### ✅ 체크리스트
**Backend**
- [ ] User 모델 Prisma 마이그레이션
- [ ] JWT 인증 미들웨어 구현
- [ ] 회원가입 API (`POST /api/auth/signup`)
  - 이메일 중복 검증
  - 비밀번호 해싱 (bcrypt)
  - 사용자 역할 선택 (USER, BUSINESS_ADMIN)
- [ ] 로그인 API (`POST /api/auth/login`)
  - JWT Access Token 발급 (15분)
  - JWT Refresh Token 발급 (7일)
- [ ] 토큰 갱신 API (`POST /api/auth/refresh`)
- [ ] 로그아웃 API (`POST /api/auth/logout`)
- [ ] 소셜 로그인 (카카오) 연동 (`POST /api/auth/kakao`)

**Frontend**
- [ ] 회원가입 페이지 UI (`/signup`)
  - 이메일, 비밀번호, 이름 입력
  - 사용자 유형 선택 (일반 사용자 / 클래스 운영자)
  - React Hook Form + Zod 검증
- [ ] 로그인 페이지 UI (`/login`)
  - 소셜 로그인 버튼 (카카오)
- [ ] Auth Context/Store (Zustand)
- [ ] Protected Route 컴포넌트
- [ ] 자동 로그인 (Refresh Token)

**테스트**
- [ ] 회원가입/로그인 E2E 테스트
- [ ] API 유닛 테스트

**성과물**
- 사용자가 회원가입하고 로그인할 수 있음
- 인증된 사용자만 특정 페이지 접근 가능

---

### Week 3: 사용자 프로필

#### 🎯 목표
사용자 프로필 및 관심사 설정

#### ✅ 체크리스트
**Backend**
- [ ] Category 모델 시딩 (10개 카테고리)
- [ ] UserInterest 모델 마이그레이션
- [ ] 프로필 조회 API (`GET /api/users/me`)
- [ ] 프로필 수정 API (`PATCH /api/users/me`)
- [ ] 프로필 이미지 업로드 API (`POST /api/users/me/avatar`)
  - AWS S3 연동
  - Sharp로 이미지 리사이징
- [ ] 관심사 추가/삭제 API
  - `POST /api/users/me/interests`
  - `DELETE /api/users/me/interests/:id`

**Frontend**
- [ ] 프로필 페이지 UI (`/my/profile`)
  - 프로필 이미지 업로드
  - 이름, 자기소개 수정
  - 관심사 선택 (최대 3개)
- [ ] 매너온도 표시 컴포넌트
- [ ] 프로필 이미지 컴포넌트 (Avatar)

**성과물**
- 사용자가 프로필을 작성하고 관심사를 선택할 수 있음
- S3에 이미지 업로드 가능

---

### Week 4: 모임 생성

#### 🎯 목표
모임 생성 기능 완성

#### ✅ 체크리스트
**Backend**
- [ ] Gathering 모델 마이그레이션
- [ ] 모임 생성 API (`POST /api/gatherings`)
  - 권한 검증 (일반 모임: 매너온도 37.5℃ 이상)
  - 권한 검증 (유료 클래스: BUSINESS_ADMIN만)
  - 이미지 업로드 (S3)
- [ ] 모임 수정 API (`PATCH /api/gatherings/:id`)
  - 본인 모임만 수정 가능
- [ ] 모임 삭제 API (`DELETE /api/gatherings/:id`)

**Frontend**
- [ ] 모임 생성 페이지 (`/gatherings/create`)
  - **Step 1**: 모임 유형 선택 (일반 모임 / 유료 클래스)
  - **Step 2**: 카테고리 선택
  - **Step 3**: 제목, 설명 입력
  - **Step 4**: 일시, 장소 선택
    - Kakao Maps API 연동
    - 장소 검색 자동완성
  - **Step 5**: 인원, 참가비 설정
  - 진행 상태 표시 (Stepper)
- [ ] 모임 이미지 업로드 컴포넌트
- [ ] 날짜/시간 선택 컴포넌트 (react-day-picker)

**성과물**
- 사용자가 5단계로 모임을 쉽게 생성할 수 있음
- 카카오 맵으로 장소 검색 가능

---

### Week 5: 모임 조회

#### 🎯 목표
모임 목록 및 상세 페이지 완성

#### ✅ 체크리스트
**Backend**
- [ ] 모임 목록 조회 API (`GET /api/gatherings`)
  - 페이지네이션 (limit, offset)
  - 카테고리 필터
  - 지역 필터 (위도/경도 기반)
  - 날짜 필터
  - 모임 유형 필터 (FREE, PAID_CLASS, DEPOSIT)
  - 정렬 (최신순, 마감임박순, 인기순)
- [ ] 모임 상세 조회 API (`GET /api/gatherings/:id`)
  - 호스트 정보 포함
  - 참여자 수 정보

**Frontend**
- [ ] 모임 목록 페이지 (`/explore`)
  - 카드 형식으로 모임 표시
  - 무한 스크롤 (React Query Infinite Query)
  - 필터 사이드바
    - 카테고리
    - 지역 (내 주변 5km, 10km 등)
    - 날짜 (이번 주, 이번 주말, 다음 주)
    - 모임 유형
- [ ] 모임 상세 페이지 (`/gatherings/[id]`)
  - 모임 정보 표시
  - 호스트 프로필
  - 카카오 맵으로 위치 표시
  - 참여 신청 버튼
- [ ] 모임 카드 컴포넌트 (재사용)

**성과물**
- 사용자가 모임을 검색하고 필터링할 수 있음
- 모임 상세 정보 확인 가능

---

### Week 6: 모임 참여

#### 🎯 목표
모임 참여 및 관리 기능 완성

#### ✅ 체크리스트
**Backend**
- [ ] GatheringParticipant 모델 마이그레이션
- [ ] 모임 참여 신청 API (`POST /api/gatherings/:id/join`)
  - 중복 참여 검증
  - 최대 인원 검증
  - current_participants 증가
- [ ] 참여 취소 API (`DELETE /api/gatherings/:id/join`)
  - current_participants 감소
- [ ] 참여자 목록 조회 API (`GET /api/gatherings/:id/participants`)
- [ ] 참여 승인/거부 API (호스트만)
  - `PATCH /api/gatherings/:id/participants/:userId/approve`
  - `PATCH /api/gatherings/:id/participants/:userId/reject`

**Frontend**
- [ ] 참여 신청 버튼
  - 로그인 체크
  - 최대 인원 체크
  - 상태 표시 (신청 중, 참여 확정, 대기 중)
- [ ] 참여자 목록 모달
  - 호스트는 승인/거부 버튼 표시
- [ ] 내 모임 페이지 (`/my/gatherings`)
  - 참여 예정 모임
  - 주최하는 모임
  - 탭으로 구분

**성과물**
- 사용자가 모임에 참여 신청하고 취소할 수 있음
- 호스트가 참여자를 관리할 수 있음

---

### Week 7: AI 추천 시스템 (기본)

#### 🎯 목표
관심사 기반 모임 추천

#### ✅ 체크리스트
**Backend**
- [ ] 추천 알고리즘 구현 (v1 - 단순 규칙 기반)
  - 사용자 관심사 매칭
  - 지역 기반 (거리 계산)
  - 최근 생성된 모임 우선
- [ ] 추천 모임 API (`GET /api/recommendations`)
  - 최대 3개 반환
  - 사용자 관심사 기반
  - 캐싱 (Redis, 1시간)

**Frontend**
- [ ] 홈 페이지 (`/`)
  - "오늘의 추천 모임 3개" 섹션
  - 추천 카드 (강조 스타일)
  - 새로운 모임 피드
  - 인기 모임 피드
- [ ] 추천 이유 표시 (예: "관심사 '운동'과 일치")

**성과물**
- 사용자에게 개인화된 모임 3개 추천
- 홈 피드 완성

---

### Week 8: 채팅 기능

#### 🎯 목표
실시간 채팅 기능 완성

#### ✅ 체크리스트
**Backend**
- [ ] Socket.io 서버 설정
- [ ] ChatRoom, ChatMessage 모델 마이그레이션
- [ ] 채팅방 생성 API (`POST /api/gatherings/:id/chat`)
  - 모임당 1개 채팅방
- [ ] Socket.io 이벤트
  - `join-room`: 채팅방 입장
  - `send-message`: 메시지 전송
  - `receive-message`: 메시지 수신
  - `typing`: 타이핑 중 표시
- [ ] 메시지 히스토리 조회 API (`GET /api/chat/:roomId/messages`)
  - 페이지네이션

**Frontend**
- [ ] Socket.io 클라이언트 설정
- [ ] 채팅 컴포넌트
  - 메시지 목록
  - 메시지 입력창
  - 실시간 메시지 수신
  - 타이핑 인디케이터
- [ ] 채팅방 페이지 (`/gatherings/[id]/chat`)
  - 참여 확정자만 접근 가능
- [ ] 읽지 않은 메시지 표시 (선택)

**성과물**
- 참여자들이 실시간으로 채팅 가능
- 메시지 히스토리 조회 가능

---

### Week 9: 신뢰도 시스템

#### 🎯 목표
매너온도, 리뷰 시스템 완성

#### ✅ 체크리스트
**Backend**
- [ ] Review 모델 마이그레이션
- [ ] 체크인 API (`POST /api/gatherings/:id/checkin`)
  - QR 코드 또는 위치 기반
  - attended_at 기록
  - status → ATTENDED
- [ ] 리뷰 작성 API (`POST /api/gatherings/:id/reviews`)
  - 참석한 모임만 작성 가능
  - 호스트 ↔ 참여자 상호 평가
- [ ] 매너온도 계산 로직
  - 리뷰 평점 반영
  - 노쇼 시 -1.0℃
  - 참석 시 +0.1℃
- [ ] 리뷰 답변 API (`PATCH /api/reviews/:id/reply`)
  - 호스트/비즈니스 관리자만

**Frontend**
- [ ] 체크인 페이지 (`/gatherings/[id]/checkin`)
  - QR 코드 스캔 (선택)
  - 위치 기반 체크인
- [ ] 리뷰 작성 모달
  - 별점 선택 (1-5)
  - 코멘트 입력 (선택)
- [ ] 매너온도 표시 컴포넌트 (온도계 디자인)
- [ ] 리뷰 목록 표시
  - 프로필 페이지에 표시
  - 모임 상세 페이지에 표시

**성과물**
- 참석 확인 및 리뷰 작성 가능
- 매너온도 자동 계산

---

### Week 10: 마이페이지 & 알림

#### 🎯 목표
마이페이지 완성 및 알림 시스템

#### ✅ 체크리스트
**Backend**
- [ ] Bookmark 모델 마이그레이션
- [ ] 북마크 추가/삭제 API
  - `POST /api/bookmarks`
  - `DELETE /api/bookmarks/:id`
- [ ] 내 북마크 목록 API (`GET /api/bookmarks`)
- [ ] 알림 시스템 (이메일)
  - 모임 승인/거부 알림
  - 모임 24시간 전 리마인더
  - 리뷰 작성 요청

**Frontend**
- [ ] 마이페이지 완성 (`/my`)
  - 대시보드 (참여 예정, 주최 중)
  - 프로필 정보
  - 매너온도, 참석률
  - 관심 모임 (북마크)
- [ ] 설정 페이지 (`/my/settings`)
  - 프로필 수정
  - 비밀번호 변경
  - 알림 설정
  - 회원 탈퇴
- [ ] 북마크 버튼 (하트 아이콘)

**성과물**
- 마이페이지에서 모든 정보 확인 가능
- 북마크 기능 동작
- 이메일 알림 발송

---

### Week 11: 테스트 & 버그 수정

#### 🎯 목표
QA 및 버그 수정

#### ✅ 체크리스트
**테스트**
- [ ] E2E 테스트 작성 (Playwright)
  - 회원가입 → 로그인 → 모임 생성 → 참여 플로우
  - 채팅 플로우
  - 리뷰 작성 플로우
- [ ] API 유닛 테스트 커버리지 60% 이상
- [ ] 수동 QA 체크리스트 작성 및 테스트

**버그 수정**
- [ ] 발견된 버그 수정
- [ ] 에러 핸들링 개선
- [ ] 사용자 경험 개선

**성능 최적화**
- [ ] Next.js 이미지 최적화
- [ ] API 응답 속도 최적화
- [ ] DB 쿼리 최적화 (인덱스 추가)
- [ ] 번들 사이즈 최적화

**성과물**
- 주요 버그 모두 수정
- 테스트 커버리지 목표 달성

---

### Week 12: 베타 런칭 준비

#### 🎯 목표
베타 런칭 및 실사용자 테스트

#### ✅ 체크리스트
**프로덕션 환경**
- [ ] Vercel 프로덕션 배포
- [ ] Railway/AWS 백엔드 배포
- [ ] 도메인 연결 (예: moa.kr)
- [ ] HTTPS 설정
- [ ] 환경 변수 설정

**SEO & 메타데이터**
- [ ] 메타 태그 설정 (title, description)
- [ ] Open Graph 이미지
- [ ] Sitemap 생성
- [ ] robots.txt

**모니터링**
- [ ] Sentry 에러 트래킹 설정
- [ ] Vercel Analytics 설정
- [ ] DB 모니터링 설정

**베타 런칭**
- [ ] 베타 유저 모집 (50명 목표)
  - 지인, 커뮤니티, SNS
- [ ] 사용자 피드백 수집 폼
- [ ] 버그 리포트 채널 (Discord/Slack)

**문서**
- [ ] 사용자 가이드 작성
- [ ] FAQ 작성
- [ ] 개인정보처리방침
- [ ] 이용약관

**성과물**
- 실제 사용자가 서비스 이용 가능
- 피드백 수집 시작

---

## 📊 주요 마일스톤

| 마일스톤 | 목표 날짜 | 핵심 목표 | 성공 지표 |
|----------|-----------|-----------|-----------|
| **M1: 프로젝트 셋업** | Week 1 | 개발 환경 완성 | 로컬 개발 가능 |
| **M2: 인증 완료** | Week 3 | 회원가입/로그인 동작 | 소셜 로그인 포함 |
| **M3: 모임 CRUD** | Week 6 | 모임 생성-조회-참여 | 전체 플로우 완성 |
| **M4: MVP 완성** | Week 9 | 핵심 기능 모두 구현 | 실제 사용 가능 |
| **M5: 베타 런칭** | Week 12 | 실사용자 테스트 시작 | 50명 베타 유저 |

---

## 🚀 Phase 2: 고도화 (3개월)

### Month 1: 비즈니스 기능 강화

**클래스 운영자 기능**
- [ ] BusinessProfile 승인 시스템
- [ ] 비즈니스 대시보드 (`/business`)
  - 예약 관리
  - 정산 내역
  - 통계 (매출, 참여자 수)
- [ ] 클래스 다회차 등록 (반복 일정)
- [ ] 클래스 소개 페이지 커스터마이징

**결제 시스템**
- [ ] 토스페이먼츠 연동
- [ ] 예치금 결제/환불
- [ ] 유료 클래스 결제
- [ ] 정산 자동화
- [ ] 수수료 계산 (10-15%)

### Month 2: AI 추천 고도화

**추천 알고리즘 v2**
- [ ] 사용자 행동 데이터 수집
  - 클릭, 참여, 북마크
- [ ] 협업 필터링 알고리즘
- [ ] ML 모델 학습 (Python FastAPI)
- [ ] A/B 테스트

**개인화**
- [ ] 추천 정확도 향상
- [ ] 추천 이유 상세화
- [ ] 추천 피드백 루프

### Month 3: 관리자 시스템

**SUPER_ADMIN 대시보드**
- [ ] 사용자 관리
- [ ] 모임 관리
- [ ] 신고 처리
- [ ] 통계 대시보드
- [ ] 공지사항 관리

**모니터링**
- [ ] 실시간 사용자 통계
- [ ] 서버 상태 모니터링
- [ ] 알림 시스템

---

## 📱 Phase 3: 하이브리드 앱 (2개월)

### Month 1: 앱 개발

**선택한 기술 스택에 따라**
- [ ] React Native 또는 Capacitor 프로젝트 초기화
- [ ] 기존 컴포넌트 이식
- [ ] 네이티브 기능 연동
  - 푸시 알림 (Firebase)
  - 위치 서비스
  - 카메라 (QR 코드)
- [ ] 앱 아이콘, 스플래시 스크린

### Month 2: 배포

- [ ] iOS 앱 빌드
- [ ] Android 앱 빌드
- [ ] 앱스토어 등록 준비
  - 스크린샷
  - 설명
  - 개인정보처리방침
- [ ] TestFlight 베타 테스트 (iOS)
- [ ] Google Play 베타 테스트 (Android)
- [ ] 정식 출시

---

## 🎯 성공 지표 (KPI)

### Phase 1 (3개월)
- ✅ 가입자 1,000명
- ✅ 월간 생성 모임 100개
- ✅ 모임 참여율 40%
- ✅ MAU/DAU 비율 25%

### Phase 2 (6개월)
- ✅ 가입자 10,000명
- ✅ 클래스 운영자 100명
- ✅ 월 거래액 1,000만원
- ✅ Retention Rate (30일) 30%

### Phase 3 (9개월)
- ✅ 앱 다운로드 50,000건
- ✅ 월 거래액 5,000만원
- ✅ NPS 50+

---

## 📝 관련 문서

- [PRD](./PRD.md)
- [Sprint 1 가이드](./SPRINT_1_GUIDE.md)

---

**문서 버전**: 1.0
**최종 수정일**: 2025-11-10
**작성자**: PM Team
