// @repo/types — Account Status Error & Transition Types

export type AccountStatusErrorCode =
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_BANNED'
  | 'ACCOUNT_UNVERIFIED'
  | 'ACCOUNT_DEACTIVATED';

export interface AccountStatusErrorDetails {
  reason?: string;
  suspendedUntil?: string;
  retryAfterSeconds?: number;
  supportEmail?: string;
  verifyUrl?: string;
}

export interface AccountStatusErrorResponse {
  statusCode: number;
  errorCode: AccountStatusErrorCode;
  message: string;
  details?: AccountStatusErrorDetails;
}

