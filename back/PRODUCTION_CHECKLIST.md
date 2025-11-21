# Production Deployment Checklist

## ✅ Completed Setup

### 1. Environment Configuration
- ✅ `.env.development` - Local development configuration
- ✅ `.env.production` - Production configuration template
- ✅ Automatic environment detection in `src/main.ts`
- ✅ Required environment variable validation

### 2. Process Management
- ✅ `ecosystem.config.js` - PM2 configuration for cluster mode
- ✅ Auto-restart on crashes
- ✅ Memory limit protection (1GB)
- ✅ Log rotation setup

### 3. Code Quality
- ✅ TypeScript compilation: **No errors**
- ✅ All console.log replaced with logger (173 changes)
- ✅ Standardized API responses
- ✅ Centralized error handling
- ✅ Removed deprecated functions

### 4. Database
- ✅ Soft delete columns added to board tables
- ✅ 140 database comments added
- ✅ Migration scripts ready

### 5. Documentation
- ✅ `DEPLOYMENT.md` - Complete deployment guide
- ✅ Swagger documentation updated

---

## ⚠️ Before Production Deployment

### 1. Update `.env.production` File
**CRITICAL**: The following values MUST be changed before deployment:

```bash
# Database - Update with actual production credentials
DATABASE_URL="postgresql://username:password@production-db-host:5432/moa?schema=public"

# Redis - Update with actual production host
REDIS_HOST=production-redis-host

# JWT Secrets - Generate strong random strings
# Generate with: openssl rand -base64 64
JWT_SECRET=CHANGE-THIS-TO-STRONG-RANDOM-SECRET-KEY-IN-PRODUCTION
REFRESH_TOKEN_SECRET=CHANGE-THIS-TO-STRONG-RANDOM-REFRESH-SECRET-KEY-IN-PRODUCTION

# Domain URLs
CORS_ORIGIN=https://moaim.co.kr
BASE_URL=https://api.moaim.co.kr
FRONTEND_URL=https://moaim.co.kr

# File Upload Directory
UPLOAD_DIR=/var/www/moa/uploads
LOG_DIR=/var/log/moa

# Optional Services (if using)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-production-email@gmail.com
SMTP_PASS=your-production-app-password

AWS_ACCESS_KEY_ID=your-production-aws-access-key
AWS_SECRET_ACCESS_KEY=your-production-aws-secret-key
AWS_S3_BUCKET=moa-production-uploads

KAKAO_CLIENT_ID=your-production-kakao-client-id
KAKAO_CLIENT_SECRET=your-production-kakao-client-secret
```

### 2. Server Setup Tasks

#### Install Required Software
```bash
# Node.js (v18 or higher)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Redis
sudo apt-get install -y redis-server

# PM2 (global)
sudo npm install -g pm2

# Nginx
sudo apt-get install -y nginx

# Build tools
sudo apt-get install -y build-essential
```

#### Create Directories
```bash
sudo mkdir -p /var/www/moa/back
sudo mkdir -p /var/www/moa/uploads
sudo mkdir -p /var/log/moa
sudo chown -R $USER:$USER /var/www/moa
sudo chown -R $USER:$USER /var/log/moa
```

### 3. Database Setup

```bash
# Create production database
sudo -u postgres psql
CREATE DATABASE moa;
CREATE USER moa_user WITH ENCRYPTED PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE moa TO moa_user;
\q

# Run migrations
npm run prisma:migrate:prod

# (Optional) Seed data
npm run prisma:seed:prod
```

### 4. Build and Deploy

```bash
# Install dependencies
npm ci --production

# Build TypeScript
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### 5. Nginx Configuration

Create `/etc/nginx/sites-available/moa-api`:

```nginx
server {
    listen 80;
    server_name api.moaim.co.kr;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and reload:
```bash
sudo ln -s /etc/nginx/sites-available/moa-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL Certificate (Let's Encrypt)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.moaim.co.kr
```

### 7. Security Hardening

```bash
# UFW Firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Fail2Ban
sudo apt-get install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 🔍 Verification

### Health Check
```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-21T...",
  "services": {
    "database": "connected",
    "cache": "connected"
  }
}
```

### PM2 Status
```bash
pm2 status
pm2 logs moa-api
pm2 monit
```

### Database Connection
```bash
psql -U moa_user -d moa -h localhost -c "SELECT 1"
```

### Redis Connection
```bash
redis-cli ping
```

---

## 📊 Monitoring

### PM2 Logs
```bash
pm2 logs moa-api --lines 100
pm2 logs moa-api --err --lines 50
```

### Application Logs
```bash
tail -f /var/log/moa/error.log
tail -f /var/log/moa/combined.log
```

### System Resources
```bash
pm2 monit
htop
df -h
free -h
```

---

## 🚨 Troubleshooting

### Application won't start
1. Check environment variables: `pm2 env 0`
2. Check logs: `pm2 logs moa-api --err`
3. Verify database connection: `psql -U moa_user -d moa -h localhost`
4. Check disk space: `df -h`

### High memory usage
1. Check PM2 logs: `pm2 monit`
2. Restart application: `pm2 restart moa-api`
3. Consider reducing instances in `ecosystem.config.js`

### Database connection errors
1. Check PostgreSQL is running: `sudo systemctl status postgresql`
2. Verify credentials in `.env.production`
3. Check firewall rules: `sudo ufw status`

### 502 Bad Gateway (Nginx)
1. Check if app is running: `pm2 status`
2. Verify port 4000 is listening: `netstat -tlnp | grep 4000`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

---

## 📝 Quick Commands

```bash
# Start production server
NODE_ENV=production pm2 start ecosystem.config.js --env production

# Restart server
pm2 restart moa-api

# Stop server
pm2 stop moa-api

# View logs
pm2 logs moa-api

# Monitor
pm2 monit

# Reload without downtime
pm2 reload moa-api

# Save PM2 configuration
pm2 save

# Delete from PM2
pm2 delete moa-api
```

---

## ✅ Final Checklist

- [ ] `.env.production` updated with real credentials
- [ ] Database created and migrated
- [ ] Redis installed and running
- [ ] PM2 installed globally
- [ ] Application built successfully (`npm run build`)
- [ ] PM2 started with production config
- [ ] Nginx configured and running
- [ ] SSL certificate installed
- [ ] Firewall configured (UFW)
- [ ] Health check returns OK
- [ ] Fail2Ban installed
- [ ] PM2 startup script configured
- [ ] Logs directory has correct permissions
- [ ] Upload directory has correct permissions
- [ ] DNS records pointing to server

---

## 📚 Additional Resources

- Full deployment guide: `DEPLOYMENT.md`
- PM2 configuration: `ecosystem.config.js`
- Environment variables: `.env.production`
- API documentation: `/api-docs` endpoint
