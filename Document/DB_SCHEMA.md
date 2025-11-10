# 데이터베이스 스키마 설계

## 📌 개요

PostgreSQL 15 + Prisma ORM 사용

---

## 🗂 ERD 다이어그램

```
users (1) ──────── (0..1) business_profiles
  │                           │
  │ (1)                       │ (1)
  │                           │
  ├── (N) gatherings ─────────┘
  │        │
  │        │ (1)
  │        │
  │        └── (N) gathering_participants ── (N) users
  │                     │
  │                     │ (1)
  │                     │
  │                     └── (N) reviews
  │
  ├── (N) user_interests ── (N) categories
  │
  ├── (N) bookmarks
  │
  └── (N) chat_messages
```

---

## 📋 테이블 상세

### 1. users (사용자)
```sql
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             VARCHAR(255) UNIQUE NOT NULL,
  password          VARCHAR(255) NOT NULL,
  name              VARCHAR(100) NOT NULL,
  profile_image     TEXT,
  bio               VARCHAR(100),
  phone             VARCHAR(20),
  role              VARCHAR(20) DEFAULT 'USER' CHECK (role IN ('SUPER_ADMIN', 'BUSINESS_ADMIN', 'USER')),
  manner_temperature DECIMAL(4,2) DEFAULT 36.5,
  attendance_rate   DECIMAL(5,2) DEFAULT 0,
  is_verified       BOOLEAN DEFAULT false,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**컬럼 설명**:
- `id`: 고유 식별자 (UUID)
- `email`: 로그인용 이메일 (unique)
- `password`: bcrypt 해시된 비밀번호
- `role`: 사용자 역할 (SUPER_ADMIN, BUSINESS_ADMIN, USER)
- `manner_temperature`: 매너 온도 (기본 36.5℃)
- `attendance_rate`: 참석률 (0-100%)
- `is_verified`: 본인인증 여부

---

### 2. business_profiles (비즈니스 프로필)
```sql
CREATE TABLE business_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name     VARCHAR(200) NOT NULL,
  business_number   VARCHAR(50) UNIQUE NOT NULL,
  business_address  TEXT NOT NULL,
  business_phone    VARCHAR(20) NOT NULL,
  business_description TEXT,
  business_image    TEXT,
  bank_name         VARCHAR(50),
  bank_account      VARCHAR(50),
  account_holder    VARCHAR(100),
  is_approved       BOOLEAN DEFAULT false,
  approved_by       UUID REFERENCES users(id),
  approved_at       TIMESTAMP,
  rejection_reason  TEXT,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX idx_business_profiles_is_approved ON business_profiles(is_approved);
```

**컬럼 설명**:
- `user_id`: users 테이블 참조 (1:1 관계)
- `business_number`: 사업자등록번호
- `is_approved`: 승인 여부 (SUPER_ADMIN이 승인)
- `approved_by`: 승인한 관리자
- `bank_account`: 정산용 계좌

---

### 3. categories (카테고리)
```sql
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(50) NOT NULL UNIQUE,
  slug        VARCHAR(50) NOT NULL UNIQUE,
  icon        VARCHAR(50),
  description TEXT,
  order       INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_is_active ON categories(is_active);
```

**초기 데이터**:
- 운동/스포츠
- 음악/공연
- 요리/베이킹
- 독서/글쓰기
- 문화예술
- 여행/아웃도어
- 언어/스터디
- 비즈니스/네트워킹
- 사이드프로젝트
- 취미/기타

---

### 4. user_interests (사용자 관심사)
```sql
CREATE TABLE user_interests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, category_id)
);

