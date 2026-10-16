'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  LogOut,
  Package,
  MapPin,
  User as UserIcon,
  Sparkles,
  Check,
  ArrowRight,
  ShieldCheck,
  Edit3,
  Plus,
} from 'lucide-react';
import { addressRequester } from '@/api';
import { orderRequester } from '@/api/requester/orderRequester';
import { AddressCard, AddressModal } from '@/components/address';
import type { ApiAddress, CreateAddressDto, ApiOrder } from '@repo/types';

export default function ProfilePage() {
  const { user, token, logout, updateProfile } = useAuth();

  const { language, t } = useLanguage();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    'profile' | 'orders' | 'addresses'
  >('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: user?.address || '108 Sukhumvit Soi 24',
    city: user?.city || (language === 'th' ? 'กรุงเทพมหานคร' : 'Bangkok'),
    postalCode: user?.postalCode || '10110',
  });

  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [isAddressesLoading, setIsAddressesLoading] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ApiAddress | null>(null);
  const [addressActionLoading, setAddressActionLoading] = useState(false);

  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);

  const fetchOrders = React.useCallback(async () => {
    if (!token) return;
    setIsOrdersLoading(true);
    try {
      const data = await orderRequester.getMyOrders(token);
      setOrders(data);
    } catch {
      // Graceful fallback
    } finally {
      setIsOrdersLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'orders' && token) {
      void fetchOrders();
    }
  }, [activeTab, token, fetchOrders]);

  const fetchAddresses = React.useCallback(async () => {
    if (!token) return;
    setIsAddressesLoading(true);
    try {
      const data = await addressRequester.getAddresses(token);
      setAddresses(data);
    } catch {
      // Graceful fallback
    } finally {
      setIsAddressesLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'addresses' && token) {
      void fetchAddresses();
    }
  }, [activeTab, token, fetchAddresses]);

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: ApiAddress) => {
    setEditingAddress(addr);
    setAddressModalOpen(true);
  };

  const handleSaveAddress = async (data: CreateAddressDto) => {
    if (!token) return;
    if (editingAddress) {
      await addressRequester.updateAddress(editingAddress.id, data, token);
    } else {
      await addressRequester.createAddress(data, token);
    }
    await fetchAddresses();
  };

  const handleDeleteAddress = async (addr: ApiAddress) => {
    if (!token) return;
    if (!window.confirm(t('addressBook.deleteConfirm'))) return;
    setAddressActionLoading(true);
    try {
      await addressRequester.deleteAddress(addr.id, token);
      await fetchAddresses();
    } finally {
      setAddressActionLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addr: ApiAddress) => {
    if (!token) return;
    setAddressActionLoading(true);
    try {
      await addressRequester.setDefaultAddress(addr.id, token);
      await fetchAddresses();
    } finally {
      setAddressActionLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: user.address || '108 Sukhumvit Soi 24',
        city: user.city || (language === 'th' ? 'กรุงเทพมหานคร' : 'Bangkok'),
        postalCode: user.postalCode || '10110',
      });
    }
  }, [user, router, language]);


  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      {/* Header Banner */}
      <div className="bg-brand-warm-cream border border-brand-border p-6 sm:p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-brand-brown text-brand-yellow flex items-center justify-center font-black text-2xl border-2 border-brand-yellow shadow-sm">
            {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'N'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-black text-brand-brown uppercase tracking-tight">
                {user.firstName} {user.lastName}
              </h1>
              <span className="bg-brand-brown text-brand-yellow text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                {user.tier || 'VIP GOLD'}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-semibold mt-1">
              {user.email} •{' '}
              {language === 'th' ? 'สมาชิก Nida Club' : 'Nida Club Member'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider block">
              {language === 'th' ? 'คะแนนสะสม' : 'Rewards Points'}
            </span>
            <span className="text-lg font-black text-brand-brown">
              {user.points || 1250} PTS
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center text-xs font-black uppercase tracking-wider text-gray-700 hover:text-red-600 border border-gray-300 hover:border-red-600 px-4 py-2 bg-white transition-colors"
          >
            <LogOut size={14} className="mr-1.5" /> {t('auth.logout')}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 text-xs font-bold flex items-center mb-6 rounded-xs animate-in fade-in">
          <Check size={16} className="mr-2" /> {t('auth.profileUpdated')}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Navigation Tabs */}
        <div className="col-span-1 md:col-span-3 space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-black uppercase tracking-wider transition-colors text-left ${
              activeTab === 'profile'
                ? 'bg-brand-brown text-white shadow-xs'
                : 'bg-white hover:bg-gray-100 text-brand-brown border border-gray-200'
            }`}
          >
            <UserIcon size={16} />
            <span>{t('auth.tabProfile')}</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-black uppercase tracking-wider transition-colors text-left ${
              activeTab === 'orders'
                ? 'bg-brand-brown text-white shadow-xs'
                : 'bg-white hover:bg-gray-100 text-brand-brown border border-gray-200'
            }`}
          >
            <Package size={16} />
            <span>{t('auth.tabOrders')}</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-black uppercase tracking-wider transition-colors text-left ${
              activeTab === 'addresses'
                ? 'bg-brand-brown text-white shadow-xs'
                : 'bg-white hover:bg-gray-100 text-brand-brown border border-gray-200'
            }`}
          >
            <MapPin size={16} />
            <span>{t('auth.tabAddresses')}</span>
          </button>

          {/* VIP Perks Card */}
          <div className="p-4 bg-brand-warm-cream border border-brand-border mt-6">
            <div className="flex items-center space-x-2 text-brand-amber mb-2">
              <Sparkles size={16} />
              <span className="text-xs font-black uppercase tracking-wider">
                {language === 'th' ? 'สิทธิประโยชน์สมาชิก' : 'Member Perks'}
              </span>
            </div>
            <ul className="text-[11px] text-gray-600 space-y-1.5 font-medium">
              <li>
                {language === 'th'
                  ? '✓ จัดส่งฟรีทุกออเดอร์ทั่วไทย'
                  : '✓ Free shipping on all orders'}
              </li>
              <li>
                {language === 'th'
                  ? '✓ ส่วนลด 20% โค้ด NIDA20'
                  : '✓ Extra 20% off code NIDA20'}
              </li>
              <li>
                {language === 'th'
                  ? '✓ สิทธิ์จองคอลเลกชันใหม่ก่อนใคร'
                  : '✓ Early private drop access'}
              </li>
            </ul>
          </div>
        </div>

        {/* Tab Content */}
        <div className="col-span-1 md:col-span-9 bg-white border border-gray-200 p-6 sm:p-8">
          {/* PROFILE INFO TAB */}
          {activeTab === 'profile' && (
            <div>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-black text-brand-brown uppercase tracking-tight">
                    {t('auth.tabProfile')}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {language === 'th'
                      ? 'จัดการข้อมูลชื่อ เบอร์ติดต่อ และยืนยันตัวตน'
                      : 'Manage your name, contact phone, and authentication details'}
                  </p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-brand-amber hover:underline"
                  >
                    <Edit3 size={14} />
                    <span>{t('auth.editProfile')}</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                        {t('auth.firstName')}
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-brown"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                        {t('auth.lastName')}
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-brown"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                      {t('auth.emailLabel')} -{' '}
                      {language === 'th' ? 'ปลอดภัยด้วย OTP' : 'OTP Protected'}
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      {language === 'th'
                        ? 'อีเมลผูกกับระบบ OTP เพื่อความปลอดภัยสูงสุด'
                        : 'Email linked to passwordless OTP system for maximum protection'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                      {t('auth.phone')}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-brown"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="bg-brand-brown hover:bg-brand-amber text-white px-6 py-2.5 text-xs font-black uppercase tracking-wider transition-colors shadow-xs"
                    >
                      {t('auth.saveChanges')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider border border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                      {t('auth.cancel')}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6 max-w-xl">
                  <div className="grid grid-cols-2 gap-6 bg-brand-warm-cream p-4 border border-brand-border">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                        {t('auth.firstName')}
                      </p>
                      <p className="text-sm font-bold text-brand-brown mt-0.5">
                        {user.firstName || 'Phannida'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                        {t('auth.lastName')}
                      </p>
                      <p className="text-sm font-bold text-brand-brown mt-0.5">
                        {user.lastName || 'Wissanu'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 bg-brand-warm-cream p-4 border border-brand-border">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                        {language === 'th'
                          ? 'อีเมลยืนยันแล้ว'
                          : 'Verified Email'}
                      </p>
                      <p className="text-sm font-bold text-brand-brown mt-0.5">
                        {user.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                        {t('auth.phone')}
                      </p>
                      <p className="text-sm font-bold text-brand-brown mt-0.5">
                        {user.phone || '081-892-3456'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-xs font-semibold">
                    <ShieldCheck size={18} />
                    <span>
                      {language === 'th'
                        ? 'บัญชีผ่านการตรวจสอบตัวตนด้วย OTP 2 ชั้น พร้อมใช้งานสมบูรณ์'
                        : 'Account authenticated via 2-factor OTP verification.'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div>
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-black text-brand-brown uppercase tracking-tight">
                  {t('auth.tabOrders')}
                </h2>
                <p className="text-xs text-gray-500">
                  {language === 'th'
                    ? 'ตรวจสอบสถานะและติดตามพัสดุแบบเรียลไทม์'
                    : 'Check order status and track shipments in real time'}
                </p>
              </div>

              {isOrdersLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="border border-gray-200 p-6 bg-white animate-pulse"
                    >
                      <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-100">
                        <div className="h-4 bg-gray-200 rounded-sm w-36" />
                        <div className="h-4 bg-gray-200 rounded-sm w-20" />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-20 bg-gray-200 rounded-xs" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-200 rounded-sm w-1/2" />
                          <div className="h-3 bg-gray-200 rounded-sm w-1/4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="border border-dashed border-gray-300 p-12 flex flex-col items-center justify-center text-center bg-gray-50/50">
                  <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                    <Package size={22} />
                  </div>
                  <h3 className="text-sm font-bold text-brand-brown uppercase tracking-wide mb-1">
                    {t('trackOrder.emptyOrders')}
                  </h3>
                  <p className="text-xs text-gray-500 max-w-sm mb-6">
                    {t('trackOrder.emptyOrdersDesc')}
                  </p>
                  <Link
                    href="/collections"
                    className="bg-brand-brown hover:bg-brand-amber text-white px-6 py-2.5 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center"
                  >
                    <span>{t('trackOrder.browseCatalog')}</span>
                    <ArrowRight size={14} className="ml-1.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => {
                    const statusBadgeClass =
                      order.status === 'DELIVERED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : order.status === 'SHIPPED'
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          : order.status === 'PROCESSING'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : order.status === 'PAID'
                              ? 'bg-sky-50 text-sky-800 border-sky-200'
                              : order.status === 'CANCELLED' || order.status === 'REFUNDED'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-stone-50 text-stone-700 border-stone-200';

                    const dotClass =
                      order.status === 'DELIVERED'
                        ? 'bg-emerald-500'
                        : order.status === 'SHIPPED'
                          ? 'bg-indigo-500'
                          : order.status === 'PROCESSING'
                            ? 'bg-amber-500'
                            : order.status === 'PAID'
                              ? 'bg-sky-500'
                              : order.status === 'CANCELLED' || order.status === 'REFUNDED'
                                ? 'bg-rose-500'
                                : 'bg-stone-400';

                    return (
                      <div
                        key={order.id}
                        className="border border-gray-200 p-6 bg-white hover:border-brand-brown transition-colors shadow-xs"
                      >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 mb-4 border-b border-gray-200">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-black text-sm text-brand-brown font-mono">
                                {t('trackOrder.order')} #{order.orderNumber}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 border rounded-xs inline-flex items-center space-x-1.5 ${statusBadgeClass}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                                <span>{order.status}</span>
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(order.placedAt).toLocaleDateString(
                                language === 'th' ? 'th-TH' : 'en-US',
                                {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                },
                              )}
                              {order.shipments?.[0]?.courierName && (
                                <span> • {order.shipments[0].courierName}</span>
                              )}
                            </p>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <span className="text-[10px] uppercase font-bold text-gray-400 block">
                                {t('checkout.total')}
                              </span>
                              <span className="text-base font-black text-brand-brown font-mono">
                                ฿{Number(order.totalAmount).toLocaleString()}
                              </span>
                            </div>
                            <Link
                              href={`/track-order/${order.orderNumber}`}
                              className="bg-brand-brown hover:bg-brand-amber text-white px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center"
                            >
                              <span>{t('orderSuccess.trackOrder')}</span>
                              <ArrowRight size={14} className="ml-1" />
                            </Link>
                          </div>
                        </div>

                        {/* Items preview list */}
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between text-xs py-1"
                            >
                              <div className="flex items-center gap-3">
                                {item.imageUrl ? (
                                  <div className="w-12 h-14 bg-gray-100 flex-shrink-0 border border-gray-200 overflow-hidden">
                                    <img
                                      src={item.imageUrl}
                                      alt={item.productName}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-12 h-14 bg-stone-100 flex-shrink-0 border border-stone-200 flex items-center justify-center text-stone-400">
                                    <Package size={16} />
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-bold text-brand-brown">
                                    {item.productName}
                                  </h4>
                                  <p className="text-gray-500 font-medium text-[11px]">
                                    {item.variantInfo}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right font-mono text-gray-700">
                                <span>
                                  {item.quantity} x ฿{Number(item.unitPrice).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Action buttons footer */}
                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
                          <Link
                            href="/collections"
                            className="border border-gray-300 hover:border-brand-brown text-gray-700 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors"
                          >
                            {t('trackOrder.reorder')}
                          </Link>
                          <Link
                            href={`/track-order/${order.orderNumber}`}
                            className="bg-stone-100 hover:bg-stone-200 text-brand-brown px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors"
                          >
                            {t('orderSuccess.trackOrder')}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === 'addresses' && (
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
                  onClick={handleOpenAddAddress}
                  className="bg-brand-brown hover:bg-brand-amber text-white px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center self-start sm:self-auto cursor-pointer"
                >
                  <Plus size={14} className="mr-1.5" />
                  <span>{t('addressBook.addNew')}</span>
                </button>
              </div>

              {isAddressesLoading ? (
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
                    onClick={handleOpenAddAddress}
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
                      onEdit={handleOpenEditAddress}
                      onDelete={handleDeleteAddress}
                      onSetDefault={handleSetDefaultAddress}
                      isActionLoading={addressActionLoading}
                    />
                  ))}

                  {/* Add New Address Card in Grid */}
                  <div
                    onClick={handleOpenAddAddress}
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
          )}
        </div>
      </div>

      <AddressModal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        address={editingAddress}
        onSave={handleSaveAddress}
      />
    </div>
  );
}

