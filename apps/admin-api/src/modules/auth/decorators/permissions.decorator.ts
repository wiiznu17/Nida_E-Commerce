import { SetMetadata, type CustomDecorator } from '@nestjs/common';
import type { AdminPermission } from '@repo/types';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: (AdminPermission | string)[]): CustomDecorator =>
  SetMetadata(PERMISSIONS_KEY, permissions);
