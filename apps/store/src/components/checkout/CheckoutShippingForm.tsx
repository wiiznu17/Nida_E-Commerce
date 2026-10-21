import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { AddressCard } from '@/components/address';
import { LoadingSpinner } from '@/components/ui';
import type { ApiAddress } from '@repo/types';
import type { ShippingFormData } from './checkoutTypes';

interface CheckoutShippingFormProps {
  savedAddresses: ApiAddress[];
  selectedAddressId: string | null;
  addressMode: 'saved' | 'new';
  isLoadingAddresses: boolean;
  shippingData: ShippingFormData;
  isAuthenticated: boolean;
  saveToAddressBook: boolean;
  onSelectAddress: (addr: ApiAddress) => void;
  onSetAddressMode: (mode: 'saved' | 'new') => void;
  onSetShippingData: React.Dispatch<React.SetStateAction<ShippingFormData>>;
  onSetSaveToAddressBook: (val: boolean) => void;
  onOpenNewAddressModal: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CheckoutShippingForm({
  savedAddresses,
  selectedAddressId,
  addressMode,
  isLoadingAddresses,
  shippingData,
  isAuthenticated,
  saveToAddressBook,
  onSelectAddress,
  onSetAddressMode,
  onSetShippingData,
  onSetSaveToAddressBook,
  onOpenNewAddressModal,
  onSubmit,
}: CheckoutShippingFormProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3">
        <h2 className="text-2xl font-black text-brand-brown uppercase tracking-tight">
          {t('checkout.shippingAddress')}
        </h2>

        {savedAddresses.length > 0 && (
          <div className="inline-flex border border-gray-300 p-0.5 bg-gray-100 text-xs">
            <button
              type="button"
              onClick={() => onSetAddressMode('saved')}
              className={`px-3 py-1 font-bold uppercase tracking-wider text-[11px] transition-colors cursor-pointer ${
                addressMode === 'saved'
                  ? 'bg-brand-brown text-white shadow-2xs'
                  : 'text-gray-600 hover:text-brand-brown'
              }`}
            >
              {t('checkout.useSavedAddress')} ({savedAddresses.length})
            </button>
            <button
              type="button"
              onClick={() => {
                onSetAddressMode('new');
                onSetShippingData((prev) => ({
                  ...prev,
                  address: '',
                  addressLine2: '',
                  subdistrict: '',
                  district: '',
                  province: '',
                  city: '',
                  postalCode: '',
                }));
              }}
              className={`px-3 py-1 font-bold uppercase tracking-wider text-[11px] transition-colors cursor-pointer ${
                addressMode === 'new'
                  ? 'bg-brand-brown text-white shadow-2xs'
                  : 'text-gray-600 hover:text-brand-brown'
              }`}
            >
              {t('checkout.orEnterNewAddress')}
            </button>
          </div>
        )}
      </div>

      {isLoadingAddresses ? (
        <LoadingSpinner
          size="sm"
          text={t('addressBook.saving')}
          className="py-12"
        />
      ) : addressMode === 'saved' && savedAddresses.length > 0 ? (
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedAddresses.map((addr) => (
              <AddressCard
                key={addr.id}
                address={addr}
                mode="select"
                isSelected={selectedAddressId === addr.id}
                onSelect={onSelectAddress}
              />
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onOpenNewAddressModal}
              className="text-xs font-black uppercase text-brand-brown hover:text-brand-amber inline-flex items-center cursor-pointer transition-colors"
            >
              <Plus size={14} className="mr-1" />
              <span>{t('addressBook.addNew')}</span>
            </button>

            <Link
              href="/profile"
              className="text-xs font-bold text-gray-500 hover:text-brand-brown underline uppercase tracking-wider transition-colors"
            >
              {t('checkout.manageAddresses')}
            </Link>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={!selectedAddressId}
              className="w-full bg-brand-brown hover:bg-brand-amber disabled:opacity-50 text-white py-4 text-xs font-black uppercase tracking-[0.2em] transition-colors shadow-lg cursor-pointer"
            >
              {t('checkout.continueToPayment')}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                {t('checkout.firstName')} *
              </label>
              <input
                type="text"
                required
                value={shippingData.firstName}
                onChange={(e) =>
                  onSetShippingData((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                placeholder="Phannida"
                className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-brown"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                {t('checkout.lastName')} *
              </label>
              <input
                type="text"
                required
                value={shippingData.lastName}
                onChange={(e) =>
                  onSetShippingData((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
                placeholder="Wissanu"
                className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-brown"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                {t('checkout.email')} *
              </label>
              <input
                type="email"
                required
                value={shippingData.email}
                onChange={(e) =>
                  onSetShippingData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                placeholder="customer@nida.com"
                className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-brown"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                {t('checkout.phone')} *
              </label>
              <input
                type="tel"
                required
                value={shippingData.phone}
                onChange={(e) =>
                  onSetShippingData((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                placeholder="081-234-5678"
                className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-brown"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              {t('checkout.address')} *
            </label>
            <input
              type="text"
              required
              value={shippingData.address}
              onChange={(e) =>
                onSetShippingData((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
              placeholder="108 Sukhumvit Soi 24"
              className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-brown"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                {t('addressBook.subdistrict')}
              </label>
              <input
                type="text"
                value={shippingData.subdistrict}
                onChange={(e) =>
                  onSetShippingData((prev) => ({
                    ...prev,
                    subdistrict: e.target.value,
                  }))
                }
                placeholder={t('addressBook.subdistrictPlaceholder')}
                className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-brown"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                {t('checkout.city')} *
              </label>
              <input
                type="text"
                required
                value={shippingData.city}
                onChange={(e) =>
                  onSetShippingData((prev) => ({
                    ...prev,
                    city: e.target.value,
                    district: e.target.value,
                  }))
                }
                placeholder="Bangkok"
                className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-brown"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                {t('addressBook.province')}
              </label>
              <input
                type="text"
                value={shippingData.province}
                onChange={(e) =>
                  onSetShippingData((prev) => ({
                    ...prev,
                    province: e.target.value,
                  }))
                }
                placeholder={t('addressBook.provincePlaceholder')}
                className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-brown"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                {t('checkout.postalCode')} *
              </label>
              <input
                type="text"
                required
                value={shippingData.postalCode}
                onChange={(e) =>
                  onSetShippingData((prev) => ({
                    ...prev,
                    postalCode: e.target.value,
                  }))
                }
                placeholder="10110"
                className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-brown"
              />
            </div>
          </div>

          {isAuthenticated && (
            <div className="pt-2">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveToAddressBook}
                  onChange={(e) => onSetSaveToAddressBook(e.target.checked)}
                  className="w-4 h-4 text-brand-brown accent-brand-brown border-gray-300 rounded-none focus:ring-0"
                />
                <span className="text-xs font-medium text-gray-700">
                  {t('checkout.saveToAddressBook')}
                </span>
              </label>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-brand-brown hover:bg-brand-amber text-white py-4 text-xs font-black uppercase tracking-[0.2em] transition-colors shadow-lg cursor-pointer"
            >
              {t('checkout.continueToPayment')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
