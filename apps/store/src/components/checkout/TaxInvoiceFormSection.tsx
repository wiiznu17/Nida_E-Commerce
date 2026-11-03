'use client';

import React from 'react';
import { FileText, Building2, User, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { TaxInvoiceFormData, ShippingFormData } from './checkoutTypes';

interface TaxInvoiceFormSectionProps {
  taxInvoiceData: TaxInvoiceFormData;
  onChange: React.Dispatch<React.SetStateAction<TaxInvoiceFormData>>;
  shippingData?: ShippingFormData;
}

export function TaxInvoiceFormSection({
  taxInvoiceData,
  onChange,
  shippingData,
}: TaxInvoiceFormSectionProps) {
  const { t } = useLanguage();

  const handleToggleRequest = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    onChange((prev) => {
      let initialName = prev.name;
      let initialAddress = prev.address;

      if (checked && prev.useShippingAddress && shippingData) {
        if (!initialName && shippingData.firstName) {
          initialName = `${shippingData.firstName} ${shippingData.lastName}`.trim();
        }
        if (!initialAddress && shippingData.address) {
          initialAddress = [
            shippingData.address,
            shippingData.addressLine2,
            shippingData.subdistrict,
            shippingData.district || shippingData.city,
            shippingData.province,
            shippingData.postalCode,
          ]
            .filter(Boolean)
            .join(' ');
        }
      }

      return {
        ...prev,
        requestTaxInvoice: checked,
        name: initialName,
        address: initialAddress,
      };
    });
  };

  const handleUseShippingAddressToggle = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const checked = e.target.checked;
    onChange((prev) => {
      let newAddress = prev.address;
      let newName = prev.name;

      if (checked && shippingData) {
        if (prev.payerType === 'PERSONAL' && !newName) {
          newName = `${shippingData.firstName} ${shippingData.lastName}`.trim();
        }
        newAddress = [
          shippingData.address,
          shippingData.addressLine2,
          shippingData.subdistrict,
          shippingData.district || shippingData.city,
          shippingData.province,
          shippingData.postalCode,
        ]
          .filter(Boolean)
          .join(' ');
      }

      return {
        ...prev,
        useShippingAddress: checked,
        name: newName,
        address: newAddress,
      };
    });
  };

  return (
    <div className="border border-brand-brown/15 bg-[#FAF7F2] p-5 rounded-xs transition-all duration-200">
      {/* Opt-in Header Checkbox */}
      <label className="flex items-start gap-3 cursor-pointer select-none">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            type="checkbox"
            checked={taxInvoiceData.requestTaxInvoice}
            onChange={handleToggleRequest}
            className="peer sr-only"
          />
          <div className="w-4 h-4 border border-brand-brown/40 bg-white peer-checked:bg-brand-brown peer-checked:border-brand-brown rounded-xs transition-colors flex items-center justify-center">
            {taxInvoiceData.requestTaxInvoice && (
              <Check className="w-3 h-3 text-[#FAF7F2] stroke-[3]" />
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-brown/80" />
            <span className="font-bold text-sm tracking-tight text-brand-brown uppercase">
              {t('checkout.taxInvoice.requestTitle')}
            </span>
          </div>
          <p className="text-xs text-brand-brown/60 mt-0.5 leading-relaxed">
            {t('checkout.taxInvoice.requestDesc')}
          </p>
        </div>
      </label>

      {/* Expandable Form Body */}
      {taxInvoiceData.requestTaxInvoice && (
        <div className="mt-5 pt-5 border-t border-brand-brown/10 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Payer Type Radio Buttons */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-brand-brown/70 mb-2">
              {t('checkout.taxInvoice.branchType')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    payerType: 'PERSONAL',
                  }))
                }
                className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold uppercase tracking-wider border rounded-xs transition-all cursor-pointer ${
                  taxInvoiceData.payerType === 'PERSONAL'
                    ? 'bg-brand-brown text-[#FAF7F2] border-brand-brown shadow-xs'
                    : 'bg-white text-brand-brown/80 border-brand-brown/20 hover:border-brand-brown/40'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{t('checkout.taxInvoice.payerTypePersonal')}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    payerType: 'COMPANY',
                  }))
                }
                className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold uppercase tracking-wider border rounded-xs transition-all cursor-pointer ${
                  taxInvoiceData.payerType === 'COMPANY'
                    ? 'bg-brand-brown text-[#FAF7F2] border-brand-brown shadow-xs'
                    : 'bg-white text-brand-brown/80 border-brand-brown/20 hover:border-brand-brown/40'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{t('checkout.taxInvoice.payerTypeCompany')}</span>
              </button>
            </div>
          </div>

          {/* Conditional Fields: Personal vs Company */}
          {taxInvoiceData.payerType === 'PERSONAL' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-brand-brown/70 mb-1">
                  {t('checkout.taxInvoice.personalName')}
                </label>
                <input
                  type="text"
                  required={taxInvoiceData.requestTaxInvoice}
                  value={taxInvoiceData.name}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder={t('checkout.taxInvoice.personalNamePlaceholder')}
                  className="w-full text-xs px-3 py-2 bg-white border border-brand-brown/20 focus:border-brand-brown focus:outline-hidden rounded-xs text-brand-brown placeholder:text-brand-brown/30"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-brand-brown/70 mb-1">
                  {t('checkout.taxInvoice.personalTaxId')}
                </label>
                <input
                  type="text"
                  required={taxInvoiceData.requestTaxInvoice}
                  maxLength={20}
                  value={taxInvoiceData.taxId}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, taxId: e.target.value }))
                  }
                  placeholder={t('checkout.taxInvoice.personalTaxIdPlaceholder')}
                  className="w-full text-xs px-3 py-2 bg-white border border-brand-brown/20 focus:border-brand-brown focus:outline-hidden rounded-xs text-brand-brown placeholder:text-brand-brown/30 font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-brand-brown/70 mb-1">
                    {t('checkout.taxInvoice.companyName')}
                  </label>
                  <input
                    type="text"
                    required={taxInvoiceData.requestTaxInvoice}
                    value={taxInvoiceData.name}
                    onChange={(e) =>
                      onChange((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder={t('checkout.taxInvoice.companyNamePlaceholder')}
                    className="w-full text-xs px-3 py-2 bg-white border border-brand-brown/20 focus:border-brand-brown focus:outline-hidden rounded-xs text-brand-brown placeholder:text-brand-brown/30"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-brand-brown/70 mb-1">
                    {t('checkout.taxInvoice.companyTaxId')}
                  </label>
                  <input
                    type="text"
                    required={taxInvoiceData.requestTaxInvoice}
                    maxLength={13}
                    value={taxInvoiceData.taxId}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        taxId: e.target.value.replace(/\D/g, ''),
                      }))
                    }
                    placeholder={t('checkout.taxInvoice.companyTaxIdPlaceholder')}
                    className="w-full text-xs px-3 py-2 bg-white border border-brand-brown/20 focus:border-brand-brown focus:outline-hidden rounded-xs text-brand-brown placeholder:text-brand-brown/30 font-mono tracking-widest"
                  />
                </div>
              </div>

              {/* Branch Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-brand-brown/70 mb-1">
                    {t('checkout.taxInvoice.branchType')}
                  </label>
                  <div className="flex gap-4 items-center h-[38px] px-3 bg-white border border-brand-brown/20 rounded-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-brand-brown">
                      <input
                        type="radio"
                        name="branchType"
                        checked={taxInvoiceData.branchType === 'HEADQUARTERS'}
                        onChange={() =>
                          onChange((prev) => ({
                            ...prev,
                            branchType: 'HEADQUARTERS',
                            branchCode: '00000',
                          }))
                        }
                        className="text-brand-brown focus:ring-0"
                      />
                      <span>{t('checkout.taxInvoice.branchHeadquarters')}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-brand-brown">
                      <input
                        type="radio"
                        name="branchType"
                        checked={taxInvoiceData.branchType === 'BRANCH'}
                        onChange={() =>
                          onChange((prev) => ({
                            ...prev,
                            branchType: 'BRANCH',
                            branchCode: '',
                          }))
                        }
                        className="text-brand-brown focus:ring-0"
                      />
                      <span>{t('checkout.taxInvoice.branchSub')}</span>
                    </label>
                  </div>
                </div>

                {taxInvoiceData.branchType === 'BRANCH' && (
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-brand-brown/70 mb-1">
                      {t('checkout.taxInvoice.branchCode')}
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      required={taxInvoiceData.branchType === 'BRANCH'}
                      value={taxInvoiceData.branchCode}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          branchCode: e.target.value.replace(/\D/g, ''),
                        }))
                      }
                      placeholder={t('checkout.taxInvoice.branchCodePlaceholder')}
                      className="w-full text-xs px-3 py-2 bg-white border border-brand-brown/20 focus:border-brand-brown focus:outline-hidden rounded-xs text-brand-brown placeholder:text-brand-brown/30 font-mono tracking-widest"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sync Address Checkbox */}
          {shippingData && (
            <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={taxInvoiceData.useShippingAddress}
                onChange={handleUseShippingAddressToggle}
                className="w-3.5 h-3.5 border border-brand-brown/30 rounded-xs text-brand-brown focus:ring-0"
              />
              <span className="text-xs text-brand-brown/80 font-medium">
                {t('checkout.taxInvoice.useShippingAddress')}
              </span>
            </label>
          )}

          {/* Address Textarea */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-brand-brown/70 mb-1">
              {t('checkout.taxInvoice.address')}
            </label>
            <textarea
              required={taxInvoiceData.requestTaxInvoice}
              rows={2}
              value={taxInvoiceData.address}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder={t('checkout.taxInvoice.addressPlaceholder')}
              className="w-full text-xs px-3 py-2 bg-white border border-brand-brown/20 focus:border-brand-brown focus:outline-hidden rounded-xs text-brand-brown placeholder:text-brand-brown/30 resize-none leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  );
}

