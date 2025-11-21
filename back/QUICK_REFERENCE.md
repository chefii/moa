# Quick Reference - MOA API Production Deployment

## 🚀 Most Common Commands

### Local Development
```bash
npm run dev                           # Start development server (auto-reload)
npm run build                         # Build TypeScript to dist/
npm test                              # Run tests
```

### Production Deployment
```bash
# One-time setup
npm ci --production                   # Install dependencies
npm run build                         # Build TypeScript
pm2 start ecosystem.config.js --env production  # Start server
pm2 save                              # Save PM2 process list
pm2 startup                           # Enable auto-start on reboot

# Daily operations
pm2 restart moa-api                   # Restart (with downtime)
pm2 reload moa-api                    # Reload (zero-downtime)
pm2 stop moa-api                      # Stop server
pm2 delete moa-api                    # Remove from PM2

# Monitoring
pm2 status                            # View all processes
pm2 logs moa-api                      # View logs (live)
pm2 logs moa-api --lines 100          # Last 100 lines
pm2 logs moa-api --err                # Error logs only
pm2 monit                             # Real-time monitoring

# Process info
pm2 show moa-api                      # Detailed process info
pm2 env 0                             # View environment variables
```

## 🔍 Health Checks

### API Health
```bash
# Local
curl http://localhost:4000/health

# Production
curl https://api.moaim.co.kr/health
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

### Database
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U moa_user -d moa -h localhost -c "SELECT 1"

# Run migrations
npm run prisma:migrate:prod
```

### Redis
```bash
# Check Redis status
sudo systemctl status redis

# Test connection
redis-cli ping
```

## 📝 Environment Configuration

### Current Environment
```bash
# Check which environment is active
echo $NODE_ENV

# View loaded configuration
pm2 env 0
```

### Environment Files
- **Development**: `.env.development` (LOG_LEVEL=debug)
- **Production**: `.env.production` (LOG_LEVEL=warn)
- **Template**: `.env.example`

### Auto-detection Logic (in src/main.ts)
```
NODE_ENV=development → loads .env.development
NODE_ENV=production  → loads .env.production
NODE_ENV not set     → loads .env (fallback)
```

## 🛠️ Troubleshooting

### Server won't start
```bash
# Check logs
pm2 logs moa-api --err --lines 50

# Check environment variables
pm2 env 0 | grep DATABASE_URL
pm2 env 0 | grep JWT_SECRET

# Verify build
ls -lh dist/main.js

# Test database connection
psql -U moa_user -d moa -h localhost
```

### High memory usage
```bash
# Check current usage
pm2 monit

# Restart if needed (clears memory)
pm2 restart moa-api

# View memory limit
pm2 show moa-api | grep "max memory"
```

### Application errors
```bash
# View error logs
pm2 logs moa-api --err --lines 100

# View application logs
tail -f /var/log/moa/error.log
tail -f ./logs/pm2-error.log

# Check for crashed processes
pm2 status
```

### 502 Bad Gateway (Nginx)
```bash
# Check if app is running
pm2 status

# Check if port 4000 is listening
netstat -tlnp | grep 4000
# or
lsof -i :4000

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

## 📊 Monitoring & Logs

### Application Logs
```bash
# PM2 logs (stdout/stderr)
pm2 logs moa-api

# Winston logs (structured logging)
tail -f /var/log/moa/combined.log      # All logs
tail -f /var/log/moa/error.log         # Errors only

# Development logs
tail -f ./logs/combined.log
tail -f ./logs/error.log
```

### System Monitoring
```bash
# Real-time process monitor
pm2 monit

# Detailed process info
pm2 show moa-api

# System resources
htop                # Interactive process viewer
df -h               # Disk usage
free -h             # Memory usage
```

## 🔄 Deployment Updates

### Deploy New Code
```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm ci --production

# 3. Build TypeScript
npm run build

# 4. Run database migrations
npm run prisma:migrate:prod

# 5. Reload without downtime
pm2 reload moa-api

# 6. Verify deployment
curl http://localhost:4000/health
pm2 logs moa-api --lines 20
```

### Rollback
```bash
# 1. Checkout previous version
git checkout <previous-commit>

# 2. Rebuild
npm ci --production
npm run build

# 3. Reload
pm2 reload moa-api
```

## 🔐 Security

### Generate Secrets
```bash
# JWT_SECRET
openssl rand -base64 64

# REFRESH_TOKEN_SECRET
openssl rand -base64 64
```

### Firewall (UFW)
```bash
# Check status
sudo ufw status

# Allow ports
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS

# Enable
sudo ufw enable
```

### SSL Certificate (Let's Encrypt)
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.moaim.co.kr

# Renew (auto-renewal is enabled by default)
sudo certbot renew --dry-run
```

## 📁 Important Files

```
/Users/philip/project/moa/back/
├── .env.development              # Dev environment config
├── .env.production               # Prod environment config
├── ecosystem.config.js           # PM2 configuration
├── DEPLOYMENT.md                 # Full deployment guide
├── PRODUCTION_CHECKLIST.md       # Step-by-step checklist
├── QUICK_REFERENCE.md            # This file
├── src/main.ts                   # Entry point (env detection)
├── src/config/logger.ts          # Winston logger config
├── dist/main.js                  # Compiled entry point (PM2 runs this)
└── logs/                         # Application logs
    ├── combined.log
    ├── error.log
    ├── pm2-out.log
    └── pm2-error.log
```

## 🌐 Endpoints

### Development
- Health: http://localhost:4000/health
- API: http://localhost:4000/api
- Swagger: http://localhost:4000/api-docs

### Production
- Health: https://api.moaim.co.kr/health
- API: https://api.moaim.co.kr/api
- Swagger: https://api.moaim.co.kr/api-docs

## ⚡ Performance Tips

### PM2 Cluster Mode
```javascript
// ecosystem.config.js
instances: 'max'        // Use all CPU cores
exec_mode: 'cluster'    // Enable load balancing
```

### Database Connection Pooling
```javascript
// Already configured in src/config/prisma.ts
connectionLimit: 10
```

### Memory Management
```javascript
// ecosystem.config.js
max_memory_restart: '1G'    // Auto-restart if exceeds 1GB
```

## 📞 Support

- Deployment Guide: `DEPLOYMENT.md`
- Production Checklist: `PRODUCTION_CHECKLIST.md`
- API Documentation: `/api-docs`
- Logs: `pm2 logs moa-api` or `/var/log/moa/`
