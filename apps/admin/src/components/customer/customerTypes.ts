import type {
  AccountStatus,
  MembershipTier,
  ApiAdminCustomerListItem,
} from '@repo/types';

export interface CustomerFilterState {
  search: string;
  status?: AccountStatus;
  tier?: MembershipTier;
}

export interface CustomerDrawerState {
  isOpen: boolean;
  customerId: string | null;
}

export interface CustomerStatusModalState {
  isOpen: boolean;
  customer: ApiAdminCustomerListItem | null;
  action: 'SUSPEND' | 'BAN' | 'REACTIVATE' | null;
}

