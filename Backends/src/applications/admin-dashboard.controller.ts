import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/require-permission.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { ApplicationsService } from './applications.service';

/**
 * Not part of the original architecture doc - added because the real
 * dashboard view needs aggregate counts and must not be forced to fetch the
 * entire unpaginated applications table client-side to compute them.
 */
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminDashboardController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get('summary')
  @RequirePermission('applications:read')
  summary(@CurrentUser() user: AuthenticatedUser) {
    return this.applicationsService.dashboardSummary(user);
  }
}
