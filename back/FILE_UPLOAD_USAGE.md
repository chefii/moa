# 파일 업로드 시스템 사용 가이드

## 개요

이 시스템은 페이지/기능별로 다른 파일 업로드 제한사항을 설정할 수 있는 공통 파일 업로드 유틸리티입니다.

## 백엔드 구조

### 1. 파일 업로드 설정 (`src/utils/fileUploadConfig.ts`)

각 업로드 타입별로 다음과 같은 설정을 정의합니다:

- `directory`: 파일이 저장될 디렉토리 이름
- `allowedExtensions`: 허용되는 파일 확장자
- `allowedMimeTypes`: 허용되는 MIME 타입
- `maxFileSize`: 최대 파일 크기 (바이트)
- `recommendedSize`: 권장 이미지 크기 (선택적)
- `description`: 설명 (에러 메시지에 사용)

### 2. 지원하는 업로드 타입

- `banner`: 배너 이미지 (1200x400px, 최대 5MB)
- `popup`: 팝업 이미지 (600x800px, 최대 2MB)
- `event`: 이벤트 이미지 (1000x600px, 최대 3MB)
- `profile`: 프로필 이미지 (128x128px, 최대 250KB) - 카카오 디벨로퍼 기준
- `gathering`: 모임 이미지 (800x600px, 최대 2MB)
- `category`: 카테고리 아이콘 (256x256px, 최대 500KB)
- `badge`: 배지 아이콘 (128x128px, 최대 500KB)
- `review`: 리뷰 이미지 (800x600px, 최대 1MB)
- `notice`: 공지사항 첨부파일 (최대 5MB, PDF 포함)

### 3. 파일 저장 구조

```
uploads/
├── banners/
│   └── 1234567890_abc123_image.jpg
├── popups/
│   └── 1234567890_def456_image.png
├── profiles/
│   └── 1234567890_ghi789_avatar.jpg
└── ...
```

각 파일명은 다음 형식으로 저장됩니다:
`{timestamp}_{random}_{sanitized_original_name}.{ext}`

## API 사용법

### 1. 파일 업로드

```http
POST /api/files/upload/{type}
Authorization: Bearer {token}
Content-Type: multipart/form-data

파라미터:
- type: banner | popup | event | profile | gathering | category | badge | review | notice
- file: 업로드할 파일
- resize: true (선택적, 자동 리사이징)
```

응답:
```json
{
  "success": true,
  "data": {
    "id": "file-uuid",
    "originalName": "example.jpg",
    "savedName": "1234567890_abc123_example.jpg",
    "mimeType": "image/jpeg",
    "size": 102400,
    "url": "http://loaclhost:4000/uploads/banners/1234567890_abc123_example.jpg",
    "uploadedBy": "user-uuid",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### 2. 파일 삭제

```http
DELETE /api/files/{id}
Authorization: Bearer {token}
```

### 3. 업로드 설정 조회

```http
GET /api/files/config/{type}
```

응답:
```json
{
  "success": true,
  "data": {
    "allowedExtensions": [".jpg", ".jpeg", ".png"],
    "allowedMimeTypes": ["image/jpeg", "image/png"],
    "maxFileSize": 262144,
    "recommendedSize": {
      "width": 128,
      "height": 128
    },
    "description": "프로필 이미지 (JPG, PNG / 권장: 128x128px / 최대: 250KB)"
  }
}
```

## 프론트엔드 사용법

### 1. FileUpload 컴포넌트 사용

```tsx
import FileUpload from '@/components/FileUpload';
import { UploadedFile } from '@/lib/api/files';

function MyComponent() {
  const [profileImage, setProfileImage] = useState<UploadedFile | null>(null);

  return (
    <FileUpload
      uploadType="profile"
      value={profileImage}
      onChange={setProfileImage}
      autoResize={true}
      label="프로필 이미지"
      helpText="카카오 기준에 맞춰 자동으로 리사이즈됩니다."
    />
  );
}
```

### 2. 직접 API 호출

```tsx
import { filesApi } from '@/lib/api/files';

