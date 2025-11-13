import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding common codes...');

  // ============================================
  // 1. 신고/제재 관련
  // ============================================

  // 신고 사유
  const reportReasons = [
    { code: 'SPAM', name: '스팸/광고', description: '스팸성 게시글이나 광고', order: 1 },
    { code: 'ABUSE', name: '욕설/비방', description: '욕설이나 타인을 비방하는 내용', order: 2 },
    { code: 'INAPPROPRIATE', name: '부적절한 콘텐츠', description: '선정적이거나 폭력적인 콘텐츠', order: 3 },
    { code: 'FAKE_INFO', name: '허위 정보', description: '거짓 정보나 사기성 내용', order: 4 },
    { code: 'NO_SHOW', name: '노쇼', description: '예약 후 불참', order: 5 },
    { code: 'IMPERSONATION', name: '사칭/사기', description: '타인 사칭 또는 사기 행위', order: 6 },
    { code: 'HARASSMENT', name: '괴롭힘', description: '지속적인 괴롭힘이나 스토킹', order: 7 },
    { code: 'ETC', name: '기타', description: '기타 사유', order: 99 },
  ];

  for (const reason of reportReasons) {
    await prisma.commonCode.upsert({
      where: { code: `REPORT_REASON_${reason.code}` },
      update: {},
      create: {
        groupCode: 'REPORT_REASON',
        code: `REPORT_REASON_${reason.code}`,
        name: reason.name,
        description: reason.description,
        order: reason.order,
      },
    });
  }
  console.log('✅ Report reasons seeded');

  // 제재 유형
  const banTypes = [
    { code: 'WARNING', name: '경고', description: '경고 조치', value: '0', order: 1 },
    { code: 'TEMP_BAN_1D', name: '1일 정지', description: '1일간 서비스 이용 정지', value: '1', order: 2 },
    { code: 'TEMP_BAN_7D', name: '7일 정지', description: '7일간 서비스 이용 정지', value: '7', order: 3 },
    { code: 'TEMP_BAN_30D', name: '30일 정지', description: '30일간 서비스 이용 정지', value: '30', order: 4 },
    { code: 'PERMANENT_BAN', name: '영구 정지', description: '영구적 서비스 이용 정지', value: '-1', order: 5 },
    { code: 'CHAT_BAN', name: '채팅 제한', description: '채팅 기능만 제한', value: '0', order: 6 },
  ];

  for (const ban of banTypes) {
    await prisma.commonCode.upsert({
      where: { code: `BAN_TYPE_${ban.code}` },
      update: {},
      create: {
        groupCode: 'BAN_TYPE',
        code: `BAN_TYPE_${ban.code}`,
        name: ban.name,
        description: ban.description,
        value: ban.value,
        order: ban.order,
      },
    });
  }
  console.log('✅ Ban types seeded');

  // ============================================
  // 2. 결제/정산 관련
  // ============================================

  // 은행 코드
  const banks = [
    { code: 'KB', name: 'KB국민은행', order: 1 },
    { code: 'SHINHAN', name: '신한은행', order: 2 },
    { code: 'WOORI', name: '우리은행', order: 3 },
    { code: 'HANA', name: '하나은행', order: 4 },
    { code: 'NH', name: 'NH농협은행', order: 5 },
    { code: 'IBK', name: 'IBK기업은행', order: 6 },
    { code: 'KAKAO', name: '카카오뱅크', order: 7 },
    { code: 'TOSS', name: '토스뱅크', order: 8 },
    { code: 'KDB', name: 'KDB산업은행', order: 9 },
    { code: 'KEXIM', name: '한국수출입은행', order: 10 },
    { code: 'SC', name: 'SC제일은행', order: 11 },
    { code: 'CITI', name: '한국씨티은행', order: 12 },
    { code: 'K_BANK', name: '케이뱅크', order: 13 },
    { code: 'BUSAN', name: '부산은행', order: 14 },
    { code: 'DAEGU', name: '대구은행', order: 15 },
    { code: 'JEONBUK', name: '전북은행', order: 16 },
    { code: 'KYONGNAM', name: '경남은행', order: 17 },
  ];

  for (const bank of banks) {
    await prisma.commonCode.upsert({
      where: { code: `BANK_${bank.code}` },
      update: {},
      create: {
        groupCode: 'BANK_CODE',
        code: `BANK_${bank.code}`,
        name: bank.name,
        order: bank.order,
      },
    });
  }
  console.log('✅ Bank codes seeded');

  // 모임 취소 사유
  const cancelReasons = [
    { code: 'HOST_PERSONAL', name: '호스트 개인 사유', description: '호스트의 개인적인 사정', order: 1 },
    { code: 'INSUFFICIENT_PARTICIPANTS', name: '최소 인원 미달', description: '최소 인원이 모이지 않음', order: 2 },
    { code: 'WEATHER', name: '날씨 문제', description: '기상 악화로 인한 취소', order: 3 },
    { code: 'LOCATION_ISSUE', name: '장소 문제', description: '장소 예약 취소 등', order: 4 },
    { code: 'FORCE_MAJEURE', name: '불가항력', description: '재난, 재해 등 불가항력적 상황', order: 5 },
    { code: 'ETC', name: '기타', description: '기타 사유', order: 99 },
  ];

  for (const reason of cancelReasons) {
    await prisma.commonCode.upsert({
      where: { code: `CANCEL_REASON_${reason.code}` },
      update: {},
      create: {
        groupCode: 'CANCEL_REASON',
        code: `CANCEL_REASON_${reason.code}`,
        name: reason.name,
        description: reason.description,
        order: reason.order,
      },
    });
  }
  console.log('✅ Cancel reasons seeded');

  // 환불 사유
  const refundReasons = [
    { code: 'GATHERING_CANCELLED', name: '모임 취소', description: '호스트의 모임 취소', order: 1 },
    { code: 'USER_CANCEL', name: '사용자 취소', description: '사용자의 참가 취소', order: 2 },
    { code: 'NO_SHOW_HOST', name: '호스트 노쇼', description: '호스트가 나타나지 않음', order: 3 },
    { code: 'QUALITY_ISSUE', name: '서비스 불만족', description: '서비스 품질에 대한 불만', order: 4 },
    { code: 'DUPLICATE_PAYMENT', name: '중복 결제', description: '실수로 중복 결제됨', order: 5 },
    { code: 'ETC', name: '기타', description: '기타 사유', order: 99 },
  ];

  for (const reason of refundReasons) {
    await prisma.commonCode.upsert({
      where: { code: `REFUND_REASON_${reason.code}` },
      update: {},
      create: {
        groupCode: 'REFUND_REASON',
        code: `REFUND_REASON_${reason.code}`,
        name: reason.name,
        description: reason.description,
        order: reason.order,
      },
    });
  }
  console.log('✅ Refund reasons seeded');

  // 정산 실패 사유
  const settlementFailReasons = [
    { code: 'INVALID_ACCOUNT', name: '계좌 정보 오류', description: '올바르지 않은 계좌 정보', order: 1 },
    { code: 'BANK_ERROR', name: '은행 시스템 오류', description: '은행 시스템 장애', order: 2 },
    { code: 'INSUFFICIENT_BALANCE', name: '잔액 부족', description: '정산 계좌 잔액 부족', order: 3 },
    { code: 'ACCOUNT_CLOSED', name: '계좌 해지', description: '계좌가 해지됨', order: 4 },
    { code: 'VERIFICATION_FAILED', name: '본인 확인 실패', description: '계좌 소유자 확인 실패', order: 5 },
  ];

  for (const reason of settlementFailReasons) {
    await prisma.commonCode.upsert({
      where: { code: `SETTLEMENT_FAIL_REASON_${reason.code}` },
      update: {},
      create: {
        groupCode: 'SETTLEMENT_FAIL_REASON',
        code: `SETTLEMENT_FAIL_REASON_${reason.code}`,
        name: reason.name,
        description: reason.description,
        order: reason.order,
      },
    });
  }
  console.log('✅ Settlement fail reasons seeded');

  // ============================================
  // 3. 포인트/보상 관련
  // ============================================

  // 포인트 적립 사유
  const pointEarnSources = [
    { code: 'SIGNUP_BONUS', name: '회원가입 보너스', description: '회원가입 축하 포인트', value: '1000', order: 1 },
    { code: 'GATHERING_HOST', name: '모임 개최', description: '모임 개최 완료', value: '500', order: 2 },
    { code: 'GATHERING_ATTEND', name: '모임 참석', description: '모임 참석 완료', value: '100', order: 3 },
    { code: 'REVIEW_WRITE', name: '리뷰 작성', description: '리뷰 작성 완료', value: '50', order: 4 },
    { code: 'REFERRAL', name: '친구 추천', description: '친구 추천으로 가입', value: '2000', order: 5 },
    { code: 'EVENT_REWARD', name: '이벤트 보상', description: '이벤트 참여 보상', value: '0', order: 6 },
    { code: 'DAILY_CHECK', name: '출석 체크', description: '일일 출석 체크', value: '10', order: 7 },
    { code: 'BADGE_EARN', name: '배지 획득', description: '배지 획득 보상', value: '100', order: 8 },
    { code: 'LEVEL_UP', name: '레벨업 보상', description: '레벨 상승 보상', value: '0', order: 9 },
  ];

  for (const source of pointEarnSources) {
    await prisma.commonCode.upsert({
      where: { code: `POINT_EARN_${source.code}` },
      update: {},
      create: {
        groupCode: 'POINT_EARN_SOURCE',
        code: `POINT_EARN_${source.code}`,
        name: source.name,
        description: source.description,
        value: source.value,
        order: source.order,
      },
    });
  }
  console.log('✅ Point earn sources seeded');

  // 포인트 사용 사유
  const pointSpendSources = [
    { code: 'GATHERING_PAYMENT', name: '모임 결제', description: '유료 모임 참가 결제', order: 1 },
    { code: 'DEPOSIT_PAYMENT', name: '보증금 결제', description: '모임 보증금 결제', order: 2 },
    { code: 'BOOST_GATHERING', name: '모임 부스팅', description: '모임 노출 순위 상승', order: 3 },
    { code: 'PROFILE_BADGE', name: '프로필 꾸미기', description: '프로필 배지/아이템 구매', order: 4 },
    { code: 'EXPIRED', name: '포인트 만료', description: '유효기간 만료', order: 98 },
    { code: 'REFUND', name: '환불', description: '포인트 환불', order: 99 },
  ];

  for (const source of pointSpendSources) {
    await prisma.commonCode.upsert({
      where: { code: `POINT_SPEND_${source.code}` },
      update: {},
      create: {
        groupCode: 'POINT_SPEND_SOURCE',
        code: `POINT_SPEND_${source.code}`,
        name: source.name,
        description: source.description,
        order: source.order,
      },
    });
  }
  console.log('✅ Point spend sources seeded');

  // ============================================
  // 4. 알림 관련
  // ============================================

  const notificationTypes = [
    { code: 'GATHERING_APPROVED', name: '모임 승인', description: '모임이 승인되었습니다', order: 1 },
    { code: 'GATHERING_REJECTED', name: '모임 반려', description: '모임이 반려되었습니다', order: 2 },
    { code: 'GATHERING_REMIND', name: '모임 리마인더', description: '모임 시작 전 알림', order: 3 },
    { code: 'GATHERING_CANCELLED', name: '모임 취소', description: '참여한 모임이 취소됨', order: 4 },
    { code: 'PARTICIPANT_JOIN', name: '새 참가자', description: '새로운 참가자 등록', order: 5 },
    { code: 'PARTICIPANT_CANCEL', name: '참가 취소', description: '참가자가 취소함', order: 6 },
    { code: 'CHAT_MESSAGE', name: '채팅 메시지', description: '새 채팅 메시지', order: 7 },
    { code: 'REVIEW_RECEIVED', name: '리뷰 받음', description: '새로운 리뷰를 받았습니다', order: 8 },
    { code: 'BADGE_EARNED', name: '배지 획득', description: '새 배지를 획득했습니다', order: 9 },
    { code: 'LEVEL_UP', name: '레벨업', description: '레벨이 상승했습니다', order: 10 },
    { code: 'POINT_EARNED', name: '포인트 적립', description: '포인트가 적립되었습니다', order: 11 },
    { code: 'SETTLEMENT_COMPLETED', name: '정산 완료', description: '정산이 완료되었습니다', order: 12 },
    { code: 'REPORT_RESOLVED', name: '신고 처리 완료', description: '신고가 처리되었습니다', order: 13 },
    { code: 'SYSTEM_NOTICE', name: '시스템 공지', description: '시스템 공지사항', order: 99 },
  ];

  for (const type of notificationTypes) {
    await prisma.commonCode.upsert({
      where: { code: `NOTIFICATION_${type.code}` },
      update: {},
      create: {
        groupCode: 'NOTIFICATION_TYPE',
        code: `NOTIFICATION_${type.code}`,
        name: type.name,
        description: type.description,
        order: type.order,
      },
    });
  }
  console.log('✅ Notification types seeded');

  // ============================================
  // 5. 리뷰 관련
  // ============================================

  // 긍정 리뷰 태그
  const positiveReviewTags = [
    { code: 'FRIENDLY', name: '친절해요', order: 1 },
    { code: 'PUNCTUAL', name: '시간 약속을 잘 지켜요', order: 2 },
    { code: 'GOOD_COMMUNICATION', name: '소통이 원활해요', order: 3 },
    { code: 'PREPARED', name: '준비성이 좋아요', order: 4 },
    { code: 'FUN', name: '재미있어요', order: 5 },
    { code: 'PROFESSIONAL', name: '전문적이에요', order: 6 },
    { code: 'WARM', name: '분위기가 좋아요', order: 7 },
    { code: 'HELPFUL', name: '도움이 많이 돼요', order: 8 },
  ];

  for (const tag of positiveReviewTags) {
    await prisma.commonCode.upsert({
      where: { code: `REVIEW_TAG_POSITIVE_${tag.code}` },
      update: {},
      create: {
        groupCode: 'REVIEW_TAG_POSITIVE',
        code: `REVIEW_TAG_POSITIVE_${tag.code}`,
        name: tag.name,
        order: tag.order,
      },
    });
  }
  console.log('✅ Positive review tags seeded');

  // 부정 리뷰 태그
  const negativeReviewTags = [
    { code: 'LATE', name: '늦게 와요', order: 1 },
    { code: 'NO_SHOW', name: '노쇼했어요', order: 2 },
    { code: 'RUDE', name: '무례해요', order: 3 },
    { code: 'POOR_COMMUNICATION', name: '소통이 어려워요', order: 4 },
    { code: 'UNPREPARED', name: '준비가 부족해요', order: 5 },
    { code: 'DIFFERENT_DESCRIPTION', name: '설명과 달라요', order: 6 },
  ];

  for (const tag of negativeReviewTags) {
    await prisma.commonCode.upsert({
      where: { code: `REVIEW_TAG_NEGATIVE_${tag.code}` },
      update: {},
      create: {
        groupCode: 'REVIEW_TAG_NEGATIVE',
        code: `REVIEW_TAG_NEGATIVE_${tag.code}`,
        name: tag.name,
        order: tag.order,
      },
    });
  }
  console.log('✅ Negative review tags seeded');

  // ============================================
  // 6. 지역 관련
  // ============================================

  // 광역시도
  const regions = [
    { code: 'SEOUL', name: '서울특별시', order: 1 },
    { code: 'BUSAN', name: '부산광역시', order: 2 },
    { code: 'INCHEON', name: '인천광역시', order: 3 },
    { code: 'DAEGU', name: '대구광역시', order: 4 },
    { code: 'DAEJEON', name: '대전광역시', order: 5 },
    { code: 'GWANGJU', name: '광주광역시', order: 6 },
    { code: 'ULSAN', name: '울산광역시', order: 7 },
    { code: 'SEJONG', name: '세종특별자치시', order: 8 },
    { code: 'GYEONGGI', name: '경기도', order: 9 },
    { code: 'GANGWON', name: '강원특별자치도', order: 10 },
    { code: 'CHUNGBUK', name: '충청북도', order: 11 },
    { code: 'CHUNGNAM', name: '충청남도', order: 12 },
    { code: 'JEONBUK', name: '전북특별자치도', order: 13 },
    { code: 'JEONNAM', name: '전라남도', order: 14 },
    { code: 'GYEONGBUK', name: '경상북도', order: 15 },
    { code: 'GYEONGNAM', name: '경상남도', order: 16 },
    { code: 'JEJU', name: '제주특별자치도', order: 17 },
  ];

  for (const region of regions) {
    await prisma.commonCode.upsert({
      where: { code: `REGION_METRO_${region.code}` },
      update: {},
      create: {
        groupCode: 'REGION_METRO',
        code: `REGION_METRO_${region.code}`,
        name: region.name,
        order: region.order,
      },
    });
  }
  console.log('✅ Metro regions seeded');

  // 서울 구
  const seoulDistricts = [
    '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구',
    '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구',
    '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'
  ];

  for (let i = 0; i < seoulDistricts.length; i++) {
    await prisma.commonCode.upsert({
      where: { code: `REGION_SEOUL_${i + 1}` },
      update: {},
      create: {
        groupCode: 'REGION_SEOUL',
        code: `REGION_SEOUL_${i + 1}`,
        name: seoulDistricts[i],
        value: 'SEOUL',
        order: i + 1,
      },
    });
  }
  console.log('✅ Seoul districts seeded');

  // 경기 시군
  const gyeonggiCities = [
    '수원시', '성남시', '고양시', '용인시', '부천시', '안산시', '안양시', '남양주시',
    '화성시', '평택시', '의정부시', '시흥시', '파주시', '광명시', '김포시', '군포시',
    '하남시', '오산시', '양주시', '이천시', '구리시', '안성시', '포천시', '의왕시',
    '양평군', '여주시', '동두천시', '가평군', '과천시', '연천군'
  ];

  for (let i = 0; i < gyeonggiCities.length; i++) {
    await prisma.commonCode.upsert({
      where: { code: `REGION_GYEONGGI_${i + 1}` },
      update: {},
      create: {
        groupCode: 'REGION_GYEONGGI',
        code: `REGION_GYEONGGI_${i + 1}`,
        name: gyeonggiCities[i],
        value: 'GYEONGGI',
        order: i + 1,
      },
    });
  }
  console.log('✅ Gyeonggi cities seeded');

  // 인천 구군
  const incheonDistricts = ['중구', '동구', '미추홀구', '연수구', '남동구', '부평구', '계양구', '서구', '강화군', '옹진군'];
  for (let i = 0; i < incheonDistricts.length; i++) {
    await prisma.commonCode.upsert({
      where: { code: `REGION_INCHEON_${i + 1}` },
      update: {},
      create: {
        groupCode: 'REGION_INCHEON',
        code: `REGION_INCHEON_${i + 1}`,
        name: incheonDistricts[i],
        value: 'INCHEON',
        order: i + 1,
      },
    });
  }

  // 부산 구군
  const busanDistricts = ['중구', '서구', '동구', '영도구', '부산진구', '동래구', '남구', '북구', '해운대구', '사하구', '금정구', '강서구', '연제구', '수영구', '사상구', '기장군'];
  for (let i = 0; i < busanDistricts.length; i++) {
    await prisma.commonCode.upsert({
      where: { code: `REGION_BUSAN_${i + 1}` },
      update: {},
      create: {
        groupCode: 'REGION_BUSAN',
        code: `REGION_BUSAN_${i + 1}`,
        name: busanDistricts[i],
        value: 'BUSAN',
        order: i + 1,
      },
    });
  }

  // 대구 구군
  const daeguDistricts = ['중구', '동구', '서구', '남구', '북구', '수성구', '달서구', '달성군', '군위군'];
  for (let i = 0; i < daeguDistricts.length; i++) {
    await prisma.commonCode.upsert({
      where: { code: `REGION_DAEGU_${i + 1}` },
      update: {},
      create: {
        groupCode: 'REGION_DAEGU',
        code: `REGION_DAEGU_${i + 1}`,
        name: daeguDistricts[i],
        value: 'DAEGU',
        order: i + 1,
      },
    });
  }

  // 대전 구
  const daejeonDistricts = ['동구', '중구', '서구', '유성구', '대덕구'];
  for (let i = 0; i < daejeonDistricts.length; i++) {
    await prisma.commonCode.upsert({
      where: { code: `REGION_DAEJEON_${i + 1}` },
      update: {},
      create: {
        groupCode: 'REGION_DAEJEON',
        code: `REGION_DAEJEON_${i + 1}`,
        name: daejeonDistricts[i],
        value: 'DAEJEON',
        order: i + 1,
      },
    });
  }

  // 광주 구
  const gwangjuDistricts = ['동구', '서구', '남구', '북구', '광산구'];
  for (let i = 0; i < gwangjuDistricts.length; i++) {
    await prisma.commonCode.upsert({
      where: { code: `REGION_GWANGJU_${i + 1}` },
      update: {},
      create: {
        groupCode: 'REGION_GWANGJU',
        code: `REGION_GWANGJU_${i + 1}`,
        name: gwangjuDistricts[i],
        value: 'GWANGJU',
        order: i + 1,
      },
    });
  }

  // 울산 구군
  const ulsanDistricts = ['중구', '남구', '동구', '북구', '울주군'];
  for (let i = 0; i < ulsanDistricts.length; i++) {
    await prisma.commonCode.upsert({
      where: { code: `REGION_ULSAN_${i + 1}` },
      update: {},
      create: {
        groupCode: 'REGION_ULSAN',
        code: `REGION_ULSAN_${i + 1}`,
        name: ulsanDistricts[i],
        value: 'ULSAN',
        order: i + 1,
      },
    });
  }

  console.log('✅ All regions seeded');

  // ============================================
  // 7. FAQ/고객지원 관련
  // ============================================

  const faqCategories = [
    { code: 'ACCOUNT', name: '계정/회원', order: 1 },
    { code: 'GATHERING', name: '모임', order: 2 },
    { code: 'PAYMENT', name: '결제/환불', order: 3 },
    { code: 'TRUST', name: '신뢰도/레벨', order: 4 },
    { code: 'REPORT', name: '신고/제재', order: 5 },
    { code: 'HOST', name: '호스트', order: 6 },
    { code: 'BUSINESS', name: '비즈니스', order: 7 },
    { code: 'ETC', name: '기타', order: 99 },
  ];

  for (const category of faqCategories) {
    await prisma.commonCode.upsert({
      where: { code: `FAQ_CATEGORY_${category.code}` },
      update: {},
      create: {
        groupCode: 'FAQ_CATEGORY',
        code: `FAQ_CATEGORY_${category.code}`,
        name: category.name,
        order: category.order,
      },
    });
  }
  console.log('✅ FAQ categories seeded');

  const inquiryTypes = [
    { code: 'ACCOUNT_ISSUE', name: '계정 문제', description: '로그인, 정보 수정 등', order: 1 },
    { code: 'PAYMENT_ISSUE', name: '결제 문제', description: '결제 오류, 결제 내역 확인 등', order: 2 },
    { code: 'REFUND_REQUEST', name: '환불 요청', description: '환불 신청 및 문의', order: 3 },
    { code: 'REPORT_APPEAL', name: '제재 이의신청', description: '제재에 대한 이의신청', order: 4 },
    { code: 'BUSINESS_INQUIRY', name: '비즈니스 문의', description: '비즈니스 회원 관련 문의', order: 5 },
    { code: 'TECHNICAL_ISSUE', name: '기술적 문제', description: '버그, 오류 신고', order: 6 },
    { code: 'SUGGESTION', name: '제안/건의', description: '서비스 개선 제안', order: 7 },
    { code: 'ETC', name: '기타', description: '기타 문의', order: 99 },
  ];

  for (const type of inquiryTypes) {
    await prisma.commonCode.upsert({
      where: { code: `INQUIRY_TYPE_${type.code}` },
      update: {},
      create: {
        groupCode: 'INQUIRY_TYPE',
        code: `INQUIRY_TYPE_${type.code}`,
        name: type.name,
        description: type.description,
        order: type.order,
      },
    });
  }
  console.log('✅ Inquiry types seeded');

  // ============================================
  // 8. 모임 관련
  // ============================================

  const gatheringTags = [
    { code: 'BEGINNER_FRIENDLY', name: '초보 환영', order: 1 },
    { code: 'INDOOR', name: '실내', order: 2 },
    { code: 'OUTDOOR', name: '야외', order: 3 },
    { code: 'WEEKEND', name: '주말', order: 4 },
    { code: 'WEEKDAY', name: '평일', order: 5 },
    { code: 'MORNING', name: '오전', order: 6 },
    { code: 'AFTERNOON', name: '오후', order: 7 },
    { code: 'EVENING', name: '저녁', order: 8 },
    { code: 'SMALL_GROUP', name: '소규모', order: 9 },
    { code: 'LARGE_GROUP', name: '대규모', order: 10 },
    { code: 'FREE_PARKING', name: '주차 가능', order: 11 },
    { code: 'PUBLIC_TRANSPORT', name: '대중교통 편리', order: 12 },
  ];

  for (const tag of gatheringTags) {
    await prisma.commonCode.upsert({
      where: { code: `GATHERING_TAG_${tag.code}` },
      update: {},
      create: {
        groupCode: 'GATHERING_TAG',
        code: `GATHERING_TAG_${tag.code}`,
        name: tag.name,
        order: tag.order,
      },
    });
  }
  console.log('✅ Gathering tags seeded');

  const durationTypes = [
    { code: 'UNDER_1H', name: '1시간 미만', value: '60', order: 1 },
    { code: '1H_2H', name: '1-2시간', value: '120', order: 2 },
    { code: '2H_3H', name: '2-3시간', value: '180', order: 3 },
    { code: '3H_4H', name: '3-4시간', value: '240', order: 4 },
    { code: 'OVER_4H', name: '4시간 이상', value: '241', order: 5 },
    { code: 'HALF_DAY', name: '반나절', value: '360', order: 6 },
    { code: 'FULL_DAY', name: '종일', value: '480', order: 7 },
  ];

  for (const duration of durationTypes) {
    await prisma.commonCode.upsert({
      where: { code: `DURATION_TYPE_${duration.code}` },
      update: {},
      create: {
        groupCode: 'DURATION_TYPE',
        code: `DURATION_TYPE_${duration.code}`,
        name: duration.name,
        value: duration.value,
        order: duration.order,
      },
    });
  }
  console.log('✅ Duration types seeded');

  // ============================================
  // 9. 비즈니스 관련
  // ============================================

  const businessTypes = [
    { code: 'EDUCATION', name: '교육/강의', order: 1 },
    { code: 'SPORTS', name: '스포츠/레저', order: 2 },
    { code: 'CULTURE', name: '문화/예술', order: 3 },
    { code: 'HOBBY', name: '취미/DIY', order: 4 },
    { code: 'TRAVEL', name: '여행/관광', order: 5 },
    { code: 'FOOD', name: '음식/요리', order: 6 },
    { code: 'WELLNESS', name: '건강/웰니스', order: 7 },
    { code: 'NETWORKING', name: '네트워킹', order: 8 },
    { code: 'ETC', name: '기타', order: 99 },
  ];

  for (const type of businessTypes) {
    await prisma.commonCode.upsert({
      where: { code: `BUSINESS_TYPE_${type.code}` },
      update: {},
      create: {
        groupCode: 'BUSINESS_TYPE',
        code: `BUSINESS_TYPE_${type.code}`,
        name: type.name,
        order: type.order,
      },
    });
  }
  console.log('✅ Business types seeded');

  const approvalStatuses = [
    { code: 'PENDING', name: '승인 대기', order: 1 },
    { code: 'APPROVED', name: '승인 완료', order: 2 },
    { code: 'REJECTED', name: '반려', order: 3 },
    { code: 'ADDITIONAL_INFO_REQUIRED', name: '추가 정보 필요', order: 4 },
  ];

  for (const status of approvalStatuses) {
    await prisma.commonCode.upsert({
      where: { code: `APPROVAL_STATUS_${status.code}` },
      update: {},
      create: {
        groupCode: 'APPROVAL_STATUS',
        code: `APPROVAL_STATUS_${status.code}`,
        name: status.name,
        order: status.order,
      },
    });
  }
  console.log('✅ Approval statuses seeded');

  // ============================================
  // 10. 신뢰 시스템 관련
  // ============================================

  const badgeConditionTypes = [
    { code: 'GATHERING_HOST_COUNT', name: '모임 개최 횟수', description: '주최한 모임 개수', order: 1 },
    { code: 'GATHERING_ATTEND_COUNT', name: '모임 참석 횟수', description: '참석한 모임 개수', order: 2 },
    { code: 'REVIEW_RATING_AVG', name: '리뷰 평점 평균', description: '받은 리뷰 평균 점수', order: 3 },
    { code: 'CONSECUTIVE_DAYS', name: '연속 출석일', description: '연속으로 접속한 일수', order: 4 },
    { code: 'POINT_TOTAL', name: '총 포인트', description: '누적 획득 포인트', order: 5 },
    { code: 'LEVEL', name: '레벨', description: '사용자 레벨', order: 6 },
    { code: 'CATEGORY_SPECIALIST', name: '특정 카테고리 전문', description: '특정 카테고리 참여 횟수', order: 7 },
    { code: 'SEASONAL', name: '시즌 이벤트', description: '시즌별 특별 이벤트', order: 8 },
  ];

  for (const type of badgeConditionTypes) {
    await prisma.commonCode.upsert({
      where: { code: `BADGE_CONDITION_${type.code}` },
      update: {},
      create: {
        groupCode: 'BADGE_CONDITION_TYPE',
        code: `BADGE_CONDITION_${type.code}`,
        name: type.name,
        description: type.description,
        order: type.order,
      },
    });
  }
  console.log('✅ Badge condition types seeded');

  const treeLevels = [
    { code: 'SEED', name: '씨앗', description: '0-2회 참여', value: '2', order: 1 },
    { code: 'SPROUT', name: '새싹', description: '3-5회 참여', value: '5', order: 2 },
    { code: 'SAPLING', name: '묘목', description: '6-10회 참여', value: '10', order: 3 },
    { code: 'YOUNG_TREE', name: '어린나무', description: '11-20회 참여', value: '20', order: 4 },
    { code: 'TREE', name: '나무', description: '21-50회 참여', value: '50', order: 5 },
    { code: 'BIG_TREE', name: '큰나무', description: '51-100회 참여', value: '100', order: 6 },
    { code: 'ANCIENT_TREE', name: '거목', description: '101회 이상 참여', value: '101', order: 7 },
  ];

  for (const level of treeLevels) {
    await prisma.commonCode.upsert({
      where: { code: `TREE_LEVEL_${level.code}` },
      update: {},
      create: {
        groupCode: 'TREE_LEVEL',
        code: `TREE_LEVEL_${level.code}`,
        name: level.name,
        description: level.description,
        value: level.value,
        order: level.order,
      },
    });
  }
  console.log('✅ Tree levels seeded');

  // ============================================
  // 11. 약관 관련
  // ============================================

  const termsTypes = [
    { code: 'SERVICE', name: '서비스 이용약관', description: '서비스 이용에 대한 기본 약관', order: 1 },
    { code: 'PRIVACY', name: '개인정보 처리방침', description: '개인정보 수집 및 이용', order: 2 },
    { code: 'LOCATION', name: '위치기반 서비스 약관', description: '위치 정보 이용 약관', order: 3 },
    { code: 'MARKETING', name: '마케팅 정보 수신 동의', description: '광고성 정보 수신 동의', order: 4 },
    { code: 'PAYMENT', name: '전자금융거래 약관', description: '결제 및 환불 관련 약관', order: 5 },
    { code: 'BUSINESS', name: '비즈니스 회원 약관', description: '비즈니스 회원 전용 약관', order: 6 },
  ];

  for (const type of termsTypes) {
    await prisma.commonCode.upsert({
      where: { code: `TERMS_TYPE_${type.code}` },
      update: {},
      create: {
        groupCode: 'TERMS_TYPE',
        code: `TERMS_TYPE_${type.code}`,
        name: type.name,
        description: type.description,
        order: type.order,
      },
    });
  }
  console.log('✅ Terms types seeded');

  // ============================================
  // 15. COMPANY INFO (회사 정보)
  // ============================================

  const companyInfoData = [
    { code: 'COMPANY_NAME', name: '회사명', value: '(주)모아', description: '회사 정식 명칭', order: 1 },
    { code: 'COMPANY_CEO', name: '대표자명', value: '홍길동', description: '회사 대표이사 이름', order: 2 },
    { code: 'COMPANY_BUSINESS_NUMBER', name: '사업자등록번호', value: '123-45-67890', description: '사업자등록번호', order: 3 },
    { code: 'COMPANY_ECOMMERCE_NUMBER', name: '통신판매업신고번호', value: '2024-서울강남-12345', description: '통신판매업 신고번호', order: 4 },
    { code: 'COMPANY_ADDRESS', name: '주소', value: '서울특별시 강남구 테헤란로 123 모아빌딩 5층', description: '회사 주소', order: 5 },
    { code: 'CONTACT_EMAIL', name: '고객센터 이메일', value: 'support@moa.co.kr', description: '고객 문의 이메일', order: 6 },
    { code: 'CONTACT_PHONE', name: '고객센터 전화번호', value: '02-1234-5678', description: '고객센터 대표 전화번호', order: 7 },
    { code: 'CONTACT_WORKING_HOURS', name: '운영시간', value: '평일 10:00 - 18:00 (주말 및 공휴일 휴무)', description: '고객센터 운영 시간', order: 8 },
    { code: 'SOCIAL_FACEBOOK', name: 'Facebook', value: 'https://facebook.com/moa', description: '페이스북 페이지 URL', order: 9 },
    { code: 'SOCIAL_INSTAGRAM', name: 'Instagram', value: 'https://instagram.com/moa.official', description: '인스타그램 계정 URL', order: 10 },
    { code: 'SOCIAL_TWITTER', name: 'Twitter', value: 'https://twitter.com/moa_official', description: '트위터 계정 URL', order: 11 },
    { code: 'SOCIAL_YOUTUBE', name: 'Youtube', value: 'https://youtube.com/@moa', description: '유튜브 채널 URL', order: 12 },
  ];

  for (const info of companyInfoData) {
    await prisma.commonCode.upsert({
      where: { code: `COMPANY_INFO_${info.code}` },
      update: {},
      create: {
        groupCode: 'COMPANY_INFO',
        code: `COMPANY_INFO_${info.code}`,
        name: info.name,
        value: info.value,
        description: info.description,
        order: info.order,
      },
    });
  }
  console.log('✅ Company info seeded');

  console.log('✅ All common codes seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding common codes:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
