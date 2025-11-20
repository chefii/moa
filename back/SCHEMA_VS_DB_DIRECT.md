# Prisma Schema vs DB 직접 변경 비교

## 📊 비교 표

| 구분 | Schema 사용 (Prisma) | DB 직접 변경 (SQL) |
|------|---------------------|-------------------|
| **변경 이력** | ✅ Git으로 관리 | ❌ 이력 없음 |
| **타입 안전성** | ✅ TypeScript 자동 생성 | ❌ 수동 타입 작성 |
| **팀 협업** | ✅ 자동 동기화 | ❌ 수동 공유 필요 |
| **롤백** | ✅ 쉬움 | ❌ 어려움 |
| **배포** | ✅ 자동화 가능 | ❌ 수동 실행 |
| **문서화** | ✅ 스키마가 곧 문서 | ❌ 별도 문서 필요 |
| **실수 방지** | ✅ 검증 기능 | ❌ 실수 위험 큼 |
| **속도** | ⚠️ 약간 느림 | ✅ 빠름 |

---

## 1️⃣ Prisma Schema 사용 (권장 ✅)

### 작업 흐름

```bash
# 1단계: schema.prisma 수정
model User {
  id    String @id @default(uuid())
  email String @unique
  name  String
  age   Int?   # ← 새로 추가
}

# 2단계: 마이그레이션 생성
npx prisma migrate dev --name "add_user_age"

# 3단계: 자동으로 실행됨
# - SQL 파일 생성
# - DB에 적용
# - TypeScript 타입 생성
```

### 생성되는 것들

```
✅ prisma/migrations/20251120_add_user_age/migration.sql
✅ node_modules/@prisma/client (TypeScript 타입)
✅ Git 이력
```

### 장점

#### 1. 변경 이력 관리 (버전 관리)

```
prisma/migrations/
├── 20251110_create_users/
│   └── migration.sql
├── 20251115_add_user_email/
│   └── migration.sql
└── 20251120_add_user_age/
    └── migration.sql
```

**이점:**
- 언제, 무엇을, 왜 변경했는지 기록
- Git으로 관리되어 팀원과 공유
- 특정 시점으로 되돌리기 가능

#### 2. TypeScript 타입 자동 생성

```typescript
// ❌ DB 직접 변경 시
interface User {
  id: string;
  email: string;
  name: string;
  age?: number;  // 수동으로 추가해야 함 (놓칠 수 있음!)
}

// ✅ Prisma 사용 시 (자동 생성)
const user = await prisma.user.findUnique({
  where: { id: '123' }
});
// user.age 타입이 자동으로 number | null
```

**컴파일 시점에 에러 발견:**
```typescript
// DB에 age 컬럼을 추가했지만 타입을 안 고쳤다면?
const age: number = user.age;  // ✅ Prisma: 컴파일 에러
                                // ❌ 직접변경: 런타임 에러
```

#### 3. 팀 협업이 쉬움

```bash
# 팀원 A가 스키마 변경 후 Push
git push

# 팀원 B가 Pull
git pull
npx prisma migrate deploy  # ← 한 줄로 동기화 완료!
```

**DB 직접 변경 시:**
```bash
# 팀원 A가 DB 변경
psql -c "ALTER TABLE users ADD COLUMN age INTEGER"

# 팀원 B는...?
# 1. 슬랙/이메일로 공지 받음
# 2. SQL 복붙해서 실행
# 3. 타입 파일도 직접 수정
# 4. 실수로 빠뜨리면 버그 발생
```

#### 4. 환경별 관리 용이

```bash
# 로컬 개발 DB
npx prisma migrate dev

# 스테이징 서버
npx prisma migrate deploy

# 프로덕션 서버
npx prisma migrate deploy

# ✅ 모든 환경이 동일한 스키마 보장
```

#### 5. 검증 기능

```bash
# 스키마 문법 오류 확인
npx prisma validate

# 예: 오타 발견
model User {
  ide String @id  # ← "ide"는 오타! 바로 에러 표시
}

# Error: Field "ide" is invalid
```

#### 6. 롤백이 쉬움

```bash
# 잘못된 마이그레이션 적용했다면?
git revert HEAD
npx prisma migrate deploy

# ✅ 이전 상태로 복구!
```

---

## 2️⃣ DB 직접 변경 (비권장 ❌)

### 작업 흐름

```sql
-- SQL 툴에서 직접 실행
ALTER TABLE users ADD COLUMN age INTEGER;
```

### 단점

#### 1. 이력이 없음

