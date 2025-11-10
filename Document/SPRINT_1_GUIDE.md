# Sprint 1 가이드 (Week 1: 프로젝트 초기화)

## 📌 개요

Sprint 1은 프로젝트의 기반을 구축하는 가장 중요한 단계입니다.
이 가이드는 **옵션 3: 첫 번째 Sprint 시작**에 대한 상세 실행 가이드입니다.

**기간**: Week 1 (5-7일)
**목표**: 로컬 환경에서 Frontend/Backend 실행 가능한 상태

---

## 🎯 Sprint 목표

1. ✅ 프로젝트 환경 구축
2. ✅ Frontend (Next.js) 기본 구조 생성
3. ✅ Backend (Express/Nest.js) 기본 구조 생성
4. ✅ 데이터베이스 연결 확인
5. ✅ 개발 워크플로우 설정

---

## 📋 Day-by-Day 계획

### Day 1: 프로젝트 초기화

#### 1. Git 레포지토리 설정
```bash
# 이미 생성된 디렉토리에서
cd /Users/philip/project/socialN

# Git 초기화 (아직 안했다면)
git init

# GitHub에 레포지토리 생성 후
git remote add origin <your-github-repo-url>

# .gitignore 생성
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/
.next/
out/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Logs
logs/
*.log
npm-debug.log*

# Database
*.sqlite
*.sqlite-journal
prisma/migrations/
EOF

# 첫 커밋
git add .
git commit -m "Initial commit: Project structure"
git branch -M main
git push -u origin main
```

#### 2. 패키지 매니저 결정
**권장: pnpm** (빠르고 효율적)

```bash
# pnpm 설치 (Mac)
brew install pnpm

# 또는 npm 사용
# npm은 이미 설치되어 있음
```

---

### Day 2: Frontend 초기화 (Next.js)

#### 1. Next.js 프로젝트 생성
```bash
cd FE

# Next.js 14 프로젝트 생성
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"

# 프롬프트 응답:
# ✔ Would you like to use TypeScript? Yes
# ✔ Would you like to use ESLint? Yes
# ✔ Would you like to use Tailwind CSS? Yes
# ✔ Would you like to use `src/` directory? Yes
# ✔ Would you like to use App Router? Yes
# ✔ Would you like to customize the default import alias? Yes (@/*)
```

#### 2. 추가 패키지 설치
```bash
# UI 라이브러리
pnpm add @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react

# 상태 관리
pnpm add zustand @tanstack/react-query

# 폼 & 검증
pnpm add react-hook-form zod @hookform/resolvers

# 날짜
pnpm add date-fns

# 알림
pnpm add react-hot-toast

# API 클라이언트
pnpm add axios

# 개발 의존성
pnpm add -D @types/node
```

#### 3. shadcn/ui 초기화
```bash
# shadcn/ui CLI 실행
npx shadcn@latest init

# 프롬프트 응답:
# ✔ Which style would you like to use? › Default
# ✔ Which color would you like to use as base color? › Slate
# ✔ Would you like to use CSS variables for colors? › yes

# 기본 컴포넌트 추가
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add avatar
npx shadcn@latest add badge
```

#### 4. 폴더 구조 생성
```bash
cd src

# 폴더 생성
mkdir -p components/{ui,layout,gathering,user}
mkdir -p lib/{api,utils,hooks,validations}
mkdir -p store
mkdir -p types
mkdir -p styles
```

#### 5. 기본 설정 파일

**src/lib/utils.ts** (이미 shadcn이 생성함)
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**src/lib/api/client.ts**
```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (토큰 추가)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 (에러 핸들링)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 처리
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**src/store/authStore.ts**
```typescript
import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'BUSINESS_ADMIN' | 'USER';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, isAuthenticated: false });
  },
}));
```

**src/app/providers.tsx**
```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
```

**src/app/layout.tsx** 수정
```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "모아 - 관심사로 모이는 사람들",
  description: "적게 보여주고, 정확하게 매칭하는 AI 기반 모임 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

**src/app/page.tsx**
```typescript
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">모아</h1>
      <p className="mt-4 text-lg text-gray-600">
        관심사로 모이는 사람들
      </p>
    </main>
  );
}
```

**.env.local**
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

#### 6. 테스트 실행
```bash
pnpm dev
# http://localhost:3000 접속 확인
```

---

### Day 3: Backend 초기화 (Express)

