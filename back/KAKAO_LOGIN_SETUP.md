# 카카오 소셜 로그인 설정 가이드

## 🔐 카카오 로그인 API 설정 방법

카카오 로그인을 사용하기 위해서는 카카오 디벨로퍼에서 애플리케이션을 생성하고 설정해야 합니다.

---

## 1️⃣ 카카오 디벨로퍼 애플리케이션 생성

### 1. 카카오 디벨로퍼 접속
- https://developers.kakao.com 접속
- 카카오 계정으로 로그인

### 2. 애플리케이션 추가
1. **[내 애플리케이션]** 메뉴 클릭
2. **[애플리케이션 추가하기]** 버튼 클릭
3. 앱 이름: `MOA` (또는 원하는 이름)
4. 사업자명: 개인 또는 회사명 입력
5. **[저장]** 클릭

---

## 2️⃣ 앱 키 확인 및 설정

### 1. REST API 키 복사
1. **[내 애플리케이션] > [앱 설정] > [요약 정보]** 이동
2. **REST API 키** 복사
3. `.env.development` 파일에 추가:
   ```env
   KAKAO_CLIENT_ID=<복사한 REST API 키>
   ```

### 2. Client Secret 생성 (선택사항)
1. **[내 애플리케이션] > [제품 설정] > [카카오 로그인] > [보안]** 이동
2. **Client Secret 코드 생성** 클릭
3. **활성화 상태**로 변경
4. 생성된 코드 복사
5. `.env.development` 파일에 추가:
   ```env
   KAKAO_CLIENT_SECRET=<복사한 Client Secret>
   ```

---

## 3️⃣ 플랫폼 설정 (Web)

### 1. Web 플랫폼 등록
1. **[내 애플리케이션] > [앱 설정] > [플랫폼]** 이동
2. **[Web 플랫폼 등록]** 클릭
3. **사이트 도메인** 입력:
   - 개발: `http://localhost:3000`
   - 운영: `https://moaim.co.kr`
4. **[저장]** 클릭

---

## 4️⃣ Redirect URI 설정

### 1. Redirect URI 등록
1. **[내 애플리케이션] > [제품 설정] > [카카오 로그인]** 이동
2. **[Redirect URI]** 섹션에서 **[Redirect URI 등록]** 클릭
3. **Redirect URI 추가**:
   - 개발: `http://localhost:3000/auth/kakao/callback`
   - 운영: `https://moaim.co.kr/auth/kakao/callback`
4. **[저장]** 클릭

### 2. 환경 변수 설정
`.env.development` 파일에 추가:
```env
KAKAO_REDIRECT_URI=http://localhost:3000/auth/kakao/callback
```

---

## 5️⃣ 동의 항목 설정 (중요!)

### 1. 필수 동의 항목 설정
1. **[내 애플리케이션] > [제품 설정] > [카카오 로그인] > [동의 항목]** 이동
2. 다음 항목들을 **필수 동의**로 설정:

   | 동의 항목 | 설정 | 이유 |
   |---------|------|------|
   | **닉네임** | 필수 동의 | 사용자 이름으로 사용 |
   | **카카오계정(이메일)** | ⭐️ **필수 동의** | 로그인 식별자로 사용 (중요!) |
   | 프로필 사진 | 선택 동의 | 프로필 이미지로 사용 |

3. **이메일은 반드시 필수 동의로 설정!**
   - 이메일이 없으면 `"Email is required from Kakao account"` 에러 발생

### 2. 개인정보 보호 항목 수집 목적 작성
- **닉네임**: 서비스 내 사용자 식별
- **이메일**: 로그인 및 회원 식별, 서비스 알림 발송

---

## 6️⃣ 카카오 로그인 활성화

### 1. 카카오 로그인 ON
1. **[내 애플리케이션] > [제품 설정] > [카카오 로그인]** 이동
2. **[카카오 로그인 활성화]** 스위치를 **ON**으로 변경
3. **[저장]** 클릭

---

## 7️⃣ 환경 변수 최종 확인

### `.env.development` 파일
```env
# OAuth - 카카오 로그인
KAKAO_CLIENT_ID=<REST API 키>
KAKAO_CLIENT_SECRET=<Client Secret> # 선택사항
KAKAO_REDIRECT_URI=http://localhost:3000/auth/kakao/callback
KAKAO_MAP_API_KEY= # 지도 API 사용 시 추가
```

### `.env.production` 파일 (운영 환경)
```env
# OAuth - 카카오 로그인 (운영)
KAKAO_CLIENT_ID=<운영용 REST API 키>
KAKAO_CLIENT_SECRET=<운영용 Client Secret>
KAKAO_REDIRECT_URI=https://moaim.co.kr/auth/kakao/callback
KAKAO_MAP_API_KEY=<운영용 지도 API 키>
```

