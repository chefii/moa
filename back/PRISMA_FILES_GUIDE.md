# Prisma 디렉토리 파일 관리 가이드

## 🚨 절대 삭제 금지 (핵심 파일)

### 1. `schema.prisma` ⭐⭐⭐⭐⭐
```prisma
// 전체 DB 구조 정의
model User { ... }
model Post { ... }
```

**삭제하면:**
- 💥 프로젝트 완전 망가짐
- 💥 DB 구조를 알 수 없음
- 💥 TypeScript 타입 생성 불가
- 💥 마이그레이션 생성 불가

**결론:** ❌ **절대 삭제 금지!**

---

### 2. `migrations/` 폴더 ⭐⭐⭐⭐⭐
```
migrations/
├── 20251110_create_users/
│   └── migration.sql
├── 20251115_add_email/
│   └── migration.sql
└── migration_lock.toml
```

**삭제하면:**
- 💥 DB 변경 이력 소실
- 💥 팀원과 동기화 불가
- 💥 프로덕션 배포 불가
- 💥 롤백 불가

**결론:** ❌ **절대 삭제 금지!**

**예외:** 개인 로컬 개발용 프로젝트면 삭제 후 재생성 가능
```bash
# ⚠️ 팀 프로젝트는 절대 금지!
rm -rf migrations/
npx prisma migrate dev --name "init"
```

---

## ✅ 삭제 가능 (유틸리티 파일)

### 3. `seed-*.ts` 파일들 ⭐⭐
```typescript
// seed-users.ts
// seed-common-codes.ts
// seed-categories.ts
```

**용도:**
- 개발/테스트용 초기 데이터 입력
- 필수 마스터 데이터 생성

**삭제해도 되는 경우:**
- 이미 데이터가 DB에 있음
- 더 이상 사용하지 않는 스크립트
- 프로덕션에는 불필요

**삭제하면:**
- ⚠️ 초기 데이터 입력 불가
- ⚠️ 새 개발자 온보딩 불편

**결론:** ⚠️ **가능하지만 권장하지 않음**
- 보관 추천 (용량 작음)
- `.archive/` 폴더로 이동 권장

---

### 4. `migrate-*.ts` 파일들 ⭐
```typescript
// migrate-user-roles.ts
// migrate-report-status.ts
// migrate-images-to-files.ts
```

**용도:**
- 일회성 데이터 마이그레이션
- 기존 데이터 변환

**삭제 가능한 경우:**
- 이미 실행 완료됨
- 더 이상 사용하지 않음

**결론:** ✅ **삭제 가능**
- 단, 주석으로 실행 여부 표시 권장
```typescript
// ✅ 2024-11-10 실행 완료
// migrate-user-roles.ts
```

---

### 5. `*.sql` 파일들 (수동 스크립트) ⭐
```sql
-- add-korean-comments.sql
-- fix-category-constraints.sql
-- insert-menu-data.sql
```

**용도:**
- 일회성 수동 실행 SQL
- 데이터 수정/보정

**삭제 가능한 경우:**
- 이미 실행 완료
- migrations/에 포함됨

**결론:** ✅ **삭제 가능**
- 보관 권장 (나중에 참고 가능)

---

### 6. 기타 유틸리티 스크립트 ⭐
```typescript
// check-*.ts      - 데이터 확인용
// delete-*.ts     - 테스트 데이터 삭제
// clear-*.ts      - 데이터 초기화
// update-*.ts     - 데이터 업데이트
// verify-*.ts     - 검증 스크립트
```

**결론:** ✅ **삭제 가능**
- 개발 편의를 위한 도구
- 프로덕션에는 불필요

---

## 📊 파일 중요도 정리

| 파일/폴더 | 중요도 | 삭제 가능? | 비고 |
|----------|--------|-----------|------|
| `schema.prisma` | ⭐⭐⭐⭐⭐ | ❌ 절대 금지 | 프로젝트 핵심 |
| `migrations/` | ⭐⭐⭐⭐⭐ | ❌ 절대 금지 | DB 변경 이력 |
| `seed-*.ts` | ⭐⭐ | ⚠️ 비권장 | 초기 데이터 |
| `migrate-*.ts` | ⭐ | ✅ 가능 | 일회성 작업 |
| `*.sql` (수동) | ⭐ | ✅ 가능 | 일회성 작업 |
| `check-*.ts` | ⭐ | ✅ 가능 | 개발 도구 |
| `delete-*.ts` | ⭐ | ✅ 가능 | 개발 도구 |
| `clear-*.ts` | ⭐ | ✅ 가능 | 개발 도구 |

---

## 🗂️ 권장 정리 방법

### 현재 상태 (어지러움)
```
prisma/
├── schema.prisma
├── migrations/
├── seed-users.ts
├── seed-categories.ts
├── migrate-user-roles.ts
├── add-korean-comments.sql
├── check-user-count.ts
├── delete-test-users.ts
└── ... (30개 파일)
```