#### 1. 프로젝트 초기화
```bash
cd BE

# package.json 생성
pnpm init

# 필수 패키지 설치
pnpm add express cors dotenv
pnpm add prisma @prisma/client
pnpm add bcrypt jsonwebtoken
pnpm add express-validator

# TypeScript 관련
pnpm add -D typescript @types/node @types/express @types/cors @types/bcrypt @types/jsonwebtoken
pnpm add -D ts-node nodemon

# 개발 도구
pnpm add -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

#### 2. TypeScript 설정
```bash
# tsconfig.json 생성
npx tsc --init
```

**tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

#### 3. 폴더 구조 생성
```bash
mkdir -p src/{modules,common,config,prisma}
mkdir -p src/modules/{auth,users,gatherings}
mkdir -p src/common/{middlewares,utils}
```

#### 4. Prisma 초기화
```bash
npx prisma init --datasource-provider postgresql
```

**prisma/schema.prisma** (간단 버전 - 전체는 DB_SCHEMA.md 참조)
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

model User {
  id                 String    @id @default(uuid())
  email              String    @unique
  password           String
  name               String
  role               Role      @default(USER)
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")

  @@map("users")
}
```

#### 5. 기본 파일 생성

**src/config/database.ts**
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
```

**src/common/middlewares/errorHandler.ts**
```typescript
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: {
      message,
      status,
    },
  });
};
```

**src/common/middlewares/auth.ts**
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

**src/modules/auth/auth.routes.ts**
```typescript
import { Router } from 'express';

const router = Router();

