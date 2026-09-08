import { Module } from '@nestjs/common';
import { PRODUCER_REPOSITORY, ProducerRepository } from '../application/ports/producer.repository';
import { CreateProducerUseCase } from '../application/use-cases-producer/create-producer.use-case';
import { DeleteProducerUseCase } from '../application/use-cases-producer/delete-producer.use-case';
import { GetProducerUseCase } from '../application/use-cases-producer/get-producer.use-case';
import { ListProducersUseCase } from '../application/use-cases-producer/list-producers.use-case';
import { UpdateProducerUseCase } from '../application/use-cases-producer/update-producer.use-case';
import { ProducerPrismaRepository } from '../infrastructure/prisma/producer.prisma.repository';
import { ProducersController } from '../presentation/http/producers.controller';

@Module({
  controllers: [ProducersController],
  providers: [
    { provide: PRODUCER_REPOSITORY, useClass: ProducerPrismaRepository },
    {
      provide: CreateProducerUseCase,
      useFactory: (repo: ProducerRepository) => new CreateProducerUseCase(repo),
      inject: [PRODUCER_REPOSITORY],
    },
    {
      provide: ListProducersUseCase,
      useFactory: (repo: ProducerRepository) => new ListProducersUseCase(repo),
      inject: [PRODUCER_REPOSITORY],
    },
    {
      provide: GetProducerUseCase,
      useFactory: (repo: ProducerRepository) => new GetProducerUseCase(repo),
      inject: [PRODUCER_REPOSITORY],
    },
    {
      provide: UpdateProducerUseCase,
      useFactory: (repo: ProducerRepository) => new UpdateProducerUseCase(repo),
      inject: [PRODUCER_REPOSITORY],
    },
    {
      provide: DeleteProducerUseCase,
      useFactory: (repo: ProducerRepository) => new DeleteProducerUseCase(repo),
      inject: [PRODUCER_REPOSITORY],
    },
  ],
  exports: [PRODUCER_REPOSITORY],
})
export class ProducersModule {}