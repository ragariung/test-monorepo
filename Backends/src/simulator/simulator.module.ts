import { Module } from '@nestjs/common';
import { SimulatorController } from './simulator.controller';
import { SimulatorService } from './simulator.service';
import { SimulationEngine } from './simulation.engine';

@Module({
  controllers: [SimulatorController],
  providers: [SimulatorService, SimulationEngine],
  exports: [SimulationEngine],
})
export class SimulatorModule {}
