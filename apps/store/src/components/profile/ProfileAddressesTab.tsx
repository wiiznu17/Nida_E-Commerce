import React from 'react';
import { Plus, MapPin } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { AddressCard } from '@/components/address';
import { EmptyState, LoadingSpinner } from '@/components/ui';
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
        <LoadingSpinner
          size="sm"
          text={t('addressBook.saving')}
          className="py-12"
        />
      ) : addresses.length === 0 ? (
        <EmptyState
          variant="dashed"
          icon={MapPin}
          title={t('addressBook.emptyTitle')}
          description={t('addressBook.emptyDesc')}
          action={{
            label: t('addressBook.addNew'),
            onClick: onOpenAddAddress,
          }}
          className="p-10"
        />
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
