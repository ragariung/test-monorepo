import { User } from '@prisma/client';

/**
 * Strips the password hash (and any other internal fields) before a User
 * record ever leaves the service layer.
 */
export function toPublicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    department: user.department,
    managerId: user.managerId,
    isActive: user.isActive,
  };
}

export type PublicUser = ReturnType<typeof toPublicUser>;
