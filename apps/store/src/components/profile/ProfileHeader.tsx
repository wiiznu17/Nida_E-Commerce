import React from 'react';
import { LogOut } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { User } from '@/context/AuthContext';

interface ProfileHeaderProps {
  user: User;
  onLogout: () => void;
}

export function ProfileHeader({ user, onLogout }: ProfileHeaderProps) {
  const { language, t } = useLanguage();

  const userInitial = user.firstName ? user.firstName.charAt(0).toUpperCase() : 'N';

  return (
    <div className="bg-brand-warm-cream border border-brand-border p-6 sm:p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full bg-brand-brown text-brand-yellow flex items-center justify-center font-black text-2xl border-2 border-brand-yellow shadow-xs">
          {userInitial}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-black text-brand-brown uppercase tracking-tight">
              {user.firstName} {user.lastName}
            </h1>
            <span className="bg-brand-brown text-brand-yellow text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
              {user.tier}
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
          <span className="text-lg font-black text-brand-brown font-mono">
            {user.points} PTS
          </span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center text-xs font-black uppercase tracking-wider text-gray-700 hover:text-red-600 border border-gray-300 hover:border-red-600 px-4 py-2 bg-white transition-colors cursor-pointer"
        >
          <LogOut size={14} className="mr-1.5" /> {t('auth.logout')}
        </button>
      </div>
    </div>
  );
}
