# 🚀 모아 프로젝트 빠른 시작 가이드

이 가이드는 모아 프로젝트를 처음 실행하는 개발자를 위한 단계별 안내서입니다.

## 📋 사전 준비

다음 프로그램들이 설치되어 있어야 합니다:

1. **Node.js 20 이상**
   ```bash
   node --version  # v20.0.0 이상
   ```

2. **Docker Desktop**
   - [Docker Desktop 다운로드](https://www.docker.com/products/docker-desktop/)
   - Docker가 실행 중인지 확인:
   ```bash
   docker --version
   docker-compose --version
   ```

3. **npm** (Node.js 설치 시 자동 포함)
   ```bash
   npm --version
   ```

---

## 🎯 전체 실행 순서 (처음부터)

### Step 1: Docker Compose로 데이터베이스 실행

프로젝트 루트 디렉토리에서:

```bash
# Docker Compose 실행 (백그라운드)
docker-compose up -d

# 서비스 상태 확인
docker-compose ps
```

다음과 같은 출력이 나와야 합니다:
```
NAME                IMAGE                  STATUS
moa-postgres        postgres:15-alpine     Up
moa-redis           redis:7-alpine         Up
moa-pgadmin         dpage/pgadmin4:latest  Up
```

### Step 2: Backend 설정 및 실행

#### 2-1. 백엔드 디렉토리로 이동
```bash
cd back
```

#### 2-2. 패키지 설치
```bash
npm install
```

설치 시간: 약 1-2분 (인터넷 속도에 따라 다름)

#### 2-3. 환경 변수 설정
```bash
# .env 파일 복사
cp .env.example .env
```

> **참고**: `.env.example`에 Docker Compose 기본값이 설정되어 있으므로 수정 없이 바로 사용 가능합니다.

#### 2-4. Prisma 설정
```bash
# Prisma Client 생성
npm run prisma:generate

# 데이터베이스 마이그레이션
npm run prisma:migrate
```

마이그레이션 이름을 물어보면 `init` 또는 `initial_migration` 등으로 입력하세요.

#### 2-5. 백엔드 서버 실행
```bash
npm run dev
```

성공하면 다음과 같은 출력이 나옵니다:
```
╔═══════════════════════════════════════╗
║                                       ║
║   🎉 모아 API Server Running 🎉      ║
║                                       ║
║   Port: 4000                          ║
║   Environment: development            ║
║                                       ║
║   Health Check: http://localhost:4000/health
║   API Docs: http://localhost:4000/api    ║
║                                       ║
╚═══════════════════════════════════════╝
```

**터미널을 그대로 두고** 새 터미널을 열어 다음 단계를 진행하세요.

### Step 3: Frontend 설정 및 실행

#### 3-1. 새 터미널에서 프론트엔드 디렉토리로 이동
```bash
cd front  # 프로젝트 루트에서
```

#### 3-2. 패키지 설치
```bash
npm install
```

설치 시간: 약 2-3분

#### 3-3. 환경 변수 설정
```bash
# .env.local 파일 복사
cp .env.local.example .env.local
```

#### 3-4. 프론트엔드 서버 실행
```bash
npm run dev
```

성공하면 다음과 같은 출력이 나옵니다:
```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
- Ready in XXXms
```

### Step 4: 브라우저에서 확인

#### 4-1. 프론트엔드 접속
브라우저에서 http://localhost:3000 접속

#### 4-2. 로그인 테스트
1. 홈 화면에서 **"로그인"** 카드 클릭
2. 역할 선택:
   - **일반 사용자**: 신뢰도 시스템과 프로필 확인
   - **비즈니스 관리자**: 클래스/공간 운영 대시보드
   - **플랫폼 관리자**: 전체 시스템 관리 기능
3. 빠른 로그인 버튼 사용 또는 정보 입력 후 로그인

#### 4-3. 백엔드 API 확인
- Health Check: http://localhost:4000/health
- API 정보: http://localhost:4000/api

#### 4-4. pgAdmin으로 데이터베이스 확인 (선택)
1. http://localhost:5050 접속
2. 로그인:
   - Email: `admin@moa.com`
   - Password: `admin123`
3. 서버 추가:
   - Name: `Moa Database`
   - Host: `postgres` (Docker 내부 네트워크)
   - Port: `5432`
   - Username: `moa`
   - Password: `moa123`
   - Database: `moa`

---

## 🔧 주요 기능 테스트

### 1. 일반 사용자로 로그인
- 프로필 페이지 → 신뢰도 시스템 전체 확인
  - 성장 레벨 (7단계)
  - 뱃지 그리드 (20+ 종류)
  - 스트릭 (연속 참여)
  - 포인트 시스템
  - 순간 컬렉션
  - 관심사 숲

### 2. 비즈니스 관리자로 로그인
- 비즈니스 대시보드 → 클래스 관리
  - 통계 확인 (모임, 참여자, 수익, 평점)
  - 내 모임 목록
  - 리뷰 관리

### 3. 플랫폼 관리자로 로그인
- 관리자 대시보드 → 전체 시스템 관리
  - 플랫폼 통계
  - 사용자 관리
  - 모임 관리

---

## ⚠️ 문제 해결

### Docker 컨테이너가 실행되지 않을 때
```bash
# Docker Desktop이 실행 중인지 확인
docker ps

# 컨테이너 중지 후 재시작
docker-compose down
docker-compose up -d
```

### Backend 서버가 시작되지 않을 때
```bash
# 로그 확인
docker-compose logs postgres

# Prisma 클라이언트 재생성
npm run prisma:generate

# 마이그레이션 재실행
npm run prisma:migrate
```

### Frontend 서버가 시작되지 않을 때
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
npm install

# 캐시 삭제
rm -rf .next
npm run dev
```

### 포트가 이미 사용 중일 때
```bash
# 포트 사용 확인 (Mac/Linux)
lsof -i :3000  # Frontend
lsof -i :4000  # Backend
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# 포트 사용 확인 (Windows)
netstat -ano | findstr :3000
```

---

## 🛑 서비스 중지

### 개발 서버 중지
각 터미널에서 `Ctrl + C` 누르기

### Docker Compose 중지
```bash
# 컨테이너 중지 (데이터 유지)
docker-compose down

# 컨테이너 + 데이터 모두 삭제 (주의!)
docker-compose down -v
```

---

## 🔄 다시 시작하기

### 서비스만 재시작
```bash
# 1. Docker Compose 시작
docker-compose up -d

# 2. Backend 시작 (back 디렉토리에서)
npm run dev

# 3. Frontend 시작 (front 디렉토리에서)
npm run dev
```

### 완전 초기화 후 재시작
```bash
# 1. Docker 볼륨까지 삭제
docker-compose down -v

# 2. Docker 다시 시작
docker-compose up -d

# 3. Backend 재설정
cd back
npm run prisma:generate
npm run prisma:migrate
npm run dev

# 4. Frontend 재시작 (새 터미널)
cd front
npm run dev
```

---

## 📚 추가 자료

- [Backend README](./back/README.md) - 백엔드 상세 가이드
- [Frontend README](./front/README.md) - 프론트엔드 상세 가이드
- [신뢰도 시스템](./Document/TRUST_SYSTEM.md) - 신뢰도 시스템 문서
- [RBAC](./Document/RBAC.md) - 권한 시스템 문서

---

## 💡 유용한 명령어

### Docker
```bash
docker-compose up -d          # 서비스 시작
docker-compose down           # 서비스 중지
docker-compose ps             # 서비스 상태
docker-compose logs -f        # 실시간 로그
docker-compose restart        # 서비스 재시작
```

### Prisma
```bash
npm run prisma:studio         # Prisma Studio 실행 (GUI)
npm run prisma:generate       # Client 생성
npm run prisma:migrate        # 마이그레이션
```

### Backend
```bash
npm run dev                   # 개발 서버
npm run build                 # 빌드
npm start                     # 프로덕션 서버
```

### Frontend
```bash
npm run dev                   # 개발 서버
npm run build                 # 빌드
npm start                     # 프로덕션 서버
npm run lint                  # Lint 검사
```

---

**도움이 필요하신가요?** Issue를 등록해주세요!
