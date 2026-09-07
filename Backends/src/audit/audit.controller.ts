import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/require-permission.decorator';
import { AuditService } from './audit.service';
import { QueryAuditDto } from './dto/query-audit.dto';

@Controller('admin/audit')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermission('audit:read')
  list(@Query() query: QueryAuditDto) {
    return this.auditService.list(query);
  }
}
