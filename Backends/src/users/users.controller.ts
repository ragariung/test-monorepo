import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/require-permission.decorator';
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
