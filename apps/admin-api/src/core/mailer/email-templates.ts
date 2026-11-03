export interface FormattedEmail {
  subject: string;
  text: string;
  html: string;
}

function wrapAdminEmailLayout(contentHtml: string): string {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAF7F2; padding: 40px 20px; border: 1px solid #EAE3D9;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 24px; font-weight: 900; letter-spacing: 4px; color: #2B1810; margin: 0; text-transform: uppercase;">N I D A</h1>
        <p style="font-size: 11px; letter-spacing: 2px; color: #8C7A6B; margin-top: 5px; text-transform: uppercase;">Back-Office Portal</p>
      </div>
      <div style="background-color: #FFFFFF; padding: 30px; border: 1px solid #EAE3D9;">
        ${contentHtml}
      </div>
      <div style="text-align: center; margin-top: 25px;">
        <p style="font-size: 10px; color: #A89F91; letter-spacing: 1px;">&copy; 2026 NIDA APPAREL & LIFESTYLE. ALL RIGHTS RESERVED.</p>
      </div>
    </div>
  `;
}

export function formatAdminInvitationEmail(
  fullName: string,
  setupUrl: string,
): FormattedEmail {
  const subject = 'ยินดีต้อนรับสู่ Nida Admin Portal — ตั้งค่ารหัสผ่านของคุณ';
  const text = `เรียนคุณ ${fullName}\n\nกรุณาคลิกลิงก์ด้านล่างเพื่อตั้งรหัสผ่านและเปิดใช้งานบัญชีของคุณ:\n${setupUrl}`;
  const contentHtml = `
    <h2 style="font-size: 16px; font-weight: 700; color: #2B1810; margin-bottom: 15px;">คำเชิญเข้าสู่ระบบแอดมิน</h2>
    <p style="font-size: 13px; color: #666666; line-height: 1.6; margin-bottom: 25px;">
      เรียนคุณ <strong>${fullName}</strong>,<br>
      บัญชีผู้ดูแลระบบของคุณได้รับการสร้างเรียบร้อยแล้ว กรุณากดปุ่มด้านล่างเพื่อตั้งรหัสผ่านและเริ่มใช้งานระบบ
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${setupUrl}" style="background-color: #2B1810; color: #FFFFFF; text-decoration: none; padding: 12px 30px; font-size: 12px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; display: inline-block;">
        ตั้งรหัสผ่านบัญชี
      </a>
    </div>
    <p style="font-size: 11px; color: #999999; word-break: break-all; margin-top: 25px;">
      หรือคัดลอกลิงก์นี้เปิดบนเบราว์เซอร์: ${setupUrl}
    </p>
  `;

  return {
    subject,
    text,
    html: wrapAdminEmailLayout(contentHtml),
  };
}

export function formatPasswordResetEmail(resetUrl: string): FormattedEmail {
  const subject = 'รีเซ็ตรหัสผ่านบัญชี — Nida Back-Office';
  const text = `คุณได้ทำการร้องขอรีเซ็ตรหัสผ่าน กรุณาคลิกลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่ (ลิงก์มีอายุ 15 นาที):\n${resetUrl}`;
  const contentHtml = `
    <h2 style="font-size: 16px; font-weight: 700; color: #2B1810; margin-bottom: 15px;">คำขอรีเซ็ตรหัสผ่าน</h2>
    <p style="font-size: 13px; color: #666666; line-height: 1.6; margin-bottom: 25px;">
      คุณได้ส่งคำขอรีเซ็ตรหัสผ่านสำหรับเข้าใช้งานระบบ Nida Back-Office กรุณากดปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่ ลิงก์นี้มีอายุ 15 นาที
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background-color: #2B1810; color: #FFFFFF; text-decoration: none; padding: 12px 30px; font-size: 12px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; display: inline-block;">
        รีเซ็ตรหัสผ่าน
      </a>
    </div>
    <p style="font-size: 11px; color: #999999; word-break: break-all;">
      หากคุณไม่ได้ส่งคำขอนี้ โปรดติดต่อผู้ดูแลระบบสูงสุดทันที
    </p>
  `;

  return {
    subject,
    text,
    html: wrapAdminEmailLayout(contentHtml),
  };
}
