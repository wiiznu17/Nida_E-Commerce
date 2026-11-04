export const REVIEW_STATUS_OPTIONS = [
  { value: 'ALL', labelKey: 'reviews.filter.statusAll' },
  { value: 'APPROVED', labelKey: 'reviews.filter.statusApproved' },
  { value: 'HIDDEN', labelKey: 'reviews.filter.statusHidden' },
] as const;

export const REVIEW_RATING_OPTIONS = [
  { value: '', labelKey: 'reviews.filter.ratingAll' },
  { value: '5', labelKey: '5 Stars' },
  { value: '4', labelKey: '4 Stars' },
  { value: '3', labelKey: '3 Stars' },
  { value: '2', labelKey: '2 Stars' },
  { value: '1', labelKey: '1 Star' },
] as const;

