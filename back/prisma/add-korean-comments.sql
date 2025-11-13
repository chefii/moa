-- ============================================
-- 데이터베이스 테이블 및 컬럼 한글 주석 추가
-- ============================================

-- ============================================
-- 사용자 관련 테이블
-- ============================================

-- users 테이블
COMMENT ON TABLE users IS '사용자';
COMMENT ON COLUMN users.id IS '사용자 고유 ID';
COMMENT ON COLUMN users.email IS '이메일 (로그인용)';
COMMENT ON COLUMN users.password IS '비밀번호 (암호화됨)';
COMMENT ON COLUMN users.name IS '실명';
COMMENT ON COLUMN users.nickname IS '닉네임';
COMMENT ON COLUMN users.profile_image IS '프로필 이미지 URL';
COMMENT ON COLUMN users.bio IS '자기소개';
COMMENT ON COLUMN users.phone IS '전화번호';
COMMENT ON COLUMN users.location IS '지역 (시/구)';
COMMENT ON COLUMN users.gender IS '성별 (공통코드)';
COMMENT ON COLUMN users.age IS '나이';
COMMENT ON COLUMN users.role IS '권한 (공통코드)';
COMMENT ON COLUMN users.is_verified IS '이메일 인증 여부';
COMMENT ON COLUMN users.is_phone_verified IS '전화번호 인증 여부';
COMMENT ON COLUMN users.email_verified_at IS '이메일 인증 일시';
COMMENT ON COLUMN users.phone_verified_at IS '전화번호 인증 일시';
COMMENT ON COLUMN users.created_at IS '가입일';
COMMENT ON COLUMN users.updated_at IS '수정일';

-- verification_tokens 테이블
COMMENT ON TABLE verification_tokens IS '인증 토큰';
COMMENT ON COLUMN verification_tokens.id IS '토큰 ID';
COMMENT ON COLUMN verification_tokens.user_id IS '사용자 ID';
COMMENT ON COLUMN verification_tokens.token IS '토큰 값';
COMMENT ON COLUMN verification_tokens.type IS '토큰 유형 (EMAIL/PHONE)';
COMMENT ON COLUMN verification_tokens.code IS '인증 코드 (6자리)';
COMMENT ON COLUMN verification_tokens.expires_at IS '만료 일시';
COMMENT ON COLUMN verification_tokens.created_at IS '생성일';

-- user_levels 테이블
COMMENT ON TABLE user_levels IS '사용자 레벨';
COMMENT ON COLUMN user_levels.id IS '레벨 ID';
COMMENT ON COLUMN user_levels.user_id IS '사용자 ID';
COMMENT ON COLUMN user_levels.level IS '현재 레벨';
COMMENT ON COLUMN user_levels.growth_points IS '성장 포인트';
COMMENT ON COLUMN user_levels.created_at IS '생성일';
COMMENT ON COLUMN user_levels.updated_at IS '수정일';

-- user_streaks 테이블
COMMENT ON TABLE user_streaks IS '사용자 연속 활동 기록';
COMMENT ON COLUMN user_streaks.id IS '스트릭 ID';
COMMENT ON COLUMN user_streaks.user_id IS '사용자 ID';
COMMENT ON COLUMN user_streaks.current_streak IS '현재 연속 일수';
COMMENT ON COLUMN user_streaks.longest_streak IS '최장 연속 일수';
COMMENT ON COLUMN user_streaks.last_activity_date IS '마지막 활동 날짜';
COMMENT ON COLUMN user_streaks.created_at IS '생성일';
COMMENT ON COLUMN user_streaks.updated_at IS '수정일';

-- business_profiles 테이블
COMMENT ON TABLE business_profiles IS '비즈니스 프로필';
COMMENT ON COLUMN business_profiles.id IS '프로필 ID';
COMMENT ON COLUMN business_profiles.user_id IS '사용자 ID';
COMMENT ON COLUMN business_profiles.business_name IS '사업자명';
COMMENT ON COLUMN business_profiles.business_number IS '사업자등록번호';
COMMENT ON COLUMN business_profiles.business_address IS '사업장 주소';
COMMENT ON COLUMN business_profiles.business_phone IS '사업장 전화번호';
COMMENT ON COLUMN business_profiles.business_description IS '사업 설명';
COMMENT ON COLUMN business_profiles.business_image IS '사업자 이미지';
COMMENT ON COLUMN business_profiles.bank_name IS '은행명';
COMMENT ON COLUMN business_profiles.bank_account IS '계좌번호';
COMMENT ON COLUMN business_profiles.account_holder IS '예금주';
COMMENT ON COLUMN business_profiles.is_approved IS '승인 여부';
COMMENT ON COLUMN business_profiles.approved_by IS '승인자 ID';
COMMENT ON COLUMN business_profiles.approved_at IS '승인 일시';
COMMENT ON COLUMN business_profiles.rejection_reason IS '반려 사유';
COMMENT ON COLUMN business_profiles.created_at IS '생성일';
COMMENT ON COLUMN business_profiles.updated_at IS '수정일';

