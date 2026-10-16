import React from 'react';
import { Plus, MapPin } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { AddressCard } from '@/components/address';
import type { ApiAddress } from '@repo/types';

interface ProfileAddressesTabProps {
  addresses: ApiAddress[];
  isLoading: boolean;
  isActionLoading: boolean;
  onOpenAddAddress: () => void;
  onOpenEditAddress: (addr: ApiAddress) => void;
  onDeleteAddress: (addr: ApiAddress) => void;
  onSetDefaultAddress: (addr: ApiAddress) => void;
}

export function ProfileAddressesTab({
  addresses,
  isLoading,
  isActionLoading,
  onOpenAddAddress,
  onOpenEditAddress,
  onDeleteAddress,
  onSetDefaultAddress,
}: ProfileAddressesTabProps) {
  const { t } = useLanguage();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-gray-200 gap-4">
        <div>
          <h2 className="text-xl font-black text-brand-brown uppercase tracking-tight">
            {t('addressBook.title')}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {t('addressBook.subtitle')}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAddAddress}
          className="bg-brand-brown hover:bg-brand-amber text-white px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center self-start sm:self-auto cursor-pointer"
        >
          <Plus size={14} className="mr-1.5" />
          <span>{t('addressBook.addNew')}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center items-center text-stone-400 text-xs">
          <div className="w-5 h-5 border-2 border-brand-brown/20 border-t-brand-brown rounded-full animate-spin mr-2" />
          <span>{t('addressBook.saving')}</span>
        </div>
      ) : addresses.length === 0 ? (
        <div className="border border-dashed border-gray-300 p-10 flex flex-col items-center justify-center text-center bg-gray-50/50">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
            <MapPin size={22} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-tight text-brand-brown mb-1">
            {t('addressBook.emptyTitle')}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mb-5">
            {t('addressBook.emptyDesc')}
          </p>
          <button
            type="button"
            onClick={onOpenAddAddress}
            className="bg-brand-brown hover:bg-brand-amber text-white px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center"
          >
            <Plus size={14} className="mr-1.5" />
            <span>{t('addressBook.addNew')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              mode="manage"
              onEdit={onOpenEditAddress}
              onDelete={onDeleteAddress}
              onSetDefault={onSetDefaultAddress}
              isActionLoading={isActionLoading}
            />
          ))}

          {/* Add New Address Card in Grid */}
          <div
            onClick={onOpenAddAddress}
            className="border border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center bg-stone-50/40 hover:bg-stone-50 hover:border-brand-brown transition-colors cursor-pointer min-h-[160px]"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-brand-brown mb-2 shadow-2xs">
              <Plus size={18} />
            </div>
            <p className="text-xs font-black uppercase tracking-wider text-brand-brown">
              {t('addressBook.addNew')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
