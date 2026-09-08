import { DomainError } from '../../domain/errors/domain-error';
import { PlantingRepository } from '../ports/planting.repository';

export class DeletePlantingUseCase {
  constructor(private readonly plantings: PlantingRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.plantings.findById(id);
    if (!existing) {
      throw DomainError.notFound('Plantio não encontrado');
    }
    await this.plantings.delete(id);
  }
}