-- ============================================
-- 모임 관련 테이블
-- ============================================

-- categories 테이블
COMMENT ON TABLE categories IS '카테고리';
COMMENT ON COLUMN categories.id IS '카테고리 ID';
COMMENT ON COLUMN categories.name IS '카테고리명';
COMMENT ON COLUMN categories.slug IS 'URL 슬러그';
COMMENT ON COLUMN categories.icon IS '아이콘';
COMMENT ON COLUMN categories.color IS '색상 코드';
COMMENT ON COLUMN categories.description IS '설명';
COMMENT ON COLUMN categories.order IS '정렬 순서';
COMMENT ON COLUMN categories.is_active IS '활성화 여부';
COMMENT ON COLUMN categories.created_at IS '생성일';

-- user_interests 테이블
COMMENT ON TABLE user_interests IS '사용자 관심사';
COMMENT ON COLUMN user_interests.id IS '관심사 ID';
COMMENT ON COLUMN user_interests.user_id IS '사용자 ID';
COMMENT ON COLUMN user_interests.category_id IS '카테고리 ID';
COMMENT ON COLUMN user_interests.created_at IS '생성일';

-- gatherings 테이블
COMMENT ON TABLE gatherings IS '모임';
COMMENT ON COLUMN gatherings.id IS '모임 ID';
COMMENT ON COLUMN gatherings.host_id IS '호스트 ID';
COMMENT ON COLUMN gatherings.category_id IS '카테고리 ID';
COMMENT ON COLUMN gatherings.title IS '모임 제목';
COMMENT ON COLUMN gatherings.description IS '모임 설명';
COMMENT ON COLUMN gatherings.gathering_type IS '모임 유형 (무료/유료/보증금)';
COMMENT ON COLUMN gatherings.image IS '대표 이미지';
COMMENT ON COLUMN gatherings.location_address IS '장소 주소';
COMMENT ON COLUMN gatherings.location_detail IS '상세 주소';
COMMENT ON COLUMN gatherings.latitude IS '위도';
COMMENT ON COLUMN gatherings.longitude IS '경도';
COMMENT ON COLUMN gatherings.scheduled_at IS '모임 일시';
COMMENT ON COLUMN gatherings.duration_minutes IS '소요 시간 (분)';
COMMENT ON COLUMN gatherings.max_participants IS '최대 인원';
COMMENT ON COLUMN gatherings.current_participants IS '현재 참가 인원';
COMMENT ON COLUMN gatherings.price IS '가격';
COMMENT ON COLUMN gatherings.deposit_amount IS '보증금';
COMMENT ON COLUMN gatherings.status IS '모임 상태';
COMMENT ON COLUMN gatherings.tags IS '태그 목록';
COMMENT ON COLUMN gatherings.created_at IS '생성일';
COMMENT ON COLUMN gatherings.updated_at IS '수정일';

-- gathering_participants 테이블
COMMENT ON TABLE gathering_participants IS '모임 참가자';
COMMENT ON COLUMN gathering_participants.id IS '참가자 ID';
COMMENT ON COLUMN gathering_participants.gathering_id IS '모임 ID';
COMMENT ON COLUMN gathering_participants.user_id IS '사용자 ID';
COMMENT ON COLUMN gathering_participants.status IS '참가 상태';
COMMENT ON COLUMN gathering_participants.deposit_paid IS '보증금 납부 여부';
COMMENT ON COLUMN gathering_participants.deposit_refunded IS '보증금 환불 여부';
COMMENT ON COLUMN gathering_participants.payment_id IS '결제 ID';
COMMENT ON COLUMN gathering_participants.joined_at IS '참가 일시';
COMMENT ON COLUMN gathering_participants.attended_at IS '출석 일시';
COMMENT ON COLUMN gathering_participants.cancelled_at IS '취소 일시';