CREATE INDEX idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX idx_user_interests_category_id ON user_interests(category_id);
```

---

### 5. gatherings (모임)
```sql
CREATE TABLE gatherings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id         UUID NOT NULL REFERENCES categories(id),
  title               VARCHAR(200) NOT NULL,
  description         TEXT NOT NULL,
  gathering_type      VARCHAR(20) DEFAULT 'FREE' CHECK (gathering_type IN ('FREE', 'PAID_CLASS', 'DEPOSIT')),
  image               TEXT,
  location_address    TEXT NOT NULL,
  location_detail     VARCHAR(200),
  latitude            DECIMAL(10, 8),
  longitude           DECIMAL(11, 8),
  scheduled_at        TIMESTAMP NOT NULL,
  duration_minutes    INTEGER DEFAULT 120,
  max_participants    INTEGER NOT NULL,
  current_participants INTEGER DEFAULT 0,
  price               INTEGER DEFAULT 0,
  deposit_amount      INTEGER DEFAULT 0,
  status              VARCHAR(20) DEFAULT 'RECRUITING' CHECK (status IN ('RECRUITING', 'FULL', 'COMPLETED', 'CANCELLED')),
  tags                TEXT[],
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gatherings_host_id ON gatherings(host_id);
CREATE INDEX idx_gatherings_category_id ON gatherings(category_id);
CREATE INDEX idx_gatherings_status ON gatherings(status);
CREATE INDEX idx_gatherings_scheduled_at ON gatherings(scheduled_at);
CREATE INDEX idx_gatherings_location ON gatherings USING GIST (
  ll_to_earth(latitude, longitude)
);
```

**컬럼 설명**:
- `gathering_type`: 모임 유형
  - `FREE`: 무료 모임
  - `PAID_CLASS`: 유료 클래스
  - `DEPOSIT`: 예치금 모임
- `price`: 유료 클래스 가격
- `deposit_amount`: 예치금 (노쇼 방지)
- `status`: 모임 상태
- `tags`: 태그 배열

---

### 6. gathering_participants (모임 참여자)
```sql
CREATE TABLE gathering_participants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gathering_id    UUID NOT NULL REFERENCES gatherings(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status          VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'ATTENDED', 'NO_SHOW', 'CANCELLED')),
  deposit_paid    BOOLEAN DEFAULT false,
  deposit_refunded BOOLEAN DEFAULT false,
  payment_id      VARCHAR(100),
  joined_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  attended_at     TIMESTAMP,
  cancelled_at    TIMESTAMP,
  UNIQUE(gathering_id, user_id)
);

CREATE INDEX idx_gathering_participants_gathering_id ON gathering_participants(gathering_id);
CREATE INDEX idx_gathering_participants_user_id ON gathering_participants(user_id);
CREATE INDEX idx_gathering_participants_status ON gathering_participants(status);
```

**컬럼 설명**:
- `status`: 참여 상태
  - `PENDING`: 승인 대기
  - `CONFIRMED`: 참여 확정
  - `ATTENDED`: 출석 완료
  - `NO_SHOW`: 노쇼
  - `CANCELLED`: 취소
- `payment_id`: 결제 ID (토스페이먼츠 등)

---

### 7. reviews (리뷰)
```sql
CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gathering_id    UUID NOT NULL REFERENCES gatherings(id) ON DELETE CASCADE,
  reviewer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment         TEXT,
  reply           TEXT,
  replied_at      TIMESTAMP,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(gathering_id, reviewer_id, reviewee_id)
);

CREATE INDEX idx_reviews_gathering_id ON reviews(gathering_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
```

**컬럼 설명**:
- `reviewer_id`: 평가자 (리뷰 작성자)
- `reviewee_id`: 피평가자 (리뷰 대상)
- `rating`: 1-5점
- `reply`: 리뷰 답변 (호스트/비즈니스 관리자만)

---

### 8. chat_rooms (채팅방)
```sql
CREATE TABLE chat_rooms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gathering_id  UUID UNIQUE NOT NULL REFERENCES gatherings(id) ON DELETE CASCADE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_rooms_gathering_id ON chat_rooms(gathering_id);
```

---

### 9. chat_messages (채팅 메시지)
```sql
CREATE TABLE chat_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message     TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
```

---

### 10. bookmarks (관심 모임)
```sql
CREATE TABLE bookmarks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gathering_id  UUID NOT NULL REFERENCES gatherings(id) ON DELETE CASCADE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, gathering_id)
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_gathering_id ON bookmarks(gathering_id);
```

---

### 11. reports (신고)
```sql
CREATE TABLE reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id   UUID NOT NULL REFERENCES users(id),
  reported_id   UUID NOT NULL REFERENCES users(id),
  gathering_id  UUID REFERENCES gatherings(id),
  reason        VARCHAR(50) NOT NULL,
  description   TEXT,
  status        VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED')),
  admin_note    TEXT,
  resolved_by   UUID REFERENCES users(id),
  resolved_at   TIMESTAMP,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_reported_id ON reports(reported_id);
