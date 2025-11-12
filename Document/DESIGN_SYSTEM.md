# 모아(moa) 디자인 시스템

## 📌 디자인 철학

**"따뜻한 성장, 활기찬 연결"**

신세대 디자이너가 만든 모던하고 세련된 UI로, 사용자의 성장을 시각적으로 아름답게 표현합니다.

---

## 🎨 디자인 스타일

### 주요 스타일 요소

1. **글래스모피즘 (Glassmorphism)**
   - 반투명 배경 + 백드롭 블러
   - 레이어드 디자인
   - 빛과 그림자의 조화

2. **그라데이션 (Gradients)**
   - 부드러운 컬러 전환
   - 다층 그라데이션
   - 동적 컬러 시스템

3. **마이크로 인터랙션**
   - Framer Motion 애니메이션
   - Hover, Scale, Rotate 효과
   - 자연스러운 전환

4. **네오모피즘 요소**
   - 부드러운 그림자
   - 입체적 UI
   - 촉각적 느낌

---

## 🌈 컬러 시스템

### 레벨별 컬러

```css
/* 성장 레벨 */
--level-1: #8B7355  /* 씨앗 - 갈색 */
--level-2: #90EE90  /* 새싹 - 연두색 */
--level-3: #32CD32  /* 화분 - 초록색 */
--level-4: #228B22  /* 작은 나무 - 진한 초록 */
--level-5: #006400  /* 나무 - 더 진한 초록 */
--level-6: #2F4F4F  /* 큰 나무 - 다크 그린 */
--level-7: #FFD700  /* 열매나무 - 골드 */
```

### 뱃지 카테고리별 컬러

```css
/* 뱃지 */
--badge-basic: #60A5FA     /* 파랑 (기본 뱃지) */
--badge-host: #A78BFA      /* 보라 (호스트 뱃지) */
--badge-special: #F59E0B   /* 주황 (특별 뱃지) */
--badge-seasonal: #EC4899  /* 핑크 (계절 뱃지) */
```

### 기능별 컬러

```css
/* 포인트 */
--point-primary: #FBBF24   /* 골드 */
--point-bg: #FEF3C7        /* 연한 골드 */

/* 스트릭 */
--streak-fire: #EF4444     /* 빨강 (불꽃) */
--streak-bg: #FEE2E2       /* 연한 빨강 */

/* 순간 컬렉션 */
--moment-primary: #A855F7  /* 보라 */
--moment-rare: #F59E0B     /* 골드 (희귀) */

/* 관심사 숲 */
--forest-primary: #10B981  /* 에메랄드 */
--forest-bg: #D1FAE5       /* 연한 에메랄드 */
```

### 그라데이션 프리셋

```css
/* 글래스 효과 */
.glass {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.8),
    rgba(255, 255, 255, 0.4)
  );
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 성장 레벨 배경 */
.level-gradient {
  background: linear-gradient(
    135deg,
    #10B981 0%,
    #059669 100%
  );
}

/* 뱃지 그라데이션 */
.badge-gradient-basic {
  background: linear-gradient(135deg, #60A5FA, #3B82F6);
}
.badge-gradient-host {
  background: linear-gradient(135deg, #A78BFA, #8B5CF6);
}
.badge-gradient-special {
  background: linear-gradient(135deg, #F59E0B, #D97706);
}
```

---

## 🎭 애니메이션

### 기본 애니메이션

```typescript
// Fade In Up
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

// Scale In
const scaleIn = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  transition: { type: 'spring', stiffness: 200 }
};

// Rotate In
const rotateIn = {
  initial: { scale: 0, rotate: -180 },
  animate: { scale: 1, rotate: 0 },
  transition: { type: 'spring' }
};
```

### 프로그레스 바 애니메이션

```typescript
const progressAnimation = {
  initial: { width: 0 },
  animate: { width: `${progress}%` },
  transition: { duration: 1, ease: 'easeOut' }
};

// Shimmer 효과
const shimmerEffect = {
  animate: {
    x: ['-100%', '200%'],
  },
  transition: {
    repeat: Infinity,
    duration: 2,
    ease: 'linear',
  }
};
```

