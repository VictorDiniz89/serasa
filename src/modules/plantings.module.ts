import { Module } from '@nestjs/common';
import {
  FARM_REPOSITORY,
  FarmRepository,
} from '../application/ports/farm.repository';
import {
  PLANTING_REPOSITORY,
  PlantingRepository,
} from '../application/ports/planting.repository';
import { CreatePlantingUseCase } from '../application/use-cases-planting/create-planting.use-case';
import { DeletePlantingUseCase } from '../application/use-cases-planting/delete-planting.use-case';
import { PlantingPrismaRepository } from '../infrastructure/prisma/planting.prisma.repository';
import { PlantingsController } from '../presentation/http/plantings.controller';
import { FarmsModule } from './farms.module';

@Module({
  imports: [FarmsModule],
  controllers: [PlantingsController],
  providers: [
    { provide: PLANTING_REPOSITORY, useClass: PlantingPrismaRepository },
    {
      provide: CreatePlantingUseCase,
      useFactory: (farms: FarmRepository, plantings: PlantingRepository) =>
        new CreatePlantingUseCase(farms, plantings),
      inject: [FARM_REPOSITORY, PLANTING_REPOSITORY],
    },
    {
      provide: DeletePlantingUseCase,
      useFactory: (plantings: PlantingRepository) =>
        new DeletePlantingUseCase(plantings),
      inject: [PLANTING_REPOSITORY],
    },
  ],
  exports: [PLANTING_REPOSITORY],
})
export class PlantingsModule {}
