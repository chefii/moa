# 배지 자동 지급 서비스 사용 가이드

## 개요

데이터 기반 배지 자동 지급 시스템입니다. 관리자가 배지를 추가하면 **코드 수정 없이** 자동으로 획득 로직이 적용됩니다.

## 작동 원리

1. 관리자가 배지를 생성 (conditionType, conditionValue 지정)
2. 사용자가 특정 액션 수행 (예: 모임 참여, 리뷰 작성)
3. 시스템이 자동으로 해당 조건의 배지들을 조회
4. 사용자의 실제 값을 계산하고 조건 비교
5. 조건을 만족하면 자동으로 배지 지급

## 사용 방법

### 1. 특정 액션 발생 시 (권장)

특정 액션이 발생했을 때 관련 배지만 체크합니다. **성능이 가장 좋습니다.**

```typescript
import badgeService from '@/services/badgeService';

// 모임 참여 완료 시
router.post('/gatherings/:id/join', async (req, res) => {
  // ... 모임 참여 처리 로직

  // 관련 배지 자동 체크 및 지급
  await badgeService.checkBadgesForAction(userId, 'PARTICIPATE_GATHERING');

  res.json({ success: true });
});

// 모임 주최 시
router.post('/gatherings', async (req, res) => {
  // ... 모임 생성 로직

  await badgeService.checkBadgesForAction(userId, 'HOST_GATHERING');

  res.json({ success: true });
});

// 리뷰 작성 시
router.post('/reviews', async (req, res) => {
  // ... 리뷰 작성 로직

  await badgeService.checkBadgesForAction(userId, 'WRITE_REVIEW');

  res.json({ success: true });
});

// 친구 추가 시
router.post('/friends/:id', async (req, res) => {
  // ... 친구 추가 로직

  await badgeService.checkBadgesForAction(userId, 'ADD_FRIEND');

  res.json({ success: true });
});
```

**지원되는 액션:**
- `PARTICIPATE_GATHERING` - 모임 참여 (참여 횟수, 참석률)
- `HOST_GATHERING` - 모임 주최 (주최 횟수)
- `WRITE_REVIEW` - 리뷰 작성 (리뷰 횟수)
- `DAILY_LOGIN` - 일일 로그인 (연속 출석)
- `ADD_FRIEND` - 친구 추가 (친구 수)
- `SEND_CHAT` - 채팅 전송 (채팅 횟수)
- `COMPLETE_CHALLENGE` - 챌린지 완료 (챌린지 수)

### 2. 특정 조건 타입만 체크

```typescript
import badgeService from '@/services/badgeService';

// 참여 횟수 관련 배지만 체크
await badgeService.checkBadgesByConditionType(userId, 'PARTICIPATION_COUNT');

// 평점 관련 배지만 체크
await badgeService.checkBadgesByConditionType(userId, 'RATING_SCORE');
```

### 3. 모든 배지 종합 체크

사용자 프로필 로딩 시나 주기적인 배치 작업에 사용합니다.

```typescript
import badgeService from '@/services/badgeService';

// 모든 배지 조건 체크 및 지급
await badgeService.checkAllBadges(userId);
```

## 관리자가 새 배지 추가하는 방법

### 예시: "채팅왕" 배지 추가

관리자 페이지에서 다음과 같이 배지를 추가하면 **자동으로 작동**합니다:

```json
{
  "code": "CHAT_MASTER",
  "name": "채팅왕",
  "description": "채팅 1000개 이상 전송",
  "icon": "💬",
  "category": "SPECIAL",
  "conditionType": "CHAT_COUNT",
  "conditionValue": 1000,
  "isActive": true
}
```

코드 수정 없이 즉시 적용됩니다!

- 사용자가 채팅 1000개를 전송하면
- `checkBadgesForAction(userId, 'SEND_CHAT')` 호출 시
- 자동으로 "채팅왕" 배지가 지급됩니다

## 지원되는 조건 타입

| conditionType | 설명 | 조건 로직 |
|--------------|------|---------|
| `PARTICIPATION_COUNT` | 모임 참여 횟수 | 값 이상 |
| `HOSTING_COUNT` | 모임 주최 횟수 | 값 이상 |
| `ATTENDANCE_RATE` | 참석률 (%) | 값 이상 (최소 10회) |
| `REVIEW_COUNT` | 리뷰 작성 횟수 | 값 이상 |
| `STREAK_DAYS` | 연속 출석 일수 | 값 이상 |
| `RATING_SCORE` | 평균 평점 x10 | 값 이상 (최소 10회) |
| `EARLY_USER` | 가입 순서 | 값 이하 |
| `NO_LATE` | 지각 횟수 | 값과 동일 (보통 0) |
| `CHAT_COUNT` | 채팅 메시지 수 | 값 이상 |
| `FRIEND_COUNT` | 친구 수 | 값 이상 |
| `CHALLENGE_COUNT` | 챌린지 완료 수 | 값 이상 |

## 통합 예시

### gathering-participants 라우터에 통합

```typescript
// src/routes/gathering-participants.ts
import badgeService from '@/services/badgeService';

// 모임 참여 승인
router.patch('/:id/approve', authenticate, async (req, res) => {
  const participant = await prisma.gatheringParticipant.update({
    where: { id: req.params.id },
    data: { status: 'APPROVED' },
  });

  // 배지 자동 체크
  await badgeService.checkBadgesForAction(participant.userId, 'PARTICIPATE_GATHERING');

  res.json({ success: true, data: participant });
});

// 참석 체크
router.patch('/:id/check-in', authenticate, async (req, res) => {
  const participant = await prisma.gatheringParticipant.update({
    where: { id: req.params.id },
    data: { attended: true },
  });

  // 참석률 배지 자동 체크
  await badgeService.checkBadgesByConditionType(participant.userId, 'ATTENDANCE_RATE');

  res.json({ success: true, data: participant });
});
```

### 주기적인 배치 작업 (선택사항)

```typescript
// src/jobs/badge-checker.ts
import badgeService from '@/services/badgeService';

// 매일 자정 전체 사용자 배지 체크 (선택사항)
async function dailyBadgeCheck() {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  for (const user of users) {
    await badgeService.checkAllBadges(user.id);
  }

  console.log(`✅ ${users.length}명의 배지 체크 완료`);
}
```

## 주의사항

1. **성능 최적화**: 가능한 `checkBadgesForAction()`을 사용하세요 (특정 조건만 체크)
2. **비동기 처리**: 배지 체크는 await 없이 백그라운드로 실행 가능
   ```typescript
   // 응답 속도가 중요한 경우
   badgeService.checkBadgesForAction(userId, 'PARTICIPATE_GATHERING'); // await 제거
   res.json({ success: true });
   ```
3. **중복 지급 방지**: 이미 보유한 배지는 자동으로 스킵됩니다
4. **비활성 배지**: `isActive: false` 배지는 지급되지 않습니다

## 로그 확인

배지 지급 시 콘솔에 로그가 출력됩니다:

```
🏅 배지 자동 지급 시작 - 사용자: user-123
📊 [PARTICIPATION_COUNT] 사용자 값: 15
✅ 배지 지급 완료: 신입 모아러 -> 사용자 user-123
✅ 배지 지급 완료: 활발한 참여자 -> 사용자 user-123
📊 [HOSTING_COUNT] 사용자 값: 5
✅ 배지 지급 완료: 모임 메이커 -> 사용자 user-123
✨ 배지 자동 지급 완료
```
