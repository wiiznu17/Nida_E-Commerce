// ====================================================
// CouponsService — Business Logic สำหรับคูปองและการคำนวณยอด Checkout
// ====================================================

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { ValidateCouponDto } from './dto/validate-coupon.dto.js';
import { CalculateCheckoutDto } from './dto/calculate-checkout.dto.js';
import type {
  ApiCoupon,
  CouponValidationResult,
  CheckoutCalculation,
  CheckoutLineItem,
  CheckoutCouponSummary,
} from '@repo/types';
import { DiscountType } from '@repo/types';

const FREE_SHIPPING_THRESHOLD = 1000; // สั่งซื้อครบ 1,000 บาท ส่งฟรี
const STANDARD_SHIPPING_FEE = 50; // ค่าส่งมาตรฐาน 50 บาท

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------
  // ตรวจสอบความถูกต้องของคูปอง (Coupon Validation)
  // -------------------------------------------------------
  async validateCoupon(
    dto: ValidateCouponDto,
  ): Promise<CouponValidationResult> {
    const { code, orderAmount, userId } = dto;
    const now = new Date();

    const coupon = await this.prisma.promotionCoupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon) {
      return { valid: false, reason: 'NOT_FOUND' };
    }

    if (!coupon.isActive) {
      return { valid: false, reason: 'INACTIVE' };
    }

    if (coupon.startsAt > now) {
      return { valid: false, reason: 'NOT_YET_ACTIVE' };
    }

    if (coupon.expiresAt < now) {
      return { valid: false, reason: 'EXPIRED' };
    }

    if (coupon.currentUsageCount >= coupon.totalUsageLimit) {
      return { valid: false, reason: 'USAGE_LIMIT_REACHED' };
    }

    // ตรวจสอบสิทธิ์การใช้ต่อคน (User quota)
    if (userId && coupon.userUsageLimit > 0) {
      const userRedemptionCount = await this.prisma.couponRedemption.count({
        where: {
          couponId: coupon.id,
          userId,
        },
      });

      if (userRedemptionCount >= coupon.userUsageLimit) {
        return { valid: false, reason: 'USER_LIMIT_REACHED' };
      }
    }

    // ตรวจสอบยอดสั่งซื้อขั้นต่ำ
    const minOrder = Number(coupon.minOrderAmount);
    if (orderAmount < minOrder) {
      return { valid: false, reason: 'MIN_ORDER_NOT_MET' };
    }

    // คำนวณส่วนลด
    let discountAmount = 0;
    const discountVal = Number(coupon.discountValue);

    if (coupon.discountType === DiscountType.PERCENTAGE) {
      discountAmount = (orderAmount * discountVal) / 100;
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(
          discountAmount,
          Number(coupon.maxDiscountAmount),
        );
      }
    } else if (coupon.discountType === DiscountType.FIXED_AMOUNT) {
      discountAmount = Math.min(orderAmount, discountVal);
    } else if (coupon.discountType === DiscountType.FREE_SHIPPING) {
      // คูปองส่งฟรี ส่วนลดจะถูกคิดกับค่าส่งในชั้น checkout
      discountAmount = STANDARD_SHIPPING_FEE;
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    return {
      valid: true,
      coupon: this.mapCoupon(coupon),
      discountAmount,
    };
  }

  // -------------------------------------------------------
  // คำนวณยอดชำระเงิน Checkout (Checkout Calculation Engine)
  // -------------------------------------------------------
  async calculateCheckout(
    dto: CalculateCheckoutDto,
  ): Promise<CheckoutCalculation> {
    const { items, couponCode, userId } = dto;

    if (!items || items.length === 0) {
      throw new BadRequestException('Checkout must contain at least one item');
    }

    // 1. ดึงข้อมูล Variants & Products ทั้งหมดในคำสั่งซื้อ
    const variantIds = items.map((i) => i.variantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: {
        product: true,
        inventoryItem: true,
      },
    });

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    // ตรวจสอบว่าสินค้าทุกตัวมีอยู่ในระบบ
    for (const item of items) {
      if (!variantMap.has(item.variantId)) {
        throw new NotFoundException(
          `Variant with id "${item.variantId}" not found`,
        );
      }
    }

    // 2. คำนวณ Subtotal แต่ละรายการ
    let subtotal = 0;
    const lineItems: CheckoutLineItem[] = [];

    for (const item of items) {
      const v = variantMap.get(item.variantId)!;
      const unitPrice = Number(v.product.basePrice) + Number(v.priceAdjustment);
      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;

      lineItems.push({
        variantId: v.id,
        productName: v.product.name,
        variantInfo: `${v.colorName} / ${v.size}`,
        unitPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        discountShare: 0,
        netPrice: itemSubtotal,
        weightGrams: v.weightGrams * item.quantity,
      });
    }

    // 3. คำนวณค่าจัดส่ง (Shipping Fee)
    let shippingFee =
      subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;

    // 4. ตรวจสอบและคิดส่วนลดคูปอง (ถ้ามี)
    let discountTotal = 0;
    let couponApplied: CheckoutCouponSummary | undefined;

    if (couponCode) {
      const validation = await this.validateCoupon({
        code: couponCode,
        orderAmount: subtotal,
        userId,
      });

      if (validation.valid && validation.coupon) {
        if (validation.coupon.discountType === DiscountType.FREE_SHIPPING) {
          const discountShipping = shippingFee;
          shippingFee = 0;
          couponApplied = {
            code: validation.coupon.code,
            discountType: validation.coupon.discountType,
            discountValue: validation.coupon.discountValue,
            discountAmount: discountShipping,
          };
        } else {
          discountTotal = validation.discountAmount ?? 0;
          // ป้องกันส่วนลดเกินราคาสินค้า
          discountTotal = Math.min(discountTotal, subtotal);

          couponApplied = {
            code: validation.coupon.code,
            discountType: validation.coupon.discountType,
            discountValue: validation.coupon.discountValue,
            discountAmount: discountTotal,
          };
        }
      }
    }

    // 5. ปันส่วนลดไปยังแต่ละ Item (Pro-rata Discount Distribution) เพื่อความถูกต้องทางบัญชี
    if (discountTotal > 0 && subtotal > 0) {
      let allocatedDiscount = 0;
      for (let i = 0; i < lineItems.length; i++) {
        const item = lineItems[i]!;
        if (i === lineItems.length - 1) {
          // รายการสุดท้ายเก็บเศษปัด
          item.discountShare =
            Math.round((discountTotal - allocatedDiscount) * 100) / 100;
        } else {
          item.discountShare =
            Math.round((item.subtotal / subtotal) * discountTotal * 100) / 100;
          allocatedDiscount += item.discountShare;
        }
        item.netPrice = Math.max(0, item.subtotal - item.discountShare);
      }
    }

    // 6. รวมยอดสุทธิ
    const totalAmount = Math.max(0, subtotal - discountTotal + shippingFee);

    // 7. คำนวณภาษีมูลค่าเพิ่ม VAT 7% (รวมในราคาแล้ว ตามมาตรฐานไทย)
    const taxAmount = Math.round(((totalAmount * 7) / 107) * 100) / 100;

    return {
      items: lineItems,
      subtotal: Math.round(subtotal * 100) / 100,
      discountTotal: Math.round(discountTotal * 100) / 100,
      shippingFee,
      taxAmount,
      totalAmount: Math.round(totalAmount * 100) / 100,
      couponApplied,
    };
  }

  // -------------------------------------------------------
  // Helper: แปลง PromotionCoupon จาก Prisma เป็น ApiCoupon
  // -------------------------------------------------------
  private mapCoupon(coupon: {
    id: string;
    code: string;
    discountType: string;
    discountValue: unknown;
    minOrderAmount: unknown;
    maxDiscountAmount: unknown | null;
    totalUsageLimit: number;
    userUsageLimit: number;
    currentUsageCount: number;
    applicableTier: unknown | null;
    startsAt: Date;
    expiresAt: Date;
    isActive: boolean;
  }): ApiCoupon {
    return {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType as ApiCoupon['discountType'],
      discountValue: Number(coupon.discountValue),
      minOrderAmount: Number(coupon.minOrderAmount),
      maxDiscountAmount: coupon.maxDiscountAmount
        ? Number(coupon.maxDiscountAmount)
        : undefined,
      totalUsageLimit: coupon.totalUsageLimit,
      userUsageLimit: coupon.userUsageLimit,
      currentUsageCount: coupon.currentUsageCount,
      applicableTier:
        (coupon.applicableTier as ApiCoupon['applicableTier']) ?? undefined,
      startsAt: coupon.startsAt.toISOString(),
      expiresAt: coupon.expiresAt.toISOString(),
      isActive: coupon.isActive,
    };
  }
}
