import { Request } from 'express';
import { StaffRole } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  role: StaffRole;
}

export interface AuthenticatedUser {
  id: string;
  role: StaffRole;
}

export interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}
