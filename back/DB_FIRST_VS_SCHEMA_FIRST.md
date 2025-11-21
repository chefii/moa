# DB First vs Schema First 접근 방식

## 📊 두 가지 방식 비교

### 1️⃣ Schema First (현재 방식)
```
Prisma Schema → 마이그레이션 → DB
```

### 2️⃣ DB First (질문하신 방식)
```
DB (DDL) → Prisma Schema → TypeScript
```

---

## 🔄 DB First 방식 (DDL → Prisma)

### 작업 흐름

```sql
-- 1단계: DBA/DB 담당자가 DDL 작성 및 실행
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  age INTEGER,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

```bash
# 2단계: Prisma가 DB 구조를 읽어서 schema.prisma 자동 생성
npx prisma db pull

# 3단계: TypeScript 타입 자동 생성
npx prisma generate
```

### 자동 생성된 schema.prisma

```prisma
// ✨ 자동으로 생성됨!
model users {
  id         String   @id @default(dbgenerated("gen_random_uuid()"))
  email      String   @unique @db.VarChar(255)
  name       String   @db.VarChar(100)
  age        Int?
  is_deleted Boolean  @default(false)
  created_at DateTime @default(now())

  posts      posts[]
}

model posts {
  id         String   @id @default(dbgenerated("gen_random_uuid()"))
  title      String   @db.VarChar(255)
  content    String?
  author_id  String
  created_at DateTime @default(now())

  users      users    @relation(fields: [author_id], references: [id], onDelete: Cascade)
}
```

---

## ✅ DB First의 장점

### 1. DBA/DB 전문가가 설계 가능
```
시나리오: 대기업, 은행, 금융권 등

┌─────────────┐
│ DB 전문가   │ → DDL 작성 (최적화된 구조)
└─────────────┘
       ↓
┌─────────────┐
│ 개발자      │ → prisma db pull (스키마 자동 생성)
└─────────────┘
```

**이점:**
- DB 전문가의 노하우 활용
- 복잡한 인덱스, 파티션 전략 가능
- 성능 최적화에 유리

### 2. 레거시 DB 연동
```
기존 DB (5년 운영 중)
  ↓
prisma db pull
  ↓
Prisma Schema 생성
  ↓
TypeScript로 안전하게 사용
```

**사례:**
- 기존 PHP/Java 프로젝트를 Node.js로 마이그레이션
- 외부 시스템 DB에 연결
- 타 팀이 관리하는 DB 사용

### 3. 빠른 프로토타이핑
```bash
# 1. DB 도구(GUI)로 빠르게 테이블 생성
# 2. Pull
npx prisma db pull
# 3. 바로 코딩 시작!
```

### 4. DB 변경사항 자동 동기화
```bash
# DB 담당자가 컬럼 추가
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

# 개발자는 Pull만
npx prisma db pull
# schema.prisma 자동 업데이트!
```

---

## ⚠️ DB First의 단점

### 1. 마이그레이션 이력 없음
```
문제: DB가 어떻게 변경되었는지 추적 불가

Schema First:
├── 20251110_create_users.sql
├── 20251115_add_email.sql
└── 20251120_add_phone.sql  ← Git으로 관리

DB First:
❌ 이력 없음! "언제, 왜 추가했지?"
```

### 2. 팀 협업 어려움
```
개발자 A의 DB: users 테이블에 phone 있음
개발자 B의 DB: users 테이블에 phone 없음
                    ↓
         서로 다른 schema.prisma
                    ↓
              Git 충돌 발생!
```

### 3. 프로덕션 배포 복잡
```
Schema First:
git pull → npx prisma migrate deploy
✅ 자동으로 DB 업데이트

DB First:
git pull → ??? (DB는 수동으로 업데이트 필요)
```

### 4. 스키마 파일이 지저분함
```prisma
// DB First로 생성하면...
model users {  // ❌ 소문자 (관례 위반)
  id         String   @default(dbgenerated("gen_random_uuid()"))  // 길고 복잡
  email      String   @db.VarChar(255)  // DB 타입이 그대로

  @@map("users")  // 자동 추가됨
}

