import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addComments() {
  console.log('Adding comments to popup_views table...');

  await prisma.$executeRawUnsafe(`COMMENT ON TABLE popup_views IS '팝업 조회 기록 테이블 - 사용자별 팝업 조회 이력 추적 (1회만 표시 기능 지원)'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN popup_views.id IS '조회 기록 고유 ID'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN popup_views.popup_id IS '팝업 ID (popups 테이블 참조)'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN popup_views.user_id IS '사용자 ID (비회원은 null)'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN popup_views.viewed_at IS '조회 일시'`);

  console.log('Adding comments to popups table...');

  await prisma.$executeRawUnsafe(`COMMENT ON TABLE popups IS '팝업 테이블 - 공지사항 팝업, 이벤트 팝업 등'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN popups.id IS '팝업 고유 ID'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN popups.type IS '팝업 타입 (MODAL, BOTTOM_SHEET, TOAST)'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN popups.title IS '팝업 제목'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN popups.content IS '팝업 내용 (HTML 지원)'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN popups.image_url IS '이미지 URL'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN popups.link_url IS '링크 URL (클릭 시 이동)'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN popups.button_text IS '버튼 텍스트'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN popups.start_date IS '노출 시작일'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN popups.end_date IS '노출 종료일'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN popups.is_active IS '활성화 여부'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN popups.show_once IS '1회만 표시 여부'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN popups.priority IS '우선순위 (높을수록 먼저 표시)'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN popups.view_count IS '총 조회수'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN popups.created_by IS '생성자 ID'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN popups.created_at IS '생성 일시'`);
  await prisma.$executeRawUnsafe(`COMMENT ON COLUMN popups.updated_at IS '수정 일시'`);

  console.log('Comments added successfully!');
}

addComments()
  .catch((e) => {
    console.error('Error adding comments:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
