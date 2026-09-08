import { ProducerRecord, ProducerRepository } from '../ports/producer.repository';

export class ListProducersUseCase {
  constructor(private readonly producers: ProducerRepository) {}

  execute(
    page = 1,
    limit = 20,
  ): Promise<{
    items: ProducerRecord[];
    total: number;
    page: number;
    limit: number;
  }> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));

    return this.producers
      .findMany((safePage - 1) * safeLimit, safeLimit)
      .then(({ items, total }) => ({
        items,
        total,
        page: safePage,
        limit: safeLimit,
      }));
  }
}