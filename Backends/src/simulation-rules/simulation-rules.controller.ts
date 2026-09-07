import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/require-permission.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { SimulationRulesService } from './simulation-rules.service';
import { CreateRuleVersionDto } from './dto/create-rule-version.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SimulationRulesController {
  constructor(private readonly simulationRulesService: SimulationRulesService) {}

  @Get('products/:id/simulation-rules')
  @RequirePermission('simulation_rules:read')
  listForProduct(@Param('id') productId: string) {
    return this.simulationRulesService.listForProduct(productId);
  }

  @Post('products/:id/simulation-rules')
  @RequirePermission('simulation_rules:write')
  createDraft(
    @Param('id') productId: string,
    @Body() dto: CreateRuleVersionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.simulationRulesService.createDraft(productId, dto, user);
  }

  @Patch('simulation-rules/:id/activate')
  @RequirePermission('simulation_rules:write')
  activate(@Param('id') id: string) {
    return this.simulationRulesService.activate(id);
  }
}
