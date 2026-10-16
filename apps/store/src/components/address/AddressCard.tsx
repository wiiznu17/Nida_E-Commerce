'use client';

import React from 'react';
import { MapPin, Check, Edit3, Trash2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiAddress } from '@repo/types';

export interface AddressCardProps {
  address: ApiAddress;
  mode?: 'manage' | 'select';
  isSelected?: boolean;
  onSelect?: (address: ApiAddress) => void;
  onEdit?: (address: ApiAddress) => void;
  onDelete?: (address: ApiAddress) => void;
  onSetDefault?: (address: ApiAddress) => void;
  isActionLoading?: boolean;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  mode = 'manage',
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  isActionLoading = false,
}) => {
  const { t } = useLanguage();

  const isSelectMode = mode === 'select';

  const handleClick = () => {
    if (isSelectMode && onSelect) {
      onSelect(address);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative p-5 border transition-all text-left ${
        isSelectMode ? 'cursor-pointer hover:border-brand-brown' : ''
      } ${
        isSelected
          ? 'border-brand-brown bg-brand-warm-cream shadow-xs'
          : 'border-gray-200 bg-white hover:bg-stone-50/50'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {isSelectMode && (
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                isSelected
                  ? 'border-brand-brown bg-brand-brown text-white'
                  : 'border-gray-300 bg-white'
              }`}
            >
              {isSelected && <Check size={10} className="stroke-[3]" />}
            </div>
          )}
          <span className="text-xs font-black uppercase tracking-wider text-brand-brown flex items-center">
            <MapPin size={13} className="mr-1 text-brand-amber inline-block" />
            {address.recipientName}
          </span>
        </div>

        {address.isDefault && (
          <span className="text-[10px] bg-brand-brown text-white px-2 py-0.5 font-bold uppercase tracking-wider">
            {t('addressBook.defaultBadge')}
          </span>
        )}
      </div>

      {/* Address Details */}
      <div className="text-xs text-gray-700 leading-relaxed font-medium space-y-1 mb-4">
        <p className="text-gray-900 font-semibold">{address.addressLine1}</p>
        {address.addressLine2 && (
          <p className="text-gray-600">{address.addressLine2}</p>
        )}
        <p className="text-gray-600">
          {[
            address.subdistrict,
            address.district,
            address.province,
            address.postalCode,
          ]
            .filter(Boolean)
            .join(' ')}
        </p>
        <p className="text-gray-500 pt-1">
          <span className="font-semibold text-gray-600">
            {t('addressBook.tel')}:
          </span>{' '}
          {address.phone}
        </p>
      </div>

      {/* Action Footer in Manage Mode */}
      {!isSelectMode && (
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3 text-xs">
          <div>
            {!address.isDefault && onSetDefault && (
              <button
                type="button"
                onClick={() => onSetDefault(address)}
                disabled={isActionLoading}
                className="text-[11px] font-bold text-gray-500 hover:text-brand-brown underline uppercase tracking-wider transition-colors cursor-pointer"
              >
                {t('addressBook.setDefault')}
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(address)}
                disabled={isActionLoading}
                className="inline-flex items-center text-xs font-bold text-brand-brown hover:text-brand-amber transition-colors cursor-pointer"
              >
                <Edit3 size={13} className="mr-1" />
                <span>{t('addressBook.edit')}</span>
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(address)}
                disabled={isActionLoading}
                className="inline-flex items-center text-xs font-bold text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
              >
                <Trash2 size={13} className="mr-1" />
                <span>{t('addressBook.delete')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
