import nodemailer from 'nodemailer';

// Create transporter (개발 환경에서는 SMTP 설정이 없어도 동작)
const createTransporter = () => {
  // SMTP 설정이 있는 경우에만 실제 transporter 생성
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
};

const transporter = createTransporter();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  // SMTP 설정이 없는 경우에만 콘솔 출력
  if (!transporter) {
    console.log('=== 이메일 발송 (개발 모드 - SMTP 미설정) ===');
    console.log('수신:', options.to);
    console.log('제목:', options.subject);
    console.log('본문 미리보기:', options.html.substring(0, 200) + '...');
    console.log('============================');
    return true;
  }

  try {
    // 실제 이메일 발송
    const info = await transporter.sendMail({
      from: `"모아 (MOA)" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log('✅ 이메일 발송 성공:', info.messageId);
    console.log('수신자:', options.to);
    console.log('제목:', options.subject);
    return true;
  } catch (error) {
    console.error('❌ 이메일 발송 실패:', error);
    return false;
  }
};

export const sendVerificationEmail = async (
  email: string,
  name: string,
  verificationToken: string
): Promise<boolean> => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            background: #f5f5f5;
            padding: 20px;
          }
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
            padding: 50px 40px;
            text-align: center;
            color: white;
          }
          .logo {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .header-title {
            font-size: 28px;
            font-weight: 800;
            margin: 0;
            letter-spacing: -0.5px;
          }
          .content {
            padding: 40px;
            color: #1f2937;
          }
          .greeting {
            font-size: 20px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 20px;
          }
          .message {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 15px;
            line-height: 1.8;
          }
          .button-container {
            text-align: center;
            margin: 35px 0;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
            color: white !important;
            padding: 18px 50px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 700;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(147, 51, 234, 0.4);
            transition: all 0.3s ease;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(147, 51, 234, 0.5);
          }
          .link-section {
            background: #f9fafb;
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
            border: 1px solid #e5e7eb;
          }
          .link-label {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 10px;
            font-weight: 600;
          }
          .link-url {
            color: #9333ea;
            word-break: break-all;
            font-size: 13px;
            text-decoration: none;
          }
          .warning-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            border-radius: 8px;
            padding: 16px 20px;
            margin: 30px 0;
          }
          .warning-title {
            display: flex;
            align-items: center;
            font-weight: 700;
            color: #92400e;
            margin-bottom: 8px;
            font-size: 15px;
          }
          .warning-icon {
            font-size: 20px;
            margin-right: 8px;
          }
          .warning-text {
            color: #92400e;
            font-size: 14px;
            line-height: 1.6;
          }
          .footer {
            background: #f9fafb;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer-text {
            font-size: 13px;
            color: #6b7280;
            margin: 5px 0;
          }
          .footer-brand {
            font-weight: 700;
            color: #9333ea;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <!-- Header -->
          <div class="header">
            <div class="logo">🎉</div>
            <h1 class="header-title">이메일 인증</h1>
          </div>

          <!-- Content -->
          <div class="content">
            <div class="greeting">안녕하세요, ${name}님!</div>

            <p class="message">
              모아(MOA) 서비스에 가입해주셔서 진심으로 감사드립니다.<br>
              아래 버튼을 클릭하여 이메일 인증을 완료해주세요.
            </p>

            <div class="button-container">
              <a href="${verificationUrl}" class="button">
                ✓ 이메일 인증하기
              </a>
            </div>

            <div class="link-section">
              <div class="link-label">버튼이 작동하지 않나요? 아래 링크를 복사하여 브라우저에 붙여넣으세요</div>
              <a href="${verificationUrl}" class="link-url">${verificationUrl}</a>
            </div>

            <div class="warning-box">
              <div class="warning-title">
                <span class="warning-icon">⚠️</span>
                중요한 안내
              </div>
              <div class="warning-text">
                • 이 인증 링크는 <strong>1시간 후 만료</strong>됩니다.<br>
                • 본인이 가입하지 않았다면 이 이메일을 무시하셔도 됩니다.<br>
                • 링크는 일회용이며, 사용 후 재사용할 수 없습니다.
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p class="footer-text">이 이메일은 발신 전용입니다.</p>
            <p class="footer-text">문의사항은 고객센터를 이용해주세요.</p>
            <p class="footer-brand">© 2024 모아 (MOA). All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: '[모아] 이메일 인증을 완료해주세요',
    html,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetToken: string
): Promise<boolean> => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            background: #f5f5f5;
            padding: 20px;
          }
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #dc2626 0%, #f97316 100%);
            padding: 50px 40px;
            text-align: center;
            color: white;
          }
          .logo {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .header-title {
            font-size: 28px;
            font-weight: 800;
            margin: 0;
            letter-spacing: -0.5px;
          }
          .content {
            padding: 40px;
            color: #1f2937;
          }
          .greeting {
            font-size: 20px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 20px;
          }
          .message {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 15px;
            line-height: 1.8;
          }
          .button-container {
            text-align: center;
            margin: 35px 0;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #dc2626 0%, #f97316 100%);
            color: white !important;
            padding: 18px 50px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 700;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
            transition: all 0.3s ease;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(220, 38, 38, 0.5);
          }
          .warning-box {
            background: #fee2e2;
            border-left: 4px solid #dc2626;
            border-radius: 8px;
            padding: 16px 20px;
            margin: 30px 0;
          }
          .warning-title {
            display: flex;
            align-items: center;
            font-weight: 700;
            color: #991b1b;
            margin-bottom: 8px;
            font-size: 15px;
          }
          .warning-icon {
            font-size: 20px;
            margin-right: 8px;
          }
          .warning-text {
            color: #991b1b;
            font-size: 14px;
            line-height: 1.6;
          }
          .footer {
            background: #f9fafb;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer-text {
            font-size: 13px;
            color: #6b7280;
            margin: 5px 0;
          }
          .footer-brand {
            font-weight: 700;
            color: #dc2626;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <!-- Header -->
          <div class="header">
            <div class="logo">🔐</div>
            <h1 class="header-title">비밀번호 재설정</h1>
          </div>

          <!-- Content -->
          <div class="content">
            <div class="greeting">안녕하세요, ${name}님!</div>

            <p class="message">
              비밀번호 재설정 요청을 받았습니다.<br>
              아래 버튼을 클릭하여 새로운 비밀번호를 설정해주세요.
            </p>

            <div class="button-container">
              <a href="${resetUrl}" class="button">
                🔑 비밀번호 재설정하기
              </a>
            </div>

            <div class="warning-box">
              <div class="warning-title">
                <span class="warning-icon">⚠️</span>
                보안 주의사항
              </div>
              <div class="warning-text">
                • 이 링크는 <strong>1시간 후 만료</strong>됩니다.<br>
                • 비밀번호 재설정을 요청하지 않았다면 즉시 고객센터에 연락해주세요.<br>
                • 링크는 일회용이며, 사용 후 재사용할 수 없습니다.
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p class="footer-text">이 이메일은 발신 전용입니다.</p>
            <p class="footer-text">문의사항은 고객센터를 이용해주세요.</p>
            <p class="footer-brand">© 2024 모아 (MOA). All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: '[모아] 비밀번호 재설정',
    html,
  });
};
