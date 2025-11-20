# 소프트 삭제 가이드

## 개요
이 프로젝트는 데이터를 실제로 삭제하는 대신 `isDeleted` 플래그를 사용하여 소프트 삭제를 구현합니다.

## 소프트 삭제가 적용된 모델

다음 모델들은 `isDeleted`와 `deletedAt` 필드를 포함합니다:

- **File** - 파일
- **User** - 사용자
- **Category** - 카테고리
- **Gathering** - 모임
- **CommonCode** - 공통 코드
- **Banner** - 배너
- **Popup** - 팝업
- **Event** - 이벤트
- **Notice** - 공지사항
- **Badge** - 배지
- **MenuCategory** - 메뉴 카테고리
- **MenuItem** - 메뉴 아이템

## 삭제 시 코드 패턴

```typescript
// ❌ 실제 삭제 (사용 금지)
await prisma.model.delete({ where: { id } });

// ✅ 소프트 삭제 (권장)
await prisma.model.update({
  where: { id },
  data: {
    isDeleted: true,
    deletedAt: new Date(),
  },
});
```

## 조회 시 코드 패턴

모든 조회 쿼리에 `isDeleted: false` 필터를 추가해야 합니다:

```typescript
// 단일 조회
const item = await prisma.model.findUnique({
  where: { 
    id,
    isDeleted: false,  // 필수!
  },
});

// 목록 조회
const items = await prisma.model.findMany({
  where: {
    isDeleted: false,  // 필수!
    // ... 다른 조건들
  },
});
```

## 주의사항

1. **모든 조회 쿼리**에 `isDeleted: false` 조건을 추가해야 합니다.
2. **관리자 페이지**에서 삭제된 데이터를 보려면 별도의 API가 필요합니다.
3. **파일 삭제**는 DB만 소프트 삭제하고, 실제 파일 시스템 삭제는 배치 작업으로 처리합니다.

## 복구 기능 (선택사항)

필요시 복구 API를 추가할 수 있습니다:

```typescript
// 복구
await prisma.model.update({
  where: { id },
  data: {
    isDeleted: false,
    deletedAt: null,
  },
});
```

## 변경 이력

- 2024-11-20: 소프트 삭제 기능 추가
- 적용 대상: 12개 주요 모델
- 마이그레이션: `20251120000000_add_soft_delete_fields`
