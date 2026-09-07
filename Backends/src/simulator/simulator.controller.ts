import { Body, Controller, Post } from '@nestjs/common';
import { SimulatorService } from './simulator.service';
import { CreateSimulationDto } from './dto/create-simulation.dto';

@Controller('simulations')
export class SimulatorController {
  constructor(private readonly simulatorService: SimulatorService) {}

  @Post()
  create(@Body() dto: CreateSimulationDto) {
    return this.simulatorService.runSimulation(dto);
  }
}
