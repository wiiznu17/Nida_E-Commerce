import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, UserCheck, Clock, Ban, Award } from 'lucide-react';
import { AdminLayout } from '../components/layout';
import { StatCard, Pagination, ApiErrorModal } from '../components/ui';
import {
  CustomerFilterBar,
  CustomerTable,
  CustomerDetailDrawer,
  type CustomerFilterState,
} from '../components/customer';
import {
  AccountStatusActionModal,
  type AccountStatusAction,
} from '../components/common';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { customerRequester } from '../api/requester/customerRequester';
import type {
  ApiAdminCustomerListItem,
  ApiAdminCustomerStats,
  AccountStatus,
  MembershipTier,
} from '@repo/types';

export default function AdminCustomers() {
  const { t } = useLanguage();
  const toast = useToast();

  const [searchParams, setSearchParams] = useSearchParams();

  // Read search & filter params from URL
  const urlSearch = searchParams.get('search') ?? '';
  const urlStatus = (searchParams.get('status') as AccountStatus) || undefined;
  const urlTier = (searchParams.get('tier') as MembershipTier) || undefined;
  const currentPage = parseInt(searchParams.get('page') ?? '1', 10) || 1;
  const pageSize = parseInt(searchParams.get('limit') ?? '20', 10) || 20;

  // Local draft inputs for filter form (only applied when clicking Search button or submitting)
  const [draftFilters, setDraftFilters] = useState<CustomerFilterState>({
    search: urlSearch,
    status: urlStatus,
    tier: urlTier,
  });

  // Sync draft form state when URL searchParams change
  useEffect(() => {
    setDraftFilters({
      search: urlSearch,
      status: urlStatus,
      tier: urlTier,
    });
  }, [urlSearch, urlStatus, urlTier]);

  const [customers, setCustomers] = useState<ApiAdminCustomerListItem[]>([]);
  const [stats, setStats] = useState<ApiAdminCustomerStats>({
    total: 0,
    active: 0,
    suspended: 0,
    banned: 0,
    vipCount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Drawer state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Status Action Modal state
  const [statusActionTarget, setStatusActionTarget] =
    useState<ApiAdminCustomerListItem | null>(null);
  const [statusActionType, setStatusActionType] =
    useState<AccountStatusAction | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const data = await customerRequester.getCustomerStats();
      if (data) {
        setStats(data);
      }
    } catch {
      // Non-blocking for stats
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await customerRequester.getCustomers({
        page: currentPage,
        limit: pageSize,
        search: urlSearch || undefined,
        status: urlStatus,
        tier: urlTier,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      if (res?.items) {
        setCustomers(res.items);
        setTotalPages(res.totalPages ?? 1);
        setTotalItems(res.total ?? 0);
      }
    } catch (err: unknown) {
      setApiError(
        err instanceof Error ? err.message : 'Failed to load customers',
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, urlSearch, urlStatus, urlTier]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleFilterChange = (updated: Partial<CustomerFilterState>) => {
    setDraftFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const next = new URLSearchParams();
    if (draftFilters.search.trim()) {
      next.set('search', draftFilters.search.trim());
    }
    if (draftFilters.status) {
      next.set('status', draftFilters.status);
    }
    if (draftFilters.tier) {
      next.set('tier', draftFilters.tier);
    }
    if (pageSize !== 20) {
      next.set('limit', pageSize.toString());
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleFilterReset = () => {
    setDraftFilters({
      search: '',
      status: undefined,
      tier: undefined,
    });
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', newPage.toString());
    setSearchParams(next);
  };

  const handlePageSizeChange = (newSize: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('limit', newSize.toString());
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleOpenDetail = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setIsDrawerOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDrawerOpen(false);
    setSelectedCustomerId(null);
  };

  const handleOpenSuspend = (customer: ApiAdminCustomerListItem) => {
    setStatusActionTarget(customer);
    setStatusActionType('SUSPEND');
  };

  const handleOpenBan = (customer: ApiAdminCustomerListItem) => {
    setStatusActionTarget(customer);
    setStatusActionType('BAN');
  };

  const handleOpenReactivate = (customer: ApiAdminCustomerListItem) => {
    setStatusActionTarget(customer);
    setStatusActionType('REACTIVATE');
  };

  const handleConfirmStatusAction = async (payload: {
    status: AccountStatus;
    statusReason: string;
    durationMinutes?: number;
  }) => {
    if (!statusActionTarget) return;
    setIsUpdatingStatus(true);
    try {
      await customerRequester.updateCustomerStatus(
        statusActionTarget.id,
        payload,
      );

      const successMsg =
        payload.status === 'SUSPENDED'
          ? t('customers.modals.successSuspend')
          : payload.status === 'BANNED'
            ? t('customers.modals.successBan')
            : t('customers.modals.successReactivate');

      toast.success(successMsg);
      setStatusActionTarget(null);
      setStatusActionType(null);

      fetchCustomers();
      fetchStats();
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Status update failed');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <AdminLayout
      title={t('customers.title')}
      subtitle={t('customers.breadcrumb')}
    >
      <div className="space-y-5">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          <StatCard
            title={t('customers.stats.total')}
            value={(stats?.total ?? 0).toLocaleString()}
            icon={<Users className="w-4 h-4 text-stone-600" />}
          />
          <StatCard
            title={t('customers.stats.active')}
            value={(stats?.active ?? 0).toLocaleString()}
            valueClassName="text-emerald-700"
            icon={<UserCheck className="w-4 h-4 text-emerald-600" />}
          />
          <StatCard
            title={t('customers.stats.suspended')}
            value={(stats?.suspended ?? 0).toLocaleString()}
            valueClassName="text-amber-800"
            icon={<Clock className="w-4 h-4 text-amber-600" />}
          />
          <StatCard
            title={t('customers.stats.banned')}
            value={(stats?.banned ?? 0).toLocaleString()}
            valueClassName="text-rose-700"
            icon={<Ban className="w-4 h-4 text-rose-600" />}
          />
          <StatCard
            title={t('customers.stats.vip')}
            value={(stats?.vipCount ?? 0).toLocaleString()}
            valueClassName="text-purple-800"
            icon={<Award className="w-4 h-4 text-purple-600" />}
          />
        </div>

        {/* Filter Bar */}
        <CustomerFilterBar
          filters={draftFilters}
          onChange={handleFilterChange}
          onSubmit={handleSearchSubmit}
          onReset={handleFilterReset}
        />

        {/* Main Table */}
        <CustomerTable
          customers={customers}
          isLoading={isLoading}
          onViewDetail={handleOpenDetail}
          onSuspend={handleOpenSuspend}
          onBan={handleOpenBan}
          onReactivate={handleOpenReactivate}
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />

        {/* Customer Detail Slide-over Drawer */}
        <CustomerDetailDrawer
          isOpen={isDrawerOpen}
          customerId={selectedCustomerId}
          onClose={handleCloseDetail}
        />

        {/* Status Action Alert Modal */}
        <AccountStatusActionModal
          isOpen={Boolean(statusActionTarget && statusActionType)}
          onClose={() => {
            setStatusActionTarget(null);
            setStatusActionType(null);
          }}
          onConfirm={handleConfirmStatusAction}
          action={statusActionType}
          targetName={statusActionTarget?.fullName ?? ''}
          targetEmail={statusActionTarget?.email}
          isLoading={isUpdatingStatus}
        />

        {/* API Error Modal */}
        <ApiErrorModal
          isOpen={Boolean(apiError)}
          onClose={() => setApiError(null)}
          errorMessage={apiError ?? ''}
          onRetry={fetchCustomers}
        />
      </div>
    </AdminLayout>
  );
}
