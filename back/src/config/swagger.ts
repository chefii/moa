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

📝 **테스트 계정** - 일반: \`user@test.com\` / \`test1234\` | 관리자: \`asdf@asdf.com\` / \`1234\`
      `,
      contact: {
        name: 'API Support',
        email: 'support@moaim.co.kr',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
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
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clx1234567890',
            },
            name: {
              type: 'string',
              example: '스포츠/운동',
            },
            displayName: {
              type: 'string',
              nullable: true,
              example: '스포츠',
            },
            slug: {
              type: 'string',
              example: 'sports',
            },
            icon: {
              type: 'string',
              nullable: true,
              example: '⚽',
            },
            color: {
              type: 'string',
              nullable: true,
              example: '#3b82f6',
            },
            imageUrl: {
              type: 'string',
              nullable: true,
              example: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
            },
            description: {
              type: 'string',
              nullable: true,
              example: '다양한 스포츠 활동 모임',
            },
            order: {
              type: 'number',
              example: 1,
            },
            depth: {
              type: 'number',
              example: 1,
            },
            type: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['GATHERING'],
            },
            isFeatured: {
              type: 'boolean',
              example: true,
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            _count: {
              type: 'object',
              properties: {
                gatherings: {
                  type: 'number',
                  example: 15,
                },
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
        },
        Gathering: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clx1234567890',
            },
            title: {
              type: 'string',
              example: '주말 축구 모임',
            },
            description: {
              type: 'string',
              example: '매주 토요일 오후에 축구하실 분 모집합니다!',
            },
            gatheringType: {
              type: 'string',
              enum: ['FREE', 'PAID_CLASS', 'DEPOSIT'],
              example: 'FREE',
            },
            imageUrl: {
              type: 'string',
              nullable: true,
              example: 'https://example.com/gathering.jpg',
            },
            locationAddress: {
              type: 'string',
              example: '서울시 강남구 테헤란로 123',
            },
            locationDetail: {
              type: 'string',
              nullable: true,
              example: '강남역 2번 출구 앞',
            },
            latitude: {
              type: 'number',
              nullable: true,
              example: 37.5665,
            },
            longitude: {
              type: 'number',
              nullable: true,
              example: 126.978,
            },
            scheduledAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-12-25T14:00:00.000Z',
            },
            durationMinutes: {
              type: 'number',
              example: 120,
            },
            maxParticipants: {
              type: 'number',
              example: 10,
            },
            currentParticipants: {
              type: 'number',
              example: 5,
            },
            price: {
              type: 'number',
              example: 0,
            },
            depositAmount: {
              type: 'number',
              example: 0,
            },
            status: {
              type: 'string',
              enum: ['RECRUITING', 'FULL', 'COMPLETED', 'CANCELLED'],
              example: 'RECRUITING',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['축구', '운동', '주말'],
            },
            host: {
              $ref: '#/components/schemas/User',
            },
            category: {
              $ref: '#/components/schemas/Category',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
        },
        BoardPost: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clx1234567890',
            },
            title: {
              type: 'string',
              example: '자유게시판 게시글 제목',
            },
            content: {
              type: 'string',
              example: '게시글 내용입니다.',
            },
            authorId: {
              type: 'string',
              example: 'clx1234567890',
            },
            categoryId: {
              type: 'string',
              nullable: true,
              example: 'clx1234567890',
            },
            viewCount: {
              type: 'number',
              example: 123,
            },
            likeCount: {
              type: 'number',
              example: 15,
            },
            commentCount: {
              type: 'number',
              example: 8,
            },
            isPinned: {
              type: 'boolean',
              example: false,
            },
            status: {
              type: 'string',
              enum: ['PUBLISHED', 'HIDDEN', 'DELETED'],
              example: 'PUBLISHED',
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['https://example.com/image1.jpg'],
            },
            author: {
              $ref: '#/components/schemas/User',
            },
            category: {
              $ref: '#/components/schemas/Category',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
        },
        File: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clx1234567890',
            },
            fileType: {
              type: 'string',
              enum: ['PROFILE', 'GATHERING', 'POST', 'EVENT', 'BANNER', 'POPUP', 'CATEGORY', 'BADGE', 'REVIEW', 'NOTICE', 'BUSINESS', 'TEMP'],
              example: 'PROFILE',
            },
            originalName: {
              type: 'string',
              example: 'my-photo.jpg',
            },
            physicalFileName: {
              type: 'string',
              nullable: true,
              example: '251117-0000001',
            },
            savedName: {
              type: 'string',
              example: '251117-0000001.jpg',
            },
            filePath: {
              type: 'string',
              example: '/uploads/profile/2024/11',
            },
            fileExtension: {
              type: 'string',
              nullable: true,
              example: '.jpg',
            },
            fileSize: {
              type: 'number',
              example: 1024000,
            },
            mimeType: {
              type: 'string',
              example: 'image/jpeg',
            },
            url: {
              type: 'string',
              example: 'https://cdn.moaim.co.kr/uploads/profile/2024/11/251117-0000001.jpg',
            },
            uploadedBy: {
              type: 'string',
              nullable: true,
              example: 'clx1234567890',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
        },
        Banner: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clx1234567890',
            },
            type: {
              type: 'string',
              enum: ['MAIN_BANNER', 'MAIN_TOP', 'MAIN_MIDDLE', 'MAIN_BOTTOM', 'EVENT', 'POPUP'],
              example: 'MAIN_BANNER',
            },
            title: {
              type: 'string',
              example: '크리스마스 특별 이벤트',
            },
            description: {
              type: 'string',
              nullable: true,
              example: '12월 한 달간 진행되는 특별 이벤트입니다.',
            },
            imageUrl: {
              type: 'string',
              nullable: true,
              example: 'https://example.com/banner.jpg',
            },
            linkUrl: {
              type: 'string',
              nullable: true,
              example: 'https://example.com/event',
            },
            order: {
              type: 'number',
              example: 1,
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              example: '2024-12-01T00:00:00.000Z',
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              example: '2024-12-31T23:59:59.000Z',
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            viewCount: {
              type: 'number',
              example: 1500,
            },
            clickCount: {
              type: 'number',
              example: 120,
            },
          },
        },
        CommonCode: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clx1234567890',
            },
            groupCode: {
              type: 'string',
              example: 'ROLE',
            },
            code: {
              type: 'string',
              example: 'SUPER_ADMIN',
            },
            name: {
              type: 'string',
              example: '슈퍼 관리자',
            },
            description: {
              type: 'string',
              nullable: true,
              example: '시스템 전체 권한을 가진 최고 관리자',
            },
            value: {
              type: 'string',
              nullable: true,
              example: '999',
            },
            order: {
              type: 'number',
              example: 1,
            },
            isActive: {
              type: 'boolean',
              example: true,
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
