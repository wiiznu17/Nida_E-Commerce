'use client';

import React from 'react';
import { Sparkles, Heart, Compass } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function AboutPage() {
  const { language, t } = useLanguage();

  return (
    <div className="w-full font-sans">
      {/* Hero Banner */}
      <div className="relative h-[55vh] md:h-[70vh] w-full bg-[#1E110A] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1544816155-12df9643f363?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt="Nida Brand Craftsmanship"
          className="absolute inset-0 w-full h-full object-cover opacity-45"
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          {/* Nida Flag Bar */}
          <div className="flex w-20 h-2.5 mx-auto mb-6 shadow-md">
            <div className="w-1/3 bg-[#2B1810]"></div>
            <div className="w-1/3 bg-white"></div>
            <div className="w-1/3 bg-[#F59E0B]"></div>
          </div>
          <span className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-[#F59E0B] block mb-3">
            {t('about.heroTag')}
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white">
            {t('about.heroTitle')}
          </h1>
          <p className="mt-4 text-sm sm:text-base text-gray-200 font-medium max-w-2xl mx-auto leading-relaxed">
            {t('about.heroSubtitle')}
          </p>
        </div>
      </div>

      {/* Brand Identity & Founder Story */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-block bg-[#FAF7F2] border border-[#EAE3D9] px-4 py-1.5 mb-6">
          <span className="text-xs font-black uppercase tracking-widest text-[#2B1810]">
            {t('about.aboutFounder')}
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-[#2B1810] uppercase tracking-tight mb-8">
          {t('about.founderHeading')}
        </h2>
        <div className="space-y-6 text-sm sm:text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
          <p>{t('about.founderP1')}</p>
          <p>{t('about.founderP2')}</p>
        </div>
      </div>

      {/* 3 Core Values */}
      <div className="bg-[#FAF7F2] border-y border-[#EAE3D9] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 border border-gray-200 text-center shadow-xs">
              <div className="w-12 h-12 bg-[#2B1810] text-[#F59E0B] rounded-full flex items-center justify-center mx-auto mb-4">
                <Compass size={24} />
              </div>
              <h3 className="text-base font-black uppercase tracking-wider text-[#2B1810] mb-2">
                {t('about.value1Title')}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {t('about.value1Desc')}
              </p>
            </div>

            <div className="bg-white p-8 border border-gray-200 text-center shadow-xs">
              <div className="w-12 h-12 bg-[#2B1810] text-[#F59E0B] rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles size={24} />
              </div>
              <h3 className="text-base font-black uppercase tracking-wider text-[#2B1810] mb-2">
                {t('about.value2Title')}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {t('about.value2Desc')}
              </p>
            </div>

            <div className="bg-white p-8 border border-gray-200 text-center shadow-xs">
              <div className="w-12 h-12 bg-[#2B1810] text-[#F59E0B] rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart size={24} />
              </div>
              <h3 className="text-base font-black uppercase tracking-wider text-[#2B1810] mb-2">
                {t('about.value3Title')}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {t('about.value3Desc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Feature Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden shadow-md">
            <img
              src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
              alt="Nida Collection"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-5">
            <div className="flex w-12 h-1.5">
              <div className="w-1/3 bg-[#2B1810]"></div>
              <div className="w-1/3 bg-gray-300"></div>
              <div className="w-1/3 bg-[#F59E0B]"></div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#2B1810]">
              {language === 'th' ? 'รังสรรค์เพื่อทุกช่วงเวลาของชีวิต' : 'CRAFTED FOR EVERY MOMENT'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {language === 'th'
                ? 'ทุกคอลเลกชันของ Nida ผ่านการคัดสรรเส้นใยธรรมชาติ วัสดุหนังแท้ และกระบวนการตัดเย็บที่ใส่ใจในทุกฝีเข็ม พร้อมให้คุณสัมผัสประสบการณ์การช้อปปิ้งที่เหนือระดับ พร้อมการรับประกันคุณภาพและการดูแลลูกค้าอย่างใกล้ชิด'
                : 'Every Nida collection is shaped by sustainably certified natural fibers, full-grain leather, and meticulous craftsmanship designed to accompany you through every chapter of life with timeless confidence.'}
            </p>
            <div className="pt-3">
              <Link
                href="/collections/all"
                className="bg-[#2B1810] hover:bg-[#D97706] text-white px-8 py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-colors inline-block shadow-md"
              >
                {language === 'th' ? 'สำรวจคอลเลกชันทั้งหมด' : 'EXPLORE ALL COLLECTIONS'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
