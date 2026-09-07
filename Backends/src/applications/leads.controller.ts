import { Body, Controller, Post } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateLeadDto } from './dto/create-lead.dto';

/**
 * Public, unauthenticated - same trust tier as ApplicationsController
 * (POST /applications) and SimulatorController (POST /simulations). Used by
 * the PRAXIS Assistant n8n workflow (Automation/) to capture a prospect's
 * interest as a DRAFT application while chatting, without requiring a full
 * simulation run first.
 */
@Controller('leads')
export class LeadsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.applicationsService.createLead(dto);
  }
}
