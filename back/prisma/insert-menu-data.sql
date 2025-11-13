-- 기존 메뉴 데이터 삭제
DELETE FROM menu_items;
DELETE FROM menu_categories;

-- 1. 회원 관리 카테고리
INSERT INTO menu_categories (id, name, name_en, icon, "order", is_active, description, required_roles, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '회원 관리',
  'User Management',
  'UserCircle2',
  0,
  true,
  '사용자 및 신고 관리',
  ARRAY['SUPER_ADMIN', 'BUSINESS_ADMIN']::text[],
  NOW(),
  NOW()
) RETURNING id;

-- 회원 관리 메뉴 항목들
INSERT INTO menu_items (id, category_id, name, name_en, path, icon, "order", is_active, badge, required_roles, created_at, updated_at)
SELECT
  gen_random_uuid(),
  id,
  '사용자 관리',
  'Users',
  '/admin/users',
  'Users',
  0,
  true,
  NULL,
  ARRAY['SUPER_ADMIN', 'BUSINESS_ADMIN']::text[],
  NOW(),
  NOW()
FROM menu_categories WHERE name = '회원 관리';

INSERT INTO menu_items (id, category_id, name, name_en, path, icon, "order", is_active, badge, required_roles, created_at, updated_at)
SELECT
  gen_random_uuid(),
  id,
  '신고 관리',
  'Reports',
  '/admin/reports',
  'AlertCircle',
  1,
  true,
  5,
  ARRAY['SUPER_ADMIN']::text[],
  NOW(),
  NOW()
FROM menu_categories WHERE name = '회원 관리';

-- 2. 모임 관리 카테고리
INSERT INTO menu_categories (id, name, name_en, icon, "order", is_active, description, required_roles, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '모임 관리',
  'Gathering Management',
  'Calendar',
  1,
  true,
  '모임 카테고리 및 관련 관리',
  ARRAY['SUPER_ADMIN']::text[],
  NOW(),
  NOW()
);

INSERT INTO menu_items (id, category_id, name, name_en, path, icon, "order", is_active, required_roles, created_at, updated_at)
SELECT
  gen_random_uuid(),
  id,
  '카테고리 관리',
  'Categories',
  '/admin/categories',
  'Tag',
  0,
  true,
  ARRAY['SUPER_ADMIN']::text[],
  NOW(),
  NOW()
FROM menu_categories WHERE name = '모임 관리';

-- 3. 콘텐츠 관리 카테고리
INSERT INTO menu_categories (id, name, name_en, icon, "order", is_active, description, required_roles, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '콘텐츠 관리',
  'Content Management',
  'FileText',
  2,
  true,
  '배너, 팝업, 이벤트, 공지사항 관리',
  ARRAY['SUPER_ADMIN', 'BUSINESS_ADMIN']::text[],
  NOW(),
  NOW()
);

INSERT INTO menu_items (id, category_id, name, name_en, path, icon, "order", is_active, required_roles, created_at, updated_at)
SELECT
  gen_random_uuid(),
  id,
  '배너 관리',
  'Banners',
  '/admin/banners',
  'Image',
  0,
  true,
  ARRAY['SUPER_ADMIN', 'BUSINESS_ADMIN']::text[],
  NOW(),
  NOW()
FROM menu_categories WHERE name = '콘텐츠 관리';

INSERT INTO menu_items (id, category_id, name, name_en, path, icon, "order", is_active, required_roles, created_at, updated_at)
SELECT
  gen_random_uuid(),
  id,
  '팝업 관리',
  'Popups',
  '/admin/popups',
  'MessageSquare',
  1,
  true,
  ARRAY['SUPER_ADMIN', 'BUSINESS_ADMIN']::text[],
  NOW(),
  NOW()
FROM menu_categories WHERE name = '콘텐츠 관리';

INSERT INTO menu_items (id, category_id, name, name_en, path, icon, "order", is_active, required_roles, created_at, updated_at)
SELECT
  gen_random_uuid(),
  id,
  '이벤트',
  'Events',
  '/admin/events',
  'Calendar',
  2,
  true,
  ARRAY['SUPER_ADMIN', 'BUSINESS_ADMIN']::text[],
  NOW(),
  NOW()
FROM menu_categories WHERE name = '콘텐츠 관리';

INSERT INTO menu_items (id, category_id, name, name_en, path, icon, "order", is_active, required_roles, created_at, updated_at)
SELECT
  gen_random_uuid(),
  id,
  '공지사항',
  'Notices',
  '/admin/notices',
  'Bell',
  3,
  true,
  ARRAY['SUPER_ADMIN', 'BUSINESS_ADMIN']::text[],
  NOW(),
  NOW()
FROM menu_categories WHERE name = '콘텐츠 관리';

-- 4. 시스템 관리 카테고리
INSERT INTO menu_categories (id, name, name_en, icon, "order", is_active, description, required_roles, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '시스템 관리',
  'System Management',
  'Settings2',
  3,
  true,
  '공통 코드 및 메뉴 관리',
  ARRAY['SUPER_ADMIN']::text[],
  NOW(),
  NOW()
);

INSERT INTO menu_items (id, category_id, name, name_en, path, icon, "order", is_active, required_roles, created_at, updated_at)
SELECT
  gen_random_uuid(),
  id,
  '공통 코드',
  'Common Codes',
  '/admin/common-codes',
  'Code',
  0,
  true,
  ARRAY['SUPER_ADMIN']::text[],
  NOW(),
  NOW()
FROM menu_categories WHERE name = '시스템 관리';

INSERT INTO menu_items (id, category_id, name, name_en, path, icon, "order", is_active, required_roles, created_at, updated_at)
SELECT
  gen_random_uuid(),
  id,
  '메뉴 관리',
  'Menu Management',
  '/admin/menu-management',
  'Settings',
  1,
  true,
  ARRAY['SUPER_ADMIN']::text[],
  NOW(),
  NOW()
FROM menu_categories WHERE name = '시스템 관리';

-- 결과 확인
SELECT
  mc.name AS category_name,
  COUNT(mi.id) AS menu_item_count,
  mc.required_roles AS category_roles
FROM menu_categories mc
LEFT JOIN menu_items mi ON mc.id = mi.category_id
GROUP BY mc.id, mc.name, mc."order", mc.required_roles
ORDER BY mc."order";