### 호버 애니메이션

```typescript
const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 }
};

const hoverRotate = {
  whileHover: { scale: 1.1, rotate: 5 }
};
```

---

## 📐 레이아웃

### 카드 디자인

```css
.card-glass {
  border-radius: 24px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.8),
    rgba(255, 255, 255, 0.4)
  );
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### 간격 시스템

```
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-2xl: 48px
```

### 반응형 그리드

```css
/* 프로필 레이아웃 */
.profile-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

@media (max-width: 1024px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 🔤 타이포그래피

### 폰트 시스템

```css
/* 기본 폰트 */
font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* 크기 */
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 30px;
--text-4xl: 36px;
--text-5xl: 48px;
--text-6xl: 60px;

/* 굵기 */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-black: 900;
```

### 텍스트 그라데이션

```css
.text-gradient {
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## 🎯 컴포넌트 가이드

### 1. GrowthLevel (성장 레벨)

**특징**:
- 대형 레벨 아이콘
- 동적 프로그레스 바
- 다음 레벨 프리뷰
- Shimmer 애니메이션

**색상**: 레벨별 동적 컬러
**애니메이션**: Scale in, Progress bar animation

### 2. BadgeGrid (뱃지 그리드)

**특징**:
- 4x5 그리드 레이아웃
- 카테고리별 그라데이션
- Hover 툴팁
- 잠금 상태 표시

**색상**: 카테고리별 그라데이션
**애니메이션**: Stagger animation, Hover scale & rotate

### 3. StreakCard (스트릭)

**특징**:
- 불꽃 이모지 애니메이션
- 마일스톤 표시
- 다음 보상 카운트다운

**색상**: 주황-빨강 그라데이션
**애니메이션**: Flame wiggle, Progress bar

### 4. PointsCard (포인트)

**특징**:
- 큰 포인트 숫자
- 월간 획득 표시
- 빠른 액션 버튼

**색상**: 골드 그라데이션
**애니메이션**: Scale in, Rotating background

### 5. MomentsCarousel (순간 컬렉션)

**특징**:
- 최근 순간 강조
- 희귀 순간 배지
- 카드 스타일

**색상**: 보라-핑크 그라데이션
**애니메이션**: Fade in, Icon rotate

### 6. InterestForestCard (관심사 숲)

**특징**:
- 나무 레벨 시각화
- 다양성 보너스
- 정렬된 리스트

**색상**: 에메랄드-틸 그라데이션
**애니메이션**: Slide in from left

### 7. StatsCard (통계)

**특징**:
- 2x2 그리드
- 아이콘 + 숫자
- 하단 강조선

**색상**: 다양한 그라데이션
**애니메이션**: Fade in up, Number scale

---

## 📱 반응형 디자인

### 브레이크포인트

```css
--mobile: 640px
--tablet: 768px
--desktop: 1024px
--wide: 1280px
```

### 모바일 최적화

```css
@media (max-width: 640px) {
  /* 카드 패딩 축소 */
  .card-glass {
    padding: 16px;
  }

  /* 폰트 크기 조정 */
  h1 { font-size: 28px; }
  h2 { font-size: 24px; }

  /* 그리드 1열로 */
  .grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 🌟 아이콘 시스템

### 이모지 사용 가이드

```
성장: 🌰 🌱 🪴 🌿 🌳 🌲 🌳🍎
뱃지: ✅ ⏰ 💬 ❤️ 🎯 🎪 👑 🔥 🌈
포인트: ✨ 💎 🎁
스트릭: 🔥 (다중 사용)
순간: 📸 🎉 💯 🤝
통계: 📊 ⭐ 🎯
```

---

## 🎨 사용 예시

### 전체 프로필 페이지

```typescript
// src/app/(main)/profile/page.tsx
// 참조: 이미 생성된 파일
```

---

## 📝 구현 노트

### 필수 패키지

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0",
    "date-fns": "^3.0.0"
  }
}
```

### Tailwind 설정

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
      },
    },
  },
}
```

---

**문서 버전**: 1.0
**최종 수정일**: 2025-11-10
**작성자**: Design Team
