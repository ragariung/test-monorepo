import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/require-permission.decorator';
import { ROLE_PERMISSIONS } from '../auth/role-permissions';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermission('users:manage')
  list() {
    return this.usersService.listAll();
  }

  /**
   * Serves role-permissions.ts's actual in-code permission map, so
   * OrganizationView's capability matrix reads the real source of truth
   * instead of a hand-maintained frontend mirror that can silently drift
   * whenever a permission is added/changed here.
   */
  @Get('permissions')
  @RequirePermission('users:manage')
  permissions() {
    return ROLE_PERMISSIONS;
  }

  @Post()
  @RequirePermission('users:manage')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id/manager')
  @RequirePermission('organization:manage')
  updateManager(@Param('id') id: string, @Body() dto: UpdateManagerDto) {
    return this.usersService.updateManager(id, dto.managerId ?? null);
  }
}