---

## 8️⃣ 백엔드 서버 재시작

환경 변수 변경 후 백엔드 서버를 재시작해야 합니다:

```bash
# 개발 서버 재시작
cd back
npm run dev
```

---

## 🧪 테스트 방법

### 1. 프론트엔드 카카오 로그인 버튼 클릭
```
http://localhost:3000
```

### 2. 카카오 로그인 화면 확인
- 카카오 계정으로 로그인
- **이메일 동의** 체크박스 확인 (필수로 나타나야 함)
- **동의하고 계속하기** 클릭

### 3. 로그인 성공 확인
- 콜백 URL로 리다이렉트: `http://localhost:3000/auth/kakao/callback?code=xxxxx`
- 백엔드에서 액세스 토큰 요청 성공
- 사용자 정보 조회 성공
- JWT 토큰 발급 및 로그인 완료

---

## ❌ 자주 발생하는 에러 및 해결 방법

### 1. "Failed to get Kakao access token"
**원인:**
- `KAKAO_CLIENT_ID`가 잘못됨
- `KAKAO_REDIRECT_URI`가 카카오 앱에 등록된 URI와 다름
- `KAKAO_CLIENT_SECRET`이 필요한 경우 누락

**해결:**
1. 카카오 디벨로퍼에서 REST API 키 확인
2. Redirect URI가 정확히 등록되어 있는지 확인
3. Client Secret 활성화 여부 확인

### 2. "Email is required from Kakao account"
**원인:**
- 카카오 앱의 동의 항목에서 **이메일이 필수 동의로 설정되지 않음**
- 사용자가 이메일 동의를 거부함

**해결:**
1. **[카카오 로그인] > [동의 항목]**에서 **이메일을 필수 동의로 변경**
2. 사용자에게 이메일 동의 필수임을 안내

### 3. "redirect_uri_mismatch" 에러
**원인:**
- 프론트엔드의 `redirect_uri`와 카카오 앱에 등록된 URI가 다름

**해결:**
1. 카카오 디벨로퍼에서 Redirect URI 확인
2. 정확히 `http://localhost:3000/auth/kakao/callback` 등록
3. 프로토콜(http/https), 포트 번호, 경로 모두 정확해야 함

### 4. "invalid_client" 에러
**원인:**
- `KAKAO_CLIENT_ID` 또는 `KAKAO_CLIENT_SECRET`이 잘못됨

**해결:**
1. REST API 키 재확인
2. Client Secret 재생성

---

## 📋 체크리스트

설정이 완료되면 다음 항목들을 확인하세요:

- [ ] 카카오 디벨로퍼에서 애플리케이션 생성
- [ ] REST API 키 발급 및 `.env` 파일에 `KAKAO_CLIENT_ID` 설정
- [ ] Client Secret 생성 (선택) 및 `.env` 파일에 `KAKAO_CLIENT_SECRET` 설정
- [ ] Web 플랫폼 등록 (`http://localhost:3000`)
- [ ] Redirect URI 등록 (`http://localhost:3000/auth/kakao/callback`)
- [ ] `.env` 파일에 `KAKAO_REDIRECT_URI` 설정
- [ ] ⭐️ **동의 항목에서 이메일 필수 동의로 설정** (매우 중요!)
- [ ] 카카오 로그인 활성화
- [ ] 백엔드 서버 재시작
- [ ] 프론트엔드에서 카카오 로그인 테스트

---

## 🔗 참고 링크

- [카카오 디벨로퍼 공식 문서](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [카카오 로그인 REST API](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)
- [동의 항목 설정 가이드](https://developers.kakao.com/docs/latest/ko/kakaologin/prerequisite#consent-item)

---

## 💡 팁

1. **개발과 운영 환경 분리**
   - 카카오 앱을 2개 만들어서 개발/운영 분리 가능
   - 또는 하나의 앱에 Redirect URI를 여러 개 등록

2. **Client Secret 사용**
   - 보안 강화를 위해 사용 권장
   - 활성화 후 반드시 코드 복사 (재확인 불가)

3. **이메일 필수 동의**
   - 본 서비스는 이메일을 필수로 사용하므로 반드시 필수 동의로 설정
   - 선택 동의 시 일부 사용자가 이메일을 제공하지 않아 에러 발생

4. **로컬 네트워크 테스트**
   - 모바일에서 테스트 시 `http://172.30.1.22:3000` 같은 로컬 IP도 Redirect URI에 추가
