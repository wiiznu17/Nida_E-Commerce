'use client';

import React, { useState } from 'react';
import { Edit3, KeyRound, ShieldAlert, LogOut } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Alert } from '@/components/ui';
import type { User } from '@/context/AuthContext';
import type { ProfileFormData } from './profileTypes';
import { EmailChangeModal } from './EmailChangeModal';

interface ProfileInfoTabProps {
  user: User;
  formData: ProfileFormData;
  isEditing: boolean;
  onSetIsEditing: (val: boolean) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onLogoutAll?: () => void;
}

export function ProfileInfoTab({
  user,
  formData,
  isEditing,
  onSetIsEditing,
  onChange,
  onSubmit,
  onLogoutAll,
}: ProfileInfoTabProps) {
  const { language, t } = useLanguage();
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  return (
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
            type="button"
            onClick={() => onSetIsEditing(true)}
            className="flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-brand-amber hover:underline cursor-pointer"
          >
            <Edit3 size={14} />
            <span>{t('auth.editProfile')}</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={onSubmit} className="space-y-5 max-w-xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                {t('auth.firstName')}
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={onChange}
                required
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-brown"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                {t('auth.lastName')}
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={onChange}
                required
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-brown"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700">
                {t('auth.emailLabel')} -{' '}
                {language === 'th' ? 'ปลอดภัยด้วย OTP' : 'OTP Protected'}
              </label>
              <button
                type="button"
                onClick={() => setEmailModalOpen(true)}
                className="text-[10px] font-black uppercase tracking-wider text-brand-amber hover:underline cursor-pointer"
              >
                {t('auth.changeEmail')}
              </button>
            </div>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              {language === 'th'
                ? 'อีเมลผูกกับระบบ OTP เพื่อความปลอดภัยสูงสุด หากต้องการเปลี่ยนให้คลิกเปลี่ยนอีเมล'
                : 'Email linked to passwordless OTP system. Click change email to update.'}
            </p>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
            >
              {t('auth.phone')}
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={onChange}
              required
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-brown"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="bg-brand-brown hover:bg-brand-amber text-white px-6 py-2.5 text-xs font-black uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
            >
              {t('auth.saveChanges')}
            </button>
            <button
              type="button"
              onClick={() => onSetIsEditing(false)}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
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
                {user.firstName ?? '-'}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                {t('auth.lastName')}
              </p>
              <p className="text-sm font-bold text-brand-brown mt-0.5">
                {user.lastName ?? '-'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 bg-brand-warm-cream p-4 border border-brand-border">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                  {language === 'th' ? 'อีเมลยืนยันแล้ว' : 'Verified Email'}
                </p>
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(true)}
                  className="text-[10px] font-black uppercase tracking-wider text-brand-amber hover:underline cursor-pointer"
                >
                  {t('auth.changeEmail')}
                </button>
              </div>
              <p className="text-sm font-bold text-brand-brown mt-0.5 truncate">
                {user.email}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                {t('auth.phone')}
              </p>
              <p className="text-sm font-bold text-brand-brown mt-0.5">
                {user.phone ?? '-'}
              </p>
            </div>
          </div>

          <Alert variant="success">
            {language === 'th'
              ? 'บัญชีผ่านการตรวจสอบตัวตนด้วย OTP 2 ชั้น พร้อมใช้งานสมบูรณ์'
              : 'Account authenticated via 2-factor OTP verification.'}
          </Alert>

          {onLogoutAll && (
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-1">
                <ShieldAlert size={16} className="text-brand-brown" />
                <h3 className="text-xs font-black uppercase tracking-wider text-brand-brown">
                  {t('auth.sessionSecurity')}
                </h3>
              </div>
              <p className="text-[11px] text-gray-500 mb-3">
                {t('auth.sessionSecurityDesc')}
              </p>
              <button
                type="button"
                onClick={onLogoutAll}
                className="inline-flex items-center space-x-2 px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <LogOut size={13} />
                <span>{t('auth.signOutAllDevices')}</span>
              </button>
            </div>
          )}
        </div>
      )}

      <EmailChangeModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        currentEmail={user.email}
      />
    </div>
  );
}
