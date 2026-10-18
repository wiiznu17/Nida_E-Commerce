import { useState, useEffect, useMemo, type FormEvent } from 'react';
import {
  Plus,
  Trash2,
  X,
  Copy,
  Check,
  Tag,
  Percent,
  Truck,
  DollarSign,
  RotateCcw,
  Search,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { AdminLayout } from '../components/layout';
import {
  DropdownSelect,
  SearchInput,
  TableContainer,
  Pagination,
  EmptyState,
  ApiErrorModal,
  InlineError,
} from '../components/ui';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import {
  promotionsApi,
  type CreateCouponPayload,
} from '../api/requester/promotionRequester';
import { PermissionGate } from '../components/common';
import { AdminPermission, type ApiCoupon, DiscountType } from '@repo/types';

type StatusTab = 'ALL' | 'ACTIVE' | 'EXPIRED' | 'INACTIVE';
type SortOption = 'newest' | 'oldest' | 'codeAsc' | 'codeDesc' | 'expiringSoon';

export default function AdminPromotions() {
  const { t, language } = useLanguage();

  const [couponsList, setCouponsList] = useState<ApiCoupon[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [statusTab, setStatusTab] = useState<StatusTab>('ALL');
  const [searchInput, setSearchInput] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [couponToDelete, setCouponToDelete] = useState<ApiCoupon | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const toast = useToast();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<{
    code: string;
    discountType: DiscountType;
    discountValue: number;
    minOrderAmount: number;
    maxDiscountAmount: string;
    totalUsageLimit: number;
    userUsageLimit: number;
    startsAt: string;
    expiresAt: string;
    isActive: boolean;
  }>({
    code: '',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 20,
    minOrderAmount: 100,
    maxDiscountAmount: '50',
    totalUsageLimit: 500,
    userUsageLimit: 1,
    startsAt: new Date().toISOString().split('T')[0] ?? '2026-01-01',
    expiresAt: '2026-12-31',
    isActive: true,
  });

  const loadCoupons = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      const data = await promotionsApi.getAll();
      if (Array.isArray(data)) {
        setCouponsList(data);
      } else {
        setCouponsList([]);
      }
    } catch (err: unknown) {
      console.warn('Backend coupons unavailable:', err);
      setCouponsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(t('promotions.messages.copySuccess'));
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSearchSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setAppliedSearch(searchInput.trim().toUpperCase());
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setAppliedSearch('');
    setStatusTab('ALL');
    setTypeFilter('ALL');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const handleToggle = async (coupon: ApiCoupon) => {
    const updatedState = !coupon.isActive;
    setCouponsList((prev) =>
      prev.map((c) =>
        c.id === coupon.id ? { ...c, isActive: updatedState } : c,
      ),
    );

    try {
      await promotionsApi.toggle(coupon.id);
      toast.success(
        t('promotions.messages.toggleSuccess').replace('{code}', coupon.code),
      );
    } catch {
      setCouponsList((prev) =>
        prev.map((c) =>
          c.id === coupon.id ? { ...c, isActive: coupon.isActive } : c,
        ),
      );
      toast.error(
        language === 'th'
          ? 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ'
          : 'Failed to update coupon status',
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!couponToDelete) return;

    try {
      setIsDeleting(true);
      await promotionsApi.delete(couponToDelete.id);
      setCouponsList((prev) => prev.filter((c) => c.id !== couponToDelete.id));
      toast.success(
        t('promotions.messages.deleteSuccess').replace(
          '{code}',
          couponToDelete.code,
        ),
      );
      setCouponToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete coupon';
      setApiError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const cleanCode = formData.code.toUpperCase().trim();
    if (!cleanCode) {
      setFieldErrors({
        code: language === 'th' ? 'กรุณาระบุรหัสคูปอง' : 'Coupon code is required',
      });
      return;
    }

    if (
      formData.discountType === DiscountType.PERCENTAGE &&
      (formData.discountValue <= 0 || formData.discountValue > 100)
    ) {
      setFieldErrors({
        discountValue:
          language === 'th'
            ? 'ส่วนลดแบบเปอร์เซ็นต์ต้องอยู่ระหว่าง 1 ถึง 100%'
            : 'Percentage discount must be between 1 and 100%',
      });
      return;
    }

    const payload: CreateCouponPayload = {
      code: cleanCode,
      discountType: formData.discountType,
      discountValue:
        formData.discountType === DiscountType.FREE_SHIPPING
          ? 0
          : Number(formData.discountValue),
      minOrderAmount: Number(formData.minOrderAmount) || 0,
      maxDiscountAmount:
        formData.discountType === DiscountType.PERCENTAGE &&
        formData.maxDiscountAmount
          ? Number(formData.maxDiscountAmount)
          : undefined,
      totalUsageLimit: Number(formData.totalUsageLimit) || 100,
      userUsageLimit: Number(formData.userUsageLimit) || 1,
      startsAt: formData.startsAt
        ? `${formData.startsAt}T00:00:00.000Z`
        : undefined,
      expiresAt: `${formData.expiresAt}T23:59:59.000Z`,
      isActive: formData.isActive,
    };

    try {
      setIsSubmitting(true);
      const created = await promotionsApi.create(payload);
      setCouponsList((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      toast.success(
        t('promotions.messages.createSuccess').replace('{code}', created.code),
      );
      setFormData({
        code: '',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
        minOrderAmount: 100,
        maxDiscountAmount: '50',
        totalUsageLimit: 500,
        userUsageLimit: 1,
        startsAt: new Date().toISOString().split('T')[0] ?? '2026-01-01',
        expiresAt: '2026-12-31',
        isActive: true,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to create promo code';
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const counts = useMemo(() => {
    const now = new Date();
    let all = 0;
    let active = 0;
    let expired = 0;
    let inactive = 0;

    for (const c of couponsList) {
      all += 1;
      const isExp = new Date(c.expiresAt) < now;
      if (isExp) {
        expired += 1;
      } else if (c.isActive) {
        active += 1;
      } else {
        inactive += 1;
      }
    }

    return { all, active, expired, inactive };
  }, [couponsList]);

  const filteredCoupons = useMemo(() => {
    const now = new Date();
    return couponsList
      .filter((coupon) => {
        const isExp = new Date(coupon.expiresAt) < now;
        if (statusTab === 'ACTIVE' && (!coupon.isActive || isExp)) return false;
        if (statusTab === 'EXPIRED' && !isExp) return false;
        if (statusTab === 'INACTIVE' && (coupon.isActive || isExp))
          return false;

        if (typeFilter !== 'ALL' && coupon.discountType !== typeFilter) {
          return false;
        }

        if (appliedSearch && !coupon.code.includes(appliedSearch)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return (
            new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
          );
        }
        if (sortBy === 'oldest') {
          return (
            new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
          );
        }
        if (sortBy === 'codeAsc') {
          return a.code.localeCompare(b.code);
        }
        if (sortBy === 'codeDesc') {
          return b.code.localeCompare(a.code);
        }
        if (sortBy === 'expiringSoon') {
          return (
            new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
          );
        }
        return 0;
      });
  }, [couponsList, statusTab, typeFilter, appliedSearch, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredCoupons.length / pageSize));
  const paginatedCoupons = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCoupons.slice(start, start + pageSize);
  }, [filteredCoupons, currentPage, pageSize]);

  const renderDiscountBadge = (coupon: ApiCoupon) => {
    switch (coupon.discountType) {
      case DiscountType.PERCENTAGE:
        return (
          <div className="flex items-center space-x-1.5 text-brand-brown">
            <span className="p-1 bg-amber-50 text-amber-800 rounded-xs">
              <Percent size={13} />
            </span>
            <span className="font-bold text-xs">
              {t('promotions.discountDisplay.percentOff').replace(
                '{val}',
                String(coupon.discountValue),
              )}
            </span>
          </div>
        );
      case DiscountType.FIXED_AMOUNT:
        return (
          <div className="flex items-center space-x-1.5 text-brand-brown">
            <span className="p-1 bg-emerald-50 text-emerald-800 rounded-xs">
              <DollarSign size={13} />
            </span>
            <span className="font-bold text-xs">
              {t('promotions.discountDisplay.fixedOff').replace(
                '{val}',
                String(coupon.discountValue),
              )}
            </span>
          </div>
        );
      case DiscountType.FREE_SHIPPING:
        return (
          <div className="flex items-center space-x-1.5 text-blue-900">
            <span className="p-1 bg-blue-50 text-blue-800 rounded-xs">
              <Truck size={13} />
            </span>
            <span className="font-bold text-xs">
              {t('promotions.discountDisplay.freeShip')}
            </span>
          </div>
        );
      default:
        return <span className="text-xs font-medium text-gray-700">-</span>;
    }
  };

  const getCouponRuntimeStatus = (coupon: ApiCoupon) => {
    const now = new Date();
    const isExpired = new Date(coupon.expiresAt) < now;
    const isUpcoming = new Date(coupon.startsAt) > now;

    if (isExpired) {
      return {
        label: t('promotions.status.expired'),
        pillClass: 'bg-amber-50 text-amber-900 border-amber-300',
        dotClass: 'bg-amber-500',
      };
    }
    if (isUpcoming) {
      return {
        label: t('promotions.status.notStarted'),
        pillClass: 'bg-blue-50 text-blue-900 border-blue-300',
        dotClass: 'bg-blue-500',
      };
    }
    if (!coupon.isActive) {
      return {
        label: t('promotions.status.inactive'),
        pillClass: 'bg-gray-100 text-gray-700 border-gray-300',
        dotClass: 'bg-gray-400',
      };
    }
    return {
      label: t('promotions.status.active'),
      pillClass: 'bg-emerald-50 text-emerald-900 border-emerald-300',
      dotClass: 'bg-emerald-500',
    };
  };

  return (
    <AdminLayout
      title={t('promotions.title')}
      subtitle={`${t('promotions.subtitle')} (${
        language === 'th'
          ? `แสดง ${filteredCoupons.length} จาก ${couponsList.length} โค้ด`
          : `${filteredCoupons.length} of ${couponsList.length} promo codes`
      })`}
      actionButton={
        <PermissionGate permission={AdminPermission.COUPONS_MANAGE}>
          <button
            onClick={() => {
              setFieldErrors({});
              setIsAddModalOpen(true);
            }}
            className="bg-brand-brown hover:bg-brand-amber text-white px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Plus size={15} />
            <span>{t('promotions.createBtn')}</span>
          </button>
        </PermissionGate>
      }
    >
      <div className="space-y-4">

        {/* Filter and Search Bar */}
        <div className="bg-white border border-brand-border p-4 space-y-3.5 shadow-2xs rounded-xs">
          {/* Top Row: Promo Status Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-cream">
            <div className="flex items-center space-x-1.5 p-1 bg-brand-cream border border-brand-border rounded-xs w-full sm:w-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  setStatusTab('ALL');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all cursor-pointer ${
                  statusTab === 'ALL'
                    ? 'bg-white text-brand-brown shadow-2xs font-black'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('promotions.tabs.all')}
                <span className="ml-1.5 text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.2 rounded-full font-mono">
                  {counts.all}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusTab('ACTIVE');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all cursor-pointer inline-flex items-center space-x-1.5 ${
                  statusTab === 'ACTIVE'
                    ? 'bg-white text-brand-brown shadow-2xs font-black'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{t('promotions.tabs.active')}</span>
                <span className="ml-1 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-mono">
                  {counts.active}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusTab('EXPIRED');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all cursor-pointer inline-flex items-center space-x-1.5 ${
                  statusTab === 'EXPIRED'
                    ? 'bg-white text-brand-brown shadow-2xs font-black'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>{t('promotions.tabs.expired')}</span>
                <span className="ml-1 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-mono">
                  {counts.expired}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusTab('INACTIVE');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all cursor-pointer inline-flex items-center space-x-1.5 ${
                  statusTab === 'INACTIVE'
                    ? 'bg-white text-brand-brown shadow-2xs font-black'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                <span>{t('promotions.tabs.inactive')}</span>
                <span className="ml-1 text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.2 rounded-full font-mono">
                  {counts.inactive}
                </span>
              </button>
            </div>
          </div>

          {/* Bottom Row: Search & Filters */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3"
          >
            <div className="flex-1">
              <SearchInput
                value={searchInput}
                onChange={setSearchInput}
                placeholder={t('promotions.searchPlaceholder')}
                className="w-full"
              />
            </div>

            <div className="w-full sm:w-56">
              <DropdownSelect
                value={typeFilter}
                onChange={(val) => {
                  setTypeFilter(val);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'ALL', label: t('promotions.typeFilter.all') },
                  {
                    value: DiscountType.PERCENTAGE,
                    label: t('promotions.typeFilter.percentage'),
                  },
                  {
                    value: DiscountType.FIXED_AMOUNT,
                    label: t('promotions.typeFilter.fixedAmount'),
                  },
                  {
                    value: DiscountType.FREE_SHIPPING,
                    label: t('promotions.typeFilter.freeShipping'),
                  },
                ]}
              />
            </div>

            <div className="w-full sm:w-52">
              <DropdownSelect
                value={sortBy}
                onChange={(val) => {
                  setSortBy(val as SortOption);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'newest', label: t('promotions.sort.newest') },
                  { value: 'oldest', label: t('promotions.sort.oldest') },
                  {
                    value: 'expiringSoon',
                    label: t('promotions.sort.expiringSoon'),
                  },
                  { value: 'codeAsc', label: t('promotions.sort.codeAsc') },
                  { value: 'codeDesc', label: t('promotions.sort.codeDesc') },
                ]}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 sm:flex-initial bg-brand-brown hover:bg-brand-amber text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center justify-center space-x-1.5 rounded-xs cursor-pointer"
              >
                <Search size={14} />
                <span>{t('promotions.searchBtn')}</span>
              </button>

              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 border border-brand-border text-gray-600 hover:text-brand-brown hover:border-brand-brown text-xs font-bold rounded-xs transition-colors cursor-pointer"
                title={t('promotions.resetBtn')}
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </form>
        </div>

        {/* Promotions Data Table */}
        <TableContainer>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-cream border-b border-brand-border text-[10px] font-black uppercase tracking-wider text-gray-500">
                <th className="py-3 px-4 w-48">{t('promotions.table.code')}</th>
                <th className="py-3 px-4 w-44">
                  {t('promotions.table.discount')}
                </th>
                <th className="py-3 px-4 w-48">
                  {t('promotions.table.conditions')}
                </th>
                <th className="py-3 px-4 w-52">
                  {t('promotions.table.quota')}
                </th>
                <th className="py-3 px-4 w-48">
                  {t('promotions.table.validity')}
                </th>
                <th className="py-3 px-4 w-36 text-center">
                  {t('promotions.table.status')}
                </th>
                <th className="py-3 px-4 w-20 text-center">
                  {t('promotions.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <div className="inline-flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-brand-brown border-t-transparent rounded-full animate-spin" />
                      <span className="font-medium text-xs">
                        {language === 'th'
                          ? 'กำลังโหลดข้อมูลคูปอง...'
                          : 'Loading promotions...'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : paginatedCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <EmptyState
                      icon={Tag}
                      title={t('promotions.messages.emptyTitle')}
                      subtitle={t('promotions.messages.emptySubtitle')}
                    />
                  </td>
                </tr>
              ) : (
                paginatedCoupons.map((coupon) => {
                  const usagePercent =
                    coupon.totalUsageLimit > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (coupon.currentUsageCount /
                              coupon.totalUsageLimit) *
                              100,
                          ),
                        )
                      : 0;

                  const statusInfo = getCouponRuntimeStatus(coupon);
                  const expiryFormatted = new Date(
                    coupon.expiresAt,
                  ).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });
                  const startFormatted = new Date(
                    coupon.startsAt,
                  ).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr
                      key={coupon.id}
                      className="hover:bg-brand-cream/30 transition-colors"
                    >
                      {/* Code with Copy Button */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-black text-sm text-brand-brown tracking-wider">
                            {coupon.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(coupon.code)}
                            className="p-1 text-gray-400 hover:text-brand-brown transition-colors cursor-pointer rounded-xs"
                            title="Copy code"
                          >
                            {copiedCode === coupon.code ? (
                              <Check size={14} className="text-emerald-600" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Discount Type & Value */}
                      <td className="py-3 px-4">
                        {renderDiscountBadge(coupon)}
                      </td>

                      {/* Conditions */}
                      <td className="py-3 px-4 text-gray-600">
                        <div className="space-y-0.5">
                          <div className="font-medium text-xs">
                            {coupon.minOrderAmount > 0
                              ? t(
                                  'promotions.discountDisplay.minOrder',
                                ).replace(
                                  '{min}',
                                  coupon.minOrderAmount.toLocaleString(),
                                )
                              : t('promotions.discountDisplay.noMin')}
                          </div>
                          {coupon.discountType === DiscountType.PERCENTAGE && (
                            <div className="text-[11px] text-gray-400">
                              {coupon.maxDiscountAmount
                                ? t(
                                    'promotions.discountDisplay.maxDiscount',
                                  ).replace(
                                    '{max}',
                                    coupon.maxDiscountAmount.toLocaleString(),
                                  )
                                : t('promotions.discountDisplay.noCap')}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Quota Progress */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-mono text-gray-500">
                            <span>
                              {coupon.currentUsageCount} /{' '}
                              {coupon.totalUsageLimit}
                            </span>
                            <span className="font-bold text-brand-brown">
                              {usagePercent}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-brand-amber h-full transition-all duration-300"
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {language === 'th'
                              ? `จำกัด ${coupon.userUsageLimit} ครั้ง/คน`
                              : `Max ${coupon.userUsageLimit} per user`}
                          </div>
                        </div>
                      </td>

                      {/* Validity Period */}
                      <td className="py-3 px-4 text-gray-600">
                        <div className="flex items-center space-x-1.5 text-xs font-medium">
                          <Calendar size={13} className="text-gray-400" />
                          <span>{expiryFormatted}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {language === 'th'
                            ? `เริ่ม: ${startFormatted}`
                            : `From: ${startFormatted}`}
                        </div>
                      </td>

                      {/* Status & Active Switch */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center justify-center space-y-1.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-bold tracking-wider uppercase border ${statusInfo.pillClass}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusInfo.dotClass}`}
                            />
                            {statusInfo.label}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggle(coupon)}
                            className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors cursor-pointer ${
                              coupon.isActive ? 'bg-emerald-600' : 'bg-gray-300'
                            }`}
                            title={
                              coupon.isActive
                                ? 'Click to deactivate'
                                : 'Click to activate'
                            }
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                coupon.isActive
                                  ? 'translate-x-4'
                                  : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setCouponToDelete(coupon)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
                          title="Delete coupon"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </TableContainer>

        {/* Attached Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredCoupons.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Create Coupon Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown/50 backdrop-blur-xs">
          <div className="bg-white border border-brand-border max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-brand-border">
              <div>
                <h3 className="text-base font-black uppercase tracking-wider text-brand-brown">
                  {t('promotions.modal.createTitle')}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t('promotions.modal.createSubtitle')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              {/* Promo Code Input */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  {t('promotions.modal.codeLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder={t('promotions.modal.codePlaceholder')}
                  className={`w-full border px-3 py-2 font-mono font-bold uppercase focus:outline-none rounded-xs ${
                    fieldErrors.code ? 'border-rose-400 focus:border-rose-600' : 'border-gray-300 focus:border-brand-brown'
                  }`}
                />
                <InlineError message={fieldErrors.code} />
              </div>

              {/* Discount Type and Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                    {t('promotions.modal.typeLabel')}
                  </label>
                  <DropdownSelect
                    value={formData.discountType}
                    onChange={(val) =>
                      setFormData({
                        ...formData,
                        discountType: val as DiscountType,
                      })
                    }
                    options={[
                      {
                        value: DiscountType.PERCENTAGE,
                        label: t('promotions.typeFilter.percentage'),
                      },
                      {
                        value: DiscountType.FIXED_AMOUNT,
                        label: t('promotions.typeFilter.fixedAmount'),
                      },
                      {
                        value: DiscountType.FREE_SHIPPING,
                        label: t('promotions.typeFilter.freeShipping'),
                      },
                    ]}
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                    {t('promotions.modal.valueLabel')}
                  </label>
                  <input
                    type="number"
                    required
                    min={
                      formData.discountType === DiscountType.FREE_SHIPPING
                        ? 0
                        : 1
                    }
                    max={
                      formData.discountType === DiscountType.PERCENTAGE
                        ? 100
                        : undefined
                    }
                    disabled={
                      formData.discountType === DiscountType.FREE_SHIPPING
                    }
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountValue: Number(e.target.value),
                      })
                    }
                    className={`w-full border px-3 py-2 font-mono font-bold focus:outline-none rounded-xs disabled:bg-gray-100 disabled:text-gray-400 ${
                      fieldErrors.discountValue ? 'border-rose-400' : 'border-gray-300 focus:border-brand-brown'
                    }`}
                  />
                  <InlineError message={fieldErrors.discountValue} />
                </div>
              </div>

              {/* Min Order & Max Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                    {t('promotions.modal.minOrderLabel')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minOrderAmount: Number(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 px-3 py-2 font-mono focus:outline-none focus:border-brand-brown rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                    {t('promotions.modal.maxDiscountLabel')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={formData.discountType !== DiscountType.PERCENTAGE}
                    value={formData.maxDiscountAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxDiscountAmount: e.target.value,
                      })
                    }
                    placeholder={
                      formData.discountType === DiscountType.PERCENTAGE
                        ? 'e.g. 100'
                        : '-'
                    }
                    className="w-full border border-gray-300 px-3 py-2 font-mono focus:outline-none focus:border-brand-brown rounded-xs disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>
              </div>

              {/* Quotas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                    {t('promotions.modal.totalLimitLabel')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.totalUsageLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalUsageLimit: Number(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 px-3 py-2 font-mono focus:outline-none focus:border-brand-brown rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                    {t('promotions.modal.userLimitLabel')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.userUsageLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        userUsageLimit: Number(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 px-3 py-2 font-mono focus:outline-none focus:border-brand-brown rounded-xs"
                  />
                </div>
              </div>

              {/* Validity Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                    {t('promotions.modal.startsAtLabel')}
                  </label>
                  <input
                    type="date"
                    value={formData.startsAt}
                    onChange={(e) =>
                      setFormData({ ...formData, startsAt: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-brand-brown rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                    {t('promotions.modal.expiresAtLabel')}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiresAt}
                    onChange={(e) =>
                      setFormData({ ...formData, expiresAt: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-brand-brown rounded-xs"
                  />
                </div>
              </div>

              {/* Is Active Switch */}
              <div className="flex items-center justify-between pt-2">
                <span className="font-bold text-gray-700">
                  {t('promotions.modal.isActiveLabel')}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, isActive: !formData.isActive })
                  }
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                    formData.isActive ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isActive ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-brand-border">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 font-bold text-gray-600 hover:bg-gray-100 rounded-xs transition-colors cursor-pointer"
                >
                  {t('promotions.modal.cancelBtn')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand-brown hover:bg-brand-amber text-white font-bold uppercase tracking-wider shadow-xs rounded-xs transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center space-x-1.5"
                >
                  {isSubmitting && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>
                    {isSubmitting
                      ? t('promotions.modal.submitting')
                      : t('promotions.modal.submitBtn')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {couponToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown/50 backdrop-blur-xs">
          <div className="bg-white border border-brand-border max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-start space-x-3 mb-4">
              <div className="p-2 bg-red-100 text-red-700 rounded-full shrink-0">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-brand-brown">
                  {t('promotions.deleteModal.title')}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {t('promotions.deleteModal.confirmMessage').replace(
                    '{code}',
                    couponToDelete.code,
                  )}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-brand-border">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setCouponToDelete(null)}
                className="px-4 py-2 border border-gray-300 font-bold text-gray-600 hover:bg-gray-100 rounded-xs cursor-pointer text-xs"
              >
                {t('promotions.modal.cancelBtn')}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider shadow-xs rounded-xs text-xs cursor-pointer inline-flex items-center space-x-1.5"
              >
                {isDeleting && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>
                  {isDeleting
                    ? t('promotions.deleteModal.deleting')
                    : t('promotions.deleteModal.confirmBtn')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Error Modal */}
      <ApiErrorModal
        isOpen={Boolean(apiError)}
        onClose={() => setApiError(null)}
        errorMessage={apiError ?? ''}
        onRetry={loadCoupons}
      />
    </AdminLayout>
  );
}
