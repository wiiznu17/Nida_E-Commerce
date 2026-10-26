'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { AddressModal } from '@/components/address';
import { Alert, EmptyState } from '@/components/ui';
import {
  CheckoutMemberBanner,
  CheckoutSteps,
  CheckoutShippingForm,
  CheckoutPaymentForm,
  CheckoutOrderSummary,
  PriceMismatchModal,
  useCheckoutForm,
} from '@/components/checkout';

export default function CheckoutPage() {
  const { language, t } = useLanguage();
  const {
    items,
    cartTotal,
    hasUnavailableItems,
    unavailableItemsCount,
    removeUnavailableItems,
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
    priceMismatches,
    isPriceMismatchModalOpen,
    setIsPriceMismatchModalOpen,
    handleAcceptNewPrices,
    router,
  } = useCheckoutForm();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 font-sans">
        <EmptyState
          title={t('checkout.emptyBag')}
          action={{
            label: t('checkout.returnToShop'),
            onClick: () => router.push('/'),
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 font-sans">
      <CheckoutMemberBanner
        isAuthenticated={isAuthenticated}
        isLoading={isAuthLoading}
      />

      {hasUnavailableItems && (
        <Alert
          variant="warning"
          title={
            language === 'th'
              ? 'มีสินค้าที่ไม่พร้อมจำหน่ายในถุงช้อปปิ้ง'
              : 'Unavailable Items in Bag'
          }
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
            <p className="text-xs">
              {t('cart.hasUnavailableNotice')}
            </p>
            <button
              type="button"
              onClick={removeUnavailableItems}
              className="px-3 py-1.5 bg-brand-brown text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-brand-amber transition-colors shrink-0 cursor-pointer"
            >
              {t('cart.removeUnavailable')} ({unavailableItemsCount})
            </button>
          </div>
        </Alert>
      )}

      {orderError && (
        <Alert
          variant="error"
          title={
            language === 'th' ? 'เกิดข้อผิดพลาดในการสั่งซื้อ' : 'Order Error'
          }
          className="mb-8"
        >
          {orderError}
        </Alert>
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

      <PriceMismatchModal
        isOpen={isPriceMismatchModalOpen}
        onClose={() => setIsPriceMismatchModalOpen(false)}
        mismatches={priceMismatches}
        onAcceptAndProceed={handleAcceptNewPrices}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
