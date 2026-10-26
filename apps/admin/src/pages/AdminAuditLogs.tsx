import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, Activity, Layers, Calendar } from 'lucide-react';
import type {
  ApiAuditLog,
  AuditActionType,
  AuditLogStats,
  PaginatedResponse,
} from '@repo/types';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../api';
import { AdminLayout } from '../components/layout';
import { Pagination, StatCard } from '../components/ui';
import {
  AuditFilterBar,
  AuditTable,
  AuditDiffModal,
  TARGET_TABLE_KEYS,
  type AuditFilterState,
} from '../components/audit';

export default function AdminAuditLogs() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlUsername = searchParams.get('username') ?? '';
  const urlTargetTable = searchParams.get('targetTable') ?? '';
  const urlActionType = (searchParams.get('actionType') as AuditActionType | '') ?? '';
  const currentPage = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const pageSize = Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10) || 20);

  const activeFilters: AuditFilterState = useMemo(
    () => ({
      username: urlUsername,
      targetTable: urlTargetTable,
      actionType: urlActionType,
    }),
    [urlUsername, urlTargetTable, urlActionType],
  );

  const [logs, setLogs] = useState<ApiAuditLog[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
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

      if (urlTargetTable) params.targetTable = urlTargetTable;
      if (urlActionType) params.actionType = urlActionType;
      if (urlUsername.trim()) params.username = urlUsername.trim();

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
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, urlTargetTable, urlActionType, urlUsername]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiClient.get<AuditLogStats>('/admin/audit-logs/stats');
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

  const handleApplyFilters = (newFilters: AuditFilterState) => {
    const next = new URLSearchParams();
    if (newFilters.username.trim()) next.set('username', newFilters.username.trim());
    if (newFilters.targetTable) next.set('targetTable', newFilters.targetTable);
    if (newFilters.actionType) next.set('actionType', newFilters.actionType);
    next.set('page', '1');
    if (pageSize !== 20) next.set('limit', String(pageSize));
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    const next = new URLSearchParams();
    next.set('page', '1');
    if (pageSize !== 20) next.set('limit', String(pageSize));
    setSearchParams(next);
  };

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  };

  const handlePageSizeChange = (newSize: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('limit', String(newSize));
    next.set('page', '1');
    setSearchParams(next);
  };

  const topTableKey = stats?.topTargetTable
    ? (TARGET_TABLE_KEYS[stats.topTargetTable] ?? stats.topTargetTable)
    : '-';

  return (
    <AdminLayout
      title={t('audit.pageTitle')}
      subtitle={t('audit.pageSubtitle')}
    >
      <div className="space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title={t('audit.statTotalLogs')}
            value={stats?.totalLogs ?? totalCount}
            icon={<ShieldCheck className="w-4 h-4 text-brand-dark-brown" />}
            valueClassName="text-stone-900"
          />

          <StatCard
            title={t('audit.statTodayLogs')}
            value={stats?.todayLogs ?? 0}
            icon={<Calendar className="w-4 h-4 text-emerald-600" />}
            valueClassName="text-stone-900"
          />

          <StatCard
            title={t('audit.statTopModule')}
            value={t(topTableKey)}
            icon={<Layers className="w-4 h-4 text-blue-600" />}
            valueClassName="text-base font-sans font-medium text-stone-900"
          />

          <StatCard
            title={t('audit.statTopAction')}
            value={stats?.topActionType ?? '-'}
            icon={<Activity className="w-4 h-4 text-amber-600" />}
            valueClassName="text-base font-sans font-medium text-stone-900"
          />
        </div>

        {/* Filter Controls */}
        <AuditFilterBar
          filters={activeFilters}
          onSearch={handleApplyFilters}
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
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
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
