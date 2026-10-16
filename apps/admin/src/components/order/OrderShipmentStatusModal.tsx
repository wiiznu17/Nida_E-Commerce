import React, { useState, useEffect } from 'react';
import { X, Send, Activity, MapPin, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { DropdownSelect } from '../ui';
import { orderRequester } from '../../api/requester/orderRequester';
import { ShipmentStatus, type ApiShipment } from '@repo/types';

export interface OrderShipmentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  shipmentId: string;
  trackingNumber: string;
  courierName?: string;
  currentShipmentStatus?: ShipmentStatus;
  onSuccess: (updatedShipment: ApiShipment) => void;
}

interface WebhookPreset {
  id: string;
  labelTh: string;
  labelEn: string;
  status: ShipmentStatus;
  titleTh: string;
  titleEn: string;
  descTh: string;
  descEn: string;
  locationTh: string;
  locationEn: string;
}

const PRESETS: WebhookPreset[] = [
  {
    id: 'picked_up',
    labelTh: 'เข้ารับพัสดุ (Picked Up)',
    labelEn: 'Picked Up by Courier',
    status: ShipmentStatus.PICKED_UP,
    titleTh: 'บริษัทขนส่งเข้ารับพัสดุเรียบร้อยแล้ว',
    titleEn: 'Parcel picked up by carrier',
    descTh: 'พัสดุถูกรับเข้าระบบขนส่งและเตรียมนำส่งไปยังศูนย์คัดแยก',
    descEn: 'Shipment received at origin sorting depot',
    locationTh: 'ศูนย์กระจายสินค้าต้นทาง กรุงเทพฯ',
    locationEn: 'Origin Hub Bangkok',
  },
  {
    id: 'in_transit_hub',
    labelTh: 'ถึงศูนย์คัดแยกหลัก (Sort Center)',
    labelEn: 'At Sorting Facility',
    status: ShipmentStatus.IN_TRANSIT,
    titleTh: 'พัสดุถึงศูนย์คัดแยกสินค้าหลัก (วังน้อย)',
    titleEn: 'Arrived at Central Sorting Center',
    descTh: 'พัสดุผ่านการคัดแยกเพื่อส่งต่อไปยังศูนย์ปลายทาง',
    descEn: 'Package sorted and routed for regional transfer',
    locationTh: 'ศูนย์คัดแยกสินค้าหลัก วังน้อย',
    locationEn: 'Central Sort Facility Wang Noi',
  },
  {
    id: 'out_for_delivery',
    labelTh: 'กำลังนำจ่าย (Out for Delivery)',
    labelEn: 'Out for Delivery',
    status: ShipmentStatus.OUT_FOR_DELIVERY,
    titleTh: 'พนักงานกำลังนำจ่ายพัสดุไปยังที่อยู่ปลายทาง',
    titleEn: 'Courier is delivering to your address',
    descTh: 'เจ้าหน้าที่ขนส่งอยู่ระหว่างการนำจ่ายพัสดุ',
    descEn: 'Courier driver en route to recipient address',
    locationTh: 'ศูนย์กระจายสินค้าปลายทาง (DC ลาดพร้าว)',
    locationEn: 'Local Delivery Hub Ladprao',
  },
  {
    id: 'delivered',
    labelTh: 'จัดส่งสำเร็จ (Delivered)',
    labelEn: 'Delivered Successfully',
    status: ShipmentStatus.DELIVERED,
    titleTh: 'พัสดุจัดส่งสำเร็จและผู้รับลงชื่อรับเรียบร้อย',
    titleEn: 'Package delivered and signed by recipient',
    descTh: 'จัดส่งพัสดุถึงผู้รับเรียบร้อยแล้ว (มีลายมือชื่อผู้รับ)',
    descEn: 'Shipment delivered to doorstep / concierge',
    locationTh: 'ที่อยู่ปลายทางของผู้รับ',
    locationEn: 'Destination Address',
  },
  {
    id: 'failed',
    labelTh: 'นำจ่ายไม่สำเร็จ (Delivery Failed)',
    labelEn: 'Failed Delivery Attempt',
    status: ShipmentStatus.FAILED,
    titleTh: 'ติดต่อผู้รับไม่ได้ / นำจ่ายใหม่อีกครั้งในวันถัดไป',
    titleEn: 'Recipient unreachable / Next attempt scheduled',
    descTh: 'พนักงานพยายามติดต่อแล้วแต่ไม่มีผู้รับสาย จะนำส่งใหม่ในวันถัดไป',
    descEn: 'Customer was not available; delivery re-attempt next business day',
    locationTh: 'ศูนย์กระจายสินค้าปลายทาง (DC ลาดพร้าว)',
    locationEn: 'Local Delivery Hub Ladprao',
  },
];

const STATUS_SELECT_OPTIONS = [
  { value: ShipmentStatus.PICKED_UP, label: 'PICKED_UP (เข้ารับแล้ว)' },
  { value: ShipmentStatus.IN_TRANSIT, label: 'IN_TRANSIT (อยู่ระหว่างขนส่ง)' },
  {
    value: ShipmentStatus.OUT_FOR_DELIVERY,
    label: 'OUT_FOR_DELIVERY (กำลังนำจ่าย)',
  },
  { value: ShipmentStatus.DELIVERED, label: 'DELIVERED (จัดส่งสำเร็จ)' },
  { value: ShipmentStatus.FAILED, label: 'FAILED (นำจ่ายไม่สำเร็จ)' },
];

export const OrderShipmentStatusModal: React.FC<
  OrderShipmentStatusModalProps
