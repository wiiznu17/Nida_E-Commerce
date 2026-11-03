import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { Prisma } from '@repo/database';
import {
  type ApiTaxInvoice,
  type ApiTaxInvoiceItem,
  type ApiTaxInvoiceSeller,
  type ApiTaxInvoiceRequest,
  TaxInvoicePayerType,
  TaxInvoiceBranchType,
} from '@repo/types';

export const NIDA_SELLER_TAX_INFO: ApiTaxInvoiceSeller = {
  companyName: 'บริษัท นิ ดา แบรนด์ จำกัด (NIDA BRAND CO., LTD.)',
  taxId: '0105566088888',
  branch: 'สำนักงานใหญ่ (Headquarters / 00000)',
  address:
    '888/88 อาคาร นิวานิช ชั้น 18 ถนนสุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพมหานคร 10110',
  phone: '02-123-4567',
};

@Injectable()
export class TaxInvoiceService {
  private readonly logger = new Logger(TaxInvoiceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Separates VAT 7% from a VAT-inclusive total.
   * Standard Thai Revenue Code Section 86/4 calculation.
   */
  calculateVatBreakdown(totalAmount: number): {
    preVatAmount: number;
    vatAmount: number;
  } {
    const preVatAmount = Math.round((totalAmount / 1.07) * 100) / 100;
    const vatAmount = Math.round((totalAmount - preVatAmount) * 100) / 100;
    return { preVatAmount, vatAmount };
  }

  /**
   * Generates sequential monthly invoice number: INV-YYYYMM-XXXXX
   */
  async generateSequentialInvoiceNumber(
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `INV-${year}${month}-`;

    const lastInvoice = await tx.taxInvoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        invoiceNumber: 'desc',
      },
      select: {
        invoiceNumber: true,
      },
    });

    let sequence = 1;
    if (lastInvoice?.invoiceNumber) {
      const parts = lastInvoice.invoiceNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }

    const seqStr = String(sequence).padStart(5, '0');
    return `${prefix}${seqStr}`;
  }

  /**
   * Idempotently creates and issues a TaxInvoice for a paid order if requested.
   */
  async issueTaxInvoiceForOrder(
    tx: Prisma.TransactionClient,
    orderId: string,
  ): Promise<ApiTaxInvoice | null> {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        taxInvoice: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order not found: ${orderId}`);
    }

    // 1. If already issued, return existing
    if (order.taxInvoice) {
      return this.mapToApiTaxInvoice(order.taxInvoice, order.orderNumber);
    }

    // 2. If no tax invoice requested, return null
    if (!order.taxInvoiceRequest) {
      return null;
    }

    const req = order.taxInvoiceRequest as unknown as ApiTaxInvoiceRequest;
    const totalAmount = Number(order.totalAmount);
    const subtotal = Number(order.subtotal);
    const discount = Number(order.discountTotal);
    const shippingFee = Number(order.shippingFee);

    const { preVatAmount, vatAmount } = this.calculateVatBreakdown(totalAmount);
    const invoiceNumber = await this.generateSequentialInvoiceNumber(tx);

    const itemsSnapshot: ApiTaxInvoiceItem[] = order.items.map((item) => ({
      id: item.id,
      productName: item.productNameSnapshot,
      variantInfo: item.variantInfoSnapshot,
      skuCode: item.skuCodeSnapshot,
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      subtotal: Number(item.subtotal),
      discountShare: Number(item.discountShare),
      netPrice: Number(item.netPrice),
    }));

    const created = await tx.taxInvoice.create({
      data: {
        orderId: order.id,
        invoiceNumber,
        payerType: req.payerType ?? TaxInvoicePayerType.PERSONAL,
        taxId: req.taxId,
        name: req.name,
        branchType: req.branchType ?? (req.payerType === TaxInvoicePayerType.COMPANY ? TaxInvoiceBranchType.HEADQUARTERS : null),
        branchCode: req.branchCode ?? (req.payerType === TaxInvoicePayerType.COMPANY ? '00000' : null),
        address: req.address,
        subtotal,
        discount,
        shippingFee,
        totalAmount,
        preVatAmount,
        vatAmount,
        itemsSnapshot: JSON.parse(JSON.stringify(itemsSnapshot)),
        issuedAt: new Date(),
      },
    });

    this.logger.log(
      `Tax Invoice issued: ${invoiceNumber} for Order: ${order.orderNumber} (Total: ฿${totalAmount})`,
    );

    return this.mapToApiTaxInvoice(created, order.orderNumber);
  }

  /**
   * Retrieves tax invoice by order number for storefront customer.
   */
  async getTaxInvoiceByOrderNumber(
    orderNumber: string,
    userId?: string,
  ): Promise<ApiTaxInvoice> {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        taxInvoice: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order not found: ${orderNumber}`);
    }

    if (userId && order.userId && order.userId !== userId) {
      throw new NotFoundException(`Order not found: ${orderNumber}`);
    }

    if (!order.taxInvoice) {
      throw new NotFoundException(
        `ใบกำกับภาษียังไม่ได้ออกสำหรับคำสั่งซื้อนี้ (Tax invoice not yet issued for order: ${orderNumber})`,
      );
    }

    return this.mapToApiTaxInvoice(order.taxInvoice, order.orderNumber);
  }

  private mapToApiTaxInvoice(
    raw: {
      id: string;
      orderId: string;
      invoiceNumber: string;
      payerType: string;
      taxId: string;
      name: string;
      branchType: string | null;
      branchCode: string | null;
      address: string;
      subtotal: Prisma.Decimal | number;
      discount: Prisma.Decimal | number;
      shippingFee: Prisma.Decimal | number;
      totalAmount: Prisma.Decimal | number;
      preVatAmount: Prisma.Decimal | number;
      vatAmount: Prisma.Decimal | number;
      itemsSnapshot: Prisma.JsonValue;
      issuedAt: Date;
    },
    orderNumber: string,
  ): ApiTaxInvoice {
    return {
      id: raw.id,
      orderId: raw.orderId,
      orderNumber,
      invoiceNumber: raw.invoiceNumber,
      payerType: raw.payerType as TaxInvoicePayerType,
      taxId: raw.taxId,
      name: raw.name,
      branchType: (raw.branchType as TaxInvoiceBranchType) ?? null,
      branchCode: raw.branchCode ?? null,
      address: raw.address,
      subtotal: Number(raw.subtotal),
      discount: Number(raw.discount),
      shippingFee: Number(raw.shippingFee),
      totalAmount: Number(raw.totalAmount),
      preVatAmount: Number(raw.preVatAmount),
      vatAmount: Number(raw.vatAmount),
      itemsSnapshot: (raw.itemsSnapshot as unknown as ApiTaxInvoiceItem[]) ?? [],
      sellerSnapshot: NIDA_SELLER_TAX_INFO,
      issuedAt: raw.issuedAt.toISOString(),
    };
  }
}

