'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Sparkles, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    agreeTerms: true,
  });
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email) {
      // Send to OTP verification
      router.push(
        `/verify-otp?email=${encodeURIComponent(formData.email)}&firstName=${encodeURIComponent(formData.firstName)}&lastName=${encodeURIComponent(formData.lastName)}&phone=${encodeURIComponent(formData.phone)}`,
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.id]: value });
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center px-4 py-16 bg-[#FAF7F2] font-sans">
      <div className="w-full max-w-md bg-white border border-[#EAE3D9] p-8 sm:p-10 shadow-sm relative">
        {/* Nida Flag Ribbon */}
        <div className="flex w-16 h-2 mx-auto mb-6">
          <div className="w-1/3 bg-[#2B1810]"></div>
          <div className="w-1/3 bg-white border-y border-gray-200"></div>
          <div className="w-1/3 bg-[#F59E0B]"></div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black uppercase text-center tracking-tight text-[#2B1810] mb-2">
          JOIN NIDA CLUB
        </h1>
        <p className="text-center text-gray-500 font-medium text-xs mb-8">
          สร้างบัญชีใหม่เพื่อรับสิทธิพิเศษ ส่วนลด 20% และการยืนยันตัวตนด้วย OTP
        </p>

        {/* Perk Callout */}
        <div className="bg-[#FAF7F2] border border-[#EAE3D9] p-3 rounded-xs flex items-center space-x-2 text-xs text-[#2B1810] mb-6">
          <Sparkles size={16} className="text-[#D97706] flex-shrink-0" />
          <span className="font-semibold">
            สมัครวันนี้รับทันทีโค้ด <strong className="text-[#D97706]">NIDA20</strong> ลด 20% ทุกออเดอร์
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="firstName"
                className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                ชื่อจริง (First Name) *
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="พรรณนิดา"
                className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#2B1810] focus:ring-1 focus:ring-[#2B1810]"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                นามสกุล (Last Name) *
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="วิศณุ"
                className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#2B1810] focus:ring-1 focus:ring-[#2B1810]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
              อีเมล (Email Address) *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="customer@example.com"
              className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#2B1810] focus:ring-1 focus:ring-[#2B1810]"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
              เบอร์โทรศัพท์ (Phone Number) *
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="081-234-5678"
              className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#2B1810] focus:ring-1 focus:ring-[#2B1810]"
            />
          </div>

          <div className="flex items-start space-x-2 pt-2">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              required
              className="mt-1 accent-[#2B1810]"
            />
            <label htmlFor="agreeTerms" className="text-xs text-gray-600 leading-snug">
              ฉันยอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัวของ Nida พร้อมรับสิทธิประโยชน์สมาชิก
            </label>
          </div>

          <div className="flex items-center space-x-2 text-xs text-gray-500 pt-2">
            <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
            <span>ระบบความปลอดภัย 2 ชั้น ยืนยันรหัสผ่าน OTP 6 หลัก</span>
          </div>

          <button
            type="submit"
            className="w-full bg-[#2B1810] hover:bg-[#D97706] text-white py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-colors shadow-md mt-4 flex items-center justify-center space-x-2"
          >
            <UserPlus size={16} />
            <span>สร้างบัญชี & รับรหัส OTP</span>
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            มีบัญชีอยู่แล้ว?{' '}
            <Link href="/login" className="font-bold text-[#2B1810] hover:text-[#D97706] underline">
              เข้าสู่ระบบ (Sign In)
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
