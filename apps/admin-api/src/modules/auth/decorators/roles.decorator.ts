import { SetMetadata, type CustomDecorator } from '@nestjs/common';
import type { AdminRoleCode } from '@repo/types';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: (AdminRoleCode | string)[]): CustomDecorator =>
  SetMetadata(ROLES_KEY, roles);
