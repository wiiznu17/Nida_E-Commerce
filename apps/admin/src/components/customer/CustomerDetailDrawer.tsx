import { useState, useEffect, useCallback } from 'react';
import {
  X,
  Eye,
  EyeOff,
  MapPin,
  ShoppingBag,
  User,
  ShieldAlert,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge } from '../common';
import { MEMBERSHIP_TIER_STYLES } from './customerConstants';
import { customerRequester } from '../../api/requester/customerRequester';
import { formatCurrency, formatDate } from '../../utils';
import type { ApiAdminCustomerDetail } from '@repo/types';

export interface CustomerDetailDrawerProps {
  isOpen: boolean;
  customerId: string | null;
  onClose: () => void;
}

export function CustomerDetailDrawer({
  isOpen,
  customerId,
  onClose,
}: CustomerDetailDrawerProps) {
  const { t } = useLanguage();
  const [customer, setCustomer] = useState<ApiAdminCustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPiiRevealed, setIsPiiRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = useCallback(
    async (reveal = false) => {
      if (!customerId) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await customerRequester.getCustomerById(
          customerId,
          reveal,
        );
        setCustomer(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load details');
      } finally {
        setIsLoading(false);
      }
    },
    [customerId],
  );

  useEffect(() => {
    if (isOpen && customerId) {
      setIsPiiRevealed(false);
      fetchCustomer(false);
    } else {
      setCustomer(null);
      setError(null);
      setIsPiiRevealed(false);
    }
  }, [isOpen, customerId, fetchCustomer]);

  const handleTogglePii = () => {
    const nextState = !isPiiRevealed;
    setIsPiiRevealed(nextState);
    fetchCustomer(nextState);
  };

  if (!isOpen) return null;

  const tierStyle = customer
    ? (MEMBERSHIP_TIER_STYLES[customer.tier] ?? MEMBERSHIP_TIER_STYLES.REGULAR)
    : MEMBERSHIP_TIER_STYLES.REGULAR;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-brand-border">
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-stone-900">
                {t('customers.drawer.title')}
              </h2>
              {customer && (
                <p className="text-[11px] font-mono text-stone-500 mt-0.5">
                  ID: {customer.id}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {isLoading && !customer ? (
              <div className="py-16 text-center">
                <div className="inline-block animate-spin w-6 h-6 border-2 border-stone-300 border-t-[#2B1810] rounded-full mb-2" />
                <p className="text-xs text-stone-500 font-bold">
                  {t('users.loading')}
                </p>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {error}
              </div>
            ) : customer ? (
              <>
                {/* Profile Banner */}
                <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-stone-900">
                        {customer.fullName}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}
                        >
                          {tierStyle.label}
                        </span>
                        <StatusBadge status={customer.status} />
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">
                        {t('customers.table.points')}
                      </span>
                      <span className="text-sm font-mono font-bold text-stone-800">
                        {customer.points.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Suspension reason alert */}
                  {customer.statusReason && (
                    <div className="bg-amber-50/70 border border-amber-200 rounded-md p-2.5 text-xs text-amber-900 flex items-start space-x-2">
                      <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">
                          {t('customers.modals.reasonLabel')}:{' '}
                        </span>
                        <span>{customer.statusReason}</span>
                        {customer.suspendedUntil && (
                          <div className="text-[10px] font-mono text-amber-700 mt-0.5">
                            Until: {formatDate(customer.suspendedUntil)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PII Controls */}
                  <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                    <span className="text-[11px] text-stone-500 font-medium">
                      PII Protection
                    </span>
                    <button
                      type="button"
                      onClick={handleTogglePii}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-md border border-stone-300 hover:border-stone-500 bg-white text-stone-700 transition-colors inline-flex items-center space-x-1 cursor-pointer shadow-2xs"
                    >
                      {isPiiRevealed ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                          <span>Mask PII</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-stone-500" />
                          <span>{t('customers.drawer.revealPii')}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {isPiiRevealed && (
                    <p className="text-[10px] text-amber-800 bg-amber-50/60 p-2 rounded-sm border border-amber-200/80">
                      {t('customers.drawer.piiRevealedHint')}
                    </p>
                  )}
                </div>

                {/* Profile Details List */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-stone-500 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>{t('customers.drawer.profile')}</span>
                  </h4>
                  <div className="bg-white border border-stone-200 rounded-lg divide-y divide-stone-100 text-xs">
                    <div className="p-3 flex justify-between">
                      <span className="text-stone-500">Email</span>
                      <span className="font-mono text-stone-800 font-medium">
                        {customer.email}
                      </span>
                    </div>
                    <div className="p-3 flex justify-between">
                      <span className="text-stone-500">Phone</span>
                      <span className="font-mono text-stone-800 font-medium">
                        {customer.phone ?? '—'}
                      </span>
                    </div>
                    <div className="p-3 flex justify-between">
                      <span className="text-stone-500">
                        {t('customers.table.totalSpent')}
                      </span>
                      <span className="font-mono font-bold text-[#2B1810]">
                        {formatCurrency(customer.totalSpent)}
                      </span>
                    </div>
                    <div className="p-3 flex justify-between">
                      <span className="text-stone-500">
                        {t('customers.table.createdAt')}
                      </span>
                      <span className="text-stone-700">
                        {formatDate(customer.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Saved Delivery Addresses */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-stone-500 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{t('customers.drawer.addresses')}</span>
                  </h4>
                  {customer.addresses.length === 0 ? (
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-400 text-center">
                      {t('customers.drawer.noAddresses')}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {customer.addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="p-3 bg-white border border-stone-200 rounded-lg text-xs space-y-1 relative"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-900">
                              {addr.recipientName}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {t('customers.drawer.defaultBadge')}
                              </span>
                            )}
                          </div>
                          <div className="text-stone-600 font-mono text-[11px]">
                            {addr.phone}
                          </div>
                          <div className="text-stone-600 text-[11px] leading-relaxed">
                            {addr.addressLine1}
                            {addr.addressLine2
                              ? ` ${addr.addressLine2}`
                              : ''}, {addr.subdistrict}, {addr.district},{' '}
                            {addr.province} {addr.postalCode}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Orders */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-stone-500 flex items-center space-x-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{t('customers.drawer.ordersHistory')}</span>
                  </h4>
                  {customer.recentOrders.length === 0 ? (
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-400 text-center">
                      {t('customers.drawer.noOrders')}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {customer.recentOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="p-3 bg-white border border-stone-200 rounded-lg text-xs flex items-center justify-between"
                        >
                          <div>
                            <span className="font-mono font-bold text-stone-900 block">
                              {ord.orderNumber}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {formatDate(ord.createdAt)}
                            </span>
                          </div>
                          <div className="text-right space-y-1">
                            <span className="font-mono font-bold text-stone-900 block">
                              {formatCurrency(ord.totalAmount)}
                            </span>
                            <StatusBadge status={ord.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-stone-200 bg-stone-50/50 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 rounded-xs text-xs font-black uppercase tracking-wider text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              {t('customers.drawer.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
