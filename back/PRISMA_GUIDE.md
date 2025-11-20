# Prisma 사용 가이드

## 📚 목차
1. [Prisma란?](#prisma란)
2. [디렉토리 구조](#디렉토리-구조)
3. [주요 명령어](#주요-명령어)
4. [스키마 작성](#스키마-작성)
5. [CRUD 작업](#crud-작업)
6. [마이그레이션](#마이그레이션)
7. [시딩](#시딩)
8. [트러블슈팅](#트러블슈팅)

---

## Prisma란?

**Prisma**는 Node.js/TypeScript를 위한 차세대 ORM(Object-Relational Mapping)입니다.

### 주요 특징
- ✅ **타입 안전성**: TypeScript와 완벽한 통합
- ✅ **자동 완성**: IDE에서 모든 쿼리 자동 완성
- ✅ **마이그레이션**: DB 스키마 변경 이력 관리
- ✅ **Prisma Studio**: 내장 DB 관리 GUI

---

## 디렉토리 구조

```
prisma/
├── schema.prisma              # ⭐ DB 스키마 정의 (가장 중요!)
├── migrations/                # 📦 DB 변경 이력
│   ├── 20251120000000_add_soft_delete_fields/
│   │   └── migration.sql
│   └── migration_lock.toml
├── seed-*.ts                  # 🌱 초기 데이터 스크립트
└── migrate-*.ts               # 🔧 데이터 마이그레이션 스크립트
```

---

## 주요 명령어

### 개발 중 자주 사용

```bash
# 1. 스키마 변경 후 마이그레이션 생성 및 적용
npx prisma migrate dev --name "add_user_age"

# 2. TypeScript 타입 재생성 (schema 변경 후)
npx prisma generate

# 3. DB GUI 실행 (데이터 확인/수정)
npx prisma studio

# 4. 스키마 검증
npx prisma validate

# 5. DB 초기화 (⚠️ 모든 데이터 삭제됨)
npx prisma migrate reset
```

### 프로덕션 배포

```bash
# 마이그레이션만 적용 (새로 생성 안함)
npx prisma migrate deploy

# Prisma Client 생성
npx prisma generate
```

### 상태 확인

```bash
# 마이그레이션 상태 확인
npx prisma migrate status

# DB와 스키마 동기화 확인
npx prisma db pull  # DB → schema.prisma
npx prisma db push  # schema.prisma → DB (마이그레이션 없이)
```

---

## 스키마 작성

### 기본 구조

```prisma
// prisma/schema.prisma

// 1. Generator: TypeScript 타입 생성 설정
generator client {
  provider = "prisma-client-js"
}

// 2. Datasource: DB 연결 정보
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 3. Models: 테이블 정의
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  age       Int?                           // ? = nullable
  isDeleted Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  posts     Post[]

  @@map("users")                          // 실제 테이블명
  @@index([email])                         // 인덱스
}

model Post {
  id        String   @id @default(uuid())
  title     String
  content   String   @db.Text            // 큰 텍스트
  authorId  String   @map("author_id")
  published Boolean  @default(false)

  // Relations
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@map("posts")
}
```

### 데이터 타입

```prisma
model Example {
  // 문자열
  name      String                        // VARCHAR(191)
  bio       String   @db.Text             // TEXT
  code      String   @db.VarChar(10)      // VARCHAR(10)

  // 숫자
  age       Int                           // INTEGER
  count     BigInt                        // BIGINT
  price     Decimal  @db.Decimal(10, 2)  // DECIMAL(10,2)
  rating    Float                         // DOUBLE

  // 불린
  isActive  Boolean                       // BOOLEAN

  // 날짜/시간
  createdAt DateTime @default(now())     // TIMESTAMP
  birthDate DateTime @db.Date            // DATE

  // JSON
  metadata  Json?                         // JSON

  // 배열 (PostgreSQL only)
  tags      String[]                      // TEXT[]

  // Enum
  role      Role                          // ENUM
}

enum Role {
  USER
  ADMIN
  MODERATOR
}
```

### 관계(Relation)

```prisma
// 1:1 관계
model User {
  id      String   @id @default(uuid())
  profile Profile?
}

model Profile {
  id     String @id @default(uuid())
  userId String @unique @map("user_id")
  bio    String

  user   User   @relation(fields: [userId], references: [id])
}

// 1:N 관계
model Author {
  id    String @id @default(uuid())
  name  String
  posts Post[]                   // 복수형
}

model Post {
  id       String @id @default(uuid())
  title    String
  authorId String @map("author_id")

  author   Author @relation(fields: [authorId], references: [id])
}

// M:N 관계
model Post {
  id         String         @id @default(uuid())
  title      String
  categories PostCategory[]
}

model Category {
  id    String         @id @default(uuid())
  name  String
  posts PostCategory[]
}

model PostCategory {
  postId     String   @map("post_id")
  categoryId String   @map("category_id")
  assignedAt DateTime @default(now())

  post     Post     @relation(fields: [postId], references: [id])
  category Category @relation(fields: [categoryId], references: [id])

  @@id([postId, categoryId])
  @@map("post_categories")
}
```

### 제약조건 & 인덱스

```prisma
model User {
  id       String @id @default(uuid())           // Primary Key
  email    String @unique                        // Unique
  nickname String @unique
  age      Int?
  status   String @default("active")             // Default

  @@unique([email, nickname])                    // 복합 Unique
  @@index([email])                               // 단일 인덱스
  @@index([age, status])                         // 복합 인덱스
  @@map("users")                                 // 테이블명
}
```

---

## CRUD 작업

### Create (생성)

```typescript
import { prisma } from './config/prisma';

// 단일 생성
const user = await prisma.user.create({
  data: {
    email: 'test@example.com',
    name: 'John Doe',
    age: 25,
  },
});

// 관계와 함께 생성
const userWithPosts = await prisma.user.create({
  data: {
    email: 'test@example.com',
    name: 'John Doe',
    posts: {
      create: [
        { title: 'First Post', content: 'Hello!' },
        { title: 'Second Post', content: 'World!' },
      ],
    },
  },
  include: {
    posts: true,  // 생성된 posts도 반환
  },
});

// 여러 개 생성
const users = await prisma.user.createMany({
  data: [
    { email: 'user1@example.com', name: 'User 1' },
    { email: 'user2@example.com', name: 'User 2' },
  ],
  skipDuplicates: true,  // 중복 시 건너뛰기
});
```

### Read (조회)

```typescript
// ID로 단일 조회
const user = await prisma.user.findUnique({
  where: { id: 'user-id' },
  include: { posts: true },  // 관계 포함
});

// 조건으로 단일 조회
const user = await prisma.user.findFirst({
  where: { email: 'test@example.com' },
});

// 여러 개 조회
const users = await prisma.user.findMany({
  where: {
    age: { gte: 18 },              // >= 18
    isDeleted: false,
    email: { contains: '@gmail' }, // LIKE
  },
  orderBy: { createdAt: 'desc' },
  skip: 0,                          // offset
  take: 10,                         // limit
  select: {                         // 특정 필드만
    id: true,
    name: true,
    email: true,
  },
});

// 개수 세기
const count = await prisma.user.count({
  where: { isDeleted: false },
});

// 존재 여부 확인
const exists = await prisma.user.count({
  where: { email: 'test@example.com' },
}) > 0;
```

### Update (수정)

```typescript
// 단일 수정
const user = await prisma.user.update({
  where: { id: 'user-id' },
  data: {
    name: 'New Name',
    age: 26,
  },
});

// 조건으로 여러 개 수정
const result = await prisma.user.updateMany({
  where: {
    age: { lt: 18 },
  },
  data: {
    status: 'minor',
  },
});

// Upsert (있으면 수정, 없으면 생성)
const user = await prisma.user.upsert({
  where: { email: 'test@example.com' },
  update: { name: 'Updated Name' },
  create: {
    email: 'test@example.com',
    name: 'New User',
  },
});

// 증감 연산
const post = await prisma.post.update({
  where: { id: 'post-id' },
  data: {
    viewCount: { increment: 1 },    // +1
    likeCount: { decrement: 1 },    // -1
  },
});
```

### Delete (삭제)

```typescript
// 단일 삭제
const user = await prisma.user.delete({
  where: { id: 'user-id' },
});

// 여러 개 삭제
const result = await prisma.user.deleteMany({
  where: {
    createdAt: { lt: new Date('2020-01-01') },
  },
});

// ⚠️ 소프트 삭제 (권장)
const user = await prisma.user.update({
  where: { id: 'user-id' },
  data: {
    isDeleted: true,
    deletedAt: new Date(),
  },
});
```

### 고급 쿼리

```typescript
// 관계 필터링
const users = await prisma.user.findMany({
  where: {
    posts: {
      some: {                         // 하나라도 만족
        published: true,
      },
    },
  },
});

// 중첩 조회
const users = await prisma.user.findMany({
  include: {
    posts: {
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    },
  },
});

// 집계
const result = await prisma.user.aggregate({
  _count: { id: true },
  _avg: { age: true },
  _max: { age: true },
  _min: { age: true },
  _sum: { age: true },
});

// 그룹화
const grouped = await prisma.user.groupBy({
  by: ['status'],
  _count: { id: true },
  _avg: { age: true },
});

// Raw SQL
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE age > ${18}
`;

const result = await prisma.$executeRaw`
  UPDATE users SET status = 'active' WHERE age > ${18}
`;
```

### 트랜잭션

```typescript
// 순차 트랜잭션
const result = await prisma.$transaction([
  prisma.user.create({ data: { email: 'user1@example.com', name: 'User 1' } }),
  prisma.user.create({ data: { email: 'user2@example.com', name: 'User 2' } }),
]);

// 대화형 트랜잭션
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email: 'test@example.com', name: 'Test User' },
  });

  await tx.post.create({
    data: {
      title: 'First Post',
      content: 'Hello!',
      authorId: user.id,
    },
  });

  return user;
});
```

---

## 마이그레이션

### 작업 흐름

```bash
# 1. schema.prisma 수정
# 2. 마이그레이션 생성 및 적용
npx prisma migrate dev --name "add_user_age_field"

# 3. 확인
npx prisma migrate status
```

### 마이그레이션 파일

```
prisma/migrations/
└── 20251120123456_add_user_age_field/
    └── migration.sql
```

```sql
-- migration.sql
-- AlterTable
ALTER TABLE "users" ADD COLUMN "age" INTEGER;
```

### 주의사항

1. **절대 직접 수정 금지**
   - ❌ migrations/*.sql 파일 직접 수정
   - ✅ schema.prisma만 수정 후 migrate

2. **충돌 해결**
   ```bash
   # 마이그레이션 충돌 시
   npx prisma migrate resolve --rolled-back "마이그레이션명"
   npx prisma migrate deploy
   ```

3. **프로덕션 적용**
   ```bash
   # 개발 환경에서 테스트 후
   npx prisma migrate deploy  # 프로덕션에서 실행
   ```

---

## 시딩

### Seed 스크립트 작성

```typescript
// prisma/seed-users.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding users...');

  await prisma.user.createMany({
    data: [
      {
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'ADMIN',
      },
      {
        email: 'user@example.com',
        name: 'Normal User',
        role: 'USER',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Users seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 실행

```bash
# 직접 실행
npx ts-node prisma/seed-users.ts

# package.json에 등록
{
  "prisma": {
    "seed": "ts-node prisma/seed-all.ts"
  }
}

# 등록 후 실행
npx prisma db seed
```

---

## 트러블슈팅

### 1. "prisma client가 없습니다" 에러

```bash
# 해결: Client 재생성
npx prisma generate
```

### 2. 타입이 안 맞아요

```bash
# schema.prisma 변경 후 반드시 실행
npx prisma generate
```

### 3. DB와 스키마가 안 맞아요

```bash
# 현재 DB 상태 확인
npx prisma migrate status

# 마이그레이션 적용
npx prisma migrate deploy

# 또는 DB에서 스키마 가져오기
npx prisma db pull
```

### 4. 마이그레이션 실패

```bash
# 실패한 마이그레이션 롤백으로 표시
npx prisma migrate resolve --rolled-back "20251120123456"

# 다시 적용
npx prisma migrate deploy
```

### 5. 연결이 안 돼요

```bash
# .env 파일 확인
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# 연결 테스트
npx prisma db execute --stdin <<< "SELECT 1"
```

### 6. 개발 DB 초기화

```bash
# ⚠️ 모든 데이터 삭제됨!
npx prisma migrate reset

# 또는
npx prisma db push --force-reset
```

---

## 팁 & 모범 사례

### 1. 중앙화된 Prisma 인스턴스 사용

```typescript
// ❌ 나쁜 예
const prisma = new PrismaClient();  // 각 파일마다

// ✅ 좋은 예
// src/config/prisma.ts
export const prisma = new PrismaClient();

// 다른 파일에서
import { prisma } from './config/prisma';
```

### 2. 소프트 삭제 구현

```prisma
model User {
  isDeleted Boolean  @default(false)
  deletedAt DateTime?
}
```

```typescript
// 미들웨어로 자동 필터링
prisma.$use(async (params, next) => {
  if (params.model && params.action === 'findMany') {
    params.args.where = {
      ...params.args.where,
      isDeleted: false,
    };
  }
  return next(params);
});
```

### 3. 에러 처리

```typescript
import { Prisma } from '@prisma/client';

try {
  await prisma.user.create({ data: { email: 'test@example.com' } });
} catch (e) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === 'P2002') {
      console.log('Unique constraint 위반');
    }
  }
  throw e;
}
```

### 4. 페이지네이션

```typescript
async function getUsers(page: number, pageSize: number) {
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);

  return {
    users,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
```

---

## 참고 자료

- 공식 문서: https://www.prisma.io/docs
- Prisma Studio: `npx prisma studio`
- 에러 코드: https://www.prisma.io/docs/reference/api-reference/error-reference

---

**작성일**: 2024-11-20
**프로젝트**: MOA Backend
