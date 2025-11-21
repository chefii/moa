/**
 * PM2 Ecosystem Configuration
 * 운영 환경에서 Node.js 프로세스 관리
 *
 * 사용법:
 * - 개발: npm run dev
 * - 운영: pm2 start ecosystem.config.js --env production
 * - 상태 확인: pm2 status
 * - 로그 확인: pm2 logs moa-api
 * - 재시작: pm2 restart moa-api
 * - 중지: pm2 stop moa-api
 * - 삭제: pm2 delete moa-api
 */

module.exports = {
  apps: [
    {
      // 애플리케이션 이름
      name: 'moa-api',

      // 실행할 파일 (TypeScript 빌드 후)
      script: './dist/main.js',

      // 인스턴스 개수
      // - 0 또는 'max': CPU 코어 수만큼 실행
      // - 숫자: 지정한 개수만큼 실행
      instances: process.env.PM2_INSTANCES || 'max',

      // 실행 모드
      // - 'cluster': 클러스터 모드 (로드 밸런싱)
      // - 'fork': 단일 인스턴스 모드
      exec_mode: 'cluster',

      // 환경 변수
      env: {
        NODE_ENV: 'development',
        PORT: 4000,
      },

      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
      },

      // 메모리 제한 (자동 재시작)
      max_memory_restart: '1G',

      // 파일 변경 감지 (개발 환경에서만 사용)
      watch: false,

      // 무시할 파일/폴더
      ignore_watch: ['node_modules', 'logs', 'uploads', '.git'],

      // 자동 재시작 설정
      autorestart: true,

      // 최대 재시작 횟수 (비정상 종료 시)
      max_restarts: 10,

      // 재시작 딜레이 (밀리초)
      restart_delay: 4000,

      // 로그 설정
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // 프로세스 시작 대기 시간 (밀리초)
      listen_timeout: 10000,

      // 프로세스 종료 대기 시간 (밀리초)
      kill_timeout: 5000,

      // cron 재시작 (선택사항)
      // cron_restart: '0 0 * * *', // 매일 자정 재시작

      // 소스 맵 사용 (TypeScript 디버깅)
      source_map_support: true,

      // 인터프리터 (Node.js)
      interpreter: 'node',

      // 인터프리터 인자
      interpreter_args: '--max-old-space-size=4096',

      // 시작 시 실행할 스크립트 (선택사항)
      // post_update: ['npm install'],
    },
  ],

  /**
   * 배포 설정 (선택사항)
   * pm2 deploy <environment> <command> 형태로 사용
   */
  deploy: {
    production: {
      // SSH 사용자
      user: 'ubuntu',

      // 서버 주소
      host: ['your-server-ip'],

      // SSH 포트
      port: '22',

      // Git 레포지토리
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/moa.git',

      // 서버 경로
      path: '/var/www/moa/back',

      // SSH 키 경로 (선택사항)
      // key: '~/.ssh/id_rsa',

      // 배포 전 실행할 명령
      'pre-deploy-local': 'echo "Deploying to production..."',

      // 배포 후 실행할 명령
      'post-deploy':
        'npm install && npm run build && pm2 reload ecosystem.config.js --env production && pm2 save',

      // 배포 환경 변수
      env: {
        NODE_ENV: 'production',
      },
    },

    staging: {
      user: 'ubuntu',
      host: ['your-staging-server-ip'],
      port: '22',
      ref: 'origin/develop',
      repo: 'git@github.com:yourusername/moa.git',
      path: '/var/www/moa-staging/back',
      'post-deploy':
        'npm install && npm run build && pm2 reload ecosystem.config.js --env staging && pm2 save',
      env: {
        NODE_ENV: 'staging',
      },
    },
  },
};
