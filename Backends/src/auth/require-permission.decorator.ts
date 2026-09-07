import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'requiredPermission';

/**
 * Marks a route handler as requiring a specific permission string from the
 * static ROLE_PERMISSIONS map. Enforced by PermissionsGuard.
 */
export const RequirePermission = (permission: string) =>
  SetMetadata(PERMISSION_KEY, permission);
