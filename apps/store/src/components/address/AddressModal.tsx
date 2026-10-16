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
        addressLine2: formData.addressLine2?.trim() ? formData.addressLine2.trim() : undefined,
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
      <div className="bg-white border border-brand-border w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-brand-warm-cream">
          <div className="flex items-center space-x-2">
            <MapPin size={16} className="text-brand-amber" />
            <h3 className="text-sm font-black uppercase tracking-tight text-brand-brown">
              {address
                ? t('addressBook.modalEditTitle')
                : t('addressBook.modalAddTitle')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-brand-brown p-1 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                {t('addressBook.recipientName')}
              </label>
              <input
                type="text"
                required
                value={formData.recipientName}
                onChange={(e) =>
                  setFormData({ ...formData, recipientName: e.target.value })
                }
                placeholder={t('addressBook.recipientNamePlaceholder')}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-brown"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                {t('addressBook.phone')}
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder={t('addressBook.phonePlaceholder')}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-brown"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              {t('addressBook.addressLine1')}
            </label>
            <input
              type="text"
              required
              value={formData.addressLine1}
              onChange={(e) =>
                setFormData({ ...formData, addressLine1: e.target.value })
              }
              placeholder={t('addressBook.addressLine1Placeholder')}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-brown"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              {t('addressBook.addressLine2')}
            </label>
            <input
              type="text"
              value={formData.addressLine2 ?? ''}
              onChange={(e) =>
                setFormData({ ...formData, addressLine2: e.target.value })
              }
              placeholder={t('addressBook.addressLine2Placeholder')}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-brown"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                {t('addressBook.subdistrict')}
              </label>
              <input
                type="text"
                required
                value={formData.subdistrict}
                onChange={(e) =>
                  setFormData({ ...formData, subdistrict: e.target.value })
                }
                placeholder={t('addressBook.subdistrictPlaceholder')}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-brown"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                {t('addressBook.district')}
              </label>
              <input
                type="text"
                required
                value={formData.district}
                onChange={(e) =>
                  setFormData({ ...formData, district: e.target.value })
                }
                placeholder={t('addressBook.districtPlaceholder')}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-brown"
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
                required
                value={formData.province}
                onChange={(e) =>
                  setFormData({ ...formData, province: e.target.value })
                }
                placeholder={t('addressBook.provincePlaceholder')}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-brown"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                {t('addressBook.postalCode')}
              </label>
              <input
                type="text"
                required
                value={formData.postalCode}
                onChange={(e) =>
                  setFormData({ ...formData, postalCode: e.target.value })
                }
                placeholder={t('addressBook.postalCodePlaceholder')}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-brown"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.isDefault)}
                onChange={(e) =>
                  setFormData({ ...formData, isDefault: e.target.checked })
                }
                className="w-4 h-4 text-brand-brown accent-brand-brown border-gray-300 rounded-none focus:ring-0"
              />
              <span className="text-xs font-medium text-gray-700">
                {t('addressBook.isDefaultLabel')}
              </span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-brand-brown transition-colors cursor-pointer"
            >
              {t('auth.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-brown hover:bg-brand-amber text-white px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
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
