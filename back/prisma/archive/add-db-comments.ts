import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addDatabaseComments() {
  console.log('📝 데이터베이스 테이블 및 컬럼 코멘트 추가 시작...\n');

  try {
    // ============================================
    // 테이블 코멘트
    // ============================================
    console.log('1️⃣  테이블 코멘트 추가 중...\n');

    const tableComments = [
      { table: 'users', comment: '사용자 기본 정보 테이블' },
      { table: 'user_roles', comment: '사용자 역할 매핑 테이블 (다중 역할 지원)' },
      { table: 'user_levels', comment: '사용자 레벨 및 성장 포인트 테이블' },
      { table: 'user_points', comment: '사용자 포인트 적립/사용 내역 테이블' },
      { table: 'user_badges', comment: '사용자 배지 획득 내역 테이블' },
      { table: 'user_streaks', comment: '사용자 연속 활동 기록 테이블' },
      { table: 'user_interests', comment: '사용자 관심 카테고리 테이블' },
      { table: 'business_profiles', comment: '사업자 프로필 정보 테이블' },
      { table: 'categories', comment: '카테고리 테이블 (모임, 게시판, 관심사 등 계층 구조)' },
      { table: 'gatherings', comment: '모임 정보 테이블' },
      { table: 'gathering_participants', comment: '모임 참가자 테이블' },
      { table: 'reviews', comment: '모임 후기 및 평가 테이블' },
      { table: 'bookmarks', comment: '모임 북마크 테이블' },
      { table: 'chat_rooms', comment: '모임별 채팅방 테이블' },
      { table: 'chat_messages', comment: '채팅 메시지 테이블' },
      { table: 'reports', comment: '신고 테이블 (사용자/모임 신고)' },
      { table: 'settlements', comment: '사업자 정산 내역 테이블' },
      { table: 'badges', comment: '배지 마스터 테이블' },
      { table: 'moment_collections', comment: '순간 수집 테이블 (특별한 순간 기록)' },
      { table: 'interest_forest', comment: '관심사 숲 테이블 (카테고리별 참여 성장 기록)' },
      { table: 'common_codes', comment: '공통 코드 테이블 (시스템 설정값 관리)' },
      { table: 'files', comment: '파일 마스터 테이블 (모든 파일 정보 중앙 관리)' },
      { table: 'file_sequences', comment: '파일 순번 관리 테이블 (날짜+타입별 순번 YYMMDD-0000001)' },
      { table: 'banners', comment: '배너 테이블 (메인 배너, 이벤트 배너 등)' },
      { table: 'popups', comment: '팝업 테이블 (공지사항 팝업, 이벤트 팝업 등)' },
      { table: 'popup_views', comment: '팝업 조회 기록 테이블 (1회만 표시 기능 지원)' },
      { table: 'events', comment: '이벤트 테이블 (프로모션, 특별 이벤트 등)' },
      { table: 'notices', comment: '공지사항 테이블' },
      { table: 'faqs', comment: '자주 묻는 질문 테이블' },
      { table: 'terms', comment: '약관 테이블 (이용약관, 개인정보처리방침 등)' },
      { table: 'menu_categories', comment: '관리자 메뉴 카테고리 테이블' },
      { table: 'menu_items', comment: '관리자 메뉴 아이템 테이블' },
      { table: 'site_settings', comment: '사이트 설정 테이블' },
      { table: 'footer_links', comment: '푸터 링크 테이블' },
      { table: 'notifications', comment: '알림 테이블' },
      { table: 'notification_reads', comment: '알림 읽음 여부 테이블' },
      { table: 'refresh_tokens', comment: '리프레시 토큰 테이블 (자동 갱신 및 세션 관리)' },
      { table: 'verification_tokens', comment: '이메일/전화번호 인증 토큰 테이블' },
      { table: 'board_posts', comment: '게시글 테이블' },
      { table: 'board_comments', comment: '게시글 댓글 테이블 (대댓글 지원)' },
      { table: 'board_post_likes', comment: '게시글 좋아요 테이블' },
      { table: 'board_comment_likes', comment: '댓글 좋아요 테이블' },
      // History tables
      { table: 'login_history', comment: '로그인 이력 테이블 (성공/실패 기록)' },
      { table: 'role_change_history', comment: '역할 변경 이력 테이블' },
      { table: 'business_approval_history', comment: '사업자 승인/거부 이력 테이블' },
      { table: 'report_action_history', comment: '신고 처리 이력 테이블' },
      { table: 'settlement_action_history', comment: '정산 처리 이력 테이블' },
      { table: 'user_suspension_history', comment: '사용자 제재 이력 테이블 (정지/차단/경고)' },
      { table: 'setting_change_history', comment: '중요 설정 변경 이력 테이블' },
    ];

    for (const { table, comment } of tableComments) {
      await prisma.$executeRawUnsafe(`
        COMMENT ON TABLE "${table}" IS '${comment}';
      `);
    }
    console.log(`   ✅ ${tableComments.length}개 테이블 코멘트 추가 완료\n`);

    // ============================================
    // 주요 컬럼 코멘트
    // ============================================
    console.log('2️⃣  주요 컬럼 코멘트 추가 중...\n');

    const columnComments = [
      // Users table
      { table: 'users', column: 'id', comment: '사용자 고유 ID (UUID)' },
      { table: 'users', column: 'email', comment: '이메일 (로그인 ID, 고유값)' },
      { table: 'users', column: 'password', comment: '비밀번호 (해시 저장)' },
      { table: 'users', column: 'name', comment: '실명' },
      { table: 'users', column: 'nickname', comment: '닉네임 (고유값)' },
      { table: 'users', column: 'profile_image_id', comment: '프로필 이미지 파일 ID' },
      { table: 'users', column: 'bio', comment: '자기소개' },
      { table: 'users', column: 'phone', comment: '전화번호' },
      { table: 'users', column: 'location', comment: '지역' },
      { table: 'users', column: 'gender', comment: '성별 (CommonCode에서 관리)' },
      { table: 'users', column: 'age', comment: '나이' },
      { table: 'users', column: 'is_verified', comment: '이메일 인증 여부' },
      { table: 'users', column: 'is_phone_verified', comment: '전화번호 인증 여부' },
      { table: 'users', column: 'is_deleted', comment: '소프트 삭제 여부' },
      { table: 'users', column: 'deleted_at', comment: '삭제 일시' },

      // Categories table
      { table: 'categories', column: 'id', comment: '카테고리 고유 ID (UUID)' },
      { table: 'categories', column: 'name', comment: '카테고리명' },
      { table: 'categories', column: 'display_name', comment: '화면 표시용 짧은 이름' },
      { table: 'categories', column: 'slug', comment: 'URL용 슬러그' },
      { table: 'categories', column: 'icon', comment: '아이콘 (이모지 또는 아이콘명)' },
      { table: 'categories', column: 'color', comment: '테마 컬러 (HEX)' },
      { table: 'categories', column: 'image_url', comment: '카테고리 대표 이미지 URL' },
      { table: 'categories', column: 'parent_id', comment: '상위 카테고리 ID' },
      { table: 'categories', column: 'order', comment: '정렬 순서' },
      { table: 'categories', column: 'depth', comment: '깊이 (0: 최상위, 1: 하위)' },
      { table: 'categories', column: 'type', comment: '카테고리 타입 배열 (GATHERING, BOARD, INTEREST)' },
      { table: 'categories', column: 'is_featured', comment: '메인 페이지 추천 노출 여부' },
      { table: 'categories', column: 'is_active', comment: '활성화 여부' },
      { table: 'categories', column: 'is_deleted', comment: '소프트 삭제 여부' },
      { table: 'categories', column: 'deleted_at', comment: '삭제 일시' },

      // Gatherings table
      { table: 'gatherings', column: 'id', comment: '모임 고유 ID (UUID)' },
      { table: 'gatherings', column: 'host_id', comment: '주최자 사용자 ID' },
      { table: 'gatherings', column: 'category_id', comment: '카테고리 ID' },
      { table: 'gatherings', column: 'title', comment: '모임 제목' },
      { table: 'gatherings', column: 'description', comment: '모임 설명' },
      { table: 'gatherings', column: 'gathering_type', comment: '모임 유형 (FREE: 무료, PAID_CLASS: 유료 클래스, DEPOSIT: 보증금)' },
      { table: 'gatherings', column: 'image_id', comment: '모임 대표 이미지 파일 ID' },
      { table: 'gatherings', column: 'location_address', comment: '모임 장소 주소' },
      { table: 'gatherings', column: 'location_detail', comment: '모임 장소 상세 정보' },
      { table: 'gatherings', column: 'latitude', comment: '위도' },
      { table: 'gatherings', column: 'longitude', comment: '경도' },
      { table: 'gatherings', column: 'scheduled_at', comment: '모임 예정 일시' },
      { table: 'gatherings', column: 'duration_minutes', comment: '모임 진행 시간 (분)' },
      { table: 'gatherings', column: 'max_participants', comment: '최대 참가 인원' },
      { table: 'gatherings', column: 'current_participants', comment: '현재 참가 인원' },
      { table: 'gatherings', column: 'price', comment: '참가 비용' },
      { table: 'gatherings', column: 'deposit_amount', comment: '보증금 금액' },
      { table: 'gatherings', column: 'status', comment: '모임 상태 (RECRUITING: 모집중, FULL: 마감, COMPLETED: 완료, CANCELLED: 취소)' },
      { table: 'gatherings', column: 'tags', comment: '태그 배열' },
      { table: 'gatherings', column: 'is_deleted', comment: '소프트 삭제 여부' },
      { table: 'gatherings', column: 'deleted_at', comment: '삭제 일시' },

      // Files table
      { table: 'files', column: 'id', comment: '파일 고유 ID (UUID)' },
      { table: 'files', column: 'file_type', comment: '파일 타입 (PROFILE, GATHERING, POST, EVENT, BANNER, etc.)' },
      { table: 'files', column: 'original_name', comment: '원본 파일명' },
      { table: 'files', column: 'physical_file_name', comment: '물리 파일명 (251117-0000001)' },
      { table: 'files', column: 'saved_name', comment: '저장된 파일명 (파일명+확장자)' },
      { table: 'files', column: 'file_path', comment: '파일 저장 경로' },
      { table: 'files', column: 'file_extension', comment: '파일 확장자' },
      { table: 'files', column: 'file_size', comment: '파일 크기 (bytes)' },
      { table: 'files', column: 'mime_type', comment: 'MIME 타입' },
      { table: 'files', column: 'url', comment: '접근 가능한 URL' },
      { table: 'files', column: 'uploaded_by', comment: '업로드한 사용자 ID' },
      { table: 'files', column: 'is_deleted', comment: '소프트 삭제 여부' },
      { table: 'files', column: 'deleted_at', comment: '삭제 일시' },

      // Common codes
      { table: 'common_codes', column: 'id', comment: '공통코드 고유 ID (UUID)' },
      { table: 'common_codes', column: 'group_code', comment: '그룹 코드 (ROLE, GENDER, REPORT_REASON 등)' },
      { table: 'common_codes', column: 'code', comment: '코드 값 (고유값)' },
      { table: 'common_codes', column: 'name', comment: '코드명' },
      { table: 'common_codes', column: 'description', comment: '코드 설명' },
      { table: 'common_codes', column: 'value', comment: '코드 값 (추가 데이터)' },
      { table: 'common_codes', column: 'order', comment: '정렬 순서' },
      { table: 'common_codes', column: 'is_active', comment: '활성화 여부' },
      { table: 'common_codes', column: 'is_deleted', comment: '소프트 삭제 여부' },
      { table: 'common_codes', column: 'deleted_at', comment: '삭제 일시' },

      // Board posts
      { table: 'board_posts', column: 'id', comment: '게시글 고유 ID (UUID)' },
      { table: 'board_posts', column: 'title', comment: '게시글 제목' },
      { table: 'board_posts', column: 'content', comment: '게시글 내용' },
      { table: 'board_posts', column: 'author_id', comment: '작성자 사용자 ID' },
      { table: 'board_posts', column: 'category_id', comment: '게시판 카테고리 ID' },
      { table: 'board_posts', column: 'view_count', comment: '조회수' },
      { table: 'board_posts', column: 'like_count', comment: '좋아요 수' },
      { table: 'board_posts', column: 'comment_count', comment: '댓글 수' },
      { table: 'board_posts', column: 'is_pinned', comment: '공지 고정 여부' },
      { table: 'board_posts', column: 'status', comment: '게시글 상태 (PUBLISHED: 게시됨, HIDDEN: 숨김, DELETED: 삭제됨)' },
      { table: 'board_posts', column: 'images', comment: '이미지 URL 배열' },

      // Board comments
      { table: 'board_comments', column: 'id', comment: '댓글 고유 ID (UUID)' },
      { table: 'board_comments', column: 'post_id', comment: '게시글 ID' },
      { table: 'board_comments', column: 'author_id', comment: '작성자 사용자 ID' },
      { table: 'board_comments', column: 'content', comment: '댓글 내용' },
      { table: 'board_comments', column: 'like_count', comment: '좋아요 수' },
      { table: 'board_comments', column: 'parent_id', comment: '부모 댓글 ID (대댓글용)' },
    ];

    for (const { table, column, comment } of columnComments) {
      await prisma.$executeRawUnsafe(`
        COMMENT ON COLUMN "${table}"."${column}" IS '${comment}';
      `);
    }
    console.log(`   ✅ ${columnComments.length}개 컬럼 코멘트 추가 완료\n`);

    console.log('🎉 데이터베이스 코멘트 추가 완료!\n');
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    throw error;
  }
}

addDatabaseComments()
  .catch((error) => {
    console.error('❌ 코멘트 추가 실패:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
