import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SimulationRulesController } from './simulation-rules.controller';
import { SimulationRulesService } from './simulation-rules.service';

@Module({
  imports: [AuthModule],
  controllers: [SimulationRulesController],
  providers: [SimulationRulesService],
})
export class SimulationRulesModule {}
