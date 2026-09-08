import { DomainError } from '../../domain/errors/domain-error';
import { FarmRepository } from '../ports/farm.repository';
import { PlantingRecord, PlantingRepository } from '../ports/planting.repository';

export class CreatePlantingUseCase {
  constructor(
    private readonly farms: FarmRepository,
    private readonly plantings: PlantingRepository,
  ) {}

  async execute(
    farmId: string,
    input: { harvestName: string; cropName: string },
  ): Promise<PlantingRecord> {
    const farm = await this.farms.findById(farmId);
    if (!farm) {
      throw DomainError.notFound('Fazenda não encontrada');
    }

    return this.plantings.create(
      farmId,
      input.harvestName.trim(),
      input.cropName.trim(),
    );
  }
}