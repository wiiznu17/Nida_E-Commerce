import { useState } from 'react';
import {
  Boxes,
  Calendar,
  Download,
  FileSpreadsheet,
  Package,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { analyticsRequester } from '../../api/requester/analyticsRequester';
import { useLanguage } from '../../context/LanguageContext';
import { downloadBlob } from '../../utils/csvExport';
import { Button, DropdownSelect, type DropdownSelectOption } from '../ui';

export function AnalyticsExportCenter() {
  const { t } = useLanguage();

  const todayStr = new Date().toISOString().split('T')[0];
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 86400000)
    .toISOString()
    .split('T')[0];

  // Orders Form State
  const [orderStart, setOrderStart] = useState(thirtyDaysAgoStr);
  const [orderEnd, setOrderEnd] = useState(todayStr);
  const [orderStatus, setOrderStatus] = useState('ALL');
  const [isExportingOrders, setIsExportingOrders] = useState(false);

  // Products Form State
  const [productDept, setProductDept] = useState('ALL');
  const [isExportingProducts, setIsExportingProducts] = useState(false);

  // Inventory Form State
  const [inventoryStatus, setInventoryStatus] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');
  const [isExportingInventory, setIsExportingInventory] = useState(false);

  // Audit Logs Form State
  const [auditStart, setAuditStart] = useState(thirtyDaysAgoStr);
  const [auditEnd, setAuditEnd] = useState(todayStr);
  const [isExportingAudit, setIsExportingAudit] = useState(false);

  // Status Options
  const orderStatusOptions: DropdownSelectOption[] = [
    { value: 'ALL', label: t('analytics.export.allStatuses') },
    { value: 'PAID', label: 'PAID' },
    { value: 'PROCESSING', label: 'PROCESSING' },
    { value: 'SHIPPED', label: 'SHIPPED' },
    { value: 'DELIVERED', label: 'DELIVERED' },
    { value: 'COMPLETED', label: 'COMPLETED' },
    { value: 'CANCELLED', label: 'CANCELLED' },
  ];

  const deptOptions: DropdownSelectOption[] = [
    { value: 'ALL', label: t('analytics.export.allDepartments') },
    { value: 'WOMEN', label: "Women's Collection" },
    { value: 'MEN', label: "Men's Collection" },
    { value: 'BAGS', label: 'Bags & Accessories' },
    { value: 'SHOES', label: 'Footwear' },
    { value: 'KIDS', label: 'Kids & Teens' },
    { value: 'HOME', label: 'Living & Lifestyle' },
  ];

  const inventoryStatusOptions: DropdownSelectOption[] = [
    { value: 'all', label: t('analytics.export.invAll') },
    { value: 'low_stock', label: t('analytics.export.invLow') },
    { value: 'out_of_stock', label: t('analytics.export.invOut') },
  ];

  const handleExportOrders = async () => {
    try {
      setIsExportingOrders(true);
      const blob = await analyticsRequester.exportOrders({
        startDate: orderStart,
        endDate: orderEnd,
        status: orderStatus !== 'ALL' ? orderStatus : undefined,
      });
      downloadBlob(blob, `nida-orders-${orderStart}-to-${orderEnd}.csv`);
    } catch {
      alert(t('analytics.export.fail'));
    } finally {
      setIsExportingOrders(false);
    }
  };

  const handleExportProducts = async () => {
    try {
      setIsExportingProducts(true);
      const blob = await analyticsRequester.exportProducts({
        department: productDept !== 'ALL' ? productDept : undefined,
      });
      downloadBlob(blob, `nida-products-${productDept.toLowerCase()}.csv`);
    } catch {
      alert(t('analytics.export.fail'));
    } finally {
      setIsExportingProducts(false);
    }
  };

  const handleExportInventory = async () => {
    try {
      setIsExportingInventory(true);
      const blob = await analyticsRequester.exportInventory({
        status: inventoryStatus,
      });
      downloadBlob(blob, `nida-inventory-${inventoryStatus}.csv`);
    } catch {
      alert(t('analytics.export.fail'));
    } finally {
      setIsExportingInventory(false);
    }
  };

  const handleExportAuditLogs = async () => {
    try {
      setIsExportingAudit(true);
      const blob = await analyticsRequester.exportAuditLogs({
        startDate: auditStart,
        endDate: auditEnd,
      });
      downloadBlob(blob, `nida-audit-logs-${auditStart}-to-${auditEnd}.csv`);
    } catch {
      alert(t('analytics.export.fail'));
    } finally {
      setIsExportingAudit(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-brand-border rounded-xs p-4 shadow-2xs">
        <h3 className="tracking-wider text-[11px] font-black uppercase text-stone-700 flex items-center gap-2">
          <FileSpreadsheet size={15} className="text-brand-brown" />
          <span>{t('analytics.export.title')}</span>
        </h3>
      </div>

      {/* 2x2 Balanced Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Orders Export */}
        <div className="bg-white border border-brand-border rounded-xs p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-brand-brown">
                <Package size={14} />
              </div>
              <h4 className="font-semibold text-brand-brown text-sm">
                {t('analytics.export.ordersTitle')}
              </h4>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              {t('analytics.export.ordersDesc')}
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="tracking-wider text-[9px] font-black uppercase text-stone-400 block mb-1">
                    {t('analytics.export.startDate')}
                  </label>
                  <div className="flex items-center gap-1.5 border border-brand-border rounded-xs px-2.5 py-1.5 bg-stone-50/50">
                    <Calendar size={12} className="text-stone-400 shrink-0" />
                    <input
                      type="date"
                      value={orderStart}
                      onChange={(e) => setOrderStart(e.target.value)}
                      className="text-xs bg-transparent border-none outline-none w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="tracking-wider text-[9px] font-black uppercase text-stone-400 block mb-1">
                    {t('analytics.export.endDate')}
                  </label>
                  <div className="flex items-center gap-1.5 border border-brand-border rounded-xs px-2.5 py-1.5 bg-stone-50/50">
                    <Calendar size={12} className="text-stone-400 shrink-0" />
                    <input
                      type="date"
                      value={orderEnd}
                      onChange={(e) => setOrderEnd(e.target.value)}
                      className="text-xs bg-transparent border-none outline-none w-full"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="tracking-wider text-[9px] font-black uppercase text-stone-400 block mb-1">
                  {t('analytics.export.status')}
                </label>
                <DropdownSelect
                  value={orderStatus}
                  onChange={setOrderStatus}
                  options={orderStatusOptions}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end">
            <Button
              type="button"
              onClick={handleExportOrders}
              disabled={isExportingOrders}
              className="w-full sm:w-auto"
            >
              <Download size={13} className="mr-1.5" />
              {isExportingOrders
                ? t('analytics.export.downloading')
                : t('analytics.export.download')}
            </Button>
          </div>
        </div>

        {/* 2. Products Export */}
        <div className="bg-white border border-brand-border rounded-xs p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-brand-brown">
                <ShoppingBag size={14} />
              </div>
              <h4 className="font-semibold text-brand-brown text-sm">
                {t('analytics.export.productsTitle')}
              </h4>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              {t('analytics.export.productsDesc')}
            </p>

            <div className="space-y-3">
              <div>
                <label className="tracking-wider text-[9px] font-black uppercase text-stone-400 block mb-1">
                  {t('analytics.export.departmentFilter')}
                </label>
                <DropdownSelect
                  value={productDept}
                  onChange={setProductDept}
                  options={deptOptions}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end">
            <Button
              type="button"
              onClick={handleExportProducts}
              disabled={isExportingProducts}
              className="w-full sm:w-auto"
            >
              <Download size={13} className="mr-1.5" />
              {isExportingProducts
                ? t('analytics.export.downloading')
                : t('analytics.export.download')}
            </Button>
          </div>
        </div>

        {/* 3. Inventory Export */}
        <div className="bg-white border border-brand-border rounded-xs p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-brand-brown">
                <Boxes size={14} />
              </div>
              <h4 className="font-semibold text-brand-brown text-sm">
                {t('analytics.export.inventoryTitle')}
              </h4>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              {t('analytics.export.inventoryDesc')}
            </p>

            <div className="space-y-3">
              <div>
                <label className="tracking-wider text-[9px] font-black uppercase text-stone-400 block mb-1">
                  {t('analytics.export.inventoryStatus')}
                </label>
                <DropdownSelect
                  value={inventoryStatus}
                  onChange={(val) =>
                    setInventoryStatus(
                      val as 'all' | 'low_stock' | 'out_of_stock',
                    )
                  }
                  options={inventoryStatusOptions}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end">
            <Button
              type="button"
              onClick={handleExportInventory}
              disabled={isExportingInventory}
              className="w-full sm:w-auto"
            >
              <Download size={13} className="mr-1.5" />
              {isExportingInventory
                ? t('analytics.export.downloading')
                : t('analytics.export.download')}
            </Button>
          </div>
        </div>

        {/* 4. Audit Logs Export */}
        <div className="bg-white border border-brand-border rounded-xs p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-brand-brown">
                <ShieldCheck size={14} />
              </div>
              <h4 className="font-semibold text-brand-brown text-sm">
                {t('analytics.export.auditLogsTitle')}
              </h4>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              {t('analytics.export.auditLogsDesc')}
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="tracking-wider text-[9px] font-black uppercase text-stone-400 block mb-1">
                    {t('analytics.export.startDate')}
                  </label>
                  <div className="flex items-center gap-1.5 border border-brand-border rounded-xs px-2.5 py-1.5 bg-stone-50/50">
                    <Calendar size={12} className="text-stone-400 shrink-0" />
                    <input
                      type="date"
                      value={auditStart}
                      onChange={(e) => setAuditStart(e.target.value)}
                      className="text-xs bg-transparent border-none outline-none w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="tracking-wider text-[9px] font-black uppercase text-stone-400 block mb-1">
                    {t('analytics.export.endDate')}
                  </label>
                  <div className="flex items-center gap-1.5 border border-brand-border rounded-xs px-2.5 py-1.5 bg-stone-50/50">
                    <Calendar size={12} className="text-stone-400 shrink-0" />
                    <input
                      type="date"
                      value={auditEnd}
                      onChange={(e) => setAuditEnd(e.target.value)}
                      className="text-xs bg-transparent border-none outline-none w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end">
            <Button
              type="button"
              onClick={handleExportAuditLogs}
              disabled={isExportingAudit}
              className="w-full sm:w-auto"
            >
              <Download size={13} className="mr-1.5" />
              {isExportingAudit
                ? t('analytics.export.downloading')
                : t('analytics.export.download')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