> = ({
  isOpen,
  onClose,
  orderNumber,
  shipmentId,
  trackingNumber,
  courierName,
  currentShipmentStatus,
  onSuccess,
}) => {
  const { t, language } = useLanguage();
  const [status, setStatus] = useState<ShipmentStatus>(
    currentShipmentStatus ?? ShipmentStatus.IN_TRANSIT,
  );
  const [statusTitle, setStatusTitle] = useState('');
  const [statusDescription, setStatusDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      // Auto-populate with next logical preset
      const defaultPreset =
        currentShipmentStatus === ShipmentStatus.LABEL_CREATED
          ? PRESETS[0]
          : currentShipmentStatus === ShipmentStatus.PICKED_UP
            ? PRESETS[1]
            : currentShipmentStatus === ShipmentStatus.IN_TRANSIT
              ? PRESETS[2]
              : PRESETS[3];

      if (defaultPreset) {
        setStatus(defaultPreset.status);
        setStatusTitle(
          language === 'th' ? defaultPreset.titleTh : defaultPreset.titleEn,
        );
        setStatusDescription(
          language === 'th' ? defaultPreset.descTh : defaultPreset.descEn,
        );
        setLocation(
          language === 'th'
            ? defaultPreset.locationTh
            : defaultPreset.locationEn,
        );
      }
    }
  }, [isOpen, currentShipmentStatus, language]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: WebhookPreset) => {
    setStatus(preset.status);
    setStatusTitle(language === 'th' ? preset.titleTh : preset.titleEn);
    setStatusDescription(language === 'th' ? preset.descTh : preset.descEn);
    setLocation(language === 'th' ? preset.locationTh : preset.locationEn);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipmentId || !statusTitle.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const updated = await orderRequester.updateShipmentStatus(shipmentId, {
        status,
        statusTitle: statusTitle.trim(),
        statusDescription: statusDescription.trim() || undefined,
        location: location.trim() || undefined,
      });

      onSuccess(updated);
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to simulate carrier webhook';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown/50 backdrop-blur-xs">
      <div className="bg-white border border-brand-border max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 mb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1 bg-amber-50 text-brand-amber rounded-xs">
                <Activity size={16} />
              </span>
              <h3 className="text-sm font-black uppercase text-brand-brown">
                {t('orders.shipmentWebhook.modalTitle')}
              </h3>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              {t('orders.shipmentWebhook.modalSubtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Order & Tracking Pill */}
        <div className="p-3 bg-brand-cream/60 border border-brand-border rounded-xs mb-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
              {t('orders.shipmentWebhook.orderPrefix')} {orderNumber}
            </span>
            <span className="font-mono font-bold text-brand-brown text-sm">
              {trackingNumber}
            </span>
            <span className="text-gray-500 ml-1.5">
              ({courierName || 'Carrier'})
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase text-gray-400 block">
              {t('orders.shipmentWebhook.currentStatus')}
            </span>
            <span className="inline-block px-2 py-0.5 text-[10px] font-black uppercase bg-white border border-gray-300 text-brand-brown rounded-xs">
              {currentShipmentStatus ?? 'IN_TRANSIT'}
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xs flex items-center space-x-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Quick Presets */}
        <div className="mb-4">
          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2">
            {t('orders.shipmentWebhook.presetLabel')}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => {
              const isSelected = status === p.status;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className={`text-[11px] font-bold px-2.5 py-1.5 border rounded-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-brand-brown text-white border-brand-brown shadow-2xs'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  {language === 'th' ? p.labelTh : p.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Status Select */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
              {t('orders.shipmentWebhook.selectStatus')}
            </label>
            <DropdownSelect
              value={status}
              onChange={(val) => setStatus(val as ShipmentStatus)}
              options={STATUS_SELECT_OPTIONS}
            />
          </div>

          {/* Status Title */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
              {t('orders.shipmentWebhook.statusTitle')}
            </label>
            <input
              type="text"
              required
              value={statusTitle}
              onChange={(e) => setStatusTitle(e.target.value)}
              placeholder={t('orders.shipmentWebhook.statusTitlePlaceholder')}
              className="w-full border border-gray-300 px-3 py-2 text-xs font-medium focus:outline-none focus:border-brand-brown rounded-xs"
            />
          </div>

          {/* Status Description */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
              {t('orders.shipmentWebhook.statusDesc')}
            </label>
            <textarea
              rows={2}
              value={statusDescription}
              onChange={(e) => setStatusDescription(e.target.value)}
              placeholder={t('orders.shipmentWebhook.statusDescPlaceholder')}
              className="w-full border border-gray-300 px-3 py-2 text-xs font-medium focus:outline-none focus:border-brand-brown rounded-xs"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
              {t('orders.shipmentWebhook.location')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('orders.shipmentWebhook.locationPlaceholder')}
                className="w-full border border-gray-300 pl-8 pr-3 py-2 text-xs font-medium focus:outline-none focus:border-brand-brown rounded-xs"
              />
              <MapPin
                size={13}
                className="absolute left-2.5 top-2.5 text-gray-400"
              />
            </div>
          </div>

          {status === ShipmentStatus.DELIVERED && (
            <div className="p-2.5 bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px] rounded-xs flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <span>{t('orders.shipmentWebhook.deliveredNotice')}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end space-x-2.5 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 font-bold text-gray-600 hover:bg-gray-100 rounded-xs cursor-pointer disabled:opacity-50"
            >
              {t('orders.shipmentWebhook.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !statusTitle.trim()}
              className="px-4 py-2 bg-brand-brown hover:bg-brand-dark-brown text-white font-bold uppercase tracking-wider shadow-xs flex items-center space-x-1.5 rounded-xs cursor-pointer disabled:opacity-50"
            >
              <Send size={13} />
              <span>
                {isSubmitting
                  ? t('orders.shipmentWebhook.submitting')
                  : t('orders.shipmentWebhook.submit')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