// 파일 업로드
const handleUpload = async (file: File) => {
  try {
    const uploadedFile = await filesApi.uploadFile(file, 'banner', true);
    console.log('Uploaded:', uploadedFile);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

// 파일 삭제
const handleDelete = async (fileId: string) => {
  try {
    await filesApi.deleteFile(fileId);
  } catch (error) {
    console.error('Delete failed:', error);
  }
};

// 설정 조회
const getConfig = async () => {
  const config = await filesApi.getUploadConfig('profile');
  console.log('Config:', config);
};
```

## 새로운 업로드 타입 추가하기

### 1. `fileUploadConfig.ts`에 설정 추가

```typescript
export const FILE_UPLOAD_CONFIGS: Record<FileUploadType, FileUploadConfig> = {
  // ... 기존 설정들 ...

  // 새로운 타입 추가
  myNewType: {
    directory: 'my-new-type',
    allowedExtensions: ['.jpg', '.png'],
    allowedMimeTypes: ['image/jpeg', 'image/png'],
    maxFileSize: 1 * 1024 * 1024, // 1MB
    recommendedSize: {
      width: 400,
      height: 300,
    },
    description: '새로운 타입 (JPG, PNG / 권장: 400x300px / 최대: 1MB)',
  },
};
```

### 2. TypeScript 타입에 추가

```typescript
export type FileUploadType =
  | 'banner'
  | 'popup'
  // ... 기존 타입들 ...
  | 'myNewType'; // 추가
```

### 3. 프론트엔드 타입에도 동일하게 추가

`front/src/lib/api/files.ts`의 `FileUploadType`에 동일한 타입 추가

## 파일 검증

백엔드와 프론트엔드 양쪽에서 파일을 검증합니다:

- **파일 크기**: 설정된 최대 크기 초과 여부
- **MIME 타입**: 허용된 MIME 타입인지 확인
- **파일 확장자**: 허용된 확장자인지 확인

## 이미지 자동 리사이징

`autoResize` 옵션을 사용하면 업로드 시 자동으로 권장 크기로 리사이즈됩니다:

- 권장 크기보다 큰 이미지만 리사이즈
- 비율을 유지하면서 크기 조정
- SVG 파일은 리사이즈하지 않음

## 환경 변수

`.env` 파일에 다음 변수를 설정하세요:

```env
# 파일 업로드 기본 디렉토리
UPLOAD_DIR=/Users/philip/project/moa_file

# 기본 URL (파일 URL 생성에 사용)
BASE_URL=http://loaclhost:4000
```

## 보안 고려사항

1. **인증 필수**: 모든 업로드 API는 인증이 필요합니다
2. **파일 검증**: 확장자와 MIME 타입을 모두 확인합니다
3. **파일명 보안**: 원본 파일명을 sanitize하여 저장합니다
4. **크기 제한**: Multer 레벨과 애플리케이션 레벨에서 이중 검증합니다

## 좋은 제안

### 1. 파일 메타데이터 캐싱
자주 사용되는 파일 정보는 Redis에 캐싱하여 성능 향상

### 2. CDN 연동
프로덕션 환경에서는 AWS S3, Cloudflare Images 등 CDN 사용 권장

### 3. 이미지 최적화
WebP 변환, 압축 등 추가 최적화 옵션 고려

### 4. 파일 스캔
바이러스 스캔, 악성 코드 검사 추가

### 5. 썸네일 자동 생성
대용량 이미지의 경우 여러 크기의 썸네일 자동 생성

### 6. 진행률 표시
대용량 파일 업로드 시 진행률 표시 기능 추가

### 7. 다중 파일 업로드
여러 파일을 한 번에 업로드하는 기능 추가

### 8. 파일 버전 관리
같은 파일을 여러 번 업로드할 때 버전 관리
