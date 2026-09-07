import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SimulatorModule } from '../simulator/simulator.module';
import { ApplicationsController } from './applications.controller';
import { AdminApplicationsController } from './admin-applications.controller';
import { AdminDashboardController } from './admin-dashboard.controller';
import { LeadsController } from './leads.controller';
import { ApplicationsService } from './applications.service';

@Module({
  imports: [AuthModule, SimulatorModule],
  controllers: [
    ApplicationsController,
    AdminApplicationsController,
    AdminDashboardController,
    LeadsController,
  ],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
