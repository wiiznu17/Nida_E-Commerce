import { AccountStatus, MembershipTier } from '@repo/types';

export const MEMBERSHIP_TIER_STYLES: Record<
  MembershipTier,
  { label: string; bg: string; text: string; border: string }
> = {
  [MembershipTier.REGULAR]: {
    label: 'Regular',
    bg: 'bg-stone-100',
    text: 'text-stone-700',
    border: 'border-stone-200',
  },
  [MembershipTier.SILVER]: {
    label: 'Silver',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
  },
  [MembershipTier.VIP_GOLD]: {
    label: 'VIP Gold',
    bg: 'bg-amber-100',
    text: 'text-amber-900',
    border: 'border-amber-300',
  },
  [MembershipTier.PLATINUM]: {
    label: 'Platinum',
    bg: 'bg-purple-100',
    text: 'text-purple-900',
    border: 'border-purple-300',
  },
};

export const CUSTOMER_STATUS_OPTIONS = [
  { value: '', labelKey: 'customers.filter.statusAll' },
  { value: AccountStatus.ACTIVE, labelKey: 'status.active' },
  { value: AccountStatus.SUSPENDED, labelKey: 'status.suspended' },
  { value: AccountStatus.BANNED, labelKey: 'status.banned' },
  {
    value: AccountStatus.PENDING_VERIFICATION,
    labelKey: 'status.pendingVerification',
  },
  { value: AccountStatus.INACTIVE, labelKey: 'status.inactive' },
];

export const MEMBERSHIP_TIER_OPTIONS = [
  { value: '', labelKey: 'customers.filter.tierAll' },
  { value: MembershipTier.REGULAR, labelKey: 'Regular' },
  { value: MembershipTier.SILVER, labelKey: 'Silver' },
  { value: MembershipTier.VIP_GOLD, labelKey: 'VIP Gold' },
  { value: MembershipTier.PLATINUM, labelKey: 'Platinum' },
];
