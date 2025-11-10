# 모아 Backend

Express + TypeScript + Prisma 기반 백엔드 API 서버

## 시작하기

### 1. 패키지 설치
```bash
npm install
```

### 2. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 열어 실제 값으로 수정
```

### 3. 데이터베이스 설정
```bash
# Prisma 마이그레이션
npm run prisma:migrate

# Prisma Client 생성
npm run prisma:generate
```

### 4. 개발 서버 실행
```bash
npm run dev
```

서버가 http://localhost:4000 에서 실행됩니다.

## 스크립트

- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm start` - 프로덕션 서버 실행
- `npm run prisma:migrate` - DB 마이그레이션
- `npm run prisma:studio` - Prisma Studio 실행
- `npm run lint` - ESLint 실행
- `npm run format` - Prettier 포맷팅

## 폴더 구조

```
src/
├── modules/          # 기능 모듈
│   ├── auth/        # 인증
│   ├── users/       # 사용자
│   ├── gatherings/  # 모임
│   └── ...
├── common/          # 공통 코드
│   ├── middlewares/ # 미들웨어
│   └── utils/       # 유틸리티
├── config/          # 설정
├── prisma/          # Prisma 스키마
└── main.ts          # 진입점
```

## API 문서

상세 API 문서는 [Document/API_SPECIFICATION.md](../Document/API_SPECIFICATION.md) 참조

## 라이선스

MIT
