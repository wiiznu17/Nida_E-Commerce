import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Activity, Layers, Calendar } from 'lucide-react';
import type {
  ApiAuditLog,
  AuditLogStats,
  PaginatedResponse,
} from '@repo/types';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../api';
import { AdminLayout } from '../components/layout';
import { Pagination } from '../components/ui/pagination';
import {
  AuditFilterBar,
  AuditTable,
  AuditDiffModal,
  TARGET_TABLE_KEYS,
  type AuditFilterState,
} from '../components/audit';

const initialFilters: AuditFilterState = {
  targetTable: '',
  actionType: '',
  search: '',
};

export default function AdminAuditLogs() {
  const { t } = useLanguage();

  const [logs, setLogs] = useState<ApiAuditLog[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [filters, setFilters] = useState<AuditFilterState>(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLogForDiff, setSelectedLogForDiff] =
    useState<ApiAuditLog | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number | undefined> = {
        page: currentPage,
        limit: pageSize,
      };

      if (filters.targetTable) params.targetTable = filters.targetTable;
      if (filters.actionType) params.actionType = filters.actionType;
      if (filters.search.trim()) params.search = filters.search.trim();

      const response = await apiClient.get<PaginatedResponse<ApiAuditLog>>(
        '/admin/audit-logs',
        params,
      );

      if (response && Array.isArray(response.data)) {
        setLogs(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalCount(response.pagination.total);
        }
      }
    } catch {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiClient.get<AuditLogStats>(
        '/admin/audit-logs/stats',
      );
      if (res) {
        setStats(res);
      }
    } catch {
      // Non-critical metric failure
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleFilterChange = <K extends keyof AuditFilterState>(
    key: K,
    value: AuditFilterState[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
  };

  const topTableKey = stats?.topTargetTable
    ? TARGET_TABLE_KEYS[stats.topTargetTable] ?? stats.topTargetTable
    : '-';

  return (
    <AdminLayout
      title={t('audit.pageTitle')}
      subtitle={t('audit.pageSubtitle')}
    >
      <div className="space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
            <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-brand-dark-brown" />
              <span>{t('audit.statTotalLogs')}</span>
            </div>
            <div className="text-2xl font-serif font-bold text-stone-900">
              {stats?.totalLogs ?? totalCount}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
            <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>{t('audit.statTodayLogs')}</span>
            </div>
            <div className="text-2xl font-serif font-bold text-stone-900">
              {stats?.todayLogs ?? 0}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
            <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>{t('audit.statTopModule')}</span>
            </div>
            <div className="text-base font-medium text-stone-900 truncate">
              {t(topTableKey)}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
            <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <Activity className="w-4 h-4 text-amber-600" />
              <span>{t('audit.statTopAction')}</span>
            </div>
            <div className="text-base font-medium text-stone-900 truncate">
              {stats?.topActionType ?? '-'}
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <AuditFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          onRefresh={fetchLogs}
          isLoading={isLoading}
        />

        {/* Audit Log Table */}
        <AuditTable
          logs={logs}
          isLoading={isLoading}
          onViewDiff={(log) => setSelectedLogForDiff(log)}
        />

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCount}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          </div>
        )}

        {/* Diff Inspection Modal */}
        <AuditDiffModal
          isOpen={selectedLogForDiff !== null}
          log={selectedLogForDiff}
          onClose={() => setSelectedLogForDiff(null)}
        />
      </div>
    </AdminLayout>
  );
}