// Schema First로 작성하면...
model User {  // ✅ 대문자 (관례)
  id    String @id @default(uuid())  // 간결
  email String @unique  // 깔끔

  @@map("users")
}
```

---

## 🎯 실전 운영 방식 (하이브리드)

### 추천: Schema First + DB Pull 조합

```
┌──────────────────────────────────┐
│  일반 개발: Schema First         │
│  schema.prisma → migrate → DB    │
└──────────────────────────────────┘
              ↓
┌──────────────────────────────────┐
│  긴급/특수 상황: DB First        │
│  DB → db pull → schema.prisma    │
└──────────────────────────────────┘
```

### 시나리오별 전략

#### Case 1: 신규 프로젝트 (처음부터)
```
✅ Schema First 사용

이유:
- 마이그레이션 이력 관리
- 팀 협업 용이
- 배포 자동화
```

#### Case 2: 레거시 DB 있는 프로젝트
```
✅ DB First로 시작 → Schema First로 전환

1단계: 기존 DB 가져오기
npx prisma db pull

2단계: 이후 변경은 Schema First
npx prisma migrate dev
```

#### Case 3: DBA가 DB 직접 관리
```
✅ DB First 사용 + 수동 동기화

DBA: DDL 실행
   ↓
개발자: npx prisma db pull
   ↓
Git 커밋
```

#### Case 4: 외부 DB 연동 (읽기 전용)
```
✅ DB First만 사용

외부 DB (변경 불가)
   ↓
npx prisma db pull
   ↓
읽기 전용 사용
```

---

## 📝 실제 사용 예시

### 시나리오: DBA가 최종 DDL 전달

```sql
-- DBA가 전달한 DDL
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount DECIMAL(10,2),
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
```

### 방법 1: DB First (빠름, 이력 없음)

```bash
# 1. DDL을 DB에 직접 실행
psql -d moa -f final_schema.sql

# 2. Prisma Schema 자동 생성
npx prisma db pull

# 3. 모델 이름 정리 (선택)
# schema.prisma에서 users → User로 수동 변경

# 4. TypeScript 타입 생성
npx prisma generate

# 5. 바로 사용!
const user = await prisma.user.findUnique({ where: { id } });
```

**소요 시간: 5분**

### 방법 2: Schema First (느림, 이력 있음)

```prisma
// 1. DDL을 보고 schema.prisma 직접 작성
model User {
  id        String   @id @default(uuid())
  email     String   @unique @db.VarChar(255)
  name      String   @db.VarChar(100)
  phone     String?  @db.VarChar(20)
  createdAt DateTime @default(now()) @map("created_at")

  orders    Order[]

  @@map("users")
}

model Order {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  amount    Decimal  @db.Decimal(10, 2)
  status    String   @db.VarChar(20)
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([status])
  @@map("orders")
}
```

```bash
# 2. 마이그레이션 생성
npx prisma migrate dev --name "init_from_ddl"

# 3. 사용
const user = await prisma.user.findUnique({ where: { id } });
```

**소요 시간: 20-30분**
**장점: Git 이력 있음**

---

## 🔀 전환 시나리오

### DB First → Schema First 전환

```bash
# 현재 상황: DB First로 개발 중
# 앞으로는 Schema First로 전환하고 싶음

# 1. 현재 DB 상태를 마이그레이션 이력으로 생성
npx prisma migrate dev --name "baseline" --create-only

# 2. 이후부터는 Schema First
# schema.prisma 수정 → migrate dev
```

### Schema First → DB First 확인

```bash
# Schema First로 개발 중
# DB가 정말 동기화됐는지 확인하고 싶음

# DB에서 현재 상태 가져오기
npx prisma db pull --force

# schema.prisma와 비교
git diff prisma/schema.prisma
```

---

## ⚡ 명령어 비교

| 작업 | Schema First | DB First |
|------|-------------|----------|
| 테이블 추가 | schema.prisma 수정 → `migrate dev` | DDL 실행 → `db pull` |
| 컬럼 추가 | schema.prisma 수정 → `migrate dev` | DDL 실행 → `db pull` |
| 관계 추가 | schema.prisma 수정 → `migrate dev` | DDL 실행 → `db pull` |
| 팀 동기화 | `git pull` → `migrate deploy` | `git pull` → DB 수동 동기화 |
| 배포 | `migrate deploy` | 수동 DDL 실행 |

---

## 🎓 실무 팁

### 1. DB First로 시작했다면

```bash
# 프로젝트 시작 시 한 번만
npx prisma db pull

