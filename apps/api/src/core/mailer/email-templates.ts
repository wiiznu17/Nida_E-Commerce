export interface FormattedEmail {
  subject: string;
  text: string;
  html: string;
}

function wrapCustomerEmailLayout(contentHtml: string): string {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAF7F2; padding: 40px 20px; border: 1px solid #EAE3D9;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 24px; font-weight: 900; letter-spacing: 4px; color: #2B1810; margin: 0; text-transform: uppercase;">N I D A</h1>
        <p style="font-size: 11px; letter-spacing: 2px; color: #8C7A6B; margin-top: 5px; text-transform: uppercase;">Modern Heritage Apparel</p>
      </div>
      <div style="background-color: #FFFFFF; padding: 30px; border: 1px solid #EAE3D9; text-align: center;">
        ${contentHtml}
      </div>
      <div style="text-align: center; margin-top: 25px;">
        <p style="font-size: 10px; color: #A89F91; letter-spacing: 1px;">&copy; 2026 NIDA APPAREL & LIFESTYLE. ALL RIGHTS RESERVED.</p>
      </div>
    </div>
  `;
}

export function formatOtpEmail(otpCode: string): FormattedEmail {
  const subject = `รหัสยืนยันการเข้าสู่ระบบ NIDA — OTP: ${otpCode}`;
  const text = `รหัส OTP สำหรับเข้าสู่ระบบ NIDA ของคุณคือ: ${otpCode} (รหัสนี้มีอายุ 5 นาที โปรดอย่าเปิดเผยแก่ผู้อื่น)`;
  const contentHtml = `
    <h2 style="font-size: 16px; font-weight: 700; color: #2B1810; margin-bottom: 15px;">รหัสยืนยันตัวตนสำหรับเข้าสู่ระบบ</h2>
    <p style="font-size: 13px; color: #666666; line-height: 1.6; margin-bottom: 25px;">
      กรุณาใช้รหัส OTP ด้านล่างนี้เพื่อยืนยันตัวตนในระบบ Nida Storefront รหัสนี้สามารถใช้งานได้ภายใน 5 นาที
    </p>
    <div style="background-color: #FAF7F2; border: 1px dashed #D4C5B9; padding: 18px 24px; display: inline-block; margin-bottom: 25px;">
      <span style="font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #2B1810;">${otpCode}</span>
    </div>
    <p style="font-size: 11px; color: #999999; margin: 0;">
      หากคุณไม่ได้เป็นผู้ร้องขอรหัสนี้ สามารถเพิกเฉยต่ออีเมลฉบับนี้ได้อย่างปลอดภัย เจ้าหน้าที่ NIDA จะไม่มีวันติดต่อเพื่อขอรหัสนี้จากคุณ
    </p>
  `;

  return {
    subject,
    text,
    html: wrapCustomerEmailLayout(contentHtml),
  };
}

export function formatOrderConfirmationEmail(
  orderNumber: string,
  totalAmount: number,
): FormattedEmail {
  const subject = `ยืนยันคำสั่งซื้อ #${orderNumber} — NIDA Official`;
  const text = `คำสั่งซื้อ #${orderNumber} ได้รับการบันทึกเรียบร้อยแล้ว ยอดชำระรวม ฿${totalAmount.toLocaleString()}`;
  const contentHtml = `
    <div style="text-align: left;">
      <h2 style="font-size: 16px; font-weight: 700; color: #2B1810; margin-bottom: 10px;">ขอบคุณสำหรับคำสั่งซื้อของคุณ</h2>
      <p style="font-size: 13px; color: #666666; line-height: 1.6;">
        คำสั่งซื้อหมายเลข <strong>#${orderNumber}</strong> ได้รับการยืนยันแล้ว
      </p>
      <div style="margin: 20px 0; padding: 15px; background-color: #FAF7F2; border-left: 3px solid #2B1810;">
        <p style="margin: 0; font-size: 13px; color: #2B1810;">
          ยอดชำระรวมทั้งสิ้น: <strong>฿${totalAmount.toLocaleString()}</strong>
        </p>
      </div>
    </div>
  `;

  return {
    subject,
    text,
    html: wrapCustomerEmailLayout(contentHtml),
  };
}

