import { Module } from '@nestjs/common';
import {
  DASHBOARD_REPOSITORY,
  DashboardRepository,
} from '../application/ports/dashboard.repository';
import { GetDashboardUseCase } from '../application/use-cases-dashboard/get-dashboard.use-case';
import { DashboardPrismaRepository } from '../infrastructure/prisma/dashboard.prisma.repository';
import { DashboardController } from '../presentation/http/dashboard.controller';

@Module({
  controllers: [DashboardController],
  providers: [
    { provide: DASHBOARD_REPOSITORY, useClass: DashboardPrismaRepository },
    {
      provide: GetDashboardUseCase,
      useFactory: (dashboard: DashboardRepository) =>
        new GetDashboardUseCase(dashboard),
      inject: [DASHBOARD_REPOSITORY],
    },
  ],
})
export class DashboardModule {}
