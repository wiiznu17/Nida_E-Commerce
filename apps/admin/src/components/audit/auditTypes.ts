import type { ApiAuditLog, AuditActionType } from '@repo/types';

export interface AuditFilterState {
  targetTable: string;
  actionType: AuditActionType | '';
  search: string;
}

export interface AuditTableProps {
  logs: ApiAuditLog[];
  isLoading: boolean;
  onViewDiff: (log: ApiAuditLog) => void;
}

export interface AuditDiffModalProps {
  isOpen: boolean;
  log: ApiAuditLog | null;
  onClose: () => void;
}

export interface AuditFilterBarProps {
  filters: AuditFilterState;
  onFilterChange: <K extends keyof AuditFilterState>(
    key: K,
    value: AuditFilterState[K],
  ) => void;
  onReset: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}