-- bookmarks 테이블
COMMENT ON TABLE bookmarks IS '북마크';
COMMENT ON COLUMN bookmarks.id IS '북마크 ID';
COMMENT ON COLUMN bookmarks.user_id IS '사용자 ID';
COMMENT ON COLUMN bookmarks.gathering_id IS '모임 ID';
COMMENT ON COLUMN bookmarks.created_at IS '생성일';

-- ============================================
-- 리뷰 및 신고 테이블
-- ============================================

-- reviews 테이블
COMMENT ON TABLE reviews IS '리뷰';
COMMENT ON COLUMN reviews.id IS '리뷰 ID';
COMMENT ON COLUMN reviews.gathering_id IS '모임 ID';
COMMENT ON COLUMN reviews.reviewer_id IS '작성자 ID';
COMMENT ON COLUMN reviews.reviewee_id IS '대상자 ID';
COMMENT ON COLUMN reviews.rating IS '평점';
COMMENT ON COLUMN reviews.comment IS '리뷰 내용';
COMMENT ON COLUMN reviews.reply IS '답글';
COMMENT ON COLUMN reviews.replied_at IS '답글 작성 일시';
COMMENT ON COLUMN reviews.created_at IS '생성일';

-- reports 테이블
COMMENT ON TABLE reports IS '신고';
COMMENT ON COLUMN reports.id IS '신고 ID';
COMMENT ON COLUMN reports.reporter_id IS '신고자 ID';
COMMENT ON COLUMN reports.reported_id IS '피신고자 ID';
COMMENT ON COLUMN reports.gathering_id IS '모임 ID';
COMMENT ON COLUMN reports.reason IS '신고 사유';
COMMENT ON COLUMN reports.description IS '상세 내용';
COMMENT ON COLUMN reports.status IS '처리 상태';
COMMENT ON COLUMN reports.admin_note IS '관리자 메모';
COMMENT ON COLUMN reports.resolved_by IS '처리자 ID';
COMMENT ON COLUMN reports.resolved_at IS '처리 일시';
COMMENT ON COLUMN reports.created_at IS '생성일';

-- ============================================
-- 채팅 테이블
-- ============================================

-- chat_rooms 테이블
COMMENT ON TABLE chat_rooms IS '채팅방';
COMMENT ON COLUMN chat_rooms.id IS '채팅방 ID';
COMMENT ON COLUMN chat_rooms.gathering_id IS '모임 ID';
COMMENT ON COLUMN chat_rooms.created_at IS '생성일';

-- chat_messages 테이블
COMMENT ON TABLE chat_messages IS '채팅 메시지';
COMMENT ON COLUMN chat_messages.id IS '메시지 ID';
COMMENT ON COLUMN chat_messages.room_id IS '채팅방 ID';
COMMENT ON COLUMN chat_messages.user_id IS '작성자 ID';
COMMENT ON COLUMN chat_messages.message IS '메시지 내용';
COMMENT ON COLUMN chat_messages.created_at IS '생성일';

-- ============================================
-- 정산 테이블
-- ============================================

-- settlements 테이블
COMMENT ON TABLE settlements IS '정산';
COMMENT ON COLUMN settlements.id IS '정산 ID';
COMMENT ON COLUMN settlements.business_profile_id IS '비즈니스 프로필 ID';
COMMENT ON COLUMN settlements.gathering_id IS '모임 ID';
COMMENT ON COLUMN settlements.total_amount IS '총 금액';
COMMENT ON COLUMN settlements.platform_fee IS '플랫폼 수수료';
COMMENT ON COLUMN settlements.settlement_amount IS '정산 금액';
COMMENT ON COLUMN settlements.status IS '정산 상태';
COMMENT ON COLUMN settlements.settled_at IS '정산 일시';
COMMENT ON COLUMN settlements.created_at IS '생성일';

-- ============================================
-- 신뢰도 시스템 테이블
-- ============================================

-- badges 테이블
COMMENT ON TABLE badges IS '뱃지';
COMMENT ON COLUMN badges.id IS '뱃지 ID';
COMMENT ON COLUMN badges.code IS '뱃지 코드';
COMMENT ON COLUMN badges.name IS '뱃지명';
COMMENT ON COLUMN badges.description IS '설명';
COMMENT ON COLUMN badges.icon IS '아이콘';
COMMENT ON COLUMN badges.category IS '카테고리';
COMMENT ON COLUMN badges.condition_type IS '조건 유형';
COMMENT ON COLUMN badges.condition_value IS '조건 값';
COMMENT ON COLUMN badges.is_active IS '활성화 여부';
COMMENT ON COLUMN badges.created_at IS '생성일';