```bash
# 3개월 후...
동료: "이 age 컬럼은 언제, 왜 추가했죠?"
나: "음... 기억이 안 나는데요?" 🤔
```

#### 2. 타입 불일치 위험

```typescript
// DB에는 age 컬럼이 있는데
// TypeScript 타입은 업데이트 안 함

const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
console.log(user.age);  // ✅ 실행은 됨
                         // ❌ 하지만 타입 체크 안 됨
                         // ❌ IDE 자동완성 안 됨

// 나중에 누군가 age를 삭제했는데 모르고 사용
console.log(user.age);  // 💥 런타임 에러!
```

#### 3. 팀원 동기화 어려움

```
개발자 A의 DB: users 테이블에 age 있음
개발자 B의 DB: users 테이블에 age 없음
                           ↓
                    B가 코드 실행 시 에러!
```

#### 4. 프로덕션 배포 위험

```bash
# 개발자가 로컬 DB에서만 변경
ALTER TABLE users ADD COLUMN age INTEGER;

# 프로덕션 배포 시
# 1. SQL 실행을 깜빡함 → 💥 서버 에러
# 2. 순서가 잘못됨 → 💥 서버 에러
# 3. SQL 오타 → 💥 서버 에러
```

#### 5. 복잡한 변경 시 실수

```sql
-- 컬럼 타입 변경하려면...
ALTER TABLE users ALTER COLUMN age TYPE VARCHAR(10);  -- ❌ 데이터 손실!

-- 관계 변경하려면...
ALTER TABLE posts DROP CONSTRAINT posts_author_id_fkey;
ALTER TABLE posts ADD CONSTRAINT posts_author_id_fkey
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;
-- ❌ CASCADE를 빠뜨리면?
-- ❌ 순서가 잘못되면?
```

---

## 3️⃣ 실전 시나리오 비교

### 시나리오 1: 컬럼 추가

#### Prisma Schema 방식 ✅

```prisma
// 1. schema.prisma 수정 (5초)
model User {
  id    String @id @default(uuid())
  email String @unique
  age   Int?   # ← 추가
}
```

```bash
# 2. 마이그레이션 (10초)
npx prisma migrate dev --name "add_user_age"
```

```typescript
// 3. 바로 사용 가능! (타입 자동 완성)
const user = await prisma.user.create({
  data: {
    email: 'test@example.com',
    age: 25,  // ✅ 자동완성 됨
  }
});
```

**총 소요 시간: 15초**
**에러 가능성: 거의 없음**

#### DB 직접 변경 방식 ❌

```sql
-- 1. SQL 실행 (30초)
ALTER TABLE users ADD COLUMN age INTEGER;
```

```typescript
// 2. 타입 파일 찾아서 수정 (1분)
interface User {
  id: string;
  email: string;
  age: number | null;  // ← 수동 추가
}
```

```typescript
// 3. 사용
const user = await db.query(
  'INSERT INTO users (email, age) VALUES ($1, $2)',
  ['test@example.com', 25]
);
// ❌ 자동완성 안 됨
// ❌ 오타 가능성
```

**총 소요 시간: 2-3분**
**에러 가능성: 높음 (타입 불일치, SQL 오타 등)**

---

### 시나리오 2: 테이블 관계 변경

#### Prisma Schema 방식 ✅

```prisma
model Post {
  id       String @id @default(uuid())
  title    String
  authorId String @map("author_id")

  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
  //                                                              ↑ Cascade 추가
}
```

```bash
npx prisma migrate dev --name "add_cascade_delete"
```

**자동으로:**
- SQL 생성
- 기존 제약조건 삭제
- 새 제약조건 추가
- 순서 보장

#### DB 직접 변경 방식 ❌

```sql
-- 1. 기존 제약조건 이름 찾기 (어려움!)
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'posts' AND constraint_type = 'FOREIGN KEY';

-- 2. 삭제
ALTER TABLE posts DROP CONSTRAINT posts_author_id_fkey;

-- 3. 재생성
ALTER TABLE posts ADD CONSTRAINT posts_author_id_fkey
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;

-- ❌ 복잡함
-- ❌ 제약조건 이름이 다르면?
-- ❌ 순서가 잘못되면?
```

---

### 시나리오 3: 컬럼명 변경

#### Prisma Schema 방식 ✅

```prisma
model User {
  id       String @id @default(uuid())
  email    String @unique
  fullName String @map("full_name")  // username → fullName
}
```

```bash
npx prisma migrate dev --name "rename_username_to_fullname"
```

