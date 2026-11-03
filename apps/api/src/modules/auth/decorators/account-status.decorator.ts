import { SetMetadata } from '@nestjs/common';
import type { AccountStatus } from '@repo/types';

export const REQUIRE_ACCOUNT_STATUS_KEY = 'require_account_status';
export const RequireAccountStatus = (...statuses: AccountStatus[]) =>
  SetMetadata(REQUIRE_ACCOUNT_STATUS_KEY, statuses);

export const ALLOW_PENDING_VERIFICATION_KEY = 'allow_pending_verification';
export const AllowPendingVerification = () =>
  SetMetadata(ALLOW_PENDING_VERIFICATION_KEY, true);
