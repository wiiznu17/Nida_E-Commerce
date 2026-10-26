import React from 'react';
import { User, Shield, Globe, Clock, Layers, FileCode } from 'lucide-react';
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

  if (!log) {
    return null;
  }

  const oldValues = log.oldValuesJson ?? null;
  const newValues = log.newValuesJson ?? null;

  const allKeys = Array.from(
    new Set([...Object.keys(oldValues ?? {}), ...Object.keys(newValues ?? {})]),
  );

  const formattedDate = new Date(log.createdAt).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const tableKey = TARGET_TABLE_KEYS[log.targetTable] ?? log.targetTable;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[88vh] overflow-y-auto p-6 bg-white border border-stone-200 shadow-xl rounded-xl">
        <DialogHeader className="border-b border-stone-100 pb-4 mb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AuditActionBadge actionType={log.actionType} />
              <DialogTitle className="text-lg text-stone-900 font-bold">
                {t('audit.diffModalTitle')}
              </DialogTitle>
            </div>
            <span className="text-xs text-stone-500 font-mono">
              ID: {log.id}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-stone-100 text-xs">
            <div className="flex items-center gap-1.5 text-stone-600">
              <User className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-medium text-stone-800 truncate">
                {log.admin?.fullName ??
                  log.admin?.username ??
                  t('common.system')}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-stone-600">
              <Shield className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-mono text-[11px] text-brand-dark-brown">
                {log.permission ?? log.performedRole ?? '-'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-stone-600">
              <Layers className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-medium text-stone-800">
                {t(tableKey)}:{' '}
                <span className="font-mono text-stone-600">{log.targetId}</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-stone-600">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-stone-700">{formattedDate}</span>
            </div>
          </div>

          {log.ipAddress && (
            <div className="mt-2 text-[11px] text-stone-500 flex items-center gap-2">
              <Globe className="w-3 h-3 text-stone-400" />
              <span>IP: {log.ipAddress}</span>
              {log.userAgent && (
                <span className="truncate max-w-md text-stone-400">
                  {log.userAgent}
                </span>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Before (Old Values) */}
            <div className="bg-stone-50/80 rounded-lg p-3.5 border border-stone-200">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-stone-200 text-xs font-semibold text-rose-800">
                <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {t('audit.beforeChanges')}
                </span>
                <span className="text-stone-400 font-mono text-[10px]">
                  {oldValues ? `${Object.keys(oldValues).length} keys` : 'null'}
                </span>
              </div>

              {oldValues ? (
                <pre className="text-xs font-mono text-stone-700 overflow-x-auto p-2 bg-white rounded border border-stone-200/60 leading-relaxed max-h-80">
                  {JSON.stringify(oldValues, null, 2)}
                </pre>
              ) : (
                <div className="p-6 text-center text-xs text-stone-400 italic">
                  {t('audit.noPreviousState')}
                </div>
              )}
            </div>

            {/* After (New Values) */}
            <div className="bg-stone-50/80 rounded-lg p-3.5 border border-stone-200">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-stone-200 text-xs font-semibold text-emerald-800">
                <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {t('audit.afterChanges')}
                </span>
                <span className="text-stone-400 font-mono text-[10px]">
                  {newValues ? `${Object.keys(newValues).length} keys` : 'null'}
                </span>
              </div>

              {newValues ? (
                <pre className="text-xs font-mono text-stone-700 overflow-x-auto p-2 bg-white rounded border border-stone-200/60 leading-relaxed max-h-80">
                  {JSON.stringify(newValues, null, 2)}
                </pre>
              ) : (
                <div className="p-6 text-center text-xs text-stone-400 italic">
                  {t('audit.recordPurged')}
                </div>
              )}
            </div>
          </div>

          {/* Key Changes Breakdown Table */}
          {allKeys.length > 0 && (
            <div className="mt-4 border border-stone-200 rounded-lg overflow-hidden">
              <div className="bg-stone-100/70 px-3 py-2 border-b border-stone-200 flex items-center gap-1.5 text-xs font-semibold text-stone-700">
                <FileCode className="w-3.5 h-3.5 text-stone-500" />
                <span>{t('audit.fieldsBreakdown')}</span>
              </div>
              <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto">
                {allKeys.map((key) => {
                  const oldVal = oldValues ? oldValues[key] : undefined;
                  const newVal = newValues ? newValues[key] : undefined;
                  const isModified =
                    JSON.stringify(oldVal) !== JSON.stringify(newVal);

                  return (
                    <div
                      key={key}
                      className={`grid grid-cols-12 px-3 py-2 text-xs font-mono items-center ${
                        isModified ? 'bg-amber-50/40' : 'bg-white'
                      }`}
                    >
                      <span className="col-span-3 text-stone-800 font-semibold truncate">
                        {key}
                      </span>
                      <span className="col-span-4 text-stone-600 truncate text-rose-700">
                        {oldVal !== undefined ? JSON.stringify(oldVal) : '—'}
                      </span>
                      <span className="col-span-1 text-center text-stone-400">
                        →
                      </span>
                      <span className="col-span-4 text-stone-900 truncate text-emerald-700 font-medium">
                        {newVal !== undefined ? JSON.stringify(newVal) : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
