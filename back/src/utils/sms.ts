import logger from '../config/logger';
import axios from 'axios';

/**
 * SMS 발송 유틸리티
 *
 * 사용 가능한 SMS 서비스:
 * 1. NHN Cloud SMS (구 Toast SMS) - https://www.toast.com/kr/service/notification/sms
 * 2. 알리고 (Aligo) - https://smartsms.aligo.in/
 * 3. 카카오 알림톡 - https://business.kakao.com/info/alimtalk/
 * 4. 네이버 클라우드 SMS - https://www.ncloud.com/product/applicationService/sens
 *
 * 아래는 NHN Cloud SMS 기준 예시입니다.
 */

interface SMSResult {
  success: boolean;
  message?: string;
}

// 6자리 랜덤 인증 코드 생성
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * SMS 발송 (NHN Cloud SMS 예시)
 * 실제 사용 시 환경변수 설정 필요:
 * - SMS_APP_KEY: NHN Cloud SMS 앱키
 * - SMS_SECRET_KEY: NHN Cloud SMS 시크릿키
 * - SMS_SENDER: 발신번호 (사전 등록 필요)
 */
export const sendSMS = async (
  phoneNumber: string,
  message: string
): Promise<SMSResult> => {
  // 개발 환경에서는 콘솔에 출력
  if (process.env.NODE_ENV === 'development') {
    logger.info('=== SMS 발송 (개발 모드) ===');
    logger.info('수신번호:', phoneNumber);
    logger.info('메시지:', message);
    logger.info('===========================');
    return { success: true, message: 'Development mode - SMS logged to console' };
  }

  try {
    // NHN Cloud SMS API 호출 예시
    const response = await axios.post(
      `https://api-sms.cloud.toast.com/sms/v2.4/appKeys/${process.env.SMS_APP_KEY}/sender/sms`,
      {
        body: message,
        sendNo: process.env.SMS_SENDER, // 발신번호
        recipientList: [
          {
            recipientNo: phoneNumber.replace(/-/g, ''), // 하이픈 제거
            internationalRecipientNo: phoneNumber.startsWith('+82') ? phoneNumber : undefined,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'X-Secret-Key': process.env.SMS_SECRET_KEY,
        },
      }
    );

    if (response.data.header.isSuccessful) {
      return { success: true };
    } else {
      return {
        success: false,
        message: response.data.header.resultMessage,
      };
    }
  } catch (error) {
    logger.error('SMS send error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'SMS 발송 실패',
    };
  }
};

/**
 * 인증번호 SMS 발송
 */
export const sendVerificationSMS = async (
  phoneNumber: string,
  code: string
): Promise<SMSResult> => {
  const message = `[모아] 인증번호는 [${code}]입니다. 타인에게 노출하지 마세요.`;
  return sendSMS(phoneNumber, message);
};

/**
 * 알리고 SMS 발송 (대안)
 */
export const sendSMSAligo = async (
  phoneNumber: string,
  message: string
): Promise<SMSResult> => {
  if (process.env.NODE_ENV === 'development') {
    logger.info('=== 알리고 SMS 발송 (개발 모드) ===');
    logger.info('수신번호:', phoneNumber);
    logger.info('메시지:', message);
    logger.info('====================================');
    return { success: true };
  }

  try {
    const params = new URLSearchParams({
      key: process.env.ALIGO_API_KEY || '',
      user_id: process.env.ALIGO_USER_ID || '',
      sender: process.env.SMS_SENDER || '',
      receiver: phoneNumber.replace(/-/g, ''),
      msg: message,
      testmode_yn: process.env.NODE_ENV === 'development' ? 'Y' : 'N',
    });

    const response = await axios.post('https://apis.aligo.in/send/', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.data.result_code === '1') {
      return { success: true };
    } else {
      return {
        success: false,
        message: response.data.message,
      };
    }
  } catch (error) {
    logger.error('Aligo SMS send error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'SMS 발송 실패',
    };
  }
};

/**
 * 네이버 클라우드 SMS 발송 (대안)
 */
export const sendSMSNaver = async (
  phoneNumber: string,
  message: string
): Promise<SMSResult> => {
  if (process.env.NODE_ENV === 'development') {
    logger.info('=== 네이버 클라우드 SMS 발송 (개발 모드) ===');
    logger.info('수신번호:', phoneNumber);
    logger.info('메시지:', message);
    logger.info('==========================================');
    return { success: true };
  }

  try {
    const timestamp = Date.now().toString();
    const serviceId = process.env.NAVER_SMS_SERVICE_ID || '';

    // HMAC signature 생성 로직은 네이버 클라우드 문서 참고
    // https://api.ncloud-docs.com/docs/common-ncpapi

    const response = await axios.post(
      `https://sens.apigw.ntruss.com/sms/v2/services/${serviceId}/messages`,
      {
        type: 'SMS',
        contentType: 'COMM',
        countryCode: '82',
        from: process.env.SMS_SENDER?.replace(/-/g, ''),
        content: message,
        messages: [
          {
            to: phoneNumber.replace(/-/g, ''),
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'x-ncp-apigw-timestamp': timestamp,
          'x-ncp-iam-access-key': process.env.NAVER_ACCESS_KEY,
          // 'x-ncp-apigw-signature-v2': signature, // 서명 생성 필요
        },
      }
    );

    if (response.data.statusCode === '202') {
      return { success: true };
    } else {
      return {
        success: false,
        message: response.data.statusName,
      };
    }
  } catch (error) {
    logger.error('Naver Cloud SMS send error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'SMS 발송 실패',
    };
  }
};

/**
 * 전화번호 유효성 검사
 */
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // 한국 전화번호 형식: 010-1234-5678, 01012345678, +821012345678
  const koreanPhoneRegex = /^(\+82|0)1[0-9]-?\d{3,4}-?\d{4}$/;
  return koreanPhoneRegex.test(phoneNumber);
};

/**
 * 전화번호 포맷팅 (하이픈 추가)
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');

  if (cleaned.startsWith('82')) {
    // +82 형식
    const number = cleaned.slice(2);
    return `+82-${number.slice(0, 2)}-${number.slice(2, 6)}-${number.slice(6)}`;
  } else {
    // 010 형식
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
};