**Prisma가 자동으로:**
```sql
-- 데이터 유지하면서 안전하게 변경
ALTER TABLE users RENAME COLUMN username TO full_name;
```

#### DB 직접 변경 방식 ❌

```sql
-- 1. SQL 실행
ALTER TABLE users RENAME COLUMN username TO full_name;
```

```typescript
// 2. 모든 코드에서 수정 필요 (놓칠 가능성 높음)
// ❌ 이전 코드
const user = await db.query('SELECT username FROM users WHERE id = $1');

// ✅ 수정 후
const user = await db.query('SELECT full_name FROM users WHERE id = $1');

// 3. 타입 파일도 수정
interface User {
  fullName: string;  // username에서 변경
}

// ❌ 하나라도 놓치면 런타임 에러!
```

---

## 4️⃣ 예외 상황: DB 직접 변경이 필요한 경우

### 1. 긴급 핫픽스

```sql
-- 프로덕션에서 급하게 인덱스 추가
CREATE INDEX idx_users_email ON users(email);

-- 나중에 schema.prisma에 반영
model User {
  email String @unique

  @@index([email])  # ← 추가
}
```

### 2. 대용량 데이터 마이그레이션

```sql
-- 1억 건 데이터 업데이트 (Prisma로는 느림)
UPDATE users SET status = 'active'
WHERE created_at < '2020-01-01' AND status IS NULL;

-- 완료 후 schema에 반영
```

### 3. 복잡한 DB 작업

```sql
-- 파티셔닝, 트리거, 프로시저 등
CREATE TABLE users_2024 PARTITION OF users
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

**하지만 이 경우에도:**
```bash
# 변경 후 꼭 스키마 동기화
npx prisma db pull  # DB → schema.prisma
```

---

## 5️⃣ 권장사항

### ✅ Prisma Schema 사용 (99% 상황)

```
일반 개발 → schema.prisma 수정 → migrate dev
```

**장점:**
- 안전함
- 팀 협업 쉬움
- 실수 방지
- 롤백 가능
- 자동화 가능

### ⚠️ DB 직접 변경 (1% 긴급 상황)

```
긴급 상황 → SQL 직접 실행 → 나중에 schema 동기화
```

**조건:**
- 프로덕션 긴급 핫픽스
- 대용량 데이터 처리
- 반드시 schema 동기화 필수!

---

## 6️⃣ 실제 사례

### Case 1: 타입 불일치로 인한 버그 🐛

```typescript
// 개발자 A: DB에 age 컬럼 추가 (SQL로 직접)
// 개발자 B: 모르고 코드 작성

const user = await getUser(id);
const age = user.age.toFixed(0);  // 💥 TypeError: Cannot read property 'toFixed' of undefined

// ✅ Prisma 사용 시
const user = await prisma.user.findUnique({ where: { id } });
const age = user.age?.toFixed(0);  // 컴파일 에러로 미리 발견!
```

### Case 2: 프로덕션 배포 실패 💥

```bash
# 개발자가 로컬에서만 테스트
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

# 코드 배포
git push → CI/CD → 프로덕션 배포

# 결과: 프로덕션 DB에 phone 컬럼 없음
# 💥 서비스 다운!

# ✅ Prisma 사용 시
# migrations/ 폴더가 Git에 포함되어 자동 적용됨
```

### Case 3: 롤백 불가 😱

```sql
-- 잘못된 변경
ALTER TABLE users ALTER COLUMN email TYPE TEXT;

-- 되돌리려 해도...
-- 이전 제약조건이 뭐였지? VARCHAR(255)? VARCHAR(191)?
-- UNIQUE 제약조건도 다시 추가해야 하는데... 이름이 뭐였지?

-- ✅ Prisma 사용 시
git revert HEAD
npx prisma migrate deploy
# 끝!
```

---

## 📌 결론

| 상황 | 권장 방법 |
|------|----------|
| 일반 개발 | ✅ **Prisma Schema** |
| 팀 프로젝트 | ✅ **Prisma Schema** |
| 테스트 코드 작성 | ✅ **Prisma Schema** |
| 배포 자동화 | ✅ **Prisma Schema** |
| 긴급 핫픽스 | ⚠️ DB 직접 (+ 나중에 동기화) |
| 대용량 데이터 처리 | ⚠️ DB 직접 (+ 나중에 동기화) |

### 핵심 원칙

```
🎯 Schema가 Single Source of Truth
   (Schema가 유일한 진실의 원천)

모든 DB 변경은 Schema를 거쳐야 한다!
```

---

**작성일**: 2024-11-20
**프로젝트**: MOA Backend
