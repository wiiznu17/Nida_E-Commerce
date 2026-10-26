import type { ApiAuditLog, AuditActionType } from '@repo/types';

export interface AuditFilterState {
  targetTable: string;
  actionType: AuditActionType | '';
  username: string;
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
  onSearch: (appliedFilters: AuditFilterState) => void;
  onReset: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}
