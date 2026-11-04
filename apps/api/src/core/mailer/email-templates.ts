export interface FormattedEmail {
  subject: string;
  text: string;
  html: string;
}

export interface OrderItemEmailSnippet {
  title: string;
  variantSummary?: string;
  quantity: number;
  price: number;
  imageUrl?: string | null;
}

export interface OrderShippedEmailData {
  orderNumber: string;
  recipientName: string;
  courierName: string;
  trackingNumber: string;
  trackingUrl: string;
  items?: OrderItemEmailSnippet[];
  shippingAddressSummary?: string;
}

export interface TaxInvoiceReceiptEmailData {
  orderNumber: string;
  invoiceNumber: string;
  issuedAt: string;
  buyerName: string;
  buyerTaxId?: string;
  buyerBranch?: string;
  buyerAddress?: string;
  preVatAmount: number;
  vatAmount: number;
  totalAmount: number;
  viewUrl: string;
}

export interface OrderCancelledEmailData {
  orderNumber: string;
  reason?: string;
  cancelledAt?: string;
  storefrontUrl?: string;
}

export interface RefundProcessedEmailData {
  orderNumber: string;
  refundNumber: string;
  amount: number;
  reason?: string;
  paymentMethod?: string;
  estimatedTimeline?: string;
  storefrontUrl?: string;
}