# schema.prisma 정리 (모델명 대문자로 등)
# 수동 수정...

# 이후 마이그레이션 생성 (이력 시작)
npx prisma migrate dev --name "baseline"

# 이제부터 Schema First로 계속
```

### 2. 주기적으로 검증

```bash
# Schema와 DB가 정말 동기화됐는지 확인
npx prisma db pull --force --print

# 차이가 있다면 누군가 DB를 직접 수정한 것
git diff
```

### 3. 문서화

```typescript
// schema.prisma 상단에 주석
// ============================================
// 이 프로젝트는 DB First 방식을 사용합니다
// DB 변경 후 반드시 'npx prisma db pull' 실행
// ============================================
```

---

## 📋 체크리스트

### DB First 방식이 적합한 경우

- [ ] DBA가 별도로 있는 조직
- [ ] 레거시 DB를 연동해야 함
- [ ] 외부 시스템 DB를 읽어야 함
- [ ] DB 설계가 먼저 확정됨
- [ ] 복잡한 DB 최적화가 필요함

### Schema First 방식이 적합한 경우

- [ ] 신규 프로젝트
- [ ] 개발자가 DB를 직접 관리
- [ ] 팀 협업이 중요함
- [ ] 마이그레이션 이력이 필요함
- [ ] CI/CD 자동화가 필요함

---

## 🎯 결론 및 권장사항

### 귀사 프로젝트의 경우

#### 현재 상황
```
- 개발 진행 중
- DB 구조가 계속 변경됨
- 팀 프로젝트
```

#### 권장 방식
```
✅ Schema First 유지 (현재 방식)

이유:
1. 팀 협업에 유리
2. Git으로 변경 이력 관리
3. 자동 배포 가능
4. 이미 migrations/ 폴더에 23개 이력 쌓임
```

#### 만약 DBA가 최종 DDL을 준다면?

**방법 1: DB First로 한 번만 Pull (추천)**
```bash
# DBA가 준 DDL 실행
psql -d moa -f final_ddl.sql

# Pull로 schema.prisma 업데이트
npx prisma db pull

# 이후 수정사항은 Schema First
npx prisma migrate dev --name "update_from_dba"
```

**방법 2: Schema First 유지**
```prisma
// DDL을 보고 schema.prisma 수동 작성
// 시간은 걸리지만 이력 관리 가능
```

---

## 📚 주요 명령어

```bash
# DB → Schema (DB First)
npx prisma db pull                    # DB에서 스키마 가져오기
npx prisma db pull --force            # 강제로 덮어쓰기
npx prisma db pull --print            # 결과만 출력 (파일 변경 안 함)

# Schema → DB (Schema First)
npx prisma migrate dev                # 개발 환경 마이그레이션
npx prisma migrate deploy             # 프로덕션 배포
npx prisma db push                    # 마이그레이션 없이 직접 반영

# 검증
npx prisma validate                   # 스키마 문법 검사
npx prisma format                     # 스키마 포맷팅
```

---

## 💡 최종 답변

질문: "최종 DDL 받아서 Prisma 생성하는 것도 방법인가?"

**답:** ✅ **네, 완전히 가능하고 실제로 사용되는 방법입니다!**

```bash
# DBA가 준 DDL 실행
psql -d moa < final_schema.sql

# Prisma Schema 자동 생성
npx prisma db pull

# TypeScript 타입 생성
npx prisma generate

# 끝! 바로 사용 가능
```

**하지만 현재 프로젝트는:**
- 이미 Schema First로 23개 마이그레이션 쌓임
- 팀 프로젝트
- 계속 변경 중

→ **Schema First 유지 권장**

**타협안:**
- DBA DDL 받으면 → `db pull`로 확인
- 차이점 확인 후 → `schema.prisma` 수정
- 마이그레이션 생성 → 이력 유지

**작성일**: 2024-11-20
**프로젝트**: MOA Backend
