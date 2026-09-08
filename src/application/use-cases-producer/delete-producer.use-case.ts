import { DomainError } from '../../domain/errors/domain-error';
import { ProducerRepository } from '../ports/producer.repository';

export class DeleteProducerUseCase {
  constructor(private readonly producers: ProducerRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.producers.findById(id);
    if (!existing) {
      throw DomainError.notFound('Produtor não encontrado');
    }

    const farms = await this.producers.countFarms(id);
    if (farms > 0) {
      throw DomainError.conflict('Não é possível excluir produtor com fazendas cadastradas');
    }

    await this.producers.delete(id);
  }
}