-- user_badges 테이블
COMMENT ON TABLE user_badges IS '사용자 뱃지';
COMMENT ON COLUMN user_badges.id IS '사용자 뱃지 ID';
COMMENT ON COLUMN user_badges.user_id IS '사용자 ID';
COMMENT ON COLUMN user_badges.badge_id IS '뱃지 ID';
COMMENT ON COLUMN user_badges.earned_at IS '획득 일시';

-- user_points 테이블
COMMENT ON TABLE user_points IS '사용자 포인트 거래내역';
COMMENT ON COLUMN user_points.id IS '거래내역 ID';
COMMENT ON COLUMN user_points.user_id IS '사용자 ID';
COMMENT ON COLUMN user_points.points IS '포인트 (적립/차감)';
COMMENT ON COLUMN user_points.balance IS '잔액';
COMMENT ON COLUMN user_points.type IS '거래 유형 (적립/차감)';
COMMENT ON COLUMN user_points.source IS '거래 출처';
COMMENT ON COLUMN user_points.description IS '설명';
COMMENT ON COLUMN user_points.expires_at IS '만료 일시';
COMMENT ON COLUMN user_points.created_at IS '생성일';

-- moment_collections 테이블
COMMENT ON TABLE moment_collections IS '모먼트 컬렉션';
COMMENT ON COLUMN moment_collections.id IS '컬렉션 ID';
COMMENT ON COLUMN moment_collections.user_id IS '사용자 ID';
COMMENT ON COLUMN moment_collections.moment_code IS '모먼트 코드';
COMMENT ON COLUMN moment_collections.moment_name IS '모먼트명';
COMMENT ON COLUMN moment_collections.moment_icon IS '모먼트 아이콘';
COMMENT ON COLUMN moment_collections.is_rare IS '희귀 여부';
COMMENT ON COLUMN moment_collections.earned_at IS '획득 일시';

-- interest_forest 테이블
COMMENT ON TABLE interest_forest IS '관심사 숲';
COMMENT ON COLUMN interest_forest.id IS '숲 ID';
COMMENT ON COLUMN interest_forest.user_id IS '사용자 ID';
COMMENT ON COLUMN interest_forest.category_id IS '카테고리 ID';
COMMENT ON COLUMN interest_forest.participation_count IS '참가 횟수';
COMMENT ON COLUMN interest_forest.tree_level IS '나무 레벨';
COMMENT ON COLUMN interest_forest.updated_at IS '수정일';

-- ============================================
-- 관리자 테이블
-- ============================================

-- common_codes 테이블
COMMENT ON TABLE common_codes IS '공통 코드';
COMMENT ON COLUMN common_codes.id IS '코드 ID';
COMMENT ON COLUMN common_codes.group_code IS '그룹 코드';
COMMENT ON COLUMN common_codes.code IS '코드';
COMMENT ON COLUMN common_codes.name IS '코드명';
COMMENT ON COLUMN common_codes.description IS '설명';
COMMENT ON COLUMN common_codes.value IS '값';
COMMENT ON COLUMN common_codes.order IS '정렬 순서';
COMMENT ON COLUMN common_codes.is_active IS '활성화 여부';
COMMENT ON COLUMN common_codes.created_at IS '생성일';
COMMENT ON COLUMN common_codes.updated_at IS '수정일';

-- banners 테이블
COMMENT ON TABLE banners IS '배너';
COMMENT ON COLUMN banners.id IS '배너 ID';
COMMENT ON COLUMN banners.type IS '배너 유형';
COMMENT ON COLUMN banners.title IS '제목';
COMMENT ON COLUMN banners.description IS '설명';
COMMENT ON COLUMN banners.image_url IS '이미지 URL';
COMMENT ON COLUMN banners.link_url IS '링크 URL';
COMMENT ON COLUMN banners.order IS '정렬 순서';
COMMENT ON COLUMN banners.start_date IS '시작일';
COMMENT ON COLUMN banners.end_date IS '종료일';
COMMENT ON COLUMN banners.is_active IS '활성화 여부';
COMMENT ON COLUMN banners.view_count IS '조회수';
COMMENT ON COLUMN banners.click_count IS '클릭수';
COMMENT ON COLUMN banners.created_by IS '생성자 ID';
COMMENT ON COLUMN banners.created_at IS '생성일';
COMMENT ON COLUMN banners.updated_at IS '수정일';

