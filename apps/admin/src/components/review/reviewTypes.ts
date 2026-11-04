import type { ApiReview } from '@repo/types';

export interface ReviewFilterState {
  search: string;
  status: 'ALL' | 'APPROVED' | 'HIDDEN';
  rating?: number | '';
}

export interface ReviewModalState {
  replyTarget: ApiReview | null;
  deleteTarget: ApiReview | null;
}
