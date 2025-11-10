# RBAC (Role-Based Access Control) 설계

## 📌 개요

모아 플랫폼은 3가지 주요 역할(Role)을 가진 사용자로 구성됩니다.

---

## 👥 역할 정의

### 1. SUPER_ADMIN (슈퍼 관리자)
**설명**: 모아 플랫폼의 최고 관리자

**권한**:
- ✅ 모든 사용자 정보 조회/수정/삭제
- ✅ 모든 모임/클래스 정보 조회/수정/삭제
- ✅ 카테고리 관리 (생성/수정/삭제)
- ✅ 시스템 설정 변경
- ✅ 신고 처리 및 사용자 제재
- ✅ 통계 및 분석 데이터 조회
- ✅ 클래스 운영자 승인/거부
- ✅ 수수료 및 정산 관리
- ✅ 공지사항 관리
- ✅ 이용약관/정책 관리

**접근 경로**:
- `/admin/*` - 전체 관리자 페이지 접근 가능

---

### 2. BUSINESS_ADMIN (클래스 운영자 / 업장 주인)
**설명**: 유료 클래스나 정기 모임을 운영하는 사업자

**권한**:
- ✅ 본인 업장 정보 관리
- ✅ 클래스/모임 생성/수정/삭제 (본인 것만)
- ✅ 참여자 관리 (승인/거부)
- ✅ 예약 관리 대시보드
- ✅ 정산 내역 조회
- ✅ 본인 클래스 통계 조회
- ✅ 리뷰 답변
- ⛔ 다른 운영자 정보 조회 불가
- ⛔ 시스템 설정 변경 불가

**접근 경로**:
- `/business/*` - 비즈니스 대시보드
- `/gatherings/create` - 모임/클래스 생성 (유료 옵션 사용 가능)
- `/business/analytics` - 본인 통계만

**가입 조건**:
- 사업자등록번호 인증 필수
- SUPER_ADMIN의 승인 필요 (초기)
- 이후 자동 승인 옵션 추가 가능

---

### 3. USER (일반 사용자)
**설명**: 모임에 참여하거나 무료 모임을 주최하는 일반 사용자

**권한**:
- ✅ 모임 검색/조회
- ✅ 모임 참여 신청
- ✅ 무료 모임 생성 (매너온도 37.5℃ 이상 시)
- ✅ 본인이 주최한 모임 관리
- ✅ 본인 프로필 관리
- ✅ 리뷰 작성 (참여한 모임만)
- ✅ 채팅 참여 (참여 확정된 모임만)
- ⛔ 유료 클래스 생성 불가
- ⛔ 다른 사용자 정보 수정 불가
- ⛔ 관리자 페이지 접근 불가

**접근 경로**:
- `/` - 홈
- `/explore` - 탐색
- `/gatherings/*` - 모임 상세
- `/my/*` - 마이페이지

---

## 🔐 권한 매트릭스

| 기능 | SUPER_ADMIN | BUSINESS_ADMIN | USER |
|------|-------------|----------------|------|
| **사용자 관리** |
| 모든 사용자 조회 | ✅ | ⛔ | ⛔ |
| 사용자 제재 | ✅ | ⛔ | ⛔ |
| 본인 프로필 수정 | ✅ | ✅ | ✅ |
| **모임/클래스 관리** |
| 무료 모임 생성 | ✅ | ✅ | ✅* |
| 유료 클래스 생성 | ✅ | ✅ | ⛔ |
| 모든 모임 수정/삭제 | ✅ | ⛔ | ⛔ |
| 본인 모임 수정/삭제 | ✅ | ✅ | ✅ |
| 모임 참여 | ✅ | ✅ | ✅ |
| **관리 기능** |
| 카테고리 관리 | ✅ | ⛔ | ⛔ |
| 신고 처리 | ✅ | ⛔ | ⛔ |
| 전체 통계 조회 | ✅ | ⛔ | ⛔ |
| 본인 통계 조회 | ✅ | ✅ | ✅ |
| 정산 관리 | ✅ | ✅** | ⛔ |
| **리뷰 & 평가** |
| 리뷰 작성 | ✅ | ✅ | ✅ |
| 리뷰 답변 | ✅ | ✅ | ⛔ |
| 리뷰 삭제 (모든) | ✅ | ⛔ | ⛔ |
| **커뮤니케이션** |
| 채팅 참여 | ✅ | ✅ | ✅ |
| 공지사항 작성 | ✅ | ⛔ | ⛔ |

\* 매너온도 37.5℃ 이상 필요
\*\* 본인 클래스 정산만

---

## 🏗 데이터베이스 구조

