'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { AddressModal } from '@/components/address';
import {
  CheckoutMemberBanner,
  CheckoutSteps,
  CheckoutShippingForm,
  CheckoutPaymentForm,
  CheckoutOrderSummary,
  useCheckoutForm,
} from '@/components/checkout';

export default function CheckoutPage() {
  const { language, t } = useLanguage();
  const {
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
  } = useCheckoutForm();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 font-sans">
        <h1 className="text-2xl font-black text-brand-brown uppercase tracking-wider mb-4">
          {t('checkout.emptyBag')}
        </h1>
        <button
          onClick={() => router.push('/')}
          className="bg-brand-brown text-white px-6 py-3 font-black text-xs uppercase tracking-widest hover:bg-brand-amber transition-colors cursor-pointer"
        >
          {t('checkout.returnToShop')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      <CheckoutMemberBanner
        isAuthenticated={isAuthenticated}
        isLoading={isAuthLoading}
      />

      {orderError && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-3">
          <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
          <div>
            <p className="font-bold">
              {language === 'th' ? 'เกิดข้อผิดพลาดในการสั่งซื้อ' : 'Order Error'}
            </p>
            <p className="mt-0.5">{orderError}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 lg:max-w-2xl">
          <CheckoutSteps currentStep={step} />

          {step === 'shipping' ? (
            <CheckoutShippingForm
              savedAddresses={savedAddresses}
              selectedAddressId={selectedAddressId}
              addressMode={addressMode}
              isLoadingAddresses={isLoadingAddresses}
              shippingData={shippingData}
              isAuthenticated={isAuthenticated}
              saveToAddressBook={saveToAddressBook}
              onSelectAddress={handleSelectAddress}
              onSetAddressMode={setAddressMode}
              onSetShippingData={setShippingData}
              onSetSaveToAddressBook={setSaveToAddressBook}
              onOpenNewAddressModal={() => setIsAddressModalOpen(true)}
              onSubmit={handleShippingSubmit}
            />
          ) : (
            <CheckoutPaymentForm
              paymentMethod={paymentMethod}
              isSubmitting={isSubmitting}
              finalTotal={finalTotal}
              onSelectPaymentMethod={setPaymentMethod}
              onBackToShipping={() => setStep('shipping')}
              onSubmit={handlePaymentSubmit}
            />
          )}
        </div>

        <CheckoutOrderSummary
          items={items}
          cartTotal={cartTotal}
          discountAmount={discountAmount}
          shippingFee={shippingFee}
          isFreeShipping={isFreeShipping}
          finalTotal={finalTotal}
          appliedCoupon={appliedCoupon}
          couponError={couponError}
          isApplyingCoupon={isApplyingCoupon}
          promoCode={promoCode}
          onSetPromoCode={setPromoCode}
          onApplyPromo={handleApplyPromo}
          onRemoveCoupon={removeCoupon}
        />
      </div>

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleSaveModalAddress}
      />
    </div>
  );
}
