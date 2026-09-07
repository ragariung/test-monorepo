import { StaffRole } from '@prisma/client';

/**
 * Static MVP permission model.
 *
 * This is a deliberate simplification: permissions are derived from a single
 * fixed role enum per user via this in-code map, not a database-backed
 * roles/permissions/user_roles schema. This mirrors how the frontend already
 * models roles (one fixed enum per user with a static capability matrix).
 */
export const ROLE_PERMISSIONS: Record<StaffRole, string[]> = {
  ADMIN: ['*'],
  UNDERWRITER_MANAGER: [
    'applications:read',
    'applications:review',
    'applications:approve',
    'applications:reject',
    'applications:assign',
    'applications:note',
    'products:read',
    'products:write',
    'products:publish',
    'simulation_rules:read',
    'simulation_rules:write',
    'users:manage',
    'organization:manage',
    'audit:read',
  ],
  SENIOR_UNDERWRITER: [
    'applications:read',
    'applications:review',
    'applications:approve',
    'applications:reject',
    'applications:assign',
    'applications:note',
    'audit:read',
  ],
  UNDERWRITER: ['applications:read', 'applications:review', 'applications:note', 'audit:read'],
  TELE_CONSULTANT: ['applications:read', 'applications:note'],
  // PRD.md §5's "Read-only / Auditor" role: view applications, products, and
  // audit history; no mutation permission of any kind, by design.
  AUDITOR: ['applications:read', 'products:read', 'simulation_rules:read', 'audit:read'],
};

export function roleHasPermission(role: StaffRole, permission: string): boolean {
  const granted = ROLE_PERMISSIONS[role] ?? [];
  return granted.includes('*') || granted.includes(permission);
}
