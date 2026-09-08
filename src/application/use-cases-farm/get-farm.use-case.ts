import { DomainError } from '../../domain/errors/domain-error';
import { FarmDetail, FarmRepository } from '../ports/farm.repository';

export class GetFarmUseCase {
  constructor(private readonly farms: FarmRepository) {}

  async execute(id: string): Promise<FarmDetail> {
    const farm = await this.farms.findById(id);
    if (!farm) {
      throw DomainError.notFound('Fazenda não encontrada');
    }
    return farm;
  }
}