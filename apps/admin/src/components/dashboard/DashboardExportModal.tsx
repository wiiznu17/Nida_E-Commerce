import { useState } from 'react';
import { X, Download, FileSpreadsheet, FileCode, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { analyticsRequester } from '../../api/requester/analyticsRequester';
import type {
  ExportDataType,
  ExportFileFormat,
  AnalyticsTimeframe,
} from '@repo/types';

interface DashboardExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardExportModal({
  isOpen,
  onClose,
}: DashboardExportModalProps) {
  const { t } = useLanguage();
  const [dataType, setDataType] = useState<ExportDataType>('orders');
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>('30d');
  const [format, setFormat] = useState<ExportFileFormat>('csv');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setDownloadError(null);

      const blob = await analyticsRequester.triggerExport({
        dataType,
        timeframe,
        format,
      });

      // Trigger browser download via object URL
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `nida_${dataType}_${timeframe}_${Date.now()}.${format}`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      onClose();
    } catch {
      setDownloadError(t('dashboard.export.downloadFailed'));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
      <div className="bg-white border border-brand-border w-full max-w-lg shadow-xl animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-brand-border bg-brand-cream/50">
          <div className="flex items-center space-x-2">
            <Download size={18} className="text-brand-amber" />
            <h3 className="text-sm font-black uppercase tracking-wider text-brand-brown">
              {t('dashboard.export.modalTitle')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-brand-brown transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          {/* 1. Data Type Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-gray-500 block">
              {t('dashboard.export.selectType')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'orders', label: t('dashboard.export.ordersData') },
                { id: 'inventory', label: t('dashboard.export.inventoryData') },
                { id: 'revenue', label: t('dashboard.export.revenueData') },
                { id: 'customers', label: t('dashboard.export.customersData') },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDataType(item.id as ExportDataType)}
                  className={`p-2.5 text-xs font-bold text-left border flex items-center justify-between cursor-pointer transition-colors ${
                    dataType === item.id
                      ? 'border-brand-brown bg-brand-cream text-brand-brown'
                      : 'border-brand-border text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.label}</span>
                  {dataType === item.id && (
                    <Check size={14} className="text-brand-brown" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Timeframe Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-gray-500 block">
              {t('dashboard.export.selectPeriod')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'today', label: t('dashboard.timeframe.today') },
                { id: '7d', label: t('dashboard.timeframe.week') },
                { id: '30d', label: t('dashboard.timeframe.month') },
                { id: 'year', label: t('dashboard.timeframe.year') },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTimeframe(item.id as AnalyticsTimeframe)}
                  className={`py-2 px-1 text-xs font-bold text-center border cursor-pointer transition-colors ${
                    timeframe === item.id
                      ? 'border-brand-brown bg-brand-brown text-white'
                      : 'border-brand-border text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. File Format Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-gray-500 block">
              {t('dashboard.export.selectFormat')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 border flex items-center space-x-3 cursor-pointer transition-colors ${
                  format === 'csv'
                    ? 'border-brand-brown bg-brand-cream/80'
                    : 'border-brand-border hover:bg-gray-50'
                }`}
              >
                <FileSpreadsheet size={20} className="text-emerald-700 shrink-0" />
                <div className="text-left min-w-0">
                  <span className="text-xs font-black text-brand-brown block">
                    CSV (Excel)
                  </span>
                  <span className="text-[10px] text-gray-400 block truncate">
                    UTF-8 BOM Thai Compatible
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`p-3 border flex items-center space-x-3 cursor-pointer transition-colors ${
                  format === 'json'
                    ? 'border-brand-brown bg-brand-cream/80'
                    : 'border-brand-border hover:bg-gray-50'
                }`}
              >
                <FileCode size={20} className="text-brand-amber shrink-0" />
                <div className="text-left min-w-0">
                  <span className="text-xs font-black text-brand-brown block">
                    JSON
                  </span>
                  <span className="text-[10px] text-gray-400 block truncate">
                    Structured Data Payload
                  </span>
                </div>
              </button>
            </div>
          </div>

          {downloadError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {downloadError}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-brand-border bg-gray-50 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2 sm:space-x-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDownloading}
            className="w-full sm:w-auto px-4 py-2 border border-brand-border text-xs font-bold text-gray-600 hover:text-brand-brown bg-white cursor-pointer text-center"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full sm:w-auto px-5 py-2 bg-brand-brown hover:bg-brand-amber text-white text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50 text-center"
          >
            <Download size={14} className="shrink-0" />
            <span>
              {isDownloading
                ? t('common.loading')
                : t('dashboard.export.downloadButton')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
