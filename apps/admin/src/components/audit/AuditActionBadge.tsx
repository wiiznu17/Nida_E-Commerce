import React from 'react';
import type { AuditActionType } from '@repo/types';
import { useLanguage } from '../../context/LanguageContext';
import { AUDIT_ACTION_CONFIG } from './auditConstants';

interface AuditActionBadgeProps {
  actionType: AuditActionType;
}

export const AuditActionBadge: React.FC<AuditActionBadgeProps> = ({
  actionType,
}) => {
  const { t } = useLanguage();
  const config = AUDIT_ACTION_CONFIG[actionType] ?? {
    labelKey: 'audit.actionUnknown',
    badgeClass: 'bg-stone-100 text-stone-700 border-stone-200',
    dotClass: 'bg-stone-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase border shadow-2xs ${config.badgeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      <span>{t(config.labelKey)}</span>
    </span>
  );
};
