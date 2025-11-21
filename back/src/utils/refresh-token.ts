import crypto from 'crypto';
import { prisma } from '../config/prisma';

// Refresh Token 해시 생성
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Refresh Token DB에 저장
export const saveRefreshToken = async (
  userId: string,
  token: string,
  deviceInfo?: string,
  ipAddress?: string
): Promise<void> => {
  const hashedToken = hashToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30일

  await prisma.refreshToken.create({
    data: {
      userId,
      token: hashedToken,
      expiresAt,
      deviceInfo,
      ipAddress,
    },
  });
};

// Refresh Token 검증
export const verifyRefreshTokenInDb = async (
  token: string
): Promise<{ userId: string; email: string } | null> => {
  const hashedToken = hashToken(token);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: hashedToken },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          userRoles: {
            select: {
              roleCode: true,
              isPrimary: true,
            },
          },
        },
      },
    },
  });

  if (!storedToken) {
    return null;
  }

  // 만료 확인
  if (storedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    return null;
  }

  // 무효화 확인
  if (storedToken.isRevoked) {
    return null;
  }

  // 마지막 사용 시간 업데이트
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { lastUsedAt: new Date() },
  });

  return {
    userId: storedToken.user.id,
    email: storedToken.user.email,
  };
};

// Refresh Token 무효화 (로그아웃)
export const revokeRefreshToken = async (token: string): Promise<void> => {
  const hashedToken = hashToken(token);

  await prisma.refreshToken.updateMany({
    where: { token: hashedToken },
    data: { isRevoked: true },
  });
};

// 사용자의 모든 Refresh Token 무효화 (모든 기기에서 로그아웃)
export const revokeAllUserTokens = async (userId: string): Promise<void> => {
  await prisma.refreshToken.updateMany({
    where: { userId },
    data: { isRevoked: true },
  });
};

// 만료된 Refresh Token 정리 (크론 작업 등에서 사용)
export const cleanupExpiredTokens = async (): Promise<number> => {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return result.count;
};
