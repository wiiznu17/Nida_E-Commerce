'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Package, Truck, MapPin, CheckCircle2, Phone, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function OrderTrackingPage() {
  const params = useParams();
  const orderIdParam = params?.orderId;
  const orderId = Array.isArray(orderIdParam) ? orderIdParam[0] : orderIdParam;
  const { language, t } = useLanguage();

  const [currentStep] = useState(2); // 0: placed, 1: processed, 2: shipped, 3: delivered

  const steps = [
    {
      title: t('trackOrder.stepPlaced'),
      date: language === 'th' ? '24 ต.ค. 09:30 น.' : 'Oct 24, 09:30 AM',
      icon: Package,
    },
    {
      title: t('trackOrder.stepProcessing'),
      date: language === 'th' ? '25 ต.ค. 14:15 น.' : 'Oct 25, 02:15 PM',
      icon: CheckCircle2,
    },
    {
      title: t('trackOrder.stepShipped'),
      date: language === 'th' ? '26 ต.ค. 08:45 น.' : 'Oct 26, 08:45 AM',
      icon: Truck,
    },
    {
      title: t('trackOrder.stepDelivered'),
      date: language === 'th' ? 'ประมาณการ: 28 ต.ค.' : 'Est: Oct 28',
      icon: MapPin,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          href="/profile"
          className="inline-flex items-center text-xs font-black uppercase tracking-wider text-gray-500 hover:text-[#2B1810]"
        >
          <ArrowLeft size={14} className="mr-1.5" /> {t('trackOrder.backToProfile')}
        </Link>
      </div>

      {/* Header */}
      <div className="bg-[#FAF7F2] border border-[#EAE3D9] p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-[#D97706] block mb-1">
              {t('trackOrder.liveStatus')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#2B1810] uppercase tracking-tight">
              {t('trackOrder.order')} #{orderId || 'NIDA-918274'}
            </h1>
            <p className="text-xs text-gray-600 mt-1">
              {t('trackOrder.courier')}{' '}
              <strong>{language === 'th' ? 'เคอรี่ เอ็กซ์เพรส' : 'Kerry Express Standard'}</strong> •{' '}
              {t('trackOrder.trackingNumber')} <strong>KER-982147392TH</strong>
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="inline-block bg-[#2B1810] text-[#F59E0B] text-xs font-black px-3 py-1 uppercase tracking-wider">
              {t('trackOrder.inTransit')}
            </span>
            <p className="text-xs text-gray-500 mt-1">
              {t('trackOrder.estimatedArrival')} {language === 'th' ? '28 ต.ค. 2026' : 'Oct 28, 2026'}
            </p>
          </div>
        </div>
      </div>

      {/* Tracking Stepper */}
      <div className="border border-gray-200 bg-white p-6 sm:p-10 mb-8 shadow-xs">
        <h2 className="text-sm font-black uppercase tracking-wider text-[#2B1810] mb-8 pb-3 border-b border-gray-200">
          {t('trackOrder.milestones')}
        </h2>

        <div className="relative">
          {/* Desktop Progress Bar Line */}
          <div className="absolute top-6 left-8 right-8 h-1 bg-gray-200 hidden sm:block -z-0">
            <div
              className="h-full bg-[#2B1810] transition-all duration-700"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStep;
              const isCurrent = index === currentStep;

              return (
                <div key={index} className="flex sm:flex-col items-center sm:text-center group">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors mr-4 sm:mr-0 sm:mb-3 shadow-xs
                    ${isCompleted ? 'bg-[#2B1810] text-[#F59E0B] border-2 border-[#2B1810]' : 'bg-gray-100 text-gray-400 border border-gray-300'}
                    ${isCurrent ? 'ring-4 ring-[#FDE68A]' : ''}
                  `}
                  >
                    <Icon size={20} strokeWidth={2} />
                  </div>

                  <div className="flex flex-col sm:items-center">
                    <p
                      className={`text-xs font-black uppercase tracking-wider ${isCompleted ? 'text-[#2B1810]' : 'text-gray-400'}`}
                    >
                      {step.title}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{step.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step details logs */}
        <div className="mt-10 pt-6 border-t border-gray-200 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-600 mb-2">
            {language === 'th' ? 'บันทึกการเดินทางของพัสดุ' : 'Checkpoint Logs'}
          </h3>
          <div className="text-xs space-y-2 text-gray-600">
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="font-semibold text-[#2B1810]">
                {language === 'th' ? 'ศูนย์กระจายสินค้าวังน้อย' : 'Wang Noi Distribution Hub'}
              </span>
              <span className="text-gray-400">
                {language === 'th'
                  ? '26 ต.ค. 08:45 น. - พัสดุอยู่ระหว่างนำส่งไปยังศูนย์ปลายทาง'
                  : 'Oct 26, 08:45 AM - Package in transit to local sorting facility'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="font-semibold text-[#2B1810]">
                {language === 'th' ? 'คลังสินค้า Nida (กรุงเทพฯ)' : 'Nida Fulfillment Center (Bangkok)'}
              </span>
              <span className="text-gray-400">
                {language === 'th'
                  ? '25 ต.ค. 14:15 น. - บรรจุกล่องและติดใบตราส่งเรียบร้อย'
                  : 'Oct 25, 02:15 PM - Packaged and manifest created'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="font-semibold text-[#2B1810]">
                {language === 'th' ? 'ระบบรับคำสั่งซื้อ' : 'Order Placed & Confirmed'}
              </span>
              <span className="text-gray-400">
                {language === 'th' ? '24 ต.ค. 09:30 น. - ชำระเงินสำเร็จ' : 'Oct 24, 09:30 AM - Payment verified'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Package Items & Delivery Address Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="border border-gray-200 bg-white p-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1810] mb-4 pb-2 border-b border-gray-200">
            {language === 'th' ? 'ที่อยู่จัดส่งสินค้า' : 'Destination Address'}
          </h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p className="font-bold text-[#2B1810] text-sm">
              {language === 'th' ? 'คุณพรรณนิดา วิศณุ' : 'Phannida Wissanu'}
            </p>
            <p>108 Sukhumvit Soi 24, Klongtoey</p>
            <p>{language === 'th' ? 'กรุงเทพมหานคร 10110' : 'Bangkok 10110, Thailand'}</p>
            <p>{language === 'th' ? 'โทรศัพท์: 081-892-3456' : 'Tel: +66 81-892-3456'}</p>
          </div>
        </div>

        <div className="border border-gray-200 bg-white p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1810] mb-4 pb-2 border-b border-gray-200">
              {language === 'th' ? 'ฝ่ายบริการช่วยเหลือลูกค้า' : 'Nida Support Desk'}
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              {language === 'th'
                ? 'หากต้องการเปลี่ยนแปลงเวลาจัดส่ง หรือสอบถามข้อมูลเพิ่มเติมเกี่ยวกับพัสดุนี้'
                : 'Need to schedule delivery timing or have questions regarding this shipment?'}
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="tel:021234567"
              className="flex-1 bg-[#2B1810] hover:bg-[#D97706] text-white py-2.5 text-center text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center justify-center space-x-1"
            >
              <Phone size={14} />
              <span>{language === 'th' ? 'ติดต่อฝ่ายบริการลูกค้า' : 'Contact Support'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
