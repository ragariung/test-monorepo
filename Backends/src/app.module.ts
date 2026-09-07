import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { SimulationRulesModule } from './simulation-rules/simulation-rules.module';
import { SimulatorModule } from './simulator/simulator.module';
import { ApplicationsModule } from './applications/applications.module';
import { AuditModule } from './audit/audit.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    SimulationRulesModule,
    SimulatorModule,
    ApplicationsModule,
    AuditModule,
    HealthModule,
  ],
})
export class AppModule {}
