import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/require-permission.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { ApplicationsService } from './applications.service';
import { QueryApplicationsDto } from './dto/query-applications.dto';
import { RejectApplicationDto } from './dto/reject-application.dto';
import { AssignApplicationDto } from './dto/assign-application.dto';
import { AddNoteDto } from './dto/add-note.dto';

@Controller('admin/applications')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  @RequirePermission('applications:read')
  list(@Query() query: QueryApplicationsDto) {
    return this.applicationsService.listInbox(query);
  }

  @Get(':id')
  @RequirePermission('applications:read')
  detail(@Param('id') id: string) {
    return this.applicationsService.detail(id);
  }

  @Post(':id/start-review')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('applications:review')
  startReview(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.applicationsService.startReview(id, user);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('applications:approve')
  approve(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.applicationsService.approve(id, user);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('applications:reject')
  reject(
    @Param('id') id: string,
    @Body() dto: RejectApplicationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.applicationsService.reject(id, dto, user);
  }

  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('applications:assign')
  assign(
    @Param('id') id: string,
    @Body() dto: AssignApplicationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.applicationsService.assign(id, dto, user);
  }

  @Post(':id/notes')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission('applications:note')
  addNote(
    @Param('id') id: string,
    @Body() dto: AddNoteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.applicationsService.addNote(id, dto, user);
  }
}
