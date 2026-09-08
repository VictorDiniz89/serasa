import { Module } from '@nestjs/common';
import { FARM_REPOSITORY, FarmRepository } from '../application/ports/farm.repository';
import { PRODUCER_REPOSITORY, ProducerRepository } from '../application/ports/producer.repository';
import { CreateFarmUseCase } from '../application/use-cases-farm/create-farm.use-case';
import { DeleteFarmUseCase } from '../application/use-cases-farm/delete-farm.use-case';
import { GetFarmUseCase } from '../application/use-cases-farm/get-farm.use-case';
import { UpdateFarmUseCase } from '../application/use-cases-farm/update-farm.use-case';
import { FarmPrismaRepository } from '../infrastructure/prisma/farm.prisma.repository';
import { FarmsController } from '../presentation/http/farms.controller';
import { ProducersModule } from './producers.module';

@Module({
  imports: [ProducersModule],
  controllers: [FarmsController],
  providers: [
    { provide: FARM_REPOSITORY, useClass: FarmPrismaRepository },
    {
      provide: CreateFarmUseCase,
      useFactory: (producers: ProducerRepository, farms: FarmRepository) =>
        new CreateFarmUseCase(producers, farms),
      inject: [PRODUCER_REPOSITORY, FARM_REPOSITORY],
    },
    {
      provide: GetFarmUseCase,
      useFactory: (farms: FarmRepository) => new GetFarmUseCase(farms),
      inject: [FARM_REPOSITORY],
    },
    {
      provide: UpdateFarmUseCase,
      useFactory: (farms: FarmRepository) => new UpdateFarmUseCase(farms),
      inject: [FARM_REPOSITORY],
    },
    {
      provide: DeleteFarmUseCase,
      useFactory: (farms: FarmRepository) => new DeleteFarmUseCase(farms),
      inject: [FARM_REPOSITORY],
    },
  ],
  exports: [FARM_REPOSITORY],
})
export class FarmsModule {}