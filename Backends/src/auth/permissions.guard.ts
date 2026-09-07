import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from './require-permission.decorator';
import { roleHasPermission } from './role-permissions';
import { RequestWithUser } from './interfaces/jwt-payload.interface';

/**
 * Checks that req.user.role (attached by JwtAuthGuard, which must run first)
 * carries the permission required by @RequirePermission on the handler.
 *
 * MVP simplification, documented here on purpose: this is a flat
 * role -> permission check only. There is no per-record ownership or
 * management-hierarchy scoping in v0 - any staff user holding a permission
 * (e.g. "applications:approve") can act on ANY record of that type, not just
 * ones assigned to them or their reports. This is intentional for the MVP,
 * not an oversight; per-record scoping is a documented future enhancement.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<
      string | undefined
    >(PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user || !roleHasPermission(user.role, requiredPermission)) {
      throw new ForbiddenException(
        `Missing required permission: ${requiredPermission}`,
      );
    }

    return true;
  }
}
