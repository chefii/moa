# Swagger API 문서 사용 가이드

## 📚 Swagger UI 접속

백엔드 서버 실행 후 다음 URL로 접속하세요:
- **Swagger UI**: http://loaclhost:4000/api-docs
- **Swagger JSON**: http://loaclhost:4000/api-docs.json

## 🔐 JWT 토큰 인증 방법

Swagger UI에서 인증이 필요한 API를 테스트하려면 다음 단계를 따르세요:

### 1단계: 로그인하여 토큰 획득

1. Swagger UI에서 `Authentication` 섹션을 찾습니다
2. `POST /api/auth/login` 엔드포인트를 펼칩니다
3. **Try it out** 버튼을 클릭합니다
4. Request body에 로그인 정보를 입력합니다:
   ```json
   {
     "email": "admin@example.com",
     "password": "your-password"
   }
   ```
5. **Execute** 버튼을 클릭합니다
6. 응답에서 `token` 값을 복사합니다:
   ```json
   {
     "success": true,
     "data": {
       "user": {...},
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "refreshToken": "..."
     }
   }
   ```

### 2단계: Swagger UI에 토큰 등록

1. Swagger UI 페이지 상단 우측의 **🔓 Authorize** 버튼을 클릭합니다
2. `bearerAuth` 입력창이 나타납니다
3. 복사한 토큰을 입력합니다 (**주의: "Bearer " 접두사 없이 토큰만 입력**)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. **Authorize** 버튼을 클릭합니다
5. **Close** 버튼으로 창을 닫습니다

### 3단계: 인증이 필요한 API 테스트

이제 자물쇠 아이콘(🔒)이 표시된 모든 엔드포인트를 테스트할 수 있습니다:

1. 원하는 엔드포인트를 선택합니다 (예: `GET /api/admin/users`)
2. **Try it out** 버튼을 클릭합니다
3. 필요한 파라미터를 입력합니다
4. **Execute** 버튼을 클릭합니다
5. 응답 결과를 확인합니다

## 🎯 주요 기능

### 자동 저장 (persistAuthorization)
- 한 번 입력한 토큰은 브라우저에 자동으로 저장됩니다
- 페이지를 새로고침해도 토큰이 유지됩니다
- 로그아웃하려면 🔓 Authorize 버튼에서 **Logout** 클릭

### 검색 필터
- 상단의 검색창을 사용하여 엔드포인트를 빠르게 찾을 수 있습니다
- 태그, 경로, 설명으로 검색 가능

### 요청 시간 표시
- 각 API 요청의 응답 시간이 자동으로 표시됩니다

## 🏷️ API 태그 구조

### Public APIs
- **Authentication** - 로그인, 회원가입, 토큰 관리
- **Users** - 사용자 정보 조회
- **Verification** - 이메일/전화번호 인증
- **Upload** - 파일 업로드/삭제
- **Notifications** - 알림 조회 및 관리
- **Popups** - 팝업 조회
- **Trust** - 신뢰 점수 및 배지
- **Settings** - 사이트 설정
- **Categories** - 카테고리 조회
- **Common Codes** - 공통 코드 조회

### Admin APIs (관리자 전용)
- **Admin - Users** - 사용자 관리
- **Admin - Reports** - 신고 관리
- **Admin - Banners** - 배너 관리
- **Admin - Popups** - 팝업 관리
- **Admin - Events** - 이벤트 관리
- **Admin - Notices** - 공지사항 관리
- **Admin - Categories** - 카테고리 관리
- **Admin - Common Codes** - 공통 코드 관리
- **Admin - Menu Categories** - 메뉴 카테고리 관리
- **Admin - Menu Items** - 메뉴 항목 관리

## ⚠️ 자주 발생하는 오류

### "No token provided" 오류
**원인**: 인증이 필요한 API를 토큰 없이 호출
**해결**:
1. 🔓 Authorize 버튼을 클릭
2. 로그인으로 받은 토큰을 입력
3. Authorize 버튼 클릭

### "Token expired" 오류
**원인**: 토큰의 유효기간이 만료됨
**해결**:
1. `/api/auth/refresh` 엔드포인트로 새 토큰 발급
2. 또는 다시 로그인하여 새 토큰 획득
3. 새 토큰으로 다시 인증

### "Forbidden" 또는 "Insufficient permissions" 오류
**원인**: 해당 엔드포인트에 접근할 권한이 없음
**해결**:
- 관리자 권한이 필요한 엔드포인트는 SUPER_ADMIN 또는 ADMIN 역할이 필요
- 일반 사용자 계정으로는 접근 불가

## 💡 팁

### 1. 여러 환경 테스트
Swagger 설정에서 서버를 변경할 수 있습니다:
- Development: http://loaclhost:4000
- Production: https://api.moaim.co.kr

### 2. 응답 예시 확인
각 엔드포인트의 응답 스키마를 펼쳐서 예상되는 응답 구조를 미리 확인할 수 있습니다.

### 3. curl 명령어 복사
Execute 후 나타나는 curl 명령어를 복사하여 터미널에서 직접 테스트할 수 있습니다.

### 4. 페이징 테스트
목록 조회 API는 기본적으로 페이징을 지원합니다:
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10 또는 20)

## 🔧 문제 해결

### Swagger UI가 로드되지 않는 경우
1. 백엔드 서버가 실행 중인지 확인
2. 브라우저 콘솔에서 오류 메시지 확인
3. 포트 4000이 다른 프로세스에서 사용 중인지 확인

### API 테스트가 CORS 오류를 반환하는 경우
- Swagger UI는 백엔드 서버에서 직접 제공되므로 CORS 문제가 발생하지 않아야 함
- 프론트엔드에서 직접 호출하는 경우에만 CORS 설정 필요

## 📞 지원

문제가 계속되면 개발팀에 문의하세요:
- Email: support@moaim.co.kr
- GitHub Issues: [프로젝트 저장소]
