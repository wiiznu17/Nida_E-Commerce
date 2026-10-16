'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  orderRequester,
  addressRequester,
  extractApiError,
  type CreateCustomerOrderPayload,
} from '@/api';
import { PaymentMethod, type ApiAddress, type CreateAddressDto } from '@repo/types';
import type { ShippingFormData, CheckoutStep, PaymentMethodOption } from './checkoutTypes';

export function useCheckoutForm() {
  const {
    items,
    cartTotal,
    setIsCartOpen,
    clearCart,
    appliedCoupon,
    discountAmount,
    shippingFee,
    isFreeShipping,
    finalTotal,
    couponError,
    isApplyingCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { user, token, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [promoCode, setPromoCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodOption>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

  const [shippingData, setShippingData] = useState<ShippingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    addressLine2: '',
    subdistrict: '',
    district: '',
    province: '',
    city: '',
    postalCode: '',
  });

  const [savedAddresses, setSavedAddresses] = useState<ApiAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addressMode, setAddressMode] = useState<'saved' | 'new'>('saved');
  const [saveToAddressBook, setSaveToAddressBook] = useState(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  const populateShippingFromAddress = useCallback(
    (addr: ApiAddress) => {
      const nameParts = addr.recipientName.trim().split(' ');
      const firstName = nameParts[0] ?? '';
      const lastName = nameParts.slice(1).join(' ') || (user?.lastName ?? '');
      setShippingData((prev) => ({
        ...prev,
        firstName,
        lastName,
        email: prev.email || user?.email || '',
        phone: addr.phone,
        address: addr.addressLine1,
        addressLine2: addr.addressLine2 ?? '',
        subdistrict: addr.subdistrict,
        district: addr.district,
        province: addr.province,
        city: addr.district || addr.province,
        postalCode: addr.postalCode,
      }));
    },
    [user],
  );

  useEffect(() => {
    setIsCartOpen(false);
  }, [setIsCartOpen]);

  useEffect(() => {
    if (!token) return;
    let isMounted = true;
    setIsLoadingAddresses(true);

    addressRequester
      .getAddresses(token)
      .then((addrs) => {
        if (!isMounted) return;
        setSavedAddresses(addrs);
        if (addrs.length > 0) {
          const defaultAddr = addrs.find((a) => a.isDefault) ?? addrs[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            setAddressMode('saved');
            populateShippingFromAddress(defaultAddr);
          }
        } else {
          setAddressMode('new');
        }
      })
      .catch(() => {
        if (isMounted) setAddressMode('new');
      })
      .finally(() => {
        if (isMounted) setIsLoadingAddresses(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token, populateShippingFromAddress]);

  useEffect(() => {
    if (user && savedAddresses.length === 0) {
      setShippingData((prev) => ({
        ...prev,
        firstName: prev.firstName || user.firstName || '',
        lastName: prev.lastName || user.lastName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        address: prev.address || user.address || '',
        city: prev.city || user.city || (language === 'th' ? 'กรุงเทพมหานคร' : 'Bangkok'),
        postalCode: prev.postalCode || user.postalCode || '10110',
      }));
    }
  }, [user, language, savedAddresses.length]);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    const res = await applyCoupon(promoCode);
    if (res.success) {
      setPromoCode('');
    }
  };

  const handleSelectAddress = (addr: ApiAddress) => {
    setSelectedAddressId(addr.id);
    populateShippingFromAddress(addr);
  };

  const handleSaveModalAddress = async (data: CreateAddressDto) => {
    if (!token) return;
    const created = await addressRequester.createAddress(data, token);
    setSavedAddresses((prev) => [created, ...prev]);
    setSelectedAddressId(created.id);
    setAddressMode('saved');
    populateShippingFromAddress(created);
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (addressMode === 'new' && saveToAddressBook && token) {
      try {
        const recipientName = `${shippingData.firstName} ${shippingData.lastName}`.trim();
        const created = await addressRequester.createAddress(
          {
            recipientName: recipientName || user?.fullName || 'Customer',
            phone: shippingData.phone,
            addressLine1: shippingData.address,
            addressLine2: shippingData.addressLine2 || undefined,
            subdistrict: shippingData.subdistrict || 'Khlong Toei',
            district: shippingData.district || shippingData.city || 'Khlong Toei',
            province: shippingData.province || 'Bangkok',
            postalCode: shippingData.postalCode,
            isDefault: savedAddresses.length === 0,
          },
          token,
        );
        setSavedAddresses((prev) => [created, ...prev]);
        setSelectedAddressId(created.id);
      } catch {
        // Continue checkout even if address save fails
      }
    }

    setStep('payment');
    window.scrollTo(0, 0);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setOrderError('');

    try {
      const mappedMethod: PaymentMethod =
        paymentMethod === 'promptpay'
          ? PaymentMethod.PROMPTPAY
          : PaymentMethod.CREDIT_CARD;

      const recipientName = `${shippingData.firstName} ${shippingData.lastName}`.trim();

      const payload: CreateCustomerOrderPayload = {
        items: items.map((item) => ({
          variantId: item.variantId || item.id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          recipientName: recipientName || user?.fullName || 'Customer',
          phone: shippingData.phone || '0812345678',
          addressLine1: shippingData.address || 'Sukhumvit 24',
          subdistrict: shippingData.subdistrict || 'Khlong Toei',
          district: shippingData.district || shippingData.city || 'Khlong Toei',
          province: shippingData.province || 'Bangkok',
          postalCode: shippingData.postalCode || '10110',
        },
        paymentMethod: mappedMethod,
        customerEmail: shippingData.email || user?.email,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      };

      const createdOrder = await orderRequester.createOrder(payload, token);
      clearCart();

      if (mappedMethod === PaymentMethod.CREDIT_CARD) {
        await orderRequester.payOrder(createdOrder.orderNumber, token);
      }

      router.push(`/order-success?orderNumber=${encodeURIComponent(createdOrder.orderNumber)}`);
    } catch (err: unknown) {
      const extracted = extractApiError(
        err,
        language === 'th'
          ? 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ กรุณาลองใหม่อีกครั้ง'
          : 'Failed to create order. Please try again.',
      );
      setOrderError(extracted.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    items,
    cartTotal,
    appliedCoupon,
    discountAmount,
    shippingFee,
    isFreeShipping,
    finalTotal,
    couponError,
    isApplyingCoupon,
    removeCoupon,
    user,
    token,
    isAuthenticated,
    isAuthLoading,
    step,
    setStep,
    promoCode,
    setPromoCode,
    paymentMethod,
    setPaymentMethod,
    isSubmitting,
    orderError,
    shippingData,
    setShippingData,
    savedAddresses,
    selectedAddressId,
    addressMode,
    setAddressMode,
    saveToAddressBook,
    setSaveToAddressBook,
    isAddressModalOpen,
    setIsAddressModalOpen,
    isLoadingAddresses,
    handleApplyPromo,
    handleSelectAddress,
    handleSaveModalAddress,
    handleShippingSubmit,
    handlePaymentSubmit,
    router,
  };
}
