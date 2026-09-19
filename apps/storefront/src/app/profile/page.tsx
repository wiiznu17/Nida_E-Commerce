'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
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
} from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: user?.address || '108 สุขุมวิท ซอย 24',
    city: user?.city || 'กรุงเทพมหานคร',
    postalCode: user?.postalCode || '10110',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: user.address || '108 สุขุมวิท ซอย 24',
        city: user.city || 'กรุงเทพมหานคร',
        postalCode: user.postalCode || '10110',
      });
    }
  }, [user, router]);

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
      <div className="bg-[#FAF7F2] border border-[#EAE3D9] p-6 sm:p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-[#2B1810] text-[#F59E0B] flex items-center justify-center font-black text-2xl border-2 border-[#F59E0B] shadow-sm">
            {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'N'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-black text-[#2B1810] uppercase tracking-tight">
                {user.firstName} {user.lastName}
              </h1>
              <span className="bg-[#2B1810] text-[#F59E0B] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                {user.tier || 'VIP GOLD'}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-semibold mt-1">{user.email} • สมาชิก Nida Club</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider block">
              คะแนนสะสม (Points)
            </span>
            <span className="text-lg font-black text-[#2B1810]">{user.points || 1250} PTS</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center text-xs font-black uppercase tracking-wider text-gray-700 hover:text-red-600 border border-gray-300 hover:border-red-600 px-4 py-2 bg-white transition-colors"
          >
            <LogOut size={14} className="mr-1.5" /> ออกจากระบบ
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 text-xs font-bold flex items-center mb-6 rounded-xs animate-in fade-in">
          <Check size={16} className="mr-2" /> บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Navigation Tabs */}
        <div className="col-span-1 md:col-span-3 space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-black uppercase tracking-wider transition-colors text-left ${
              activeTab === 'profile'
                ? 'bg-[#2B1810] text-white shadow-xs'
                : 'bg-white hover:bg-gray-100 text-[#2B1810] border border-gray-200'
            }`}
          >
            <UserIcon size={16} />
            <span>ข้อมูลส่วนตัว (Profile)</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-black uppercase tracking-wider transition-colors text-left ${
              activeTab === 'orders'
                ? 'bg-[#2B1810] text-white shadow-xs'
                : 'bg-white hover:bg-gray-100 text-[#2B1810] border border-gray-200'
            }`}
          >
            <Package size={16} />
            <span>ประวัติการสั่งซื้อ (Orders)</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-black uppercase tracking-wider transition-colors text-left ${
              activeTab === 'addresses'
                ? 'bg-[#2B1810] text-white shadow-xs'
                : 'bg-white hover:bg-gray-100 text-[#2B1810] border border-gray-200'
            }`}
          >
            <MapPin size={16} />
            <span>ที่อยู่จัดส่ง (Addresses)</span>
          </button>

          {/* VIP Perks Card */}
          <div className="p-4 bg-[#FAF7F2] border border-[#EAE3D9] mt-6">
            <div className="flex items-center space-x-2 text-[#D97706] mb-2">
              <Sparkles size={16} />
              <span className="text-xs font-black uppercase tracking-wider">สิทธิประโยชน์สมาชิก</span>
            </div>
            <ul className="text-[11px] text-gray-600 space-y-1.5 font-medium">
              <li>✓ จัดส่งฟรีทุกออเดอร์ทั่วไทย</li>
              <li>✓ ส่วนลด 20% โค้ด NIDA20</li>
              <li>✓ สิทธิ์จองคอลเลกชันใหม่ก่อนใคร</li>
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
                  <h2 className="text-xl font-black text-[#2B1810] uppercase tracking-tight">ข้อมูลส่วนตัว</h2>
                  <p className="text-xs text-gray-500">จัดการข้อมูลชื่อ เบอร์ติดต่อ และยืนยันตัวตน</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-[#D97706] hover:underline"
                  >
                    <Edit3 size={14} />
                    <span>แก้ไขข้อมูล</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                        ชื่อจริง (First Name) *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#2B1810]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                        นามสกุล (Last Name) *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#2B1810]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                      อีเมล (Email) - ปลอดภัยด้วย OTP
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">อีเมลผูกกับระบบ OTP เพื่อความปลอดภัยสูงสุด</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                      เบอร์โทรศัพท์ (Phone Number) *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#2B1810]"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="bg-[#2B1810] hover:bg-[#D97706] text-white px-6 py-2.5 text-xs font-black uppercase tracking-wider transition-colors shadow-xs"
                    >
                      บันทึกข้อมูล (Save)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider border border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6 max-w-xl">
                  <div className="grid grid-cols-2 gap-6 bg-[#FAF7F2] p-4 border border-[#EAE3D9]">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">ชื่อจริง</p>
                      <p className="text-sm font-bold text-[#2B1810] mt-0.5">{user.firstName || 'พรรณนิดา'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">นามสกุล</p>
                      <p className="text-sm font-bold text-[#2B1810] mt-0.5">{user.lastName || 'วิศณุ'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 bg-[#FAF7F2] p-4 border border-[#EAE3D9]">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">อีเมลยืนยันแล้ว</p>
                      <p className="text-sm font-bold text-[#2B1810] mt-0.5">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">เบอร์โทรศัพท์</p>
                      <p className="text-sm font-bold text-[#2B1810] mt-0.5">{user.phone || '081-892-3456'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-xs font-semibold">
                    <ShieldCheck size={18} />
                    <span>บัญชีผ่านการตรวจสอบตัวตนด้วย OTP 2 ชั้น พร้อมใช้งานสมบูรณ์</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div>
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-black text-[#2B1810] uppercase tracking-tight">ประวัติการสั่งซื้อ</h2>
                <p className="text-xs text-gray-500">ตรวจสอบสถานะและติดตามพัสดุแบบเรียลไทม์</p>
              </div>

              <div className="space-y-6">
                {/* Active Order Item */}
                <div className="border border-gray-200 p-6 bg-white hover:border-[#2B1810] transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 mb-4 border-b border-gray-200">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-sm text-[#2B1810]">ออเดอร์ #NIDA-918274</span>
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-xs">
                          กำลังจัดส่ง (In Transit)
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">สั่งซื้อเมื่อ 24 ตุลาคม 2024 • Kerry Express TH</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">ยอดรวม</span>
                        <span className="text-base font-black text-[#2B1810]">$340.00</span>
                      </div>
                      <Link
                        href="/track-order/918274"
                        className="bg-[#2B1810] hover:bg-[#D97706] text-white px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center"
                      >
                        <span>ติดตามสินค้า</span>
                        <ArrowRight size={14} className="ml-1" />
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 bg-gray-100 flex-shrink-0 border border-gray-200">
                      <img
                        src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                        alt="Heritage Double-Breasted Trench Coat"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-xs">
                      <h4 className="font-bold text-[#2B1810] text-sm">Heritage Double-Breasted Trench Coat</h4>
                      <p className="text-gray-500 font-semibold mt-0.5">Classic Khaki • Size M</p>
                      <p className="text-gray-500 mt-0.5">จำนวน: 1 ชิ้น • $289.00</p>
                    </div>
                  </div>
                </div>

                {/* Delivered Order */}
                <div className="border border-gray-200 p-6 bg-white">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 mb-4 border-b border-gray-200">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-sm text-[#2B1810]">ออเดอร์ #NIDA-847291</span>
                        <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-xs">
                          จัดส่งสำเร็จ (Delivered)
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">สั่งซื้อเมื่อ 15 ตุลาคม 2024</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">ยอดรวม</span>
                      <span className="text-base font-black text-[#2B1810]">$129.00</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 bg-gray-100 flex-shrink-0 border border-gray-200">
                      <img
                        src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                        alt="Cable Knit Sweater"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-xs">
                      <h4 className="font-bold text-[#2B1810] text-sm">Iconic Cable-Knit Crewneck Sweater</h4>
                      <p className="text-gray-500 font-semibold mt-0.5">Ivory White • Size S</p>
                      <p className="text-gray-500 mt-0.5">จำนวน: 1 ชิ้น</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-black text-[#2B1810] uppercase tracking-tight">ที่อยู่จัดส่งสินค้า</h2>
                  <p className="text-xs text-gray-500">ที่อยู่เริ่มต้นสำหรับการสั่งซื้อสินค้าแบรนด์ Nida</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-[#2B1810] p-5 bg-[#FAF7F2] relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-[#2B1810] flex items-center">
                      <MapPin size={14} className="mr-1 text-[#D97706]" /> ที่อยู่หลัก (DEFAULT)
                    </span>
                    <span className="text-[10px] bg-[#2B1810] text-white px-2 py-0.5 font-bold uppercase">บ้าน</span>
                  </div>
                  <div className="text-xs text-gray-700 leading-relaxed font-medium space-y-1">
                    <p className="font-bold text-[#2B1810] text-sm">
                      {user.firstName} {user.lastName}
                    </p>
                    <p>{formData.address}</p>
                    <p>
                      {formData.city} {formData.postalCode}
                    </p>
                    <p>โทร: {user.phone || '081-892-3456'}</p>
                  </div>
                </div>

                <div className="border border-dashed border-gray-300 p-5 flex flex-col items-center justify-center text-center bg-gray-50">
                  <MapPin size={24} className="text-gray-400 mb-2" />
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">เพิ่มที่อยู่ใหม่</p>
                  <p className="text-[11px] text-gray-400 mb-3">เพิ่มที่อยู่ที่ทำงาน หรือที่อยู่สำรอง</p>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="text-xs font-black uppercase text-[#2B1810] hover:text-[#D97706] underline"
                  >
                    แก้ไขที่อยู่หลัก
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
