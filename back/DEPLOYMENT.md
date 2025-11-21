# 🚀 MOA 백엔드 운영 환경 배포 가이드

## 📋 목차

1. [사전 준비사항](#사전-준비사항)
2. [서버 환경 설정](#서버-환경-설정)
3. [데이터베이스 설정](#데이터베이스-설정)
4. [애플리케이션 배포](#애플리케이션-배포)
5. [PM2로 프로세스 관리](#pm2로-프로세스-관리)
6. [Nginx 리버스 프록시 설정](#nginx-리버스-프록시-설정)
7. [SSL 인증서 설정](#ssl-인증서-설정)
8. [모니터링 및 로그 관리](#모니터링-및-로그-관리)
9. [트러블슈팅](#트러블슈팅)

---

## 사전 준비사항

### 1. 서버 요구사항

- **OS**: Ubuntu 20.04 LTS 이상 (권장)
- **RAM**: 최소 2GB, 권장 4GB 이상
- **CPU**: 최소 2 Core
- **Storage**: 최소 20GB (로그, 파일 업로드 고려)

### 2. 필요한 소프트웨어

- Node.js 18.x 이상
- PostgreSQL 14 이상
- Redis 7.x
- PM2 (프로세스 관리)
- Nginx (리버스 프록시)

### 3. 도메인 및 DNS 설정

- 도메인 구매 및 DNS 설정 완료
- 예: `api.moaim.co.kr` → 서버 IP

---

## 서버 환경 설정

### 1. 서버 접속 및 초기 설정

```bash
# SSH로 서버 접속
ssh ubuntu@your-server-ip

# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 필수 패키지 설치
sudo apt install -y curl git build-essential
```

### 2. Node.js 설치

```bash
# Node.js 18.x LTS 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 설치 확인
node -v  # v18.x.x
npm -v   # 9.x.x
```

### 3. PM2 전역 설치

```bash
sudo npm install -g pm2

# PM2 자동 시작 설정
pm2 startup
# 출력되는 명령어를 복사해서 실행
```

---

## 데이터베이스 설정

### 1. PostgreSQL 설치 및 설정

```bash
# PostgreSQL 설치
sudo apt install -y postgresql postgresql-contrib

# PostgreSQL 서비스 시작
sudo systemctl start postgresql
sudo systemctl enable postgresql

# PostgreSQL 사용자 및 데이터베이스 생성
sudo -u postgres psql

# PostgreSQL 콘솔에서 실행:
CREATE USER moa WITH PASSWORD 'strong-password-here';
CREATE DATABASE moa OWNER moa;
GRANT ALL PRIVILEGES ON DATABASE moa TO moa;
\q
```

### 2. Redis 설치 및 설정

```bash
# Redis 설치
sudo apt install -y redis-server

# Redis 설정 수정 (선택사항)
sudo nano /etc/redis/redis.conf
# bind 127.0.0.1 ::1  # 로컬에서만 접근 허용
# requirepass your-redis-password  # 비밀번호 설정 (권장)

# Redis 재시작
sudo systemctl restart redis-server
sudo systemctl enable redis-server

# Redis 연결 테스트
redis-cli ping  # PONG 출력되면 정상
```

---

## 애플리케이션 배포

### 1. 프로젝트 디렉토리 생성

```bash
# 프로젝트 디렉토리 생성
sudo mkdir -p /var/www/moa
sudo chown -R $USER:$USER /var/www/moa
cd /var/www/moa
```

### 2. Git 저장소 클론

```bash
# SSH 키 생성 (GitHub 접근용)
ssh-keygen -t ed25519 -C "your-email@example.com"
cat ~/.ssh/id_ed25519.pub  # 출력된 키를 GitHub에 등록

# Git 저장소 클론
git clone git@github.com:yourusername/moa.git .
cd back
```

### 3. 환경 변수 설정

```bash
# .env.production 파일 생성
nano .env.production
```

**⚠️ 중요: 아래 값들을 반드시 실제 운영 환경 값으로 변경하세요!**

```env
# .env.production 내용
NODE_ENV=production
PORT=4000

# Database (실제 운영 DB 정보로 변경)
DATABASE_URL="postgresql://moa:your-db-password@localhost:5432/moa?schema=public"

# Redis (실제 운영 Redis 정보로 변경)
REDIS_HOST=localhost
REDIS_PORT=6379

# CORS (실제 프론트엔드 도메인으로 변경)
CORS_ORIGIN=https://moaim.co.kr

# JWT (강력한 무작위 문자열로 변경)
# 생성: openssl rand -base64 64
JWT_SECRET=YOUR-VERY-STRONG-JWT-SECRET-HERE
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=YOUR-VERY-STRONG-REFRESH-TOKEN-SECRET-HERE
REFRESH_TOKEN_EXPIRES_IN=7d

# Bcrypt
BCRYPT_ROUNDS=12

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=/var/www/moa/uploads

# Base URL (실제 도메인으로 변경)
BASE_URL=https://api.moaim.co.kr
FRONTEND_URL=https://moaim.co.kr

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=warn
LOG_DIR=/var/log/moa
ALLOW_SENSITIVE_LOGGING=false

# Email (실제 SMTP 정보로 변경)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@moaim.co.kr

# SMS (실제 SMS API 키로 변경)
SMS_APP_KEY=your-production-sms-app-key
SMS_SECRET_KEY=your-production-sms-secret-key
SMS_SENDER=01012345678

# AWS S3 (사용 시)
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=moa-production-uploads
```

### 4. 의존성 설치 및 빌드

```bash
# Node 모듈 설치
npm ci --only=production

# TypeScript 빌드
npm run build

# Prisma 마이그레이션 실행
npx prisma migrate deploy

# Prisma Client 생성
npx prisma generate
```

### 5. 로그 및 업로드 디렉토리 생성

```bash
# 로그 디렉토리 생성
sudo mkdir -p /var/log/moa
sudo chown -R $USER:$USER /var/log/moa

# 업로드 디렉토리 생성
sudo mkdir -p /var/www/moa/uploads
sudo chown -R $USER:$USER /var/www/moa/uploads
```

---

## PM2로 프로세스 관리

### 1. PM2로 애플리케이션 시작

```bash
# PM2로 애플리케이션 시작 (운영 환경)
pm2 start ecosystem.config.js --env production

# 상태 확인
pm2 status

# 로그 확인
pm2 logs moa-api

# 모니터링
pm2 monit
```

### 2. PM2 자동 시작 설정 저장

```bash
# 현재 PM2 프로세스 목록 저장
pm2 save

# 서버 재부팅 시 자동 시작 확인
pm2 startup
# 출력되는 명령어를 실행
```

### 3. PM2 주요 명령어

```bash
# 재시작
pm2 restart moa-api

# 중지
pm2 stop moa-api

# 삭제
pm2 delete moa-api

# 로그 보기
pm2 logs moa-api --lines 100

# 로그 지우기
pm2 flush

# 프로세스 정보
pm2 describe moa-api
```

---

## Nginx 리버스 프록시 설정

### 1. Nginx 설치

```bash
sudo apt install -y nginx

# Nginx 시작
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. Nginx 설정 파일 생성

```bash
sudo nano /etc/nginx/sites-available/moa-api
```

**Nginx 설정 내용:**

```nginx
# Upstream 설정 (PM2 클러스터 모드)
upstream moa_backend {
    least_conn;  # 로드 밸런싱 알고리즘
    server 127.0.0.1:4000;
}

# HTTP → HTTPS 리다이렉트
server {
    listen 80;
    listen [::]:80;
    server_name api.moaim.co.kr;

    # Let's Encrypt 인증서 갱신용
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # 나머지는 HTTPS로 리다이렉트
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS 서버
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.moaim.co.kr;

    # SSL 인증서 (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.moaim.co.kr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.moaim.co.kr/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/api.moaim.co.kr/chain.pem;

    # SSL 설정
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 보안 헤더
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 최대 업로드 크기
    client_max_body_size 10M;

    # Gzip 압축
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 프록시 설정
    location / {
        proxy_pass http://moa_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 600s;
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
    }

    # 정적 파일 (업로드된 파일)
    location /uploads {
        alias /var/www/moa/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 헬스체크
    location /health {
        proxy_pass http://moa_backend;
        access_log off;
    }
}
```

### 3. Nginx 설정 활성화

```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/moa-api /etc/nginx/sites-enabled/

# 기본 사이트 비활성화 (선택)
sudo rm /etc/nginx/sites-enabled/default

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

---

## SSL 인증서 설정

### 1. Certbot 설치 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt install -y certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d api.moaim.co.kr

# 자동 갱신 설정 확인
sudo systemctl status certbot.timer

# 수동 갱신 테스트
sudo certbot renew --dry-run
```

---

## 모니터링 및 로그 관리

### 1. PM2 모니터링

```bash
# 실시간 모니터링
pm2 monit

# 웹 대시보드 (선택사항)
pm2 install pm2-logrotate
pm2 web
```

### 2. 로그 로테이션 설정

```bash
# logrotate 설정 생성
sudo nano /etc/logrotate.d/moa
```

```
/var/log/moa/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 ubuntu ubuntu
    sharedscripts
    postrotate
        pm2 reload moa-api > /dev/null 2>&1 || true
    endscript
}
```

### 3. 애플리케이션 로그 확인

```bash
# PM2 로그
pm2 logs moa-api

# 애플리케이션 로그
tail -f /var/log/moa/*.log

# Nginx 로그
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 트러블슈팅

### 1. 데이터베이스 연결 실패

```bash
# PostgreSQL 상태 확인
sudo systemctl status postgresql

# 연결 테스트
psql -h localhost -U moa -d moa

# pg_hba.conf 확인
sudo nano /etc/postgresql/14/main/pg_hba.conf
# 다음 라인 추가:
# local   all   moa   md5
# host    all   moa   127.0.0.1/32   md5

# PostgreSQL 재시작
sudo systemctl restart postgresql
```

### 2. Redis 연결 실패

```bash
# Redis 상태 확인
sudo systemctl status redis-server

# Redis 연결 테스트
redis-cli ping
```

### 3. Nginx 502 Bad Gateway

```bash
# 백엔드 애플리케이션 상태 확인
pm2 status

# Nginx 에러 로그 확인
sudo tail -f /var/log/nginx/error.log

# 방화벽 확인
sudo ufw status
```

### 4. 파일 업로드 실패

```bash
# 업로드 디렉토리 권한 확인
ls -la /var/www/moa/uploads

# 권한 수정
sudo chown -R $USER:$USER /var/www/moa/uploads
sudo chmod -R 755 /var/www/moa/uploads
```

---

## 배포 체크리스트

### 배포 전 확인사항

- [ ] `.env.production` 파일의 모든 설정값 확인
- [ ] JWT_SECRET, REFRESH_TOKEN_SECRET 강력한 값으로 변경
- [ ] 데이터베이스 비밀번호 변경
- [ ] CORS_ORIGIN 실제 프론트엔드 도메인으로 설정
- [ ] 도메인 DNS 설정 완료
- [ ] SSL 인증서 발급 완료
- [ ] 로그 디렉토리 생성 및 권한 설정
- [ ] 업로드 디렉토리 생성 및 권한 설정

### 배포 후 확인사항

- [ ] `pm2 status`로 애플리케이션 실행 확인
- [ ] API 헬스체크 (`https://api.moaim.co.kr/health`)
- [ ] Swagger 문서 접근 (`https://api.moaim.co.kr/api-docs`)
- [ ] 데이터베이스 연결 정상 확인
- [ ] Redis 연결 정상 확인
- [ ] 파일 업로드 테스트
- [ ] 로그 정상 기록 확인
- [ ] SSL 인증서 정상 작동 확인

---

## 유지보수

### 정기 업데이트

```bash
# 코드 업데이트
cd /var/www/moa/back
git pull origin main

# 의존성 업데이트
npm ci --only=production

# 빌드
npm run build

# 마이그레이션 (필요 시)
npx prisma migrate deploy

# PM2 재시작
pm2 restart moa-api

# 상태 확인
pm2 status
pm2 logs moa-api --lines 50
```

### 백업

```bash
# 데이터베이스 백업
pg_dump -U moa moa > backup_$(date +%Y%m%d_%H%M%S).sql

# 업로드 파일 백업
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /var/www/moa/uploads
```

---

## 추가 보안 설정

### 1. 방화벽 설정 (UFW)

```bash
# UFW 설치 및 활성화
sudo apt install -y ufw

# 기본 정책 설정
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 필요한 포트만 열기
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# 방화벽 활성화
sudo ufw enable

# 상태 확인
sudo ufw status verbose
```

### 2. Fail2Ban 설정

```bash
# Fail2Ban 설치
sudo apt install -y fail2ban

# 설정
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Fail2Ban 시작
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

---

**문의사항이나 문제가 발생하면 팀에 연락하세요!** 📞
