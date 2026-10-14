import React from 'react';
import { Eye, Shield, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
  Button,
} from '../ui';
import { AuditActionBadge } from './AuditActionBadge';
import { TARGET_TABLE_KEYS } from './auditConstants';
import type { AuditTableProps } from './auditTypes';

export const AuditTable: React.FC<AuditTableProps> = ({
  logs,
  isLoading,
  onViewDiff,
}) => {
  const { t } = useLanguage();

  if (!isLoading && logs.length === 0) {
    return (
      <EmptyState
        title={t('audit.emptyTitle')}
        subtitle={t('audit.emptyDescription')}
      />
    );
  }

  return (
    <TableContainer className="bg-white rounded-xl border border-stone-200/80 shadow-xs overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-stone-50/70 border-b border-stone-200">
            <TableHead className="w-52 py-3.5 pl-4 text-xs font-bold text-stone-700 uppercase tracking-wider">
              {t('audit.colOperator')}
            </TableHead>
            <TableHead className="w-32 py-3.5 text-center text-xs font-bold text-stone-700 uppercase tracking-wider">
              {t('audit.colAction')}
            </TableHead>
            <TableHead className="w-44 py-3.5 text-xs font-bold text-stone-700 uppercase tracking-wider">
              {t('audit.colTarget')}
            </TableHead>
            <TableHead className="w-44 py-3.5 text-center text-xs font-bold text-stone-700 uppercase tracking-wider">
              {t('audit.colPermission')}
            </TableHead>
            <TableHead className="w-40 py-3.5 text-xs font-bold text-stone-700 uppercase tracking-wider">
              {t('audit.colTimestamp')}
            </TableHead>
            <TableHead className="w-32 py-3.5 text-center text-xs font-bold text-stone-700 uppercase tracking-wider">
              {t('audit.colIp')}
            </TableHead>
            <TableHead className="w-24 py-3.5 text-center text-xs font-bold text-stone-700 uppercase tracking-wider pr-4">
              {t('audit.colDetails')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => {
            const tableKey =
              TARGET_TABLE_KEYS[log.targetTable] ?? log.targetTable;
            const adminName =
              log.admin?.fullName ?? log.admin?.username ?? t('common.system');
            const adminInitial = adminName.charAt(0).toUpperCase();

            const dateStr = new Date(log.createdAt).toLocaleString(
              undefined,
              {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              },
            );

            return (
              <TableRow
                key={log.id}
                className="hover:bg-stone-50/60 transition-colors border-b border-stone-100"
              >
                {/* Operator Admin */}
                <TableCell className="w-52 py-3 pl-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-brand-dark-brown text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-2xs">
                      {adminInitial}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-stone-900 truncate">
                        {adminName}
                      </div>
                      <div className="text-[10px] text-stone-500 truncate font-mono">
                        {log.admin?.email ?? log.performedRole ?? '-'}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Action Badge */}
                <TableCell className="w-32 py-3 text-center">
                  <AuditActionBadge actionType={log.actionType} />
                </TableCell>

                {/* Target Entity */}
                <TableCell className="w-44 py-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-stone-900 truncate">
                      {t(tableKey)}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500 truncate max-w-[150px]">
                      {log.targetId}
                    </span>
                  </div>
                </TableCell>

                {/* Permission Context */}
                <TableCell className="w-44 py-3 text-center">
                  {log.permission ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-stone-100 text-stone-800 border border-stone-200">
                      <Shield className="w-2.5 h-2.5 text-stone-400" />
                      {log.permission}
                    </span>
                  ) : (
                    <span className="text-stone-300 text-xs">—</span>
                  )}
                </TableCell>

                {/* Timestamp */}
                <TableCell className="w-40 py-3 text-xs text-stone-600">
                  {dateStr}
                </TableCell>

                {/* IP Address */}
                <TableCell className="w-32 py-3 text-center">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-stone-500">
                    <Globe className="w-3 h-3 text-stone-300" />
                    {log.ipAddress ?? '—'}
                  </span>
                </TableCell>

                {/* View Diff Action */}
                <TableCell className="w-24 py-3 text-center pr-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDiff(log)}
                    className="h-7 px-2 text-stone-600 hover:text-brand-dark-brown hover:bg-stone-100 rounded"
                    title={t('audit.viewDiff')}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    <span className="text-[11px] font-medium">
                      {t('audit.viewDiffShort')}
                    </span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