-- popups 테이블
COMMENT ON TABLE popups IS '팝업';
COMMENT ON COLUMN popups.id IS '팝업 ID';
COMMENT ON COLUMN popups.type IS '팝업 유형';
COMMENT ON COLUMN popups.title IS '제목';
COMMENT ON COLUMN popups.content IS '내용';
COMMENT ON COLUMN popups.image_url IS '이미지 URL';
COMMENT ON COLUMN popups.link_url IS '링크 URL';
COMMENT ON COLUMN popups.button_text IS '버튼 텍스트';
COMMENT ON COLUMN popups.start_date IS '시작일';
COMMENT ON COLUMN popups.end_date IS '종료일';
COMMENT ON COLUMN popups.is_active IS '활성화 여부';
COMMENT ON COLUMN popups.show_once IS '1회만 표시';
COMMENT ON COLUMN popups.priority IS '우선순위';
COMMENT ON COLUMN popups.view_count IS '조회수';
COMMENT ON COLUMN popups.created_by IS '생성자 ID';
COMMENT ON COLUMN popups.created_at IS '생성일';
COMMENT ON COLUMN popups.updated_at IS '수정일';

-- events 테이블
COMMENT ON TABLE events IS '이벤트';
COMMENT ON COLUMN events.id IS '이벤트 ID';
COMMENT ON COLUMN events.title IS '제목';
COMMENT ON COLUMN events.description IS '설명';
COMMENT ON COLUMN events.image_url IS '이미지 URL';
COMMENT ON COLUMN events.thumbnail_url IS '썸네일 URL';
COMMENT ON COLUMN events.status IS '이벤트 상태';
COMMENT ON COLUMN events.start_date IS '시작일';
COMMENT ON COLUMN events.end_date IS '종료일';
COMMENT ON COLUMN events.max_participants IS '최대 참가자';
COMMENT ON COLUMN events.participant_count IS '참가자 수';
COMMENT ON COLUMN events.is_active IS '활성화 여부';
COMMENT ON COLUMN events.view_count IS '조회수';
COMMENT ON COLUMN events.like_count IS '좋아요 수';
COMMENT ON COLUMN events.created_by IS '생성자 ID';
COMMENT ON COLUMN events.created_at IS '생성일';
COMMENT ON COLUMN events.updated_at IS '수정일';

-- notices 테이블
COMMENT ON TABLE notices IS '공지사항';
COMMENT ON COLUMN notices.id IS '공지사항 ID';
COMMENT ON COLUMN notices.type IS '공지 유형';
COMMENT ON COLUMN notices.title IS '제목';
COMMENT ON COLUMN notices.content IS '내용';
COMMENT ON COLUMN notices.is_pinned IS '고정 여부';
COMMENT ON COLUMN notices.is_active IS '활성화 여부';
COMMENT ON COLUMN notices.view_count IS '조회수';
COMMENT ON COLUMN notices.start_date IS '시작일';
COMMENT ON COLUMN notices.end_date IS '종료일';
COMMENT ON COLUMN notices.created_by IS '생성자 ID';
COMMENT ON COLUMN notices.created_at IS '생성일';
COMMENT ON COLUMN notices.updated_at IS '수정일';

-- faqs 테이블
COMMENT ON TABLE faqs IS '자주 묻는 질문';
COMMENT ON COLUMN faqs.id IS 'FAQ ID';
COMMENT ON COLUMN faqs.category IS '카테고리';
COMMENT ON COLUMN faqs.question IS '질문';
COMMENT ON COLUMN faqs.answer IS '답변';
COMMENT ON COLUMN faqs.order IS '정렬 순서';
COMMENT ON COLUMN faqs.is_active IS '활성화 여부';
COMMENT ON COLUMN faqs.view_count IS '조회수';
COMMENT ON COLUMN faqs.created_at IS '생성일';
COMMENT ON COLUMN faqs.updated_at IS '수정일';

-- terms 테이블
COMMENT ON TABLE terms IS '약관';
COMMENT ON COLUMN terms.id IS '약관 ID';
COMMENT ON COLUMN terms.type IS '약관 유형';
COMMENT ON COLUMN terms.title IS '제목';
COMMENT ON COLUMN terms.content IS '내용';
COMMENT ON COLUMN terms.version IS '버전';
COMMENT ON COLUMN terms.is_active IS '활성화 여부';
COMMENT ON COLUMN terms.is_required IS '필수 동의 여부';
COMMENT ON COLUMN terms.created_at IS '생성일';
COMMENT ON COLUMN terms.updated_at IS '수정일';

