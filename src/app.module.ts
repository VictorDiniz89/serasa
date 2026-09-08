import { Module } from '@nestjs/common';
import { HealthController } from './presentation/http/health.controller';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { ProducersModule } from './modules/producers.module';
import { FarmsModule } from './modules/farms.module';
import { PlantingsModule } from './modules/plantings.module';
import { DashboardModule } from './modules/dashboard.module';

@Module({
  imports: [PrismaModule, ProducersModule, FarmsModule, PlantingsModule, DashboardModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