// Placeholder routes
router.post('/signup', (req, res) => {
  res.json({ message: 'Signup endpoint' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint' });
});

export default router;
```

**src/main.ts**
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import { errorHandler } from './common/middlewares/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use('/api/auth', authRoutes);

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
```

**package.json scripts 수정**
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/main.ts",
    "build": "tsc",
    "start": "node dist/main.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

**.env**
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/moa?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key
REFRESH_TOKEN_EXPIRES_IN=7d

# Server
PORT=4000
NODE_ENV=development
```

#### 6. 테스트 실행
```bash
pnpm dev
# http://localhost:4000/health 접속 확인
```

---

### Day 4: 데이터베이스 설정

#### 1. PostgreSQL 설치 (Docker 사용 권장)

**docker-compose.yml** (프로젝트 루트에 생성)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: moa-postgres
    environment:
      POSTGRES_USER: moa
      POSTGRES_PASSWORD: moa123
      POSTGRES_DB: moa
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: moa-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  postgres-data:
  redis-data:
```

```bash
# Docker Compose 실행
docker-compose up -d

# 확인
docker ps
```

#### 2. Prisma 마이그레이션
```bash
cd BE

# DATABASE_URL 확인
# postgresql://moa:moa123@localhost:5432/moa

# 마이그레이션 생성 및 실행
npx prisma migrate dev --name init

# Prisma Client 생성
npx prisma generate

# Prisma Studio 실행 (DB GUI)
npx prisma studio
# http://localhost:5555 접속
```

#### 3. 시딩 (선택)

**prisma/seed.ts**
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 슈퍼 관리자 생성
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@moa.kr' },
    update: {},
    create: {
      email: 'admin@moa.kr',
      password: hashedPassword,
      name: '관리자',
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Super admin created:', admin);
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

**package.json에 추가**
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

```bash
# 시드 실행
npx prisma db seed
```

---

### Day 5: 개발 워크플로우 설정

#### 1. ESLint & Prettier

**Frontend (FE)**
```bash
cd FE

# Prettier 설치
pnpm add -D prettier eslint-config-prettier eslint-plugin-prettier

# .prettierrc 생성
cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
EOF

# .eslintrc.json 수정 (extends에 추가)
# "prettier"
```

**Backend (BE)**
```bash
cd BE

# ESLint 설치
pnpm add -D eslint prettier eslint-config-prettier

# .eslintrc.json 생성
npx eslint --init

# .prettierrc (동일)
```

#### 2. Husky & lint-staged

**프로젝트 루트에서**
```bash
# Husky 설치
pnpm add -D husky lint-staged

# Husky 초기화
npx husky init

# pre-commit hook 생성
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
EOF

chmod +x .husky/pre-commit
```

**package.json에 추가**
```json
{
  "lint-staged": {
    "FE/**/*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "BE/**/*.{js,ts}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

#### 3. GitHub Actions (CI)

**.github/workflows/ci.yml**
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies (FE)
        working-directory: ./FE
        run: pnpm install

      - name: Lint (FE)
        working-directory: ./FE
        run: pnpm lint

      - name: Install dependencies (BE)
        working-directory: ./BE
        run: pnpm install

      - name: Lint (BE)
        working-directory: ./BE
        run: pnpm lint || echo "Lint script not found"
```

---

### Day 6-7: 문서화 & 첫 번째 기능

#### 1. README 작성

**프로젝트 루트 README.md**
```markdown
# 모아 (moa)

관심사로 모이는 사람들을 위한 AI 기반 모임 플랫폼

## 프로젝트 구조

- `FE/` - Frontend (Next.js 14)
- `BE/` - Backend (Express + Prisma)
- `Document/` - 프로젝트 문서

## 시작하기

### Prerequisites
- Node.js 20+
- PostgreSQL 15
- pnpm

### 로컬 개발 환경 설정

1. 레포지토리 클론
\`\`\`bash
git clone <repo-url>
cd moa
\`\`\`

2. Docker로 DB 실행
\`\`\`bash
docker-compose up -d
\`\`\`

3. Backend 설정
\`\`\`bash
cd BE
pnpm install
cp .env.example .env  # .env 파일 수정
npx prisma migrate dev
pnpm dev  # http://localhost:4000
\`\`\`

4. Frontend 설정
\`\`\`bash
cd FE
pnpm install
cp .env.local.example .env.local
pnpm dev  # http://localhost:3000
\`\`\`

## 문서

- [PRD](./Document/PRD.md)
- [RBAC](./Document/RBAC.md)
- [DB Schema](./Document/DB_SCHEMA.md)
- [Tech Stack](./Document/TECH_STACK.md)
- [Roadmap](./Document/ROADMAP.md)

## 라이선스

MIT
```

#### 2. 첫 번째 기능: Health Check 연동

**BE: src/main.ts에 이미 있음**
```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});
```

**FE: src/app/page.tsx 수정**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [serverStatus, setServerStatus] = useState<string>('checking...');

  useEffect(() => {
    fetch('http://localhost:4000/health')
      .then((res) => res.json())
      .then((data) => setServerStatus(data.message))
      .catch(() => setServerStatus('Server offline'));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">모아</h1>
      <p className="mt-4 text-lg text-gray-600">
        관심사로 모이는 사람들
      </p>
      <p className="mt-2 text-sm text-gray-500">
        서버 상태: {serverStatus}
      </p>
      <Button className="mt-4">시작하기</Button>
    </main>
  );
}
```

---

## ✅ Sprint 완료 체크리스트

Sprint 1을 완료하기 전에 다음 항목들을 확인하세요:

### 환경
- [ ] Git 레포지토리 생성 및 커밋
- [ ] Docker Compose로 PostgreSQL, Redis 실행
- [ ] 환경 변수 설정 (.env, .env.local)

### Frontend
- [ ] Next.js 프로젝트 실행 (`http://localhost:3000`)
- [ ] shadcn/ui 컴포넌트 설치 확인
- [ ] Tailwind CSS 동작 확인
- [ ] API 클라이언트 설정 완료

### Backend
- [ ] Express 서버 실행 (`http://localhost:4000`)
- [ ] `/health` 엔드포인트 접속 확인
- [ ] Prisma 마이그레이션 완료
- [ ] Prisma Studio 접속 확인

### 데이터베이스
- [ ] PostgreSQL 연결 확인
- [ ] Prisma 스키마 작성 및 마이그레이션
- [ ] 시드 데이터 생성 (선택)

### DevOps
- [ ] ESLint, Prettier 동작 확인
- [ ] Husky pre-commit hook 동작 확인
- [ ] GitHub Actions CI 설정 (선택)

### 문서
- [ ] README.md 작성
- [ ] 기획 문서 확인

---

## 🚀 다음 단계 (Sprint 2: Week 2)

Sprint 1을 완료했다면, 다음 단계는:

1. **회원가입/로그인 API 구현**
2. **JWT 인증 미들웨어**
3. **로그인 페이지 UI**
4. **회원가입 페이지 UI**

자세한 내용은 [ROADMAP.md](./ROADMAP.md)의 Week 2를 참조하세요.

---

## 🆘 트러블슈팅

### 포트 충돌
```bash
# 포트 사용 중인 프로세스 확인
lsof -i :3000  # Frontend
lsof -i :4000  # Backend
lsof -i :5432  # PostgreSQL

# 프로세스 종료
kill -9 <PID>
```

### Prisma 연결 오류
```bash
# DATABASE_URL 확인
echo $DATABASE_URL

# Prisma 재생성
npx prisma generate
npx prisma migrate reset --force
```

### Node 버전
```bash
# Node 20 설치 권장
node -v  # v20.x.x 확인

# nvm 사용 시
nvm install 20
nvm use 20
```

---

**문서 버전**: 1.0
**최종 수정일**: 2025-11-10
**작성자**: Development Team
