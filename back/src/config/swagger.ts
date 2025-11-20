import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MOA API Documentation',
      version: '1.0.0',
      description: `
## 🔐 인증 방법

**1. 토큰 발급**: \`POST /api/auth/login\` 또는 \`POST /api/auth/register\` 호출 → \`accessToken\` 받기

**2. 인증 설정**: 우측 상단 **🔓 Authorize** 클릭 → 토큰 입력 (⚠️ "Bearer " 없이 토큰만 입력) → Authorize 클릭

**3. API 호출**: 🔒 아이콘이 있는 엔드포인트 사용 가능

📝 **테스트 계정** - 일반: \`user@test.com\` / \`test1234\` | 관리자: \`admin@test.com\` / \`admin1234\`
      `,
      contact: {
        name: 'API Support',
        email: 'support@moaim.co.kr',
      },
    },
    servers: [
      {
        url: 'http://loaclhost:4000',
        description: 'Development server',
      },
      {
        url: 'https://api.moaim.co.kr',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT 토큰을 입력하세요. 형식: Bearer {token}이 아닌 {token}만 입력하면 됩니다.',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            error: {
              type: 'string',
              example: 'Detailed error information',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clx1234567890',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'asdf@asdf.com',
            },
            name: {
              type: 'string',
              example: '홍길동',
            },
            nickname: {
              type: 'string',
              nullable: true,
              example: '귀여운펭귄',
            },
            profileImage: {
              type: 'string',
              nullable: true,
              example: 'https://example.com/profile.jpg',
            },
            isVerified: {
              type: 'boolean',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
        },
      },
    },
    // 전역 security는 제거하고 각 엔드포인트에서 개별 지정
  },
  apis: ['./src/routes/**/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