### users 테이블
```sql
users
- id (PK)
- email
- password
- name
- role (ENUM: 'SUPER_ADMIN', 'BUSINESS_ADMIN', 'USER')
- is_verified (본인인증 여부)
- created_at
- updated_at
```

### business_profiles 테이블
```sql
business_profiles
- id (PK)
- user_id (FK → users, UNIQUE)
- business_name (상호명)
- business_number (사업자등록번호, UNIQUE)
- business_address
- business_phone
- bank_account (정산 계좌)
- is_approved (승인 여부)
- approved_by (FK → users, SUPER_ADMIN)
- approved_at
- created_at
- updated_at
```

---

## 🔄 역할 변경 플로우

### USER → BUSINESS_ADMIN 승급

```
1. 사용자가 "비즈니스 전환" 신청
   ↓
2. 사업자등록번호 입력 및 서류 업로드
   ↓
3. SUPER_ADMIN 승인 대기 (is_approved = false)
   ↓
4. SUPER_ADMIN이 승인
   ↓
5. role 변경: USER → BUSINESS_ADMIN
   ↓
6. 비즈니스 대시보드 접근 가능
```

### 강제 역할 변경
- SUPER_ADMIN만 가능
- 사유 기록 필수
- 사용자에게 이메일 알림

---

## 🛡 보안 정책

### 1. 인증 (Authentication)
- JWT 기반 토큰 인증
- Access Token: 15분 (짧은 유효기간)
- Refresh Token: 7일
- 토큰에 `role` 정보 포함

### 2. 인가 (Authorization)
- 미들웨어를 통한 역할 검증
- Route 레벨에서 권한 체크
- API 레벨에서 리소스 소유권 검증

### 3. 미들웨어 예시
```typescript
// requireRole.ts
export const requireRole = (...allowedRoles: Role[]) => {
  return (req, res, next) => {
    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Forbidden: Insufficient permissions'
      });
    }

    next();
  };
};

// 사용 예시
router.post('/admin/users',
  authenticate,
  requireRole('SUPER_ADMIN'),
  createUser
);

router.post('/business/classes',
  authenticate,
  requireRole('SUPER_ADMIN', 'BUSINESS_ADMIN'),
  createClass
);
```

### 4. 리소스 소유권 검증
```typescript
// 본인 모임만 수정 가능
export const checkGatheringOwnership = async (req, res, next) => {
  const { gatheringId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  // SUPER_ADMIN은 모든 권한
  if (userRole === 'SUPER_ADMIN') {
    return next();
  }

  const gathering = await prisma.gathering.findUnique({
    where: { id: gatheringId }
  });

  if (gathering.host_id !== userId) {
    return res.status(403).json({
      error: 'You can only modify your own gatherings'
    });
  }

  next();
};
```

---

## 📱 Frontend 권한 처리

### 1. 역할 기반 컴포넌트 렌더링
```typescript
// components/RoleGuard.tsx
export const RoleGuard = ({
  allowedRoles,
  children
}: {
  allowedRoles: Role[],
  children: React.ReactNode
}) => {
  const { user } = useAuth();

  if (!allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};

// 사용 예시
<RoleGuard allowedRoles={['SUPER_ADMIN']}>
  <AdminDashboard />
</RoleGuard>

<RoleGuard allowedRoles={['BUSINESS_ADMIN', 'SUPER_ADMIN']}>
  <CreatePaidClassButton />
</RoleGuard>
```

### 2. 역할 기반 라우팅
```typescript
// app/admin/layout.tsx
export default function AdminLayout({ children }) {
  const { user } = useAuth();

  if (user.role !== 'SUPER_ADMIN') {
    redirect('/');
  }

  return <>{children}</>;
}
```

---

## 🎯 구현 우선순위

### Phase 1 (MVP)
1. ✅ 기본 USER 역할 구현
2. ✅ SUPER_ADMIN 역할 구현 (수동 DB 설정)
3. ✅ 역할 기반 미들웨어
4. ✅ Frontend 권한 가드

### Phase 2
1. ✅ BUSINESS_ADMIN 역할 구현
2. ✅ 비즈니스 프로필 관리
3. ✅ 승인 플로우 구현
4. ✅ 정산 시스템

### Phase 3
1. ✅ 세분화된 권한 (Permissions)
2. ✅ 감사 로그 (Audit Log)
3. ✅ 역할별 대시보드 최적화

---

## 📝 관련 문서

- [PRD](./PRD.md)
- [DB 스키마](./DB_SCHEMA.md)
- [API 명세](./API_SPECIFICATION.md)

---

**문서 버전**: 1.0
**최종 수정일**: 2025-11-10
**작성자**: Backend Team