-- menu_categories 테이블
COMMENT ON TABLE menu_categories IS '메뉴 카테고리';
COMMENT ON COLUMN menu_categories.id IS '카테고리 ID';
COMMENT ON COLUMN menu_categories.name IS '카테고리명';
COMMENT ON COLUMN menu_categories.name_en IS '영문명';
COMMENT ON COLUMN menu_categories.icon IS '아이콘';
COMMENT ON COLUMN menu_categories.order IS '정렬 순서';
COMMENT ON COLUMN menu_categories.is_active IS '활성화 여부';
COMMENT ON COLUMN menu_categories.description IS '설명';
COMMENT ON COLUMN menu_categories.required_roles IS '필요 권한';
COMMENT ON COLUMN menu_categories.created_at IS '생성일';
COMMENT ON COLUMN menu_categories.updated_at IS '수정일';

-- menu_items 테이블
COMMENT ON TABLE menu_items IS '메뉴 항목';
COMMENT ON COLUMN menu_items.id IS '항목 ID';
COMMENT ON COLUMN menu_items.category_id IS '카테고리 ID';
COMMENT ON COLUMN menu_items.name IS '항목명';
COMMENT ON COLUMN menu_items.name_en IS '영문명';
COMMENT ON COLUMN menu_items.path IS '경로';
COMMENT ON COLUMN menu_items.icon IS '아이콘';
COMMENT ON COLUMN menu_items.order IS '정렬 순서';
COMMENT ON COLUMN menu_items.is_active IS '활성화 여부';
COMMENT ON COLUMN menu_items.badge IS '배지 숫자';
COMMENT ON COLUMN menu_items.description IS '설명';
COMMENT ON COLUMN menu_items.required_roles IS '필요 권한';
COMMENT ON COLUMN menu_items.created_at IS '생성일';
COMMENT ON COLUMN menu_items.updated_at IS '수정일';

-- ============================================
-- 설정 및 푸터 테이블
-- ============================================

-- site_settings 테이블
COMMENT ON TABLE site_settings IS '사이트 설정';
COMMENT ON COLUMN site_settings.id IS '설정 ID';
COMMENT ON COLUMN site_settings.key IS '설정 키';
COMMENT ON COLUMN site_settings.value IS '설정 값';
COMMENT ON COLUMN site_settings.category IS '카테고리';
COMMENT ON COLUMN site_settings.label IS '라벨';
COMMENT ON COLUMN site_settings.description IS '설명';
COMMENT ON COLUMN site_settings.order IS '정렬 순서';
COMMENT ON COLUMN site_settings.created_at IS '생성일';
COMMENT ON COLUMN site_settings.updated_at IS '수정일';

-- footer_links 테이블
COMMENT ON TABLE footer_links IS '푸터 링크';
COMMENT ON COLUMN footer_links.id IS '링크 ID';
COMMENT ON COLUMN footer_links.title IS '제목';
COMMENT ON COLUMN footer_links.url IS 'URL';
COMMENT ON COLUMN footer_links.order IS '정렬 순서';
COMMENT ON COLUMN footer_links.is_external IS '외부 링크 여부';
COMMENT ON COLUMN footer_links.is_active IS '활성화 여부';
COMMENT ON COLUMN footer_links.category IS '카테고리';
COMMENT ON COLUMN footer_links.created_at IS '생성일';
COMMENT ON COLUMN footer_links.updated_at IS '수정일';

-- ============================================
-- 알림 테이블
-- ============================================

-- notifications 테이블
COMMENT ON TABLE notifications IS '알림';
COMMENT ON COLUMN notifications.id IS '알림 ID';
COMMENT ON COLUMN notifications.user_id IS '사용자 ID (null이면 전체 알림)';
COMMENT ON COLUMN notifications.type IS '알림 유형';
COMMENT ON COLUMN notifications.title IS '제목';
COMMENT ON COLUMN notifications.content IS '내용';
COMMENT ON COLUMN notifications.link IS '링크';
COMMENT ON COLUMN notifications.priority IS '우선순위 (0:일반, 1:중요, 2:긴급)';
COMMENT ON COLUMN notifications.created_at IS '생성일';

-- notification_reads 테이블
COMMENT ON TABLE notification_reads IS '알림 읽음 기록';
COMMENT ON COLUMN notification_reads.id IS '기록 ID';
COMMENT ON COLUMN notification_reads.notification_id IS '알림 ID';
COMMENT ON COLUMN notification_reads.user_id IS '사용자 ID';
COMMENT ON COLUMN notification_reads.read_at IS '읽은 일시';