### 권장 구조
```
prisma/
├── schema.prisma                    # ⭐ 핵심
├── migrations/                      # ⭐ 핵심
│
├── seeds/                           # 📦 초기 데이터
│   ├── seed-users.ts
│   ├── seed-categories.ts
│   └── seed-all.ts
│
├── scripts/                         # 🔧 개발 도구
│   ├── check-user-count.ts
│   ├── delete-test-users.ts
│   └── clear-categories.ts
│
└── archive/                         # 📁 완료된 작업
    ├── migrate-user-roles.ts       # ✅ 2024-11-10 완료
    ├── add-korean-comments.sql     # ✅ 2024-11-13 완료
    └── fix-category-constraints.sql
```

---

## 🧹 실제 정리 예시

### 현재 프로젝트 파일 분류

#### ❌ 절대 삭제 금지
```
schema.prisma
migrations/
```

#### 📦 유지 권장 (seeds/ 폴더로 이동)
```
seed-all.ts
seed-badges.ts
seed-board-categories.ts
seed-board-menu.ts
seed-categories.ts
seed-category-type.ts
seed-common-codes.ts
seed-condition-types.ts
seed-menu.ts
seed-notifications.ts
seed-report-status.ts
seed-reports.ts
seed-settings.ts
```

#### 🔧 개발 도구 (scripts/ 폴더로 이동)
```
check-asdf-user.ts
check-user-count.ts
clear-categories.ts
delete-test-users.ts
reset-database.ts
update-role-codes.ts
verify-menu.ts
```

#### 📁 완료된 작업 (archive/ 폴더로 이동)
```
migrate-user-roles.ts              # ✅ 완료됨
migrate-report-status.ts           # ✅ 완료됨
migrate-images-to-files.ts         # ✅ 완료됨
add-korean-comments.sql            # ✅ 완료됨
add-popup-comments.ts              # ✅ 완료됨
add-refresh-token-comments.ts      # ✅ 완료됨
fix-category-constraints.sql       # ✅ 완료됨
fix-category-constraints-v2.sql    # ✅ 완료됨
fix-category-icons.ts              # ✅ 완료됨
insert-menu-data.sql               # ✅ 완료됨
```

---

## 📝 정리 스크립트

```bash
#!/bin/bash
# prisma 폴더 정리

cd /Users/philip/project/moa/back/prisma

# 1. seeds 폴더 생성 및 이동
mkdir -p seeds
mv seed-*.ts seeds/

# 2. scripts 폴더 생성 및 이동
mkdir -p scripts
mv check-*.ts scripts/
mv delete-*.ts scripts/
mv clear-*.ts scripts/
mv update-*.ts scripts/
mv verify-*.ts scripts/
mv reset-database.ts scripts/

# 3. archive 폴더 생성 및 이동
mkdir -p archive
mv migrate-*.ts archive/
mv add-*.sql archive/
mv add-*.ts archive/
mv fix-*.sql archive/
mv fix-*.ts archive/
mv insert-*.sql archive/

echo "✅ 정리 완료!"
echo "📂 seeds/    - $(ls seeds/ | wc -l) 파일"
echo "🔧 scripts/  - $(ls scripts/ | wc -l) 파일"
echo "📁 archive/  - $(ls archive/ | wc -l) 파일"
```

---

## ⚠️ 주의사항

### 1. 팀 프로젝트라면

**삭제 전 확인:**
- 팀원들에게 공지
- 다른 개발자가 사용 중인지 확인
- Git 이력 확인

**권장:**
- 삭제보다 archive 폴더로 이동
- README에 파일 설명 추가

### 2. 프로덕션 서버

**절대 건드리지 말 것:**
- schema.prisma
- migrations/

**가능:**
- seed-*.ts (프로덕션에서 안 씀)
- 개발 도구들

### 3. 백업

```bash
# 정리 전 백업
cd /Users/philip/project/moa/back
tar -czf prisma-backup-$(date +%Y%m%d).tar.gz prisma/
```

---

## 🎯 결론

### 절대 삭제 금지 ❌
```
schema.prisma          # DB 구조 정의
migrations/            # DB 변경 이력
```

### 정리 가능 ✅
```
나머지 모든 파일 → 폴더별로 정리 권장
├── seeds/      (초기 데이터)
├── scripts/    (개발 도구)
└── archive/    (완료된 작업)
```

### 추천 방식
```bash
# ❌ 삭제하지 말고
rm -f migrate-*.ts

# ✅ 정리하기
mkdir -p archive
mv migrate-*.ts archive/
```

**이유:**
- 나중에 참고 가능
- 히스토리 유지
- 실수 방지
- 용량도 작음 (몇 KB)

---

**핵심:** schema.prisma와 migrations/만 안 건드리면 됩니다! 🎯

**작성일**: 2024-11-20
**프로젝트**: MOA Backend
