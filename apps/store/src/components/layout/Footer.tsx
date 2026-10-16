'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { FooterNewsletter } from './FooterNewsletter';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-brand-brown text-white pt-16 pb-12 mt-20 border-t-4 border-brand-yellow font-sans">
      {/* Newsletter Signup Banner */}
      <FooterNewsletter t={t} />

      {/* Main 4-Column Footer Links */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Col 1: Brand & Heritage */}
        <div>
          <div className="mb-6">
            <span className="font-black text-2xl tracking-[0.2em] text-white uppercase block">
              NIDA
            </span>
            <div className="flex w-14 h-1.5 mt-1">
              <div className="w-1/3 bg-brand-brown"></div>
              <div className="w-1/3 bg-white"></div>
              <div className="w-1/3 bg-brand-yellow"></div>
            </div>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed mb-6 font-normal">
            {t('footer.brandStory')}
          </p>
          <div className="flex items-center space-x-4 text-xs text-gray-300">
            <span className="flex items-center">
              <Truck size={14} className="mr-1 text-brand-yellow" />{' '}
              {t('footer.fastDelivery')}
            </span>
            <span className="flex items-center">
              <ShieldCheck size={14} className="mr-1 text-brand-yellow" />{' '}
              {t('footer.securePay')}
            </span>
          </div>
        </div>

        {/* Col 2: Customer Assistance */}
        <div>
          <h4 className="text-xs font-black tracking-[0.2em] uppercase text-white mb-5 border-b border-white/10 pb-2">
            {t('footer.customerAssistance')}
          </h4>
          <ul className="space-y-3 text-xs text-gray-300 font-medium">
            <li>
              <Link
                href="/track-order"
                className="hover:text-white transition-colors"
              >
                {t('footer.trackOrder')}
              </Link>
            </li>
            <li>
              <Link
                href="/checkout"
                className="hover:text-white transition-colors"
              >
                {t('footer.shippingPolicy')}
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="hover:text-white transition-colors"
              >
                {t('footer.returnsExchange')}
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="hover:text-white transition-colors"
              >
                {t('footer.sizeGuide')}
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="hover:text-white transition-colors"
              >
                {t('footer.contactSupport')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Explore Collections */}
        <div>
          <h4 className="text-xs font-black tracking-[0.2em] uppercase text-white mb-5 border-b border-white/10 pb-2">
            {t('footer.exploreCollections')}
          </h4>
          <ul className="space-y-3 text-xs text-gray-300 font-medium">
            <li>
              <Link
                href="/collections/women"
                className="hover:text-white transition-colors"
              >
                {t('nav.women')}
              </Link>
            </li>
            <li>
              <Link
                href="/collections/men"
                className="hover:text-white transition-colors"
              >
                {t('nav.men')}
              </Link>
            </li>
            <li>
              <Link
                href="/collections/kids"
                className="hover:text-white transition-colors"
              >
                {t('nav.kids')}
              </Link>
            </li>
            <li>
              <Link
                href="/collections/bags"
                className="hover:text-white transition-colors"
              >
                {t('nav.bags')}
              </Link>
            </li>
            <li>
              <Link
                href="/collections/shoes"
                className="hover:text-white transition-colors"
              >
                {t('nav.shoes')}
              </Link>
            </li>
            <li>
              <Link
                href="/collections/sale"
                className="text-brand-yellow font-bold hover:underline"
              >
                {t('nav.sale')} (50% OFF)
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Corporate & Club */}
        <div>
          <h4 className="text-xs font-black tracking-[0.2em] uppercase text-white mb-5 border-b border-white/10 pb-2">
            {t('footer.nidaClub')}
          </h4>
          <ul className="space-y-3 text-xs text-gray-300 font-medium">
            <li>
              <Link
                href="/about"
                className="hover:text-white transition-colors"
              >
                {t('footer.brandPhilosophy')}
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="hover:text-white transition-colors"
              >
                {t('footer.sustainability')}
              </Link>
            </li>
            <li>
              <Link
                href="/profile"
                className="hover:text-white transition-colors"
              >
                {t('footer.rewardsProgram')}
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="hover:text-white transition-colors"
              >
                {t('footer.storeLocations')}
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="hover:text-white transition-colors"
              >
                {t('footer.careers')}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Legal */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
        <p>{t('footer.copyright')}</p>
        <div className="flex items-center space-x-6 text-[11px]">
          <span className="hover:text-white cursor-pointer">
            {t('footer.privacy')}
          </span>
          <span>•</span>
          <span className="hover:text-white cursor-pointer">
            {t('footer.terms')}
          </span>
          <span>•</span>
          <span className="hover:text-white cursor-pointer">
            {t('footer.accessibility')}
          </span>
        </div>
      </div>
    </footer>
  );
}
