import { DomainError } from '../../domain/errors/domain-error';
import { FarmRepository } from '../ports/farm.repository';

export class DeleteFarmUseCase {
  constructor(private readonly farms: FarmRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.farms.findById(id);
    if (!existing) {
      throw DomainError.notFound('Fazenda não encontrada');
    }
    await this.farms.delete(id);
  }
}
