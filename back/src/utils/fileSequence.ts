import { PrismaClient } from '@prisma/client';
import { FileUploadType, mapUploadTypeToFileType } from './fileUploadConfig';

const prisma = new PrismaClient();

/**
 * 현재 날짜를 YYMMDD 형식으로 반환
 */
function getCurrentDateString(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // YY
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // MM
  const day = now.getDate().toString().padStart(2, '0'); // DD
  return `${year}${month}${day}`;
}

/**
 * 다음 파일 순번을 가져옵니다 (날짜별, 타입별로 관리)
 * @param uploadType 파일 업로드 타입
 * @returns 다음 순번 (7자리 숫자)
 */
export async function getNextFileSequence(uploadType: FileUploadType): Promise<number> {
  const date = getCurrentDateString();
  const fileType = mapUploadTypeToFileType(uploadType) as any;

  try {
    // 트랜잭션으로 처리하여 동시성 문제 방지
    const result = await prisma.$transaction(async (tx) => {
      // 현재 날짜+타입의 순번 조회 또는 생성
      let sequenceRecord = await tx.fileSequence.findUnique({
        where: {
          date_fileType: {
            date,
            fileType,
          },
        },
      });

      // 레코드가 없으면 새로 생성
      if (!sequenceRecord) {
        sequenceRecord = await tx.fileSequence.create({
          data: {
            date,
            fileType,
            sequence: 1,
          },
        });
        return 1;
      }

      // 순번 증가
      const nextSequence = sequenceRecord.sequence + 1;
      await tx.fileSequence.update({
        where: {
          date_fileType: {
            date,
            fileType,
          },
        },
        data: {
          sequence: nextSequence,
        },
      });

      return nextSequence;
    });

    return result;
  } catch (error) {
    console.error('Error getting next file sequence:', error);
    throw new Error('Failed to generate file sequence');
  }
}

/**
 * 물리 파일명을 생성합니다 (YYMMDD-0000001.jpg 형식)
 * @param uploadType 파일 업로드 타입
 * @param extension 파일 확장자 (.jpg 등)
 * @returns 물리 파일명
 */
export async function generatePhysicalFileName(
  uploadType: FileUploadType,
  extension: string
): Promise<string> {
  const date = getCurrentDateString();
  const sequence = await getNextFileSequence(uploadType);
  const paddedSequence = sequence.toString().padStart(7, '0');

  return `${date}-${paddedSequence}${extension}`;
}
