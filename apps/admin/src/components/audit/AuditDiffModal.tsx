import React, { useState } from 'react';
import {
  User,
  Shield,
  Globe,
  Clock,
  Layers,
  FileCode,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useLanguage } from '../../context/LanguageContext';
import { AuditActionBadge } from './AuditActionBadge';
import { TARGET_TABLE_KEYS } from './auditConstants';
import type { AuditDiffModalProps } from './auditTypes';

export const AuditDiffModal: React.FC<AuditDiffModalProps> = ({
  isOpen,
  log,
  onClose,
}) => {
  const { t } = useLanguage();
  const [onlyModified, setOnlyModified] = useState<boolean>(true);

  if (!log) {
    return null;
  }

  const oldValues = log.oldValuesJson ?? null;
  const newValues = log.newValuesJson ?? null;

  const allKeys = Array.from(
    new Set([
      ...Object.keys(oldValues ?? {}),
      ...Object.keys(newValues ?? {}),
    ]),
  );

  const modifiedKeys = allKeys.filter((key) => {
    const oldVal = oldValues ? oldValues[key] : undefined;
    const newVal = newValues ? newValues[key] : undefined;
    return JSON.stringify(oldVal) !== JSON.stringify(newVal);
  });

  const displayedKeys =
    onlyModified && modifiedKeys.length > 0 ? modifiedKeys : allKeys;

  const formattedDate = new Date(log.createdAt).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const tableKey = TARGET_TABLE_KEYS[log.targetTable] ?? log.targetTable;

  const renderValue = (val: unknown) => {
    if (val === undefined) {
      return <span className="text-stone-400 italic text-[11px]">—</span>;
    }
    if (val === null) {
      return (
        <span className="text-stone-400 font-mono text-[11px] italic">null</span>
      );
    }
    if (typeof val === 'boolean') {
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
            val
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
              : 'bg-stone-100 text-stone-600 border border-stone-200/80'
          }`}
        >
          {String(val)}
        </span>
      );
    }
    if (typeof val === 'number') {
      return (
        <span className="font-mono text-stone-900 font-semibold">{val}</span>
      );
    }
    if (typeof val === 'object') {
      return (
        <pre className="font-mono text-[11px] text-stone-700 bg-stone-50/80 p-2 rounded border border-stone-200/60 max-h-28 overflow-auto break-all whitespace-pre-wrap">
          {JSON.stringify(val, null, 2)}
        </pre>
      );
    }
    return (
      <span className="font-mono text-[11px] text-stone-800 break-all leading-relaxed">
        {String(val)}
      </span>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white border border-stone-200 shadow-2xl rounded-2xl">
        {/* Header Section with breathing room away from the Close button */}
        <DialogHeader className="p-6 pb-4 sm:px-8 border-b border-stone-200/80 bg-stone-50/40 shrink-0 pr-16">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AuditActionBadge actionType={log.actionType} />
              <DialogTitle className="text-base sm:text-lg text-stone-900 font-bold tracking-tight">
                {t('audit.diffModalTitle')}
              </DialogTitle>
            </div>
            <span className="font-mono text-[11px] text-stone-500 bg-stone-200/60 border border-stone-200 px-2.5 py-0.5 rounded-md">
              ID: {log.id}
            </span>
          </div>

          {/* Structured Metadata Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 rounded-xl bg-white border border-stone-200/80 shadow-2xs mt-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 text-stone-500">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                  {t('audit.colOperator')}
                </div>
                <div className="text-xs font-semibold text-stone-800 truncate">
                  {log.admin?.fullName ??
                    log.admin?.username ??
                    t('common.system')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 text-stone-500">
                <Shield className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                  {t('audit.colPermission')}
                </div>
                <div
                  className="text-xs font-mono font-medium text-brand-dark-brown truncate"
                  title={
                    log.permission
                      ? log.performedRole
                        ? `${log.permission} (${log.performedRole})`
                        : log.permission
                      : (log.performedRole ?? undefined)
                  }
                >
                  {log.permission
                    ? log.performedRole
                      ? `${log.permission} (${log.performedRole})`
                      : log.permission
                    : (log.performedRole ?? '-')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 text-stone-500">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                  {t(tableKey)}
                </div>
                <div
                  className="text-xs font-mono text-stone-700 truncate"
                  title={log.targetId}
                >
                  {log.targetId}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 text-stone-500">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                  {t('audit.colTimestamp')}
                </div>
                <div className="text-xs text-stone-700 whitespace-nowrap">
                  {formattedDate}
                </div>
              </div>
            </div>
          </div>

          {log.ipAddress && (
            <div className="mt-3 flex items-center gap-2 text-[11px] text-stone-500 px-1">
              <Globe className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>
                IP: <strong className="font-mono text-stone-700">{log.ipAddress}</strong>
              </span>
              {log.userAgent && <span className="text-stone-300">•</span>}
              {log.userAgent && (
                <span className="truncate text-stone-400 max-w-xl">
                  {log.userAgent}
                </span>
              )}
            </div>
          )}
        </DialogHeader>

        {/* Scrollable Content Body with Generous Padding */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 flex-1 bg-stone-50/20">
          {/* Side-by-Side Comparison Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Before (Old Values) */}
            <div className="rounded-xl border border-rose-200/80 bg-rose-50/20 shadow-2xs overflow-hidden">
              <div className="px-4 py-3 bg-rose-50/60 border-b border-rose-200/70 flex items-center justify-between">
                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-rose-800">
                  <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-200" />
                  {t('audit.beforeChanges')}
                </span>
                <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-md bg-white text-rose-700 border border-rose-200/80">
                  {oldValues ? `${Object.keys(oldValues).length} keys` : 'null'}
                </span>
              </div>

              <div className="p-4 bg-white">
                {oldValues ? (
                  <pre className="text-[12px] font-mono text-stone-700 overflow-x-auto p-4 bg-stone-50/80 rounded-lg border border-stone-200/70 leading-relaxed max-h-72 sm:max-h-80 select-all whitespace-pre">
                    {JSON.stringify(oldValues, null, 2)}
                  </pre>
                ) : (
                  <div className="py-12 px-4 text-center text-xs text-stone-400 italic">
                    {t('audit.noPreviousState')}
                  </div>
                )}
              </div>
            </div>

            {/* After (New Values) */}
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/20 shadow-2xs overflow-hidden">
              <div className="px-4 py-3 bg-emerald-50/60 border-b border-emerald-200/70 flex items-center justify-between">
                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                  {t('audit.afterChanges')}
                </span>
                <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-md bg-white text-emerald-700 border border-emerald-200/80">
                  {newValues ? `${Object.keys(newValues).length} keys` : 'null'}
                </span>
              </div>

              <div className="p-4 bg-white">
                {newValues ? (
                  <pre className="text-[12px] font-mono text-stone-700 overflow-x-auto p-4 bg-stone-50/80 rounded-lg border border-stone-200/70 leading-relaxed max-h-72 sm:max-h-80 select-all whitespace-pre">
                    {JSON.stringify(newValues, null, 2)}
                  </pre>
                ) : (
                  <div className="py-12 px-4 text-center text-xs text-stone-400 italic">
                    {t('audit.recordPurged')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Changes Breakdown Table */}
          {allKeys.length > 0 && (
            <div className="border border-stone-200 rounded-xl bg-white shadow-2xs overflow-hidden">
              <div className="px-5 py-3.5 bg-stone-50/80 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-stone-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    {t('audit.fieldsBreakdown')}
                  </span>
                  <span className="text-[11px] font-semibold text-stone-500 bg-stone-200/60 px-2 py-0.5 rounded-full">
                    {modifiedKeys.length} modified
                  </span>
                </div>

                {modifiedKeys.length > 0 && modifiedKeys.length < allKeys.length && (
                  <button
                    type="button"
                    onClick={() => setOnlyModified(!onlyModified)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Filter className="w-3.5 h-3.5 text-stone-400" />
                    <span>
                      {onlyModified
                        ? `${t('audit.showAllFields')} (${allKeys.length})`
                        : `${t('audit.showOnlyChanged')} (${modifiedKeys.length})`}
                    </span>
                  </button>
                )}
              </div>

              {/* Table Column Header */}
              <div className="grid grid-cols-12 px-5 py-2.5 bg-stone-100/60 border-b border-stone-200 text-[10px] uppercase font-bold tracking-wider text-stone-500">
                <div className="col-span-3">{t('audit.colField')}</div>
                <div className="col-span-4">{t('audit.colBefore')}</div>
                <div className="col-span-1 text-center" />
                <div className="col-span-4">{t('audit.colAfter')}</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto">
                {displayedKeys.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-400">
                    {t('audit.noChangesDetected')}
                  </div>
                ) : (
                  displayedKeys.map((key) => {
                    const oldVal = oldValues ? oldValues[key] : undefined;
                    const newVal = newValues ? newValues[key] : undefined;
                    const isModified =
                      JSON.stringify(oldVal) !== JSON.stringify(newVal);

                    return (
                      <div
                        key={key}
                        className={`grid grid-cols-12 px-5 py-3 text-xs items-center gap-3 transition-colors ${
                          isModified
                            ? 'bg-amber-50/40 hover:bg-amber-50/70 border-l-3 border-amber-500'
                            : 'bg-white hover:bg-stone-50/50'
                        }`}
                      >
                        <div className="col-span-3 min-w-0">
                          <span className="font-semibold text-stone-800 font-mono text-[11px] break-all">
                            {key}
                          </span>
                        </div>
                        <div className="col-span-4 min-w-0 pr-2">
                          <div className="text-rose-700">
                            {renderValue(oldVal)}
                          </div>
                        </div>
                        <div className="col-span-1 flex items-center justify-center">
                          <ArrowRight className="w-3.5 h-3.5 text-stone-300" />
                        </div>
                        <div className="col-span-4 min-w-0 pl-2">
                          <div className="text-emerald-700">
                            {renderValue(newVal)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
