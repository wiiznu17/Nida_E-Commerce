'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Alert } from '@/components/ui';
import type { ApiAddress, CreateAddressDto } from '@repo/types';

export interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  address?: ApiAddress | null;
  onSave: (data: CreateAddressDto) => Promise<void>;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  address,
  onSave,
}) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<CreateAddressDto>({
    recipientName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    subdistrict: '',
    district: '',
    province: '',
    postalCode: '',
    isDefault: false,
  });

  useEffect(() => {
    if (address) {
      setFormData({
        recipientName: address.recipientName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 ?? '',
        subdistrict: address.subdistrict,
        district: address.district,
        province: address.province,
        postalCode: address.postalCode,
        isDefault: address.isDefault,
      });
    } else {
      setFormData({
        recipientName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        subdistrict: '',
        district: '',
        province: '',
        postalCode: '',
        isDefault: false,
      });
    }
    setError('');
  }, [address, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onSave({
        ...formData,
        addressLine2: formData.addressLine2?.trim()
          ? formData.addressLine2.trim()
          : undefined,
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save address. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border border-brand-border w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-brand-border bg-brand-warm-cream shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-brand-brown">
              {address
                ? t('addressBook.modalEditTitle')
                : t('addressBook.modalAddTitle')}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {t('addressBook.subtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-black/5 text-stone-400 hover:text-brand-brown flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1">
          {error && <Alert variant="error">{error}</Alert>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                {t('addressBook.recipientName')} *
              </label>
              <input
                type="text"
                required
                value={formData.recipientName}
                onChange={(e) =>
                  setFormData({ ...formData, recipientName: e.target.value })
                }
                placeholder={t('addressBook.recipientNamePlaceholder')}
                className="w-full border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-brown bg-white transition-colors placeholder:text-stone-400 text-stone-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                {t('addressBook.phone')} *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder={t('addressBook.phonePlaceholder')}
                className="w-full border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-brown bg-white transition-colors placeholder:text-stone-400 text-stone-800 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              {t('addressBook.addressLine1')} *
            </label>
            <input
              type="text"
              required
              value={formData.addressLine1}
              onChange={(e) =>
                setFormData({ ...formData, addressLine1: e.target.value })
              }
              placeholder={t('addressBook.addressLine1Placeholder')}
              className="w-full border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-brown bg-white transition-colors placeholder:text-stone-400 text-stone-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              {t('addressBook.addressLine2')}
            </label>
            <input
              type="text"
              value={formData.addressLine2 ?? ''}
              onChange={(e) =>
                setFormData({ ...formData, addressLine2: e.target.value })
              }
              placeholder={t('addressBook.addressLine2Placeholder')}
              className="w-full border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-brown bg-white transition-colors placeholder:text-stone-400 text-stone-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                {t('addressBook.subdistrict')} *
              </label>
              <input
                type="text"
                required
                value={formData.subdistrict}
                onChange={(e) =>
                  setFormData({ ...formData, subdistrict: e.target.value })
                }
                placeholder={t('addressBook.subdistrictPlaceholder')}
                className="w-full border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-brown bg-white transition-colors placeholder:text-stone-400 text-stone-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                {t('addressBook.district')} *
              </label>
              <input
                type="text"
                required
                value={formData.district}
                onChange={(e) =>
                  setFormData({ ...formData, district: e.target.value })
                }
                placeholder={t('addressBook.districtPlaceholder')}
                className="w-full border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-brown bg-white transition-colors placeholder:text-stone-400 text-stone-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                {t('addressBook.province')} *
              </label>
              <input
                type="text"
                required
                value={formData.province}
                onChange={(e) =>
                  setFormData({ ...formData, province: e.target.value })
                }
                placeholder={t('addressBook.provincePlaceholder')}
                className="w-full border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-brown bg-white transition-colors placeholder:text-stone-400 text-stone-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                {t('addressBook.postalCode')} *
              </label>
              <input
                type="text"
                required
                value={formData.postalCode}
                onChange={(e) =>
                  setFormData({ ...formData, postalCode: e.target.value })
                }
                placeholder={t('addressBook.postalCodePlaceholder')}
                className="w-full border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-brown bg-white transition-colors placeholder:text-stone-400 text-stone-800 font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between p-3.5 bg-stone-50 border border-stone-200">
              <span className="text-xs font-medium text-stone-700">
                {t('addressBook.isDefaultLabel')}
              </span>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, isDefault: !formData.isDefault })
                }
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                  formData.isDefault ? 'bg-brand-brown' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    formData.isDefault ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-5 border-t border-brand-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-600 hover:text-brand-brown border border-stone-300 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              {t('auth.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-brown hover:bg-brand-amber disabled:opacity-50 text-white px-7 py-2.5 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer shadow-md inline-flex items-center space-x-2"
            >
              {isSubmitting ? (
                <span>{t('addressBook.saving')}</span>
              ) : (
                <span>{t('addressBook.saveAddress')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