function wrapCustomerEmailLayout(contentHtml: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAF7F2; padding: 40px 20px; border: 1px solid #EAE3D9; color: #2B1810;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 24px; font-weight: 900; letter-spacing: 4px; color: #2B1810; margin: 0; text-transform: uppercase;">N I D A</h1>
        <p style="font-size: 11px; letter-spacing: 2px; color: #8C7A6B; margin-top: 6px; text-transform: uppercase;">Modern Heritage Apparel</p>
      </div>
      <div style="background-color: #FFFFFF; padding: 32px 28px; border: 1px solid #EAE3D9;">
        ${contentHtml}
      </div>
      <div style="text-align: center; margin-top: 25px;">
        <p style="font-size: 10px; color: #A89F91; letter-spacing: 1px; margin: 0; text-transform: uppercase;">
          &copy; 2026 NIDA APPAREL & LIFESTYLE. ALL RIGHTS RESERVED.
        </p>
        <p style="font-size: 10px; color: #A89F91; margin-top: 4px;">
          BANGKOK &middot; THAILAND
        </p>
      </div>
    </div>
  `;
}

export function formatOtpEmail(otpCode: string): FormattedEmail {
  const subject = `รหัสยืนยันการเข้าสู่ระบบ NIDA — OTP: ${otpCode}`;
  const text = `รหัส OTP สำหรับเข้าสู่ระบบ NIDA ของคุณคือ: ${otpCode} (รหัสนี้มีอายุ 5 นาที โปรดอย่าเปิดเผยแก่ผู้อื่น)`;
  const contentHtml = `
    <div style="text-align: center;">
      <span style="font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #8C7A6B; text-transform: uppercase;">VERIFICATION CODE</span>
      <h2 style="font-size: 18px; font-weight: 800; color: #2B1810; margin: 8px 0 16px;">รหัสยืนยันตัวตนสำหรับเข้าสู่ระบบ</h2>
      <p style="font-size: 13px; color: #666666; line-height: 1.6; margin: 0 0 24px;">
        กรุณาใช้รหัส OTP ด้านล่างนี้เพื่อยืนยันตัวตนในระบบ NIDA Storefront รหัสนี้สามารถใช้งานได้ภายใน 5 นาที
      </p>
      <div style="background-color: #FAF7F2; border: 1px dashed #D4C5B9; padding: 18px 24px; display: inline-block; margin-bottom: 24px;">
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #2B1810;">${otpCode}</span>
      </div>
      <p style="font-size: 11px; color: #999999; line-height: 1.5; margin: 0;">
        หากคุณไม่ได้เป็นผู้ร้องขอรหัสนี้ สามารถเพิกเฉยต่ออีเมลฉบับนี้ได้อย่างปลอดภัย เจ้าหน้าที่ NIDA จะไม่มีวันติดต่อเพื่อขอรหัสนี้จากคุณ
      </p>
    </div>
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
    <div>
      <span style="font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #8C7A6B; text-transform: uppercase;">ORDER CONFIRMATION</span>
      <h2 style="font-size: 18px; font-weight: 800; color: #2B1810; margin: 8px 0 16px;">ขอบคุณสำหรับคำสั่งซื้อของคุณ</h2>
      <p style="font-size: 13px; color: #666666; line-height: 1.6; margin: 0 0 20px;">
        คำสั่งซื้อหมายเลข <strong>#${orderNumber}</strong> ได้รับการบันทึกในระบบเรียบร้อยแล้ว ทีมงานกำลังดำเนินการจัดเตรียมสินค้าตามลำดับ
      </p>
      <div style="margin: 20px 0; padding: 18px; background-color: #FAF7F2; border-left: 3px solid #2B1810;">
        <div style="font-size: 10px; font-weight: 700; letter-spacing: 1.5px; color: #8C7A6B; text-transform: uppercase;">TOTAL AMOUNT</div>
        <div style="font-size: 20px; font-weight: 900; color: #2B1810; margin-top: 4px;">
          ฿${totalAmount.toLocaleString()}
        </div>
      </div>
      <p style="font-size: 12px; color: #666666; line-height: 1.6; margin: 0;">
        คุณจะได้รับอีเมลแจ้งเตือนอีกครั้งเมื่อสินค้าเริ่มเข้าสู่กระบวนการจัดส่งพร้อมหมายเลขติดตามพัสดุ
      </p>
    </div>
  `;

  return {
    subject,
    text,
    html: wrapCustomerEmailLayout(contentHtml),
  };
}

export function formatOrderShippedEmail(
  data: OrderShippedEmailData,
): FormattedEmail {
  const subject = `คำสั่งซื้อ #${data.orderNumber} ของคุณถูกจัดส่งแล้ว — NIDA Official`;
  const text = `คำสั่งซื้อ #${data.orderNumber} ได้รับการจัดส่งเรียบร้อยแล้ว โดย ${data.courierName} หมายเลขพัสดุ: ${data.trackingNumber} ตรวจสอบสถานะ: ${data.trackingUrl}`;

  const itemsHtml =
    data.items && data.items.length > 0
      ? `
      <div style="margin-top: 24px; border-top: 1px solid #EAE3D9; padding-top: 20px;">
        <div style="font-size: 10px; font-weight: 700; letter-spacing: 1.5px; color: #8C7A6B; text-transform: uppercase; margin-bottom: 12px;">ITEMS IN SHIPMENT</div>
        <table style="width: 100%; border-collapse: collapse;">
          ${data.items
            .map(
              (item) => `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #F5F1EB; vertical-align: top;">
                <div style="font-size: 13px; font-weight: 700; color: #2B1810;">${item.title}</div>
                ${item.variantSummary ? `<div style="font-size: 11px; color: #8C7A6B; margin-top: 2px;">${item.variantSummary}</div>` : ''}
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #F5F1EB; text-align: right; vertical-align: top; white-space: nowrap;">
                <div style="font-size: 12px; color: #666666;">x${item.quantity}</div>
                <div style="font-size: 12px; font-weight: 700; color: #2B1810; margin-top: 2px;">฿${(item.price * item.quantity).toLocaleString()}</div>
              </td>
            </tr>
          `,
            )
            .join('')}
        </table>
      </div>
    `
      : '';

  const addressHtml = data.shippingAddressSummary
    ? `
      <div style="margin-top: 20px; padding: 14px 18px; background-color: #FAF7F2; border-left: 2px solid #D4C5B9;">
        <div style="font-size: 10px; font-weight: 700; letter-spacing: 1px; color: #8C7A6B; text-transform: uppercase;">DESTINATION</div>
        <div style="font-size: 12px; color: #2B1810; line-height: 1.5; margin-top: 4px;">
          <strong>${data.recipientName}</strong> &middot; ${data.shippingAddressSummary}
        </div>
      </div>
    `
    : '';

  const contentHtml = `
    <div>
      <span style="font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #8C7A6B; text-transform: uppercase;">SHIPMENT DISPATCHED</span>
      <h2 style="font-size: 18px; font-weight: 800; color: #2B1810; margin: 8px 0 16px;">พัสดุของคุณอยู่ระหว่างการจัดส่ง</h2>
      <p style="font-size: 13px; color: #666666; line-height: 1.6; margin: 0 0 24px;">
        เรียนคุณ <strong>${data.recipientName}</strong>, สินค้าในคำสั่งซื้อหมายเลข <strong>#${data.orderNumber}</strong> ได้รับการบรรจุและส่งมอบให้แก่ผู้ให้บริการขนส่งเรียบร้อยแล้ว
      </p>

      <div style="background-color: #FAF7F2; border: 1px solid #EAE3D9; padding: 20px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding-bottom: 12px;">
              <span style="font-size: 10px; font-weight: 700; letter-spacing: 1.5px; color: #8C7A6B; text-transform: uppercase;">COURIER</span>
              <div style="font-size: 14px; font-weight: 700; color: #2B1810; margin-top: 2px;">${data.courierName}</div>
            </td>
          </tr>
          <tr>
            <td>
              <span style="font-size: 10px; font-weight: 700; letter-spacing: 1.5px; color: #8C7A6B; text-transform: uppercase;">TRACKING NUMBER</span>
              <div style="font-size: 18px; font-family: 'Courier New', Courier, monospace; font-weight: 900; color: #2B1810; letter-spacing: 2px; margin-top: 2px;">${data.trackingNumber}</div>
            </td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${data.trackingUrl}" style="background-color: #2B1810; color: #FFFFFF; text-decoration: none; padding: 14px 28px; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; display: inline-block;">
          ติดตามพัสดุของคุณ (TRACK SHIPMENT)
        </a>
      </div>

      ${addressHtml}
      ${itemsHtml}

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #EAE3D9;">
        <p style="font-size: 11px; color: #8C7A6B; line-height: 1.5; margin: 0;">
          หมายเหตุ: ข้อมูลสถานะการจัดส่งอาจใช้เวลา 2–6 ชั่วโมงในการปรับปรุงบนระบบของผู้ให้บริการขนส่ง
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

export function formatTaxInvoiceReceiptEmail(
  data: TaxInvoiceReceiptEmailData,
): FormattedEmail {
  const subject = `ใบเสร็จรับเงิน/ใบกำกับภาษีอิเล็กทรอนิกส์ #${data.invoiceNumber} (คำสั่งซื้อ #${data.orderNumber}) — NIDA Official`;
  const text = `ใบเสร็จรับเงิน/ใบกำกับภาษีอิเล็กทรอนิกส์ #${data.invoiceNumber} สำหรับคำสั่งซื้อ #${data.orderNumber} ได้รับการออกเรียบร้อยแล้ว ยอดรวม ฿${data.totalAmount.toLocaleString()} (ฐานภาษี ฿${data.preVatAmount.toLocaleString()} + VAT 7% ฿${data.vatAmount.toLocaleString()}) สามารถเปิดดูเอกสารฉบับเต็มได้ที่: ${data.viewUrl}`;

  const buyerTaxIdHtml = data.buyerTaxId
    ? `<div><span style="font-size: 10px; font-weight: 700; color: #8C7A6B; letter-spacing: 1px; text-transform: uppercase;">TAX ID:</span> <span style="font-size: 12px; color: #2B1810; font-family: monospace;">${data.buyerTaxId}</span> ${data.buyerBranch ? `(${data.buyerBranch})` : ''}</div>`
    : '';

  const buyerAddressHtml = data.buyerAddress
    ? `<div style="font-size: 11px; color: #666666; line-height: 1.5; margin-top: 4px;">${data.buyerAddress}</div>`
    : '';

  const contentHtml = `
    <div>
      <span style="font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #8C7A6B; text-transform: uppercase;">ELECTRONIC TAX INVOICE & RECEIPT</span>
      <h2 style="font-size: 18px; font-weight: 800; color: #2B1810; margin: 8px 0 16px;">ใบเสร็จรับเงิน / ใบกำกับภาษี</h2>
      <p style="font-size: 13px; color: #666666; line-height: 1.6; margin: 0 0 20px;">
        บริษัท นิ ดา แบรนด์ จำกัด ได้ออกเอกสารใบเสร็จรับเงิน/ใบกำกับภาษีเต็มรูปสำหรับคำสั่งซื้อ <strong>#${data.orderNumber}</strong> เรียบร้อยแล้ว ตามรายละเอียดด้านล่าง
      </p>

      <div style="background-color: #FAF7F2; border: 1px solid #EAE3D9; padding: 18px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tr>
            <td style="padding-bottom: 6px; color: #8C7A6B; text-transform: uppercase; font-size: 10px; font-weight: 700; letter-spacing: 1px;">INVOICE NUMBER</td>
            <td style="padding-bottom: 6px; text-align: right; font-weight: 700; color: #2B1810; font-family: monospace;">${data.invoiceNumber}</td>
          </tr>
          <tr>
            <td style="padding-bottom: 6px; color: #8C7A6B; text-transform: uppercase; font-size: 10px; font-weight: 700; letter-spacing: 1px;">ISSUED DATE</td>
            <td style="padding-bottom: 6px; text-align: right; color: #2B1810;">${data.issuedAt}</td>
          </tr>
          <tr>
            <td style="color: #8C7A6B; text-transform: uppercase; font-size: 10px; font-weight: 700; letter-spacing: 1px;">BUYER</td>
            <td style="text-align: right; font-weight: 700; color: #2B1810;">${data.buyerName}</td>
          </tr>
        </table>
        ${buyerTaxIdHtml || buyerAddressHtml ? `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #EAE3D9;">${buyerTaxIdHtml}${buyerAddressHtml}</div>` : ''}
      </div>

      <div style="border: 1px solid #EAE3D9; padding: 16px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tr>
            <td style="padding: 6px 0; color: #666666;">มูลค่าสินค้าก่อนภาษี (Pre-VAT Amount)</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #2B1810;">฿${data.preVatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666666;">ภาษีมูลค่าเพิ่ม 7% (VAT 7%)</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #2B1810;">฿${data.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr style="border-top: 2px solid #2B1810;">
            <td style="padding: 10px 0 4px; font-weight: 800; font-size: 13px; color: #2B1810; text-transform: uppercase;">ยอดชำระสุทธิ (Total Amount)</td>
            <td style="padding: 10px 0 4px; text-align: right; font-weight: 900; font-size: 15px; color: #2B1810;">฿${data.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 24px 0 16px;">
        <a href="${data.viewUrl}" style="background-color: #2B1810; color: #FFFFFF; text-decoration: none; padding: 13px 26px; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; display: inline-block;">
          ดูใบกำกับภาษีฉบับเต็ม (VIEW TAX INVOICE)
        </a>
      </div>

      <p style="font-size: 11px; color: #8C7A6B; line-height: 1.5; margin: 20px 0 0; text-align: center;">
        เอกสารนี้จัดทำขึ้นตามมาตรา 86/4 แห่งประมวลรัษฎากร ท่านสามารถพิมพ์สำเนาขนาด A4 ได้จากลิงก์ด้านบน
      </p>
    </div>
  `;

  return {
    subject,
    text,
    html: wrapCustomerEmailLayout(contentHtml),
  };
}

export function formatOrderCancelledEmail(
  data: OrderCancelledEmailData,
): FormattedEmail {
  const subject = `แจ้งยกเลิกคำสั่งซื้อ #${data.orderNumber} — NIDA Official`;
  const text = `คำสั่งซื้อ #${data.orderNumber} ได้รับการยกเลิกเรียบร้อยแล้ว${data.reason ? ` เนื่องจาก: ${data.reason}` : ''} หากท่านต้องการสั่งซื้อสินค้า สามารถเข้าชมสินค้าได้ที่ร้านค้าออนไลน์ NIDA`;

  const contentHtml = `
    <div>
      <span style="font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #8C7A6B; text-transform: uppercase;">ORDER CANCELLATION</span>
      <h2 style="font-size: 18px; font-weight: 800; color: #2B1810; margin: 8px 0 16px;">แจ้งยกเลิกคำสั่งซื้อ</h2>
      <p style="font-size: 13px; color: #666666; line-height: 1.6; margin: 0 0 20px;">
        คำสั่งซื้อหมายเลข <strong>#${data.orderNumber}</strong> ได้รับการยกเลิกในระบบเรียบร้อยแล้ว
      </p>

      <div style="background-color: #FAF7F2; border-left: 3px solid #8C7A6B; padding: 16px; margin-bottom: 24px;">
        <div style="font-size: 10px; font-weight: 700; letter-spacing: 1px; color: #8C7A6B; text-transform: uppercase;">REASON / รายละเอียด</div>
        <div style="font-size: 13px; color: #2B1810; margin-top: 6px; line-height: 1.5;">
          ${data.reason ?? 'คำสั่งซื้อหมดเวลาชำระเงินตามที่กำหนดในระบบ'}
        </div>
      </div>

      <p style="font-size: 12px; color: #666666; line-height: 1.6; margin: 0 0 24px;">
        หากรายการดังกล่าวถูกหักชำระเงินไปแล้ว หรือท่านมีข้อสงสัยเกี่ยวกับคำสั่งซื้อ สามารถติดต่อฝ่ายบริการลูกค้าของ NIDA เพื่อตรวจสอบข้อมูลเพิ่มเติมได้ทันที
      </p>

      ${
        data.storefrontUrl
          ? `
        <div style="text-align: center; margin: 20px 0;">
          <a href="${data.storefrontUrl}" style="background-color: #2B1810; color: #FFFFFF; text-decoration: none; padding: 12px 24px; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; display: inline-block;">
            กลับสู่หน้าหลักร้านค้า (VISIT STORE)
          </a>
        </div>
      `
          : ''
      }
    </div>
  `;

  return {
    subject,
    text,
    html: wrapCustomerEmailLayout(contentHtml),
  };
}

export function formatRefundProcessedEmail(
  data: RefundProcessedEmailData,
): FormattedEmail {
  const subject = `ยืนยันการคืนเงินสำหรับคำสั่งซื้อ #${data.orderNumber} — NIDA Official`;
  const text = `การคืนเงินสำหรับคำสั่งซื้อ #${data.orderNumber} (เลขที่คืนเงิน: ${data.refundNumber}) จำนวน ฿${data.amount.toLocaleString()} ได้รับการดำเนินการเรียบร้อยแล้ว${data.reason ? ` เหตุผล: ${data.reason}` : ''}`;

  const timelineNote =
    data.estimatedTimeline ??
    'สำหรับบัตรเครดิตยอดเงินจะปรับปรุงเข้าบัญชีภายใน 7–14 วันทำการขึ้นอยู่กับรอบบิลธนาคารผู้ถือบัตร';

  const contentHtml = `
    <div>
      <span style="font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #8C7A6B; text-transform: uppercase;">REFUND NOTIFICATION</span>
      <h2 style="font-size: 18px; font-weight: 800; color: #2B1810; margin: 8px 0 16px;">ยืนยันการคืนเงินเรียบร้อยแล้ว</h2>
      <p style="font-size: 13px; color: #666666; line-height: 1.6; margin: 0 0 20px;">
        คำร้องขอคืนเงินสำหรับคำสั่งซื้อหมายเลข <strong>#${data.orderNumber}</strong> ได้รับการดำเนินการผ่านระบบรับชำระเงินเรียบร้อยแล้ว
      </p>

      <div style="background-color: #FAF7F2; border: 1px solid #EAE3D9; padding: 20px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tr>
            <td style="padding-bottom: 8px; color: #8C7A6B; text-transform: uppercase; font-size: 10px; font-weight: 700; letter-spacing: 1px;">REFUND NUMBER</td>
            <td style="padding-bottom: 8px; text-align: right; font-weight: 700; color: #2B1810; font-family: monospace;">${data.refundNumber}</td>
          </tr>
          <tr>
            <td style="padding-bottom: 8px; color: #8C7A6B; text-transform: uppercase; font-size: 10px; font-weight: 700; letter-spacing: 1px;">ORDER NUMBER</td>
            <td style="padding-bottom: 8px; text-align: right; font-weight: 600; color: #2B1810;">#${data.orderNumber}</td>
          </tr>
          ${
            data.paymentMethod
              ? `
            <tr>
              <td style="padding-bottom: 8px; color: #8C7A6B; text-transform: uppercase; font-size: 10px; font-weight: 700; letter-spacing: 1px;">CHANNEL</td>
              <td style="padding-bottom: 8px; text-align: right; font-weight: 600; color: #2B1810;">${data.paymentMethod}</td>
            </tr>
          `
              : ''
          }
          <tr style="border-top: 2px solid #2B1810;">
            <td style="padding-top: 10px; font-weight: 800; font-size: 13px; color: #2B1810; text-transform: uppercase;">REFUND AMOUNT</td>
            <td style="padding-top: 10px; text-align: right; font-weight: 900; font-size: 18px; color: #2B1810;">฿${data.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </table>
      </div>

      <div style="padding: 14px 18px; background-color: #FAF7F2; border-left: 2px solid #8C7A6B; margin-bottom: 24px;">
        <div style="font-size: 10px; font-weight: 700; letter-spacing: 1px; color: #8C7A6B; text-transform: uppercase;">PROCESSING TIMELINE</div>
        <div style="font-size: 12px; color: #2B1810; line-height: 1.5; margin-top: 4px;">
          ${timelineNote}
        </div>
      </div>

      <p style="font-size: 11px; color: #8C7A6B; line-height: 1.5; margin: 0; text-align: center;">
        หากมีข้อสงสัยเกี่ยวกับยอดเงินคืน สามารถติดต่อ NIDA Concierge ได้ทาง support@nida.co
      </p>
    </div>
  `;

  return {
    subject,
    text,
    html: wrapCustomerEmailLayout(contentHtml),
  };
}