CREATE INDEX idx_reports_status ON reports(status);
```

---

### 12. settlements (정산)
```sql
CREATE TABLE settlements (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id UUID NOT NULL REFERENCES business_profiles(id),
  gathering_id        UUID NOT NULL REFERENCES gatherings(id),
  total_amount        INTEGER NOT NULL,
  platform_fee        INTEGER NOT NULL,
  settlement_amount   INTEGER NOT NULL,
  status              VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
  settled_at          TIMESTAMP,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settlements_business_profile_id ON settlements(business_profile_id);
CREATE INDEX idx_settlements_status ON settlements(status);
```

**컬럼 설명**:
- `total_amount`: 총 매출
- `platform_fee`: 플랫폼 수수료 (10-15%)
- `settlement_amount`: 정산 금액

---

## 🔄 Prisma Schema

### schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  SUPER_ADMIN
  BUSINESS_ADMIN
  USER
}

enum GatheringType {
  FREE
  PAID_CLASS
  DEPOSIT
}

enum GatheringStatus {
  RECRUITING
  FULL
  COMPLETED
  CANCELLED
}

enum ParticipantStatus {
  PENDING
  CONFIRMED
  ATTENDED
  NO_SHOW
  CANCELLED
}

enum ReportStatus {
  PENDING
  REVIEWING
  RESOLVED
  REJECTED
}

enum SettlementStatus {
  PENDING
  COMPLETED
  FAILED
}

model User {
  id                 String    @id @default(uuid())
  email              String    @unique
  password           String
  name               String
  profileImage       String?   @map("profile_image")
  bio                String?
  phone              String?
  role               Role      @default(USER)
  mannerTemperature  Decimal   @default(36.5) @map("manner_temperature") @db.Decimal(4, 2)
  attendanceRate     Decimal   @default(0) @map("attendance_rate") @db.Decimal(5, 2)
  isVerified         Boolean   @default(false) @map("is_verified")
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")

  // Relations
  businessProfile    BusinessProfile?
  hostedGatherings   Gathering[] @relation("HostedGatherings")
  participations     GatheringParticipant[]
  interests          UserInterest[]
  bookmarks          Bookmark[]
  sentReviews        Review[] @relation("SentReviews")
  receivedReviews    Review[] @relation("ReceivedReviews")
  chatMessages       ChatMessage[]
  sentReports        Report[] @relation("SentReports")
  receivedReports    Report[] @relation("ReceivedReports")

  @@map("users")
}

model BusinessProfile {
  id                  String    @id @default(uuid())
  userId              String    @unique @map("user_id")
  businessName        String    @map("business_name")
  businessNumber      String    @unique @map("business_number")
  businessAddress     String    @map("business_address")
  businessPhone       String    @map("business_phone")
  businessDescription String?   @map("business_description")
  businessImage       String?   @map("business_image")
  bankName            String?   @map("bank_name")
  bankAccount         String?   @map("bank_account")
  accountHolder       String?   @map("account_holder")
  isApproved          Boolean   @default(false) @map("is_approved")
  approvedBy          String?   @map("approved_by")
  approvedAt          DateTime? @map("approved_at")
  rejectionReason     String?   @map("rejection_reason")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  // Relations
  user                User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  settlements         Settlement[]

  @@map("business_profiles")
}

model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  slug        String    @unique
  icon        String?
  description String?
  order       Int       @default(0)
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")

  // Relations
  gatherings  Gathering[]
  interests   UserInterest[]

  @@map("categories")
}

model UserInterest {
  id         String   @id @default(uuid())
  userId     String   @map("user_id")
  categoryId String   @map("category_id")
  createdAt  DateTime @default(now()) @map("created_at")

  // Relations
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@unique([userId, categoryId])
  @@map("user_interests")
}

model Gathering {
  id                  String          @id @default(uuid())
  hostId              String          @map("host_id")
  categoryId          String          @map("category_id")
  title               String
  description         String
  gatheringType       GatheringType   @default(FREE) @map("gathering_type")
  image               String?
  locationAddress     String          @map("location_address")
  locationDetail      String?         @map("location_detail")
  latitude            Decimal?        @db.Decimal(10, 8)
  longitude           Decimal?        @db.Decimal(11, 8)
  scheduledAt         DateTime        @map("scheduled_at")
  durationMinutes     Int             @default(120) @map("duration_minutes")
  maxParticipants     Int             @map("max_participants")
  currentParticipants Int             @default(0) @map("current_participants")
  price               Int             @default(0)
  depositAmount       Int             @default(0) @map("deposit_amount")
  status              GatheringStatus @default(RECRUITING)
  tags                String[]
  createdAt           DateTime        @default(now()) @map("created_at")
  updatedAt           DateTime        @updatedAt @map("updated_at")

  // Relations
  host                User            @relation("HostedGatherings", fields: [hostId], references: [id], onDelete: Cascade)
  category            Category        @relation(fields: [categoryId], references: [id])
  participants        GatheringParticipant[]
  bookmarks           Bookmark[]
  reviews             Review[]
  chatRoom            ChatRoom?
  reports             Report[]
  settlements         Settlement[]

  @@map("gatherings")
}

model GatheringParticipant {
  id              String            @id @default(uuid())
  gatheringId     String            @map("gathering_id")
  userId          String            @map("user_id")
  status          ParticipantStatus @default(PENDING)
  depositPaid     Boolean           @default(false) @map("deposit_paid")
  depositRefunded Boolean           @default(false) @map("deposit_refunded")
  paymentId       String?           @map("payment_id")
  joinedAt        DateTime          @default(now()) @map("joined_at")
  attendedAt      DateTime?         @map("attended_at")
  cancelledAt     DateTime?         @map("cancelled_at")

  // Relations
  gathering       Gathering         @relation(fields: [gatheringId], references: [id], onDelete: Cascade)
  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([gatheringId, userId])
  @@map("gathering_participants")
}

model Review {
  id          String    @id @default(uuid())
  gatheringId String    @map("gathering_id")
  reviewerId  String    @map("reviewer_id")
  revieweeId  String    @map("reviewee_id")
  rating      Int
  comment     String?
  reply       String?
  repliedAt   DateTime? @map("replied_at")
  createdAt   DateTime  @default(now()) @map("created_at")

  // Relations
  gathering   Gathering @relation(fields: [gatheringId], references: [id], onDelete: Cascade)
  reviewer    User      @relation("SentReviews", fields: [reviewerId], references: [id], onDelete: Cascade)
  reviewee    User      @relation("ReceivedReviews", fields: [revieweeId], references: [id], onDelete: Cascade)

  @@unique([gatheringId, reviewerId, revieweeId])
  @@map("reviews")
}

model ChatRoom {
  id          String    @id @default(uuid())
  gatheringId String    @unique @map("gathering_id")
  createdAt   DateTime  @default(now()) @map("created_at")

  // Relations
  gathering   Gathering @relation(fields: [gatheringId], references: [id], onDelete: Cascade)
  messages    ChatMessage[]

  @@map("chat_rooms")
}

model ChatMessage {
  id        String   @id @default(uuid())
  roomId    String   @map("room_id")
  userId    String   @map("user_id")
  message   String
  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  room      ChatRoom @relation(fields: [roomId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("chat_messages")
}

model Bookmark {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  gatheringId String   @map("gathering_id")
  createdAt   DateTime @default(now()) @map("created_at")

  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  gathering   Gathering @relation(fields: [gatheringId], references: [id], onDelete: Cascade)

  @@unique([userId, gatheringId])
  @@map("bookmarks")
}

model Report {
  id          String       @id @default(uuid())
  reporterId  String       @map("reporter_id")
  reportedId  String       @map("reported_id")
  gatheringId String?      @map("gathering_id")
  reason      String
  description String?
  status      ReportStatus @default(PENDING)
  adminNote   String?      @map("admin_note")
  resolvedBy  String?      @map("resolved_by")
  resolvedAt  DateTime?    @map("resolved_at")
  createdAt   DateTime     @default(now()) @map("created_at")

  // Relations
  reporter    User         @relation("SentReports", fields: [reporterId], references: [id])
  reported    User         @relation("ReceivedReports", fields: [reportedId], references: [id])
  gathering   Gathering?   @relation(fields: [gatheringId], references: [id])

  @@map("reports")
}

model Settlement {
  id                String           @id @default(uuid())
  businessProfileId String           @map("business_profile_id")
  gatheringId       String           @map("gathering_id")
  totalAmount       Int              @map("total_amount")
  platformFee       Int              @map("platform_fee")
  settlementAmount  Int              @map("settlement_amount")
  status            SettlementStatus @default(PENDING)
  settledAt         DateTime?        @map("settled_at")
  createdAt         DateTime         @default(now()) @map("created_at")

  // Relations
  businessProfile   BusinessProfile  @relation(fields: [businessProfileId], references: [id])
  gathering         Gathering        @relation(fields: [gatheringId], references: [id])

  @@map("settlements")
}
```

---

## 📝 관련 문서

- [PRD](./PRD.md)
- [RBAC](./RBAC.md)
- [API 명세](./API_SPECIFICATION.md)

---

**문서 버전**: 1.0
**최종 수정일**: 2025-11-10
**작성자**: Backend Team
